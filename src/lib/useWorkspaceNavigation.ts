"use client";
import { useSyncExternalStore } from "react";
import { tabPermissions } from "./navigation";

function subscribe(callback: () => void) {
  window.addEventListener("hashchange", callback);
  window.addEventListener("popstate", callback);
  return () => {
    window.removeEventListener("hashchange", callback);
    window.removeEventListener("popstate", callback);
  };
}
function snapshot() {
  const tab = window.location.hash.slice(1);
  return Object.hasOwn(tabPermissions, tab) ? tab : "pos-new";
}
export function useWorkspaceNavigation() {
  const tab = useSyncExternalStore(subscribe, snapshot, () => "pos-new");
  const select = (next: string) => {
    if (
      !Object.hasOwn(tabPermissions, next) ||
      window.location.hash === `#${next}`
    )
      return;
    window.history.pushState(null, "", `#${next}`);
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  };
  return [tab, select] as const;
}
