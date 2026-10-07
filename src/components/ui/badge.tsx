import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "indigo" | "emerald" | "amber" | "rose" | "violet" | "outline";
  pulse?: boolean;
}

export function Badge({
  className,
  variant = "default",
  pulse = false,
  children,
  ...props
}: BadgeProps) {
  const variantStyles: Record<string, { bg: string; dot: string }> = {
    default: {
      bg: "bg-slate-800 text-slate-300 border-slate-700",
      dot: "bg-slate-400",
    },
    indigo: {
      bg: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
      dot: "bg-indigo-400",
    },
    emerald: {
      bg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      dot: "bg-emerald-400",
    },
    amber: {
      bg: "bg-violet-500/10 text-violet-400 border-violet-500/20",
      dot: "bg-violet-400",
    },
    rose: {
      bg: "bg-rose-500/10 text-rose-400 border-rose-500/20",
      dot: "bg-rose-400",
    },
    violet: {
      bg: "bg-violet-500/10 text-violet-400 border-violet-500/20",
      dot: "bg-violet-400",
    },
    outline: {
      bg: "bg-transparent text-slate-300 border-slate-700",
      dot: "bg-slate-400",
    },
  };

  const selected = variantStyles[variant] || variantStyles.default;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border",
        selected.bg,
        className
      )}
      {...props}
    >
      {pulse && (
        <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse", selected.dot)} />
      )}
      {children}
    </span>
  );
}
