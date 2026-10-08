"use client";
import { useState } from "react";
import {
  Layers,
  Menu,
  Pause,
  Plus,
  Volume2,
  VolumeX,
  LogOut,
  Store,
} from "lucide-react";
import { sounds } from "@/lib/sound";
import { clearSession } from "@/lib/session";
import { useLogoutMutation } from "@/redux/api/authApi";
import { baseApi } from "@/redux/api/baseApi";
import { useAppDispatch } from "@/redux/hooks";
import { useRouter } from "next/navigation";

export interface PosTopbarProps {
  currentOutlet: string;
  onSelectOutlet: (name: string) => void;
  outlets: { id: number; name: string }[];
  heldCount: number;
  onOpenHoldModal: () => void;
  currentUserRole: string;
  userName: string;
  canSell: boolean;
  canHold: boolean;
  onSelectTab: (tab: string) => void;
  onToggleSidebar: () => void;
}
export function PosTopbar({
  currentOutlet,
  onSelectOutlet,
  outlets,
  heldCount,
  onOpenHoldModal,
  currentUserRole,
  userName,
  canSell,
  canHold,
  onSelectTab,
  onToggleSidebar,
}: PosTopbarProps) {
  const [muted, setMuted] = useState(false);
  const [logout, { isLoading }] = useLogoutMutation();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const signOut = async () => {
    try {
      await logout().unwrap();
    } finally {
      clearSession();
      dispatch(baseApi.util.resetApiState());
      router.replace("/login");
    }
  };
  return (
    <header className="pos-topbar flex h-[72px] shrink-0 items-center justify-between gap-3 px-4 lg:px-6 text-white">
      <div className="flex min-w-0 items-center gap-3">
        <button
          className="lg:hidden icon-button"
          aria-label="Open navigation"
          onClick={onToggleSidebar}
        >
          <Menu size={20} />
        </button>
        <div className="flex items-center gap-2.5 lg:hidden">
          <div className="grid size-9 place-items-center rounded-xl bg-teal-500">
            <Layers size={20} />
          </div>
          <span className="hidden sm:block font-semibold">Smart Account</span>
        </div>
        <div className="hidden lg:block">
          <p className="text-[10px] font-semibold uppercase tracking-[.18em] text-slate-300">
            Workspace
          </p>
          <p className="text-sm font-medium">Store operations</p>
        </div>
        <div className="ml-1 flex min-w-0 items-center gap-2 rounded-lg border border-slate-600 bg-slate-800 px-2 py-2 text-xs">
          <Store size={15} className="shrink-0 text-teal-300" />
          <select
            aria-label="Current branch"
            className="w-[110px] sm:w-[210px] bg-slate-800 outline-none"
            value={currentOutlet}
            onChange={(e) => onSelectOutlet(e.target.value)}
          >
            {outlets.map((o) => (
              <option key={o.id} value={o.name}>
                {o.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {canHold && (
          <button
            onClick={onOpenHoldModal}
            className="flex items-center gap-2 rounded-lg border border-slate-600 px-2.5 py-2 text-xs hover:bg-slate-800"
            aria-label={`Held sales (${heldCount})`}
          >
            <Pause size={15} />
            <span className="hidden md:inline">Held sales</span>
            <span className="rounded bg-amber-300 px-1.5 text-slate-950">
              {heldCount}
            </span>
          </button>
        )}
        {canSell && (
          <button
            onClick={() => onSelectTab("pos-new")}
            className="hidden sm:flex items-center gap-1.5 rounded-lg bg-teal-500 px-3 py-2 text-xs font-semibold text-slate-950 hover:bg-teal-400"
          >
            <Plus size={16} />
            New sale
          </button>
        )}
        <button
          aria-label={muted ? "Enable sounds" : "Mute sounds"}
          className="hidden md:grid icon-button"
          onClick={() => setMuted(!sounds.toggleMute())}
        >
          {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
        <div className="hidden xl:flex items-center gap-2.5 border-l border-slate-700 pl-4 ml-1">
          <span className="grid size-9 place-items-center rounded-full bg-slate-700 text-sm font-semibold">
            {userName.slice(0, 1)}
          </span>
          <div>
            <p className="text-xs font-semibold">{userName}</p>
            <p className="text-[11px] text-slate-300">{currentUserRole}</p>
          </div>
        </div>
        <button
          disabled={isLoading}
          className="icon-button"
          aria-label="Sign out"
          onClick={() => {
            void signOut().catch(() => undefined);
          }}
        >
          <LogOut size={17} />
        </button>
      </div>
    </header>
  );
}
