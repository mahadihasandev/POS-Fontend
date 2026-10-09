"use client";

import React from "react";
import { Layers, ShieldCheck } from "lucide-react";
import { ModernSpinner } from "./ModernSpinner";

export interface FullPageLoaderProps {
  title?: string;
  message?: string;
  subtitle?: string;
}

export function FullPageLoader({
  title = "Smart Account",
  message = "Loading your workspace...",
  subtitle = "Connecting to secure cloud database & verifying session",
}: FullPageLoaderProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-[999] flex flex-col items-center justify-center overflow-hidden bg-[#0a1120] text-white selection:bg-teal-500 selection:text-white"
    >
      {/* Background Ambient Glowing Orbs */}
      <div className="absolute -top-40 -left-40 size-96 rounded-full bg-teal-500/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 size-96 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />

      {/* Main Glassmorphism Card */}
      <div className="relative z-10 flex flex-col items-center max-w-sm sm:max-w-md w-full mx-4 px-8 py-10 rounded-3xl bg-slate-900/70 border border-slate-700/60 shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-xl text-center">
        {/* Brand Icon Header */}
        <div className="relative mb-6">
          <div className="size-16 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-400 p-[1.5px] shadow-[0_0_25px_rgba(20,184,166,0.35)]">
            <div className="size-full rounded-[14px] bg-[#0d1829] flex items-center justify-center">
              <Layers className="size-8 text-teal-300" />
            </div>
          </div>
          <span className="absolute -bottom-1 -right-1 flex size-4">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex size-4 rounded-full bg-emerald-500 border-2 border-[#0a1120]" />
          </span>
        </div>

        {/* Title */}
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-1">
          {title}
        </h1>
        <p className="text-[11px] uppercase tracking-[0.22em] text-teal-400/90 font-semibold mb-7">
          Retail & ERP Cloud Engine
        </p>

        {/* Dynamic Glowing Spinner */}
        <div className="my-2">
          <ModernSpinner size="lg" glow={true} />
        </div>

        {/* Message */}
        <p className="mt-6 text-sm font-medium text-slate-200 tracking-wide">
          {message}
        </p>
        <p className="mt-1 text-xs text-slate-400 leading-relaxed max-w-xs">
          {subtitle}
        </p>

        {/* Shimmering Progress Bar */}
        <div className="w-48 sm:w-56 h-1.5 bg-slate-800/80 rounded-full mt-6 overflow-hidden relative">
          <div
            className="absolute inset-y-0 w-24 bg-gradient-to-r from-transparent via-teal-400 to-transparent rounded-full animate-shimmer"
            style={{
              animation: "shimmer 1.8s cubic-bezier(0.4, 0, 0.6, 1) infinite",
            }}
          />
        </div>

        {/* Trust & Security Badge */}
        <div className="mt-8 pt-5 border-t border-slate-800/80 w-full flex items-center justify-center gap-2 text-[11px] text-slate-400">
          <ShieldCheck size={14} className="text-emerald-400" />
          <span>Encrypted Cloud Session Active</span>
        </div>
      </div>
    </div>
  );
}
