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
};

/** analyzing 상태 로딩 화면 — 6단계 체크리스트 + 스캔선 + 경과 시간 (05 §3.3). */
export function AnalyzingScreen({ previewDataUrl, stageIndex }: AnalyzingScreenProps) {
  const [elapsedMs, setElapsedMs] = useState(0);
  const startRef = useRef<number>(0);

  useEffect(() => {
    startRef.current = performance.now();
    const id = window.setInterval(() => {
      setElapsedMs(performance.now() - startRef.current);
    }, 100);
    return () => window.clearInterval(id);
  }, []);

  const progressValue = stageIndex + 1;

  return (
    <div className={styles.layout} role="status" aria-live="polite">
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
              <li key={label} className={styles.stage} data-status={status}>
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
