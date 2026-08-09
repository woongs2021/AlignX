import { createContext } from 'react';

export type PageWidth = 'default' | 'narrow' | 'full';

export type PageMeta = {
  title?: string;
  description?: string;
  width?: PageWidth;
};

// PageShell은 라우트 전환에도 유지되는 단일 레이아웃 라우트다(TopNav 스크롤 상태를 잃지 않기 위해).
// 개별 페이지가 title/description/width를 알려줄 방법이 필요해 작은 컨텍스트로 역방향 전달한다.
export const PageMetaContext = createContext<((meta: PageMeta) => void) | null>(null);
