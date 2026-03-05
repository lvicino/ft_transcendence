import { ComponentPropsWithRef } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: ComponentPropsWithRef<"div">) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/10 bg-black/35 backdrop-blur-md text-white shadow-[0_24px_60px_rgba(0,0,0,0.28)]",
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: ComponentPropsWithRef<"div">) {
  return <div className={cn("flex flex-col space-y-2 p-6 pb-2 text-center", className)} {...props} />;
}

export function CardTitle({ className, ...props }: ComponentPropsWithRef<"h3">) {
  return (
    <h3
      className={cn(
        "font-goonies text-4xl tracking-[0.12em] text-white drop-shadow-[0_8px_24px_rgba(0,0,0,0.35)]",
        className
      )}
      {...props}
    />
  );
}

export function CardContent({ className, ...props }: ComponentPropsWithRef<"div">) {
  return <div className={cn("p-6 pt-0", className)} {...props} />;
}
