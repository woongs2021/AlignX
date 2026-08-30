import { useEffect, useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from '@/components/Modal';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { ToggleGroup } from '@/components/ToggleGroup';
import { ProgressBar } from '@/components/ProgressBar';
import { useAppStore } from '@/store/useAppStore';
import { validateFile, VALIDATION_MESSAGES, type AcceptedMimeType } from '@/lib/file';
import { generatePreview } from '@/lib/preview';
import { formatElapsed } from '@/lib/format';
import { provider } from '@/features/analysis';
import { PRINCIPLES } from '@/data/principles';
import { ROLE_OPTIONS, type Role } from './roles';
import styles from './AnalysisStartModal.module.css';

type Step = 'role' | 'upload' | 'confirm' | 'loading';
type FileStatus = 'idle' | 'uploading' | 'ready';

/** 확인 단계 타이틀 — '기타'는 특정 직군명을 붙이지 않는다. */
const CONFIRM_TITLES: Record<Role, string> = {
  planning: '기획 · PM 포트폴리오 분석을 시작합니다',
  marketing: '마케팅 포트폴리오 분석을 시작합니다',
  design: '디자인 포트폴리오 분석을 시작합니다',
  dev: '개발 · 코드리뷰 포트폴리오 분석을 시작합니다',
  other: '포트폴리오 분석을 시작합니다',
};

// 파일 검증 자체는 순식간이라, "업로드 중" 상태를 실제로 눈에 띄게 하려고 최소 노출 시간을 둔다.
const MIN_UPLOAD_MS = 900;

// 실제 더미 엔진은 ~9초 만에 끝나지만, 전체화면 로딩 연출은 30초로 늘려 보여준다.
// 10대 원칙을 하나씩 "클리어"하는 연출이라 원칙 개수로 균등 분배한다.
// 실제 분석은 이 연출과 별개로 백그라운드에서 먼저 끝나고, 화면은 이 타이머가 다 찰 때까지 기다린다.
const FAKE_TOTAL_MS = 30_000;
const MS_PER_PRINCIPLE = FAKE_TOTAL_MS / PRINCIPLES.length;

// 로딩 화면 상단 라인+바 콤보 차트용 가상 점수 — 원칙마다 고정된 값이라 다시 렌더링돼도 흔들리지 않는다.
const CHART_SCORES = PRINCIPLES.map((_, i) => 7 + ((i * 3) % 4));
const CHART_W = 400;
const CHART_H = 96;
const CHART_PAD = 12;

type AnalysisLoadingChartProps = {
  clearedCount: number;
};

/** 원칙이 하나씩 클리어될 때마다 막대가 올라오고, 클리어된 지점끼리 선으로 이어지는 콤보 차트. */
function AnalysisLoadingChart({ clearedCount }: AnalysisLoadingChartProps) {
  const step = (CHART_W - CHART_PAD * 2) / PRINCIPLES.length;
  const points = PRINCIPLES.map((principle, i) => {
    const cleared = i < clearedCount;
    const score = cleared ? CHART_SCORES[i] : 0;
    const x = CHART_PAD + step * i + step / 2;
    const y = CHART_H - CHART_PAD - (score / 10) * (CHART_H - CHART_PAD * 2);
    return { id: principle.id, x, y, cleared };
  });
  const clearedPoints = points.filter((p) => p.cleared);
  const linePath = clearedPoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');

  return (
    <svg className={styles.chart} viewBox={`0 0 ${CHART_W} ${CHART_H}`} role="img" aria-label="분석 점수 추이">
      {points.map((p) => (
        <rect
          key={p.id}
          className={styles.chartBar}
          data-cleared={p.cleared}
          x={p.x - step * 0.28}
          y={p.y}
          width={step * 0.56}
          height={Math.max(0, CHART_H - CHART_PAD - p.y)}
          rx={2}
        />
      ))}
      {linePath && <path className={styles.chartLine} d={linePath} fill="none" />}
      {clearedPoints.map((p) => (
        <circle key={p.id} className={styles.chartDot} cx={p.x} cy={p.y} r={3} />
      ))}
    </svg>
  );
}

type AnalysisStartModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

/** PORTFOLIO 인트로의 "분석 시작하기" 팝업 — 직군 선택 → 파일 업로드 → 확인 → (가짜)전체화면 로딩.
 * 실제 채점은 Step1Page와 동일한 파이프라인(validateFile→generatePreview→createAttempt→
 * provider.analyze)을 그대로 태워 점수 일관성을 유지한다. */
export function AnalysisStartModal({ isOpen, onClose }: AnalysisStartModalProps) {
  const navigate = useNavigate();
  const createAttempt = useAppStore((s) => s.createAttempt);
  const setAiAnalysis = useAppStore((s) => s.setAiAnalysis);

  const [step, setStep] = useState<Step>('role');
  const [role, setRole] = useState<Role>('planning');
  const [link, setLink] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [fileMime, setFileMime] = useState<AcceptedMimeType | null>(null);
  const [fileStatus, setFileStatus] = useState<FileStatus>('idle');
  const [fileError, setFileError] = useState('');
  const [isDragActive, setIsDragActive] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const dragCounter = useRef(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleClose() {
    setStep('role');
    setRole('planning');
    setLink('');
    setFile(null);
    setFileMime(null);
    setFileStatus('idle');
    setFileError('');
    setElapsedMs(0);
    onClose();
  }

  async function pickFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    if (fileList.length > 1) {
      setFileError(VALIDATION_MESSAGES.multipleFiles);
      return;
    }
    const picked = fileList[0];
    setFileError('');
    setFileStatus('uploading');

    const startedAt = performance.now();
    const validation = await validateFile(picked);
    const remaining = MIN_UPLOAD_MS - (performance.now() - startedAt);
    if (remaining > 0) await new Promise((resolve) => window.setTimeout(resolve, remaining));

    if (!validation.ok) {
      setFile(null);
      setFileMime(null);
      setFileStatus('idle');
      setFileError(validation.message);
      return;
    }
    setFile(picked);
    setFileMime(validation.mime);
    setFileStatus('ready');
  }

  function removeFile() {
    setFile(null);
    setFileMime(null);
    setFileStatus('idle');
    setFileError('');
  }

  function handleDragEnter(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    dragCounter.current += 1;
    setIsDragActive(true);
  }

  function handleDragLeave(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    dragCounter.current = Math.max(0, dragCounter.current - 1);
    if (dragCounter.current === 0) setIsDragActive(false);
  }

  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    dragCounter.current = 0;
    setIsDragActive(false);
    pickFiles(event.dataTransfer.files);
  }

  function handleFileInputChange(event: ChangeEvent<HTMLInputElement>) {
    pickFiles(event.target.files);
    event.target.value = '';
  }

  // 로딩 단계: 실제 파이프라인은 백그라운드로 돌리고(진짜 점수 확보), 화면은 별도 60초
  // 타이머로만 진행률을 보여준다. 화면 연출과 실제 분석 중 더 늦게 끝나는 쪽을 기다린 뒤 이동한다.
  useEffect(() => {
    if (step !== 'loading' || !file || !fileMime) return;
    let cancelled = false;
    const startedAt = performance.now();

    const tick = window.setInterval(() => {
      if (cancelled) return;
      setElapsedMs(Math.min(FAKE_TOTAL_MS, performance.now() - startedAt));
    }, 100);

    (async () => {
      const preview = await generatePreview(file, fileMime);
      if (cancelled) return;
      if (!preview.ok && preview.reason === 'corrupted') {
        window.clearInterval(tick);
        setFileError(VALIDATION_MESSAGES.corrupted);
        setStep('upload');
        return;
      }
      const previewDataUrl = preview.ok ? preview.previewDataUrl : '';
      const id = createAttempt({ name: file.name, mime: fileMime, size: file.size, previewDataUrl });
      const result = await provider.analyze(file, () => {});
      if (cancelled) return;
      setAiAnalysis(id, result);

      const remaining = FAKE_TOTAL_MS - (performance.now() - startedAt);
      window.setTimeout(() => {
        if (cancelled) return;
        onClose();
        navigate('/portfolio/analyze');
      }, Math.max(0, remaining));
    })();

    return () => {
      cancelled = true;
      window.clearInterval(tick);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  if (step === 'loading') {
    const clearedCount = Math.min(PRINCIPLES.length, Math.floor(elapsedMs / MS_PER_PRINCIPLE));
    const percent = Math.min(100, Math.round((elapsedMs / FAKE_TOTAL_MS) * 100));
    return (
      <div className={styles.fullscreen} role="status" aria-live="polite">
        <button type="button" className={styles.fullscreenClose} onClick={handleClose} aria-label="닫기">
          ×
        </button>
        <span className={`label ${styles.fullscreenEyebrow}`}>ALIGNX AI</span>
        <h2 className={styles.fullscreenTitle}>포트폴리오를 분석하고 있습니다</h2>
        <p className={styles.fullscreenDesc}>10대 원칙을 하나씩 채점하는 중입니다.</p>

        <AnalysisLoadingChart clearedCount={clearedCount} />

        <div className={styles.principleGrid}>
          {PRINCIPLES.map((principle, i) => (
            <div key={principle.id} className={styles.principleChip} data-cleared={i < clearedCount}>
              <span className={styles.principleMark} aria-hidden="true">
                {i < clearedCount ? '✓' : String(principle.order).padStart(2, '0')}
              </span>
              <span className={styles.principleName}>{principle.nameKr}</span>
            </div>
          ))}
        </div>

        <div className={styles.fullscreenFooter}>
          <ProgressBar value={elapsedMs} max={FAKE_TOTAL_MS} />
          <div className={styles.fullscreenMeta}>
            <span className={styles.fullscreenElapsed}>{formatElapsed(elapsedMs)}</span>
            <span className={styles.fullscreenPercent}>{percent}%</span>
          </div>
        </div>
      </div>
    );
  }

  const titles: Record<Exclude<Step, 'loading'>, string> = {
    role: '어떤 직무의 결과물인가요?',
    upload: '포트폴리오를 올려주세요',
    confirm: CONFIRM_TITLES[role],
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={titles[step]}>
      <div className={styles.modalContent}>
        <button type="button" className={styles.modalClose} onClick={handleClose} aria-label="닫기">
          ×
        </button>

        {step === 'role' && (
          <>
            <p className={styles.modalDesc}>
              직무에 맞춰 최적화된 AI 채점 기준과, 그 분야의 전문 멘토를 배정합니다.
            </p>
            <ToggleGroup ariaLabel="직군 선택" options={ROLE_OPTIONS} value={role} onChange={setRole} />
            <Button variant="primary" className={styles.modalSubmit} onClick={() => setStep('upload')}>
              다음
            </Button>
          </>
        )}

        {step === 'upload' && (
          <>
            <p className={styles.modalDesc}>포트폴리오 파일을 올려주세요.</p>
            <div
              className={[styles.dropzone, isDragActive && styles.dropzoneActive].filter(Boolean).join(' ')}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              {fileStatus === 'uploading' && (
                <div className={styles.uploadingRow}>
                  <span className={styles.spinner} aria-hidden="true" />
                  <span className={styles.dropzoneText}>업로드 중…</span>
                </div>
              )}

              {fileStatus === 'ready' && file && (
                <div className={styles.filePicked}>
                  <div className={styles.fileInfo}>
                    <span className={styles.fileName}>{file.name}</span>
                    <span className={styles.waitBadge}>분석대기</span>
                  </div>
                  <button
                    type="button"
                    className={styles.fileRemove}
                    onClick={removeFile}
                    aria-label="파일 제거"
                  >
                    ×
                  </button>
                </div>
              )}

              {fileStatus === 'idle' && (
                <>
                  <p className={styles.dropzoneText}>파일을 여기로 끌어다 놓거나</p>
                  <button
                    type="button"
                    className={styles.addButton}
                    onClick={() => fileInputRef.current?.click()}
                    aria-label="파일 선택"
                  >
                    +
                  </button>
                </>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.gif"
                className={styles.hiddenInput}
                onChange={handleFileInputChange}
              />
            </div>
            {fileError && (
              <p className={styles.errorText} role="alert">
                {fileError}
              </p>
            )}
            <p className={styles.meta}>PDF · PNG · JPEG · GIF · 최대 50MB · 1개 파일</p>

            <label className={styles.modalFieldLabel} htmlFor="portfolio-link">
              웹사이트 또는 GitHub 링크 (선택)
            </label>
            <Input
              id="portfolio-link"
              type="url"
              placeholder="https://..."
              value={link}
              onChange={(event) => setLink(event.target.value)}
            />

            <Button
              variant="primary"
              className={styles.modalSubmit}
              onClick={() => setStep('confirm')}
              disabled={fileStatus !== 'ready'}
            >
              분석하기
            </Button>
          </>
        )}

        {step === 'confirm' && (
          <>
            <p className={styles.modalDesc}>
              AlignX AI 1차 분석이 시작됩니다. 포트폴리오의 종류에 따라 1분에서 최대 5분까지 걸릴 수
              있습니다.
            </p>
            <Button variant="primary" className={styles.modalSubmit} onClick={() => setStep('loading')}>
              확인했습니다
            </Button>
          </>
        )}
      </div>
    </Modal>
  );
}
