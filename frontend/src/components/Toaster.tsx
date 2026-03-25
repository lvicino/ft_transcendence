import { createPortal } from 'react-dom';

import { useToast } from '@/store'; 
import { Toast } from '@/components/ui/Toast';

export function Toaster() {
  const { toasts, dismiss } = useToast();
  if (toasts.length === 0) return null;

  return createPortal(
    <div className="pointer-events-none fixed top-6 right-6 z-[100] flex w-full max-w-[380px] flex-col gap-3">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onPop={dismiss} />
      ))}
    </div>,
    document.body
  );
}
