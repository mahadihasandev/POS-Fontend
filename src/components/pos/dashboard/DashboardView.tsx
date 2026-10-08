"use client";
import {
  TrendingUp,
  Wallet,
  ShoppingBag,
  AlertTriangle,
  ArrowUpRight,
  RefreshCw,
} from "lucide-react";
import { useGetDashboardQuery } from "@/redux/api/posApi";
import { money } from "@/lib/pos";
import { QueryState } from "../shared/QueryState";
export function DashboardView() {
  const { data, isLoading, error, refetch } = useGetDashboardQuery();
  if (isLoading || error || !data)
    return <QueryState loading={isLoading} error={error} retry={refetch} />;
  const { metrics, accounts, recent_sales, stock, sales_trend } = data.data;
  const max = Math.max(1, ...sales_trend.map((d) => d.sale));
  const change =
    metrics.yesterday.sale > 0
      ? ((metrics.today.sale - metrics.yesterday.sale) /
          metrics.yesterday.sale) *
        100
      : null;
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[.18em] text-teal-700 mb-1">
            Overview / Business health
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Your store, at a glance
          </h1>
          <p className="mt-1 text-xs text-slate-600">
            Sales, cash, and inventory from your saved transactions.
          </p>
        </div>
        <button className="pos-button-secondary" onClick={refetch}>
          <RefreshCw size={15} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {[
          {
            label: "Sales today",
            value: metrics.today.sale,
            detail:
              change === null
                ? "No sales recorded yesterday"
                : `${change >= 0 ? "+" : ""}${change.toFixed(1)}% vs yesterday`,
            icon: TrendingUp,
            primary: true,
          },
          {
            label: "Sales this month",
            value: metrics.monthly.sale,
            detail: "Current calendar month",
            icon: ShoppingBag,
          },
          {
            label: "Available funds",
            value: metrics.available_amount,
            detail: `${accounts.length} cash & bank accounts`,
            icon: Wallet,
          },
          {
            label: "Customer dues",
            value: metrics.liabilities.receivable_due,
            detail: "Outstanding customer balances",
            icon: ArrowUpRight,
          },
        ].map(({ label, value, detail, icon: Icon, primary }) => (
          <div
            key={label}
            className={`rounded-2xl border p-4 sm:p-5 ${primary ? "bg-teal-900 border-teal-900 text-white" : "panel"}`}
          >
            <div className="flex justify-between gap-2">
              <p
                className={`text-xs font-medium ${primary ? "text-teal-100" : "text-slate-600"}`}
              >
                {label}
              </p>
              <Icon
                size={18}
                className={primary ? "text-teal-300" : "text-teal-700"}
              />
            </div>
            <p className="mt-4 text-xl sm:text-2xl font-semibold tracking-tight tabular-nums">
              {money(value)}
              <span
                className={`ml-1 text-[10px] font-normal ${primary ? "text-teal-100" : "text-slate-500"}`}
              >
                TK
              </span>
            </p>
            <p
              className={`mt-2 text-[10px] ${primary ? "text-teal-100" : "text-slate-500"}`}
            >
              {detail}
            </p>
          </div>
        ))}
      </div>
      <div className="grid xl:grid-cols-[1.7fr_1fr] gap-5">
        <div className="panel p-5">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-sm font-semibold">Sales performance</h2>
              <p className="text-[11px] text-slate-500 mt-1">
                Last 7 days · invoice revenue excluding prior dues
              </p>
            </div>
            <span className="rounded-full bg-teal-50 px-3 py-1 text-[10px] font-semibold text-teal-800">
              Live records
            </span>
          </div>
          <div
            className="mt-8 flex h-44 items-end justify-between gap-3"
            role="img"
            aria-label="Sales totals for the last seven days"
          >
            {sales_trend.map((day) => (
              <div
                key={day.date}
                className="flex h-full flex-1 flex-col justify-end items-center gap-2"
              >
                <span className="text-[9px] text-slate-600 tabular-nums">
                  {Math.round(day.sale).toLocaleString()}
                </span>
                <div
                  title={`${day.date}: ${money(day.sale)} TK`}
                  className="w-full max-w-12 rounded-t-md bg-teal-600"
                  style={{
                    height: `${Math.max(day.sale > 0 ? 3 : 1, (day.sale / max) * 120)}px`,
                    opacity: day.sale > 0 ? 1 : 0.2,
                  }}
                />
                <span className="text-[10px] text-slate-500">
                  {new Date(day.date + "T12:00:00").toLocaleDateString("en", {
                    weekday: "short",
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="panel p-5">
          <h2 className="text-sm font-semibold">Inventory attention</h2>
          <p className="text-[11px] text-slate-500 mt-1">
            Per-product replenishment thresholds
          </p>
          <div className="flex items-center gap-4 mt-6 rounded-xl bg-amber-50 p-4">
            <span className="grid size-11 place-items-center rounded-xl bg-amber-100 text-amber-800">
              <AlertTriangle size={21} />
            </span>
            <div>
              <p className="text-2xl font-semibold text-amber-900">
                {stock.low}
              </p>
              <p className="text-xs text-amber-900">
                Products need replenishment
              </p>
            </div>
          </div>
          <div className="mt-4 flex justify-between text-xs text-slate-600">
            <span>Out of stock</span>
            <strong className="text-rose-700">{stock.out}</strong>
          </div>
          <div className="mt-3 flex justify-between text-xs text-slate-600">
            <span>Active products</span>
            <strong className="text-slate-900">{stock.products}</strong>
          </div>
          <div className="mt-4 border-t border-slate-200 pt-4 flex justify-between text-xs">
            <span className="text-slate-600">Supplier dues</span>
            <strong className="tabular-nums">
              {money(metrics.liabilities.payable_due)} TK
            </strong>
          </div>
        </div>
      </div>
      <div className="grid xl:grid-cols-[1.7fr_1fr] gap-5">
        <div className="panel overflow-hidden">
          <div className="flex justify-between border-b border-slate-200 p-5">
            <h2 className="text-sm font-semibold">Recent sales</h2>
            <span className="text-[11px] text-slate-500">
              Latest 8 completed invoices
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="pos-table">
              <thead>
                <tr>
                  <th>Invoice / Customer</th>
                  <th>Date</th>
                  <th>Invoice total</th>
                  <th>Received</th>
                </tr>
              </thead>
              <tbody>
                {recent_sales.map((sale) => (
                  <tr key={sale.id}>
                    <td>
                      <p className="font-medium text-slate-900">
                        {sale.customer?.name || "Walk-in customer"}
                      </p>
                      <p className="mt-1 text-[9px] font-mono text-slate-500">
                        {sale.invoice_id}
                      </p>
                    </td>
                    <td className="whitespace-nowrap">
                      {sale.sale_date.slice(0, 10)}
                    </td>
                    <td className="tabular-nums">
                      {money(
                        Number(sale.invoice_total) -
                          Number(sale.discount) -
                          Number(sale.special_discount),
                      )}
                    </td>
                    <td className="tabular-nums text-teal-800">
                      {money(sale.paid_amount)}
                    </td>
                  </tr>
                ))}
                {!recent_sales.length && (
                  <tr>
                    <td colSpan={4} className="text-center py-10">
                      No completed sales yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className="panel p-5">
          <h2 className="text-sm font-semibold">Cash & bank accounts</h2>
          <div className="mt-4 space-y-4">
            {accounts.map((a) => (
              <div
                className="flex items-center justify-between gap-3 text-xs"
                key={a.id}
              >
                <span
                  className="max-w-[180px] truncate text-slate-600"
                  title={a.name}
                >
                  {a.name}
                </span>
                <span className="tabular-nums font-semibold">
                  {money(a.balance)}
                </span>
              </div>
            ))}
            {!accounts.length && (
              <p className="text-xs text-slate-500">No accounts configured.</p>
            )}
          </div>
          <div className="mt-5 border-t border-slate-200 pt-4">
            <div className="flex justify-between text-xs">
              <span className="text-slate-600">Expenses this month</span>
              <span className="font-semibold">
                {money(metrics.monthly_ga.expense)} TK
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
