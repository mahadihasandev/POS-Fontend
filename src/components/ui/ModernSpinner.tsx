import React from "react";

export interface ModernSpinnerProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  glow?: boolean;
}

const sizeMap = {
  xs: { box: "w-4 h-4", outerStroke: 2.5, innerStroke: 2, centerDot: "w-1 h-1" },
  sm: { box: "w-6 h-6", outerStroke: 2.5, innerStroke: 2, centerDot: "w-1.5 h-1.5" },
  md: { box: "w-10 h-10", outerStroke: 3, innerStroke: 2.5, centerDot: "w-2 h-2" },
  lg: { box: "w-14 h-14", outerStroke: 3.5, innerStroke: 2.5, centerDot: "w-2.5 h-2.5" },
  xl: { box: "w-20 h-20", outerStroke: 4, innerStroke: 3, centerDot: "w-3.5 h-3.5" },
};

export function ModernSpinner({
  size = "md",
  className = "",
  glow = true,
}: ModernSpinnerProps) {
  const s = sizeMap[size];

  return (
    <div className={`relative inline-flex items-center justify-center ${s.box} ${className}`}>
      {/* Ambient background glow */}
      {glow && (
        <div
          className="absolute inset-0 rounded-full bg-gradient-to-tr from-teal-500/30 via-emerald-500/20 to-cyan-500/30 blur-md pointer-events-none animate-pulse"
          style={{ animationDuration: "2.5s" }}
        />
      )}

      {/* SVG Multi-Ring Spinner */}
      <svg
        className="w-full h-full relative z-10"
        viewBox="0 0 50 50"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="spinner-grad-outer" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#14b8a6" />
            <stop offset="50%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
          <linearGradient id="spinner-grad-inner" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#2dd4bf" />
          </linearGradient>
        </defs>

        {/* Faint Outer Track */}
        <circle
          cx="25"
          cy="25"
          r="21"
          stroke="currentColor"
          className="text-teal-900/20 dark:text-teal-400/10"
          strokeWidth={s.outerStroke}
        />

        {/* Outer Fast Ring (Clockwise) */}
        <circle
          cx="25"
          cy="25"
          r="21"
          stroke="url(#spinner-grad-outer)"
          strokeWidth={s.outerStroke}
          strokeLinecap="round"
          strokeDasharray="65 110"
          className="origin-center animate-spin"
          style={{ animationDuration: "1.1s" }}
        />

        {/* Inner Counter Ring (Counter-Clockwise) */}
        {size !== "xs" && (
          <circle
            cx="25"
            cy="25"
            r="14"
            stroke="url(#spinner-grad-inner)"
            strokeWidth={s.innerStroke}
            strokeLinecap="round"
            strokeDasharray="35 75"
            className="origin-center"
            style={{
              animation: "spin 1.8s linear infinite reverse",
            }}
          />
        )}
      </svg>

      {/* Glowing Pulsing Core */}
      {size !== "xs" && (
        <span
          className={`absolute rounded-full bg-teal-400 z-20 ${s.centerDot} shadow-[0_0_8px_rgba(45,212,191,0.9)] animate-pulse`}
          style={{ animationDuration: "1.6s" }}
        />
      )}
    </div>
  );
}
