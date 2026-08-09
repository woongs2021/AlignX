import { usePageMeta } from '@/layout/usePageMeta';

export function NotFoundPage() {
  usePageMeta({ title: '페이지를 찾을 수 없습니다 — AlignX' });
  return <h1>404 — 페이지를 찾을 수 없습니다</h1>;
}
