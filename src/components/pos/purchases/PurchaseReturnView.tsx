"use client";

import React, { useState } from "react";
import {
  RotateCcw,
  Plus,
  Trash2,
  CheckCircle2,
  Building2,
  Calendar,
  DollarSign,
  Package,
  FileText,
  AlertCircle,
  Receipt,
  Search,
} from "lucide-react";
import {
  Supplier,
  Product,
  FinancialAccount,
  Outlet,
  useCreatePurchaseReturnMutation,
  useGetPurchaseReturnsQuery,
} from "@/redux/api/posApi";
import toast from "react-hot-toast";

interface PurchaseReturnViewProps {
  suppliers: Supplier[];
  products: Product[];
  accounts: FinancialAccount[];
  outlets: Outlet[];
  onNavigateToPurchases?: () => void;
}

interface ReturnCartRow {
  product_id: number;
  product_name: string;
  product_code: string;
  quantity: number;
  unit_cost: number;
  reason: string;
  subtotal: number;
}

export function PurchaseReturnView({
  suppliers,
  products,
  accounts,
  outlets,
  onNavigateToPurchases,
}: PurchaseReturnViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<"new_return" | "return_list">("new_return");

  // Form states
  const [supplierId, setSupplierId] = useState<number | "">("");
  const [chalanNo, setChalanNo] = useState("");
  const [returnDate, setReturnDate] = useState(new Date().toISOString().split("T")[0]);
  const [outletId, setOutletId] = useState<number>(outlets[0]?.id || 1);
  const [note, setNote] = useState("");
  const [settlementType, setSettlementType] = useState<"due_deduction" | "cash_refund">("due_deduction");
  const [paymentAccount, setPaymentAccount] = useState("Cash");

  // Product selection row
  const [selectedProductId, setSelectedProductId] = useState<number | "">("");
  const [returnQty, setReturnQty] = useState<number>(1);
  const [returnReason, setReturnReason] = useState<string>("defective");
  const [customCost, setCustomCost] = useState<number>(0);

  // Cart
  const [returnItems, setReturnItems] = useState<ReturnCartRow[]>([]);

  // Mutations & Queries
  const [createPurchaseReturn, { isLoading: isSubmitting }] = useCreatePurchaseReturnMutation();
  const { data: returnsData, isLoading: isLoadingReturns, refetch: refetchReturns } = useGetPurchaseReturnsQuery();

  const handleSelectProduct = (productId: number) => {
    setSelectedProductId(productId);
    const prod = products.find((p) => p.id === productId);
    if (prod) {
      setCustomCost(Number(prod.cost_price) || 0);
    }
  };

  const handleAddItem = () => {
    if (!selectedProductId) {
      toast.error("Please select a product to return");
      return;
    }
    const prod = products.find((p) => p.id === selectedProductId);
    if (!prod) return;

    if (returnQty <= 0) {
      toast.error("Return quantity must be greater than 0");
      return;
    }

    const sub = roundNumber(returnQty * customCost);
    const existing = returnItems.find((i) => i.product_id === prod.id);

    if (existing) {
      setReturnItems(
        returnItems.map((item) =>
          item.product_id === prod.id
            ? {
                ...item,
                quantity: item.quantity + returnQty,
                subtotal: roundNumber((item.quantity + returnQty) * item.unit_cost),
              }
            : item
        )
      );
    } else {
      setReturnItems([
        ...returnItems,
        {
          product_id: prod.id,
          product_name: prod.name,
          product_code: prod.code,
          quantity: returnQty,
          unit_cost: customCost,
          reason: returnReason,
          subtotal: sub,
        },
      ]);
    }

    setSelectedProductId("");
    setReturnQty(1);
    toast.success(`Added ${prod.name} to return debit voucher`);
  };

  const handleRemoveItem = (productId: number) => {
    setReturnItems(returnItems.filter((i) => i.product_id !== productId));
  };

  const roundNumber = (num: number) => Math.round((num + Number.EPSILON) * 100) / 100;

  const totalReturnValue = roundNumber(
    returnItems.reduce((acc, item) => acc + item.subtotal, 0)
  );

  const handleSubmitReturn = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!supplierId) {
      toast.error("Please select a supplier");
      return;
    }

    if (returnItems.length === 0) {
      toast.error("Please add at least one product to return");
      return;
    }

    const payload = {
      supplier_id: Number(supplierId),
      outlet_id: outletId,
      chalan_no: chalanNo || undefined,
      return_date: returnDate,
      cash_refund: settlementType === "cash_refund" ? totalReturnValue : 0,
      due_deduction: settlementType === "due_deduction" ? totalReturnValue : 0,
      payment_account: paymentAccount,
      note: note || undefined,
      items: returnItems.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_cost: item.unit_cost,
        reason: item.reason,
      })),
    };

    try {
      const res = await createPurchaseReturn(payload).unwrap();
      toast.success(res.message || "Purchase return recorded successfully!");
      setReturnItems([]);
      setChalanNo("");
      setNote("");
      refetchReturns();
      setActiveSubTab("return_list");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to process purchase return");
    }
  };

  const pastReturns = returnsData?.data?.data || returnsData?.data || [];

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center font-bold">
            <RotateCcw className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-slate-900 tracking-tight">
              Purchase Returns & Debit Notes
            </h1>
            <p className="text-xs text-slate-500">
              Return damaged, defective, or incorrect stock items back to suppliers & adjust payable balances
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveSubTab("new_return")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeSubTab === "new_return"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            + New Purchase Return
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab("return_list")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeSubTab === "return_list"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <Receipt className="w-3.5 h-3.5 text-rose-500" />
            <span>Debit Notes History</span>
          </button>
        </div>
      </div>

      {/* Subtab 1: New Purchase Return */}
      {activeSubTab === "new_return" && (
        <form onSubmit={handleSubmitReturn} className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
              Supplier & Chalan Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Supplier / Vendor <span className="text-rose-500">*</span>
                </label>
                <select
                  value={supplierId}
                  onChange={(e) => setSupplierId(e.target.value ? Number(e.target.value) : "")}
                  required
                  className="w-full h-9 px-2.5 rounded-lg border border-slate-300 font-semibold focus:outline-none focus:border-rose-600"
                >
                  <option value="">-- Choose Supplier --</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Original Chalan No.
                </label>
                <input
                  type="text"
                  placeholder="e.g. CH-88219"
                  value={chalanNo}
                  onChange={(e) => setChalanNo(e.target.value)}
                  className="w-full h-9 px-2.5 rounded-lg border border-slate-300 font-medium focus:outline-none focus:border-rose-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Return Date
                </label>
                <input
                  type="date"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="w-full h-9 px-2.5 rounded-lg border border-slate-300 font-medium focus:outline-none focus:border-rose-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Warehouse / Outlet
                </label>
                <select
                  value={outletId}
                  onChange={(e) => setOutletId(Number(e.target.value))}
                  className="w-full h-9 px-2.5 rounded-lg border border-slate-300 font-semibold focus:outline-none focus:border-rose-600"
                >
                  {outlets.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Add Product Line */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
              Select Defective / Incorrect Items
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs items-end">
              <div className="lg:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">
                  Product Item
                </label>
                <select
                  value={selectedProductId}
                  onChange={(e) => handleSelectProduct(Number(e.target.value))}
                  className="w-full h-9 px-2.5 rounded-lg border border-slate-300 font-semibold focus:outline-none focus:border-rose-600"
                >
                  <option value="">-- Choose Product --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Stock: {p.available_qty}, Cost: ৳{Number(p.cost_price).toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Return Qty
                </label>
                <input
                  type="number"
                  min="1"
                  value={returnQty}
                  onChange={(e) => setReturnQty(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full h-9 px-2.5 rounded-lg border border-slate-300 font-bold text-center focus:outline-none focus:border-rose-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Return Reason
                </label>
                <select
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  className="w-full h-9 px-2.5 rounded-lg border border-slate-300 font-semibold focus:outline-none focus:border-rose-600"
                >
                  <option value="defective">Defective / Manufacturing Fault</option>
                  <option value="damaged">Damaged in Transit</option>
                  <option value="wrong_item">Wrong Specification</option>
                  <option value="excess">Excess Stock Rejection</option>
                </select>
              </div>

              <div>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="w-full h-9 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Line</span>
                </button>
              </div>
            </div>
          </div>

          {/* Cart Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center text-xs font-bold text-slate-700">
              <span>Items Scheduled for Return</span>
              <span className="text-slate-500 font-normal">
                {returnItems.length} item(s) selected
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="p-3">#</th>
                    <th className="p-3">Code</th>
                    <th className="p-3">Product Name</th>
                    <th className="p-3 text-center">Return Qty</th>
                    <th className="p-3 text-right">Cost (৳)</th>
                    <th className="p-3">Reason</th>
                    <th className="p-3 text-right">Line Total (৳)</th>
                    <th className="p-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {returnItems.length > 0 ? (
                    returnItems.map((item, idx) => (
                      <tr key={item.product_id} className="hover:bg-slate-50">
                        <td className="p-3 text-slate-400 font-bold">{idx + 1}</td>
                        <td className="p-3 font-mono font-bold text-slate-600">{item.product_code}</td>
                        <td className="p-3 font-bold text-slate-900">{item.product_name}</td>
                        <td className="p-3 text-center font-extrabold text-rose-700">
                          {item.quantity}
                        </td>
                        <td className="p-3 text-right font-medium">৳{item.unit_cost.toLocaleString()}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 uppercase">
                            {item.reason}
                          </span>
                        </td>
                        <td className="p-3 text-right font-extrabold text-slate-900">
                          ৳{item.subtotal.toLocaleString()}
                        </td>
                        <td className="p-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.product_id)}
                            className="p-1 rounded text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-400 italic">
                        No return items added yet. Select products above to build debit note.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Settlement & Actions */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-2 text-xs">
              <span className="block font-bold text-slate-700">Settlement Method:</span>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 font-semibold text-slate-800 cursor-pointer">
                  <input
                    type="radio"
                    name="settlement"
                    checked={settlementType === "due_deduction"}
                    onChange={() => setSettlementType("due_deduction")}
                    className="accent-rose-600"
                  />
                  <span>Deduct from Supplier Payable Due</span>
                </label>
                <label className="flex items-center gap-1.5 font-semibold text-slate-800 cursor-pointer">
                  <input
                    type="radio"
                    name="settlement"
                    checked={settlementType === "cash_refund"}
                    onChange={() => setSettlementType("cash_refund")}
                    className="accent-rose-600"
                  />
                  <span>Receive Cash/Bank Refund</span>
                </label>
              </div>

              {settlementType === "cash_refund" && (
                <div className="pt-1 flex items-center gap-2">
                  <span className="text-slate-500 font-bold">Deposit Account:</span>
                  <select
                    value={paymentAccount}
                    onChange={(e) => setPaymentAccount(e.target.value)}
                    className="h-8 px-2 rounded-md border border-slate-300 font-semibold"
                  >
                    {accounts.map((a) => (
                      <option key={a.id} value={a.name}>
                        {a.name} ({a.account_type})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Total Debit Note Amount
                </span>
                <span className="text-2xl font-black text-rose-600">
                  ৳{totalReturnValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || returnItems.length === 0}
                className="px-5 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSubmitting ? "Processing..." : "Complete Return"}</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Subtab 2: Return List */}
      {activeSubTab === "return_list" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center text-xs font-bold text-slate-700">
            <span>Historical Debit Notes & Vendor Returns</span>
            <button
              type="button"
              onClick={() => refetchReturns()}
              className="text-teal-700 hover:underline cursor-pointer"
            >
              Refresh
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-3">Debit Note #</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Supplier Name</th>
                  <th className="p-3">Chalan Ref</th>
                  <th className="p-3 text-right">Return Amount (৳)</th>
                  <th className="p-3 text-right">Settlement</th>
                  <th className="p-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoadingReturns ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400">
                      Loading vendor returns...
                    </td>
                  </tr>
                ) : Array.isArray(pastReturns) && pastReturns.length > 0 ? (
                  pastReturns.map((ret: any) => (
                    <tr key={ret.id} className="hover:bg-slate-50 transition">
                      <td className="p-3 font-mono font-bold text-rose-700">{ret.return_no}</td>
                      <td className="p-3 font-mono text-slate-600">{ret.return_date}</td>
                      <td className="p-3 font-bold text-slate-900">
                        {ret.supplier?.name || "Vendor"}
                      </td>
                      <td className="p-3 font-mono text-slate-500">{ret.chalan_no || "-"}</td>
                      <td className="p-3 text-right font-black text-rose-600">
                        ৳{Number(ret.total_return_amount).toLocaleString()}
                      </td>
                      <td className="p-3 text-right font-semibold text-slate-700">
                        {Number(ret.cash_refund) > 0 ? (
                          <span className="text-emerald-700">Cash Refund</span>
                        ) : (
                          <span className="text-violet-700">Due Deducted</span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                          {ret.status || "Completed"}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-slate-400 italic">
                      No purchase returns recorded yet.
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
