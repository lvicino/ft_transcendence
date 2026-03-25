import type { ComponentPropsWithRef } from 'react';

import { cn } from '../../lib/utils';

type AlertVariant = 'default' | 'success' | 'error' | 'warning' | 'info';

const variantClasses: Record<AlertVariant, string> = {
  default: 'border-white/15 bg-white/5 text-white/90',
  success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-100',
  error: 'border-red-500/30 bg-red-500/10 text-red-100',
  warning: 'border-amber-500/30 bg-amber-500/10 text-amber-100',
  info: 'border-blue-500/30 bg-blue-500/10 text-blue-100',
};

export type AlertProps = ComponentPropsWithRef<'div'> & {
  variant?: AlertVariant;
};

export function Alert({ className, variant = 'default', ...props }: AlertProps) {
  return (
    <div
      role="alert"
      className={cn(
        'rounded-xl border px-4 py-3 text-sm text-white/90 backdrop-blur-md shadow-[0_8px_24px_rgba(0,0,0,0.18)]',
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
}
