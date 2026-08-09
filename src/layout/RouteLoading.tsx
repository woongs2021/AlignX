import styles from './RouteLoading.module.css';

/** lazy() 라우트 청크 로딩 중 폴백 — 무거운 페이지만 코드 분할하므로 대개 순간적이다 (11 §3.2). */
export function RouteLoading() {
  return (
    <div className={`container ${styles.wrap}`}>
      <p className="meta" role="status" aria-live="polite">
        불러오는 중…
      </p>
    </div>
  );
}
