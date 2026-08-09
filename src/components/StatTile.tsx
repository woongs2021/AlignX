import styles from './StatTile.module.css';

type StatTileProps = {
  value: string;
  label: string;
  className?: string;
};

export function StatTile({ value, label, className }: StatTileProps) {
  const classes = [styles.tile, className].filter(Boolean).join(' ');
  return (
    <div className={classes}>
      <div className={styles.value}>{value}</div>
      <div className={styles.label}>{label}</div>
    </div>
  );
}
