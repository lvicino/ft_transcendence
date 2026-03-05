// src/components/ui/Loader.tsx
import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "../../lib/utils";

interface LoaderProps extends React.ComponentPropsWithRef<"div"> {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "default" | "primary" | "full-page";
  label?: string;
}

export const Loader = ({
  size = "md",
  variant = "default",
  label,
  className,
  ref,
  ...props
}: LoaderProps) => {
  const iconSizes = {
    sm: 16,
    md: 24,
    lg: 40,
    xl: 64,
  };

  const containerVariants = {
    default: "inline-flex items-center justify-center",
    primary: "inline-flex items-center justify-center text-white/90",
    "full-page": "fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/75 backdrop-blur-md text-white",
  };

  return (
    <div
      ref={ref}
      className={cn(containerVariants[variant], className)}
      role="status"
      aria-live="polite"
      {...props}
    >
      <div className="relative">
        <Loader2 
          size={iconSizes[size]} 
          className="animate-spin opacity-90" 
        />
      </div>

      {label && (
        <span className={cn(
          "mt-3 text-xs tracking-[0.08em] text-white/75",
          variant === "full-page" ? "text-white/85" : "text-current"
        )}>
          {label}
        </span>
      )}

      <span className="sr-only">Loading...</span>
    </div>
  );
};
