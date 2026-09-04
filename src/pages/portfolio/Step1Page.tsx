import { useCallback, useEffect, useState } from 'react';
import { usePageMeta } from '@/layout/usePageMeta';
import { useAppStore } from '@/store/useAppStore';
import { validateFile, VALIDATION_MESSAGES } from '@/lib/file';
import { generatePreview } from '@/lib/preview';
import { provider } from '@/features/analysis';
import { Button } from '@/components/Button';
import { UploadZone } from './step1/UploadZone';
import { AnalyzingScreen } from './step1/AnalyzingScreen';
import { ResultScreen } from './step1/ResultScreen';
import styles from './Step1Page.module.css';

type Phase = 'idle' | 'validating' | 'analyzing' | 'result' | 'error';

/** 1단계 — idle → validating → analyzing → result 상태 머신 (Plans/05-portfolio-step1.md §3). */
export function Step1Page() {
  usePageMeta({ title: '1단계 · AI 분석 — AlignX', width: 'full' });

  const activeAttempt = useAppStore((s) => s.attempts[0] ?? null);
  const createAttempt = useAppStore((s) => s.createAttempt);
  const setAiAnalysis = useAppStore((s) => s.setAiAnalysis);

  const [phase, setPhase] = useState<Phase>(() => (activeAttempt?.ai ? 'result' : 'idle'));
  const [errorMessage, setErrorMessage] = useState('');
  const [stageIndex, setStageIndex] = useState(0);

  // 분석 중 뒤로가기 시 확인 — 데이터 라우터가 아니라 useBlocker는 쓸 수 없어 popstate로 처리한다
  // (05 §3.3 "이탈 방지". beforeunload는 과하다는 지침에 따라 걸지 않는다).
  useEffect(() => {
    if (phase !== 'analyzing') return;
    window.history.pushState(null, '', window.location.href);
    function handlePopState() {
      const leave = window.confirm('분석을 중단할까요? 지금까지의 분석 내용이 사라집니다.');
      if (!leave) {
        window.history.pushState(null, '', window.location.href);
      }
    }
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [phase]);

  const handleFileSelected = useCallback(
    async (file: File) => {
      setPhase('validating');
      setErrorMessage('');

      const validation = await validateFile(file);
      if (!validation.ok) {
        setErrorMessage(validation.message);
        setPhase('error');
        return;
      }

      const preview = await generatePreview(file, validation.mime);
      if (!preview.ok && preview.reason === 'corrupted') {
        setErrorMessage(VALIDATION_MESSAGES.corrupted);
        setPhase('error');
        return;
      }
      const previewDataUrl = preview.ok ? preview.previewDataUrl : '';
      const pages = preview.ok ? preview.pages : [];
      const pageCount = preview.ok ? preview.pageCount : 0;

      const id = createAttempt({
        name: file.name,
        mime: validation.mime,
        size: file.size,
        previewDataUrl,
        pages,
        pageCount,
      });

      setPhase('analyzing');
      setStageIndex(0);
      const result = await provider.analyze(file, setStageIndex);
      setAiAnalysis(id, result);
      setPhase('result');
    },
    [createAttempt, setAiAnalysis],
  );

  function handleMultipleRejected() {
    setErrorMessage(VALIDATION_MESSAGES.multipleFiles);
    setPhase('error');
  }

  return (
    <div className={`container-narrow ${styles.page}`}>
      {phase === 'idle' && (
        <UploadZone onFileSelected={handleFileSelected} onMultipleRejected={handleMultipleRejected} />
      )}

      {phase === 'validating' && (
        <p className={styles.validating} role="status">
          파일을 확인하는 중입니다…
        </p>
      )}

      {phase === 'error' && (
        <div className={styles.errorBox}>
          <p className={styles.errorMessage} role="alert">
            {errorMessage}
          </p>
          <Button variant="secondary" onClick={() => setPhase('idle')}>
            다시 시도
          </Button>
        </div>
      )}

      {phase === 'analyzing' && activeAttempt && (
        <AnalyzingScreen previewDataUrl={activeAttempt.file.previewDataUrl} stageIndex={stageIndex} />
      )}

      {phase === 'result' && activeAttempt?.ai && (
        <ResultScreen ai={activeAttempt.ai} previewDataUrl={activeAttempt.file.previewDataUrl} />
      )}
    </div>
  );
}
