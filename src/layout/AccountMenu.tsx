import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Popover } from '@/components/Popover';
import { Avatar } from '@/components/Avatar';
import { Badge } from '@/components/Badge';
import { ACCOUNTS } from '@/data/accounts';
import { useCurrentAccount, useMentorRequestCounts } from '@/features/auth/useSession';
import { useAppStore } from '@/store/useAppStore';
import styles from './AccountMenu.module.css';

function LoginIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

const ROLE_LABEL: Record<string, string> = { mentee: '멘티', mentor: '멘토', admin: '관리자' };

/** 로그아웃 상태 = 로그인 아이콘, 로그인 상태 = 계정 썸네일(요구 3). 클릭하면 하단에 팝업 —
 * 로그아웃 상태에선 3계정 목록, 로그인 상태에선 "계정 전환·알림·로그아웃" 메뉴(요구 3-2). */
export function AccountMenu() {
  const navigate = useNavigate();
  const account = useCurrentAccount();
  const login = useAppStore((s) => s.login);
  const logout = useAppStore((s) => s.logout);
  const [switching, setSwitching] = useState(false);
  const requestCounts = useMentorRequestCounts();

  return (
    <Popover
      label={account ? `${account.name} 계정 메뉴` : '로그인'}
      trigger={({ onClick, isOpen }) =>
        account ? (
          <button type="button" className={styles.avatarTrigger} onClick={onClick} aria-haspopup="menu" aria-expanded={isOpen} aria-label={`${account.name} 계정 메뉴`}>
            <Avatar src={account.avatarSrc} initial={account.initial} alt="" size={32} />
          </button>
        ) : (
          <button type="button" className={styles.loginTrigger} onClick={onClick} aria-haspopup="menu" aria-expanded={isOpen} aria-label="로그인">
            <LoginIcon />
          </button>
        )
      }
    >
      {(close) => {
        if (!account) {
          return (
            <div className={styles.panelBody}>
              <p className={styles.panelHead}>데모 계정으로 로그인</p>
              {ACCOUNTS.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  role="menuitem"
                  className={styles.accountRow}
                  onClick={() => {
                    login(a.id);
                    close();
                    navigate('/');
                  }}
                >
                  <Avatar src={a.avatarSrc} initial={a.initial} alt="" size={32} />
                  <span className={styles.accountRowText}>
                    <span className={styles.accountRowName}>{a.name}</span>
                    <span className={styles.accountRowRole}>{ROLE_LABEL[a.role]} · {a.title}</span>
                  </span>
                </button>
              ))}
            </div>
          );
        }

        if (switching) {
          return (
            <div className={styles.panelBody}>
              <button type="button" className={styles.backBtn} onClick={() => setSwitching(false)}>
                ← 뒤로
              </button>
              {ACCOUNTS.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  role="menuitem"
                  className={styles.accountRow}
                  aria-current={a.id === account.id ? 'true' : undefined}
                  onClick={() => {
                    login(a.id);
                    setSwitching(false);
                    close();
                    navigate('/');
                  }}
                >
                  <Avatar src={a.avatarSrc} initial={a.initial} alt="" size={32} />
                  <span className={styles.accountRowText}>
                    <span className={styles.accountRowName}>
                      {a.name} {a.id === account.id && '(현재)'}
                    </span>
                    <span className={styles.accountRowRole}>{ROLE_LABEL[a.role]}</span>
                  </span>
                </button>
              ))}
            </div>
          );
        }

        return (
          <div className={styles.panelBody}>
            <div className={styles.accountRow}>
              <Avatar src={account.avatarSrc} initial={account.initial} alt="" size={32} />
              <span className={styles.accountRowText}>
                <span className={styles.accountRowName}>{account.name}</span>
                <span className={styles.accountRowRole}>{ROLE_LABEL[account.role]} · {account.title}</span>
              </span>
              <Badge variant={requestCounts[account.id] > 0 ? 'warning' : 'outline'}>
                {requestCounts[account.id]}건
              </Badge>
            </div>
            <button type="button" role="menuitem" className={styles.menuItemBtn} onClick={() => setSwitching(true)}>
              계정 전환
            </button>
            <button
              type="button"
              role="menuitem"
              className={styles.menuItemBtn}
              onClick={() => {
                close();
                navigate('/my/notifications');
              }}
            >
              알림
            </button>
            <button
              type="button"
              role="menuitem"
              className={styles.menuItemBtn}
              onClick={() => {
                logout();
                close();
              }}
            >
              로그아웃
            </button>
          </div>
        );
      }}
    </Popover>
  );
}
