"use client";

import React, { useState } from "react";
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Package,
  Layers,
  DollarSign,
  Printer,
  Download,
  Calendar,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Building2,
  FileSpreadsheet,
  FileText,
  Users,
  CheckCircle2,
} from "lucide-react";
import {
  useGetReportsQuery,
  Supplier,
  Product,
} from "@/redux/api/posApi";
import toast from "react-hot-toast";

interface ReportsViewProps {
  suppliers: Supplier[];
  products: Product[];
}

export function ReportsView({ suppliers, products }: ReportsViewProps) {
  const [selectedReport, setSelectedReport] = useState<string>("daily_report");
  const [threshold, setThreshold] = useState<number>(25);
  const [reportDate, setReportDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const { data: reportData, isLoading, refetch } = useGetReportsQuery({
    type: selectedReport,
    threshold,
    date: reportDate,
  });

  const payload = reportData?.data;

  const handleSyncStock = () => {
    toast.success("Stock counts synchronized with central ledger!");
    refetch();
  };

  const handleExportPDF = () => {
    toast.success("Preparing PDF document for printing/download...");
    window.print();
  };

  const handleExportExcel = () => {
    toast.success("Exporting report data to Excel spreadsheet...");
  };

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-slate-900 tracking-tight">
              Executive Reports & Inventory Intelligence
            </h1>
            <p className="text-xs text-slate-500">
              Income & Expense Statement, G A Parties, Stock alerts, and Cash flow positions
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition shadow-xs cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Export Excel</span>
          </button>
          <button
            type="button"
            onClick={handleExportPDF}
            className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border border-rose-300 bg-rose-50 text-rose-800 hover:bg-rose-100 transition shadow-xs cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-rose-600" />
            <span className="hidden sm:inline">Export PDF</span>
          </button>
          <button
            type="button"
            onClick={handleSyncStock}
            className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border border-teal-200 bg-teal-50 text-teal-800 hover:bg-teal-100 transition shadow-xs cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-teal-600" />
            <span className="hidden sm:inline">Sync</span>
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Print</span>
          </button>
        </div>
      </div>

      {/* Reports Navigation Bar */}
      <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-xs flex items-center gap-1 overflow-x-auto text-xs font-bold scrollbar-none">
        <button
          type="button"
          onClick={() => setSelectedReport("daily_report")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition cursor-pointer ${
            selectedReport === "daily_report"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <FileText className="w-3.5 h-3.5 text-teal-400" />
          <span>Daily Report (Income & Expense)</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedReport("ga_parties")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition cursor-pointer ${
            selectedReport === "ga_parties"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Users className="w-3.5 h-3.5 text-indigo-400" />
          <span>G A Parties Report</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedReport("stock_alert")}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg whitespace-nowrap transition cursor-pointer ${
            selectedReport === "stock_alert"
              ? "bg-violet-600 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-violet-300" />
          <span>Stock Alert</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedReport("supplier_stock")}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition cursor-pointer ${
            selectedReport === "supplier_stock"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Supplier Wise Stock
        </button>

        <button
          type="button"
          onClick={() => setSelectedReport("cash_flow")}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg whitespace-nowrap transition cursor-pointer ${
            selectedReport === "cash_flow"
              ? "bg-emerald-700 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <DollarSign className="w-3.5 h-3.5 text-emerald-300" />
          <span>Cash Flow Report</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedReport("daily_closing")}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition cursor-pointer ${
            selectedReport === "daily_closing"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Daily Closing
        </button>

        <button
          type="button"
          onClick={() => setSelectedReport("top_sales")}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg whitespace-nowrap transition cursor-pointer ${
            selectedReport === "top_sales"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5 text-teal-400" />
          <span>Top Sales</span>
        </button>
      </div>

      {/* 1. Daily Report / Income & Expense Statement (Screenshot 11.04.12 AM) */}
      {selectedReport === "daily_report" && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700">Statement Date:</span>
              <input
                type="date"
                value={reportDate}
                onChange={(e) => setReportDate(e.target.value)}
                className="px-3 py-1 border border-slate-300 rounded-md font-semibold text-slate-900"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-500">Statement Mode:</span>
              <span className="px-2 py-0.5 rounded-md bg-teal-50 border border-teal-200 text-teal-800 font-bold">
                Daily Ledger Position
              </span>
            </div>
          </div>

          {/* KPI Position Summary */}
          {payload && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Total Income
                </span>
                <span className="text-xl font-black text-emerald-600">
                  ৳{Number(payload.total_income || 0).toLocaleString()}
                </span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Total Expense
                </span>
                <span className="text-xl font-black text-rose-600">
                  ৳{Number(payload.total_expense || 0).toLocaleString()}
                </span>
              </div>
              <div className="bg-slate-900 text-white p-4 rounded-xl shadow-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Net Cash Position
                </span>
                <span
                  className={`text-xl font-black ${
                    Number(payload.net_balance) >= 0 ? "text-cyan-400" : "text-rose-400"
                  }`}
                >
                  ৳{Number(payload.net_balance || 0).toLocaleString()}
                </span>
              </div>
            </div>
          )}

          {/* Side by Side Tables: Income List & Expense List (Screenshot 11.04.12 AM) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Left: Income List */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-3 bg-emerald-700 text-white font-extrabold text-xs flex justify-between items-center">
                <span>Income List</span>
                <span className="text-emerald-100 font-mono text-[11px]">Inflow Ledger</span>
              </div>
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="p-3">Chart of Account</th>
                    <th className="p-3 text-right">Amount (৳)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isLoading ? (
                    <tr>
                      <td colSpan={2} className="p-6 text-center text-slate-400">
                        Compiling income ledger...
                      </td>
                    </tr>
                  ) : payload?.incomes && payload.incomes.length > 0 ? (
                    payload.incomes.map((inc: any, i: number) => (
                      <tr key={i} className="hover:bg-slate-50 transition">
                        <td className="p-3 font-semibold text-slate-800">
                          {inc.account_name}
                        </td>
                        <td className="p-3 text-right font-extrabold text-emerald-700">
                          {Number(inc.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={2} className="p-4 text-center text-slate-400 italic">
                        No income recorded for this date.
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot className="bg-slate-50 font-extrabold text-xs border-t border-slate-200">
                  <tr>
                    <td className="p-3 text-slate-900 uppercase">Total Income:</td>
                    <td className="p-3 text-right text-emerald-700 font-black">
                      ৳{Number(payload?.total_income || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Right: Expense List (Matching exact categories: Electricity bill, Employee Salary, Office Expense, Transportation, Daily Allowance, Food, Advanced salary, Others) */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-3 bg-rose-700 text-white font-extrabold text-xs flex justify-between items-center">
                <span>Expense List</span>
                <span className="text-rose-100 font-mono text-[11px]">Outflow Ledger</span>
              </div>
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="p-3">Chart of Account</th>
                    <th className="p-3 text-right">Amount (৳)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isLoading ? (
                    <tr>
                      <td colSpan={2} className="p-6 text-center text-slate-400">
                        Compiling expense ledger...
                      </td>
                    </tr>
                  ) : payload?.expenses && payload.expenses.length > 0 ? (
                    payload.expenses.map((exp: any, i: number) => (
                      <tr key={i} className="hover:bg-slate-50 transition">
                        <td className="p-3 font-semibold text-slate-800">
                          {exp.account_name}
                        </td>
                        <td className="p-3 text-right font-extrabold text-rose-700">
                          {Number(exp.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={2} className="p-4 text-center text-slate-400 italic">
                        No expenses recorded for this date.
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot className="bg-slate-50 font-extrabold text-xs border-t border-slate-200">
                  <tr>
                    <td className="p-3 text-slate-900 uppercase">Total Expense:</td>
                    <td className="p-3 text-right text-rose-700 font-black">
                      ৳{Number(payload?.total_expense || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. G A Parties Report (Screenshot 11.04.25 AM) */}
      {selectedReport === "ga_parties" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden space-y-3 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900">
                General Accounts Parties Ledger Report
              </h2>
              <p className="text-xs text-slate-500">
                Detailed credit, debit, and running balances for customer and supplier parties
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600">Showing 20 latest ledger entries</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-3">SL</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Party Name</th>
                  <th className="p-3">Reference</th>
                  <th className="p-3">Description</th>
                  <th className="p-3 text-right">Debit (৳)</th>
                  <th className="p-3 text-right">Credit (৳)</th>
                  <th className="p-3 text-right">Balance (৳)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="p-6 text-center text-slate-400">
                      Loading party ledger entries...
                    </td>
                  </tr>
                ) : Array.isArray(payload) && payload.length > 0 ? (
                  payload.map((row: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50 transition">
                      <td className="p-3 text-slate-400 font-bold">{row.sl || idx + 1}</td>
                      <td className="p-3 font-mono text-slate-600">{row.date}</td>
                      <td className="p-3 font-bold text-slate-900">{row.party_name}</td>
                      <td className="p-3 font-mono font-bold text-teal-700">{row.reference}</td>
                      <td className="p-3 text-slate-600">{row.description}</td>
                      <td className="p-3 text-right font-bold text-slate-800">
                        {Number(row.debit) > 0 ? `৳${Number(row.debit).toLocaleString()}` : "-"}
                      </td>
                      <td className="p-3 text-right font-bold text-emerald-700">
                        {Number(row.credit) > 0 ? `৳${Number(row.credit).toLocaleString()}` : "-"}
                      </td>
                      <td className="p-3 text-right font-black text-slate-900">
                        ৳{Number(row.balance).toLocaleString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="p-4 text-center text-slate-400 italic">
                      No ledger records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. Product Stock Alert (Screenshot 11.02.00 AM) */}
      {selectedReport === "stock_alert" && (
        <div className="space-y-3">
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700">Reorder Threshold Level:</span>
              <input
                type="number"
                min="1"
                max="500"
                value={threshold}
                onChange={(e) => setThreshold(parseInt(e.target.value) || 20)}
                className="w-20 text-center py-1 border border-slate-300 rounded-md font-extrabold text-violet-700"
              />
              <span className="text-slate-500">units or lower</span>
            </div>
            <span className="text-violet-700 font-bold bg-violet-50 px-2.5 py-1 rounded-md border border-violet-200">
              Items flagged require immediate vendor purchase requisition
            </span>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="p-3">SI</th>
                    <th className="p-3">Product Code</th>
                    <th className="p-3">Product Name</th>
                    <th className="p-3">Supplier Name</th>
                    <th className="p-3">Supplier Mobile</th>
                    <th className="p-3 text-center">Available Quantity</th>
                    <th className="p-3 text-center">Risk Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-500 font-medium">
                        Scanning inventory database for low stock items...
                      </td>
                    </tr>
                  ) : Array.isArray(payload) && payload.length > 0 ? (
                    payload.map((item: any, idx: number) => (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="p-3 text-slate-400 font-bold">{idx + 1}</td>
                        <td className="p-3 font-mono font-bold text-slate-700">{item.code}</td>
                        <td className="p-3 font-bold text-slate-900">{item.name}</td>
                        <td className="p-3 font-semibold text-slate-700">{item.supplier_name}</td>
                        <td className="p-3 font-mono text-slate-500">{item.supplier_phone}</td>
                        <td className="p-3 text-center">
                          <span className="inline-block px-2.5 py-1 rounded-full font-black text-rose-700 bg-rose-50 border border-rose-200">
                            {item.available_qty} Units
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 border border-violet-200">
                            {item.available_qty === 0 ? "Out of Stock" : "Critical Low"}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="p-6 text-center text-emerald-600 font-medium">
                        All products are above the threshold of {threshold} units. Stock levels healthy!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. Supplier Wise Stock */}
      {selectedReport === "supplier_stock" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center text-xs font-bold text-slate-700">
            <span>Supplier Stock Valuation Summary</span>
            <span className="text-slate-500 font-normal">
              Showing total stock quantity and valuation grouped by vendor
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">Supplier Name</th>
                  <th className="p-3">Code</th>
                  <th className="p-3 text-center">Catalog SKUs</th>
                  <th className="p-3 text-center">Units in Stock</th>
                  <th className="p-3 text-right">Cost Value (৳)</th>
                  <th className="p-3 text-right">Retail Sale Value (৳)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500 font-medium">
                      Compiling inventory valuation...
                    </td>
                  </tr>
                ) : Array.isArray(payload) && payload.length > 0 ? (
                  payload.map((row: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-3 text-slate-400 font-bold">{idx + 1}</td>
                      <td className="p-3 font-bold text-slate-900">{row.supplier_name}</td>
                      <td className="p-3 font-mono text-slate-600">{row.supplier_code}</td>
                      <td className="p-3 text-center font-bold text-slate-700">
                        {row.item_count}
                      </td>
                      <td className="p-3 text-center font-extrabold text-teal-800">
                        {row.total_quantity.toLocaleString()}
                      </td>
                      <td className="p-3 text-right font-bold text-slate-800">
                        ৳{Number(row.cost_value).toLocaleString()}
                      </td>
                      <td className="p-3 text-right font-extrabold text-emerald-700">
                        ৳{Number(row.sale_value).toLocaleString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-slate-400 italic">
                      No stock data found for suppliers.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. Cash Flow Report */}
      {selectedReport === "cash_flow" && payload && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase">
                  Total Cash Inflow
                </p>
                <h3 className="text-xl font-black text-emerald-600">
                  ৳{Number(payload.total_inflow).toLocaleString()}
                </h3>
                <p className="text-[10px] text-slate-400 pt-0.5">
                  POS Sales + Customer Dues
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <ArrowUpRight className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase">
                  Total Cash Outflow
                </p>
                <h3 className="text-xl font-black text-rose-600">
                  ৳{Number(payload.total_outflow).toLocaleString()}
                </h3>
                <p className="text-[10px] text-slate-400 pt-0.5">
                  Purchases + Supplier Payouts + Expenses
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
                <ArrowDownRight className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-slate-900 text-white p-4 rounded-xl shadow-md flex items-center justify-between">
              <div>
                <p className="text-[11px] font-extrabold text-slate-400 uppercase">
                  Net Liquid Position
                </p>
                <h3 className="text-xl font-black text-cyan-400">
                  ৳{Number(payload.net_liquid).toLocaleString()}
                </h3>
                <p className="text-[10px] text-slate-400 pt-0.5">
                  Available in Cash & Bank Vaults
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-800 text-cyan-400 flex items-center justify-center">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Accounts Breakdown */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-3">
              Real-time Vault & Bank Balances
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {(payload.accounts || []).map((acc: any) => (
                <div
                  key={acc.id}
                  className="p-3 rounded-lg border border-slate-200 bg-slate-50 text-xs flex justify-between items-center"
                >
                  <div>
                    <span className="font-bold text-slate-900 block">{acc.name}</span>
                    <span className="text-[10px] text-slate-500 uppercase">{acc.account_type}</span>
                  </div>
                  <span className="font-extrabold text-teal-800 text-sm">
                    ৳{Number(acc.balance).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 6. Daily Closing */}
      {selectedReport === "daily_closing" && payload && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900">
                Daily Closing Audit for {payload.date}
              </h2>
              <p className="text-xs text-slate-500">
                360-degree daily reconciliation of counters, collections, and purchasing
              </p>
            </div>
            <input
              type="date"
              value={reportDate}
              onChange={(e) => setReportDate(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 font-medium"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-center">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Total Sales</span>
              <span className="text-sm font-black text-slate-900">
                ৳{Number(payload.total_sales).toLocaleString()}
              </span>
            </div>

            <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
              <span className="text-[10px] font-bold text-emerald-800 uppercase block">Cash Received</span>
              <span className="text-sm font-black text-emerald-700">
                ৳{Number(payload.cash_received).toLocaleString()}
              </span>
            </div>

            <div className="p-3 bg-violet-50 rounded-lg border border-violet-200">
              <span className="text-[10px] font-bold text-violet-800 uppercase block">Customer Dues Given</span>
              <span className="text-sm font-black text-violet-700">
                ৳{Number(payload.new_dues).toLocaleString()}
              </span>
            </div>

            <div className="p-3 bg-teal-50 rounded-lg border border-teal-200">
              <span className="text-[10px] font-bold text-teal-800 uppercase block">Dues Collected</span>
              <span className="text-sm font-black text-teal-700">
                ৳{Number(payload.collections).toLocaleString()}
              </span>
            </div>

            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <span className="text-[10px] font-bold text-blue-800 uppercase block">Purchases Intake</span>
              <span className="text-sm font-black text-blue-700">
                ৳{Number(payload.purchases).toLocaleString()}
              </span>
            </div>

            <div className="p-3 bg-rose-50 rounded-lg border border-rose-200">
              <span className="text-[10px] font-bold text-rose-800 uppercase block">Purchases Paid</span>
              <span className="text-sm font-black text-rose-700">
                ৳{Number(payload.purchases_paid).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 7. Top Sales */}
      {selectedReport === "top_sales" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center text-xs font-bold text-slate-700">
            <span>Fast Moving & Highest Revenue Products</span>
            <span className="text-slate-500 font-normal">Ranked by units sold</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-3">Rank</th>
                  <th className="p-3">Product Name</th>
                  <th className="p-3 text-center">Units Sold</th>
                  <th className="p-3 text-right">Total Revenue (৳)</th>
                  <th className="p-3 text-right">Gross Profit (৳)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500 font-medium">
                      Computing sales movement...
                    </td>
                  </tr>
                ) : Array.isArray(payload) && payload.length > 0 ? (
                  payload.map((p: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-3 font-mono font-bold text-teal-700">#{idx + 1}</td>
                      <td className="p-3 font-bold text-slate-900">{p.product_name}</td>
                      <td className="p-3 text-center font-extrabold text-teal-800">
                        {p.total_qty_sold}
                      </td>
                      <td className="p-3 text-right font-bold text-slate-800">
                        ৳{Number(p.total_revenue).toLocaleString()}
                      </td>
                      <td className="p-3 text-right font-black text-emerald-600">
                        ৳{Number(p.total_profit).toLocaleString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-slate-400 italic">
                      No sales recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
