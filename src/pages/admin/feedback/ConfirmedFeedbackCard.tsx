import { Card } from '@/components/Card';
import type { MentorFeedback } from '@/types';
import styles from '../AdminFeedbackPage.module.css';

/** 확정 제출된 피드백 — 수정 불가, 읽기 전용으로만 보여준다 (10 §3.2). */
export function ConfirmedFeedbackCard({ feedback }: { feedback: MentorFeedback }) {
  return (
    <Card>
      <p className={styles.sectionLabel}>확정된 피드백</p>
      <p className="meta">이미 확정 제출되어 수정할 수 없습니다.</p>
      <p className={styles.reviewText}>{feedback.overall}</p>
      <p className="meta">
        {feedback.mentorName} · {feedback.mentorRole} · 멘토 점수 {feedback.mentorScore}
      </p>
    </Card>
  );
}
