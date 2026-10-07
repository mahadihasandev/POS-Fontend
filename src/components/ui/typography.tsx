import React from "react";
import { cn } from "@/lib/utils";

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  gradient?: boolean;
  size?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}

/**
 * Shared Heading component with standard typography hierarchy and optional gradient styles.
 */
export function Heading({
  as: Tag = "h2",
  size,
  gradient = false,
  className,
  children,
  ...props
}: HeadingProps) {
  const visualSize = size || Tag;

  const sizeClasses: Record<string, string> = {
    h1: "text-3xl sm:text-5xl font-extrabold tracking-tight",
    h2: "text-2xl sm:text-3xl font-bold tracking-tight",
    h3: "text-xl sm:text-2xl font-semibold tracking-tight",
    h4: "text-lg sm:text-xl font-semibold",
    h5: "text-base font-semibold",
    h6: "text-sm font-semibold uppercase tracking-wider",
  };

  return (
    <Tag
      className={cn(
        "text-white",
        sizeClasses[visualSize],
        gradient &&
          "bg-gradient-to-r from-indigo-400 via-violet-300 to-cyan-400 bg-clip-text text-transparent",
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}

export interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  variant?: "lead" | "body" | "muted" | "small" | "code";
  as?: "p" | "span" | "div";
}

/**
 * Shared Text component with standardized body variants.
 */
export function Text({
  as: Tag = "p",
  variant = "body",
  className,
  children,
  ...props
}: TextProps) {
  const variantClasses: Record<string, string> = {
    lead: "text-base sm:text-lg text-slate-300 leading-relaxed",
    body: "text-sm text-slate-300 leading-normal",
    muted: "text-xs sm:text-sm text-slate-400 leading-relaxed",
    small: "text-xs text-slate-400",
    code: "text-xs font-mono text-slate-300 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800",
  };

  return (
    <Tag className={cn(variantClasses[variant], className)} {...props}>
      {children}
    </Tag>
  );
}
