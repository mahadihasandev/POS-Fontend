"use client";

import { Pagination, QueryState } from "../shared/QueryState";

import React, { useState } from "react";
import { RotateCcw, Search, Printer, Plus, RefreshCw } from "lucide-react";
import { useGetSaleReturnsQuery, Customer } from "@/redux/api/posApi";

interface SaleExchangeListViewProps {
  customers: Customer[];
  onNavigateToNewReturn: () => void;
}

export function SaleExchangeListView({
  customers,
  onNavigateToNewReturn,
}: SaleExchangeListViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");

  const [page, setPage] = useState(1);
  const {
    data: returnsData,
    isLoading,
    refetch,
    error,
  } = useGetSaleReturnsQuery({
    page,
    customer_id: selectedCustomerId || undefined,
    return_no: searchTerm || undefined,
  });

  const list = returnsData?.data?.data || [];

  return (
    <div className="space-y-4">
      {error && <QueryState error={error} retry={refetch} />}
      <Pagination
        page={page}
        lastPage={returnsData?.data?.last_page || 1}
        onChange={setPage}
      />
      {/* Top Header */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <RotateCcw className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-slate-900 tracking-tight">
              Sale Return & Exchange List
            </h1>
            <p className="text-xs text-slate-500">
              Audit log of product warranty returns, replacements, and ledger
              reconciliations
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
            onClick={onNavigateToNewReturn}
            className="flex items-center gap-1.5 text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white px-3 py-2 rounded-lg transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>New Return & Exchange</span>
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by Return # (e.g. RET-2026...)"
            value={searchTerm}
            onChange={(e) => {
              setPage(1);
              setSearchTerm(e.target.value);
            }}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="w-64">
          <select
            value={selectedCustomerId}
            onChange={(e) => {
              setPage(1);
              setSelectedCustomerId(e.target.value);
            }}
            className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
          >
            <option value="">All Customers</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.code})
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
                <th className="px-3.5 py-2.5">Return No</th>
                <th className="px-3.5 py-2.5">Date</th>
                <th className="px-3.5 py-2.5">Customer</th>
                <th className="px-3.5 py-2.5">Reference Invoice</th>
                <th className="px-3.5 py-2.5 text-right">Return Value</th>
                <th className="px-3.5 py-2.5 text-right">Exchange Value</th>
                <th className="px-3.5 py-2.5 text-right">Net Adjustment</th>
                <th className="px-3.5 py-2.5">Comments</th>
                <th className="px-3.5 py-2.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={10}
                    className="p-8 text-center text-slate-500 font-medium"
                  >
                    Loading sale return history...
                  </td>
                </tr>
              ) : list.length === 0 ? (
                <tr>
                  <td
                    colSpan={10}
                    className="p-8 text-center text-slate-400 italic"
                  >
                    No sale return records found.
                  </td>
                </tr>
              ) : (
                list.map((r, idx) => (
                  <tr
                    key={r.id || idx}
                    className="hover:bg-slate-50 transition"
                  >
                    <td className="px-3.5 py-2.5 text-slate-400 font-semibold">
                      {idx + 1}
                    </td>
                    <td className="px-3.5 py-2.5 font-bold text-indigo-700">
                      {r.return_no}
                    </td>
                    <td className="px-3.5 py-2.5 text-slate-600">
                      {r.return_date}
                    </td>
                    <td className="px-3.5 py-2.5 font-medium text-slate-900">
                      {r.customer?.name || "General Customer"}
                    </td>
                    <td className="px-3.5 py-2.5 text-slate-500">
                      {r.invoice_id || "—"}
                    </td>
                    <td className="px-3.5 py-2.5 text-right font-bold text-rose-600">
                      ৳{Number(r.return_amount).toLocaleString()}
                    </td>
                    <td className="px-3.5 py-2.5 text-right font-bold text-emerald-600">
                      ৳{Number(r.exchange_amount).toLocaleString()}
                    </td>
                    <td className="px-3.5 py-2.5 text-right font-extrabold text-slate-800">
                      ৳{Number(r.net_adjustment).toLocaleString()}
                    </td>
                    <td className="px-3.5 py-2.5 text-slate-500 max-w-xs truncate">
                      {r.comments || "—"}
                    </td>
                    <td className="px-3.5 py-2.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => window.print()}
                          className="p-1 rounded-md text-slate-600 hover:text-indigo-600 hover:bg-indigo-50"
                          title="Print Return Slip"
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
    </div>
  );
}
