"use client";

import { Pagination, QueryState } from "../shared/QueryState";

import React, { useState } from "react";
import { Search, Plus, Printer, Eye, FileText } from "lucide-react";
import { Customer, SaleRecord, useGetSalesQuery } from "@/redux/api/posApi";
import { InvoiceReceiptModal } from "../sale/InvoiceReceiptModal";

export interface SalesListViewProps {
  customers: Customer[];
  onNavigateToNewSale: () => void;
  outletName: string;
}

export function SalesListView({
  customers,
  onNavigateToNewSale,
  outletName,
}: SalesListViewProps) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [invoiceQuery, setInvoiceQuery] = useState("");
  const [viewingSale, setViewingSale] = useState<SaleRecord | null>(null);

  const [page, setPage] = useState(1);
  const {
    data: salesData,
    isLoading,
    refetch,
    error,
  } = useGetSalesQuery({
    page,
    start_date: startDate || undefined,
    end_date: endDate || undefined,
    customer_id: selectedCustomerId || undefined,
    invoice_id: invoiceQuery || undefined,
  });

  const sales = salesData?.data?.data || [];

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {error && <QueryState error={error} retry={refetch} />}
      <Pagination
        page={page}
        lastPage={salesData?.data?.last_page || 1}
        onChange={setPage}
      />
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-teal-700" />
          <h2 className="text-base font-bold text-slate-900 tracking-wide">
            Sale Information
          </h2>
        </div>

        <button
          type="button"
          onClick={onNavigateToNewSale}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-sm transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Sales</span>
        </button>
      </div>

      {/* Filter Row (Matching Image 4) */}
      <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs items-end">
          {/* Start Date */}
          <div>
            <label className="block text-slate-800 font-semibold mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setPage(1);
                setStartDate(e.target.value);
              }}
              className="w-full h-8.5 px-2.5 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-teal-600"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-slate-800 font-semibold mb-1">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setPage(1);
                setEndDate(e.target.value);
              }}
              className="w-full h-8.5 px-2.5 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-teal-600"
            />
          </div>

          {/* Customer */}
          <div>
            <label className="block text-slate-800 font-semibold mb-1">
              Customer
            </label>
            <select
              value={selectedCustomerId}
              onChange={(e) => {
                setPage(1);
                setSelectedCustomerId(e.target.value);
              }}
              className="w-full h-8.5 px-2.5 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-teal-600"
            >
              <option value="">All Customers</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Invoice ID */}
          <div>
            <label className="block text-slate-800 font-semibold mb-1">
              Invoice Id
            </label>
            <input
              type="text"
              placeholder="#S-202610..."
              value={invoiceQuery}
              onChange={(e) => {
                setPage(1);
                setInvoiceQuery(e.target.value);
              }}
              className="w-full h-8.5 px-2.5 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-teal-600 placeholder:text-slate-400"
            />
          </div>

          {/* Search Button */}
          <div>
            <button
              type="button"
              onClick={() => refetch()}
              className="w-full h-8.5 px-4 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-bold flex items-center justify-center gap-1.5 shadow-sm transition cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>Search</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sales Table (Matching Image 4) */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-slate-100 text-slate-800 font-bold uppercase text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-3 text-center w-10">#</th>
                <th className="py-3 px-3">Invoice ID</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Customer</th>
                <th className="py-3 px-3">Supplier</th>
                <th className="py-3 px-3">Seller</th>
                <th className="py-3 px-3">Marketer</th>
                <th className="py-3 px-3 text-right">Payable Amount</th>
                <th className="py-3 px-3 text-right">Paid Amount</th>
                <th className="py-3 px-3 text-right">Due</th>
                <th className="py-3 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={11}
                    className="py-8 text-center text-slate-500 font-medium"
                  >
                    Loading sales records...
                  </td>
                </tr>
              ) : sales.length === 0 ? (
                <tr>
                  <td
                    colSpan={11}
                    className="py-8 text-center text-slate-500 font-medium"
                  >
                    No sales matching criteria found.
                  </td>
                </tr>
              ) : (
                sales.map((sale, idx) => (
                  <tr
                    key={sale.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="py-2.5 px-3 text-center text-slate-500 font-mono">
                      {idx + 1}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-teal-700">
                      {sale.invoice_id}
                    </td>
                    <td className="py-2.5 px-3 text-slate-800 font-medium">
                      {sale.sale_date}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">
                      {sale.customer?.name || "Walk-in"}
                    </td>
                    <td className="py-2.5 px-3 text-slate-700 max-w-[150px] truncate">
                      {sale.supplier?.name || "Direct"}
                    </td>
                    <td className="py-2.5 px-3 text-slate-700">
                      {sale.user?.name || "Cashier"}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">
                      {sale.marketer?.name || "-"}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-900">
                      {Number(sale.payable_amount).toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-emerald-700 font-bold">
                      {Number(sale.paid_amount).toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-rose-600">
                      {Number(sale.due_amount).toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* View Receipt */}
                        <button
                          type="button"
                          onClick={() => setViewingSale(sale)}
                          className="p-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 transition cursor-pointer"
                          title="View Receipt"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Print */}
                        <button
                          type="button"
                          onClick={() => setViewingSale(sale)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 transition cursor-pointer"
                          title="Print Thermal Receipt"
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

      {/* Thermal Receipt Preview Modal */}
      <InvoiceReceiptModal
        isOpen={!!viewingSale}
        onClose={() => setViewingSale(null)}
        sale={viewingSale}
        outletName={outletName}
      />
    </div>
  );
}
