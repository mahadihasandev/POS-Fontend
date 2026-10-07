"use client";

import React from "react";
import { Plus, PauseCircle, Maximize2, Minimize2 } from "lucide-react";

export interface PosHeaderBannerProps {
  title: string;
  heldCount: number;
  onOpenHoldList: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

export function PosHeaderBanner({
  title,
  heldCount,
  onOpenHoldList,
  isFullscreen,
  onToggleFullscreen,
}: PosHeaderBannerProps) {
  return (
    <div className="bg-gradient-to-r from-teal-800 via-teal-700 to-cyan-800 px-4 py-2.5 rounded-t-xl border-b border-teal-900/20 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-2 text-white font-extrabold text-sm sm:text-base tracking-wide">
        <Plus className="w-4 h-4 text-teal-200 stroke-[3]" />
        <span>{title}</span>
      </div>

      <div className="flex items-center gap-2">
        {/* Hold List Button */}
        <button
          type="button"
          onClick={onOpenHoldList}
          className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-violet-300 hover:bg-violet-200 text-slate-950 font-extrabold text-xs shadow-sm transition cursor-pointer"
        >
          <PauseCircle className="w-3.5 h-3.5 text-slate-950" />
          <span>Hold List</span>
          <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-slate-950 text-violet-300 text-[10px] font-bold">
            {heldCount}
          </span>
        </button>

        {/* Fullscreen Toggle */}
        <button
          type="button"
          onClick={onToggleFullscreen}
          title={isFullscreen ? "Exit Fullscreen" : "Fullscreen POS Mode"}
          className="p-1 rounded-md bg-teal-900/40 hover:bg-teal-900/60 text-teal-100 border border-teal-600/60 transition cursor-pointer"
        >
          {isFullscreen ? (
            <Minimize2 className="w-3.5 h-3.5" />
          ) : (
            <Maximize2 className="w-3.5 h-3.5" />
          )}
        </button>
      </div>
    </div>
  );
}
