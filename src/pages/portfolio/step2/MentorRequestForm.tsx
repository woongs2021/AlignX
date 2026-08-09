import { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Textarea } from '@/components/Textarea';
import { Modal } from '@/components/Modal';
import { useAppStore } from '@/store/useAppStore';
import { gradeFromScore } from '@/data/principles';
import type { Attempt, MentorRequest } from '@/types';
import { ScaleField } from './ScaleField';
import styles from './MentorRequestForm.module.css';

const NAME_MIN = 2;
const NAME_MAX = 20;
const TOPIC_MIN = 2;
const TOPIC_MAX = 60;
const REQUEST_NOTE_MIN = 10;
const REQUEST_NOTE_MAX = 500;
const REQUEST_NOTE_WARN_AT = 480;
const REVIEW_MIN = 10;
const REVIEW_MAX = 1000;

type Draft = {
  name: string;
  topic: string;
  requestNote: string;
  satisfaction: number | null;
  motivation: number | null;
  outcome: number | null;
  review: string;
};

const EMPTY_DRAFT: Draft = {
  name: '',
  topic: '',
  requestNote: '',
  satisfaction: null,
  motivation: null,
  outcome: null,
  review: '',
};

function draftKey(attemptId: string): string {
  return `alignx.step2draft.${attemptId}`;
}

function loadDraft(attemptId: string): Draft {
  try {
    const raw = localStorage.getItem(draftKey(attemptId));
    if (!raw) return EMPTY_DRAFT;
    return { ...EMPTY_DRAFT, ...(JSON.parse(raw) as Partial<Draft>) };
  } catch {
    return EMPTY_DRAFT;
  }
}

type Errors = Partial<Record<keyof Draft, string>>;

function validate(draft: Draft): Errors {
  const errors: Errors = {};
  const name = draft.name.trim();
  const topic = draft.topic.trim();
  const requestNote = draft.requestNote.trim();
  const review = draft.review.trim();

  if (name.length < NAME_MIN || name.length > NAME_MAX) {
    errors.name = `이름은 ${NAME_MIN}~${NAME_MAX}자로 입력해주세요.`;
  }
  if (topic.length < TOPIC_MIN || topic.length > TOPIC_MAX) {
    errors.topic = `주제는 ${TOPIC_MIN}~${TOPIC_MAX}자로 입력해주세요. (예: "커머스 앱 리디자인")`;
  }
  if (requestNote.length < REQUEST_NOTE_MIN || requestNote.length > REQUEST_NOTE_MAX) {
    errors.requestNote = `요청 사항은 ${REQUEST_NOTE_MIN}~${REQUEST_NOTE_MAX}자로 입력해주세요.`;
  }
  if (draft.satisfaction == null) errors.satisfaction = '교육 만족도를 선택해주세요.';
  if (draft.motivation == null) errors.motivation = '동기부여 정도를 선택해주세요.';
  if (draft.outcome == null) errors.outcome = '학습성과를 선택해주세요.';
  if (review.length < REVIEW_MIN || review.length > REVIEW_MAX) {
    errors.review = `교육 후기는 ${REVIEW_MIN}~${REVIEW_MAX}자로 입력해주세요.`;
  }
  return errors;
}

const FIELD_ORDER: (keyof Draft)[] = [
  'name',
  'topic',
  'requestNote',
  'satisfaction',
  'motivation',
  'outcome',
  'review',
];

type MentorRequestFormProps = {
  attempt: Attempt;
};

/** 2단계 제출 양식 — 1단계 파일 자동 첨부(교체 불가) + 5개 필수 영역 (Plans/06-portfolio-step2.md §2). */
export function MentorRequestForm({ attempt }: MentorRequestFormProps) {
  const setMentorRequest = useAppStore((s) => s.setMentorRequest);

  const [draft, setDraft] = useState<Draft>(() => loadDraft(attempt.id));
  const [errors, setErrors] = useState<Errors>({});
  const [confirmOpen, setConfirmOpen] = useState(false);

  const fieldRefs = useRef<Partial<Record<keyof Draft, HTMLDivElement | null>>>({});

  // 자동 임시저장 — 입력 300ms 디바운스로 로컬 초안 보관 (06 §2.5)
  useEffect(() => {
    const timer = window.setTimeout(() => {
      localStorage.setItem(draftKey(attempt.id), JSON.stringify(draft));
    }, 300);
    return () => window.clearTimeout(timer);
  }, [draft, attempt.id]);

  function update<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function handleSubmitClick() {
    const nextErrors = validate(draft);
    setErrors(nextErrors);
    const firstErrorKey = FIELD_ORDER.find((key) => nextErrors[key]);
    if (firstErrorKey) {
      const container = fieldRefs.current[firstErrorKey];
      container?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      container?.querySelector<HTMLElement>('input, textarea')?.focus();
      return;
    }
    setConfirmOpen(true);
  }

  function handleConfirmSubmit() {
    const request: MentorRequest = {
      name: draft.name.trim(),
      topic: draft.topic.trim(),
      requestNote: draft.requestNote.trim(),
      survey: {
        satisfaction: draft.satisfaction ?? 0,
        motivation: draft.motivation ?? 0,
        outcome: draft.outcome ?? 0,
      },
      review: draft.review.trim(),
      submittedAt: new Date().toISOString(),
    };
    setMentorRequest(attempt.id, request);
    localStorage.removeItem(draftKey(attempt.id));
    setConfirmOpen(false);
  }

  if (!attempt.ai) return null;
  const requestNoteCount = draft.requestNote.length;

  return (
    <div className={styles.page}>
      <Card className={styles.attached}>
        <div className={styles.attachedThumb}>
          {attempt.file.previewDataUrl ? (
            <img src={attempt.file.previewDataUrl} alt="" />
          ) : (
            <div className={styles.attachedFallback}>미리보기 없음</div>
          )}
        </div>
        <div>
          <p className={styles.attachedName}>{attempt.file.name}</p>
          <p className="meta">
            {attempt.file.mime.replace(/^(application|image)\//, '').toUpperCase()} ·{' '}
            {(attempt.file.size / 1024 / 1024).toFixed(1)}MB · AI 총점 {attempt.ai.totalScore}점 (
            {gradeFromScore(attempt.ai.totalScore)})
          </p>
          <p className="meta">1단계에서 분석한 문서가 그대로 첨부됩니다.</p>
        </div>
      </Card>

      <div className={styles.field} ref={(el: HTMLDivElement | null) => { fieldRefs.current.name = el; }}>
        <label htmlFor="mentor-name">이름</label>
        <Input
          id="mentor-name"
          value={draft.name}
          onChange={(e) => update('name', e.target.value)}
          aria-invalid={errors.name ? 'true' : undefined}
          aria-describedby={errors.name ? 'mentor-name-error' : undefined}
        />
        {errors.name && (
          <p id="mentor-name-error" className={styles.errorText} role="alert">
            {errors.name}
          </p>
        )}
      </div>

      <div className={styles.field} ref={(el: HTMLDivElement | null) => { fieldRefs.current.topic = el; }}>
        <label htmlFor="mentor-topic">주제</label>
        <Input
          id="mentor-topic"
          placeholder="예: 커머스 앱 리디자인"
          value={draft.topic}
          onChange={(e) => update('topic', e.target.value)}
          aria-invalid={errors.topic ? 'true' : undefined}
          aria-describedby={errors.topic ? 'mentor-topic-error' : undefined}
        />
        {errors.topic && (
          <p id="mentor-topic-error" className={styles.errorText} role="alert">
            {errors.topic}
          </p>
        )}
      </div>

      <div className={styles.field} ref={(el: HTMLDivElement | null) => { fieldRefs.current.requestNote = el; }}>
        <label htmlFor="mentor-request-note">멘토에게 요청하는 사항</label>
        <Textarea
          id="mentor-request-note"
          value={draft.requestNote}
          onChange={(e) => update('requestNote', e.target.value)}
          maxLength={REQUEST_NOTE_MAX}
          aria-invalid={errors.requestNote ? 'true' : undefined}
          aria-describedby={errors.requestNote ? 'mentor-request-note-error' : undefined}
        />
        <div className={styles.counterRow}>
          <span className={styles.counter} data-warn={requestNoteCount > REQUEST_NOTE_WARN_AT}>
            {requestNoteCount} / {REQUEST_NOTE_MAX}
          </span>
        </div>
        {errors.requestNote && (
          <p id="mentor-request-note-error" className={styles.errorText} role="alert">
            {errors.requestNote}
          </p>
        )}
      </div>

      <div className={styles.scales}>
        <div ref={(el: HTMLDivElement | null) => { fieldRefs.current.satisfaction = el; }}>
          <ScaleField
            legend="교육 만족도"
            name="satisfaction"
            value={draft.satisfaction}
            onChange={(v) => update('satisfaction', v)}
            leftAnchor="전혀 그렇지 않다"
            rightAnchor="매우 그렇다"
            error={errors.satisfaction}
          />
        </div>
        <div ref={(el: HTMLDivElement | null) => { fieldRefs.current.motivation = el; }}>
          <ScaleField
            legend="동기부여"
            name="motivation"
            value={draft.motivation}
            onChange={(v) => update('motivation', v)}
            leftAnchor="전혀 그렇지 않다"
            rightAnchor="매우 그렇다"
            error={errors.motivation}
          />
        </div>
        <div ref={(el: HTMLDivElement | null) => { fieldRefs.current.outcome = el; }}>
          <ScaleField
            legend="학습성과"
            name="outcome"
            value={draft.outcome}
            onChange={(v) => update('outcome', v)}
            leftAnchor="전혀 그렇지 않다"
            rightAnchor="매우 그렇다"
            error={errors.outcome}
          />
        </div>
      </div>

      <div className={styles.field} ref={(el: HTMLDivElement | null) => { fieldRefs.current.review = el; }}>
        <label htmlFor="mentor-review">주관식 교육 후기</label>
        <Textarea
          id="mentor-review"
          placeholder="수업에서 가장 도움이 된 점, 아쉬웠던 점을 자유롭게 적어주세요."
          value={draft.review}
          onChange={(e) => update('review', e.target.value)}
          maxLength={REVIEW_MAX}
          aria-invalid={errors.review ? 'true' : undefined}
          aria-describedby={errors.review ? 'mentor-review-error' : undefined}
        />
        {errors.review && (
          <p id="mentor-review-error" className={styles.errorText} role="alert">
            {errors.review}
          </p>
        )}
      </div>

      <div className={styles.submitRow}>
        <Button variant="primary" onClick={handleSubmitClick}>
          최종 포트폴리오 제출
        </Button>
      </div>

      <Modal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="제출하시겠습니까?"
        actions={
          <div className={styles.modalActions}>
            <Button variant="secondary" onClick={() => setConfirmOpen(false)}>
              취소
            </Button>
            <Button variant="primary" onClick={handleConfirmSubmit}>
              제출
            </Button>
          </div>
        }
      >
        제출 후에는 수정할 수 없습니다. 진행할까요?
      </Modal>
    </div>
  );
}
