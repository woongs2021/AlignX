import type { ReactNode } from 'react';

type SectionAnchorProps = {
  id: string;
  children: ReactNode;
  className?: string;
};

/** id 부여 + scroll-margin-top(상단바 높이+여백) — TableOfContents/앵커 링크의 점프 대상. */
export function SectionAnchor({ id, children, className }: SectionAnchorProps) {
  return (
    <section id={id} style={{ scrollMarginTop: 88 }} className={className}>
      {children}
    </section>
  );
}
