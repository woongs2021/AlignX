import { lazy, Suspense, type ReactElement } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { useCurrentAccount, useRole } from '@/features/auth/useSession';
import { HISTORY_UNLOCK_THRESHOLD } from '@/data/constants';
import { HomePage } from '@/pages/home/HomePage';
import { PortfolioIntroPage } from '@/pages/portfolio/PortfolioIntroPage';
import { PortfolioLayout } from '@/pages/portfolio/PortfolioLayout';
import { Step1Page } from '@/pages/portfolio/Step1Page';
import { Step2Page } from '@/pages/portfolio/Step2Page';
import { Step3Page } from '@/pages/portfolio/Step3Page';
import { MyPage } from '@/pages/my/MyPage';
import { AdminGate } from '@/pages/admin/AdminGate';
import { isAdminSessionValid } from '@/features/admin/session';
import { NotFoundPage } from '@/pages/not-found/NotFoundPage';
import { StyleguidePage } from '@/pages/styleguide/StyleguidePage';
import { useRouteTheme } from '@/theme/useRouteTheme';
import { PageShell } from '@/layout/PageShell';
import { RouteLoading } from '@/layout/RouteLoading';

// 방문 빈도가 낮거나 무거운 페이지만 라우트 단위로 분할한다 — 초기 번들에서 뺀다 (11 §3.2).
const AlignxPage = lazy(() =>
  import('@/pages/alignx/AlignxPage').then((m) => ({ default: m.AlignxPage })),
);
const AboutPage = lazy(() =>
  import('@/pages/about/AboutPage').then((m) => ({ default: m.AboutPage })),
);
const MyHistoryPage = lazy(() =>
  import('@/pages/my/MyHistoryPage').then((m) => ({ default: m.MyHistoryPage })),
);
const NotificationsPage = lazy(() =>
  import('@/pages/my/NotificationsPage').then((m) => ({ default: m.NotificationsPage })),
);
const MentorReviewPage = lazy(() =>
  import('@/pages/my/mentor/MentorReviewPage').then((m) => ({ default: m.MentorReviewPage })),
);
const AdminPage = lazy(() =>
  import('@/pages/admin/AdminPage').then((m) => ({ default: m.AdminPage })),
);
const AdminFeedbackPage = lazy(() =>
  import('@/pages/admin/AdminFeedbackPage').then((m) => ({ default: m.AdminFeedbackPage })),
);

// 주의: GitHub 저장소명(woongs2021/AlignX)과 반드시 일치 — vite.config.ts 의 base 와 함께 바꾼다.
// import.meta.env.BASE_URL에서 유도하면 한 곳만 고치면 되지만, Vitest는 mergeConfig로 받은
// vite.config.ts의 base를 테스트 환경까지 전달하지 않아(BASE_URL이 항상 '/') 실측으로 확인 후
// 별도 상수로 되돌렸다.
export const BASENAME = '/AlignX';

function ThemeSync() {
  useRouteTheme();
  return null;
}

function RequireAiAnalysis({ children }: { children: ReactElement }) {
  const active = useAppStore((s) => s.attempts[0] ?? null);
  if (!active || active.ai === null) {
    return <Navigate to="/portfolio/analyze" replace />;
  }
  return children;
}

function RequireMentorFeedback({ children }: { children: ReactElement }) {
  const active = useAppStore((s) => s.attempts[0] ?? null);
  if (!active || active.mentorFeedback === null) {
    return <Navigate to="/portfolio/mentor" replace />;
  }
  return children;
}

function RequireHistoryUnlock({ children }: { children: ReactElement }) {
  const attemptCount = useAppStore((s) => s.attempts.length);
  if (attemptCount < HISTORY_UNLOCK_THRESHOLD) {
    return <Navigate to="/my" replace />;
  }
  return children;
}

/** 로그인이 필요한 라우트(현재는 알림함) 전용 가드. 멘토 요청 제출 자체의 로그인 요구는
 * Step2Page 내부에서 처리한다 — 이미 제출된 요청의 모니터링 화면은 로그인 여부와 무관하게
 * 계속 보여야 하기 때문이다(폼만 게이트한다, Plans/14 §3.4 Q3). */
function RequireLogin({ children }: { children: ReactElement }) {
  const account = useCurrentAccount();
  if (!account) return <Navigate to="/portfolio" replace />;
  return children;
}

/** 검증 화면은 멘토 계정 전용이다 — 다른 역할이 접근하면 홈으로 돌려보낸다. */
function RequireMentorRole({ children }: { children: ReactElement }) {
  const role = useRole();
  if (role !== 'mentor') return <Navigate to="/" replace />;
  return children;
}

/** ADMIN 게이트 — 세션이 유효할 때만 children(대시보드/피드백 화면)을 보여준다 (10 §1.3). */
function RequireAdminAuth({ children }: { children: ReactElement }) {
  const unlockedAt = useAppStore((s) => s.admin.unlockedAt);
  if (!isAdminSessionValid(unlockedAt)) {
    return <AdminGate />;
  }
  return children;
}

export function AppRouter() {
  return (
    <BrowserRouter basename={BASENAME}>
      <ThemeSync />
      <Suspense fallback={<RouteLoading />}>
        <Routes>
          <Route element={<PageShell />}>
            <Route path="/" element={<HomePage />} />

            <Route path="/portfolio">
              <Route index element={<PortfolioIntroPage />} />
              <Route element={<PortfolioLayout />}>
                <Route path="analyze" element={<Step1Page />} />
                <Route
                  path="mentor"
                  element={
                    <RequireAiAnalysis>
                      <Step2Page />
                    </RequireAiAnalysis>
                  }
                />
                <Route
                  path="report"
                  element={
                    <RequireMentorFeedback>
                      <Step3Page />
                    </RequireMentorFeedback>
                  }
                />
              </Route>
            </Route>

            <Route path="/alignx" element={<AlignxPage />} />

            <Route path="/my" element={<MyPage />} />
            <Route
              path="/my/history"
              element={
                <RequireHistoryUnlock>
                  <MyHistoryPage />
                </RequireHistoryUnlock>
              }
            />
            <Route
              path="/my/notifications"
              element={
                <RequireLogin>
                  <NotificationsPage />
                </RequireLogin>
              }
            />
            <Route
              path="/my/review/:id"
              element={
                <RequireMentorRole>
                  <MentorReviewPage />
                </RequireMentorRole>
              }
            />

            <Route path="/about" element={<AboutPage />} />
            <Route
              path="/admin"
              element={
                <RequireAdminAuth>
                  <AdminPage />
                </RequireAdminAuth>
              }
            />
            <Route
              path="/admin/submissions/:id"
              element={
                <RequireAdminAuth>
                  <AdminFeedbackPage />
                </RequireAdminAuth>
              }
            />

            <Route path="*" element={<NotFoundPage />} />
          </Route>

          {import.meta.env.DEV && <Route path="/__styleguide" element={<StyleguidePage />} />}
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
