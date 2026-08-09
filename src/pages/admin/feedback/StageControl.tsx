import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import type { SubmissionStatus } from '@/features/admin/status';
import type { MentorStage } from '@/types';
import styles from '../AdminFeedbackPage.module.css';

type StageControlProps = {
  status: SubmissionStatus;
  reviewStages: MentorStage[];
  canAdvance: boolean;
  onAdvance: () => void;
  onCompleteAll: () => void;
};

/** ① 검증 단계 수동 제어 — 시뮬레이터 타이머를 기다리지 않고 관리자가 단계를 넘긴다 (10 §3.3). */
export function StageControl({ status, reviewStages, canAdvance, onAdvance, onCompleteAll }: StageControlProps) {
  return (
    <Card>
      <p className={styles.sectionLabel}>① 검증 단계 제어</p>
      <p className={styles.stageStatus}>현재 {status.kind === 'completed' ? '검증 완료' : status.label}</p>
      <div className={styles.stageActions}>
        <Button variant="ghost" onClick={onAdvance} disabled={!canAdvance}>
          다음 단계로
        </Button>
        <Button variant="ghost" onClick={onCompleteAll} disabled={!canAdvance}>
          즉시 완료 처리
        </Button>
      </div>
      <ol className={styles.stageList}>
        {reviewStages.map((s) => (
          <li key={s.id} data-status={s.status}>
            {s.label}
          </li>
        ))}
      </ol>
    </Card>
  );
}
