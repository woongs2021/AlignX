import { useEffect, useRef, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { TopNav } from './TopNav';
import { Footer } from './Footer';
import { ErrorBoundary } from './ErrorBoundary';
import { StorageWarningBanner } from './StorageWarningBanner';
import { PageMetaContext, type PageMeta } from './pageMetaContext';
import styles from './PageShell.module.css';

const DEFAULT_TITLE = 'AlignX — 포트폴리오 분석';

export function PageShell() {
  const location = useLocation();
  const mainRef = useRef<HTMLElement>(null);
  const isFirstRender = useRef(true);
  const [meta, setMeta] = useState<PageMeta>({});

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

  // 라우트 전환 시 스크롤 top 복귀 + main 포커스 (스크린리더 대응). 최초 로드에는 적용하지 않는다.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    window.scrollTo(0, 0);
    mainRef.current?.focus();
  }, [location.pathname]);

  const widthClass = styles[`width-${meta.width ?? 'default'}`];

  return (
    <div className={styles.shell}>
      <a href="#content" className={styles.skipLink}>
        본문 바로가기
      </a>

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
