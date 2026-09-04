import { useEffect, useState } from 'react';
import { Modal } from '@/components/Modal';
import { Button } from '@/components/Button';
import styles from './PageViewer.module.css';

type PageViewerProps = {
  pages: string[];
  /** 원본 총 페이지 수 — pages.length보다 크면 상한 초과 고지를 보여준다(Plans/14 §7.3). */
  totalPageCount: number;
};

function ChevronIcon({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={direction === 'left' ? 'M15 18l-6-6 6-6' : 'M9 18l6-6-6-6'} />
    </svg>
  );
}

/** 제출물 전 페이지를 넘겨볼 수 있는 뷰어 — 이미지 1장이면 넘김 컨트롤을 숨긴다
 * (Plans/14 §7.3 요구 3-3 "실제로 라이브로 볼 수 있게"). */
export function PageViewer({ pages, totalPageCount }: PageViewerProps) {
  const [index, setIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const hasMultiple = pages.length > 1;

  useEffect(() => {
    if (!hasMultiple) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'ArrowLeft') setIndex((i) => Math.max(0, i - 1));
      if (event.key === 'ArrowRight') setIndex((i) => Math.min(pages.length - 1, i + 1));
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasMultiple, pages.length]);

  if (pages.length === 0) {
    return <div className={styles.empty}>미리보기 없음</div>;
  }

  const current = pages[index];

  return (
    <div className={styles.viewer}>
      <button type="button" className={styles.mainImgBtn} onClick={() => setExpanded(true)} aria-label="확대 보기">
        <img src={current} alt={`페이지 ${index + 1}`} className={styles.mainImg} />
      </button>

      {hasMultiple && (
        <div className={styles.controls}>
          <button
            type="button"
            className={styles.navBtn}
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
            disabled={index === 0}
            aria-label="이전 페이지"
          >
            <ChevronIcon direction="left" />
          </button>
          <span className={styles.pageLabel}>
            {index + 1} / {pages.length}
          </span>
          <button
            type="button"
            className={styles.navBtn}
            onClick={() => setIndex((i) => Math.min(pages.length - 1, i + 1))}
            disabled={index === pages.length - 1}
            aria-label="다음 페이지"
          >
            <ChevronIcon direction="right" />
          </button>
        </div>
      )}

      {totalPageCount > pages.length && (
        <p className={styles.limitNote}>총 {totalPageCount}페이지 중 {pages.length}페이지까지 표시됩니다.</p>
      )}

      {hasMultiple && (
        <div className={styles.thumbStrip}>
          {pages.map((page, i) => (
            <button
              key={i}
              type="button"
              className={styles.thumbBtn}
              data-active={i === index}
              onClick={() => setIndex(i)}
              aria-label={`${i + 1}페이지로 이동`}
              aria-current={i === index}
            >
              <img src={page} alt="" />
            </button>
          ))}
        </div>
      )}

      <Modal
        isOpen={expanded}
        onClose={() => setExpanded(false)}
        title={`페이지 ${index + 1}${hasMultiple ? ` / ${pages.length}` : ''}`}
        actions={
          <Button variant="secondary" onClick={() => setExpanded(false)}>
            닫기
          </Button>
        }
      >
        <img src={current} alt={`페이지 ${index + 1} 확대`} className={styles.modalImg} />
      </Modal>
    </div>
  );
}
