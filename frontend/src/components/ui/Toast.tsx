import { memo } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from 'lucide-react';

import { cn } from '@/lib/utils';
import type { Toast as ToastData } from '@/lib/types';

const icons = {
  success: <CheckCircle className="h-5 w-5 text-emerald-400" />,
  error: <AlertCircle className="h-5 w-5 text-red-400" />,
  warning: <AlertTriangle className="h-5 w-5 text-amber-400" />,
  info: <Info className="h-5 w-5 text-blue-400" />,
};

const toastStyles = {
  success: 'border-emerald-400/20 bg-emerald-400/8',
  error: 'border-red-300/20 bg-red-300/8',
  warning: 'border-amber-300/20 bg-amber-300/8',
  info: 'border-blue-300/20 bg-blue-300/8',
};

type ToastProps = {
  toast: ToastData;
  onPop: (id: string) => void;
};

export const Toast = memo(function Toast({ toast, onPop }: ToastProps) {
  return (
    <div
      className={cn(
        'pointer-events-auto flex items-start gap-3 rounded-2xl border p-4 backdrop-blur-xl transition-all duration-200',
        'animate-fade-in bg-black/70 shadow-[0_20px_50px_rgba(0,0,0,0.28)]',
        toastStyles[toast.type]
      )}
      role="alert"
    >
      <div className="shrink-0 pt-0.5">{icons[toast.type]}</div>

      <div className="min-w-0 flex-1">
        {toast.title ? (
          <h3 className="mb-1 text-xs font-semibold tracking-[0.08em] text-white">
            {toast.title}
          </h3>
        ) : null}
        <p className="text-sm leading-snug font-medium text-zinc-300 font-sans">{toast.message}</p>
      </div>

      <button
        type="button"
        onClick={() => onPop(toast.id)}
        className="shrink-0 rounded-md p-1 text-zinc-500 transition-colors hover:bg-white/10 hover:text-white"
        aria-label="Dismiss notification"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
});
