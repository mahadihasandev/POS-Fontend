"use client";

import React from "react";
import {
  TrendingUp,
  Calendar,
  DollarSign,
  Building2,
  PieChart,
  MessageSquare,
  AlertCircle,
  ArrowUpRight,
} from "lucide-react";
import { useGetDashboardQuery } from "@/redux/api/posApi";

export function DashboardView() {
  const { data } = useGetDashboardQuery();

  const metrics = data?.data?.metrics || {
    today: { sale: 154644.2, purchase: 0 },
    yesterday: { sale: 319497.44, purchase: 0 },
    monthly: { sale: 1368162.47, purchase: 3978.0 },
    today_ga: { income: 4486.14, expense: 0 },
    monthly_ga: { income: 51662.13, expense: 33280.0 },
    liabilities: { payable_due: 6940202.3, receivable_due: 7410288.26 },
    sms_info: { balance: 2388.08, credit_limit: 0 },
    available_amount: 3784943.62,
  };

  const accounts = data?.data?.accounts || [
    { id: 1, name: "Cash", balance: 28395.62 },
    { id: 2, name: "Bkash", balance: 0.0 },
    { id: 3, name: "DATTA & BROTHERS ELECTRICS (UCB)", balance: 806075.0 },
    { id: 4, name: "DATTA & BROTHERS (UCB)", balance: 1168272.0 },
    { id: 5, name: "DBBL-123456", balance: 0.0 },
    { id: 6, name: "MOHITUSH DATTA (UCB)", balance: 0.0 },
    { id: 7, name: "MOHITUSH DATTA (PUBALI)", balance: 160708.0 },
    { id: 8, name: "DATTA & BROTHERS ELECTRICS (PUBALI)", balance: 1286043.0 },
    { id: 9, name: "DATTA & BROTHERS ELECTRIC (MERCANTILE)", balance: 335450.0 },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 8 Metric KPI Cards Grid (Exact replica of Image 5 with modern high-contrast styling) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: TODAY */}
        <div className="relative overflow-hidden rounded-2xl p-4 bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-900 border border-indigo-500/40 text-white shadow-xl">
          <div className="flex justify-between items-start">
            <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-200">
              TODAY
            </span>
            <div className="p-2 rounded-xl bg-white/10 text-white backdrop-blur-sm">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 space-y-1">
            <p className="text-base sm:text-lg font-mono font-extrabold tracking-tight">
              Sale: {Number(metrics.today.sale).toLocaleString()} TK
            </p>
            <p className="text-xs text-indigo-200 font-mono">
              Purchase: {Number(metrics.today.purchase).toFixed(2)} TK
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-indigo-400/20 text-[10px] text-indigo-200 flex items-center justify-between">
            <span>Compared to today</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Card 2: YESTERDAY */}
        <div className="relative overflow-hidden rounded-2xl p-4 bg-gradient-to-br from-rose-500 via-rose-600 to-rose-800 border border-rose-400/40 text-white shadow-xl">
          <div className="flex justify-between items-start">
            <span className="text-xs font-extrabold uppercase tracking-wider text-rose-200">
              YESTERDAY
            </span>
            <div className="p-2 rounded-xl bg-white/10 text-white backdrop-blur-sm">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 space-y-1">
            <p className="text-base sm:text-lg font-mono font-extrabold tracking-tight">
              Sale: {Number(metrics.yesterday.sale).toLocaleString()} TK
            </p>
            <p className="text-xs text-rose-200 font-mono">
              Purchase: {Number(metrics.yesterday.purchase).toFixed(2)} TK
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-rose-400/20 text-[10px] text-rose-200 flex items-center justify-between">
            <span>Compared to yesterday</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Card 3: MONTHLY */}
        <div className="relative overflow-hidden rounded-2xl p-4 bg-gradient-to-br from-emerald-600 via-teal-700 to-teal-900 border border-emerald-500/40 text-white shadow-xl">
          <div className="flex justify-between items-start">
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-200">
              MONTHLY
            </span>
            <div className="p-2 rounded-xl bg-white/10 text-white backdrop-blur-sm">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 space-y-1">
            <p className="text-base sm:text-lg font-mono font-extrabold tracking-tight">
              Sale: {Number(metrics.monthly.sale).toLocaleString()} TK
            </p>
            <p className="text-xs text-emerald-200 font-mono">
              Purchase: {Number(metrics.monthly.purchase).toLocaleString()} TK
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-emerald-400/20 text-[10px] text-emerald-200 flex items-center justify-between">
            <span>Compared to monthly</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Card 4: TODAY G/A */}
        <div className="relative overflow-hidden rounded-2xl p-4 bg-gradient-to-br from-violet-500 via-violet-600 to-violet-800 border border-violet-400/40 text-white shadow-xl">
          <div className="flex justify-between items-start">
            <span className="text-xs font-extrabold uppercase tracking-wider text-violet-200">
              TODAY G/A
            </span>
            <div className="p-2 rounded-xl bg-white/10 text-white backdrop-blur-sm">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 space-y-1">
            <p className="text-base sm:text-lg font-mono font-extrabold tracking-tight">
              Income: {Number(metrics.today_ga.income).toLocaleString()} TK
            </p>
            <p className="text-xs text-violet-200 font-mono">
              Expense: {Number(metrics.today_ga.expense).toFixed(2)} TK
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-violet-400/20 text-[10px] text-violet-200 flex items-center justify-between">
            <span>Compared to today</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Card 5: MONTHLY G/A */}
        <div className="relative overflow-hidden rounded-2xl p-4 bg-gradient-to-br from-purple-600 via-indigo-700 to-purple-900 border border-purple-400/40 text-white shadow-xl">
          <div className="flex justify-between items-start">
            <span className="text-xs font-extrabold uppercase tracking-wider text-purple-200">
              MONTHLY G/A
            </span>
            <div className="p-2 rounded-xl bg-white/10 text-white backdrop-blur-sm">
              <PieChart className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 space-y-1">
            <p className="text-base sm:text-lg font-mono font-extrabold tracking-tight">
              Income: {Number(metrics.monthly_ga.income).toLocaleString()} TK
            </p>
            <p className="text-xs text-purple-200 font-mono">
              Expense: {Number(metrics.monthly_ga.expense).toLocaleString()} TK
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-purple-400/20 text-[10px] text-purple-200">
            Net Margin: +{(Number(metrics.monthly_ga.income) - Number(metrics.monthly_ga.expense)).toLocaleString()} TK
          </div>
        </div>

        {/* Card 6: LIABILITIES */}
        <div className="relative overflow-hidden rounded-2xl p-4 bg-gradient-to-br from-rose-600 via-pink-700 to-rose-900 border border-rose-400/40 text-white shadow-xl">
          <div className="flex justify-between items-start">
            <span className="text-xs font-extrabold uppercase tracking-wider text-rose-200">
              LIABILITIES
            </span>
            <div className="p-2 rounded-xl bg-white/10 text-white backdrop-blur-sm">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 space-y-1">
            <p className="text-xs sm:text-sm font-mono font-bold tracking-tight">
              Payable: {Number(metrics.liabilities.payable_due).toLocaleString()} TK
            </p>
            <p className="text-xs sm:text-sm font-mono font-bold text-violet-200">
              Receivable: {Number(metrics.liabilities.receivable_due).toLocaleString()} TK
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-rose-400/20 text-[10px] text-rose-200">
            Total Outstanding Exposure
          </div>
        </div>

        {/* Card 7: SMS INFO */}
        <div className="relative overflow-hidden rounded-2xl p-4 bg-gradient-to-br from-lime-600 via-emerald-700 to-green-900 border border-lime-400/40 text-white shadow-xl">
          <div className="flex justify-between items-start">
            <span className="text-xs font-extrabold uppercase tracking-wider text-lime-200">
              SMS INFO
            </span>
            <div className="p-2 rounded-xl bg-white/10 text-white backdrop-blur-sm">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 space-y-1">
            <p className="text-base sm:text-lg font-mono font-extrabold tracking-tight">
              Balance: ৳{Number(metrics.sms_info.balance).toLocaleString()}
            </p>
            <p className="text-xs text-lime-200 font-mono">
              Credit Limit: {Number(metrics.sms_info.credit_limit).toFixed(2)} TK
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-lime-400/20 text-[10px] text-lime-200">
            SMS Gateway Active
          </div>
        </div>

        {/* Card 8: AVAILABLE AMOUNT */}
        <div className="relative overflow-hidden rounded-2xl p-4 bg-gradient-to-br from-violet-600 via-purple-700 to-violet-900 border border-violet-400/40 text-white shadow-xl">
          <div className="flex justify-between items-start">
            <span className="text-xs font-extrabold uppercase tracking-wider text-violet-200">
              AVAILABLE AMOUNT
            </span>
            <div className="p-2 rounded-xl bg-white/10 text-white backdrop-blur-sm">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 space-y-1">
            <p className="text-base sm:text-lg font-mono font-extrabold tracking-tight">
              Balance: {Number(metrics.available_amount).toLocaleString()} TK
            </p>
            <p className="text-xs text-violet-200">Across 9 Bank/Cash Ledgers</p>
          </div>
          <div className="mt-3 pt-2 border-t border-violet-400/20 text-[10px] text-violet-200">
            Liquid Capital
          </div>
        </div>
      </div>

      {/* Available Amount Accounts Breakdown (Exact replica of Image 5) */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-teal-700" />
            <h3 className="font-bold text-sm text-slate-900">Available Amount Breakdown</h3>
          </div>
          <div className="font-mono font-extrabold text-base text-teal-800">
            Total: {Number(metrics.available_amount).toLocaleString()} TK
          </div>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {accounts.map((acc, idx) => (
            <div
              key={acc.id || idx}
              className="px-5 py-2.5 flex items-center justify-between hover:bg-slate-50 transition-colors"
            >
              <span className="font-bold text-slate-800">{acc.name}</span>
              <span className="font-mono font-bold text-slate-900 text-right">
                {Number(acc.balance).toLocaleString("en-US", { minimumFractionDigits: 2 })}{" "}
                <span className="text-[10px] text-slate-500 font-normal">TK</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly Account Chart (Matching Image 5) */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-teal-700" />
            <h3 className="font-bold text-sm text-slate-900">Monthly Account Chart</h3>
          </div>
          <span className="text-xs text-slate-600 font-mono font-semibold">Current Fiscal Year</span>
        </div>

        {/* Responsive Stylized Trend Graph */}
        <div className="h-44 w-full pt-4 flex items-end justify-between gap-2 border-b border-slate-200 pb-2">
          {[
            { month: "Jan", val: 40, amt: "1.2M" },
            { month: "Feb", val: 55, amt: "1.5M" },
            { month: "Mar", val: 48, amt: "1.4M" },
            { month: "Apr", val: 65, amt: "1.9M" },
            { month: "May", val: 75, amt: "2.1M" },
            { month: "Jun", val: 60, amt: "1.8M" },
            { month: "Jul", val: 70, amt: "2.0M" },
            { month: "Aug", val: 82, amt: "2.4M" },
            { month: "Sep", val: 90, amt: "2.8M" },
            { month: "Oct", val: 95, amt: "3.2M" },
          ].map((bar, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
              <div className="text-[9px] font-mono font-bold text-teal-700 opacity-0 group-hover:opacity-100 transition-opacity">
                {bar.amt}
              </div>
              <div
                style={{ height: `${bar.val}%` }}
                className="w-full max-w-[28px] rounded-t-md bg-gradient-to-t from-teal-700 to-cyan-500 group-hover:from-teal-600 group-hover:to-cyan-400 transition-all shadow-sm"
              />
              <span className="text-[10px] font-bold text-slate-700">{bar.month}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
