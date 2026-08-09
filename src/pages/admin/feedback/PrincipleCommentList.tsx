import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { PRINCIPLES } from '@/data/principles';
import type { AiAnalysis } from '@/types';
import styles from '../AdminFeedbackPage.module.css';

type PrincipleCommentListProps = {
  ai: AiAnalysis | null;
  comments: Record<string, string>;
  onChange: (principleId: string, value: string) => void;
};

/** ② 원칙별 코멘트(선택) — 각 원칙 AI 점수 옆에 입력창을 둔다 (10 §3.1). */
export function PrincipleCommentList({ ai, comments, onChange }: PrincipleCommentListProps) {
  return (
    <Card>
      <p className={styles.sectionLabel}>② 원칙별 코멘트 (선택)</p>
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
              <Input
                value={comments[principle.id] ?? ''}
                onChange={(event) => onChange(principle.id, event.target.value)}
                placeholder="코멘트 (선택)"
              />
            </div>
          );
        })}
      </div>
    </Card>
  );
}
