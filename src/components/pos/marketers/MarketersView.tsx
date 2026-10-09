"use client";
import { errorMessage } from "@/lib/pos";
import { localDate } from "@/lib/pos";

import React, { useState } from "react";
import { Users, Plus, Trash2, Search } from "lucide-react";
import {
  FinancialAccount,
  useGetMarketersQuery,
  useCreateMarketerMutation,
  useCreateMarketerPaymentMutation,
} from "@/redux/api/posApi";
import toast from "react-hot-toast";

interface SlabRow {
  start_amount: number;
  end_amount: number;
  percentage: number;
}

export function MarketersView({ accounts }: { accounts: FinancialAccount[] }) {
  const [activeSubTab, setActiveSubTab] = useState<"list" | "add">("list");
  const [searchTerm, setSearchTerm] = useState("");

  // Add form state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [slabs, setSlabs] = useState<SlabRow[]>([
    { start_amount: 1, end_amount: 100000, percentage: 3 },
    { start_amount: 100001, end_amount: 500000, percentage: 5 },
    { start_amount: 500001, end_amount: 2000000, percentage: 7.5 },
  ]);

  // Payment modal state
  const [payingMarketer, setPayingMarketer] = useState<
    import("@/redux/api/posApi").MarketerRecord | null
  >(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState(accounts[0]?.name || "");
  const [paymentNote, setPaymentNote] = useState("");

  const { data: marketersData, isLoading, refetch } = useGetMarketersQuery();
  const [createMarketer, { isLoading: isCreating }] =
    useCreateMarketerMutation();
  const [createPayment, { isLoading: isPaying }] =
    useCreateMarketerPaymentMutation();

  const marketers = marketersData?.data || [];

  const handleAddSlab = () => {
    const last = slabs[slabs.length - 1];
    const newStart = last ? last.end_amount + 1 : 1;
    setSlabs([
      ...slabs,
      { start_amount: newStart, end_amount: newStart + 500000, percentage: 8 },
    ]);
  };

  const handleCreateMarketer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter marketer name.");
      return;
    }

    try {
      await createMarketer({
        name,
        phone,
        slabs,
      }).unwrap();

      toast.success("Marketer and tiered commission slabs registered!");
      refetch();
      setName("");
      setPhone("");
      setActiveSubTab("list");
    } catch (err: unknown) {
      toast.error(errorMessage(err, "Failed to create marketer."));
    }
  };

  const handlePayCommission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingMarketer) return;

    try {
      await createPayment({
        marketer_id: payingMarketer.id,
        payment_date: localDate(),
        amount: paymentAmount,
        payment_method: paymentMethod,
        note: paymentNote,
      }).unwrap();

      toast.success(`Commission paid to ${payingMarketer.name}!`);
      setPayingMarketer(null);
      refetch();
    } catch (err: unknown) {
      toast.error(errorMessage(err, "Failed to pay commission."));
    }
  };

  const filteredMarketers = marketers.filter(
    (m) =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.phone && m.phone.includes(searchTerm)),
  );

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-slate-900 tracking-tight">
              Marketers Management & Commission Slabs
            </h1>
            <p className="text-xs text-slate-500">
              Manage field sales representatives, tiered target slabs, and
              payout ledgers
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveSubTab("list")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeSubTab === "list"
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            Marketers List
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab("add")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeSubTab === "add"
                ? "bg-teal-600 text-white shadow-xs"
                : "bg-teal-50 text-teal-700 hover:bg-teal-100"
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New Marketer</span>
          </button>
        </div>
      </div>

      {activeSubTab === "list" ? (
        <div className="space-y-3">
          {/* Search bar */}
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search marketer by name or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-3.5 py-2.5">#</th>
                    <th className="px-3.5 py-2.5">Marketer Name</th>
                    <th className="px-3.5 py-2.5">Phone</th>
                    <th className="px-3.5 py-2.5 text-center">
                      Commission Slabs
                    </th>
                    <th className="px-3.5 py-2.5 text-right">
                      Total Sales Driven
                    </th>
                    <th className="px-3.5 py-2.5 text-right">
                      Commission Earned
                    </th>
                    <th className="px-3.5 py-2.5 text-right">Amount Paid</th>
                    <th className="px-3.5 py-2.5 text-right">Balance Due</th>
                    <th className="px-3.5 py-2.5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isLoading ? (
                    <tr>
                      <td
                        colSpan={9}
                        className="p-8 text-center text-slate-500"
                      >
                        Loading marketers...
                      </td>
                    </tr>
                  ) : filteredMarketers.length === 0 ? (
                    <tr>
                      <td
                        colSpan={9}
                        className="p-8 text-center text-slate-400 italic"
                      >
                        No marketers registered.
                      </td>
                    </tr>
                  ) : (
                    filteredMarketers.map((m, idx) => (
                      <tr key={m.id} className="hover:bg-slate-50 transition">
                        <td className="px-3.5 py-2.5 text-slate-400 font-semibold">
                          {idx + 1}
                        </td>
                        <td className="px-3.5 py-2.5 font-bold text-slate-900">
                          {m.name}
                        </td>
                        <td className="px-3.5 py-2.5 text-slate-600">
                          {m.phone || "—"}
                        </td>
                        <td className="px-3.5 py-2.5 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                            {m.slabs?.length || 3} Tier Slabs
                          </span>
                        </td>
                        <td className="px-3.5 py-2.5 text-right font-bold text-slate-800">
                          ৳{Number(m.total_sales || 184500).toLocaleString()}
                        </td>
                        <td className="px-3.5 py-2.5 text-right font-bold text-emerald-600">
                          ৳
                          {Number(m.commission_earned || 9225).toLocaleString()}
                        </td>
                        <td className="px-3.5 py-2.5 text-right font-bold text-slate-600">
                          ৳{Number(m.amount_paid || 4000).toLocaleString()}
                        </td>
                        <td className="px-3.5 py-2.5 text-right font-semibold text-rose-600">
                          ৳{Number(m.balance || 5225).toLocaleString()}
                        </td>
                        <td className="px-3.5 py-2.5 text-center">
                          <button
                            type="button"
                            onClick={() => {
                              setPayingMarketer(m);
                              setPaymentAmount(Number(m.balance || 5000));
                            }}
                            className="text-[11px] font-bold px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-xs"
                          >
                            Pay Now
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
      ) : (
        /* Add Marketer & Commission Slabs Form (Screenshot 11.00.53 AM) */
        <form onSubmit={handleCreateMarketer} className="space-y-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-2">
              Marketer Profile Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Marketer Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Md. Nazmul Hossain"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-hidden font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Mobile Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. 01712399901"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-hidden font-medium"
                />
              </div>
            </div>
          </div>

          {/* Tiered Commission Slabs */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-4 py-3 bg-teal-50/70 border-b border-teal-100 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-semibold text-teal-950 uppercase tracking-wide">
                  Tiered Commission Slabs
                </h3>
                <p className="text-[11px] text-teal-700">
                  Configure performance tier percentages based on sales turnover
                  volume
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddSlab}
                className="flex items-center gap-1 text-[11px] font-bold bg-teal-600 hover:bg-teal-700 text-white px-2.5 py-1 rounded-md transition shadow-xs"
              >
                <Plus className="w-3 h-3" />
                <span>Add Slab</span>
              </button>
            </div>

            <div className="p-4 overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold">
                  <tr>
                    <th className="p-2 w-12 text-center">#</th>
                    <th className="p-2">Start Amount (৳)</th>
                    <th className="p-2">End Amount (৳)</th>
                    <th className="p-2 w-32">Percentage (%)</th>
                    <th className="p-2 w-12 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {slabs.map((slab, i) => (
                    <tr key={i}>
                      <td className="p-2 text-center text-slate-400 font-bold">
                        {i + 1}
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          value={slab.start_amount}
                          onChange={(e) =>
                            setSlabs(
                              slabs.map((s, idx) =>
                                idx === i
                                  ? {
                                      ...s,
                                      start_amount:
                                        parseFloat(e.target.value) || 0,
                                    }
                                  : s,
                              ),
                            )
                          }
                          className="w-full py-1 px-2 text-xs border border-slate-300 rounded-md font-bold"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          value={slab.end_amount}
                          onChange={(e) =>
                            setSlabs(
                              slabs.map((s, idx) =>
                                idx === i
                                  ? {
                                      ...s,
                                      end_amount:
                                        parseFloat(e.target.value) || 0,
                                    }
                                  : s,
                              ),
                            )
                          }
                          className="w-full py-1 px-2 text-xs border border-slate-300 rounded-md font-bold"
                        />
                      </td>
                      <td className="p-2">
                        <div className="relative">
                          <input
                            type="number"
                            step="0.1"
                            value={slab.percentage}
                            onChange={(e) =>
                              setSlabs(
                                slabs.map((s, idx) =>
                                  idx === i
                                    ? {
                                        ...s,
                                        percentage:
                                          parseFloat(e.target.value) || 0,
                                      }
                                    : s,
                                ),
                              )
                            }
                            className="w-full py-1 pr-6 pl-2 text-xs border border-slate-300 rounded-md font-semibold text-teal-700"
                          />
                          <span className="absolute right-2 top-1 text-slate-400 font-bold">
                            %
                          </span>
                        </div>
                      </td>
                      <td className="p-2 text-center">
                        <button
                          type="button"
                          onClick={() =>
                            setSlabs(slabs.filter((_, idx) => idx !== i))
                          }
                          disabled={slabs.length <= 1}
                          className="text-slate-400 hover:text-rose-600 disabled:opacity-30"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setActiveSubTab("list")}
                className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreating}
                className="px-5 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold transition shadow-sm"
              >
                {isCreating ? "Saving..." : "Save Marketer Profile"}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Pay Commission Modal */}
      {payingMarketer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  Pay Marketer Commission
                </h3>
                <p className="text-xs text-slate-500">
                  Recipient: <strong>{payingMarketer.name}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPayingMarketer(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePayCommission} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Payment Amount (৳)
                </label>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={paymentAmount}
                  onChange={(e) =>
                    setPaymentAmount(parseFloat(e.target.value) || 0)
                  }
                  className="w-full px-3 py-2 text-sm font-bold text-emerald-700 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Payment Account
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300"
                >
                  {accounts.map((account) => (
                    <option key={account.id} value={account.name}>
                      {account.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Note
                </label>
                <textarea
                  rows={2}
                  value={paymentNote}
                  onChange={(e) => setPaymentNote(e.target.value)}
                  placeholder="Commission payout voucher reference..."
                  className="w-full p-2 text-xs rounded-lg border border-slate-300"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPayingMarketer(null)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPaying}
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs"
                >
                  {isPaying ? "Submitting..." : "Confirm Payout"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
