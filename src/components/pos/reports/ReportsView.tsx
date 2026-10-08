"use client";
import { useState } from "react";
import { BarChart3, Download, Printer, RefreshCw } from "lucide-react";
import { useGetReportsQuery } from "@/redux/api/posApi";
import { downloadCsv, localDate, money } from "@/lib/pos";
import { QueryState } from "../shared/QueryState";
const reports = [
  ["daily_report", "Income & expense"],
  ["daily_closing", "Daily closing"],
  ["ga_parties", "Party ledger"],
  ["supplier_stock", "Supplier stock"],
  ["stock_alert", "Stock alerts"],
  ["top_sales", "Top products"],
  ["cash_flow", "Cash flow"],
];
const title = (key: string) => key.replaceAll("_", " ");
const isRows = (value: unknown): value is Record<string, unknown>[] =>
  Array.isArray(value) &&
  value.every((row) => typeof row === "object" && row !== null);
function Table({ rows }: { rows: Record<string, unknown>[] }) {
  const keys = Array.from(
    new Set(rows.flatMap((row) => Object.keys(row))),
  ).filter(
    (key) => key !== "id" && rows.some((row) => typeof row[key] !== "object"),
  );
  if (!rows.length)
    return (
      <p className="p-10 text-center text-xs text-slate-600">
        No records for this report.
      </p>
    );
  return (
    <div className="overflow-x-auto">
      <table className="pos-table">
        <thead>
          <tr>
            {keys.map((key) => (
              <th key={key}>{title(key)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              {keys.map((key) => (
                <td key={key} className="tabular-nums">
                  {row[key] == null
                    ? "—"
                    : typeof row[key] === "number" &&
                        ![
                          "quantity",
                          "available_qty",
                          "item_count",
                          "total_qty_sold",
                          "total_quantity",
                          "sl",
                        ].includes(key)
                      ? money(row[key] as number)
                      : String(row[key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export function ReportsView() {
  const [type, setType] = useState("daily_report");
  const [date, setDate] = useState(localDate());
  const [threshold, setThreshold] = useState("");
  const { data, isLoading, isFetching, error, refetch } = useGetReportsQuery({
    type,
    date,
    ...(threshold ? { threshold: Number(threshold) } : {}),
  });
  const payload = data?.data;
  const scalarRows =
    !Array.isArray(payload) && payload
      ? Object.entries(payload)
          .filter(
            ([, value]) => !Array.isArray(value) && typeof value !== "object",
          )
          .map(([metric, value]) => ({ metric: title(metric), value }))
      : [];
  const sections =
    !Array.isArray(payload) && payload
      ? Object.entries(payload).filter(([, value]) => isRows(value))
      : [];
  const exportRows = isRows(payload)
    ? payload
    : [
        ...scalarRows,
        ...sections.flatMap(([section, rows]) =>
          (rows as Record<string, unknown>[]).map((row) => ({
            section,
            ...row,
          })),
        ),
      ];
  return (
    <div className="space-y-5 report-print">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="mb-1 text-[10px] uppercase tracking-[.18em] text-teal-700 font-semibold">
            Insights / Reports
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Reports & audit
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Download the current report or print it for your records.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            className="pos-button-secondary"
            disabled={isFetching || !exportRows.length || !!error}
            onClick={() => downloadCsv(`${type}-${date}`, exportRows)}
          >
            <Download size={15} />
            Export CSV
          </button>
          <button
            className="pos-button-secondary"
            disabled={isFetching || !!error}
            onClick={() => window.print()}
          >
            <Printer size={15} />
            Print / PDF
          </button>
        </div>
      </div>
      <div className="panel p-4 flex flex-wrap gap-3 items-end no-print">
        <label className="min-w-48 flex-1">
          <span className="pos-label">Report</span>
          <select
            className="pos-field"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            {reports.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        {["daily_report", "daily_closing"].includes(type) && (
          <label>
            <span className="pos-label">Date</span>
            <input
              className="pos-field"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>
        )}
        {type === "stock_alert" && (
          <label>
            <span className="pos-label">Override threshold (optional)</span>
            <input
              className="pos-field"
              type="number"
              min={0}
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              placeholder="Use product thresholds"
            />
          </label>
        )}
        <button className="pos-button-secondary" onClick={refetch}>
          <RefreshCw size={15} />
          Refresh
        </button>
      </div>
      {isLoading || error ? (
        <QueryState loading={isLoading} error={error} retry={refetch} />
      ) : (
        <div
          className={`panel overflow-hidden ${isFetching ? "opacity-60" : ""}`}
          aria-busy={isFetching}
        >
          <div className="p-5 border-b border-slate-200 flex items-center gap-2">
            <BarChart3 size={18} className="text-teal-700" />
            <h2 className="font-semibold text-sm">
              {reports.find(([key]) => key === type)?.[1]}
            </h2>
            {["daily_report", "daily_closing"].includes(type) && (
              <span className="ml-auto text-xs text-slate-500">{date}</span>
            )}
          </div>
          {isRows(payload) ? (
            <Table rows={payload} />
          ) : (
            <>
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4 p-5">
                {scalarRows.map(({ metric, value }) => (
                  <div
                    key={metric}
                    className="rounded-xl border border-slate-200 p-4"
                  >
                    <p className="text-[10px] uppercase tracking-wider text-slate-500">
                      {metric}
                    </p>
                    <p className="mt-2 text-xl font-semibold tabular-nums">
                      {typeof value === "number" ? money(value) : String(value)}
                    </p>
                  </div>
                ))}
              </div>
              {sections.map(([section, rows]) => (
                <div key={section}>
                  <h3 className="px-5 py-3 text-xs font-semibold capitalize border-y border-slate-200 bg-slate-50">
                    {title(section)}
                  </h3>
                  <Table rows={rows as Record<string, unknown>[]} />
                </div>
              ))}
            </>
          )}
        </div>
      )}
      <p className="text-[11px] text-slate-500">
        Amounts in TK. Daily reports use the selected date; other reports
        summarize saved records. Cash flow includes receipts and recorded
        payouts.
      </p>
    </div>
  );
}
