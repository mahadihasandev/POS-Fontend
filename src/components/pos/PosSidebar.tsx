"use client";
import { useState } from "react";
import {
  Layers,
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  Wallet,
  BarChart3,
  Shield,
  ChevronDown,
  X,
  ArrowUpRight,
  MessageSquare,
} from "lucide-react";
import { canOpenTab } from "@/lib/navigation";
const groups = [
  {
    title: "CRM & Social",
    icon: MessageSquare,
    items: [
      ["crm", "CRM & Social Outreach"],
    ],
  },
  {
    title: "Sales & checkout",
    icon: ShoppingCart,
    items: [
      ["pos-new", "New sale"],
      ["pos-supplier", "Supplier sale"],
      ["sales-list", "Sales register"],
      ["collection", "Due collection"],
      ["collection-supplier", "Supplier collection"],
      ["sales-return", "Return & exchange"],
      ["sales-exchange-list", "Return history"],
    ],
  },
  {
    title: "Purchasing",
    icon: Wallet,
    items: [
      ["purchase-new", "Add purchase"],
      ["purchase-list", "Purchase register"],
      ["purchase-payment", "Supplier payments"],
      ["purchase-return", "Purchase returns"],
    ],
  },
  {
    title: "Inventory",
    icon: Package,
    items: [
      ["products", "Products & stock"],
      ["transfers", "Stock transfers"],
      ["wastages", "Wastage & losses"],
    ],
  },
  {
    title: "People",
    icon: Users,
    items: [
      ["customers", "Customers"],
      ["suppliers", "Suppliers"],
      ["marketers", "Marketers & commissions"],
    ],
  },
  {
    title: "Finance",
    icon: Wallet,
    items: [
      ["accounts", "Accounts & transfers"],
      ["expenses", "Expense vouchers"],
    ],
  },
];
export interface PosSidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  userPermissions: string[];
  isAdmin: boolean;
  isOpen: boolean;
  onClose: () => void;
}
export function PosSidebar({
  activeTab,
  onSelectTab,
  userPermissions,
  isAdmin,
  isOpen,
  onClose,
}: PosSidebarProps) {
  const [expanded, setExpanded] = useState<
    Record<string, { tab: string; open: boolean }>
  >({});
  const allowed = (id: string) => canOpenTab(id, userPermissions, isAdmin);
  const go = (id: string) => {
    onSelectTab(id);
    onClose();
  };
  const itemClass = (id: string) =>
    `w-full rounded-lg px-3 py-2.5 text-left text-[13px] transition ${activeTab === id ? "bg-teal-400/15 text-teal-200 font-semibold" : "text-slate-300 hover:bg-slate-800 hover:text-white"}`;
  return (
    <>
      {isOpen && (
        <button
          className="fixed inset-0 z-40 bg-slate-950/60 lg:hidden"
          aria-label="Close navigation"
          onClick={onClose}
        />
      )}
      <aside
        className={`pos-sidebar fixed inset-y-0 left-0 z-50 flex w-[240px] shrink-0 flex-col overflow-hidden lg:sticky lg:top-0 lg:h-dvh lg:self-start ${isOpen ? "" : "hidden lg:flex"}`}
      >
        <div className="flex h-[72px] shrink-0 items-center gap-3 border-b border-slate-800 px-5">
          <span className="grid size-9 place-items-center rounded-xl bg-teal-500 text-slate-950">
            <Layers size={21} />
          </span>
          <div>
            <p className="text-sm font-semibold text-white tracking-tight">
              Smart Account
            </p>
            <p className="text-[10px] tracking-[.2em] text-slate-300 uppercase">
              Retail workspace
            </p>
          </div>
          <button
            className="lg:hidden ml-auto text-white"
            aria-label="Close menu"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>
        <nav
          aria-label="Main navigation"
          className="min-h-0 flex-1 overflow-y-auto space-y-1.5 p-3"
        >
          <p className="px-3 py-3 text-[10px] font-semibold uppercase tracking-[.16em] text-slate-400">
            Overview
          </p>
          {allowed("dashboard") && (
            <button
              aria-current={activeTab === "dashboard" ? "page" : undefined}
              className={`${itemClass("dashboard")} flex gap-3 items-center`}
              onClick={() => go("dashboard")}
            >
              <LayoutDashboard size={17} />
              Dashboard
            </button>
          )}
          {allowed("crm") && (
            <button
              aria-current={activeTab === "crm" ? "page" : undefined}
              className={`${itemClass("crm")} flex items-center justify-between group`}
              onClick={() => go("crm")}
            >
              <div className="flex gap-3 items-center">
                <MessageSquare
                  size={17}
                  className={
                    activeTab === "crm"
                      ? "text-teal-300"
                      : "text-emerald-400 group-hover:scale-110 transition-transform"
                  }
                />
                <span className="font-medium">CRM & Social</span>
              </div>
              <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                New
              </span>
            </button>
          )}
          <p className="px-3 pt-5 pb-2 text-[10px] font-semibold uppercase tracking-[.16em] text-slate-400">
            Operations
          </p>
          {groups.map(({ title, icon: Icon, items }) => {
            const visible = items.filter(([id]) => allowed(id));
            if (!visible.length) return null;
            const childActive = visible.some(([id]) => id === activeTab);
            const override = expanded[title];
            const open =
              override?.tab === activeTab
                ? override.open
                : childActive || (override?.open ?? title === "Inventory");
            return (
              <div key={title}>
                <button
                  aria-expanded={open}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] hover:bg-slate-800 ${childActive ? "text-white" : "text-slate-300"}`}
                  onClick={() =>
                    setExpanded({
                      ...expanded,
                      [title]: { tab: activeTab, open: !open },
                    })
                  }
                >
                  <Icon size={17} />
                  <span className="flex-1 text-left">{title}</span>
                  <ChevronDown size={13} className={open ? "rotate-180" : ""} />
                </button>
                {open && (
                  <div className="ml-5 border-l border-slate-700 pl-2 my-1">
                    {visible.map(([id, label]) => (
                      <button
                        key={id}
                        aria-current={activeTab === id ? "page" : undefined}
                        className={itemClass(id)}
                        onClick={() => go(id)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          {allowed("reports") && (
            <button
              aria-current={activeTab === "reports" ? "page" : undefined}
              className={`${itemClass("reports")} flex items-center gap-3`}
              onClick={() => go("reports")}
            >
              <BarChart3 size={17} />
              Reports & audit
            </button>
          )}
          {allowed("rbac") && (
            <button
              aria-current={activeTab === "rbac" ? "page" : undefined}
              className={`${itemClass("rbac")} flex items-center gap-3`}
              onClick={() => go("rbac")}
            >
              <Shield size={17} />
              Staff & permissions
            </button>
          )}
        </nav>
        <div className="m-4 shrink-0 rounded-xl border border-slate-700 bg-slate-800 p-3">
          <div className="flex items-center justify-between text-xs font-semibold text-white">
            Ready for your next sale
            <ArrowUpRight size={15} className="text-teal-300" />
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-slate-300">
            F2 to scan · F8 to receive
            <br />
            F10 to complete checkout
          </p>
        </div>
      </aside>
    </>
  );
}
