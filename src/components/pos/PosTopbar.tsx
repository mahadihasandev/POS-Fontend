"use client";

import React, { useState } from "react";
import {
  Bell,
  User as UserIcon,
  Volume2,
  VolumeX,
  Store,
  Layers,
  ShoppingBag,
  ShoppingCart,
  CreditCard,
  Shield,
  ChevronDown,
  Menu,
  LogOut,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { sounds } from "@/lib/sound";
import { deleteCookie } from "cookies-next";
import { useRouter } from "next/navigation";
import { useLogoutMutation } from "@/redux/api/authApi";
import toast from "react-hot-toast";

export interface PosTopbarProps {
  currentOutlet: string;
  onSelectOutlet: (name: string) => void;
  outlets?: Array<{ id: number; name: string }>;
  heldCount: number;
  onOpenHoldModal: () => void;
  currentUserRole: string;
  onSwitchUserRole: (role: "admin" | "cashier" | "manager") => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export function PosTopbar({
  currentOutlet,
  onSelectOutlet,
  outlets = [],
  heldCount,
  onOpenHoldModal,
  currentUserRole,
  onSwitchUserRole,
  activeTab,
  onSelectTab,
  onToggleSidebar,
  isSidebarOpen,
}: PosTopbarProps) {
  const router = useRouter();
  const [logoutApi] = useLogoutMutation();
  const [isMuted, setIsMuted] = useState(false);

  const toggleSound = () => {
    const enabled = sounds.toggleMute();
    setIsMuted(!enabled);
  };

  const handleLogout = async () => {
    try {
      await logoutApi().unwrap();
    } catch {
      // Ignore network errors on logout
    } finally {
      deleteCookie("token");
      deleteCookie("auth_token");
      deleteCookie("access_token");
      deleteCookie("user_role");
      deleteCookie("user_name");
      sounds.playBeep();
      toast.success("You have been signed out successfully.");
      router.push("/login");
    }
  };

  return (
    <header className="h-14 bg-blue-500 px-2 sm:px-4 lg:px-5 flex items-center justify-between text-white select-none z-30 sticky top-0 shadow-md">
      {/* Left: Mobile Drawer Button, Brand Title, Outlet Switcher */}
      <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
        {/* Mobile Hamburger Drawer Toggle */}
        <button
          type="button"
          onClick={onToggleSidebar}
          className="lg:hidden p-1.5 rounded-lg bg-black/20 hover:bg-black/30 active:bg-black/40 text-white cursor-pointer transition shrink-0"
          title="Open Navigation Menu"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Brand Title */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/20 border border-white/30 flex items-center justify-center text-white font-bold shadow-sm">
            <Layers className="w-4 h-4" />
          </div>
          <span className="font-serif italic text-base sm:text-lg lg:text-xl font-bold tracking-tight text-white drop-shadow-sm hidden xs:inline whitespace-nowrap">
            Smart Account
          </span>
        </div>

        {/* Outlet Switcher Dropdown */}
        <div className="relative group ml-1 sm:ml-2">
          <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-lg bg-black/20 hover:bg-black/30 border border-white/25 text-[11px] sm:text-xs font-semibold text-white cursor-pointer transition">
            <Store className="w-3.5 h-3.5 text-violet-200 shrink-0" />
            <span className="max-w-[75px] xs:max-w-[120px] sm:max-w-[160px] md:max-w-[220px] truncate">{currentOutlet}</span>
            <ChevronDown className="w-3 h-3 text-white/80 shrink-0" />
          </div>

          <div className="absolute left-0 mt-1 hidden group-hover:block w-64 bg-white border border-slate-200 rounded-xl shadow-2xl py-1 z-50 text-slate-800">
            <div className="px-3 py-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
              Select Branch
            </div>
            {outlets.map((outlet) => (
              <button
                key={outlet.id}
                type="button"
                onClick={() => onSelectOutlet(outlet.name)}
                className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-900 flex items-center justify-between font-medium cursor-pointer"
              >
                <span>{outlet.name}</span>
                {outlet.name === currentOutlet && (
                  <span className="w-2 h-2 rounded-full bg-violet-400" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right Quick Shortcut Controls */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        {/* Quick New Sale Shortcut */}
        <button
          type="button"
          onClick={() => onSelectTab("pos-new")}
          title="New Sale [F1]"
          className="hidden sm:flex p-1.5 sm:px-2 sm:py-1 rounded-lg bg-black/20 hover:bg-black/30 border border-white/20 text-xs font-bold text-white transition items-center gap-1 cursor-pointer"
        >
          <ShoppingCart className="w-3.5 h-3.5 text-violet-200" />
          <span className="hidden md:inline">Sale</span>
        </button>

        {/* Quick New Purchase Shortcut */}
        <button
          type="button"
          onClick={() => onSelectTab("purchase-new")}
          title="Add Purchase"
          className="hidden sm:flex p-1.5 sm:px-2 sm:py-1 rounded-lg bg-black/20 hover:bg-black/30 border border-white/20 text-xs font-bold text-white transition items-center gap-1 cursor-pointer"
        >
          <ShoppingBag className="w-3.5 h-3.5 text-teal-200" />
          <span className="hidden md:inline">Purchase</span>
        </button>

        {/* Quick Supplier Payment Shortcut */}
        <button
          type="button"
          onClick={() => onSelectTab("purchase-payment")}
          title="Supplier Payment"
          className="hidden md:flex p-1.5 sm:px-2 sm:py-1 rounded-lg bg-black/20 hover:bg-black/30 border border-white/20 text-xs font-bold text-white transition items-center gap-1 cursor-pointer"
        >
          <CreditCard className="w-3.5 h-3.5 text-rose-200" />
          <span className="hidden md:inline">Payment</span>
        </button>

        {/* Hold Orders Button */}
        <button
          type="button"
          onClick={onOpenHoldModal}
          className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-lg bg-white/20 hover:bg-white/30 border border-white/30 text-xs font-bold text-white transition cursor-pointer shadow-xs"
          title="Held Orders Queue"
        >
          <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
          <span className="hidden sm:inline">Hold</span>
          <span className="w-4 h-4 rounded-full bg-violet-300 text-slate-950 font-extrabold text-[10px] flex items-center justify-center shadow-xs shrink-0">
            {heldCount}
          </span>
        </button>

        {/* Audio Beep Toggle */}
        <button
          type="button"
          onClick={toggleSound}
          title={isMuted ? "Unmute scanner sound" : "Mute scanner sound"}
          className="p-1.5 rounded-lg bg-black/20 hover:bg-black/30 text-white transition cursor-pointer"
        >
          {isMuted ? (
            <VolumeX className="w-4 h-4 text-violet-300" />
          ) : (
            <Volume2 className="w-4 h-4 text-white" />
          )}
        </button>

        {/* Notification Bell */}
        <div className="relative p-1.5 rounded-lg bg-black/20 text-white cursor-pointer">
          <Bell className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-violet-300 text-slate-950 font-bold text-[9px] flex items-center justify-center">
            10
          </span>
        </div>

        {/* Multi-User Role Demo Switcher */}
        <div className="relative group">
          <div className="flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-lg bg-black/20 hover:bg-black/30 border border-white/20 text-xs cursor-pointer">
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white">
              <UserIcon className="w-3.5 h-3.5" />
            </div>
            <div className="text-left hidden md:block">
              <span className="font-bold text-white capitalize block text-xs">
                {currentUserRole}
              </span>
              <span className="text-[10px] text-white/80 block -mt-0.5">Switch Role</span>
            </div>
            <ChevronDown className="w-3 h-3 text-white/80" />
          </div>

          <div className="absolute right-0 mt-1 hidden group-hover:block w-48 bg-white border border-slate-200 rounded-xl shadow-2xl py-1 z-50 text-slate-800">
            <div className="px-3 py-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
              Simulate Role
            </div>
            {(["admin", "cashier", "manager"] as const).map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => onSwitchUserRole(role)}
                className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-900 flex items-center justify-between capitalize font-medium cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{role}</span>
                </div>
                {currentUserRole === role && (
                  <Badge variant="indigo" className="text-[9px] py-0">
                    Active
                  </Badge>
                )}
              </button>
            ))}
            <div className="border-t border-slate-100 p-1 mt-1">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full text-left px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-bold cursor-pointer rounded-lg transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>

        {/* Topbar Logout Button */}
        <button
          type="button"
          onClick={handleLogout}
          title="Sign out of POS system"
          className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-lg bg-rose-600/90 hover:bg-rose-600 active:bg-rose-700 text-white font-bold text-xs shadow-xs transition cursor-pointer border border-rose-400/30"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
