import { useId } from 'react';
import styles from './ScaleField.module.css';

const POINTS = [1, 2, 3, 4, 5, 6, 7];

type ScaleFieldProps = {
  legend: string;
  name: string;
  value: number | null;
  onChange: (value: number) => void;
  leftAnchor: string;
  rightAnchor: string;
  error?: string;
};

/**
 * 7점 척도 — 네이티브 radio 그룹이라 좌우 화살표 이동이 기본 제공된다.
 * 커스텀 div로 만들면 이 접근성이 사라진다 (Plans/06-portfolio-step2.md §2.3).
 */
export function ScaleField({ legend, name, value, onChange, leftAnchor, rightAnchor, error }: ScaleFieldProps) {
  const errorId = useId();

  return (
    <fieldset
      className={styles.fieldset}
      aria-invalid={error ? 'true' : undefined}
      aria-describedby={error ? errorId : undefined}
    >
      <legend className={styles.legend}>{legend}</legend>

      <div className={styles.scale} role="radiogroup" aria-label={legend}>
        {POINTS.map((point) => (
          <label
            key={point}
            className={styles.node}
            data-selected={value === point}
            data-reached={value != null && point <= value}
          >
            <input
              type="radio"
              name={name}
              value={point}
              checked={value === point}
              onChange={() => onChange(point)}
              className={styles.radioInput}
              aria-label={`${point}점`}
            />
            <span className={styles.nodeCircle} aria-hidden="true">
              {point}
            </span>
          </label>
        ))}
      </div>

      <div className={styles.anchors}>
        <span>{leftAnchor}</span>
        <span>{rightAnchor}</span>
      </div>

      {error && (
        <p id={errorId} className={styles.error} role="alert">
          {error}
        </p>
      )}
    </fieldset>
  );
}
