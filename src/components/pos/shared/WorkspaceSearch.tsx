"use client";
import { useState } from "react";
import { ArrowUpRight, Search } from "lucide-react";
import { canOpenTab, workspacePages } from "@/lib/navigation";
import { Modal } from "./Modal";
export function WorkspaceSearch({
  permissions,
  isAdmin,
  onSelect,
  onClose,
}: {
  permissions: string[];
  isAdmin: boolean;
  onSelect: (tab: string) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const pages = workspacePages.filter(
    (page) =>
      canOpenTab(page.id, permissions, isAdmin) &&
      `${page.label} ${page.group}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
  );
  return (
    <Modal title="Find a workspace page" onClose={onClose}>
      <div className="relative mb-4">
        <Search size={18} className="absolute left-3 top-3 text-slate-500" />
        <input
          autoFocus
          aria-label="Search workspace pages"
          placeholder="Search sales, inventory, reports…"
          className="pos-field pl-10"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && pages[0]) {
              onSelect(pages[0].id);
              onClose();
            }
          }}
        />
      </div>
      <div className="max-h-[50vh] overflow-y-auto space-y-1">
        {pages.map((page) => (
          <button
            key={page.id}
            className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-left hover:bg-teal-50 focus-visible:bg-teal-50"
            onClick={() => {
              onSelect(page.id);
              onClose();
            }}
          >
            <span>
              <span className="block text-sm font-medium text-slate-900">
                {page.label}
              </span>
              <span className="text-xs text-slate-500">{page.group}</span>
            </span>
            <ArrowUpRight size={16} className="text-teal-700" />
          </button>
        ))}
        {!pages.length && (
          <p className="py-10 text-center text-sm text-slate-500">
            No matching pages. Try another search.
          </p>
        )}
      </div>
      <p className="mt-4 border-t border-slate-200 pt-3 text-xs text-slate-500">
        Enter opens the first result · Tab moves between results · Esc closes
      </p>
    </Modal>
  );
}
