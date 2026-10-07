"use client";

import React from "react";
import { Layers, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const handleQuickToast = () => {
    toast.success("System operational! RTK Query slice ready.");
  };

  return (
    <header className="border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Logo & Tag */}
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white shadow-lg shadow-indigo-500/20">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-base tracking-tight text-white">
              Drive<span className="text-indigo-400">App</span>
            </span>
            <span className="ml-2 text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
              Enterprise
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleQuickToast}
            leftIcon={<Sparkles className="w-3.5 h-3.5 text-violet-400" />}
            className="hidden sm:inline-flex"
          >
            Quick Toast
          </Button>

          <Badge variant="emerald" pulse>
            RTK Ready
          </Badge>
        </div>
      </div>
    </header>
  );
}
