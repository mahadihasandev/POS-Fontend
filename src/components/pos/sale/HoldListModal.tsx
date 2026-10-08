"use client";

import React from "react";
import { X, Play, Trash2, ShoppingBag, Clock } from "lucide-react";
import { SaleRecord } from "@/redux/api/posApi";

export interface HoldListModalProps {
  isOpen: boolean;
  onClose: () => void;
  heldSales: SaleRecord[];
  onResumeSale: (sale: SaleRecord) => void;
  onDiscardSale: (id: number) => void;
}

export function HoldListModal({
  isOpen,
  onClose,
  heldSales,
  onResumeSale,
  onDiscardSale,
}: HoldListModalProps) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Held orders"
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="w-full max-w-[95vw] sm:max-w-xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 sm:p-2 rounded-lg bg-teal-100 text-teal-800 shrink-0">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Held Orders Queue
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-600 font-medium line-clamp-1 sm:line-clamp-none">
                Restore held cart to resume billing without losing customer
                items
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-3 sm:p-5 overflow-y-auto space-y-2.5 sm:space-y-3 flex-1 bg-slate-50/50">
          {heldSales.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Clock className="w-10 h-10 mx-auto text-slate-400 mb-2" />
              <p className="text-sm font-bold text-slate-800">No Held Sales</p>
              <p className="text-xs text-slate-600 mt-1">
                When a cashier holds an active cart, it will appear here.
              </p>
            </div>
          ) : (
            heldSales.map((sale) => (
              <div
                key={sale.id}
                className="p-3 sm:p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 shadow-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold text-teal-800 text-sm">
                      {sale.invoice_id}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-teal-100 text-teal-900 border border-teal-300">
                      HELD
                    </span>
                  </div>
                  <p className="text-xs text-slate-800 font-medium">
                    Customer:{" "}
                    <span className="font-bold text-slate-900">
                      {sale.customer?.name || "Walk-in Customer"}
                    </span>
                  </p>
                  <p className="text-xs text-slate-600">
                    Items: {sale.items?.length || 0} • Total:{" "}
                    <span className="font-mono font-bold text-slate-900">
                      {Number(sale.invoice_total).toFixed(2)} TK
                    </span>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onResumeSale(sale)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Resume</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onDiscardSale(sale.id)}
                    className="p-2 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-700 transition cursor-pointer"
                    title="Discard held sale"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
