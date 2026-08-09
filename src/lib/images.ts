// 이미지 참조 레이어 — 컴포넌트는 파일 경로를 직접 쓰지 않고 이 모듈을 통해서만 이미지를 참조한다.
// public/images/manifest.json 의 항목만 교체하면 코드 수정 없이 화면에 반영된다.

export type ThumbEntry = { src: string; alt: string };
export type HeroEntry = { src: string; alt: string; ratio: string };
export type ImageManifest = { hero: HeroEntry[]; thumbs: Record<string, ThumbEntry> };

export type ResolvedImage = {
  src: string;
  srcSet: string;
  blurSrc: string;
  alt: string;
};

const THUMB_WIDTH = 800;

let manifestPromise: Promise<ImageManifest> | null = null;

function imagesUrl(path: string): string {
  return `${import.meta.env.BASE_URL}images/${path}`;
}

export function loadImageManifest(): Promise<ImageManifest> {
  manifestPromise ??= fetch(imagesUrl('manifest.json')).then((res) => {
    if (!res.ok) throw new Error(`이미지 매니페스트 로드 실패: ${res.status}`);
    return res.json() as Promise<ImageManifest>;
  });
  return manifestPromise;
}

export async function getThumb(key: string): Promise<ResolvedImage | null> {
  const manifest = await loadImageManifest();
  const entry = manifest.thumbs[key];
  if (!entry) return null;
  return {
    src: imagesUrl(`${entry.src}-${THUMB_WIDTH}.webp`),
    srcSet: `${imagesUrl(`${entry.src}-${THUMB_WIDTH}.webp`)} ${THUMB_WIDTH}w`,
    blurSrc: imagesUrl(`${entry.src}-blur.webp`),
    alt: entry.alt,
  };
}


// 마퀴 전용 — 2400 사이즈는 쓰지 않는다 (01 §3.5, 04 §2.3 성능 가드).
const MARQUEE_WIDTHS = [800, 1600];

export async function getAllHero(): Promise<ResolvedImage[]> {
  const manifest = await loadImageManifest();
  return manifest.hero.map((entry) => ({
    src: imagesUrl(`${entry.src}-${MARQUEE_WIDTHS[0]}.webp`),
    srcSet: MARQUEE_WIDTHS.map((w) => `${imagesUrl(`${entry.src}-${w}.webp`)} ${w}w`).join(', '),
    blurSrc: imagesUrl(`${entry.src}-blur.webp`),
    alt: entry.alt,
  }));
}
