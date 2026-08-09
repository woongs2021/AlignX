import styles from './ToggleGroup.module.css';

type ToggleGroupOption<T extends string> = { value: T; label: string };

type ToggleGroupProps<T extends string> = {
  ariaLabel: string;
  options: ToggleGroupOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** 활성 상태 색 — 페이지 톤에 맞춰 고른다. 기본은 --primary 단색 채움. */
  activeVariant?: 'solid' | 'soft' | 'deep';
  className?: string;
};

/** 정렬·필터용 pill 토글 그룹 — MY/ADMIN/리포트 화면이 각자 만들던 동일 패턴을 하나로 모았다. */
export function ToggleGroup<T extends string>({
  ariaLabel,
  options,
  value,
  onChange,
  activeVariant = 'solid',
  className,
}: ToggleGroupProps<T>) {
  const classes = [styles.group, className].filter(Boolean).join(' ');

  return (
    <div className={classes} role="group" aria-label={ariaLabel}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={styles.button}
          data-active-variant={activeVariant}
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
