import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Badge, StatusDotBadge } from '@/components/Badge';
import { StatTile } from '@/components/StatTile';
import { ProgressBar } from '@/components/ProgressBar';
import { Input } from '@/components/Input';
import { Textarea } from '@/components/Textarea';
import { SectionHeader } from '@/components/SectionHeader';
import { ThemeToggle } from '@/components/ThemeToggle';
import type { ThemeName } from '@/theme/routeTheme';
import styles from './StyleguidePage.module.css';

const THEMES: ThemeName[] = ['cool', 'mint', 'warm', 'violet'];
const MODES = ['light', 'dark'] as const;

function ComboPanel({ theme, mode }: { theme: ThemeName; mode: 'light' | 'dark' }) {
  return (
    <div className={styles.panel} data-theme={theme} data-mode={mode}>
      <p className={styles.panelLabel}>
        {theme} / {mode}
      </p>

      <SectionHeader eyebrow="OVERVIEW" title="토큰 소비 검증" />

      <div className={styles.row}>
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="link">Link</Button>
      </div>

      <div className={styles.row}>
        <Badge variant="outline">Outline</Badge>
        <Badge variant="tone">Tone</Badge>
        <Badge variant="warning">Warning</Badge>
        <StatusDotBadge status="active" label="진행" />
        <StatusDotBadge status="done" label="완료" />
        <StatusDotBadge status="pending" label="대기" />
      </div>

      <div className={styles.cards}>
        <Card>기본 카드</Card>
        <Card variant="soft">Soft 카드</Card>
        <Card variant="deep">Deep 카드</Card>
      </div>

      <StatTile value="87" label="총점" />
      <ProgressBar value={62} label="진행률" />
      <Input placeholder="입력 필드" />
      <Textarea placeholder="여러 줄 입력" />
    </div>
  );
}

/** 개발 전용 — 4톤 × 라이트/다크 8조합을 한 화면에서 육안 대조한다 (Plans/02-design-tokens.md §7). */
export function StyleguidePage() {
  return (
    <div className={styles.page}>
      <div className={styles.row}>
        <h1>Styleguide</h1>
        <ThemeToggle />
      </div>
      <p>dev 전용 라우트 — 프로덕션 빌드에는 포함되지 않는다.</p>

      <div className={styles.grid}>
        {THEMES.flatMap((theme) =>
          MODES.map((mode) => <ComboPanel key={`${theme}-${mode}`} theme={theme} mode={mode} />),
        )}
      </div>
    </div>
  );
}
