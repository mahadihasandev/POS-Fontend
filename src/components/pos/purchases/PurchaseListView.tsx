"use client";

import { Pagination, QueryState } from "../shared/QueryState";

import React, { useState } from "react";
import {
  ShoppingBag,
  Search,
  Printer,
  Eye,
  Plus,
  RefreshCw,
  DollarSign,
} from "lucide-react";
import { Supplier, useGetPurchasesQuery } from "@/redux/api/posApi";

interface PurchaseListViewProps {
  suppliers: Supplier[];
  onNavigateToNewPurchase: () => void;
  onNavigateToSupplierPayment: () => void;
}

export function PurchaseListView({
  suppliers,
  onNavigateToNewPurchase,
  onNavigateToSupplierPayment,
}: PurchaseListViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>("");
  const [viewingPurchase, setViewingPurchase] = useState<
    import("@/redux/api/posApi").PurchaseRecord | null
  >(null);

  const [page, setPage] = useState(1);
  const {
    data: purchasesData,
    isLoading,
    refetch,
    error,
  } = useGetPurchasesQuery({
    page,
    supplier_id: selectedSupplierId || undefined,
    chalan_no: searchTerm || undefined,
  });

  const list = purchasesData?.data?.data || [];

  return (
    <div className="space-y-4">
      {error && <QueryState error={error} retry={refetch} />}
      <Pagination
        page={page}
        lastPage={purchasesData?.data?.last_page || 1}
        onChange={setPage}
      />
      {/* Header bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-slate-900 tracking-tight">
              Purchase Information & Chalan List
            </h1>
            <p className="text-xs text-slate-500">
              Browse vendor supplier purchase invoices, chalan inventory intake,
              and payables
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => refetch()}
            className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50"
            title="Refresh List"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onNavigateToSupplierPayment}
            className="flex items-center gap-1.5 text-xs font-bold bg-violet-600 hover:bg-violet-700 text-white px-3 py-2 rounded-lg transition shadow-xs"
          >
            <DollarSign className="w-4 h-4" />
            <span>Supplier Payment</span>
          </button>
          <button
            type="button"
            onClick={onNavigateToNewPurchase}
            className="flex items-center gap-1.5 text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white px-3 py-2 rounded-lg transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>New Purchase</span>
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by Chalan / Invoice #..."
            value={searchTerm}
            onChange={(e) => {
              setPage(1);
              setSearchTerm(e.target.value);
            }}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="w-64">
          <select
            value={selectedSupplierId}
            onChange={(e) => {
              setPage(1);
              setSelectedSupplierId(e.target.value);
            }}
            className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
          >
            <option value="">All Suppliers</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-3.5 py-2.5">#</th>
                <th className="px-3.5 py-2.5">Chalan No</th>
                <th className="px-3.5 py-2.5">Date</th>
                <th className="px-3.5 py-2.5">Supplier</th>
                <th className="px-3.5 py-2.5 text-center">Items Count</th>
                <th className="px-3.5 py-2.5 text-right">Payable (৳)</th>
                <th className="px-3.5 py-2.5 text-right">Paid (৳)</th>
                <th className="px-3.5 py-2.5 text-right">Due (৳)</th>
                <th className="px-3.5 py-2.5 text-center">Status</th>
                <th className="px-3.5 py-2.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={10}
                    className="p-8 text-center text-slate-500 font-medium"
                  >
                    Loading purchases...
                  </td>
                </tr>
              ) : list.length === 0 ? (
                <tr>
                  <td
                    colSpan={10}
                    className="p-8 text-center text-slate-400 italic"
                  >
                    No purchase records found.
                  </td>
                </tr>
              ) : (
                list.map((p, idx) => (
                  <tr
                    key={p.id || idx}
                    className="hover:bg-slate-50 transition"
                  >
                    <td className="px-3.5 py-2.5 text-slate-400 font-semibold">
                      {idx + 1}
                    </td>
                    <td className="px-3.5 py-2.5 font-bold text-teal-800">
                      {p.chalan_no}
                    </td>
                    <td className="px-3.5 py-2.5 text-slate-600">
                      {p.purchase_date}
                    </td>
                    <td className="px-3.5 py-2.5 font-medium text-slate-900">
                      {p.supplier?.name || "General Supplier"}
                    </td>
                    <td className="px-3.5 py-2.5 text-center font-bold text-slate-700">
                      {p.items?.length || 1}
                    </td>
                    <td className="px-3.5 py-2.5 text-right font-bold text-slate-900">
                      ৳{Number(p.total_payable).toLocaleString()}
                    </td>
                    <td className="px-3.5 py-2.5 text-right font-bold text-emerald-600">
                      ৳{Number(p.paid_amount).toLocaleString()}
                    </td>
                    <td className="px-3.5 py-2.5 text-right font-black text-rose-600">
                      ৳{Number(p.due_amount).toLocaleString()}
                    </td>
                    <td className="px-3.5 py-2.5 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800">
                        {p.status || "Completed"}
                      </span>
                    </td>
                    <td className="px-3.5 py-2.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setViewingPurchase(p)}
                          className="p-1 rounded-md text-slate-600 hover:text-teal-600 hover:bg-teal-50"
                          title="View Chalan Items"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => window.print()}
                          className="p-1 rounded-md text-slate-600 hover:text-indigo-600 hover:bg-indigo-50"
                          title="Print Chalan"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Items Detail Modal */}
      {viewingPurchase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-5 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Chalan #{viewingPurchase.chalan_no}
                </h3>
                <p className="text-xs text-slate-500">
                  Supplier: {viewingPurchase.supplier?.name} | Date:{" "}
                  {viewingPurchase.purchase_date}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setViewingPurchase(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="overflow-x-auto max-h-72">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold">
                  <tr>
                    <th className="p-2">Product Name</th>
                    <th className="p-2 text-center">Qty</th>
                    <th className="p-2 text-center">Free Qty</th>
                    <th className="p-2 text-right">Unit Cost</th>
                    <th className="p-2 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(viewingPurchase.items || []).map((it, i) => (
                    <tr key={it.id || i}>
                      <td className="p-2 font-medium">{it.product_name}</td>
                      <td className="p-2 text-center font-bold">
                        {it.quantity}
                      </td>
                      <td className="p-2 text-center">{it.free_qty || 0}</td>
                      <td className="p-2 text-right">
                        ৳{Number(it.unit_cost).toLocaleString()}
                      </td>
                      <td className="p-2 text-right font-bold text-slate-900">
                        ৳{Number(it.subtotal).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="border-t border-slate-200 pt-3 flex justify-between text-xs font-bold text-slate-700">
              <span>
                Paid: ৳{Number(viewingPurchase.paid_amount).toLocaleString()}
              </span>
              <span>
                Due:{" "}
                <strong className="text-rose-600">
                  ৳{Number(viewingPurchase.due_amount).toLocaleString()}
                </strong>
              </span>
              <span>
                Total:{" "}
                <strong className="text-teal-700">
                  ৳{Number(viewingPurchase.total_payable).toLocaleString()}
                </strong>
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
