import { cn } from '../../lib/cn.js';

export default function Card({ className, interactive = false, ...props }) {
  return (
    <div
      className={cn(
        'ds-card',
        interactive ? 'ds-card-hover' : null,
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }) {
  return <div className={cn('px-6 pt-6', className)} {...props} />;
}

export function CardContent({ className, ...props }) {
  return <div className={cn('px-6 pb-6', className)} {...props} />;
}
