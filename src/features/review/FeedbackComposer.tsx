import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Textarea } from '@/components/Textarea';
import { MENTORS } from '@/data/mentors';
import styles from './FeedbackComposer.module.css';

type FeedbackComposerProps = {
  overall: string;
  mentorScore: number;
  /** false면 슬라이더 대신 읽기 전용 합산값으로 보여준다 — 멘토 로그인 화면은 원칙별 점수의
   * 합이 총점이라 직접 슬라이더로 조정하지 않는다(Plans/14 §7.4, Q8). ADMIN 대행 경로는
   * 그대로 슬라이더로 직접 입력한다(기존 동작 유지). */
  mentorScoreEditable?: boolean;
  /** ADMIN 대행 경로에서만 준다 — 멘토 로그인 화면은 로그인한 계정 자신이 곧 작성자다. */
  mentorId?: string;
  error: string;
  savedNote: string;
  onOverallChange: (value: string) => void;
  onScoreChange?: (value: number) => void;
  onMentorChange?: (mentorId: string) => void;
  onSaveDraft: () => void;
  onSubmit: () => void;
};

/** ③ 종합 코멘트(필수) · ④ 멘토 점수 · ⑤ 멘토 프로필 선택(ADMIN만) + 저장/제출 액션
 * (Plans/10-admin.md §3.1, Plans/14 §7.2 — ADMIN·멘토 로그인 화면이 공유한다). */
export function FeedbackComposer({
  overall,
  mentorScore,
  mentorScoreEditable = true,
  mentorId,
  error,
  savedNote,
  onOverallChange,
  onScoreChange,
  onMentorChange,
  onSaveDraft,
  onSubmit,
}: FeedbackComposerProps) {
  const showMentorPicker = mentorId !== undefined && onMentorChange !== undefined;

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
        {mentorScoreEditable && onScoreChange ? (
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
        ) : (
          <p className={styles.scoreValue}>
            {mentorScore} <span className="meta">(원칙별 점수 합산)</span>
          </p>
        )}
      </Card>

      {showMentorPicker && (
        <Card>
          <p className={styles.sectionLabel}>⑤ 멘토 프로필 선택</p>
          <div className={styles.mentorOptions} role="radiogroup" aria-label="멘토 프로필">
            {MENTORS.map((mentor) => (
              <label key={mentor.id} className={styles.mentorOption}>
                <input
                  type="radio"
                  name="mentor"
                  checked={mentorId === mentor.id}
                  onChange={() => onMentorChange!(mentor.id)}
                />
                {mentor.name} · {mentor.role}
              </label>
            ))}
          </div>
        </Card>
      )}

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
