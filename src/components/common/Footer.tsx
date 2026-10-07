import React from "react";
import { CheckCircle2 } from "lucide-react";
import { Text } from "@/components/ui/typography";

export function Footer() {
  return (
    <footer className="border-t border-slate-850 py-8 text-center text-xs text-slate-500 bg-slate-950/60">
      <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <Text variant="small" className="text-slate-500">
          © 2026 Drive App Full-Stack Architecture. Built with Laravel 13 & Next.js App Router.
        </Text>
        <div className="flex items-center gap-4 text-slate-400">
          <span className="flex items-center gap-1.5 text-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Encrypted Dual-Layer JWT</span>
          </span>
          <span className="flex items-center gap-1.5 text-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>Modular Components</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
