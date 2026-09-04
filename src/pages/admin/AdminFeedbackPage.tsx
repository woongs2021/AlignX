import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { usePageMeta } from '@/layout/usePageMeta';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import { PRINCIPLES } from '@/data/principles';
import { MENTORS } from '@/data/mentors';
import { useAppStore } from '@/store/useAppStore';
import { useAdminSampleStore } from '@/store/useAdminSampleStore';
import { useAdminAttemptById } from '@/features/admin/adminAttempts';
import { effectiveMentorStages, deriveSubmissionStatus } from '@/features/admin/status';
import { STAGE_CONFIG, resumeMentorProgress } from '@/features/mentor/simulator';
import { isSampleAttemptId, SAMPLE_ID_PREFIX } from '@/data/sampleStudents';
import type { MentorFeedback } from '@/types';
import { SubmissionPreview } from './feedback/SubmissionPreview';
import { StageControl } from './feedback/StageControl';
import { PrincipleScoreList } from '@/features/review/PrincipleScoreList';
import { FeedbackComposer } from '@/features/review/FeedbackComposer';
import { ConfirmedFeedbackCard } from './feedback/ConfirmedFeedbackCard';
import styles from './AdminFeedbackPage.module.css';

type FeedbackDraft = {
  perPrinciple: Record<string, string>;
  overall: string;
  mentorScore: number;
  mentorId: string;
};

function draftKey(id: string): string {
  return `alignx.admindraft.${id}`;
}

function emptyDraft(defaultScore: number): FeedbackDraft {
  return { perPrinciple: {}, overall: '', mentorScore: defaultScore, mentorId: MENTORS[0].id };
}

function loadDraft(id: string, defaultScore: number): FeedbackDraft {
  try {
    const raw = localStorage.getItem(draftKey(id));
    if (!raw) return emptyDraft(defaultScore);
    return { ...emptyDraft(defaultScore), ...(JSON.parse(raw) as Partial<FeedbackDraft>) };
  } catch {
    return emptyDraft(defaultScore);
  }
}

/** 피드백 작성 — 좌측 제출물(sticky) + 우측 작성 폼. 관리자 피드백은 시뮬레이터 더미보다
 * 우선한다(먼저 확정 제출하면 그걸로 끝) (Plans/10-admin.md §3). */
export function AdminFeedbackPage() {
  usePageMeta({ title: '피드백 작성 — AlignX' });
  const { id = '' } = useParams();
  const navigate = useNavigate();

  const row = useAdminAttemptById(id);
  const setMentorFeedback = useAppStore((s) => s.setMentorFeedback);
  const setMentorStages = useAppStore((s) => s.setMentorStages);
  const advanceMentorStage = useAppStore((s) => s.advanceMentorStage);
  const advanceSampleStage = useAdminSampleStore((s) => s.advanceSampleStage);
  const completeSampleStages = useAdminSampleStore((s) => s.completeSampleStages);
  const setSampleFeedback = useAdminSampleStore((s) => s.setSampleFeedback);

  const attempt = row?.attempt ?? null;
  const isSample = row?.isSample ?? isSampleAttemptId(id);
  const sampleId = isSample ? id.slice(SAMPLE_ID_PREFIX.length) : id;

  const [draft, setDraft] = useState<FeedbackDraft>(() => loadDraft(id, attempt?.ai?.totalScore ?? 50));
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [savedNote, setSavedNote] = useState('');
  const [error, setError] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);

  // 실제 회차인데 아직 한 번도 모니터를 안 열어 mentorStages가 없으면, 관리자 화면에서라도
  // 시각 기준 스냅샷을 한 번 심어둬야 "다음 단계로"가 작동한다(스토어 액션은 null이면 no-op).
  useEffect(() => {
    if (isSample || !attempt || attempt.mentorStages || !attempt.mentorRequest) return;
    setMentorStages(attempt.id, resumeMentorProgress(attempt));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt?.id]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      localStorage.setItem(draftKey(id), JSON.stringify(draft));
    }, 300);
    return () => window.clearTimeout(timer);
  }, [draft, id]);

  if (!attempt) {
    return (
      <div className="container-narrow">
        <p>찾을 수 없는 제출물입니다.</p>
        <Button variant="ghost" onClick={() => navigate('/admin')}>
          ← 목록으로
        </Button>
      </div>
    );
  }

  const status = deriveSubmissionStatus(attempt);
  const stages = effectiveMentorStages(attempt) ?? [];
  const reviewStages = stages.filter((s) => s.id !== 'complete');
  const alreadyConfirmed = attempt.mentorFeedback !== null;
  const canAdvance = !!attempt.mentorRequest && !alreadyConfirmed;

  function handleAdvance() {
    if (isSample) advanceSampleStage(sampleId, stages);
    else advanceMentorStage(attempt!.id);
  }

  function handleCompleteAll() {
    if (isSample) completeSampleStages(sampleId, stages);
    else {
      for (let i = 0; i < STAGE_CONFIG.length; i += 1) advanceMentorStage(attempt!.id);
    }
  }

  function handleSaveDraft() {
    localStorage.setItem(draftKey(id), JSON.stringify(draft));
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
    const mentor = MENTORS.find((m) => m.id === draft.mentorId) ?? MENTORS[0];
    const feedback: MentorFeedback = {
      mentorName: mentor.name,
      mentorRole: mentor.role,
      overall: draft.overall.trim(),
      perPrinciple: PRINCIPLES.map((p) => ({ principleId: p.id, comment: draft.perPrinciple[p.id]?.trim() ?? '' })),
      mentorScore: draft.mentorScore,
      completedAt: new Date().toISOString(),
    };

    if (isSample) setSampleFeedback(sampleId, feedback);
    else setMentorFeedback(attempt!.id, feedback);

    localStorage.removeItem(draftKey(id));
    setConfirmOpen(false);
    navigate('/admin');
  }

  return (
    <div className="container-narrow">
      <Button variant="ghost" onClick={() => navigate('/admin')} className={styles.backLink}>
        ← 목록으로
      </Button>

      <div className={styles.layout}>
        <div className={styles.left}>
          <SubmissionPreview attempt={attempt} isSample={isSample} onOpenPreview={() => setPreviewOpen(true)} />
        </div>

        <div className={styles.right}>
          {!attempt.mentorRequest && (
            <Card>
              <p className="meta">아직 멘토 검증을 요청하지 않은 회차입니다. AI 분석만 완료된 상태입니다.</p>
            </Card>
          )}

          {attempt.mentorRequest && (
            <>
              <StageControl
                status={status}
                reviewStages={reviewStages}
                canAdvance={canAdvance}
                onAdvance={handleAdvance}
                onCompleteAll={handleCompleteAll}
              />

              {alreadyConfirmed ? (
                <ConfirmedFeedbackCard feedback={attempt.mentorFeedback!} />
              ) : (
                <>
                  <PrincipleScoreList
                    ai={attempt.ai}
                    comments={draft.perPrinciple}
                    onCommentChange={(principleId, value) =>
                      setDraft((prev) => ({
                        ...prev,
                        perPrinciple: { ...prev.perPrinciple, [principleId]: value },
                      }))
                    }
                  />

                  <FeedbackComposer
                    overall={draft.overall}
                    mentorScore={draft.mentorScore}
                    mentorId={draft.mentorId}
                    error={error}
                    savedNote={savedNote}
                    onOverallChange={(value) => {
                      setDraft((prev) => ({ ...prev, overall: value }));
                      setError('');
                    }}
                    onScoreChange={(value) => setDraft((prev) => ({ ...prev, mentorScore: value }))}
                    onMentorChange={(mentorId) => setDraft((prev) => ({ ...prev, mentorId }))}
                    onSaveDraft={handleSaveDraft}
                    onSubmit={handleSubmitClick}
                  />
                </>
              )}
            </>
          )}
        </div>
      </div>

      <Modal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title="포트폴리오 프리뷰"
        actions={
          <Button variant="secondary" onClick={() => setPreviewOpen(false)}>
            닫기
          </Button>
        }
      >
        {attempt.file.previewDataUrl && (
          <img src={attempt.file.previewDataUrl} alt="포트폴리오 프리뷰 확대" className={styles.modalImg} />
        )}
      </Modal>

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
