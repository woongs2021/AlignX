import styles from './SectionHeader.module.css';

type SectionHeaderProps = {
  /** 영문 라벨 — 명사 (예: OVERVIEW) */
  eyebrow: string;
  /** 한글 제목 — 문장 */
  title: string;
  className?: string;
};

/** 영문 + 한글 더블 라인 — woongdesignv2.md 시그니처 헤드라인 패턴. */
export function SectionHeader({ eyebrow, title, className }: SectionHeaderProps) {
  const classes = [styles.header, className].filter(Boolean).join(' ');
  return (
    <header className={classes}>
      <p className={`label ${styles.eyebrow}`}>{eyebrow}</p>
      <h2 className={`kr-2 ${styles.title}`}>{title}</h2>
    </header>
  );
}
