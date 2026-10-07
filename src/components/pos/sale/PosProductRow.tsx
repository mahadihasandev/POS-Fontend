"use client";

import React, { useState } from "react";
import { Plus, Package } from "lucide-react";
import { Product } from "@/redux/api/posApi";
import { sounds } from "@/lib/sound";

export interface PosProductRowProps {
  products: Product[];
  onAddItem: (product: Product, quantity: number, price: number) => void;
  productInputRef?: React.RefObject<HTMLSelectElement | null>;
}

export function PosProductRow({
  products,
  onAddItem,
  productInputRef,
}: PosProductRowProps) {
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [qty, setQty] = useState<number>(1);
  const [unitPrice, setUnitPrice] = useState<number>(0);

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  const handleSelectProduct = (idStr: string) => {
    if (!idStr) {
      setSelectedProductId(null);
      setUnitPrice(0);
      setQty(1);
      return;
    }

    const id = Number(idStr);
    setSelectedProductId(id);
    const found = products.find((p) => p.id === id);
    if (found) {
      setUnitPrice(Number(found.unit_price));
      setQty(1);
    }
  };

  const handleAdd = () => {
    if (!selectedProduct) return;
    if (qty <= 0) return;

    onAddItem(selectedProduct, qty, unitPrice);
    sounds.playScanBeep();
    setSelectedProductId(null);
    setQty(1);
    setUnitPrice(0);
  };

  return (
    <div className="bg-white border-x border-b border-slate-200 p-3 sm:p-4 shadow-xs">
      <div className="grid grid-cols-2 sm:grid-cols-12 gap-2 sm:gap-3 text-xs items-end">
        {/* Product Select [F3] */}
        <div className="col-span-2 sm:col-span-5">
          <label className="text-slate-900 font-bold mb-1 flex items-center gap-1">
            <Package className="w-3.5 h-3.5 text-teal-700" />
            <span>Product Name</span>
            <span className="text-teal-700 font-mono font-extrabold">[F3]</span>
          </label>
          <select
            ref={productInputRef}
            value={selectedProductId ?? ""}
            onChange={(e) => handleSelectProduct(e.target.value)}
            className="w-full h-8.5 px-2.5 rounded-lg bg-white border border-slate-300 text-slate-900 font-semibold focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition"
          >
            <option value="">Select Product...</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.code}) — {Number(p.unit_price).toFixed(2)} TK
              </option>
            ))}
          </select>
        </div>

        {/* Available Qty */}
        <div className="col-span-1 sm:col-span-2">
          <label className="block text-slate-700 font-bold mb-1">
            Available Qty
          </label>
          <input
            type="text"
            readOnly
            value={selectedProduct ? `${selectedProduct.available_qty} ${selectedProduct.unit}` : "-"}
            className="w-full h-8.5 px-2.5 rounded-lg bg-slate-100 border border-slate-300 text-teal-800 font-mono font-bold cursor-not-allowed text-center"
          />
        </div>

        {/* Quantity */}
        <div className="col-span-1 sm:col-span-2">
          <label className="block text-slate-900 font-bold mb-1">
            Quantity
          </label>
          <input
            type="number"
            min={1}
            value={qty}
            onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full h-8.5 px-2.5 rounded-lg bg-white border border-slate-300 text-slate-900 font-mono font-bold text-center focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition"
          />
        </div>

        {/* Unit Price */}
        <div className="col-span-1 sm:col-span-2">
          <label className="block text-slate-900 font-bold mb-1">
            Unit Price (TK)
          </label>
          <input
            type="number"
            step="0.01"
            value={unitPrice || ""}
            onChange={(e) => setUnitPrice(parseFloat(e.target.value) || 0)}
            className="w-full h-8.5 px-2.5 rounded-lg bg-white border border-slate-300 text-slate-900 font-mono font-bold text-center focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition"
          />
        </div>

        {/* Add Button */}
        <div className="col-span-1 sm:col-span-1">
          <button
            type="button"
            disabled={!selectedProduct}
            onClick={handleAdd}
            className="w-full h-8.5 rounded-lg bg-teal-700 hover:bg-teal-600 active:bg-teal-800 disabled:opacity-40 disabled:cursor-not-allowed text-white font-extrabold flex items-center justify-center gap-1.5 shadow-sm transition cursor-pointer"
            title="Add Product to Cart"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span className="sm:hidden text-xs">Add</span>
          </button>
        </div>
      </div>
    </div>
  );
}
