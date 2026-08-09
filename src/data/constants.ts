// 여러 곳에서 참조하는 전역 상수 — 1곳에서만 관리한다 (Plans/00-overview.md Q5, §10).

/** MY 페이지 전체 이력 분석 해금에 필요한 최소 회차 수. */
export const HISTORY_UNLOCK_THRESHOLD = 3;

/**
 * ADMIN 게이트 암호. 프론트엔드 번들에 그대로 포함되어 실제 접근 통제가 아니다 —
 * 데모용 화면 전환 장치일 뿐이며 README/ADMIN 화면에 이 사실을 명시한다.
 */
export const ADMIN_PASSWORD = 'portfolio2026';

/** ADMIN 세션 유지 시간 — 만료되면 재인증을 요구한다 (Plans/10-admin.md §1.3). */
export const ADMIN_SESSION_DURATION_MS = 8 * 60 * 60 * 1000;

/** 연속 실패 시 입력을 잠그는 기준 횟수 · 잠금 시간 (Plans/10-admin.md §1.3). */
export const ADMIN_MAX_ATTEMPTS = 5;
export const ADMIN_LOCKOUT_MS = 30 * 1000;
