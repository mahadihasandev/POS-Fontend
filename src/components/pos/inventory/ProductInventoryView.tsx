"use client";

import React, { useState } from "react";
import { Package, Search, Barcode } from "lucide-react";
import { Product } from "@/redux/api/posApi";
import { Badge } from "@/components/ui/badge";

export interface ProductInventoryViewProps {
  products: Product[];
}

export function ProductInventoryView({
  products,
}: ProductInventoryViewProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.barcode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-teal-700" />
          <h2 className="text-base font-bold text-slate-900 tracking-wide">
            Product Catalog & Inventory Stock
          </h2>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, code, barcode..."
            className="w-full h-9 pl-9 pr-3 text-xs rounded-lg bg-slate-50 border border-slate-300 text-slate-900 font-medium placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-teal-600"
          />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-slate-100 text-slate-800 font-bold uppercase text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">Product Code</th>
                <th className="py-3 px-4">Barcode</th>
                <th className="py-3 px-4 text-center">Available Stock</th>
                <th className="py-3 px-4 text-right">Unit Price</th>
                <th className="py-3 px-4 text-right">Cost Price</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((p) => {
                const isLow = p.available_qty <= 40;
                return (
                  <tr key={p.id} className="hover:bg-slate-50 transition">
                    <td className="py-2.5 px-4 font-bold text-slate-900">
                      {p.name}
                    </td>
                    <td className="py-2.5 px-4 font-mono font-bold text-teal-700">
                      {p.code}
                    </td>
                    <td className="py-2.5 px-4 font-mono text-slate-800 flex items-center gap-1.5">
                      <Barcode className="w-3.5 h-3.5 text-slate-500" />
                      <span>{p.barcode}</span>
                    </td>
                    <td className="py-2.5 px-4 text-center font-mono font-bold text-slate-900">
                      {p.available_qty} {p.unit}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-emerald-700">
                      {Number(p.unit_price).toFixed(2)} TK
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono text-slate-700">
                      {Number(p.cost_price).toFixed(2)} TK
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <Badge variant={isLow ? "violet" : "emerald"}>
                        {isLow ? "Low Stock" : "In Stock"}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
