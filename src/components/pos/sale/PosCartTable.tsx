"use client";

import React from "react";
import { Trash2, Plus, Minus, ShoppingCart } from "lucide-react";
import { CartItem } from "@/redux/api/posApi";

export interface PosCartTableProps {
  items: CartItem[];
  onUpdateQty: (index: number, newQty: number) => void;
  onUpdateDiscount: (index: number, discountPercent: number) => void;
  onRemoveItem: (index: number) => void;
}

export function PosCartTable({
  items,
  onUpdateQty,
  onUpdateDiscount,
  onRemoveItem,
}: PosCartTableProps) {
  if (items.length === 0) {
    return (
      <div className="bg-white border-x border-b border-slate-200 rounded-b-xl p-12 text-center text-slate-500 flex flex-col items-center justify-center min-h-[300px] shadow-xs">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 mb-3">
          <ShoppingCart className="w-7 h-7" />
        </div>
        <p className="text-sm font-bold text-slate-800">Cart is Empty</p>
        <p className="text-xs text-slate-600 mt-1 max-w-xs font-medium">
          Scan a barcode with [F2] or select a product using [F3] to begin billing.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border-x border-b border-slate-200 rounded-b-xl overflow-hidden shadow-xs">
      {/* Mobile Swipe Hint */}
      <div className="sm:hidden px-3 py-1.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-[11px] text-slate-500 font-bold">
        <span>Cart Items ({items.length})</span>
        <span className="text-teal-700 animate-pulse">← Swipe table horizontally →</span>
      </div>

      <div className="overflow-x-auto min-h-[260px]">
        <table className="w-full text-left text-xs whitespace-nowrap">
          <thead className="bg-slate-100 text-slate-900 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
          <tr>
            <th className="py-2.5 px-3 text-center w-12">Sl.</th>
            <th className="py-2.5 px-3">Product Name</th>
            <th className="py-2.5 px-3">Product Code</th>
            <th className="py-2.5 px-3 text-center">Avail. Qty</th>
            <th className="py-2.5 px-3 text-center">Quantity</th>
            <th className="py-2.5 px-3 text-right">Price</th>
            <th className="py-2.5 px-3 text-center w-20">Dis.(%)</th>
            <th className="py-2.5 px-3 text-right">Subtotal</th>
            <th className="py-2.5 px-3 text-right">Profit</th>
            <th className="py-2.5 px-3 text-center w-12">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 text-slate-900">
          {items.map((item, idx) => (
            <tr
              key={`${item.product.id}-${idx}`}
              className="hover:bg-slate-50 transition-colors"
            >
              {/* Sl */}
              <td className="py-2 px-3 text-center font-mono font-bold text-slate-600">
                {idx + 1}
              </td>

              {/* Product Name */}
              <td className="py-2 px-3 font-bold text-slate-900">
                <span className="block max-w-[220px] truncate" title={item.product.name}>
                  {item.product.name}
                </span>
              </td>

              {/* Product Code */}
              <td className="py-2 px-3 font-mono font-semibold text-teal-700">
                {item.product.code}
              </td>

              {/* Avail Qty */}
              <td className="py-2 px-3 text-center text-slate-700 font-mono font-medium">
                {item.product.available_qty}
              </td>

              {/* Quantity Stepper */}
              <td className="py-2 px-3">
                <div className="flex items-center justify-center gap-1">
                  <button
                    type="button"
                    onClick={() => onUpdateQty(idx, Math.max(1, item.quantity - 1))}
                    className="w-5 h-5 rounded bg-slate-200 hover:bg-slate-300 text-slate-800 flex items-center justify-center font-bold cursor-pointer"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) =>
                      onUpdateQty(idx, Math.max(1, parseInt(e.target.value) || 1))
                    }
                    className="w-12 h-6 text-center font-mono font-bold text-slate-900 bg-white border border-slate-300 rounded text-xs focus:outline-none focus:border-teal-600"
                  />
                  <button
                    type="button"
                    onClick={() => onUpdateQty(idx, item.quantity + 1)}
                    className="w-5 h-5 rounded bg-slate-200 hover:bg-slate-300 text-slate-800 flex items-center justify-center font-bold cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </td>

              {/* Unit Price */}
              <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                {item.unit_price.toFixed(2)}
              </td>

              {/* Discount % */}
              <td className="py-2 px-3 text-center">
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={item.discount_percent || 0}
                  onChange={(e) =>
                    onUpdateDiscount(idx, parseFloat(e.target.value) || 0)
                  }
                  className="w-14 h-6 text-center font-mono font-bold text-slate-900 bg-white border border-slate-300 rounded text-xs focus:outline-none focus:border-teal-600"
                />
              </td>

              {/* Subtotal */}
              <td className="py-2 px-3 text-right font-mono font-extrabold text-teal-800">
                {item.subtotal.toFixed(2)}
              </td>

              {/* Profit */}
              <td className="py-2 px-3 text-right font-mono text-emerald-700 font-bold">
                +{item.profit.toFixed(2)}
              </td>

              {/* Action */}
              <td className="py-2 px-3 text-center">
                <button
                  type="button"
                  onClick={() => onRemoveItem(idx)}
                  className="p-1 rounded hover:bg-rose-100 text-rose-600 transition cursor-pointer"
                  title="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}
