import { cn } from '../../lib/cn.js';

export default function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        'ds-input',
        className,
      )}
      {...props}
    />
  );
}
