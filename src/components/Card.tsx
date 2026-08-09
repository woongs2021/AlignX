import type { HTMLAttributes } from 'react';
import styles from './Card.module.css';

type CardVariant = 'default' | 'soft' | 'deep';

type CardProps = HTMLAttributes<HTMLDivElement> & {
  variant?: CardVariant;
};

export function Card({ variant = 'default', className, ...props }: CardProps) {
  const variantClass = variant === 'default' ? '' : styles[variant];
  const classes = [styles.card, variantClass, className].filter(Boolean).join(' ');
  return <div className={classes} {...props} />;
}
