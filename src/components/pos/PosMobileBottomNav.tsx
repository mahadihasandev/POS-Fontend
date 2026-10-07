"use client";

import React from "react";
import {
  ShoppingCart,
  ShoppingBag,
  PauseCircle,
  LayoutDashboard,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface PosMobileBottomNavProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  heldCount: number;
  onOpenHoldModal: () => void;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export function PosMobileBottomNav({
  activeTab,
  onSelectTab,
  heldCount,
  onOpenHoldModal,
  onToggleSidebar,
  isSidebarOpen,
}: PosMobileBottomNavProps) {
  const isSaleActive = activeTab === "pos-supplier" || activeTab === "pos-new";
  const isPurchaseActive =
    activeTab === "purchase-new" ||
    activeTab === "purchase-list" ||
    activeTab === "purchase-payment";
  const isDashboardActive = activeTab === "dashboard";

  return (
    <nav
      aria-label="Mobile Navigation"
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-2xl py-1.5 px-3 flex items-center justify-around select-none safe-area-pb"
    >
      {/* 1. Sale */}
      <button
        type="button"
        onClick={() => onSelectTab("pos-supplier")}
        className={cn(
          "flex flex-col items-center justify-center gap-0.5 px-3 py-1 rounded-xl transition cursor-pointer min-w-[56px]",
          isSaleActive
            ? "text-blue-600 font-extrabold bg-blue-50"
            : "text-slate-600 hover:text-slate-900 font-semibold"
        )}
      >
        <ShoppingCart className="w-5 h-5 stroke-[2.2]" />
        <span className="text-[10px] tracking-tight">Sale</span>
      </button>

      {/* 2. Purchase */}
      <button
        type="button"
        onClick={() => onSelectTab("purchase-new")}
        className={cn(
          "flex flex-col items-center justify-center gap-0.5 px-3 py-1 rounded-xl transition cursor-pointer min-w-[56px]",
          isPurchaseActive
            ? "text-teal-700 font-extrabold bg-teal-50"
            : "text-slate-600 hover:text-slate-900 font-semibold"
        )}
      >
        <ShoppingBag className="w-5 h-5 stroke-[2.2]" />
        <span className="text-[10px] tracking-tight">Purchase</span>
      </button>

      {/* 3. Hold Orders Modal Trigger */}
      <button
        type="button"
        onClick={onOpenHoldModal}
        className="flex flex-col items-center justify-center gap-0.5 px-3 py-1 rounded-xl transition cursor-pointer relative min-w-[56px] text-slate-700 hover:text-slate-950 font-semibold"
      >
        <div className="relative">
          <PauseCircle className="w-5 h-5 stroke-[2.2]" />
          {heldCount > 0 && (
            <span className="absolute -top-1.5 -right-2 min-w-4 h-4 px-1 rounded-full bg-violet-500 text-white font-extrabold text-[9px] flex items-center justify-center shadow-xs">
              {heldCount}
            </span>
          )}
        </div>
        <span className="text-[10px] tracking-tight">Hold</span>
      </button>

      {/* 4. Dashboard */}
      <button
        type="button"
        onClick={() => onSelectTab("dashboard")}
        className={cn(
          "flex flex-col items-center justify-center gap-0.5 px-3 py-1 rounded-xl transition cursor-pointer min-w-[56px]",
          isDashboardActive
            ? "text-indigo-600 font-extrabold bg-indigo-50"
            : "text-slate-600 hover:text-slate-900 font-semibold"
        )}
      >
        <LayoutDashboard className="w-5 h-5 stroke-[2.2]" />
        <span className="text-[10px] tracking-tight">Dashboard</span>
      </button>

      {/* 5. More Menu */}
      <button
        type="button"
        onClick={onToggleSidebar}
        className={cn(
          "flex flex-col items-center justify-center gap-0.5 px-3 py-1 rounded-xl transition cursor-pointer min-w-[56px]",
          isSidebarOpen
            ? "text-blue-600 font-extrabold bg-blue-50"
            : "text-slate-600 hover:text-slate-900 font-semibold"
        )}
      >
        <Menu className="w-5 h-5 stroke-[2.2]" />
        <span className="text-[10px] tracking-tight">Menu</span>
      </button>
    </nav>
  );
}
