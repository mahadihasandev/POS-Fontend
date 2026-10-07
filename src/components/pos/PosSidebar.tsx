"use client";

import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  ShoppingCart,
  Receipt,
  Layers,
  Users as UsersIcon,
  Building2,
  DollarSign,
  Package,
  FileText,
  Lock,
  ChevronDown,
  PlusCircle,
  ShoppingBag,
  RotateCcw,
  ArrowRightLeft,
  BarChart3,
  CreditCard,
  X,
  LogOut,
  Shield,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { deleteCookie } from "cookies-next";
import { useRouter } from "next/navigation";
import { useLogoutMutation } from "@/redux/api/authApi";
import toast from "react-hot-toast";
import { sounds } from "@/lib/sound";

export interface PosSidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  userPermissions: string[];
  isAdmin: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

interface SidebarAccordionProps {
  title: string;
  icon: React.ReactNode;
  iconBgClass: string;
  iconTextClass: string;
  badgeCount?: number;
  isOpen: boolean;
  onToggle: () => void;
  isChildActive: boolean;
  children: React.ReactNode;
}

function SidebarAccordion({
  title,
  icon,
  iconBgClass,
  iconTextClass,
  badgeCount,
  isOpen,
  onToggle,
  isChildActive,
  children,
}: SidebarAccordionProps) {
  return (
    <div className="rounded-xl overflow-hidden transition-all duration-200">
      {/* Accordion Header Button */}
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          "w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer select-none group",
          isChildActive
            ? "bg-slate-100/90 text-slate-950 shadow-2xs border border-slate-200/90"
            : "text-slate-700 hover:bg-slate-100/70 hover:text-slate-950"
        )}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={cn(
              "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105 border",
              iconBgClass,
              iconTextClass
            )}
          >
            {icon}
          </div>
          <span className="truncate tracking-tight">{title}</span>
          {isChildActive && (
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 animate-pulse" />
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0 ml-1">
          {typeof badgeCount === "number" && (
            <span
              className={cn(
                "text-[10px] font-mono px-1.5 py-0.5 rounded-full font-semibold transition-colors",
                isChildActive
                  ? "bg-blue-100 text-blue-700"
                  : "bg-slate-100 text-slate-500 group-hover:bg-slate-200/70 group-hover:text-slate-700"
              )}
            >
              {badgeCount}
            </span>
          )}
          <div
            className={cn(
              "w-5 h-5 rounded-md flex items-center justify-center transition-transform duration-300",
              isOpen ? "rotate-180 text-blue-600" : "text-slate-400 group-hover:text-slate-600"
            )}
          >
            <ChevronDown className="w-3.5 h-3.5 stroke-[2.2]" />
          </div>
        </div>
      </button>

      {/* Accordion Expandable Body with 60fps CSS Grid height animation */}
      <div
        className={cn(
          "grid transition-all duration-300 ease-in-out",
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden min-h-0">
          <div className="ml-4 pl-3 border-l-2 border-slate-200/80 space-y-0.5 py-1.5 my-0.5">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

interface SubMenuItemProps {
  label: string;
  icon?: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
  accentColor?: "blue" | "teal" | "purple" | "emerald" | "violet" | "rose" | "indigo";
}

function SubMenuItem({
  label,
  icon,
  isActive,
  onClick,
  accentColor = "blue",
}: SubMenuItemProps) {
  const activeColorMap = {
    blue: "bg-blue-500 text-white font-bold shadow-xs shadow-blue-500/20",
    teal: "bg-teal-600 text-white font-bold shadow-xs shadow-teal-600/20",
    purple: "bg-purple-600 text-white font-bold shadow-xs shadow-purple-600/20",
    emerald: "bg-emerald-600 text-white font-bold shadow-xs shadow-emerald-600/20",
    violet: "bg-violet-600 text-white font-bold shadow-xs shadow-violet-600/20",
    rose: "bg-rose-600 text-white font-bold shadow-xs shadow-rose-600/20",
    indigo: "bg-indigo-600 text-white font-bold shadow-xs shadow-indigo-600/20",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer text-left group/item select-none",
        isActive
          ? activeColorMap[accentColor]
          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/90 hover:translate-x-0.5"
      )}
    >
      <div className="flex items-center gap-2 truncate">
        {icon ? (
          <span
            className={cn(
              "shrink-0 transition-colors",
              isActive ? "text-white" : "text-slate-400 group-hover/item:text-slate-700"
            )}
          >
            {icon}
          </span>
        ) : (
          <span
            className={cn(
              "w-1.5 h-1.5 rounded-full shrink-0 transition-colors",
              isActive ? "bg-white" : "bg-slate-300 group-hover/item:bg-slate-500"
            )}
          />
        )}
        <span className="truncate">{label}</span>
      </div>

      {isActive && (
        <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0 shadow-xs" />
      )}
    </button>
  );
}

export function PosSidebar({
  activeTab,
  onSelectTab: originalOnSelectTab,
  userPermissions,
  isAdmin,
  isOpen = false,
  onClose,
}: PosSidebarProps) {
  // Tab category sets for active tracking
  const salesTabs = [
    "pos-supplier",
    "pos-new",
    "sales-list",
    "collection",
    "collection-supplier",
    "sales-return",
    "sales-exchange-list",
  ];
  const purchaseTabs = [
    "purchase-new",
    "purchase-list",
    "purchase-payment",
    "purchase-return",
  ];
  const inventoryTabs = ["products", "transfers"];
  const partiesTabs = ["customers", "suppliers", "marketers"];
  const accountsTabs = ["accounts"];
  const reportsTabs = ["reports"];
  const rbacTabs = ["rbac"];

  // Accordion toggle states
  const [salesOpen, setSalesOpen] = useState(true);
  const [purchasesOpen, setPurchasesOpen] = useState(
    purchaseTabs.includes(activeTab)
  );
  const [inventoryOpen, setInventoryOpen] = useState(
    inventoryTabs.includes(activeTab)
  );
  const [partiesOpen, setPartiesOpen] = useState(
    partiesTabs.includes(activeTab)
  );
  const [accountsOpen, setAccountsOpen] = useState(
    accountsTabs.includes(activeTab)
  );
  const [reportsOpen, setReportsOpen] = useState(
    reportsTabs.includes(activeTab)
  );
  const [rbacOpen, setRbacOpen] = useState(
    rbacTabs.includes(activeTab)
  );

  // Auto-expand group when activeTab changes
  useEffect(() => {
    if (salesTabs.includes(activeTab)) setSalesOpen(true);
    if (purchaseTabs.includes(activeTab)) setPurchasesOpen(true);
    if (inventoryTabs.includes(activeTab)) setInventoryOpen(true);
    if (partiesTabs.includes(activeTab)) setPartiesOpen(true);
    if (accountsTabs.includes(activeTab)) setAccountsOpen(true);
    if (reportsTabs.includes(activeTab)) setReportsOpen(true);
    if (rbacTabs.includes(activeTab)) setRbacOpen(true);
  }, [activeTab]);

  const router = useRouter();
  const [logoutApi] = useLogoutMutation();

  const hasPerm = (slug: string) => isAdmin || userPermissions.includes(slug);

  const onSelectTab = (tab: string) => {
    originalOnSelectTab(tab);
    onClose?.();
  };

  const handleLogout = async () => {
    try {
      await logoutApi().unwrap();
    } catch {
      // ignore
    } finally {
      deleteCookie("token");
      deleteCookie("auth_token");
      deleteCookie("access_token");
      deleteCookie("user_role");
      deleteCookie("user_name");
      sounds.playBeep();
      toast.success("You have been signed out successfully.");
      onClose?.();
      router.push("/login");
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden animate-in fade-in duration-200"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={cn(
          "w-72 sm:w-64 lg:w-60 bg-white border-r border-slate-200 flex flex-col shrink-0 text-slate-700 select-none overflow-y-auto shadow-2xl lg:shadow-xs transition-transform duration-300 z-50",
          "fixed lg:static inset-y-0 left-0",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0 hidden lg:flex"
        )}
      >
        {/* Mobile Drawer Header */}
        <div className="lg:hidden p-3.5 border-b border-slate-200 flex items-center justify-between bg-blue-500 text-white shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center text-white">
              <Layers className="w-4 h-4" />
            </div>
            <span className="font-serif italic font-bold text-sm text-white">
              Smart Account Menu
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg bg-white/10 hover:bg-white/20 active:bg-white/30 text-white cursor-pointer transition"
            title="Close Menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3 space-y-1.5 flex-1">
          {/* Quick Launch: Dashboard */}
          <button
            type="button"
            onClick={() => onSelectTab("dashboard")}
            className={cn(
              "w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer select-none text-left group",
              activeTab === "dashboard"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-800 hover:bg-slate-100 hover:text-slate-950"
            )}
          >
            <div className="flex items-center gap-2.5">
              <div
                className={cn(
                  "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border transition-transform group-hover:scale-105",
                  activeTab === "dashboard"
                    ? "bg-white/20 border-white/30 text-white"
                    : "bg-teal-50 border-teal-200/60 text-teal-600"
                )}
              >
                <LayoutDashboard className="w-4 h-4" />
              </div>
              <span>Dashboard</span>
            </div>
            {activeTab === "dashboard" && (
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0 shadow-xs" />
            )}
          </button>

          {/* 1. Sales & Billing Accordion */}
          <SidebarAccordion
            title="Sales & Billing"
            icon={<ShoppingCart className="w-4 h-4" />}
            iconBgClass="bg-blue-50 border-blue-200/60"
            iconTextClass="text-blue-600"
            badgeCount={7}
            isOpen={salesOpen}
            onToggle={() => setSalesOpen(!salesOpen)}
            isChildActive={salesTabs.includes(activeTab)}
          >
            <SubMenuItem
              label="Supplier Wise Sale"
              icon={<PlusCircle className="w-3.5 h-3.5" />}
              isActive={activeTab === "pos-supplier"}
              onClick={() => onSelectTab("pos-supplier")}
              accentColor="blue"
            />
            <SubMenuItem
              label="New Sale (POS)"
              icon={<ShoppingCart className="w-3.5 h-3.5" />}
              isActive={activeTab === "pos-new"}
              onClick={() => onSelectTab("pos-new")}
              accentColor="blue"
            />
            <SubMenuItem
              label="Sales Register"
              icon={<FileText className="w-3.5 h-3.5" />}
              isActive={activeTab === "sales-list"}
              onClick={() => onSelectTab("sales-list")}
              accentColor="blue"
            />
            <SubMenuItem
              label="Due Collection"
              icon={<Receipt className="w-3.5 h-3.5" />}
              isActive={activeTab === "collection"}
              onClick={() => onSelectTab("collection")}
              accentColor="blue"
            />
            <SubMenuItem
              label="Supplier Due Collection"
              icon={<PlusCircle className="w-3.5 h-3.5" />}
              isActive={activeTab === "collection-supplier"}
              onClick={() => onSelectTab("collection-supplier")}
              accentColor="blue"
            />
            <SubMenuItem
              label="Return & Exchange"
              icon={<RotateCcw className="w-3.5 h-3.5" />}
              isActive={activeTab === "sales-return"}
              onClick={() => onSelectTab("sales-return")}
              accentColor="blue"
            />
            <SubMenuItem
              label="Exchange Info List"
              icon={<Receipt className="w-3.5 h-3.5" />}
              isActive={activeTab === "sales-exchange-list"}
              onClick={() => onSelectTab("sales-exchange-list")}
              accentColor="blue"
            />
          </SidebarAccordion>

          {/* 2. Purchasing & Inward Accordion */}
          <SidebarAccordion
            title="Purchases"
            icon={<ShoppingBag className="w-4 h-4" />}
            iconBgClass="bg-teal-50 border-teal-200/60"
            iconTextClass="text-teal-600"
            badgeCount={4}
            isOpen={purchasesOpen}
            onToggle={() => setPurchasesOpen(!purchasesOpen)}
            isChildActive={purchaseTabs.includes(activeTab)}
          >
            <SubMenuItem
              label="Add Purchase"
              icon={<PlusCircle className="w-3.5 h-3.5" />}
              isActive={activeTab === "purchase-new"}
              onClick={() => onSelectTab("purchase-new")}
              accentColor="teal"
            />
            <SubMenuItem
              label="Purchases List"
              icon={<FileText className="w-3.5 h-3.5" />}
              isActive={activeTab === "purchase-list"}
              onClick={() => onSelectTab("purchase-list")}
              accentColor="teal"
            />
            <SubMenuItem
              label="Supplier Payment"
              icon={<CreditCard className="w-3.5 h-3.5" />}
              isActive={activeTab === "purchase-payment"}
              onClick={() => onSelectTab("purchase-payment")}
              accentColor="teal"
            />
            <SubMenuItem
              label="Purchase Return"
              icon={<RotateCcw className="w-3.5 h-3.5" />}
              isActive={activeTab === "purchase-return"}
              onClick={() => onSelectTab("purchase-return")}
              accentColor="teal"
            />
          </SidebarAccordion>

          {/* 3. Inventory & Stock Accordion */}
          <SidebarAccordion
            title="Inventory & Stock"
            icon={<Package className="w-4 h-4" />}
            iconBgClass="bg-purple-50 border-purple-200/60"
            iconTextClass="text-purple-600"
            badgeCount={2}
            isOpen={inventoryOpen}
            onToggle={() => setInventoryOpen(!inventoryOpen)}
            isChildActive={inventoryTabs.includes(activeTab)}
          >
            <SubMenuItem
              label="Products & Stock"
              icon={<Package className="w-3.5 h-3.5" />}
              isActive={activeTab === "products"}
              onClick={() => onSelectTab("products")}
              accentColor="purple"
            />
            <SubMenuItem
              label="Stock Transfer"
              icon={<ArrowRightLeft className="w-3.5 h-3.5" />}
              isActive={activeTab === "transfers"}
              onClick={() => onSelectTab("transfers")}
              accentColor="purple"
            />
          </SidebarAccordion>

          {/* 4. Parties & Directory Accordion */}
          <SidebarAccordion
            title="Parties & CRM"
            icon={<UsersIcon className="w-4 h-4" />}
            iconBgClass="bg-violet-50 border-violet-200/60"
            iconTextClass="text-violet-600"
            badgeCount={3}
            isOpen={partiesOpen}
            onToggle={() => setPartiesOpen(!partiesOpen)}
            isChildActive={partiesTabs.includes(activeTab)}
          >
            <SubMenuItem
              label="Customers & Dues"
              icon={<UsersIcon className="w-3.5 h-3.5" />}
              isActive={activeTab === "customers"}
              onClick={() => onSelectTab("customers")}
              accentColor="violet"
            />
            <SubMenuItem
              label="Suppliers Directory"
              icon={<Building2 className="w-3.5 h-3.5" />}
              isActive={activeTab === "suppliers"}
              onClick={() => onSelectTab("suppliers")}
              accentColor="violet"
            />
            <SubMenuItem
              label="Marketers & Slabs"
              icon={<UsersIcon className="w-3.5 h-3.5" />}
              isActive={activeTab === "marketers"}
              onClick={() => onSelectTab("marketers")}
              accentColor="violet"
            />
          </SidebarAccordion>

          {/* 5. General Accounts & Balances */}
          <button
            type="button"
            onClick={() => onSelectTab("accounts")}
            className={cn(
              "w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer select-none text-left group",
              activeTab === "accounts"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-800 hover:bg-slate-100 hover:text-slate-950"
            )}
          >
            <div className="flex items-center gap-2.5">
              <div
                className={cn(
                  "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border transition-transform group-hover:scale-105",
                  activeTab === "accounts"
                    ? "bg-white/20 border-white/30 text-white"
                    : "bg-emerald-50 border-emerald-200/60 text-emerald-600"
                )}
              >
                <DollarSign className="w-4 h-4" />
              </div>
              <span>General Accounts</span>
            </div>
            {activeTab === "accounts" && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 shadow-xs" />
            )}
          </button>

          {/* 6. Reports & Analytics */}
          <button
            type="button"
            onClick={() => onSelectTab("reports")}
            className={cn(
              "w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer select-none text-left group",
              activeTab === "reports"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-800 hover:bg-slate-100 hover:text-slate-950"
            )}
          >
            <div className="flex items-center gap-2.5">
              <div
                className={cn(
                  "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border transition-transform group-hover:scale-105",
                  activeTab === "reports"
                    ? "bg-white/20 border-white/30 text-white"
                    : "bg-rose-50 border-rose-200/60 text-rose-600"
                )}
              >
                <BarChart3 className="w-4 h-4" />
              </div>
              <span>Reports & Audit</span>
            </div>
            {activeTab === "reports" && (
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0 shadow-xs" />
            )}
          </button>

          {/* 7. RBAC & Staff Management Accordion (Protected) */}
          <div className="pt-2 border-t border-slate-200/80">
            <div className="px-3 pb-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              Access Control
            </div>

            <button
              type="button"
              onClick={() => {
                if (hasPerm("designations.manage") || hasPerm("users.manage")) {
                  onSelectTab("rbac");
                }
              }}
              disabled={!hasPerm("designations.manage") && !hasPerm("users.manage")}
              className={cn(
                "w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 text-left select-none",
                activeTab === "rbac"
                  ? "bg-purple-700 text-white shadow-xs"
                  : hasPerm("designations.manage") || hasPerm("users.manage")
                  ? "text-slate-800 hover:bg-slate-100 hover:text-slate-950 cursor-pointer"
                  : "text-slate-400 cursor-not-allowed bg-slate-50 opacity-60"
              )}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={cn(
                    "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border",
                    activeTab === "rbac"
                      ? "bg-white/20 border-white/30 text-white"
                      : "bg-purple-50 border-purple-200/60 text-purple-600"
                  )}
                >
                  <Shield className="w-4 h-4" />
                </div>
                <span>Staff & RBAC</span>
              </div>
              {!hasPerm("designations.manage") && !hasPerm("users.manage") ? (
                <Lock className="w-3.5 h-3.5 text-slate-400" />
              ) : (
                activeTab === "rbac" && (
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-300 shrink-0 shadow-xs" />
                )
              )}
            </button>
          </div>
        </div>

        {/* User Session & Sign Out Card */}
        <div className="p-3 border-t border-slate-200 shrink-0">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-all duration-200 cursor-pointer shadow-2xs group"
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-rose-100 flex items-center justify-center text-rose-600 group-hover:scale-105 transition-transform">
                <LogOut className="w-3.5 h-3.5" />
              </div>
              <span>Sign Out</span>
            </div>
            <span className="text-[10px] uppercase font-mono text-rose-500 font-bold px-1.5 py-0.5 rounded-md bg-rose-100/70">
              Exit
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}
