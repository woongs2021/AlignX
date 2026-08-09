import { useState } from 'react';
import { Modal } from '@/components/Modal';
import { Button } from '@/components/Button';
import { ToggleGroup } from '@/components/ToggleGroup';
import { useAppStore } from '@/store/useAppStore';
import { attemptScore } from '@/features/report/scoring';
import type { Attempt } from '@/types';
import { AttemptCard } from './AttemptCard';
import styles from './AttemptGrid.module.css';

type SortMode = 'latest' | 'score';

const SORT_OPTIONS: { value: SortMode; label: string }[] = [
  { value: 'latest', label: '최신순' },
  { value: 'score', label: '점수순' },
];

function scoreOf(attempt: Attempt): number {
  return attemptScore(attempt) ?? -1;
}

type AttemptGridProps = {
  /** 최신순(스토어 원본 순서) 전체 회차. */
  attempts: Attempt[];
};

/** 2회 이상 — 카드 그리드. 정렬·삭제 확인 모달을 이 단계에서 관리한다 (09 §5). */
export function AttemptGrid({ attempts }: AttemptGridProps) {
  const [sort, setSort] = useState<SortMode>('latest');
  const [pendingDelete, setPendingDelete] = useState<Attempt | null>(null);
  const deleteAttempt = useAppStore((s) => s.deleteAttempt);

  const sequenceById = new Map(attempts.map((a, i) => [a.id, attempts.length - i]));

  const bestId = attempts
    .filter((a) => a.mentorFeedback)
    .reduce<{ id: string; score: number } | null>((best, a) => {
      const score = scoreOf(a);
      return !best || score > best.score ? { id: a.id, score } : best;
    }, null)?.id;

  const sorted = sort === 'score' ? [...attempts].sort((a, b) => scoreOf(b) - scoreOf(a)) : attempts;

  return (
    <div>
      <ToggleGroup
        ariaLabel="정렬 기준"
        options={SORT_OPTIONS}
        value={sort}
        onChange={setSort}
        className={styles.toolbar}
      />

      <div className="card-grid">
        {sorted.map((attempt) => (
          <AttemptCard
            key={attempt.id}
            attempt={attempt}
            sequenceNumber={sequenceById.get(attempt.id)!}
            isBest={attempt.id === bestId}
            onDelete={() => setPendingDelete(attempt)}
          />
        ))}
      </div>

      <Modal
        isOpen={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        title="이 회차를 삭제할까요?"
        actions={
          <>
            <Button variant="ghost" onClick={() => setPendingDelete(null)}>
              취소
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                if (pendingDelete) deleteAttempt(pendingDelete.id);
                setPendingDelete(null);
              }}
            >
              삭제
            </Button>
          </>
        }
      >
        <p>삭제하면 되돌릴 수 없습니다. 분석 결과와 멘토 피드백이 모두 사라집니다.</p>
      </Modal>
    </div>
  );
}
