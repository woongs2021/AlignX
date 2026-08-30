import { useEffect, useRef, useState, type FormEvent } from 'react';
import { SectionHeader } from '@/components/SectionHeader';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { useAppStore } from '@/store/useAppStore';
import { ADMIN_PASSWORD, ADMIN_MAX_ATTEMPTS, ADMIN_LOCKOUT_MS } from '@/data/constants';
import styles from './AdminGate.module.css';

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a19.4 19.4 0 0 1 5.06-5.94M9.9 4.24A10.6 10.6 0 0 1 12 4c7 0 11 8 11 8a19.5 19.5 0 0 1-2.41 3.63M14.12 14.12a3 3 0 1 1-4.24-4.24" />
      <path d="M1 1l22 22" />
    </svg>
  );
}

/** ADMIN 암호 게이트 — 다른 탭과 동일한 페이지 레이아웃(SectionHeader + Card)을 쓴다.
 * 이 화면은 데모용 구분 장치일 뿐 실제 접근 통제가 아니다(Plans/10-admin.md §0). */
export function AdminGate() {
  const unlockAdmin = useAppStore((s) => s.unlockAdmin);
  const [password, setPassword] = useState('');
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState(false);
  const [failCount, setFailCount] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [remaining, setRemaining] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const pendingSelection = useRef<{ start: number; end: number } | null>(null);

  useEffect(() => {
    const input = inputRef.current;
    const sel = pendingSelection.current;
    if (input && sel) {
      try {
        input.setSelectionRange(sel.start, sel.end);
      } catch {
        // 일부 브라우저는 type=password에서 선택 범위 설정을 막는다 — 무시하고 포커스만 준다.
      }
      input.focus();
      pendingSelection.current = null;
    }
  }, [visible]);

  useEffect(() => {
    if (lockedUntil === null) return;
    const tick = () => setRemaining(Math.max(0, Math.ceil((lockedUntil - Date.now()) / 1000)));
    tick();
    const interval = window.setInterval(tick, 1000);
    const timeout = window.setTimeout(() => setLockedUntil(null), ADMIN_LOCKOUT_MS);
    return () => {
      window.clearInterval(interval);
      window.clearTimeout(timeout);
    };
  }, [lockedUntil]);

  const isLocked = lockedUntil !== null && remaining > 0;

  function toggleVisible() {
    const input = inputRef.current;
    if (input) {
      // Chrome은 type=password인 input에서 selectionStart/End 접근 자체를 던진다 — 커서 위치를
      // 못 읽으면 끝으로 보내는 정도로 성능 저하 없이 안전하게 폴백한다.
      try {
        pendingSelection.current = {
          start: input.selectionStart ?? password.length,
          end: input.selectionEnd ?? password.length,
        };
      } catch {
        pendingSelection.current = { start: password.length, end: password.length };
      }
    }
    setVisible((v) => !v);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isLocked) return;

    if (password === ADMIN_PASSWORD) {
      unlockAdmin();
      return;
    }

    setError(true);
    const nextFailCount = failCount + 1;
    if (nextFailCount >= ADMIN_MAX_ATTEMPTS) {
      setFailCount(0);
      setLockedUntil(Date.now() + ADMIN_LOCKOUT_MS);
    } else {
      setFailCount(nextFailCount);
    }
  }

  return (
    <div className={`container ${styles.page}`}>
      <SectionHeader eyebrow="ADMIN" title="관리자 인증" />

      <Card className={styles.card}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <p className={styles.hint}>관리자 비밀번호를 입력해주세요.</p>
          <div className={styles.fieldRow}>
            <input
              ref={inputRef}
              id="admin-password"
              type={visible ? 'text' : 'password'}
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setError(false);
              }}
              disabled={isLocked}
              aria-invalid={error ? 'true' : undefined}
              aria-label="암호"
              placeholder="비밀번호를 입력해주세요"
              autoComplete="off"
              autoFocus
              className={styles.input}
            />
            <button
              type="button"
              className={styles.eyeButton}
              onClick={toggleVisible}
              aria-pressed={visible}
              aria-label={visible ? '비밀번호 숨기기' : '비밀번호 표시'}
            >
              {visible ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>

          <Button type="submit" variant="primary" disabled={isLocked} className={styles.submit}>
            확인
          </Button>

          <p role="alert" aria-live="polite" className={styles.status}>
            {isLocked
              ? `너무 여러 번 틀렸습니다. ${remaining}초 후 다시 시도해주세요.`
              : error
                ? '비밀번호가 올바르지 않습니다.'
                : ''}
          </p>
        </form>
      </Card>

      <p className={styles.notice}>이 화면은 데모용 구분 장치입니다. 실제 접근 통제가 아닙니다.</p>
    </div>
  );
}
