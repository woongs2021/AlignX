import { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Textarea } from '@/components/Textarea';
import { Modal } from '@/components/Modal';
import { useAppStore } from '@/store/useAppStore';
import { gradeFromScore } from '@/data/principles';
import type { Attempt, MentorRequest } from '@/types';
import styles from './MentorRequestForm.module.css';

const NAME_MIN = 2;
const NAME_MAX = 20;
const TOPIC_MIN = 2;
const TOPIC_MAX = 60;
const REQUEST_NOTE_MIN = 10;
const REQUEST_NOTE_MAX = 500;
const REQUEST_NOTE_WARN_AT = 480;

type Draft = {
  name: string;
  topic: string;
  requestNote: string;
};

const EMPTY_DRAFT: Draft = {
  name: '',
  topic: '',
  requestNote: '',
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

  if (name.length < NAME_MIN || name.length > NAME_MAX) {
    errors.name = `이름은 ${NAME_MIN}~${NAME_MAX}자로 입력해주세요.`;
  }
  if (topic.length < TOPIC_MIN || topic.length > TOPIC_MAX) {
    errors.topic = `주제는 ${TOPIC_MIN}~${TOPIC_MAX}자로 입력해주세요. (예: "커머스 앱 리디자인")`;
  }
  if (requestNote.length < REQUEST_NOTE_MIN || requestNote.length > REQUEST_NOTE_MAX) {
    errors.requestNote = `요청 사항은 ${REQUEST_NOTE_MIN}~${REQUEST_NOTE_MAX}자로 입력해주세요.`;
  }
  return errors;
}

const FIELD_ORDER: (keyof Draft)[] = ['name', 'topic', 'requestNote'];

type MentorRequestFormProps = {
  attempt: Attempt;
  accountName?: string;
};

/** 2단계 제출 양식 — 1단계 파일 자동 첨부(교체 불가) + 이름/주제/요청사항 3개 필수 항목만 받는다.
 * 교육 만족도·주관식 후기는 3단계 리포트 확인 후 "최종 포트폴리오 제출"에서 별도로 받는다.
 * 이름은 로그인 계정이 있으면 계정 이름으로 고정되고 수정할 수 없다 — 검증 대상이 실제 요청자와 달라지는 것을 막기 위함. */
export function MentorRequestForm({ attempt, accountName }: MentorRequestFormProps) {
  const setMentorRequest = useAppStore((s) => s.setMentorRequest);

  const [draft, setDraft] = useState<Draft>(() => {
    const loaded = loadDraft(attempt.id);
    return accountName ? { ...loaded, name: accountName } : loaded;
  });
  const [errors, setErrors] = useState<Errors>({});
  const [confirmOpen, setConfirmOpen] = useState(false);

  const fieldRefs = useRef<Partial<Record<keyof Draft, HTMLDivElement | null>>>({});

  // 계정 전환(로그인 없이 즉시 전환 가능) 시에도 이름을 최신 계정과 동기화한다 — effect 대신
  // 렌더 중 상태 조정 패턴을 쓴다(react-hooks/set-state-in-effect가 effect 안 동기 setState를
  // 금지한다: https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes).
  const [syncedAccountName, setSyncedAccountName] = useState(accountName);
  if (accountName !== syncedAccountName) {
    setSyncedAccountName(accountName);
    if (accountName) setDraft((prev) => ({ ...prev, name: accountName }));
  }

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
          disabled={Boolean(accountName)}
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

      <div className={styles.submitRow}>
        <Button variant="primary" onClick={handleSubmitClick}>
          멘토 검증 요청하기
        </Button>
      </div>

      <Modal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="멘토 검증을 요청할까요?"
        actions={
          <div className={styles.modalActions}>
            <Button variant="secondary" onClick={() => setConfirmOpen(false)}>
              취소
            </Button>
            <Button variant="primary" onClick={handleConfirmSubmit}>
              요청
            </Button>
          </div>
        }
      >
        요청 후에는 수정할 수 없습니다. 진행할까요?
      </Modal>
    </div>
  );
}
