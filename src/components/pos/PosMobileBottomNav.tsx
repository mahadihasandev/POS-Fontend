"use client";
import {
  LayoutDashboard,
  ShoppingCart,
  MessageSquare,
  Package,
  Menu,
  Pause,
} from "lucide-react";
import { canOpenTab } from "@/lib/navigation";
export function PosMobileBottomNav({
  activeTab,
  onSelectTab,
  heldCount,
  onOpenHoldModal,
  onToggleSidebar,
  permissions,
  isAdmin,
}: {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  heldCount: number;
  onOpenHoldModal: () => void;
  onToggleSidebar: () => void;
  permissions: string[];
  isAdmin: boolean;
}) {
  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed bottom-0 inset-x-0 z-30 flex items-center justify-around border-t border-slate-700 bg-slate-900 text-slate-300 pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      {[
        ["dashboard", "Overview", LayoutDashboard],
        ["pos-new", "Sell", ShoppingCart],
        ["crm", "CRM", MessageSquare],
        ["products", "Stock", Package],
      ].map(
        ([id, name, Icon]) =>
          canOpenTab(id as string, permissions, isAdmin) && (
            <button
              key={id as string}
              onClick={() => onSelectTab(id as string)}
              className={`flex flex-col items-center gap-1 p-3 text-[10px] ${activeTab === id ? "text-teal-300" : ""}`}
            >
              {typeof Icon !== "string" && <Icon size={19} />}
              {name as string}
            </button>
          ),
      )}
      {(isAdmin || permissions.includes("sales.hold")) && (
        <button
          onClick={onOpenHoldModal}
          className="flex flex-col items-center gap-1 p-3 text-[10px]"
        >
          <Pause size={19} />
          Held ({heldCount})
        </button>
      )}
      <button
        onClick={onToggleSidebar}
        className="flex flex-col items-center gap-1 p-3 text-[10px]"
      >
        <Menu size={19} />
        Menu
      </button>
    </nav>
  );
}
