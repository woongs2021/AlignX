import { useRef, useState } from 'react';
import { SectionHeader } from '@/components/SectionHeader';
import { Button } from '@/components/Button';
import { Textarea } from '@/components/Textarea';
import { Modal } from '@/components/Modal';
import { useAppStore } from '@/store/useAppStore';
import { ScaleField } from '../step2/ScaleField';
import type { FinalReview } from '@/types';
import styles from './FinalReviewForm.module.css';

const REVIEW_MIN = 10;
const REVIEW_MAX = 1000;

type Draft = {
  satisfaction: number | null;
  motivation: number | null;
  outcome: number | null;
  review: string;
};

const EMPTY_DRAFT: Draft = { satisfaction: null, motivation: null, outcome: null, review: '' };

type Errors = Partial<Record<keyof Draft, string>>;

function validate(draft: Draft): Errors {
  const errors: Errors = {};
  if (draft.satisfaction == null) errors.satisfaction = '교육 만족도를 선택해주세요.';
  if (draft.motivation == null) errors.motivation = '동기부여 정도를 선택해주세요.';
  if (draft.outcome == null) errors.outcome = '학습성과를 선택해주세요.';
  const review = draft.review.trim();
  if (review.length < REVIEW_MIN || review.length > REVIEW_MAX) {
    errors.review = `교육 후기는 ${REVIEW_MIN}~${REVIEW_MAX}자로 입력해주세요.`;
  }
  return errors;
}

const FIELD_ORDER: (keyof Draft)[] = ['satisfaction', 'motivation', 'outcome', 'review'];

type FinalReviewFormProps = {
  attemptId: string;
};

/** 통합 리포트를 다 확인한 뒤 남기는 마지막 단계 — 만족도 7점 척도 3항목 + 주관식 후기(필수),
 * "최종 포트폴리오 제출"을 눌러야 attempt.finalReview가 채워진다. */
export function FinalReviewForm({ attemptId }: FinalReviewFormProps) {
  const setFinalReview = useAppStore((s) => s.setFinalReview);
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [errors, setErrors] = useState<Errors>({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const fieldRefs = useRef<Partial<Record<keyof Draft, HTMLDivElement | null>>>({});

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
    const finalReview: FinalReview = {
      satisfaction: draft.satisfaction ?? 0,
      motivation: draft.motivation ?? 0,
      outcome: draft.outcome ?? 0,
      review: draft.review.trim(),
      submittedAt: new Date().toISOString(),
    };
    setFinalReview(attemptId, finalReview);
    setConfirmOpen(false);
  }

  const reviewCount = draft.review.length;

  return (
    <section className={styles.section}>
      <SectionHeader eyebrow="LAST STEP" title="후기를 남기고 최종 제출해주세요" />
      <p className={`meta ${styles.note}`}>
        리포트를 다 확인하셨다면, 아래 응답을 남기고 최종 포트폴리오를 제출해주세요.
      </p>

      <div className={styles.scales}>
        <div ref={(el: HTMLDivElement | null) => { fieldRefs.current.satisfaction = el; }}>
          <ScaleField
            legend="교육 만족도"
            name="final-satisfaction"
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
            name="final-motivation"
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
            name="final-outcome"
            value={draft.outcome}
            onChange={(v) => update('outcome', v)}
            leftAnchor="전혀 그렇지 않다"
            rightAnchor="매우 그렇다"
            error={errors.outcome}
          />
        </div>
      </div>

      <div className={styles.field} ref={(el: HTMLDivElement | null) => { fieldRefs.current.review = el; }}>
        <label htmlFor="final-review-text">주관식 교육 후기</label>
        <Textarea
          id="final-review-text"
          placeholder="수업에서 가장 도움이 된 점, 아쉬웠던 점을 자유롭게 적어주세요."
          value={draft.review}
          onChange={(e) => update('review', e.target.value)}
          maxLength={REVIEW_MAX}
          aria-invalid={errors.review ? 'true' : undefined}
          aria-describedby={errors.review ? 'final-review-error' : undefined}
        />
        <div className={styles.counterRow}>
          <span className="meta">
            {reviewCount} / {REVIEW_MAX}
          </span>
        </div>
        {errors.review && (
          <p id="final-review-error" className={styles.errorText} role="alert">
            {errors.review}
          </p>
        )}
      </div>

      <Button variant="primary" onClick={handleSubmitClick}>
        최종 포트폴리오 제출
      </Button>

      <Modal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="최종 제출하시겠습니까?"
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
    </section>
  );
}
