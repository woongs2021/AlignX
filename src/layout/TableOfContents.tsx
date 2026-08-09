import { useEffect, useState } from 'react';
import styles from './TableOfContents.module.css';

export type TocItem = { id: string; label: string };

type TableOfContentsProps = {
  items: TocItem[];
};

const SUPPORTS_INTERSECTION_OBSERVER = typeof IntersectionObserver !== 'undefined';

/** 데스크톱(≥1024px) 전용 sticky 목차 — 문서형 페이지(ABOUT, AlignX AI)에서 쓴다. */
export function TableOfContents({ items }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState(items[0]?.id);

  useEffect(() => {
    if (!SUPPORTS_INTERSECTION_OBSERVER) return;
    const elements = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: '-96px 0px -60% 0px', threshold: 0 },
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [items]);

  return (
    <nav className={styles.toc} aria-label="목차">
      <ul className={styles.list}>
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className={[styles.link, activeId === item.id && styles.active]
                .filter(Boolean)
                .join(' ')}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
