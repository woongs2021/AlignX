import type { TextareaHTMLAttributes } from 'react';
import styles from './Field.module.css';

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const classes = [styles.textarea, className].filter(Boolean).join(' ');
  return <textarea className={classes} {...props} />;
}
