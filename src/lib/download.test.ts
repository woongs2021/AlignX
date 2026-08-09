import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { downloadHtmlFile } from './download';

// jsdom은 URL.createObjectURL/revokeObjectURL을 구현하지 않는다.
beforeEach(() => {
  URL.createObjectURL = vi.fn(() => 'blob:mock-url');
  URL.revokeObjectURL = vi.fn();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('downloadHtmlFile', () => {
  it('Blob URL을 만들고, 앵커를 클릭시킨 뒤, URL을 해제한다', () => {
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    downloadHtmlFile('<p>hi</p>', 'report.html');

    expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
    const blob = (URL.createObjectURL as ReturnType<typeof vi.fn>).mock.calls[0][0] as Blob;
    expect(blob.type).toBe('text/html;charset=utf-8');
    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');

    clickSpy.mockRestore();
  });

  it('클릭 후 앵커를 DOM에 남기지 않는다', () => {
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    downloadHtmlFile('<p>hi</p>', 'report.html');
    expect(document.querySelector('a[download="report.html"]')).toBeNull();
  });
});
