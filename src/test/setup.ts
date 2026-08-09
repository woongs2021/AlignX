import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import '@testing-library/jest-dom/vitest';

// getThumb/getAllHero(src/lib/images.ts)가 fetch(`${BASE_URL}images/manifest.json`)로 읽는 실제
// 파일을 그대로 서빙한다 — jsdom엔 페이지 origin이 없어 상대 URL fetch가 애초에 안 되고, 테스트에
// 진짜 dev 서버도 없으므로 네트워크 자체를 흉내낼 필요는 없다. 실 파일을 읽어주면 내용도 항상 맞다.
// (import.meta.url은 vitest의 변환을 거쳐 file:// URL이 아닐 수 있어 process.cwd() 기준으로 찾는다 —
// vitest 실행 CWD는 항상 프로젝트 루트다.)
const manifestPath = join(process.cwd(), 'public/images/manifest.json');
const manifestJson = readFileSync(manifestPath, 'utf-8');
const originalFetch = globalThis.fetch?.bind(globalThis);

globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
  if (url.includes('manifest.json')) {
    return new Response(manifestJson, { status: 200, headers: { 'Content-Type': 'application/json' } });
  }
  if (originalFetch) return originalFetch(input, init);
  throw new Error(`Unmocked fetch in test: ${url}`);
}) as typeof fetch;

// jsdom은 matchMedia를 구현하지 않는다 — 다크모드/reduced-motion을 쓰는 코드가 전부 이걸 필요로 한다.
// 기본값은 "매치 안 됨"(matches: false)이라 라이트 모드·모션 허용 상태로 테스트가 실행된다.
if (typeof window.matchMedia !== 'function') {
  window.matchMedia = (query: string): MediaQueryList =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList;
}

// jsdom은 scrollTo()도 구현하지 않고 "Not implemented" 콘솔 에러를 낸다 — PageShell의 라우트 전환
// 스크롤 복귀 코드가 이걸 호출한다. 테스트에서 스크롤 자체는 검증 대상이 아니므로 no-op으로 둔다.
window.scrollTo = () => {};
