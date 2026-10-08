"use client";
import { useState } from "react";
import { Receipt, Plus, Download } from "lucide-react";
import {
  FinancialAccount,
  useCreateExpenseMutation,
  useGetExpensesQuery,
} from "@/redux/api/posApi";
import { localDate, money, errorMessage, downloadCsv } from "@/lib/pos";
import { Modal } from "../shared/Modal";
import { QueryState, Pagination } from "../shared/QueryState";
import toast from "react-hot-toast";
export function ExpensesView({ accounts }: { accounts: FinancialAccount[] }) {
  const [date, setDate] = useState("");
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    expense_category: "Office Expense",
    amount: 0,
    expense_date: localDate(),
    account_name: accounts[0]?.name || "",
    payee_name: "",
    note: "",
  });
  const { data, isLoading, error, refetch } = useGetExpensesQuery({
    date: date || undefined,
    page,
  });
  const [create, { isLoading: saving }] = useCreateExpenseMutation();
  const rows = data?.data.data || [];
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    try {
      await create(form).unwrap();
      toast.success("Expense recorded.");
      setOpen(false);
      setForm({ ...form, title: "", amount: 0, note: "", payee_name: "" });
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[.18em] text-teal-700 font-semibold mb-1">
            Finance / Expenses
          </p>
          <h1 className="text-2xl font-semibold text-slate-900">
            Expense vouchers
          </h1>
          <p className="mt-1 text-xs text-slate-600">
            Record operating costs and keep account balances current.
          </p>
        </div>
        <button className="pos-button" onClick={() => setOpen(true)}>
          <Plus size={16} />
          Record expense
        </button>
      </div>
      <div className="panel overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-slate-200">
          <label className="flex items-center gap-3 text-xs font-medium">
            <Receipt size={18} className="text-teal-700" />
            Expense date
            <input
              aria-label="Filter expense date"
              className="pos-field w-auto"
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                setPage(1);
              }}
            />
          </label>
          <button
            className="pos-button-secondary"
            disabled={!rows.length}
            onClick={() =>
              downloadCsv(
                "expenses-page-" + page,
                rows.map((row) => ({ ...row })),
              )
            }
          >
            <Download size={15} />
            Export this page
          </button>
        </div>
        {isLoading || error ? (
          <QueryState loading={isLoading} error={error} retry={refetch} />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="pos-table">
                <thead>
                  <tr>
                    {[
                      "Voucher / Date",
                      "Expense",
                      "Category",
                      "Account",
                      "Payee",
                      "Amount (TK)",
                    ].map((h) => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id}>
                      <td>
                        <p className="font-mono text-[10px]">
                          {row.voucher_no}
                        </p>
                        <p className="mt-1">{row.expense_date.slice(0, 10)}</p>
                      </td>
                      <td className="font-medium">{row.title}</td>
                      <td>{row.expense_category}</td>
                      <td>{row.account_name}</td>
                      <td>{row.payee_name || "—"}</td>
                      <td className="font-semibold tabular-nums">
                        {money(row.amount)}
                      </td>
                    </tr>
                  ))}
                  {!rows.length && (
                    <tr>
                      <td colSpan={6} className="py-10 text-center">
                        No expenses recorded for this filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <Pagination
              page={page}
              lastPage={data?.data.last_page || 1}
              onChange={setPage}
            />
          </>
        )}
      </div>
      {open && (
        <Modal
          title="Record expense"
          onClose={() => {
            if (!saving) setOpen(false);
          }}
        >
          <form className="space-y-4" onSubmit={save}>
            <label>
              <span className="pos-label">Title</span>
              <input
                required
                className="pos-field"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label>
                <span className="pos-label">Category</span>
                <select
                  className="pos-field"
                  value={form.expense_category}
                  onChange={(e) =>
                    setForm({ ...form, expense_category: e.target.value })
                  }
                >
                  {[
                    "Office Expense",
                    "Electricity bill",
                    "Employee Salary",
                    "Transportation Cost",
                    "Daily Allowance",
                    "Food Expense",
                    "Advanced salary",
                    "Others",
                  ].map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </label>
              <label>
                <span className="pos-label">Amount (TK)</span>
                <input
                  required
                  type="number"
                  min="0.01"
                  step="0.01"
                  className="pos-field"
                  value={form.amount || ""}
                  onChange={(e) =>
                    setForm({ ...form, amount: Number(e.target.value) })
                  }
                />
              </label>
              <label>
                <span className="pos-label">Date</span>
                <input
                  required
                  type="date"
                  className="pos-field"
                  value={form.expense_date}
                  onChange={(e) =>
                    setForm({ ...form, expense_date: e.target.value })
                  }
                />
              </label>
              <label>
                <span className="pos-label">Payment account</span>
                <select
                  required
                  className="pos-field"
                  value={form.account_name}
                  onChange={(e) =>
                    setForm({ ...form, account_name: e.target.value })
                  }
                >
                  <option value="">Choose account</option>
                  {accounts.map((a) => (
                    <option key={a.id}>{a.name}</option>
                  ))}
                </select>
              </label>
            </div>
            <label>
              <span className="pos-label">Payee</span>
              <input
                className="pos-field"
                value={form.payee_name}
                onChange={(e) =>
                  setForm({ ...form, payee_name: e.target.value })
                }
              />
            </label>
            <label>
              <span className="pos-label">Note</span>
              <textarea
                className="pos-field"
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
              />
            </label>
            <button disabled={saving} className="pos-button w-full">
              {saving ? "Saving…" : "Save expense"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
