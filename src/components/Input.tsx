import type { InputHTMLAttributes } from 'react';
import styles from './Field.module.css';

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  const classes = [styles.input, className].filter(Boolean).join(' ');
  return <input className={classes} {...props} />;
}
