import { useEffect, useRef, useState } from 'react';
import { ProgressBar } from '@/components/ProgressBar';
import { STAGE_COPY, STAGE_LABELS } from '@/features/analysis';
import { formatElapsed } from '@/lib/format';
import styles from './AnalyzingScreen.module.css';

type StageStatus = 'done' | 'active' | 'pending';

function statusOf(index: number, stageIndex: number): StageStatus {
  if (index < stageIndex) return 'done';
  if (index === stageIndex) return 'active';
  return 'pending';
}

type AnalyzingScreenProps = {
  previewDataUrl: string;
  stageIndex: number;
  /** 좁은 컨테이너(예: 팝업)에 넣을 때 — 뷰포트 기준 2단 레이아웃 대신 항상 1단으로 쌓는다. */
  compact?: boolean;
};

/** analyzing 상태 로딩 화면 — 6단계 체크리스트 + 스캔선 + 경과 시간 (05 §3.3). */
export function AnalyzingScreen({ previewDataUrl, stageIndex, compact = false }: AnalyzingScreenProps) {
  const [elapsedMs, setElapsedMs] = useState(0);
  const startRef = useRef<number>(0);
  const activeStageRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    startRef.current = performance.now();
    const id = window.setInterval(() => {
      setElapsedMs(performance.now() - startRef.current);
    }, 100);
    return () => window.clearInterval(id);
  }, []);

  // compact(팝업)에서는 스크롤바를 숨기는 대신, 진행 단계가 바뀔 때마다 자동으로
  // 그 단계가 보이는 위치까지 스크롤한다 — 사용자가 직접 스크롤할 필요가 없다.
  useEffect(() => {
    if (!compact) return;
    activeStageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [stageIndex, compact]);

  const progressValue = stageIndex + 1;

  return (
    <div className={styles.layout} data-compact={compact} role="status" aria-live="polite">
      <div className={styles.previewWrap}>
        {previewDataUrl ? (
          <img src={previewDataUrl} alt="" className={styles.previewImg} />
        ) : (
          <div className={styles.previewFallback}>미리보기 없음</div>
        )}
        <div className={styles.scanLine} aria-hidden="true" />
      </div>

      <div>
        <ol className={styles.checklist}>
          {STAGE_LABELS.map((label, i) => {
            const status = statusOf(i, stageIndex);
            return (
              <li
                key={label}
                className={styles.stage}
                data-status={status}
                ref={status === 'active' ? activeStageRef : undefined}
              >
                <span className={styles.stageMark} aria-hidden="true">
                  {status === 'done' && '✓'}
                  {status === 'active' && (
                    <span className={styles.pulseDots}>
                      <span />
                      <span />
                      <span />
                    </span>
                  )}
                  {status === 'pending' && i + 1}
                </span>
                <span className={styles.stageLabel}>{label}</span>
              </li>
            );
          })}
        </ol>

        <div className={styles.footer}>
          <p className={styles.copy}>{STAGE_COPY[stageIndex]}</p>
          <ProgressBar value={progressValue} max={STAGE_LABELS.length} />
          <div className={styles.footerRow}>
            <span className={styles.elapsed}>{formatElapsed(elapsedMs)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
