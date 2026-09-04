# Phase 14 — 계정 · 알림 · 멘티↔멘토 실연동

> 선행: [13-deploy-docs.md](13-deploy-docs.md) 배포 완료 상태
> 프롬프트 16번 — *"다크모드 dim 삭제 → 로그인/알림 아이콘, 3개 더미 계정(멘티·멘토·관리자) 실연동, 멘토가 실제로 검증하고 그 결과로 3단계가 열리게"*
> 작성일 2026-09-04 · **구현 착수 전 단계 — 아래 §1 결정 사항 확인 필요**

---

## 0. 한눈에 — 무엇이 바뀌는가

| 영역 | 현재 | Phase 14 이후 |
|---|---|---|
| TopNav 우측 | HOME에서 **비활성(dim) 테마 토글** 1개 | 🔔 알림 + 아바타/로그인. 테마 토글은 HOME에서 제거, 나머지 탭은 유지 |
| 로그인 | 없음 (모두 게스트) | 더미 3계정 — 멘티 / 멘토 / 관리자 |
| 내비 탭 | 5개 고정 (`NAV_ITEMS` 상수) | **역할별로 다름** — 멘티: MY / 멘토: MY / 관리자: ADMIN |
| 회차 소유 | `attempts[]` 에 소유자 없음 | `Attempt.ownerId` 로 계정 귀속 |
| 2단계 검증 | 60초 타이머 → **자동으로** 더미 피드백 생성 | 멘토 계정이 **실제로 작성**해야 완료 |
| 3단계 진입 | 타이머가 끝나면 자동 해금 | 멘토가 확정 제출해야 해금 |
| 멘토 화면 | 없음 (ADMIN이 대신 작성) | `/my` = 요청 큐, `/my/review/:id` = 검증 화면 |
| 제출물 열람 | 1페이지 640px JPEG 1장 | **전 페이지 뷰어** (좌/우 넘김) |
| 알림 | 없음 (00 §4.2 비스코프) | 벨 팝오버 + `/my/notifications` 서브탭 |

**핵심 리스크 3가지 — 이 Phase에서 깨지기 쉬운 순서:**

1. **자동 진행 제거** ([§6.1](#61-자동-완료-제거-)) — `useLiveMentorProgress` 가 타이머 완료 시 `setMentorFeedback` 을 호출하는 지금 구조를 그대로 두면 멘토가 손대기 전에 회차가 `completed` 로 넘어간다. 이게 이번 작업의 **진짜 중심**이다.
2. **전 페이지 저장** ([§7.3](#73-페이지-뷰어--저장-전략-)) — 원본 `File` 은 저장하지 않으므로 새로고침 후엔 다시 렌더할 수 없다. 업로드 시점에 전 페이지를 굽고 저장해야 하는데 `localStorage` 5MB 한계와 정면충돌한다.
3. **스키마 v2** ([§2.5](#25-마이그레이션-정책)) — `ownerId` 추가는 기존 저장 데이터를 **초기화**시킨다. 배포본 사용자의 기존 기록이 사라진다.

---

## 1. 확인이 필요한 사항 (구현 착수 전 답변 요망)

> CLAUDE.md §1 · [00 §3](00-overview.md) 과 같은 방식. 답이 없으면 **채택안**으로 진행한다.

| # | 쟁점 | 선택지 | 채택안 (권장) |
|---|---|---|---|
| **Q1** | 벨·아바타를 **HOME에만** 둘지 | (a) HOME 전용 (b) 전 페이지 | **(b)** — 로그인 상태는 전 탭에서 유지돼야 한다. "dim 삭제"는 HOME에만 있던 증상이므로, 테마 토글만 HOME에서 빼고 벨·아바타는 항상 노출 |
| **Q2** | 테마 토글의 최종 거처 | (a) 완전 삭제 (b) 비HOME 유지 (c) 아바타 메뉴 안으로 | **(b)** — 3-2가 지정한 메뉴는 "계정 전환·알림·로그아웃" 3개뿐. 토글을 넣으면 요구를 벗어난다 |
| **Q3** | 로그아웃(게스트) 상태의 권한 | (a) 아무것도 못 함 (b) 1단계까지만 (c) 지금과 동일 | **(b)** — 업로드·AI 분석은 로그인 없이 체험 가능. **멘토 요청(2단계) 제출부터 로그인 필요** (소유자가 없으면 멘토에게 배정할 수 없다). 게스트 내비 = PORTFOLIO/AlignX/ABOUT + MY(빈 상태) |
| **Q4** | 전 페이지 저장 매체 | (a) localStorage, 페이지 수 상한 (b) IndexedDB | **(a) 상한 10페이지** — 기존 프리뷰 파이프라인·쿼터 폴백을 재사용한다. 실사용 PDF가 10p를 넘거나 쿼터가 터지면 (b)로 승격 ([§7.3](#73-페이지-뷰어--저장-전략-)) |
| **Q5** | 멘토 계정의 정체 | (a) 신규 7번째 페르소나 (b) 기존 6인 중 1인 재사용 | **(a)** — 3-6이 "모두 새로 프로필사진 생성"을 요구. ABOUT 소개 카드(6인)에는 추가하지 않는다(그건 쇼케이스, 이건 로그인 사용자) |
| **Q6** | 관리자의 알림 | (a) 없음 (b) 벨만, 센터 없음 | **(b)** — 3-5에 따라 관리자는 MY가 없으므로 `/my/notifications` 도 없다. 벨 팝오버에서만 확인 |
| **Q7** | 계정 전환 시 ADMIN 세션 | (a) 유지 (b) 초기화 | **(b)** — 전환은 곧 다른 사람이므로 `admin.unlockedAt` 을 null로 되돌린다. 관리자로 다시 들어오면 암호 재입력 |
| **Q8** | 원칙별 **객관식 점수**를 새로 받는지 | (a) 총점 슬라이더만(현행) (b) 원칙 10개 각각 0–10 | **(b)** — 3-3이 "객관식 점수 **및** 주관식 피드백"을 명시. `MentorFeedback.perPrinciple` 에 `score` 를 추가하고 총점은 합산으로 계산 ([§2.3](#23-mentorfeedback-확장)) |
| **Q9** | ADMIN의 기존 피드백 작성 기능 | (a) 유지 (b) 멘토 전용으로 이관 | **(a) 유지** — 관리자는 "모든 현황표"를 보는 감독자이자 멘토 부재 시 대행. 단 화면은 [§7](#7-멘토-플로우-role--mentor)의 공용 컴포넌트를 공유한다 |
| **Q10** | 3계정 프로필 이미지 제작 방법 | (a) 이미지 생성 후 PNG 커밋 (b) SVG 절차적 생성 | **(a)** — "멘토 썸네일처럼"이 요구. `public/mentors/*.png` 와 동일한 일러스트 톤. 이미지 확보 전까지는 이니셜 폴백 ([§9](#9-프로필-이미지-3종)) |

---

## 2. 데이터 모델 변경 (전 Phase 공통 계약 갱신)

> [00 §7](00-overview.md) 계약의 확장. `src/types/index.ts` 가 단일 소스다.

### 2.1 Account — 신규

```ts
export type AccountRole = 'mentee' | 'mentor' | 'admin';

export type Account = {
  id: string;            // 'acc_mentee' | 'acc_mentor' | 'acc_admin'
  role: AccountRole;
  name: string;
  handle: string;        // 로그인 목록에 보이는 짧은 식별자
  title: string;         // '취업준비생 · 프로덕트 디자인' / 'UX Lead' / '운영 관리자'
  initial: string;       // 이미지 실패 시 폴백 (기존 MentorPersona 규칙과 동일)
  avatarSrc: string;     // public/accounts/*.png
};
```

`src/data/accounts.ts` 에 3건 고정. **비밀번호 없음** — 목록에서 고르면 즉시 로그인이다(3번 요구). ADMIN 암호 게이트는 이것과 별개로 그대로 남는다([§8](#8-관리자-플로우-role--admin)).

### 2.2 Attempt 확장

```ts
export type Attempt = {
  // ... 기존 필드 유지
  ownerId: string | null;          // 신규 — null = 게스트가 만든 회차
  assignedMentorId: string | null; // 신규 — 'assign' 단계에서 채워진다
  file: {
    // ... 기존 필드 유지
    previewDataUrl: string;        // 유지 — 카드/리포트용 1페이지 썸네일
    pages: string[];               // 신규 — 전 페이지 dataURL (상한 §7.3)
    pageCount: number;             // 신규 — 원본 총 페이지 수 (상한 초과 시 pages.length > 와 다를 수 있다)
  };
};
```

> `previewDataUrl` 을 `pages[0]` 으로 대체하지 **않는다.** 쿼터 압박 시 `pages` 는 버려도 카드 썸네일은 남아야 하기 때문이다([§7.3](#73-페이지-뷰어--저장-전략-)).

### 2.3 MentorFeedback 확장

```ts
export type MentorFeedback = {
  mentorName: string;
  mentorRole: string;
  mentorId: string;                                          // 신규 — 계정 귀속
  overall: string;
  perPrinciple: { principleId: string; score: number; comment: string }[]; // score 신규 (0–10)
  mentorScore: number;   // = perPrinciple.score 합산 (0–100). 더 이상 슬라이더 직접 입력이 아니다
  completedAt: string;
};
```

**파급:** `buildReportData` 의 `ReportPrincipleRow` 에 `mentorScore` 를 더하면 `PrincipleComparisonTable` 이 진짜 *AI vs 멘토* 원칙별 비교표가 된다 — 지금은 AI 점수 옆에 멘토 코멘트만 붙는다. `buildHtml.ts`(다운로드 리포트)도 같이 손봐야 한다.

### 2.4 Notification — 신규

```ts
export type NotificationKind =
  | 'mentor_request_arrived'   // → 멘토에게
  | 'mentor_review_started'    // → 멘티에게
  | 'mentor_feedback_ready'    // → 멘티에게
  | 'final_submitted'          // → 멘토·관리자에게
  | 'notice';                  // 더미 공지

export type AppNotification = {
  id: string;
  recipientId: string;         // Account.id
  kind: NotificationKind;
  title: string;
  body: string;
  attemptId: string | null;    // 클릭 시 이동 대상
  createdAt: string;
  readAt: string | null;
};
```

### 2.5 마이그레이션 정책

`AppState.version: 1 → 2`, persist `version: 2`.

```ts
// useAppStore.ts
version: 2,
migrate: () => initialState,   // v1 데이터는 버린다
```

> ⚠️ **기존 사용자의 로컬 기록이 전부 사라진다.** `ownerId` 없는 회차를 어느 계정에 붙일지 결정할 방법이 없고, 데모 서비스이므로 마이그레이션 코드를 쓰는 편이 손해다([00 §7](00-overview.md) "스키마 변경 시 버전을 올리고 마이그레이션 없이 초기화" 원칙 그대로). README 릴리스 노트에 명시한다.

### 2.6 AppState 최종형

```ts
export type AppState = {
  version: 2;
  session: { accountId: string | null };   // user: {name} 를 대체
  attempts: Attempt[];
  notifications: AppNotification[];
  admin: { unlockedAt: string | null };
  mode: Mode;
};
```

`user: { name: string | null }` 은 삭제한다 — 실제로 읽는 곳이 없고(`MyPage` 는 `mentorRequest.name` 을 쓴다) `session` 과 역할이 겹친다.

---

## 3. 세션 · 역할

### 3.1 스토어 액션

```ts
login: (accountId: string) => void;      // session 설정 + admin 세션 초기화(Q7)
logout: () => void;                      // session.accountId = null + admin 초기화
switchAccount: (accountId: string) => void;  // = logout + login. 별도 액션으로 둬 의도를 남긴다
```

`resetAll()` 재정의 필요 — 지금은 `initialState` 로 통째 리셋한다. **현재 계정의 회차만** 지우고 세션은 유지하도록 바꾼다(MY 헤더의 "초기화" 버튼 의미가 계정 도입 후 달라진다).

### 3.2 파생 훅

`src/features/auth/useSession.ts`

```ts
useCurrentAccount(): Account | null
useRole(): AccountRole | 'guest'
useMyAttempts(): Attempt[]          // 멘티: ownerId === me. 멘토: assignedMentorId === me
```

`MyPage` · `router.tsx` · `TopNav` 가 이 훅만 본다. 역할 판정 로직을 여러 곳에 흩지 않는다.

### 3.3 역할별 내비 — `navItems.ts` 함수화

```ts
export function navItemsFor(role: AccountRole | 'guest'): NavItem[]
```

| 역할 | 탭 |
|---|---|
| guest | PORTFOLIO 분석 · AlignX AI · MY · ABOUT |
| mentee | PORTFOLIO 분석 · AlignX AI · **MY** · ABOUT |
| mentor | PORTFOLIO 분석 · AlignX AI · **MY** · ABOUT |
| admin | PORTFOLIO 분석 · AlignX AI · ABOUT · **ADMIN** |

> **MY 하나가 역할에 따라 완전히 다른 화면이 된다** — 탭을 늘리지 않는다(3-5가 "멘토의 my는 새로운 ui가 추가"라고 표현). 라벨만 역할별로 바꿀지는 구현 시 판단: 멘토는 `MY` → `MY (검증)` 가 읽기 쉽다.

`TopNav` 와 `MobileNav` 가 `NAV_ITEMS` 상수를 각각 import하는 지금 구조는 그대로 두되, 상수 대신 훅 결과를 넘긴다.

### 3.4 라우트 가드 재편 (`router.tsx`)

| 라우트 | 가드 |
|---|---|
| `/portfolio/mentor` | 기존 `RequireAiAnalysis` + **`RequireLogin`(멘티)** 신규 (Q3) |
| `/portfolio/report` | 기존 `RequireMentorFeedback` 유지 — 멘토가 확정해야 통과된다([§6.3](#63-3단계-해금-조건)) |
| `/my` | 역할 분기 — 컴포넌트 내부에서 (멘티 뷰 / 멘토 큐 / 관리자는 `/admin` 리다이렉트) |
| `/my/notifications` | 신규. 로그인 필요. 관리자는 `/admin` 리다이렉트 (Q6) |
| `/my/review/:id` | 신규. **멘토 전용** — `RequireRole('mentor')` |
| `/my/history` | 기존 `RequireHistoryUnlock` + 멘티 전용 |
| `/admin`, `/admin/submissions/:id` | 기존 `RequireAdminAuth` + **`RequireRole('admin')`** 추가 |

---

## 4. TopNav — 벨 · 아바타

### 4.1 액션 영역 재구성

```
현재:  [ ☀/🌙(HOME에선 dim) ] [ ☰ ]
목표:  [ ☀/🌙(HOME에선 미렌더) ] [ 🔔 ] [ 아바타 or 로그인 ] [ ☰ ]
```

- `ThemeToggle` 의 `disabled={isHome}` 을 제거하고, **HOME에서는 렌더 자체를 하지 않는다.** dim 상태가 곧 요구가 지목한 "dim 된 부분"이다. `isHome` 판단은 `TopNav` 로 올린다 — `ThemeToggle` 이 `useLocation` 을 직접 아는 지금 구조는 배치 책임과 섞여 있다.
- 벨은 아바타 **왼쪽**(요구 1번 명시).
- 로그아웃 상태의 아바타 자리 = 로그인 아이콘(사람 실루엣 SVG). 클릭 시 계정 선택 팝오버.
- 로그인 상태 = 32px 원형 썸네일. 클릭 시 계정 메뉴 팝오버.

### 4.2 공용 팝오버

벨·아바타가 같은 동작을 하므로 `src/components/Popover.tsx` 를 하나 만든다 — 트리거 버튼 기준 **하단 우측 정렬**, 외부 클릭·Esc 닫기, 포커스 트랩 없이 `role="menu"`.

> 기존 `Modal.tsx` 를 재사용하지 않는다 — 팝오버는 오버레이·바디 스크롤 잠금이 없어야 한다("그 자리 하단에 팝업"). 다만 **Esc/외부클릭/포커스 복귀 규칙은 `Modal` 과 `MobileNav` 가 이미 쓰는 것을 그대로 따른다.**

### 4.3 알림 팝오버 (요구 2번)

```
┌─────────────────────────────┐
│ 알림                  모두 읽음 │
├─────────────────────────────┤
│ ● 멘토 검증이 완료되었습니다      │  ← 미읽음 = 좌측 점
│   3단계 통합 리포트를 확인하세요   │
│   10분 전                     │
├─────────────────────────────┤
│   김세연 멘토가 배정되었습니다     │
│   1시간 전                    │
├─────────────────────────────┤
│        전체 보기 →            │  ← /my/notifications
└─────────────────────────────┘
```

- 최근 5건. 항목 클릭 → `readAt` 기록 후 `/my/notifications` 로 이동(요구 2번: "알림 아이콘의 내용을 누르면 My 탭 하위 Notification 서브탭에서 보이도록").
- 벨 아이콘에 미읽음 카운트 배지. 0이면 배지 없음.
- 관리자는 "전체 보기" 링크를 숨긴다 (Q6 — MY가 없다).

### 4.4 계정 메뉴 팝오버 (요구 3-2)

```
┌─────────────────────────────┐
│  🧑 김지민                    │
│     멘티 · 취업준비생           │
├─────────────────────────────┤
│  계정 전환               ▸    │  → 3계정 목록 (현재 계정 체크)
│  알림                    3    │  → /my/notifications (관리자는 팝오버만)
│  로그아웃                     │
└─────────────────────────────┘
```

"계정 전환"은 2단 메뉴 대신 **같은 팝오버 안에서 목록으로 교체**하는 편이 모바일에서 안전하다.

### 4.5 MobileNav

`MobileNav` 의 `topRow` 에 있는 `ThemeToggle` 옆에 벨·아바타를 넣지 않는다 — 대신 **메뉴 리스트 하단에 계정 블록**을 붙인다(전체화면 오버레이에서 팝오버를 겹치면 포커스 트랩이 꼬인다).

### 4.6 접근성

- 벨: `aria-label="알림 N건"`, `aria-expanded`, `aria-haspopup="menu"`
- 아바타: `aria-label="{이름} 계정 메뉴"` / 로그아웃 시 `"로그인"`
- 배지 숫자는 `aria-hidden` — 라벨이 이미 읽어준다
- 팝오버 닫힘 시 트리거로 포커스 복귀 (`MobileNav` 와 동일 규칙)
- 새 알림 도착 시 `aria-live="polite"` 로 1회 공지

---

## 5. 알림 시스템

### 5.1 이벤트 → 알림 매핑

| 발생 시점 | kind | 수신자 |
|---|---|---|
| 멘티가 2단계 요청 제출 | `mentor_request_arrived` | 배정된 멘토 |
| `assign` 단계 완료 | `mentor_review_started` | 멘티 |
| 멘토가 피드백 확정 제출 | `mentor_feedback_ready` | 멘티 |
| 멘티가 3단계 최종 제출 | `final_submitted` | 멘토 + 관리자 |

발생 지점은 전부 **스토어 액션 안**이다(`setMentorRequest`, `setMentorFeedback`, `setFinalReview`). 컴포넌트에서 부르면 중복 발행이 생긴다.

### 5.2 더미 시드

요구 2번의 "내용은 더미로" — 첫 로그인 시 계정별 `notice` 3건을 시드한다(서비스 공지·기능 안내·팁). `src/data/seedNotifications.ts`. 실제 이벤트 알림은 그 위에 쌓인다.

### 5.3 `/my/notifications` — MY 서브탭

MY 상단에 서브탭 바 신설: `[ 내 포트폴리오 ] [ 알림 ]` (멘토는 `[ 검증 요청 ] [ 알림 ]`).

- `ToggleGroup` 재사용 가능 여부를 먼저 확인한다 — 라우트 이동을 겸해야 하므로 `NavLink` 기반 별도 컴포넌트가 맞을 수 있다.
- 목록: 미읽음 우선 아님, **시간 역순**. 미읽음 배경 강조.
- 항목 클릭 → `attemptId` 가 있으면 해당 회차로 이동, 없으면 읽음 처리만.

---

## 6. 멘티 플로우 (role = mentee)

### 6.1 자동 완료 제거 ★

**지금 코드 (`src/features/mentor/useLiveMentorProgress.ts`):**

```ts
if (isAllDone(computed) && !feedbackGeneratedRef.current) {
  feedbackGeneratedRef.current = true;
  setMentorFeedback(attempt.id, generateMentorFeedback(attempt));  // ← 이 줄이 문제
}
```

타이머가 60초를 채우면 사람 없이 회차가 `completed` 가 된다. **이 블록을 삭제한다.**

**`STAGE_CONFIG` 재정의 (`simulator.ts`):**

| id | 지금 | Phase 14 |
|---|---|---|
| `intake` | 3s 자동 | 유지 (접수 확인은 시스템 처리로 자연스럽다) |
| `assign` | 5s 자동 | 유지 — 완료 시 `assignedMentorId` 설정 + 멘토에게 알림 |
| `review1` `review2` `synthesis` | 16/16/20s 자동 | **1개 단계로 통합** — `mentor_review`, **지속시간 없음(무기한 대기)** |
| `complete` | 타이머 도달 시 done | **멘토가 확정 제출할 때만** done |

`resumeMentorProgress` 는 절대시각 역산 구조를 그대로 두되, `mentor_review` 는 `durationMs: Infinity` 로 두어 영원히 `active` 에 머물게 한다. 완료 판정은 **`attempt.mentorFeedback !== null`** 단 하나로 통일한다.

**`generateMentorFeedback` 의 처지:** 게스트가 로그인 없이 2단계를 볼 수 있게 남길지 여부(Q3 채택안에선 게스트는 2단계 진입 자체가 막힌다) → **삭제**를 권장한다. `dummyFeedback.ts` + `dummyFeedback.test.ts` 동반 삭제. 남겨두면 "왜 어떤 회차는 저절로 완료되는가"라는 유령 버그의 원인이 된다.

> ⚠️ 삭제 전 `sampleStudents.ts`(ADMIN 샘플 10건)가 이 함수를 쓰는지 확인할 것. 쓰고 있다면 샘플은 **정적 피드백 데이터로 고정**한다.

### 6.2 모니터링 화면 문구

무기한 대기가 되므로 "남은 시간 ETA"를 더 이상 쓸 수 없다. `MonitoringScreen` 의 ETA 표시를 다음으로 교체:

> 김세연 멘토가 검토 중입니다 · 검토가 끝나면 알림으로 알려드립니다

데모 편의를 위해 **"멘토 화면으로 이동" 링크는 넣지 않는다** — 멘티가 멘토 화면에 접근하는 인상을 주면 안 된다. 계정 전환은 아바타 메뉴로만.

### 6.3 3단계 해금 조건

`RequireMentorFeedback`(`mentorFeedback !== null`)를 **그대로 둔다.** §6.1로 자동 생성이 사라지면 이 가드가 자연히 "멘토가 실제로 제출해야 열린다"가 된다 — 추가 코드가 필요 없다. 요구 3-4가 이미 충족된다.

MY의 회차 카드 상태 라벨만 손본다: `reviewing` 을 "검증 중(멘토 대기)"로.

---

## 7. 멘토 플로우 (role = mentor)

### 7.1 `/my` — 검증 요청 큐

`MyPage` 가 역할로 분기해 `MentorQueueView` 를 렌더한다.

```
MY (검증)
김세연님에게 배정된 검증 요청

[ 대기 2 ] [ 검토중 1 ] [ 완료 5 ]        ← StatTile 재사용

┌──────────────────────────────────────────┐
│ [썸네일]  김지민 · 프로덕트 디자인 포트폴리오   │
│           AI 72점 (B) · 4시간 전 요청       │
│           "레이아웃 일관성 위주로 봐주세요"    │
│                          [ 검증하기 → ]    │
└──────────────────────────────────────────┘
```

**대부분 ADMIN 대시보드와 동일하다.** `SubmissionsTable` · `deriveSubmissionStatus` · `attemptScore` 를 재사용하되, 행 집합만 `assignedMentorId === me` 로 좁힌다. 새로 만들지 말고 `useAdminAttempts` 옆에 `useMentorQueue()` 를 둔다.

### 7.2 `/my/review/:id` — 검증 화면

`AdminFeedbackPage` 의 2단 레이아웃(좌 sticky 제출물 / 우 작성 폼)을 그대로 따른다. **공용화가 이 Phase의 최대 절감 포인트다:**

```
src/features/review/            ← 신규. admin/feedback/* 에서 승격
├─ SubmissionPreview.tsx        (좌측 — §7.3 뷰어로 확장)
├─ PrincipleScoreList.tsx       (기존 PrincipleCommentList + 점수 입력)
├─ FeedbackComposer.tsx         (기존 그대로, 멘토 선택 라디오만 제거)
└─ useFeedbackDraft.ts          (기존 draftKey/loadDraft 로직 추출)
```

`AdminFeedbackPage` 와 `MentorReviewPage` 는 이 컴포넌트들을 조립하는 얇은 껍데기가 된다. 차이는 두 가지뿐:

| | ADMIN | 멘토 |
|---|---|---|
| 멘토 프로필 선택 | 3인 중 라디오 선택 | **없음** — 로그인 계정이 곧 작성자 |
| 단계 수동 진행(`StageControl`) | 있음 | 없음 — 제출이 곧 완료 |

### 7.3 페이지 뷰어 · 저장 전략 ★

**제약:** 원본 `File` 은 저장하지 않는다([00 §7](00-overview.md)). 새로고침·계정 전환 후엔 원본이 메모리에 없으므로 **업로드 시점에 전 페이지를 굽지 않으면 나중엔 불가능하다.**

**업로드 파이프라인 변경 (`lib/pdf.ts` · `lib/preview.ts`):**

```ts
// pdf.ts — 1페이지 전용 함수 옆에 추가
renderPdfPagesToCanvases(file: File, maxPages: number): Promise<HTMLCanvasElement[]>

// preview.ts
generatePreview(file, mime) → {
  previewDataUrl: string;   // 기존과 동일 (640px q0.7) — 카드/리포트용
  pages: string[];          // 신규 (480px q0.6) — 뷰어용
  pageCount: number;
}
```

| 항목 | 값 | 근거 |
|---|---|---|
| 페이지 상한 | **10** (Q4) | 초과분은 저장하지 않고 뷰어에 "총 N페이지 중 10페이지까지 표시" 고지 |
| 페이지 해상도 | 480px 폭 · JPEG q0.6 | 640/q0.7 대비 약 55% 용량. 뷰어에서 읽을 수 있는 하한 |
| 회차당 예상 | 10p × ~28KB ≈ **280KB** | localStorage 5MB 기준 회차 15건 내외에서 압박 시작 |
| 렌더 타임아웃 | 페이지당 3초 유지, 전체 15초 상한 | 지금 `RENDER_TIMEOUT_MS = 3000` 은 1페이지 기준. 전체 상한을 별도로 둔다 |

**쿼터 대응 — `stripAllPreviews` 확장:** 지금은 쿼터 초과 시 *모든* 회차의 `previewDataUrl` 을 비운다. 3단계로 세분화한다:

1. **완료된 회차의 `pages`** 를 오래된 순으로 버린다 (검증이 끝났으므로 뷰어가 필요 없다)
2. 그래도 안 되면 **모든 `pages`** 를 버린다
3. 그래도 안 되면 기존대로 `previewDataUrl` 까지 버린다

> 1단계를 넣지 않으면 검증 대기 중인 회차의 페이지가 먼저 날아가 **멘토 화면이 빈다.** 이번 Phase에서 가장 놓치기 쉬운 지점이다.

**뷰어 UI:**

```
┌────────────────────────────────┐
│                                │
│        [페이지 이미지]           │
│                                │
├────────────────────────────────┤
│  ‹      3 / 8      ›   [확대]   │
└────────────────────────────────┘
  [▫][▫][▪][▫][▫][▫][▫][▫]        ← 썸네일 스트립
```

- ←/→ 키 지원, 썸네일 클릭 이동
- "확대"는 기존 `Modal` + 큰 이미지 (`AdminFeedbackPage` 의 `previewOpen` 패턴 그대로)
- 이미지 1장(PNG/JPEG/GIF)은 `pages.length === 1` — 넘김 컨트롤을 숨긴다

### 7.4 채점 폼 (요구 3-3)

**객관식** — 원칙 10개 각각 0–10점.

```
② 원칙별 점수 · 코멘트

01 시각적 위계          AI 8점
   멘토 점수  [0][1][2]...[8][9][10]        ← 세그먼트 or 슬라이더
   코멘트     ┌──────────────────────┐
              └──────────────────────┘
```

- 기본값은 **AI 점수와 동일**하게 채워둔다 — 멘토가 바꾼 항목만 손대면 되고, "AI와의 관점 차이"(`isPerspectiveGap`)가 자연히 드러난다
- 총점 = 합산, 실시간 표시. 기존 `FeedbackComposer` 의 총점 슬라이더는 **읽기 전용 표시로 강등**

**주관식** — 종합 코멘트(필수, 기존 그대로) + 원칙별 코멘트(선택).

**임시저장** — 기존 `alignx.admindraft.{id}` 키 방식 유지, 키만 `alignx.reviewdraft.{accountId}.{id}` 로.

### 7.5 제출 → 멘티 반영

```
확정 제출
  → setMentorFeedback(attemptId, feedback)   // status: 'completed', currentStep: 3
  → pushNotification('mentor_feedback_ready', 멘티)
  → 큐에서 '완료'로 이동
```

멘티로 계정 전환하면 `RequireMentorFeedback` 이 통과되어 `/portfolio/report` 가 열린다 — **추가 배선 없이 3-4가 성립한다.**

확정 후 수정 불가(기존 `ConfirmedFeedbackCard` 규칙 유지).

---

## 8. 관리자 플로우 (role = admin)

요구 3-5는 **현행 유지 + 접근 조건 추가**다.

- 내비에 ADMIN만, MY 없음 ([§3.3](#33-역할별-내비--navitems-함수화))
- `/admin` 진입 시 암호 게이트 그대로 (`portfolio2026`, [10 §0](10-admin.md) 보안 고지 유지)
- 대시보드는 **모든 계정의 회차 + 샘플 10건** — 지금과 동일(`useAdminAttempts`). 여기에 `ownerId`/`assignedMentorId` 열을 추가하면 "누가 누구에게" 가 보인다
- `/my`, `/my/notifications` 접근 시 `/admin` 리다이렉트

> 관리자 로그인 ≠ ADMIN 잠금 해제. **두 단계를 유지한다** — 3-5가 "admin에서 현재와 같이 패스워드를 입력하면"이라고 명시.

---

## 9. 프로필 이미지 3종 (요구 3-6)

```
public/accounts/
├─ mentee.png    사람 · 20대 취업준비생
├─ mentor.png    사람 · 30–40대 시니어 실무자
└─ admin.png     로봇 (요구 명시)
```

| 항목 | 규격 |
|---|---|
| 스타일 | `public/mentors/*.png` 와 동일한 일러스트 톤 — 정면 상반신, 단색 배경, 원형 크롭 전제 |
| 크기 | 512×512 정사각. 표시 크기는 32px(TopNav)~96px(프로필 카드) |
| 용량 | **60KB 이하** — 기존 멘토 PNG가 ~140KB로 과하다. 신규 3장은 webp 병행 검토 |
| 폴백 | 로드 실패 시 이니셜 원형 (`MentorPersona.initial` 규칙 그대로) |

> ⚠️ 저장소에 이미지 생성 스크립트가 없다(`scripts/` 확인 완료 — 기존 멘토 PNG는 수동 추가분). **이미지는 별도로 제작해 커밋해야 한다.** 구현은 이니셜 폴백으로 먼저 완주시키고 이미지를 나중에 끼운다.

또한 로봇 이미지에는 실존 브랜드 로고·캐릭터가 들어가지 않게 한다.

---

## 10. 라우트 · 톤 매핑 갱신

`src/theme/routeTheme.ts` 에 추가:

```ts
'/my/notifications': 'warm',   // MY 계열과 동일
'/my/review':        'warm',   // 멘토 검증 — MY 하위
```

`/my/review/:id` 는 동적 세그먼트라 `ROUTE_THEME[pathname]` 완전일치 조회에 걸리지 않는다. **`resolveRouteTheme` 를 접두사 매칭으로 바꾸거나** 해당 키를 예외 처리해야 한다 — 지금 `/admin/submissions/:id` 도 같은 이유로 `DEFAULT_THEME('cool')` 로 떨어지는데, 마침 `/admin` 도 cool이라 증상이 안 보일 뿐이다. **이 Phase에서 접두사 매칭으로 고친다.**

---

## 11. 영향 받는 기존 파일

### 신규

```
src/data/accounts.ts
src/data/seedNotifications.ts
src/features/auth/useSession.ts
src/features/notifications/notifications.ts
src/features/review/                      ← admin/feedback/* 승격
src/components/Popover.tsx
src/components/Avatar.tsx
src/layout/NotificationBell.tsx
src/layout/AccountMenu.tsx
src/pages/my/NotificationsPage.tsx
src/pages/my/mentor/MentorQueueView.tsx
src/pages/my/mentor/MentorReviewPage.tsx
src/pages/my/mentor/PageViewer.tsx
```

### 수정

| 파일 | 변경 |
|---|---|
| `src/types/index.ts` | Account · Notification · Attempt/MentorFeedback 확장 · AppState v2 |
| `src/store/useAppStore.ts` | session·notifications·액션 5종·partialize·version 2·`stripAllPreviews` 3단계화 |
| `src/layout/navItems.ts` | 상수 → `navItemsFor(role)` |
| `src/layout/TopNav.tsx` | 액션 영역 재구성 · `isHome` 판단 이관 |
| `src/layout/MobileNav.tsx` | 계정 블록 추가 · 동적 내비 |
| `src/components/ThemeToggle.tsx` | `disabled`/`useLocation` 제거 |
| `src/router.tsx` | 라우트 3개 추가 · `RequireRole`/`RequireLogin` 추가 |
| `src/theme/routeTheme.ts` | 접두사 매칭 + 신규 라우트 |
| `src/pages/my/MyPage.tsx` | 역할 분기 · 서브탭 · 이름을 계정에서 |
| `src/pages/my/MyHeader.tsx` | `resetAll` 의미 변경 반영 |
| `src/features/mentor/simulator.ts` | `STAGE_CONFIG` 재정의 (무기한 대기 단계) |
| `src/features/mentor/useLiveMentorProgress.ts` | **자동 피드백 생성 삭제** |
| `src/features/mentor/dummyFeedback.ts` | 삭제 (§6.1) |
| `src/lib/pdf.ts` · `src/lib/preview.ts` | 전 페이지 렌더 |
| `src/pages/portfolio/step1/UploadZone.tsx` | 다중 페이지 결과 저장 |
| `src/pages/portfolio/step2/MonitoringScreen.tsx` | ETA → 대기 문구 |
| `src/features/report/buildReportData.ts` · `buildHtml.ts` | 원칙별 멘토 점수 반영 |
| `src/pages/admin/*` | 공용 컴포넌트로 교체 · 역할 가드 |
| `src/data/sampleStudents.ts` | `ownerId`/`assignedMentorId`/`pages` 필드 채움 · 멘토 큐에 일부 배정 |

### 깨지는 테스트 (선반영 필요)

`router.test.tsx` · `layout.test.tsx` · `my.test.tsx` · `step2-3.test.tsx` · `step2-draft.test.tsx` · `useAppStore.test.ts` · `dummyFeedback.test.ts`(삭제) · `AdminFeedbackPage.test.tsx` · `AdminPage.test.tsx` · `AdminGate.test.tsx`

---

## 12. 구현 순서

각 단계가 끝날 때 `npm run lint && npm run test && npm run build` 가 통과해야 다음으로 넘어간다.

```
1. 타입 + 스토어 v2 (계정·세션·알림)      → verify: useAppStore.test 재작성 통과
2. useSession + navItemsFor + 라우트 가드  → verify: 역할별 탭 노출 테스트
3. TopNav 벨/아바타 + Popover             → verify: HOME에 dim 토글 없음, 팝오버 열림/닫힘 테스트
4. 알림 시드 + /my/notifications          → verify: 더미 3건 표시, 읽음 처리
5. 자동 완료 제거 + STAGE_CONFIG 재정의    → verify: 60초 지나도 completed 안 됨
6. 전 페이지 프리뷰 + 쿼터 3단계 폴백      → verify: 8p PDF 업로드 후 pages.length === 8
7. review/ 공용화 + ADMIN 리팩터           → verify: 기존 ADMIN 테스트 그대로 통과
8. 멘토 큐 + 검증 화면 + 페이지 뷰어        → verify: 멘토 계정에서 요청 1건 보임
9. 채점 폼(원칙별 점수) + 리포트 반영       → verify: 리포트에 AI/멘토 점수 나란히
10. 프로필 이미지 3종 교체                 → verify: 32px/96px에서 깨짐 없음
11. E2E 시나리오 (§13) 수동 완주
```

**5번이 가장 먼저 검증돼야 한다** — 자동 완료가 남아 있으면 8·9번을 만들어도 멘토가 손대기 전에 회차가 끝나 있어 테스트 자체가 불가능하다.

---

## 13. 완료 기준

**핵심 시나리오 — 이게 통과하면 3-1~3-5가 전부 충족된다:**

- [ ] 로그아웃 상태에서 HOME 진입 → 우상단에 **dim 토글 없음**, 🔔 + 로그인 아이콘 보임
- [ ] 로그인 아이콘 클릭 → 3계정 목록(멘티·멘토·관리자, 각 프로필 이미지) → **멘티** 선택
- [ ] 아이콘이 멘티 썸네일로 바뀌고, 내비에 MY 있음 / ADMIN 없음
- [ ] 멘티로 8페이지 PDF 업로드 → 1단계 완료 → 2단계 요청 제출
- [ ] 모니터링이 "멘토 검토 중"에서 멈춤 — **3분 기다려도 자동 완료되지 않음** ★
- [ ] 아바타 → 계정 전환 → **멘토** 선택
- [ ] 멘토 MY에 방금 그 요청이 "대기"로 보임 → 검증하기
- [ ] 검증 화면에서 **8페이지를 모두 넘겨 볼 수 있음** ★
- [ ] 원칙 10개에 점수 입력 + 코멘트 작성 → 확정 제출
- [ ] 벨에 미읽음 배지, 계정 전환 → **멘티**
- [ ] 알림 "멘토 검증 완료" 도착 → 클릭 → `/my/notifications` 에 목록
- [ ] `/portfolio/report` 진입 가능, **멘토가 실제로 준 점수·코멘트가 표시됨** ★
- [ ] 최종 제출 → 리포트 HTML 다운로드에도 멘토 점수 반영
- [ ] 계정 전환 → **관리자** → 내비에 ADMIN만, MY 없음
- [ ] `/admin` 암호 입력 → 위 회차가 "완료"로, 멘토·멘티가 모두 표시됨
- [ ] 로그아웃 → 아이콘이 로그인 아이콘으로 복귀, MY 빈 상태

**회귀 확인:**

- [ ] 비HOME 탭에서 라이트/다크 토글 정상 동작, 새로고침 후 유지
- [ ] 모바일에서 벨·계정 메뉴 접근 가능 (MobileNav 계정 블록)
- [ ] 키보드만으로 벨 → 팝오버 → 항목 → Esc 복귀
- [ ] 회차 15건 이상에서 쿼터 경고 시 **검증 대기 중인 회차의 페이지는 살아 있음** ★
- [ ] `npm run lint && npm run test && npm run build` 통과
- [ ] Lighthouse 배포본 재측정 — TopNav 증가분이 성능 예산을 넘지 않는지

---

## 14. 명시적 비스코프

이번 Phase에서도 **만들지 않는다:**

- 실제 인증 — 계정 선택은 비밀번호 없는 데모 전환이다. README 보안 고지에 추가한다
- 서버·실시간 동기화 — 계정 전환은 **같은 브라우저의 같은 localStorage** 안에서 일어난다. 다른 기기의 멘토는 이 요청을 볼 수 없다 ([10 §0](10-admin.md) 과 동일한 한계)
- 멘티/멘토 다수 — 각 역할당 1계정. 멘토 배정 로직은 "유일한 멘토에게 배정"이다
- 알림 푸시·이메일 — 인앱 목록만
- 회원가입·프로필 편집
