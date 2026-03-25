// src/components/ui/Avatar.tsx
import * as React from "react";
import { cn, getRandomPokemonUrl } from "../../lib/utils";

interface AvatarProps extends React.ComponentPropsWithRef<"div"> {
  src?: string | null;
  userId?: string | number;
  alt?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export const Avatar = ({
  src,
  userId,
  alt = "User avatar",
  size = "md",
  className,
  ref,
  ...props
}: AvatarProps) => {
  const [hasError, setHasError] = React.useState(false);

  // Если фото нет, используем покемона. Если нет ID — пустую строку.
  const defaultAvatar = userId ? getRandomPokemonUrl(userId) : "";
  const displaySrc = src || defaultAvatar;

  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-20 w-20",
    xl: "h-32 w-32",
  };

  return (
    <div
      ref={ref}
      className={cn(
        "relative flex shrink-0 overflow-hidden rounded-lg border border-white/15 bg-black/20",
        "shadow-[0_12px_28px_rgba(0,0,0,0.22)]",
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {displaySrc && !hasError ? (
        <img
          src={displaySrc}
          alt={alt}
          onError={() => setHasError(true)}
          className="h-full w-full object-cover transition-opacity duration-300"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center font-black text-white/20">
          ?
        </div>
      )}
    </div>
  );
};
