import { useEffect, useState } from 'react';

/** 탭이 비활성(백그라운드)일 때 애니메이션을 정지시키기 위한 document.visibilityState 감시. */
export function useDocumentVisibility(): boolean {
  const [visible, setVisible] = useState(() =>
    typeof document === 'undefined' ? true : document.visibilityState === 'visible',
  );

  useEffect(() => {
    function onChange() {
      setVisible(document.visibilityState === 'visible');
    }
    document.addEventListener('visibilitychange', onChange);
    return () => document.removeEventListener('visibilitychange', onChange);
  }, []);

  return visible;
}
