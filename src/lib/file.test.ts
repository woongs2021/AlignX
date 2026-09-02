import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { MAX_FILE_SIZE, sniffMimeType, validateFile } from './file';

function makeFile(bytes: number[], name: string): File {
  return new File([new Uint8Array(bytes)], name);
}

describe('sniffMimeType', () => {
  it('PDF 매직넘버를 식별한다', async () => {
    const file = makeFile([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34], 'fake.pdf');
    expect(await sniffMimeType(file)).toBe('application/pdf');
  });

  it('PNG 매직넘버를 식별한다', async () => {
    const file = makeFile([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], 'fake.png');
    expect(await sniffMimeType(file)).toBe('image/png');
  });

  it('JPEG 매직넘버를 식별한다', async () => {
    const file = makeFile([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0], 'fake.jpg');
    expect(await sniffMimeType(file)).toBe('image/jpeg');
  });

  it('GIF 매직넘버를 식별한다', async () => {
    const file = makeFile([0x47, 0x49, 0x46, 0x38, 0x39, 0x61], 'fake.gif');
    expect(await sniffMimeType(file)).toBe('image/gif');
  });

  it('확장자만 .pdf로 바꾼 파일은 매직넘버로 걸러낸다', async () => {
    const file = makeFile([0x00, 0x01, 0x02, 0x03, 0, 0, 0, 0], 'disguised.pdf');
    expect(await sniffMimeType(file)).toBeNull();
  });

  it('실제 PDF 샘플 파일의 MIME을 식별한다', async () => {
    const samplePath = join(process.cwd(), 'Portfolio-samples/001_카카오_UX디자인.pdf');
    if (!existsSync(samplePath)) return; // 원본은 gitignore 대상 — CI/클론 직후엔 없을 수 있다.
    const buffer = readFileSync(samplePath);
    const file = new File([buffer], '001.pdf');
    expect(await sniffMimeType(file)).toBe('application/pdf');
  });
});

describe('validateFile', () => {
  it('지원하지 않는 형식이면 실패한다', async () => {
    const file = makeFile([0x00, 0x00, 0x00, 0x00, 0, 0, 0, 0], 'bad.pdf');
    const result = await validateFile(file);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.message).toContain('PDF, PNG, JPEG, GIF');
  });

  it('100MB 초과 시 용량 에러를 반환한다', async () => {
    const bigFile = makeFile([0x25, 0x50, 0x44, 0x46], 'big.pdf');
    Object.defineProperty(bigFile, 'size', { value: MAX_FILE_SIZE + 1 });
    const result = await validateFile(bigFile);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.message).toContain('100MB');
  });

  it('정상 PDF는 통과하고 MIME을 함께 반환한다', async () => {
    const file = makeFile([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34], 'real.pdf');
    const result = await validateFile(file);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.mime).toBe('application/pdf');
  });
});
