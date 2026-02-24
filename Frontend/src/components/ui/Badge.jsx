import { cn } from '../../lib/cn.js';

const VARIANT = {
  neutral: 'ds-badge',
  primary: 'ds-badge ds-badge-primary',
  accent: 'ds-badge ds-badge-accent',
  success: 'ds-badge ds-badge-accent',
  danger: 'ds-badge ds-badge-danger',
};

export default function Badge({ variant = 'neutral', className, ...props }) {
  return (
    <span
      className={cn(
        VARIANT[variant] ?? VARIANT.neutral,
        className,
      )}
      {...props}
    />
  );
}
