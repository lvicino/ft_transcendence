// src/components/ui/Input.tsx
import { ComponentPropsWithRef } from "react";
import { cn } from "@/lib/utils";

type InputProps = ComponentPropsWithRef<"input"> & {
  error?: string;
};

export function Input({ 
  className, 
  type, 
  error, 
  ref,
  ...props 
}: InputProps) {
  return (
    <div className="flex w-full flex-col gap-1.5">
      <input
        type={type}
        ref={ref}
        className={cn(
          "flex h-11 w-full rounded-lg border bg-black/20 px-4 py-2 text-sm transition-colors",
          "border-white/10 text-brand-white placeholder:text-white/20",
          "focus:outline-none focus:border-white/25 focus:bg-white/8",
          "disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-red-400/40 focus:border-red-300/50",
          className
        )}
        {...props}
      />
      {error && (
        <span className="animate-fade-in text-[11px] font-medium text-red-200/90">
          {error}
        </span>
      )}
    </div>
  );
}
