"use client";
import { errorMessage } from "@/lib/pos";
import { localDate } from "@/lib/pos";

import { Pagination, QueryState } from "../shared/QueryState";
import React, { useState } from "react";
import {
  DollarSign,
  Wallet,
  ArrowRightLeft,
  Receipt,
  Plus,
  CheckCircle2,
} from "lucide-react";
import {
  FinancialAccount,
  useGetExpensesQuery,
  useCreateExpenseMutation,
  useCreateAccountTransferMutation,
} from "@/redux/api/posApi";
import toast from "react-hot-toast";

export interface AccountsViewProps {
  accounts: FinancialAccount[];
}

export function AccountsView({ accounts }: AccountsViewProps) {
  const [activeTab, setActiveTab] = useState<
    "balances" | "record_expense" | "bank_transfer" | "expenses_list"
  >("balances");

  // Expense form state
  const [expenseCategory, setExpenseCategory] = useState("Electricity bill");
  const [expenseTitle, setExpenseTitle] = useState("");
  const [expenseAmount, setExpenseAmount] = useState<number | "">("");
  const [expenseDate, setExpenseDate] = useState(localDate());
  const [expenseAccount, setExpenseAccount] = useState(accounts[0]?.name || "");
  const [payeeName, setPayeeName] = useState("");
  const [expenseNote, setExpenseNote] = useState("");

  // Transfer form state
  const [fromAccount, setFromAccount] = useState(accounts[0]?.name || "");
  const [toAccount, setToAccount] = useState(
    accounts.find((a) => a.name !== "Cash")?.name || "",
  );
  const [transferAmount, setTransferAmount] = useState<number | "">("");
  const [transferDate, setTransferDate] = useState(localDate());
  const [transferRef, setTransferRef] = useState("");

  // RTK Query
  const [expensePage, setExpensePage] = useState(1);
  const {
    data: expensesData,
    error: expenseError,
    refetch: refetchExpenses,
  } = useGetExpensesQuery({ page: expensePage });
  const [createExpense, { isLoading: isCreatingExpense }] =
    useCreateExpenseMutation();
  const [createTransfer, { isLoading: isCreatingTransfer }] =
    useCreateAccountTransferMutation();

  const totalBalance = accounts.reduce((sum, a) => sum + Number(a.balance), 0);

  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseAmount || Number(expenseAmount) <= 0) {
      toast.error("Please enter a valid expense amount");
      return;
    }
    if (!expenseTitle.trim()) {
      toast.error("Please enter expense purpose / title");
      return;
    }

    try {
      const res = await createExpense({
        expense_category: expenseCategory,
        title: expenseTitle,
        amount: Number(expenseAmount),
        expense_date: expenseDate,
        account_name: expenseAccount,
        payee_name: payeeName || undefined,
        note: expenseNote || undefined,
      }).unwrap();

      toast.success(res.message || "Expense voucher created successfully!");
      setExpenseTitle("");
      setExpenseAmount("");
      setPayeeName("");
      setExpenseNote("");
      refetchExpenses();
      setActiveTab("expenses_list");
    } catch (err: unknown) {
      toast.error(errorMessage(err, "Failed to record expense"));
    }
  };

  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferAmount || Number(transferAmount) <= 0) {
      toast.error("Please enter transfer amount");
      return;
    }
    if (fromAccount === toAccount) {
      toast.error("Source and destination accounts must be different");
      return;
    }

    try {
      const res = await createTransfer({
        from_account: fromAccount,
        to_account: toAccount,
        amount: Number(transferAmount),
        transfer_date: transferDate,
        reference: transferRef || undefined,
      }).unwrap();

      toast.success(res.message || "Funds transferred successfully!");
      setTransferAmount("");
      setTransferRef("");
      setActiveTab("balances");
    } catch (err: unknown) {
      toast.error(errorMessage(err, "Failed to process transfer"));
    }
  };

  const expensesList = expensesData?.data?.data || [];

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Top Header Card */}
      <div className="bg-white border border-slate-200 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-slate-900 tracking-tight">
              General Accounts & Liquid Ledger
            </h1>
            <p className="text-xs text-slate-500">
              Manage cash drawers, bank deposits, daily expense vouchers, and
              fund transfers
            </p>
          </div>
        </div>

        <div className="text-left sm:text-right pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
          <span className="text-[10px] text-slate-500 block uppercase tracking-wider font-extrabold">
            Total Capital in Vaults
          </span>
          <span className="font-mono font-black text-xl text-teal-800">
            ৳
            {totalBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Navigation Subtabs */}
      <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-xs flex items-center gap-1 overflow-x-auto text-xs font-bold scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab("balances")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition cursor-pointer ${
            activeTab === "balances"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Wallet className="w-3.5 h-3.5 text-teal-400" />
          <span>Accounts & Vaults</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("record_expense")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition cursor-pointer ${
            activeTab === "record_expense"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Plus className="w-3.5 h-3.5 text-rose-400" />
          <span>Record Expense Voucher</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("bank_transfer")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition cursor-pointer ${
            activeTab === "bank_transfer"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <ArrowRightLeft className="w-3.5 h-3.5 text-cyan-400" />
          <span>Bank Transfer</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("expenses_list")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition cursor-pointer ${
            activeTab === "expenses_list"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Receipt className="w-3.5 h-3.5 text-indigo-400" />
          <span>Expense History</span>
        </button>
      </div>

      {/* 1. Account Balances Grid */}
      {activeTab === "balances" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((acc) => (
            <div
              key={acc.id}
              className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs hover:border-slate-300 hover:shadow transition space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-teal-700 px-2 py-0.5 rounded bg-teal-50 border border-teal-200">
                  {acc.account_type}
                </span>
                <Wallet className="w-4 h-4 text-slate-400" />
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-sm line-clamp-1">
                  {acc.name}
                </h3>
                <p className="text-[11px] font-mono text-slate-500">
                  {acc.account_number || "A/C: Primary Ledger"}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-600 font-semibold">
                  Current Balance:
                </span>
                <span className="font-mono font-black text-sm text-slate-900">
                  ৳
                  {Number(acc.balance).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 2. Record Expense Voucher (Image 11.04.12 AM / 11.02.18 AM) */}
      {activeTab === "record_expense" && (
        <form
          onSubmit={handleExpenseSubmit}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4"
        >
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-extrabold text-slate-900">
              New General Expense Voucher
            </h2>
            <p className="text-xs text-slate-500">
              Record office bills, staff salaries, transportation, food, or
              advance disbursements
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Expense Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={expenseCategory}
                onChange={(e) => setExpenseCategory(e.target.value)}
                className="w-full h-9 px-2.5 rounded-lg border border-slate-300 font-bold text-slate-800 focus:outline-none focus:border-rose-600"
              >
                <option value="Electricity bill">Electricity bill</option>
                <option value="Employee Salary">Employee Salary</option>
                <option value="Office Expense">Office Expense</option>
                <option value="Transportation Cost">Transportation Cost</option>
                <option value="Daily Allowance">Daily Allowance</option>
                <option value="Food Expense">Food Expense</option>
                <option value="Advanced salary">Advanced salary</option>
                <option value="Shop Maintenance">
                  Shop Maintenance / Repairs
                </option>
                <option value="Others">Others</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Expense Title / Purpose <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. DESCO Commercial Bill October"
                value={expenseTitle}
                onChange={(e) => setExpenseTitle(e.target.value)}
                required
                className="w-full h-9 px-2.5 rounded-lg border border-slate-300 font-medium focus:outline-none focus:border-rose-600"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Amount (৳) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={expenseAmount}
                onChange={(e) =>
                  setExpenseAmount(
                    e.target.value ? parseFloat(e.target.value) : "",
                  )
                }
                required
                className="w-full h-9 px-2.5 rounded-lg border border-slate-300 font-black text-rose-700 focus:outline-none focus:border-rose-600"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Expense Date
              </label>
              <input
                type="date"
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
                className="w-full h-9 px-2.5 rounded-lg border border-slate-300 font-medium focus:outline-none focus:border-rose-600"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Debit From Account
              </label>
              <select
                value={expenseAccount}
                onChange={(e) => setExpenseAccount(e.target.value)}
                className="w-full h-9 px-2.5 rounded-lg border border-slate-300 font-semibold focus:outline-none focus:border-rose-600"
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.name}>
                    {a.name} (৳{Number(a.balance).toLocaleString()})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Payee / Beneficiary
              </label>
              <input
                type="text"
                placeholder="e.g. DESCO, Karim Transport, Staff name"
                value={payeeName}
                onChange={(e) => setPayeeName(e.target.value)}
                className="w-full h-9 px-2.5 rounded-lg border border-slate-300 font-medium focus:outline-none focus:border-rose-600"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1 text-xs">
              Voucher Notes
            </label>
            <input
              type="text"
              placeholder="Additional comments or payment voucher details..."
              value={expenseNote}
              onChange={(e) => setExpenseNote(e.target.value)}
              className="w-full h-9 px-2.5 rounded-lg border border-slate-300 text-xs font-medium focus:outline-none focus:border-rose-600"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isCreatingExpense}
              className="px-6 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-md transition disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {isCreatingExpense ? "Recording..." : "Save Expense Voucher"}
              </span>
            </button>
          </div>
        </form>
      )}

      {/* 3. Internal Bank Transfer (Image 11.02.26 AM) */}
      {activeTab === "bank_transfer" && (
        <form
          onSubmit={handleTransferSubmit}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4"
        >
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-extrabold text-slate-900">
              Internal Bank & Cash Transfer
            </h2>
            <p className="text-xs text-slate-500">
              Transfer liquid funds between cash registers and bank accounts
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Source Account (From) <span className="text-rose-500">*</span>
              </label>
              <select
                value={fromAccount}
                onChange={(e) => setFromAccount(e.target.value)}
                className="w-full h-9 px-2.5 rounded-lg border border-slate-300 font-semibold focus:outline-none focus:border-cyan-600"
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.name}>
                    {a.name} (৳{Number(a.balance).toLocaleString()})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Destination Account (To){" "}
                <span className="text-rose-500">*</span>
              </label>
              <select
                value={toAccount}
                onChange={(e) => setToAccount(e.target.value)}
                className="w-full h-9 px-2.5 rounded-lg border border-slate-300 font-semibold focus:outline-none focus:border-cyan-600"
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.name}>
                    {a.name} (৳{Number(a.balance).toLocaleString()})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Transfer Amount (৳) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="1"
                placeholder="0.00"
                value={transferAmount}
                onChange={(e) =>
                  setTransferAmount(
                    e.target.value ? parseFloat(e.target.value) : "",
                  )
                }
                required
                className="w-full h-9 px-2.5 rounded-lg border border-slate-300 font-black text-cyan-800 focus:outline-none focus:border-cyan-600"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Transfer Date
              </label>
              <input
                type="date"
                value={transferDate}
                onChange={(e) => setTransferDate(e.target.value)}
                className="w-full h-9 px-2.5 rounded-lg border border-slate-300 font-medium focus:outline-none focus:border-cyan-600"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1 text-xs">
              Deposit Slip / Cheque Reference
            </label>
            <input
              type="text"
              placeholder="e.g. Deposit Slip #78190 or Cheque #99104"
              value={transferRef}
              onChange={(e) => setTransferRef(e.target.value)}
              className="w-full h-9 px-2.5 rounded-lg border border-slate-300 text-xs font-medium focus:outline-none focus:border-cyan-600"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isCreatingTransfer}
              className="px-6 py-2 rounded-lg bg-cyan-700 hover:bg-cyan-800 text-white font-extrabold text-xs shadow-md transition disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
            >
              <ArrowRightLeft className="w-4 h-4" />
              <span>
                {isCreatingTransfer
                  ? "Transferring..."
                  : "Complete Bank Transfer"}
              </span>
            </button>
          </div>
        </form>
      )}

      {/* 4. Expenses List */}
      {activeTab === "expenses_list" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center text-xs font-bold text-slate-700">
            <span>Historical General Expense Vouchers</span>
            <button
              type="button"
              onClick={() => refetchExpenses()}
              className="text-teal-700 hover:underline cursor-pointer"
            >
              Refresh
            </button>
          </div>

          {expenseError && (
            <QueryState error={expenseError} retry={refetchExpenses} />
          )}
          <Pagination
            page={expensePage}
            lastPage={expensesData?.data.last_page || 1}
            onChange={setExpensePage}
          />
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-3">Voucher #</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Title / Description</th>
                  <th className="p-3">Payee</th>
                  <th className="p-3">Account</th>
                  <th className="p-3 text-right">Amount (৳)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {expensesList.length > 0 ? (
                  expensesList.map((exp) => (
                    <tr key={exp.id} className="hover:bg-slate-50 transition">
                      <td className="p-3 font-mono font-bold text-rose-700">
                        {exp.voucher_no}
                      </td>
                      <td className="p-3 font-mono text-slate-600">
                        {exp.expense_date}
                      </td>
                      <td className="p-3 font-bold text-slate-900">
                        {exp.expense_category}
                      </td>
                      <td className="p-3 text-slate-700 font-medium">
                        {exp.title}
                      </td>
                      <td className="p-3 text-slate-600">
                        {exp.payee_name || "-"}
                      </td>
                      <td className="p-3 font-semibold text-slate-800">
                        {exp.account_name}
                      </td>
                      <td className="p-3 text-right font-black text-rose-700">
                        ৳
                        {Number(exp.amount).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={7}
                      className="p-6 text-center text-slate-400 italic"
                    >
                      No expense vouchers recorded yet.
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
