import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { PRINCIPLES } from '@/data/principles';
import type { AiAnalysis } from '@/types';
import styles from './PrincipleScoreList.module.css';

type PrincipleScoreListProps = {
  ai: AiAnalysis | null;
  comments: Record<string, string>;
  onCommentChange: (principleId: string, value: string) => void;
  /** 멘토 로그인 화면에서만 준다 — 있으면 원칙별 0–10 객관식 점수 입력을 함께 렌더한다
   * (Plans/14 §7.4 요구 3-3). ADMIN 대행 경로는 주지 않아 기존처럼 코멘트만 남긴다. */
  scores?: Record<string, number>;
  onScoreChange?: (principleId: string, value: number) => void;
};

/** 원칙별 코멘트(+선택적 객관식 점수) — ADMIN과 멘토 로그인 화면이 공유한다
 * (Plans/10-admin.md §3.1, Plans/14 §7.2). */
export function PrincipleScoreList({ ai, comments, onCommentChange, scores, onScoreChange }: PrincipleScoreListProps) {
  const showScore = scores !== undefined && onScoreChange !== undefined;

  return (
    <Card>
      <p className={styles.sectionLabel}>② 원칙별 {showScore ? '점수 · 코멘트' : '코멘트 (선택)'}</p>
      <div className={styles.principleList}>
        {PRINCIPLES.map((principle) => {
          const aiScore = ai?.principles.find((p) => p.id === principle.id)?.score;
          return (
            <div key={principle.id} className={styles.principleRow}>
              <div className={styles.principleLabel}>
                <span className={styles.principleNum}>{String(principle.order).padStart(2, '0')}</span>
                <span>{principle.nameKr}</span>
                {aiScore !== undefined && <span className="meta">AI {aiScore}</span>}
              </div>
              {showScore && (
                <div className={styles.scoreRow}>
                  <input
                    type="range"
                    min={0}
                    max={10}
                    value={scores![principle.id] ?? aiScore ?? 5}
                    aria-label={`${principle.nameKr} 멘토 점수`}
                    onChange={(event) => onScoreChange!(principle.id, Number(event.target.value))}
                    className={styles.slider}
                  />
                  <span className={styles.scoreValue}>{scores![principle.id] ?? aiScore ?? 5}</span>
                </div>
              )}
              <Input
                value={comments[principle.id] ?? ''}
                onChange={(event) => onCommentChange(principle.id, event.target.value)}
                placeholder="코멘트 (선택)"
              />
            </div>
          );
        })}
      </div>
    </Card>
  );
}
