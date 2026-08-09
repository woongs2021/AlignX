/** 밀리초 → "0:04" (m:ss) — 분석 로딩 화면 경과 시간 표시용. */
export function formatElapsed(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

/** ISO → "2026. 8. 9." — MY 페이지 날짜 표시용(시각 없이 날짜만). */
export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'numeric', day: 'numeric' }).format(
    new Date(iso),
  );
}

/** 바이트 → "1.2MB" / "820KB" — ADMIN 제출 현황 테이블의 파일 용량 표시용. */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${Math.round(kb)}KB`;
  return `${(kb / 1024).toFixed(1)}MB`;
}

/** ISO → "방금 전"/"3분 전"/"2시간 전"/"5일 전" — 오래되면 날짜로 폴백. ADMIN 제출일 표시용. */
export function formatRelativeTime(iso: string, now: number = Date.now()): string {
  const elapsedMs = now - new Date(iso).getTime();
  const minutes = Math.floor(elapsedMs / 60_000);
  if (minutes < 1) return '방금 전';
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}일 전`;
  return formatDate(iso);
}

/** ISO → "2026. 8. 9. 오후 3:12" — 멘토 검증 모니터 제출 시각 표시용. */
export function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(iso));
}

/** 밀리초 → "약 3분 후" / "약 40초 후" / "곧" — 예상 완료 시각 표시용. */
export function formatRemaining(ms: number): string {
  if (ms <= 0) return '곧';
  const seconds = Math.ceil(ms / 1000);
  if (seconds < 60) return `약 ${seconds}초 후`;
  const minutes = Math.ceil(seconds / 60);
  return `약 ${minutes}분 후`;
}
