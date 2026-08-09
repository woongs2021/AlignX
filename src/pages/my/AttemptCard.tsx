import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/Badge';
import { ProgressBar } from '@/components/ProgressBar';
import { gradeFromScore } from '@/data/principles';
import { useLiveMentorProgress } from '@/features/mentor/useLiveMentorProgress';
import { buildReportData } from '@/features/report/buildReportData';
import { buildReportHtml, reportFileName } from '@/features/report/buildHtml';
import { attemptScore } from '@/features/report/scoring';
import { downloadHtmlFile } from '@/lib/download';
import { formatDate } from '@/lib/format';
import type { Attempt } from '@/types';
import styles from './AttemptCard.module.css';

type AttemptCardProps = {
  attempt: Attempt;
  sequenceNumber: number;
  isBest: boolean;
  onDelete: () => void;
};

export function AttemptCard({ attempt, sequenceNumber, isBest, onDelete }: AttemptCardProps) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { stages } = useLiveMentorProgress(attempt);

  useEffect(() => {
    if (!menuOpen) return;
    function handlePointerDown(event: PointerEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setMenuOpen(false);
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setMenuOpen(false);
    }
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [menuOpen]);

  const topic = attempt.mentorRequest?.topic || attempt.file.name;
  const doneStage1 = attempt.ai !== null;
  const doneStage2 = attempt.mentorFeedback !== null;
  const doneStage3 = attempt.mentorFeedback !== null;
  const doneCount = [doneStage1, doneStage2, doneStage3].filter(Boolean).length;

  const reviewStages = stages.filter((s) => s.id !== 'complete');
  const reviewDoneCount = reviewStages.filter((s) => s.status === 'done').length;
  const isReviewing = attempt.mentorRequest !== null && attempt.mentorFeedback === null;

  function scoreLabel() {
    const score = attemptScore(attempt);
    if (score === null) return '분석 중';
    if (attempt.mentorFeedback) return `${score} → Grade ${gradeFromScore(score)}`;
    return `AI ${score} → Grade ${attempt.ai!.grade}`;
  }

  function handleDownload() {
    setMenuOpen(false);
    const report = buildReportData(attempt);
    if (!report) return;
    downloadHtmlFile(buildReportHtml(report), reportFileName(report.name));
  }

  return (
    <div className={styles.card}>
      {isReviewing && (
        <ProgressBar
          className={styles.progress}
          value={reviewDoneCount}
          max={reviewStages.length || 1}
          label="멘토 검증 진행 중"
        />
      )}

      <button type="button" className={styles.body} onClick={() => navigate(`/my?attempt=${attempt.id}`)}>
        <span className={styles.thumb}>
          {attempt.file.previewDataUrl ? (
            <img src={attempt.file.previewDataUrl} alt="" className={styles.thumbImg} />
          ) : (
            <span className={styles.thumbFallback}>{attempt.file.name}</span>
          )}
        </span>
        <span className={styles.meta}>
          <span>#{String(sequenceNumber).padStart(2, '0')}</span>
          <span>{formatDate(attempt.createdAt)}</span>
        </span>
        <span className={styles.topic}>{topic}</span>
        <span className={styles.score}>{scoreLabel()}</span>
        <span className={styles.dots} aria-hidden="true">
          <span className={styles.dot} data-done={doneStage1} />
          <span className={styles.dot} data-done={doneStage2} />
          <span className={styles.dot} data-done={doneStage3} />
          <span className="meta">{doneCount}단계 완료</span>
        </span>
        {isBest && <Badge variant="tone">최고 기록</Badge>}
      </button>

      <div ref={menuRef} className={styles.menuWrap}>
        <button
          type="button"
          className={styles.menuTrigger}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          aria-label="더 보기"
          onClick={() => setMenuOpen((v) => !v)}
        >
          ⋯
        </button>
        {menuOpen && (
          <div role="menu" className={styles.menu}>
            {attempt.mentorFeedback && (
              <button type="button" role="menuitem" className={styles.menuItem} onClick={handleDownload}>
                리포트 다운로드
              </button>
            )}
            <button
              type="button"
              role="menuitem"
              className={styles.menuItem}
              onClick={() => {
                setMenuOpen(false);
                onDelete();
              }}
            >
              삭제
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
