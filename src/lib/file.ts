// 업로드 파일 검증 — 확장자가 아닌 MIME + 매직 넘버로 판별한다 (05 §3.2).
// 확장자만 믿으면 .pdf로 이름만 바꾼 파일에서 파싱이 터진다.

export const ACCEPTED_MIME_TYPES = ['application/pdf', 'image/png', 'image/jpeg', 'image/gif'] as const;
export type AcceptedMimeType = (typeof ACCEPTED_MIME_TYPES)[number];

export const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

const MAGIC_NUMBERS: { mime: AcceptedMimeType; bytes: number[] }[] = [
  { mime: 'application/pdf', bytes: [0x25, 0x50, 0x44, 0x46] }, // %PDF
  { mime: 'image/png', bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] },
  { mime: 'image/jpeg', bytes: [0xff, 0xd8, 0xff] },
  { mime: 'image/gif', bytes: [0x47, 0x49, 0x46, 0x38] }, // GIF8(7a|9a)
];

export async function sniffMimeType(file: File): Promise<AcceptedMimeType | null> {
  const head = new Uint8Array(await file.slice(0, 8).arrayBuffer());
  for (const { mime, bytes } of MAGIC_NUMBERS) {
    if (bytes.every((b, i) => head[i] === b)) return mime;
  }
  return null;
}

export type FileValidationResult = { ok: true; mime: AcceptedMimeType } | { ok: false; message: string };

export const VALIDATION_MESSAGES = {
  unsupportedType: 'PDF, PNG, JPEG, GIF 파일만 분석할 수 있습니다.',
  tooLarge: '파일이 너무 큽니다. 100MB 이하로 줄여주세요.',
  multipleFiles: '한 번에 한 개 파일만 분석합니다.',
  corrupted: '파일을 열 수 없습니다. 손상되었는지 확인해주세요.',
} as const;

/** MIME/매직넘버/용량만 검사한다. "실제 열림" 검증은 프리뷰 생성(src/lib/pdf.ts)이 겸한다. */
export async function validateFile(file: File): Promise<FileValidationResult> {
  if (file.size > MAX_FILE_SIZE) {
    return { ok: false, message: VALIDATION_MESSAGES.tooLarge };
  }
  const mime = await sniffMimeType(file);
  if (!mime) {
    return { ok: false, message: VALIDATION_MESSAGES.unsupportedType };
  }
  return { ok: true, mime };
}
