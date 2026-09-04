import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { animate, motion } from 'motion/react';
import { Button } from '@/components/Button';
import { PRINCIPLES } from '@/data/principles';
import { MODEL_LIMITATION_NOTICE_SHORT } from '@/data/copy';
import type { AiAnalysis } from '@/types';
import styles from './ResultScreen.module.css';

function toneOf(score: number): 'primary' | 'soft' | 'mute' {
  if (score >= 8) return 'primary';
  if (score >= 5) return 'soft';
  return 'mute';
}

type ScoreCountUpProps = {
  value: number;
};

/** 총점 카운트업(1.2s)만 담당하는 리프 컴포넌트 — onUpdate가 초당 수십 회 setState를 호출하므로,
 * ResultScreen 안에 두면 그 리렌더가 원칙별 바 차트(동시에 stagger 진입 애니메이션 중)까지
 * 매 프레임 다시 그리게 만들어 화면이 버벅인다(흔들림 버그). 리렌더 범위를 이 컴포넌트로 가둔다. */
function ScoreCountUp({ value }: ScoreCountUpProps) {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    const controls = animate(0, value, {
      duration: 1.2,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplayScore(Math.round(v)),
    });
    return () => controls.stop();
  }, [value]);

  return <>{displayScore}</>;
}

type ResultScreenProps = {
  ai: AiAnalysis;
  previewDataUrl: string;
};

/** result 상태 점수 화면 — 총점 카운트업(1.2s) + 원칙별 바 차트(60ms stagger) (05 §3.4). */
export function ResultScreen({ ai, previewDataUrl }: ResultScreenProps) {
  const navigate = useNavigate();

  return (
    <div>
      <div className={styles.top}>
        <div className={styles.scoreBlock}>
          <span className="label">TOTAL SCORE</span>
          <span className={`impact ${styles.score}`}>
            <ScoreCountUp value={ai.totalScore} />
            <span className={styles.scoreMax}> / 100</span>
          </span>
          <span className={styles.grade}>Grade {ai.grade}</span>
          {previewDataUrl && <img src={previewDataUrl} alt="분석한 포트폴리오 프리뷰" className={styles.previewThumb} />}
        </div>

        <div className={styles.bars}>
          {ai.principles.map((score, i) => {
            const principle = PRINCIPLES.find((p) => p.id === score.id);
            const tone = toneOf(score.score);
            return (
              <details key={score.id} className={styles.barRow}>
                <summary className={styles.barSummary}>
                  <span className={styles.barNumber}>{String(principle?.order ?? i + 1).padStart(2, '0')}</span>
                  <span className={styles.barLabel}>{principle?.nameKr ?? score.id}</span>
                  <div className={styles.barTrack}>
                    <motion.div
                      className={styles.barFill}
                      data-tone={tone}
                      style={{ width: `${(score.score / 10) * 100}%`, transformOrigin: 'left' }}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ delay: i * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </div>
                  <span className={styles.barScore}>{score.score}</span>
                </summary>
                <p className={styles.barComment}>{score.comment}</p>
              </details>
            );
          })}
        </div>
      </div>

      <div className={styles.lists}>
        <div>
          <p className={styles.listTitle}>Strengths ({ai.strengths.length})</p>
          <ul className={styles.list}>
            {ai.strengths.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className={styles.listTitle}>Improvements ({ai.improvements.length})</p>
          <ul className={styles.list}>
            {ai.improvements.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className={styles.actions}>
        <Button variant="primary" onClick={() => navigate('/portfolio/mentor')}>
          2단계 · 멘토 검증 받기 →
        </Button>
        <Button variant="ghost" onClick={() => navigate('/portfolio', { state: { openAnalysisModal: true } })}>
          다시 분석하기
        </Button>
      </div>

      <p className={styles.limitNote}>{MODEL_LIMITATION_NOTICE_SHORT}</p>
    </div>
  );
}
