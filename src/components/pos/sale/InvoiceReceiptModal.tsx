"use client";

import React, { useRef } from "react";
import { X, Printer, CheckCircle2 } from "lucide-react";
import { SaleRecord } from "@/redux/api/posApi";

export interface InvoiceReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: SaleRecord | null;
  outletName: string;
}

export function InvoiceReceiptModal({
  isOpen,
  onClose,
  sale,
  outletName,
}: InvoiceReceiptModalProps) {
  const receiptRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !sale) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-[95vw] sm:max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Actions */}
        <div className="px-3.5 sm:px-5 py-2.5 sm:py-3 border-b border-slate-200 flex items-center justify-between gap-2 bg-slate-50">
          <div className="flex items-center gap-1.5 text-emerald-700 font-extrabold text-[11px] sm:text-xs">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span className="truncate">Sale Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-xs transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Receipt</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Thermal Receipt (80mm simulation) */}
        <div className="p-6 overflow-y-auto bg-slate-100/70 flex justify-center">
          <div
            ref={receiptRef}
            className="w-full max-w-[340px] bg-white text-slate-950 p-5 rounded-lg shadow-md font-mono text-[11px] leading-tight select-text border border-slate-200"
          >
            {/* Store Banner */}
            <div className="text-center space-y-1 pb-3 border-b border-dashed border-slate-400">
              <h2 className="font-extrabold text-sm uppercase tracking-wide">
                {outletName}
              </h2>
              <p className="text-[10px] text-slate-600">
                Wholesale & Retail Electrical Goods
              </p>
              <p className="text-[10px] text-slate-600">Tel: +880 1711-000001</p>
            </div>

            {/* Invoice Meta */}
            <div className="py-2.5 border-b border-dashed border-slate-400 space-y-1 text-[10px]">
              <div className="flex justify-between">
                <span>INVOICE:</span>
                <span className="font-bold">{sale.invoice_id}</span>
              </div>
              <div className="flex justify-between">
                <span>DATE:</span>
                <span>{sale.sale_date}</span>
              </div>
              <div className="flex justify-between">
                <span>CUSTOMER:</span>
                <span className="font-bold">{sale.customer?.name || "Walk-in Customer"}</span>
              </div>
              {sale.user && (
                <div className="flex justify-between">
                  <span>CASHIER:</span>
                  <span>{sale.user.name}</span>
                </div>
              )}
            </div>

            {/* Line Items */}
            <div className="py-2.5 border-b border-dashed border-slate-400">
              <div className="flex justify-between font-bold pb-1 text-[10px] uppercase border-b border-slate-300">
                <span>Item</span>
                <span>Qty x Rate</span>
                <span>Amount</span>
              </div>
              <div className="space-y-1.5 pt-1.5">
                {sale.items?.map((it, i) => (
                  <div key={i} className="flex justify-between">
                    <div className="max-w-[140px] truncate">
                      {it.product_name}
                    </div>
                    <span>
                      {it.quantity} x {Number(it.unit_price).toFixed(0)}
                    </span>
                    <span className="font-bold">
                      {Number(it.subtotal).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Calculation Totals */}
            <div className="py-2.5 border-b border-dashed border-slate-400 space-y-1">
              <div className="flex justify-between">
                <span>INVOICE TOTAL:</span>
                <span>{Number(sale.invoice_total).toFixed(2)}</span>
              </div>
              {Number(sale.discount) > 0 && (
                <div className="flex justify-between">
                  <span>DISCOUNT:</span>
                  <span>-{Number(sale.discount).toFixed(2)}</span>
                </div>
              )}
              {Number(sale.special_discount) > 0 && (
                <div className="flex justify-between">
                  <span>SPECIAL DISC:</span>
                  <span>-{Number(sale.special_discount).toFixed(2)}</span>
                </div>
              )}
              {Number(sale.delivery_charge) > 0 && (
                <div className="flex justify-between">
                  <span>DELIVERY CHARGE:</span>
                  <span>+{Number(sale.delivery_charge).toFixed(2)}</span>
                </div>
              )}
              {Number(sale.previous_due) > 0 && (
                <div className="flex justify-between text-rose-700 font-bold">
                  <span>PREVIOUS DUE:</span>
                  <span>+{Number(sale.previous_due).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-xs font-extrabold pt-1 border-t border-slate-300">
                <span>TOTAL PAYABLE:</span>
                <span>{Number(sale.payable_amount).toFixed(2)} TK</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>PAID ({sale.payment_account}):</span>
                <span>{Number(sale.paid_amount).toFixed(2)} TK</span>
              </div>
              <div className="flex justify-between text-emerald-800 font-extrabold">
                <span>CHANGE RETURN:</span>
                <span>{Number(sale.change_return).toFixed(2)} TK</span>
              </div>
              {Number(sale.due_amount) > 0 && (
                <div className="flex justify-between text-rose-700 font-extrabold">
                  <span>REMAINING DUE:</span>
                  <span>{Number(sale.due_amount).toFixed(2)} TK</span>
                </div>
              )}
            </div>

            {/* Footer barcode & thank you */}
            <div className="pt-3 text-center space-y-1 text-[9px] text-slate-600">
              <p className="font-mono text-center tracking-widest text-xs font-bold text-slate-800">
                * {sale.invoice_id} *
              </p>
              <p>Thank you for your business!</p>
              <p>Goods once sold can only be exchanged within 7 days.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
