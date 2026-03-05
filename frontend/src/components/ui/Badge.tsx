// src/components/ui/Badge.tsx
import * as React from "react";
import { cn } from "../../lib/utils";

interface BadgeProps extends React.ComponentPropsWithRef<"span"> {
  variant?: "default" | "success" | "warning" | "error" | "outline";
}

export const Badge = ({
  className,
  variant = "default",
  ref,
  ...props
}: BadgeProps) => {
  const variants = {
    default: "bg-white/10 text-white border-transparent",
    success: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    warning: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    error: "bg-red-500/10 text-brand-red border-brand-red/20",
    outline: "border-white/20 text-white/60 bg-transparent",
  };

  return (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold capitalize tracking-[0.08em] transition-colors",
        variants[variant],
        className
      )}
      {...props}
    />
  );
};
