import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePageMeta } from '@/layout/usePageMeta';
import { SectionHeader } from '@/components/SectionHeader';
import { useAppStore } from '@/store/useAppStore';
import { useCurrentAccount } from '@/features/auth/useSession';
import { formatRelativeTime } from '@/lib/format';
import styles from './NotificationsPage.module.css';

/** MY 하위 "알림" 서브탭 — 벨 팝오버에서 항목을 누르면 여기로 온다(Plans/14 §5.3, 요구 2).
 * 관리자는 MY 탭 자체가 없지만(§3.5) 계정 메뉴의 "알림"으로는 이 페이지에 올 수 있다. */
export function NotificationsPage() {
  usePageMeta({ title: '알림 — AlignX' });
  const navigate = useNavigate();
  const account = useCurrentAccount();
  const notifications = useAppStore((s) => s.notifications);
  const markNotificationRead = useAppStore((s) => s.markNotificationRead);

  const mine = useMemo(
    () =>
      account
        ? notifications
            .filter((n) => n.recipientId === account.id)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        : [],
    [notifications, account],
  );

  const backTo = account?.role === 'admin' ? '/admin' : '/my';
  const backLabel = account?.role === 'admin' ? '← ADMIN으로 돌아가기' : '← MY로 돌아가기';

  function handleOpen(id: string, attemptId: string | null) {
    markNotificationRead(id);
    if (!attemptId) return;
    if (account?.role === 'admin') navigate(`/admin/submissions/${attemptId}`);
    else if (account?.role === 'mentor') navigate(`/my/review/${attemptId}`);
    else navigate(`/my?attempt=${attemptId}`);
  }

  return (
    <div className={`container-narrow ${styles.page}`}>
      <button type="button" className={styles.backLink} onClick={() => navigate(backTo)}>
        {backLabel}
      </button>

      <SectionHeader eyebrow="MY · NOTIFICATIONS" title="알림" />

      {mine.length === 0 && <p className="meta">아직 알림이 없습니다.</p>}

      <ul className={styles.list}>
        {mine.map((n) => (
          <li key={n.id}>
            <button
              type="button"
              className={styles.item}
              data-unread={!n.readAt}
              onClick={() => handleOpen(n.id, n.attemptId)}
            >
              <span className={styles.itemHead}>
                <span className={styles.itemTitle}>{n.title}</span>
                <span className="meta">{formatRelativeTime(n.createdAt)}</span>
              </span>
              <p className={styles.itemBody}>{n.body}</p>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
