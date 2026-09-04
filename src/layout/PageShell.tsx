import { useEffect, useRef, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { useLenis } from 'lenis/react';
import { TopNav } from './TopNav';
import { Footer } from './Footer';
import { ErrorBoundary } from './ErrorBoundary';
import { StorageWarningBanner } from './StorageWarningBanner';
import { PageMetaContext, type PageMeta } from './pageMetaContext';
import styles from './PageShell.module.css';

const DEFAULT_TITLE = 'AlignX — AX 검증 솔루션';

export function PageShell() {
  const location = useLocation();
  const mainRef = useRef<HTMLElement>(null);
  const lastPathname = useRef(location.pathname);
  const [meta, setMeta] = useState<PageMeta>({});
  const lenis = useLenis();

  useEffect(() => {
    document.title = meta.title ?? DEFAULT_TITLE;

    if (!meta.description) return;
    let tag = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!tag) {
      tag = document.createElement('meta');
      tag.name = 'description';
      document.head.appendChild(tag);
    }
    tag.content = meta.description;
  }, [meta.title, meta.description]);

  // Lenis는 콘텐츠 높이를 측정해 스크롤 한계(limit)를 굳히는데, 그 측정이 실제 페이지 높이보다
  // 작게 잡히는 경우가 있다(관찰됨: 라우트 직후엔 정상이던 페이지도 이미지 지연 로딩·모달 등으로
  // 이후 높이가 바뀌면 다시 0 근처로 굳어 휠을 줘도 튕긴다). 라우트 전환 직후 1회성 재측정만으로는
  // 부족해 — main 콘텐츠 크기가 바뀔 때마다 계속 재측정하도록 ResizeObserver로 감시한다.
  useEffect(() => {
    if (!lenis || !mainRef.current) return;
    let raf = 0;
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => lenis.resize());
    });
    observer.observe(mainRef.current);
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [lenis]);

  // 라우트 전환 시 스크롤 top 복귀 + main 포커스 (스크린리더 대응). 최초 로드에는 적용하지 않는다.
  // window.scrollTo를 직접 부르면 Lenis의 내부 스크롤 상태와 어긋나 다음 페이지에서 휠/터치가
  // 먹지 않는다 — 반드시 lenis.scrollTo로 리셋해 내부 상태까지 함께 맞춘다.
  // pathname을 ref로 비교하는 이유: lenis 인스턴스가 마운트 직후 비동기로 undefined→생성되면서
  // 이 effect가 같은 경로에서 한 번 더 재실행되는데, 그때도 포커스를 뺏어가면 최초 로드 시
  // 페이지 안의 autoFocus 요소(예: ADMIN 비밀번호 입력창)에서 포커스가 튕겨 나간다.
  useEffect(() => {
    if (lastPathname.current === location.pathname) return;
    lastPathname.current = location.pathname;

    // 먼저 top으로 리셋 — Lenis의 scrollTo(엘리먼트)는 rect.top에 내부 animatedScroll을 더해
    // 절대 좌표를 구하는데, 리셋 없이 바로 타깃으로 스크롤하면 이전 페이지의 스크롤 위치가
    // 그대로 더해져 엉뚱한 곳으로 튄다(예: /about#team인데 맨 아래 CONTACT 근처로 오버슈트).
    if (lenis) {
      lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }

    let cancelled = false;
    const hash = location.hash;
    if (hash) {
      // 다른 페이지의 섹션 앵커로 넘어온 경우(예: /about#team) — 라우트가 lazy 청크라
      // 타깃 엘리먼트가 이 시점엔 아직 없을 수 있어, 나타날 때까지 rAF로 짧게 재시도한다.
      let attempts = 0;
      const tryScroll = () => {
        if (cancelled) return;
        const target = document.getElementById(hash.slice(1));
        if (target) {
          if (lenis) lenis.scrollTo(target, { immediate: true });
          else target.scrollIntoView();
          return;
        }
        attempts += 1;
        if (attempts < 60) requestAnimationFrame(tryScroll);
      };
      tryScroll();
    }
    // preventScroll 필수 — 없으면 포커스가 main을 뷰포트로 끌어오면서 네이티브 스크롤이
    // 발동해 방금 맞춘 스크롤 위치를 sticky 헤더 높이(64px)만큼 다시 밀어낸다.
    mainRef.current?.focus({ preventScroll: true });

    return () => {
      cancelled = true;
    };
  }, [location.pathname, location.hash, lenis]);

  const widthClass = styles[`width-${meta.width ?? 'default'}`];

  return (
    <div className={styles.shell}>
      <TopNav />
      <StorageWarningBanner />

      <main id="content" tabIndex={-1} ref={mainRef} className={styles.main}>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            className={widthClass}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
          >
            <PageMetaContext.Provider value={setMeta}>
              <ErrorBoundary>
                <Outlet />
              </ErrorBoundary>
            </PageMetaContext.Provider>
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}
