import { useNavigate } from 'react-router-dom';
import { Popover } from '@/components/Popover';
import { useAppStore } from '@/store/useAppStore';
import { useCurrentAccount } from '@/features/auth/useSession';
import { formatRelativeTime } from '@/lib/format';
import styles from './NotificationBell.module.css';

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

const MAX_PREVIEW = 5;

/** 알림 벨 — 아바타 왼쪽에 둔다(Plans/14 §1 요구 1). 항목을 누르면 읽음 처리 후
 * MY 하위 "알림" 서브탭으로 이동한다(요구 2). 관리자는 MY가 없어 팝오버에서만 확인한다(Q6). */
export function NotificationBell() {
  const navigate = useNavigate();
  const account = useCurrentAccount();
  const allNotifications = useAppStore((s) => s.notifications);
  const markNotificationRead = useAppStore((s) => s.markNotificationRead);
  const markAllNotificationsRead = useAppStore((s) => s.markAllNotificationsRead);

  const mine = account
    ? allNotifications
        .filter((n) => n.recipientId === account.id)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    : [];
  const unreadCount = mine.filter((n) => !n.readAt).length;
  const preview = mine.slice(0, MAX_PREVIEW);

  return (
    <Popover
      label="알림"
      trigger={({ onClick, isOpen }) => (
        <button
          type="button"
          className={styles.bell}
          onClick={onClick}
          aria-haspopup="menu"
          aria-expanded={isOpen}
          aria-label={unreadCount > 0 ? `알림 ${unreadCount}건` : '알림'}
        >
          <BellIcon />
          {unreadCount > 0 && <span className={styles.badge} aria-hidden="true">{unreadCount > 9 ? '9+' : unreadCount}</span>}
        </button>
      )}
    >
      {(close) => (
        <div className={styles.panelBody}>
          <div className={styles.panelHead}>
            <span>알림</span>
            {account && unreadCount > 0 && (
              <button type="button" className={styles.markAllBtn} onClick={() => markAllNotificationsRead(account.id)}>
                모두 읽음
              </button>
            )}
          </div>

          {!account && <p className={styles.emptyText}>로그인하면 알림을 받을 수 있어요.</p>}
          {account && preview.length === 0 && <p className={styles.emptyText}>아직 알림이 없어요.</p>}

          {preview.map((n) => (
            <button
              key={n.id}
              type="button"
              role="menuitem"
              className={styles.item}
              data-unread={!n.readAt}
              onClick={() => {
                markNotificationRead(n.id);
                close();
                navigate('/my/notifications');
              }}
            >
              {!n.readAt && <span className={styles.dot} aria-hidden="true" />}
              <span className={styles.itemBody}>
                <span className={styles.itemTitle}>{n.title}</span>
                <span className={styles.itemMeta}>{formatRelativeTime(n.createdAt)}</span>
              </span>
            </button>
          ))}

          {account && mine.length > 0 && (
            <button
              type="button"
              className={styles.viewAllBtn}
              onClick={() => {
                close();
                navigate('/my/notifications');
              }}
            >
              전체 보기 →
            </button>
          )}
        </div>
      )}
    </Popover>
  );
}
