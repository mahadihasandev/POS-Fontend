"use client";

import React from "react";
import { UserPlus, Calendar } from "lucide-react";
import { Customer, Supplier, Marketer } from "@/redux/api/posApi";

export interface PosCustomerRowProps {
  customers: Customer[];
  suppliers: Supplier[];
  marketers: Marketer[];
  selectedCustomerId: number | null;
  onSelectCustomer: (id: number | null) => void;
  selectedSupplierId: number | null;
  onSelectSupplier: (id: number | null) => void;
  selectedMarketerId: number | null;
  onSelectMarketer: (id: number | null) => void;
  saleDate: string;
  onChangeSaleDate: (date: string) => void;
  note: string;
  onChangeNote: (note: string) => void;
  customerInputRef?: React.RefObject<HTMLSelectElement | null>;
}

export function PosCustomerRow({
  customers,
  suppliers,
  marketers,
  selectedCustomerId,
  onSelectCustomer,
  selectedSupplierId,
  onSelectSupplier,
  selectedMarketerId,
  onSelectMarketer,
  saleDate,
  onChangeSaleDate,
  note,
  onChangeNote,
  customerInputRef,
}: PosCustomerRowProps) {
  const currentCustomer = customers.find((c) => c.id === selectedCustomerId);

  return (
    <div className="bg-white p-3 sm:p-4 rounded-b-none border border-slate-200 border-t-0 space-y-3 shadow-xs">
      {/* Top Fields Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        {/* Customer Select [F1] */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-slate-900 font-bold flex items-center gap-1">
              <span>Customer</span>
              <span className="text-teal-700 font-mono font-extrabold">[F1]</span>
              <span className="text-rose-600 font-bold">*</span>
            </label>
            <button
              type="button"
              title="Add New Customer"
              className="text-teal-700 hover:text-teal-800"
            >
              <UserPlus className="w-3.5 h-3.5" />
            </button>
          </div>
          <select
            ref={customerInputRef}
            value={selectedCustomerId ?? ""}
            onChange={(e) =>
              onSelectCustomer(e.target.value ? Number(e.target.value) : null)
            }
            className="w-full h-8.5 px-2.5 rounded-lg bg-white border border-slate-300 text-slate-900 font-semibold focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition"
          >
            <option value="">Walk-in Customer / Select...</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Customer Area */}
        <div>
          <label className="block text-slate-800 font-bold mb-1">
            Customer Area
          </label>
          <input
            type="text"
            readOnly
            value={currentCustomer?.area || "Default Zone"}
            placeholder="Customer Area"
            className="w-full h-8.5 px-2.5 rounded-lg bg-slate-100 border border-slate-300 text-slate-800 font-medium cursor-not-allowed"
          />
        </div>

        {/* Supplier Name */}
        <div>
          <label className="block text-slate-900 font-bold mb-1">
            Supplier Name <span className="text-rose-600">*</span>
          </label>
          <select
            value={selectedSupplierId ?? ""}
            onChange={(e) =>
              onSelectSupplier(e.target.value ? Number(e.target.value) : null)
            }
            className="w-full h-8.5 px-2.5 rounded-lg bg-white border border-slate-300 text-slate-900 font-semibold focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition"
          >
            <option value="">All Suppliers / Select Supplier</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Sale Date */}
        <div>
          <label className="block text-slate-900 font-bold mb-1 flex items-center justify-between">
            <span>Sale Date</span>
            <Calendar className="w-3.5 h-3.5 text-slate-600" />
          </label>
          <input
            type="date"
            value={saleDate}
            onChange={(e) => onChangeSaleDate(e.target.value)}
            className="w-full h-8.5 px-2.5 rounded-lg bg-white border border-slate-300 text-slate-900 font-semibold focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition"
          />
        </div>
      </div>

      {/* Second Row: Marketer & Note */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div>
          <label className="block text-slate-800 font-bold mb-1">
            Marketers Name
          </label>
          <select
            value={selectedMarketerId ?? ""}
            onChange={(e) =>
              onSelectMarketer(e.target.value ? Number(e.target.value) : null)
            }
            className="w-full h-8.5 px-2.5 rounded-lg bg-white border border-slate-300 text-slate-900 font-semibold focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition"
          >
            <option value="">Select Marketer...</option>
            {marketers.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-slate-800 font-bold mb-1">Note</label>
          <input
            type="text"
            value={note}
            onChange={(e) => onChangeNote(e.target.value)}
            placeholder="Add special instructions or delivery details..."
            className="w-full h-8.5 px-2.5 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder:text-slate-500 font-medium focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition"
          />
        </div>
      </div>
    </div>
  );
}
