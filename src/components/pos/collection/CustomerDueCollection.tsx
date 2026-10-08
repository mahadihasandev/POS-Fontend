"use client";
import { localDate } from "@/lib/pos";

import React, { useState } from "react";
import toast from "react-hot-toast";
import { Plus, CheckCircle2 } from "lucide-react";
import {
  Customer,
  FinancialAccount,
  Supplier,
  useCreateCollectionMutation,
  useGetCollectionsQuery,
} from "@/redux/api/posApi";
import { sounds } from "@/lib/sound";

export interface CustomerDueCollectionProps {
  customers: Customer[];
  accounts: FinancialAccount[];
  suppliers?: Supplier[];
  initialMode?: "general" | "supplier_wise";
}

export function CustomerDueCollection({
  customers,
  accounts,
  suppliers = [],
  initialMode = "general",
}: CustomerDueCollectionProps) {
  const [collectionMode, setCollectionMode] = useState<
    "general" | "supplier_wise"
  >(initialMode);
  const [selectedSupplierId, setSelectedSupplierId] = useState<number | "">("");
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(
    null,
  );
  const [collectionDate, setCollectionDate] = useState<string>(localDate());
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [account, setAccount] = useState("Cash");
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [paidAmount, setPaidAmount] = useState<number>(0);

  const [createCollection, { isLoading }] = useCreateCollectionMutation();
  const { data: collectionsData, refetch } = useGetCollectionsQuery();

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);
  const receivableDue = selectedCustomer
    ? Number(selectedCustomer.previous_due)
    : 0;
  const advancedAmount = selectedCustomer
    ? Number(selectedCustomer.advanced_amount)
    : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId) {
      toast.error("Please select a customer.");
      return;
    }
    if (paidAmount <= 0) {
      toast.error("Paid amount must be greater than zero.");
      return;
    }

    try {
      const res = await createCollection({
        customer_id: selectedCustomerId,
        collection_date: collectionDate,
        payment_method: paymentMethod,
        account,
        receivable_due: receivableDue,
        discount_amount: discountAmount,
        paid_amount: paidAmount,
        send_sms: false,
      }).unwrap();

      sounds.playSuccessChime();
      toast.success(
        res.message || "Customer collection recorded successfully!",
      );
      setSelectedCustomerId(null);
      setDiscountAmount(0);
      setPaidAmount(0);
      refetch();
    } catch (err: unknown) {
      const msg =
        (err as { data?: { message?: string } })?.data?.message ||
        "Failed to record collection.";
      toast.error(msg);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-800 via-teal-700 to-cyan-800 px-5 py-3 rounded-t-xl border-b border-teal-900/20 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2 text-white font-extrabold text-base">
          <Plus className="w-5 h-5 text-teal-200 stroke-[3]" />
          <span>
            {collectionMode === "supplier_wise"
              ? "Supplier Wise Due Collection"
              : "Customer Due Collection"}
          </span>
        </div>

        {/* Collection Mode Switcher (Matching Screenshot 11.00.09 AM) */}
        <div className="flex items-center gap-1 bg-teal-900/40 p-1 rounded-lg border border-teal-600/40 text-xs font-bold">
          <button
            type="button"
            onClick={() => setCollectionMode("general")}
            className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
              collectionMode === "general"
                ? "bg-white text-teal-950 shadow-xs"
                : "text-teal-200 hover:text-white"
            }`}
          >
            General Collection
          </button>
          <button
            type="button"
            onClick={() => setCollectionMode("supplier_wise")}
            className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
              collectionMode === "supplier_wise"
                ? "bg-white text-teal-950 shadow-xs"
                : "text-teal-200 hover:text-white"
            }`}
          >
            Supplier Wise Collection
          </button>
        </div>
      </div>

      {/* Main Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-slate-200 rounded-b-xl p-5 sm:p-6 shadow-sm space-y-5"
      >
        {collectionMode === "supplier_wise" && (
          <div className="p-3 bg-violet-50 border border-violet-200 rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-violet-900">
                Select Supplier Brand:
              </span>
              <select
                value={selectedSupplierId}
                onChange={(e) =>
                  setSelectedSupplierId(
                    e.target.value ? Number(e.target.value) : "",
                  )
                }
                className="h-8 px-2.5 rounded-md border border-violet-300 font-bold text-violet-950 bg-white"
              >
                <option value="">-- All Suppliers / General Brand --</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.code})
                  </option>
                ))}
              </select>
            </div>
            <span className="text-[11px] font-semibold text-violet-700">
              Receipt will credit specific supplier receivables ledger
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
          {/* Left Column: Customer Information */}
          <div className="space-y-3.5">
            {/* Customer Search / Select */}
            <div>
              <label className="block text-slate-900 font-bold mb-1">
                Customer Name <span className="text-rose-600">*</span>
              </label>
              <select
                value={selectedCustomerId ?? ""}
                onChange={(e) =>
                  setSelectedCustomerId(
                    e.target.value ? Number(e.target.value) : null,
                  )
                }
                className="w-full h-9 px-3 rounded-lg bg-white border border-slate-300 text-slate-900 font-semibold focus:outline-none focus:border-teal-600"
              >
                <option value="">Search Customer / Select...</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.code}) — Due:{" "}
                    {Number(c.previous_due).toFixed(2)} TK
                  </option>
                ))}
              </select>
            </div>

            {/* Customer Code */}
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Customer Code
              </label>
              <input
                type="text"
                readOnly
                value={selectedCustomer?.code || ""}
                placeholder="Auto-populated Code"
                className="w-full h-9 px-3 rounded-lg bg-slate-100 border border-slate-300 text-slate-800 font-mono font-medium cursor-not-allowed"
              />
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Mobile Number
              </label>
              <input
                type="text"
                readOnly
                value={selectedCustomer?.phone || ""}
                placeholder="Customer Contact"
                className="w-full h-9 px-3 rounded-lg bg-slate-100 border border-slate-300 text-slate-800 font-mono font-medium cursor-not-allowed"
              />
            </div>

            {/* Due Amount & Advanced Amount */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-rose-700 font-bold mb-1">
                  Due Amount
                </label>
                <input
                  type="text"
                  readOnly
                  value={
                    receivableDue ? `${receivableDue.toFixed(2)} TK` : "0.00 TK"
                  }
                  className="w-full h-9 px-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 font-mono font-extrabold cursor-not-allowed text-right"
                />
              </div>
              <div>
                <label className="block text-emerald-800 font-bold mb-1">
                  Advanced Amount
                </label>
                <input
                  type="text"
                  readOnly
                  value={
                    advancedAmount
                      ? `${advancedAmount.toFixed(2)} TK`
                      : "0.00 TK"
                  }
                  className="w-full h-9 px-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-mono font-extrabold cursor-not-allowed text-right"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Payment & Deposit Information */}
          <div className="space-y-3.5">
            {/* Date */}
            <div>
              <label className="block text-slate-900 font-bold mb-1">
                Date <span className="text-rose-600">*</span>
              </label>
              <input
                type="date"
                value={collectionDate}
                onChange={(e) => setCollectionDate(e.target.value)}
                className="w-full h-9 px-3 rounded-lg bg-white border border-slate-300 text-slate-900 font-semibold focus:outline-none focus:border-teal-600"
              />
            </div>

            {/* Payment Method & Target Account */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-800 font-bold mb-1">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg bg-white border border-slate-300 text-slate-900 font-semibold focus:outline-none focus:border-teal-600"
                >
                  <option value="Cash">Cash</option>
                  <option value="Bank">Bank Deposit</option>
                  <option value="Bkash">Bkash / MFS</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-800 font-bold mb-1">
                  Account
                </label>
                <select
                  value={account}
                  onChange={(e) => setAccount(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg bg-white border border-slate-300 text-slate-900 font-semibold focus:outline-none focus:border-teal-600"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.name}>
                      {acc.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Receivable Due (Display) */}
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Receivable Due
              </label>
              <input
                type="text"
                readOnly
                value={receivableDue.toFixed(2)}
                className="w-full h-9 px-3 rounded-lg bg-slate-100 border border-slate-300 text-slate-900 font-mono font-bold text-right cursor-not-allowed"
              />
            </div>

            {/* Discount Amount */}
            <div>
              <label className="block text-slate-800 font-bold mb-1">
                Discount Amount
              </label>
              <input
                type="number"
                min={0}
                value={discountAmount || ""}
                onChange={(e) =>
                  setDiscountAmount(parseFloat(e.target.value) || 0)
                }
                placeholder="0.00"
                className="w-full h-9 px-3 rounded-lg bg-white border border-slate-300 text-slate-900 font-mono font-bold text-right focus:outline-none focus:border-teal-600"
              />
            </div>

            {/* Paid Amount */}
            <div>
              <label className="block text-emerald-800 font-extrabold mb-1">
                Paid Amount <span className="text-rose-600">*</span>
              </label>
              <input
                type="number"
                min={0.01}
                step="0.01"
                value={paidAmount || ""}
                onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
                placeholder="Enter collected cash/bank amount..."
                className="w-full h-10 px-3 rounded-lg bg-emerald-50/50 border-2 border-emerald-500 text-emerald-900 font-mono font-extrabold text-base text-right focus:outline-none focus:border-emerald-600 shadow-xs"
              />
            </div>
          </div>
        </div>

        {/* Submit collection */}
        <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="submit"
            disabled={isLoading || !selectedCustomerId || paidAmount <= 0}
            className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-teal-700 hover:bg-teal-800 disabled:opacity-40 disabled:cursor-not-allowed text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isLoading ? "Recording..." : "Submit Collection"}</span>
          </button>
        </div>
      </form>

      {/* Recent Collections Table */}
      {collectionsData?.data?.data && collectionsData.data.data.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="px-5 py-3 border-b border-slate-200 font-bold text-xs text-slate-900 bg-slate-50">
            Recent Collections Log
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-slate-100 text-slate-800 font-bold text-[11px] uppercase border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4">Receipt #</th>
                  <th className="py-2.5 px-4">Date</th>
                  <th className="py-2.5 px-4">Customer</th>
                  <th className="py-2.5 px-4">Method / Account</th>
                  <th className="py-2.5 px-4 text-right">Discount</th>
                  <th className="py-2.5 px-4 text-right">Paid Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-900">
                {collectionsData.data.data.map((col) => (
                  <tr key={col.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-mono font-bold text-teal-700">
                      {col.collection_number}
                    </td>
                    <td className="py-2.5 px-4 text-slate-700 font-medium">
                      {col.collection_date}
                    </td>
                    <td className="py-2.5 px-4 font-bold text-slate-900">
                      {col.customer?.name}
                    </td>
                    <td className="py-2.5 px-4 text-slate-700 font-medium">
                      {col.payment_method} ({col.account})
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono text-slate-600 font-medium">
                      {Number(col.discount_amount).toFixed(2)}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-extrabold text-emerald-700">
                      {Number(col.paid_amount).toFixed(2)} TK
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
