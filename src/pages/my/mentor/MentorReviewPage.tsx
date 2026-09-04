import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { usePageMeta } from '@/layout/usePageMeta';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import { Badge } from '@/components/Badge';
import { PRINCIPLES, gradeFromScore } from '@/data/principles';
import { useAppStore } from '@/store/useAppStore';
import { useCurrentAccount } from '@/features/auth/useSession';
import { formatDateTime, formatFileSize } from '@/lib/format';
import { PrincipleScoreList } from '@/features/review/PrincipleScoreList';
import { FeedbackComposer } from '@/features/review/FeedbackComposer';
import { ConfirmedFeedbackCard } from '@/pages/admin/feedback/ConfirmedFeedbackCard';
import type { MentorFeedback } from '@/types';
import { PageViewer } from './PageViewer';
import styles from './MentorReviewPage.module.css';

type ReviewDraft = {
  scores: Record<string, number>;
  comments: Record<string, string>;
  overall: string;
};

function draftKey(accountId: string, attemptId: string): string {
  return `alignx.reviewdraft.${accountId}.${attemptId}`;
}

function defaultDraft(aiScores: Record<string, number>): ReviewDraft {
  return { scores: { ...aiScores }, comments: {}, overall: '' };
}

function loadDraft(accountId: string, attemptId: string, aiScores: Record<string, number>): ReviewDraft {
  try {
    const raw = localStorage.getItem(draftKey(accountId, attemptId));
    if (!raw) return defaultDraft(aiScores);
    const parsed = JSON.parse(raw) as Partial<ReviewDraft>;
    return {
      scores: { ...aiScores, ...parsed.scores },
      comments: parsed.comments ?? {},
      overall: parsed.overall ?? '',
    };
  } catch {
    return defaultDraft(aiScores);
  }
}

/** 멘토 로그인 계정의 검증 화면 — AdminFeedbackPage와 같은 2단 레이아웃(좌 sticky 제출물 /
 * 우 채점 폼)을 쓰되, 단계 수동 제어는 없다(제출이 곧 완료다, Plans/14 §7.2 표).
 * 좌측은 전 페이지를 넘겨볼 수 있는 PageViewer로 확장했다(요구 3-3). */
export function MentorReviewPage() {
  usePageMeta({ title: '검증하기 — AlignX' });
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const account = useCurrentAccount();
  const attempt = useAppStore((s) => s.attempts.find((a) => a.id === id) ?? null);
  const setMentorFeedback = useAppStore((s) => s.setMentorFeedback);

  const aiScores: Record<string, number> = {};
  attempt?.ai?.principles.forEach((p) => {
    aiScores[p.id] = p.score;
  });

  const [draft, setDraft] = useState<ReviewDraft>(() =>
    account ? loadDraft(account.id, id, aiScores) : defaultDraft(aiScores),
  );
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [savedNote, setSavedNote] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!account) return;
    const timer = window.setTimeout(() => {
      localStorage.setItem(draftKey(account.id, id), JSON.stringify(draft));
    }, 300);
    return () => window.clearTimeout(timer);
  }, [draft, account, id]);

  if (!attempt || !account) {
    return (
      <div className="container-narrow">
        <p>찾을 수 없는 제출물입니다.</p>
        <Button variant="ghost" onClick={() => navigate('/my')}>
          ← 목록으로
        </Button>
      </div>
    );
  }

  if (!attempt.mentorRequest) {
    return (
      <div className="container-narrow">
        <Button variant="ghost" onClick={() => navigate('/my')} className={styles.backLink}>
          ← 목록으로
        </Button>
        <Card>
          <p className="meta">아직 멘토 검증을 요청하지 않은 회차입니다.</p>
        </Card>
      </div>
    );
  }

  const totalScore = PRINCIPLES.reduce((sum, p) => sum + (draft.scores[p.id] ?? 0), 0);
  const pages = attempt.file.pages?.length ? attempt.file.pages : attempt.file.previewDataUrl ? [attempt.file.previewDataUrl] : [];
  const totalPageCount = attempt.file.pageCount ?? pages.length;

  function handleSaveDraft() {
    if (!account) return;
    localStorage.setItem(draftKey(account.id, id), JSON.stringify(draft));
    setSavedNote('초안이 저장되었습니다.');
    window.setTimeout(() => setSavedNote(''), 2000);
  }

  function handleSubmitClick() {
    if (draft.overall.trim().length === 0) {
      setError('멘토 종합 코멘트를 입력해주세요.');
      return;
    }
    setError('');
    setConfirmOpen(true);
  }

  function handleConfirm() {
    if (!account || !attempt) return;
    const feedback: MentorFeedback = {
      mentorName: account.name,
      mentorRole: account.title,
      mentorId: account.id,
      overall: draft.overall.trim(),
      perPrinciple: PRINCIPLES.map((p) => ({
        principleId: p.id,
        score: draft.scores[p.id] ?? 0,
        comment: draft.comments[p.id]?.trim() ?? '',
      })),
      mentorScore: totalScore,
      completedAt: new Date().toISOString(),
    };

    setMentorFeedback(attempt.id, feedback);
    localStorage.removeItem(draftKey(account.id, id));
    setConfirmOpen(false);
    navigate('/my');
  }

  return (
    <div className="container-narrow">
      <Button variant="ghost" onClick={() => navigate('/my')} className={styles.backLink}>
        ← 목록으로
      </Button>

      <div className={styles.layout}>
        <div className={styles.left}>
          <Card className={styles.previewCard}>
            <PageViewer pages={pages} totalPageCount={totalPageCount} />
          </Card>

          <Card>
            <p className={styles.sectionLabel}>학생 정보</p>
            <p className={styles.studentName}>{attempt.mentorRequest.name}</p>
            <p className="meta">{attempt.mentorRequest.topic}</p>
            <p className="meta">
              {attempt.file.name} · {formatFileSize(attempt.file.size)}
            </p>
            {attempt.ai && (
              <p className="meta">
                AI 총점 {attempt.ai.totalScore} ({gradeFromScore(attempt.ai.totalScore)})
              </p>
            )}
            <p className="meta">제출일 {formatDateTime(attempt.mentorRequest.submittedAt)}</p>
          </Card>

          <Card>
            <p className={styles.sectionLabel}>요청사항</p>
            <blockquote className={styles.quote}>{attempt.mentorRequest.requestNote}</blockquote>
          </Card>
        </div>

        <div className={styles.right}>
          {attempt.mentorFeedback ? (
            <ConfirmedFeedbackCard feedback={attempt.mentorFeedback} />
          ) : (
            <>
              <Card>
                <p className={styles.sectionLabel}>① 객관식 점수 합계</p>
                <p className={styles.totalScore}>
                  {totalScore} <span className="meta">/ 100</span>
                  {attempt.ai && <Badge variant="outline">AI {attempt.ai.totalScore}</Badge>}
                </p>
              </Card>

              <PrincipleScoreList
                ai={attempt.ai}
                comments={draft.comments}
                onCommentChange={(principleId, value) =>
                  setDraft((prev) => ({ ...prev, comments: { ...prev.comments, [principleId]: value } }))
                }
                scores={draft.scores}
                onScoreChange={(principleId, value) =>
                  setDraft((prev) => ({ ...prev, scores: { ...prev.scores, [principleId]: value } }))
                }
              />

              <FeedbackComposer
                overall={draft.overall}
                mentorScore={totalScore}
                mentorScoreEditable={false}
                error={error}
                savedNote={savedNote}
                onOverallChange={(value) => {
                  setDraft((prev) => ({ ...prev, overall: value }));
                  setError('');
                }}
                onSaveDraft={handleSaveDraft}
                onSubmit={handleSubmitClick}
              />
            </>
          )}
        </div>
      </div>

      <Modal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="피드백을 확정 제출할까요?"
        actions={
          <>
            <Button variant="ghost" onClick={() => setConfirmOpen(false)}>
              취소
            </Button>
            <Button variant="primary" onClick={handleConfirm}>
              확정 제출
            </Button>
          </>
        }
      >
        <p>확정 후에는 수정할 수 없습니다. 되돌릴 수 없습니다.</p>
      </Modal>
    </div>
  );
}
