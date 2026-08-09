import type { HTMLAttributes } from 'react';
import styles from './Badge.module.css';

type BadgeVariant = 'outline' | 'tone' | 'warning';
type DotStatus = 'pending' | 'active' | 'done';

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

export function Badge({ variant = 'outline', className, children, ...props }: BadgeProps) {
  const classes = [styles.badge, styles[variant], className].filter(Boolean).join(' ');
  return (
    <span className={classes} {...props}>
      {children}
    </span>
  );
}

type StatusDotProps = HTMLAttributes<HTMLSpanElement> & {
  status: DotStatus;
  label: string;
};

const DOT_CLASS: Record<DotStatus, string> = {
  pending: styles.dot,
  active: `${styles.dot} ${styles.dotActive}`,
  done: `${styles.dot} ${styles.dotDone}`,
};

export function StatusDotBadge({ status, label, className, ...props }: StatusDotProps) {
  const classes = [styles.badge, styles.outline, className].filter(Boolean).join(' ');
  return (
    <span className={classes} {...props}>
      <span className={DOT_CLASS[status]} aria-hidden="true" />
      {label}
    </span>
  );
}
