import { cn } from '../../lib/cn.js';

const VARIANT = {
  primary: 'ds-btn-primary',
  secondary: 'ds-btn-secondary',
  ghost: 'ds-btn-ghost',
  danger: 'ds-btn-danger',
};

const SIZE = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-11 px-5 text-sm',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  className,
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      className={cn(
        'ds-btn',
        VARIANT[variant] ?? VARIANT.primary,
        SIZE[size] ?? SIZE.md,
        className,
      )}
      {...props}
    />
  );
}
