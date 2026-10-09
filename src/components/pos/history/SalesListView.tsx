"use client";

import React, { useState } from "react";
import {
  Search,
  Plus,
  Printer,
  Eye,
  FileSpreadsheet,
  Download,
  RefreshCw,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
} from "lucide-react";
import { Customer, SaleRecord, useGetSalesQuery } from "@/redux/api/posApi";
import { InvoiceReceiptModal } from "../sale/InvoiceReceiptModal";
import { QueryState } from "../shared/QueryState";
import { ModernSpinner } from "@/components/ui/ModernSpinner";
import { downloadCsv, localDate, money } from "@/lib/pos";

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
  const [selectedRowId, setSelectedRowId] = useState<number | null>(null);
  const [density, setDensity] = useState<"compact" | "ultra">("compact");

  const [page, setPage] = useState(1);
  const {
    data: salesData,
    isLoading,
    isFetching,
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
  const totalRecords = salesData?.data?.total ?? sales.length;
  const lastPage = Math.max(1, salesData?.data?.last_page || 1);

  // Sums for current visible page
  const pagePayable = sales.reduce(
    (acc, s) => acc + (Number(s.payable_amount) || 0),
    0,
  );
  const pagePaid = sales.reduce(
    (acc, s) => acc + (Number(s.paid_amount) || 0),
    0,
  );
  const pageDue = sales.reduce(
    (acc, s) => acc + (Number(s.due_amount) || 0),
    0,
  );

  const hasActiveFilters = Boolean(
    startDate || endDate || selectedCustomerId || invoiceQuery,
  );

  const handleResetFilters = () => {
    setStartDate("");
    setEndDate("");
    setSelectedCustomerId("");
    setInvoiceQuery("");
    setPage(1);
  };

  const handleExportCsv = () => {
    if (!sales.length) return;
    const exportRows = sales.map((sale, idx) => ({
      SL: (page - 1) * 15 + idx + 1,
      "Invoice ID": sale.invoice_id,
      Date: sale.sale_date,
      Customer: sale.customer?.name || "Walk-in",
      Supplier: sale.supplier?.name || "Direct",
      Seller: sale.user?.name || "Cashier",
      Marketer: sale.marketer?.name || "-",
      "Payable Amount": Number(sale.payable_amount || 0).toFixed(2),
      "Paid Amount": Number(sale.paid_amount || 0).toFixed(2),
      "Due Amount": Number(sale.due_amount || 0).toFixed(2),
    }));
    downloadCsv(`sales_register_${localDate()}`, exportRows);
  };

  const cellPadding =
    density === "ultra" ? "py-1 px-1.5 text-[11px]" : "py-1.5 px-2 text-[11px]";

  return (
    <div className="space-y-2 animate-in fade-in duration-150">
      {error && <QueryState error={error} retry={refetch} />}

      {/* Excel Workbook Header & Controls Bar */}
      <div className="bg-white border border-slate-300 rounded-lg shadow-2xs overflow-hidden">
        {/* Top Title & Action Strip */}
        <div className="px-3 py-2 bg-slate-50/80 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2.5">
          {/* Left: Workbook Identity */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shadow-2xs">
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Sales Register</span>
            </div>
            <span className="hidden sm:inline-flex items-center text-[10px] font-mono text-slate-500 bg-white border border-slate-200 px-1.5 py-0.5 rounded">
              Sheet1: Sales_Ledger
            </span>
            <span className="text-[11px] font-medium text-slate-500">
              {totalRecords} {totalRecords === 1 ? "record" : "records"}
            </span>
            {isFetching && (
              <span className="inline-flex items-center gap-1 text-[10px] text-teal-600 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
                <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                syncing
              </span>
            )}
          </div>

          {/* Right: Quick Tools */}
          <div className="flex items-center gap-1.5">
            {/* Density Selector */}
            <button
              type="button"
              onClick={() =>
                setDensity((d) => (d === "compact" ? "ultra" : "compact"))
              }
              className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 transition cursor-pointer"
              title="Toggle Row Density"
            >
              <SlidersHorizontal className="w-3 h-3 text-slate-500" />
              <span className="hidden md:inline">
                {density === "ultra" ? "Ultra-Compact" : "Compact"}
              </span>
            </button>

            {/* Export CSV / Excel */}
            <button
              type="button"
              onClick={handleExportCsv}
              disabled={!sales.length}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-semibold border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
              title="Export visible records to CSV (Excel compatible)"
            >
              <Download className="w-3 h-3 text-emerald-700" />
              <span>Export CSV</span>
            </button>

            {/* Refresh */}
            <button
              type="button"
              onClick={() => refetch()}
              className="p-1 rounded border border-slate-300 bg-white hover:bg-slate-50 text-slate-600 transition cursor-pointer"
              title="Refresh Data"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isFetching ? "animate-spin text-teal-600" : ""}`}
              />
            </button>

            {/* Add Sale Button */}
            <button
              type="button"
              onClick={onNavigateToNewSale}
              className="inline-flex items-center gap-1 px-3 py-1 rounded bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-2xs transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Sale</span>
            </button>
          </div>
        </div>

        {/* Excel Filter Ribbon / Formula Bar */}
        <div className="px-3 py-1.5 bg-white border-b border-slate-200">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Start Date */}
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-semibold uppercase text-slate-500 tracking-wider">
                From:
              </span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setPage(1);
                  setStartDate(e.target.value);
                }}
                className="h-7 px-2 text-[11px] font-mono rounded border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-600 text-slate-800"
              />
            </div>

            {/* End Date */}
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-semibold uppercase text-slate-500 tracking-wider">
                To:
              </span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setPage(1);
                  setEndDate(e.target.value);
                }}
                className="h-7 px-2 text-[11px] font-mono rounded border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-600 text-slate-800"
              />
            </div>

            {/* Customer Dropdown */}
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-semibold uppercase text-slate-500 tracking-wider">
                Cust:
              </span>
              <select
                value={selectedCustomerId}
                onChange={(e) => {
                  setPage(1);
                  setSelectedCustomerId(e.target.value);
                }}
                className="h-7 px-2 text-[11px] rounded border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-600 text-slate-800 max-w-[150px] truncate"
              >
                <option value="">All Customers</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Invoice ID Search */}
            <div className="flex items-center gap-1 flex-1 min-w-[160px]">
              <span className="text-[10px] font-semibold uppercase text-slate-500 tracking-wider">
                Inv:
              </span>
              <div className="relative w-full max-w-[220px]">
                <Search className="w-3 h-3 absolute left-2 top-2 text-slate-400" />
                <input
                  type="text"
                  placeholder="#S-202610..."
                  value={invoiceQuery}
                  onChange={(e) => {
                    setPage(1);
                    setInvoiceQuery(e.target.value);
                  }}
                  className="w-full h-7 pl-6 pr-2 text-[11px] font-mono rounded border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-600 text-slate-800 placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Reset Button */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 h-7 px-2 rounded border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-medium transition cursor-pointer"
                title="Reset all filters"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Excel Spreadsheet Table Container */}
      <div className="bg-white border border-slate-300 rounded-lg shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse select-text">
            {/* Spreadsheet Table Header */}
            <thead>
              <tr className="bg-slate-100/90 text-slate-700 text-[11px] font-semibold border-b border-slate-300 divide-x divide-slate-200">
                <th className="py-1 px-1.5 text-center w-9 select-none bg-slate-100">
                  <span className="text-[9px] text-slate-400 font-mono block leading-none">
                    #
                  </span>
                </th>
                <th className="py-1 px-2 min-w-[125px] select-none">
                  <div className="flex items-center justify-between">
                    <span>Invoice ID</span>
                    <span className="text-[9px] font-mono font-normal text-slate-400">
                      A
                    </span>
                  </div>
                </th>
                <th className="py-1 px-2 min-w-[90px] select-none">
                  <div className="flex items-center justify-between">
                    <span>Date</span>
                    <span className="text-[9px] font-mono font-normal text-slate-400">
                      B
                    </span>
                  </div>
                </th>
                <th className="py-1 px-2 min-w-[150px] select-none">
                  <div className="flex items-center justify-between">
                    <span>Customer</span>
                    <span className="text-[9px] font-mono font-normal text-slate-400">
                      C
                    </span>
                  </div>
                </th>
                <th className="py-1 px-2 min-w-[120px] select-none">
                  <div className="flex items-center justify-between">
                    <span>Supplier</span>
                    <span className="text-[9px] font-mono font-normal text-slate-400">
                      D
                    </span>
                  </div>
                </th>
                <th className="py-1 px-2 min-w-[105px] select-none">
                  <div className="flex items-center justify-between">
                    <span>Seller</span>
                    <span className="text-[9px] font-mono font-normal text-slate-400">
                      E
                    </span>
                  </div>
                </th>
                <th className="py-1 px-2 min-w-[105px] select-none">
                  <div className="flex items-center justify-between">
                    <span>Marketer</span>
                    <span className="text-[9px] font-mono font-normal text-slate-400">
                      F
                    </span>
                  </div>
                </th>
                <th className="py-1 px-2 min-w-[110px] text-right select-none">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono font-normal text-slate-400">
                      G
                    </span>
                    <span>Payable (৳)</span>
                  </div>
                </th>
                <th className="py-1 px-2 min-w-[110px] text-right select-none">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono font-normal text-slate-400">
                      H
                    </span>
                    <span>Paid (৳)</span>
                  </div>
                </th>
                <th className="py-1 px-2 min-w-[100px] text-right select-none">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono font-normal text-slate-400">
                      I
                    </span>
                    <span>Due (৳)</span>
                  </div>
                </th>
                <th className="py-1 px-2 min-w-[70px] text-center select-none w-20">
                  <div className="flex items-center justify-center">
                    <span>Action</span>
                  </div>
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-200">
              {isLoading ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center bg-white">
                    <div className="flex items-center justify-center gap-2">
                      <ModernSpinner size="sm" />
                      <span className="text-xs font-medium text-slate-500">
                        Loading sales register...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : sales.length === 0 ? (
                <tr>
                  <td
                    colSpan={11}
                    className="py-8 text-center text-slate-500 font-medium bg-white text-xs"
                  >
                    No sales matching criteria found.
                  </td>
                </tr>
              ) : (
                sales.map((sale, idx) => {
                  const isSelected = selectedRowId === sale.id;
                  const rowNumber = (page - 1) * 15 + idx + 1;
                  const dueVal = Number(sale.due_amount) || 0;

                  return (
                    <tr
                      key={sale.id}
                      onClick={() => setSelectedRowId(sale.id)}
                      className={`divide-x divide-slate-200 transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-emerald-50/70 ring-1 ring-inset ring-emerald-500/40"
                          : "odd:bg-white even:bg-slate-50/40 hover:bg-emerald-50/30"
                      }`}
                    >
                      {/* Row Index (#) - Excel style column */}
                      <td className="py-1 px-1 text-center font-mono text-[10px] text-slate-400 bg-slate-50/60 select-none border-r border-slate-200">
                        {rowNumber}
                      </td>

                      {/* Invoice ID */}
                      <td className={cellPadding}>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setViewingSale(sale);
                          }}
                          className="font-mono font-bold text-teal-800 hover:text-teal-950 hover:underline cursor-pointer text-left tracking-tight"
                          title="Click to view receipt"
                        >
                          {sale.invoice_id}
                        </button>
                      </td>

                      {/* Date */}
                      <td className={`${cellPadding} font-mono text-slate-600`}>
                        {sale.sale_date}
                      </td>

                      {/* Customer */}
                      <td
                        className={`${cellPadding} font-medium text-slate-900 max-w-[160px] truncate`}
                        title={sale.customer?.name || "Walk-in"}
                      >
                        {sale.customer?.name || "Walk-in"}
                      </td>

                      {/* Supplier */}
                      <td
                        className={`${cellPadding} text-slate-600 max-w-[130px] truncate`}
                        title={sale.supplier?.name || "Direct"}
                      >
                        {sale.supplier?.name || "Direct"}
                      </td>

                      {/* Seller */}
                      <td
                        className={`${cellPadding} text-slate-600 max-w-[110px] truncate`}
                        title={sale.user?.name || "Cashier"}
                      >
                        {sale.user?.name || "Cashier"}
                      </td>

                      {/* Marketer */}
                      <td
                        className={`${cellPadding} text-slate-500 max-w-[110px] truncate`}
                        title={sale.marketer?.name || "-"}
                      >
                        {sale.marketer?.name || "-"}
                      </td>

                      {/* Payable Amount */}
                      <td
                        className={`${cellPadding} text-right font-mono font-semibold tabular-nums text-slate-900`}
                      >
                        {money(sale.payable_amount)}
                      </td>

                      {/* Paid Amount */}
                      <td
                        className={`${cellPadding} text-right font-mono font-semibold tabular-nums text-emerald-700 bg-emerald-50/20`}
                      >
                        {money(sale.paid_amount)}
                      </td>

                      {/* Due Amount */}
                      <td
                        className={`${cellPadding} text-right font-mono tabular-nums font-bold ${
                          dueVal > 0
                            ? "text-rose-600 bg-rose-50/30"
                            : "text-slate-400 font-normal"
                        }`}
                      >
                        {money(sale.due_amount)}
                      </td>

                      {/* Actions */}
                      <td className="py-1 px-1.5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {/* View Receipt */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setViewingSale(sale);
                            }}
                            className="p-1 rounded bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200/80 transition cursor-pointer"
                            title="View Receipt"
                          >
                            <Eye className="w-3 h-3" />
                          </button>

                          {/* Print Receipt */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setViewingSale(sale);
                            }}
                            className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition cursor-pointer"
                            title="Print Thermal Receipt"
                          >
                            <Printer className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>

            {/* Excel Formula Summary Row (Total row) */}
            {sales.length > 0 && (
              <tfoot>
                <tr className="bg-slate-100/90 text-[11px] border-t-2 border-b-2 border-slate-300 divide-x divide-slate-200">
                  <td
                    colSpan={7}
                    className="py-1.5 px-3 text-right font-mono font-bold text-slate-700 uppercase tracking-wider text-[10px]"
                  >
                    ∑ Total (Current Page)
                  </td>
                  <td className="py-1.5 px-2 text-right font-mono font-bold tabular-nums text-slate-900 bg-slate-100">
                    {money(pagePayable)}
                  </td>
                  <td className="py-1.5 px-2 text-right font-mono font-bold tabular-nums text-emerald-800 bg-emerald-50/60">
                    {money(pagePaid)}
                  </td>
                  <td className="py-1.5 px-2 text-right font-mono font-bold tabular-nums text-rose-700 bg-rose-50/60">
                    {money(pageDue)}
                  </td>
                  <td className="py-1.5 px-1 bg-slate-100" />
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* Excel Status Bar & Inline Pagination */}
        <div className="bg-slate-100/80 border-t border-slate-300 px-3 py-1.5 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-600 select-none">
          {/* Left: Status & Sum Quick stats */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 font-semibold text-slate-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>READY</span>
            </div>

            <div className="h-3 w-px bg-slate-300" />

            <span className="text-slate-500">
              Showing{" "}
              <strong className="text-slate-800 font-mono">
                {sales.length}
              </strong>{" "}
              of{" "}
              <strong className="text-slate-800 font-mono">
                {totalRecords}
              </strong>
            </span>

            {sales.length > 0 && (
              <>
                <div className="h-3 w-px bg-slate-300 hidden sm:block" />
                <div className="hidden sm:flex items-center gap-2 font-mono text-[10px] text-slate-600">
                  <span>
                    Payable:{" "}
                    <strong className="text-slate-900 font-semibold">
                      ৳{money(pagePayable)}
                    </strong>
                  </span>
                  <span>•</span>
                  <span>
                    Paid:{" "}
                    <strong className="text-emerald-700 font-semibold">
                      ৳{money(pagePaid)}
                    </strong>
                  </span>
                  <span>•</span>
                  <span>
                    Due:{" "}
                    <strong className="text-rose-600 font-semibold">
                      ৳{money(pageDue)}
                    </strong>
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Right: Integrated Compact Pagination */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-mono mr-1">
              Page {page} / {lastPage}
            </span>

            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="inline-flex items-center justify-center h-6 px-1.5 rounded border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-xs transition cursor-pointer"
              title="Previous Page"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
              disabled={page >= lastPage}
              className="inline-flex items-center justify-center h-6 px-1.5 rounded border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-xs transition cursor-pointer"
              title="Next Page"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
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
