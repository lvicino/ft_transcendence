// src/components/ui/Button.tsx
import type { ComponentPropsWithRef, ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type ButtonProps = ComponentPropsWithRef<"button"> & {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive" | "default";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
  icon?: ReactNode;
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  isLoading,
  icon,
  children,
  disabled,
  type,
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-bg disabled:pointer-events-none disabled:opacity-50 cursor-pointer";

  const variants = {
    default:
      "border border-white/10 bg-white/90 text-black hover:bg-white",
    primary:
      "border border-white/10 bg-white/90 text-black hover:bg-white shadow-[0_10px_24px_rgba(0,0,0,0.18)]",
    secondary: "border border-white/10 bg-white/10 text-brand-white hover:bg-white/15",
    outline:
      "bg-white/5 border border-white/20 text-brand-white hover:border-white/35 hover:bg-white/10 backdrop-blur-sm",
    ghost: "bg-transparent text-white/75 hover:text-white hover:bg-white/8",
    destructive:
      "border border-red-300/20 bg-red-950/40 text-red-100 hover:bg-red-900/40 hover:border-red-200/30",
  } satisfies Record<NonNullable<ButtonProps["variant"]>, string>;

  const sizes = {
    sm: "h-9 px-4 text-xs",
    md: "h-11 px-6 text-sm min-w-[132px]",
    lg: "h-12 px-8 text-sm min-w-[180px]",
    icon: "h-10 w-10 min-w-0 p-0",
  } satisfies Record<NonNullable<ButtonProps["size"]>, string>;

  const variantClass = variants[variant] ?? variants.primary;

  return (
    <button
      type={type ?? "button"}
      className={cn(baseStyles, variantClass, sizes[size], className)}
      disabled={Boolean(isLoading) || disabled}
      {...props}
    >
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {!isLoading && icon ? <span className="shrink-0">{icon}</span> : null}
      {children}
    </button>
  );
}
