// src/components/ui/Modal.tsx
import * as React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "./Button";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
  ref?: React.Ref<HTMLDivElement>;
}

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  className,
  ref,
}: ModalProps) => {
  const [mounted, setMounted] = React.useState(false);

  // Ждем монтирования для Portal
  React.useEffect(() => {
    setMounted(true);
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />

      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        className={cn(
          "relative w-full max-w-lg rounded-2xl border border-white/10 bg-[rgba(10,14,18,0.92)] p-8 shadow-[0_30px_80px_rgba(0,0,0,0.45)]",
          "animate-in zoom-in-95 fade-in duration-300",
          className
        )}
      >
        <div className="flex items-center justify-between mb-6">
          {title && (
            <h2 className="text-lg font-semibold tracking-[0.08em] text-white">
              {title}
            </h2>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 text-white/40 hover:text-white"
          >
            <X size={18} />
          </Button>
        </div>

        <div className="relative z-10 text-white/80">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};
