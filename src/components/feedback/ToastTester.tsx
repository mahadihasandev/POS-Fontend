"use client";

import React from "react";
import toast from "react-hot-toast";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ToastTester() {
  const triggerToast = (type: "success" | "error" | "loading") => {
    switch (type) {
      case "success":
        toast.success("Redux Toolkit + RTK Query store operational!");
        break;
      case "error":
        toast.error("Demonstrating custom dark-mode error toast.");
        break;
      case "loading": {
        const toastId = toast.loading("Simulating backend operation...");
        setTimeout(() => {
          toast.success("Operation finalized successfully!", { id: toastId });
        }, 1200);
        break;
      }
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl border border-slate-800 bg-slate-900/40">
      <div className="flex items-center gap-1.5 mr-2 text-xs font-medium text-slate-400">
        <Sparkles className="w-3.5 h-3.5 text-violet-400" />
        <span>Toast Triggers:</span>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => triggerToast("success")}
        className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 border border-emerald-500/20"
      >
        Success
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => triggerToast("error")}
        className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-rose-500/20"
      >
        Error
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => triggerToast("loading")}
        className="text-violet-400 hover:text-violet-300 hover:bg-violet-500/10 border border-violet-500/20"
      >
        Loading Promise
      </Button>
    </div>
  );
}
