import { cn } from '../../lib/cn.js';

export default function Textarea({ className, ...props }) {
  return (
    <textarea
      className={cn(
        'ds-textarea',
        className,
      )}
      {...props}
    />
  );
}
