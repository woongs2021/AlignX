import { useContext, useEffect } from 'react';
import { PageMetaContext, type PageMeta } from './pageMetaContext';

/** 페이지 컴포넌트에서 호출 — PageShell의 <title>/<meta>/폭을 이 페이지 값으로 갱신한다. */
export function usePageMeta({ title, description, width }: PageMeta) {
  const setMeta = useContext(PageMetaContext);

  useEffect(() => {
    setMeta?.({ title, description, width });
    return () => setMeta?.({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, description, width]);
}
