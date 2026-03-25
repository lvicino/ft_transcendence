// src/components/ui/Switch.tsx
import * as React from "react";
import { cn } from "../../lib/utils";

interface SwitchProps extends React.ComponentPropsWithRef<"input"> {
  label?: string;
}

export const Switch = ({
  className,
  label,
  ref,
  checked,
  ...props
}: SwitchProps) => {
  return (
    <label className="group flex cursor-pointer select-none items-center gap-3">
      <div className="relative">
        <input
          type="checkbox"
          className="sr-only"
          ref={ref}
          checked={checked}
          {...props}
        />
        
        <div className={cn(
          "h-6 w-11 rounded-full border transition-colors duration-200",
          "border-white/15 bg-white/5",
          "group-focus-within:ring-2 group-focus-within:ring-brand-red/50",
          checked ? "border-white/20 bg-white/20" : "bg-white/5",
          props.disabled && "opacity-50 cursor-not-allowed",
          className
        )} />

        <div className={cn(
          "absolute top-1 left-1 h-4 w-4 rounded-full bg-white transition-transform duration-200 shadow-sm",
          checked ? "translate-x-5" : "translate-x-0",
          checked ? "bg-white" : "bg-white/55"
        )} />
      </div>

      {label && (
        <span className="text-[10px] font-black uppercase tracking-widest text-white/70 group-hover:text-white transition-colors">
          {label}
        </span>
      )}
    </label>
  );
};
