import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  isQuotaExceededError,
  STORAGE_FULL_MESSAGE,
  useAppStore,
  useStorageWarningStore,
} from './useAppStore';
import type { Attempt } from '@/types';

const sampleFile: Attempt['file'] = {
  name: 'sample.pdf',
  mime: 'application/pdf',
  size: 1024,
  previewDataUrl: 'data:image/jpeg;base64,AAAA',
};

beforeEach(() => {
  localStorage.clear();
  useAppStore.getState().resetAll();
  useStorageWarningStore.setState({ message: null });
});

describe('isQuotaExceededError', () => {
  it('QuotaExceededError DOMException을 식별한다', () => {
    expect(isQuotaExceededError(new DOMException('full', 'QuotaExceededError'))).toBe(true);
  });

  it('다른 에러는 식별하지 않는다', () => {
    expect(isQuotaExceededError(new Error('other'))).toBe(false);
  });
});

describe('createAttempt', () => {
  it('회차를 생성하고 새로고침 후에도 상태가 복원된다', async () => {
    const id = useAppStore.getState().createAttempt(sampleFile);
    expect(useAppStore.getState().attempts[0].id).toBe(id);

    const raw = localStorage.getItem('alignx.v1');
    expect(raw).toBeTruthy();
    expect(JSON.parse(raw!).state.attempts[0].id).toBe(id);

    // "새로고침" 시뮬레이션 — 모듈을 새로 로드해 같은 localStorage에서 재수화한다.
    vi.resetModules();
    const { useAppStore: rehydratedStore } = await import('./useAppStore');
    await new Promise<void>((resolve) => {
      if (rehydratedStore.persist.hasHydrated()) {
        resolve();
        return;
      }
      const unsubscribe = rehydratedStore.persist.onFinishHydration(() => {
        unsubscribe();
        resolve();
      });
    });

    expect(rehydratedStore.getState().attempts[0]?.id).toBe(id);
  });

  it('localStorage가 깨진 JSON이어도 크래시하지 않고 초기 상태로 시작한다', async () => {
    localStorage.setItem('alignx.v1', '{잘못된 JSON{{{');

    vi.resetModules();
    const { useAppStore: rehydratedStore } = await import('./useAppStore');
    await new Promise<void>((resolve) => {
      if (rehydratedStore.persist.hasHydrated()) {
        resolve();
        return;
      }
      const unsubscribe = rehydratedStore.persist.onFinishHydration(() => {
        unsubscribe();
        resolve();
      });
    });

    expect(rehydratedStore.getState().attempts).toEqual([]);
    expect(rehydratedStore.getState().version).toBe(1);
  });

  it('21번째 회차 생성 시 가장 오래된 회차의 프리뷰만 제거된다', () => {
    const ids: string[] = [];
    for (let i = 0; i < 21; i += 1) {
      ids.push(useAppStore.getState().createAttempt(sampleFile));
    }

    const attempts = useAppStore.getState().attempts;
    expect(attempts).toHaveLength(21);

    const oldest = attempts[attempts.length - 1];
    expect(oldest.id).toBe(ids[0]);
    expect(oldest.file.previewDataUrl).toBe('');

    expect(attempts[0].file.previewDataUrl).toBe(sampleFile.previewDataUrl);
  });
});

describe('deleteAttempt', () => {
  it('id가 일치하는 회차만 제거한다', () => {
    const idA = useAppStore.getState().createAttempt(sampleFile);
    const idB = useAppStore.getState().createAttempt(sampleFile);

    useAppStore.getState().deleteAttempt(idA);

    const attempts = useAppStore.getState().attempts;
    expect(attempts).toHaveLength(1);
    expect(attempts[0].id).toBe(idB);
  });

  it('존재하지 않는 id를 삭제해도 에러 없이 무시한다', () => {
    useAppStore.getState().createAttempt(sampleFile);
    expect(() => useAppStore.getState().deleteAttempt('atmp_없음')).not.toThrow();
    expect(useAppStore.getState().attempts).toHaveLength(1);
  });
});

describe('localStorage 용량 가드', () => {
  it('QuotaExceededError 발생 시 프리뷰를 비우고 1회 재시도해 성공하면 경고를 띄우지 않는다', () => {
    useAppStore.getState().createAttempt(sampleFile);

    const original = Storage.prototype.setItem.bind(localStorage);
    let calls = 0;
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation((key, value) => {
      calls += 1;
      if (calls === 1) {
        throw new DOMException('quota', 'QuotaExceededError');
      }
      original(key, value);
    });

    useAppStore.getState().createAttempt(sampleFile);

    expect(calls).toBeGreaterThanOrEqual(2);
    expect(useStorageWarningStore.getState().message).toBeNull();

    const parsed = JSON.parse(localStorage.getItem('alignx.v1')!);
    expect(
      parsed.state.attempts.every((a: Attempt) => a.file.previewDataUrl === ''),
    ).toBe(true);

    spy.mockRestore();
  });

  it('재시도도 실패하면 사용자 안내 메시지를 저장한다', () => {
    useAppStore.getState().createAttempt(sampleFile);

    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('quota', 'QuotaExceededError');
    });

    useAppStore.getState().createAttempt(sampleFile);

    expect(useStorageWarningStore.getState().message).toBe(STORAGE_FULL_MESSAGE);

    spy.mockRestore();
  });
});
