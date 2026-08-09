import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Textarea } from '@/components/Textarea';
import { MENTORS } from '@/data/mentors';
import styles from '../AdminFeedbackPage.module.css';

type FeedbackComposerProps = {
  overall: string;
  mentorScore: number;
  mentorId: string;
  error: string;
  savedNote: string;
  onOverallChange: (value: string) => void;
  onScoreChange: (value: number) => void;
  onMentorChange: (mentorId: string) => void;
  onSaveDraft: () => void;
  onSubmit: () => void;
};

/** ③ 종합 코멘트(필수) · ④ 멘토 점수 · ⑤ 멘토 프로필 선택 + 저장/제출 액션 (10 §3.1). */
export function FeedbackComposer({
  overall,
  mentorScore,
  mentorId,
  error,
  savedNote,
  onOverallChange,
  onScoreChange,
  onMentorChange,
  onSaveDraft,
  onSubmit,
}: FeedbackComposerProps) {
  return (
    <>
      <Card>
        <p className={styles.sectionLabel}>③ 멘토 종합 코멘트</p>
        <Textarea
          value={overall}
          onChange={(event) => onOverallChange(event.target.value)}
          aria-invalid={error ? 'true' : undefined}
        />
        {error && (
          <p role="alert" className={styles.errorText}>
            {error}
          </p>
        )}
      </Card>

      <Card>
        <p className={styles.sectionLabel}>④ 멘토 점수</p>
        <div className={styles.scoreRow}>
          <input
            type="range"
            min={0}
            max={100}
            value={mentorScore}
            aria-label="멘토 점수"
            onChange={(event) => onScoreChange(Number(event.target.value))}
            className={styles.slider}
          />
          <span className={styles.scoreValue}>{mentorScore}</span>
        </div>
      </Card>

      <Card>
        <p className={styles.sectionLabel}>⑤ 멘토 프로필 선택</p>
        <div className={styles.mentorOptions} role="radiogroup" aria-label="멘토 프로필">
          {MENTORS.map((mentor) => (
            <label key={mentor.id} className={styles.mentorOption}>
              <input
                type="radio"
                name="mentor"
                checked={mentorId === mentor.id}
                onChange={() => onMentorChange(mentor.id)}
              />
              {mentor.name} · {mentor.role}
            </label>
          ))}
        </div>
      </Card>

      <div className={styles.submitRow}>
        <Button variant="ghost" onClick={onSaveDraft}>
          임시저장
        </Button>
        <Button variant="primary" onClick={onSubmit}>
          피드백 확정 제출
        </Button>
        {savedNote && (
          <span role="status" aria-live="polite" className="meta">
            {savedNote}
          </span>
        )}
      </div>
    </>
  );
}
