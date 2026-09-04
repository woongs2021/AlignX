// 계정별 첫 로그인 시 심는 더미 공지 3건 — 실제 이벤트 알림(멘토 배정·피드백 완료 등)은
// 스토어 액션이 별도로 쌓는다(Phase14 §5.1). 이 시드는 "빈 알림함"을 피하기 위한 장식용이다.
import type { AccountRole } from '@/data/accounts';
import type { NotificationKind } from '@/types';

type SeedNotice = { title: string; body: string };

const NOTICE_BY_ROLE: Record<AccountRole, SeedNotice[]> = {
  mentee: [
    { title: 'AlignX에 오신 것을 환영합니다', body: '포트폴리오를 올리면 AI가 10대 원칙으로 먼저 채점해드립니다.' },
    { title: '멘토 검증은 이렇게 진행돼요', body: 'AI 분석 후 멘토 검증을 요청하면, 배정된 멘토가 직접 원칙별 점수와 코멘트를 남깁니다.' },
    { title: '알림은 여기서 모아 볼 수 있어요', body: '벨 아이콘을 누르거나 MY 탭의 "알림"에서 전체 기록을 확인할 수 있습니다.' },
  ],
  mentor: [
    { title: 'AlignX 멘토 계정입니다', body: '멘티가 검증을 요청하면 MY 탭 검증 요청 큐에 표시됩니다.' },
    { title: '검증 화면 안내', body: '제출된 포트폴리오를 페이지 단위로 넘겨보고, 원칙별 점수와 코멘트를 남길 수 있습니다.' },
    { title: '확정 제출은 되돌릴 수 없어요', body: '피드백을 확정 제출하면 멘티에게 즉시 반영되며 이후 수정할 수 없습니다.' },
  ],
  admin: [
    { title: 'ADMIN 계정입니다', body: '모든 계정의 제출 현황과 진행 상태를 한 화면에서 볼 수 있습니다.' },
    { title: '데모용 접근 통제 안내', body: 'ADMIN 암호는 프론트엔드에 포함되어 실제 접근 통제가 아닙니다.' },
    { title: '샘플 데이터', body: '실제 제출이 없을 때는 샘플 10건으로 화면 동작을 확인할 수 있습니다.' },
  ],
};

export function buildSeedNotifications(
  accountId: string,
  role: AccountRole,
): { recipientId: string; kind: NotificationKind; title: string; body: string; attemptId: string | null }[] {
  return NOTICE_BY_ROLE[role].map((notice) => ({
    recipientId: accountId,
    kind: 'notice' as const,
    title: notice.title,
    body: notice.body,
    attemptId: null,
  }));
}
