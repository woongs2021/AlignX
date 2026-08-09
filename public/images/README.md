# 이미지 교체 규칙

코드는 파일명을 하드코딩하지 않고 `manifest.json` 을 통해서만 이미지를 참조한다.
아래 규칙에 따라 파일을 교체하면 **코드 수정 없이** 화면에 반영된다.

## 교체 방법

1. `Thumbnails/{n}.png` 원본을 같은 파일명으로 덮어쓴다 (예: `03.png`).
2. `npm run assets` 실행 — `public/images/hero/`, `public/images/thumbs/` 산출물이 재생성된다.
3. 새로고침. `manifest.json` 의 `src` 값(`thumbs/03` 등)이 같은 번호를 가리키므로 코드 변경이 필요 없다.

새로운 위치에 이미지를 추가/교체하려면 `manifest.json` 의 `hero` 배열 또는 `thumbs` 맵에
`{ "src": "thumbs/03", "alt": "..." }` 형태의 항목만 수정하면 된다.

## 권장 사양

- 비율: 16:10
- 원본 폭: 2400px 이상
- 최적화 후 개별 파일 목표: 300KB 이하

## 산출물 규칙

- `hero/{n}-{800,1600,2400}.webp` — 반응형 히어로 이미지 (srcset)
- `thumbs/{n}-800.webp` — 페이지 섹션용 썸네일
- `{hero,thumbs}/{n}-blur.webp` — 24px LQIP 플레이스홀더
- 이 산출물들은 `.gitignore` 대상이다. CI는 커밋된 `Thumbnails/` 원본으로부터 `npm run assets` 를 실행해 매번 재생성한다.
