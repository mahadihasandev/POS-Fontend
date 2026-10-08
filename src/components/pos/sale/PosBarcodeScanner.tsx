"use client";

import React, { useState } from "react";
import { Barcode, Zap } from "lucide-react";
import { sounds } from "@/lib/sound";

export interface PosBarcodeScannerProps {
  onScanBarcode: (barcode: string) => boolean;
  inputRef?: React.RefObject<HTMLInputElement | null>;
}

export function PosBarcodeScanner({
  onScanBarcode,
  inputRef,
}: PosBarcodeScannerProps) {
  const [code, setCode] = useState("");
  const [hasScanned, setHasScanned] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && code.trim().length > 0) {
      e.preventDefault();
      const success = onScanBarcode(code.trim());
      if (success) {
        sounds.playScanBeep();
        setHasScanned(true);
        setTimeout(() => setHasScanned(false), 300);
        setCode("");
      } else {
        sounds.playErrorBeep();
      }
    }
  };

  return (
    <div className="bg-white border-x border-b border-slate-200 p-2 sm:p-3 shadow-xs">
      <div className="flex items-center rounded-lg border-2 border-teal-600 bg-teal-50/20 shadow-xs overflow-hidden focus-within:border-teal-700 focus-within:ring-2 focus-within:ring-teal-500/20 transition-all">
        {/* Left Barcode Icon / Badge */}
        <div className="flex items-center gap-1.5 px-3 py-2 bg-teal-700 text-white font-semibold text-xs shrink-0 select-none">
          <Barcode className="w-4 h-4" />
          <span className="hidden sm:inline">Barcode</span>
          <span className="font-mono text-teal-100">[F2]</span>
        </div>

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Scan barcode here or press Enter... (e.g. 890123450001)"
          className="flex-1 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500 font-mono font-bold tracking-wide focus:outline-none"
        />

        {/* Rapid Scan indicator */}
        <div className="pr-3 flex items-center gap-1.5 text-xs text-slate-600 shrink-0">
          {hasScanned ? (
            <span className="text-emerald-700 font-semibold flex items-center gap-1 animate-pulse">
              <Zap className="w-3.5 h-3.5 fill-current" />
              Scanned!
            </span>
          ) : (
            <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
              Auto-adds on scan
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
