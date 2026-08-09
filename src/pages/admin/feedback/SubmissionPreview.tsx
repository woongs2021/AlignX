import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { gradeFromScore } from '@/data/principles';
import { formatDateTime, formatFileSize } from '@/lib/format';
import type { Attempt } from '@/types';
import styles from '../AdminFeedbackPage.module.css';

type SubmissionPreviewProps = {
  attempt: Attempt;
  isSample: boolean;
  onOpenPreview: () => void;
};

/** 좌측 sticky 컬럼 — 포트폴리오 프리뷰 + 학생 정보 + 요청사항 + 만족도 + 후기 (10 §3.1). */
export function SubmissionPreview({ attempt, isSample, onOpenPreview }: SubmissionPreviewProps) {
  return (
    <>
      <Card className={styles.previewCard}>
        <button type="button" className={styles.previewImgButton} onClick={onOpenPreview}>
          {attempt.file.previewDataUrl ? (
            <img src={attempt.file.previewDataUrl} alt="포트폴리오 프리뷰" />
          ) : (
            <span className="meta">미리보기 없음</span>
          )}
        </button>
        <Button variant="ghost" onClick={onOpenPreview}>
          확대 보기
        </Button>
      </Card>

      <Card>
        <p className={styles.sectionLabel}>학생 정보</p>
        <p className={styles.studentName}>
          {attempt.mentorRequest?.name ?? '—'} {isSample && <Badge variant="outline">샘플</Badge>}
        </p>
        <p className="meta">{attempt.mentorRequest?.topic ?? attempt.file.name}</p>
        <p className="meta">
          {attempt.file.name} · {formatFileSize(attempt.file.size)}
        </p>
        {attempt.ai && (
          <p className="meta">
            AI 총점 {attempt.ai.totalScore} ({gradeFromScore(attempt.ai.totalScore)})
          </p>
        )}
        {attempt.mentorRequest && <p className="meta">제출일 {formatDateTime(attempt.mentorRequest.submittedAt)}</p>}
      </Card>

      {attempt.mentorRequest && (
        <>
          <Card>
            <p className={styles.sectionLabel}>요청사항</p>
            <blockquote className={styles.quote}>{attempt.mentorRequest.requestNote}</blockquote>
          </Card>

          <Card>
            <p className={styles.sectionLabel}>만족도 응답</p>
            <p className="meta">
              만족 {attempt.mentorRequest.survey.satisfaction} / 동기 {attempt.mentorRequest.survey.motivation} / 성과{' '}
              {attempt.mentorRequest.survey.outcome}
            </p>
          </Card>

          <Card>
            <p className={styles.sectionLabel}>교육 후기</p>
            <p className={styles.reviewText}>{attempt.mentorRequest.review}</p>
          </Card>
        </>
      )}
    </>
  );
}
