"use client";

import React, { useState } from "react";
import {
  DollarSign,
  Building2,
  Calendar,
  CreditCard,
  CheckCircle2,
  Receipt,
  Printer,
  History,
} from "lucide-react";
import {
  Supplier,
  FinancialAccount,
  useCreateSupplierPaymentMutation,
  useGetSupplierPaymentsQuery,
} from "@/redux/api/posApi";
import toast from "react-hot-toast";

interface SupplierPaymentViewProps {
  suppliers: Supplier[];
  accounts: FinancialAccount[];
  onNavigateToPurchases: () => void;
}

export function SupplierPaymentView({
  suppliers,
  accounts,
  onNavigateToPurchases,
}: SupplierPaymentViewProps) {
  const [selectedSupplierId, setSelectedSupplierId] = useState<number | null>(
    suppliers.length > 0 ? suppliers[0].id : null
  );
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [paymentMethod, setPaymentMethod] = useState("Bank Transfer");
  const [selectedAccount, setSelectedAccount] = useState(
    accounts[0]?.name || "Cash"
  );
  const [previousDue, setPreviousDue] = useState<number>(125000);
  const [discount, setDiscount] = useState<number>(0);
  const [paidAmount, setPaidAmount] = useState<number>(50000);
  const [note, setNote] = useState("");
  const [showHistory, setShowHistory] = useState(true);

  const [createPayment, { isLoading: isSubmitting }] =
    useCreateSupplierPaymentMutation();

  const { data: paymentsData, refetch } = useGetSupplierPaymentsQuery();
  const paymentRecords = paymentsData?.data?.data || [];

  const selectedSupplier = suppliers.find((s) => s.id === selectedSupplierId);
  const remainingDue = Math.max(0, previousDue - (paidAmount + discount));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplierId) {
      toast.error("Please select a supplier.");
      return;
    }
    if (paidAmount <= 0) {
      toast.error("Please enter a valid payment amount.");
      return;
    }

    try {
      await createPayment({
        supplier_id: selectedSupplierId,
        payment_date: paymentDate,
        payment_method: paymentMethod,
        account: selectedAccount,
        previous_due: previousDue,
        discount,
        paid_amount: paidAmount,
        note,
      }).unwrap();

      toast.success("Supplier payment recorded successfully!");
      refetch();
      setPaidAmount(0);
      setDiscount(0);
      setNote("");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to record payment.");
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center font-bold">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-slate-900 tracking-tight">
              Supplier Payment / Due Settlement
            </h1>
            <p className="text-xs text-slate-500">
              Clear payables to vendor manufacturers, record ledger debits and cash outflow
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onNavigateToPurchases}
          className="text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 transition"
        >
          View Purchases List
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Payment Entry Form (5 cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <form onSubmit={handleSubmit} className="space-y-3">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-2">
              New Supplier Payment
            </h2>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Supplier <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Building2 className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <select
                  value={selectedSupplierId || ""}
                  onChange={(e) => setSelectedSupplierId(Number(e.target.value))}
                  className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-violet-500 focus:outline-hidden"
                >
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {selectedSupplier && (
              <div className="bg-violet-50/70 p-2.5 rounded-lg border border-violet-200 text-xs flex justify-between items-center text-violet-900">
                <div>
                  <span className="text-[10px] uppercase font-bold text-violet-700">Code:</span>{" "}
                  <strong>{selectedSupplier.code}</strong>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-violet-700">Phone:</span>{" "}
                  <strong>{selectedSupplier.phone || "01912345671"}</strong>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Payment Date
                </label>
                <div className="relative">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full pl-8 pr-2 py-1.5 text-xs rounded-lg border border-slate-300 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 font-medium"
                >
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cheque">Cheque</option>
                  <option value="bKash">bKash</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                From Account
              </label>
              <select
                value={selectedAccount}
                onChange={(e) => setSelectedAccount(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 font-medium"
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.name}>
                    {a.name} (৳{Number(a.balance).toLocaleString()})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Payable Due (৳)
              </label>
              <input
                type="number"
                step="0.01"
                value={previousDue}
                onChange={(e) => setPreviousDue(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 font-bold bg-slate-50 text-slate-800"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Discount (৳)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={discount}
                  onChange={(e) => setDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 font-bold text-emerald-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Paid Amount (৳) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 font-black text-violet-700"
                />
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center text-xs">
              <span className="font-bold text-slate-600">Remaining Balance:</span>
              <span className="font-black text-sm text-rose-600">
                ৳{remainingDue.toLocaleString()}
              </span>
            </div>

            <div>
              <textarea
                rows={2}
                placeholder="Payment note / Bank reference transaction ID..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full p-2.5 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-violet-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-extrabold text-xs transition flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? "Recording..." : "Submit Payment"}</span>
            </button>
          </form>
        </div>

        {/* Right: Payment History Table (7 cols) */}
        <div className="lg:col-span-7 bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-slate-500" />
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                Supplier Payment Ledger History
              </h2>
            </div>
            <span className="text-xs text-slate-400 font-medium">
              {paymentRecords.length} records
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-2">#</th>
                  <th className="p-2">Receipt No</th>
                  <th className="p-2">Date</th>
                  <th className="p-2">Supplier</th>
                  <th className="p-2">Account</th>
                  <th className="p-2 text-right">Paid (৳)</th>
                  <th className="p-2 text-right">Balance (৳)</th>
                  <th className="p-2 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paymentRecords.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-6 text-center text-slate-400 italic">
                      No supplier payment history recorded.
                    </td>
                  </tr>
                ) : (
                  paymentRecords.map((rec: any, idx: number) => (
                    <tr key={rec.id || idx} className="hover:bg-slate-50">
                      <td className="p-2 text-slate-400">{idx + 1}</td>
                      <td className="p-2 font-bold text-violet-700">{rec.payment_no}</td>
                      <td className="p-2 text-slate-600">{rec.payment_date}</td>
                      <td className="p-2 font-medium text-slate-900">{rec.supplier?.name}</td>
                      <td className="p-2 text-slate-600">{rec.account}</td>
                      <td className="p-2 text-right font-extrabold text-emerald-600">
                        ৳{Number(rec.paid_amount).toLocaleString()}
                      </td>
                      <td className="p-2 text-right font-bold text-rose-600">
                        ৳{Number(rec.remaining_due).toLocaleString()}
                      </td>
                      <td className="p-2 text-center">
                        <button
                          type="button"
                          onClick={() => window.print()}
                          className="p-1 rounded-md text-slate-500 hover:text-violet-600"
                          title="Print Receipt"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
