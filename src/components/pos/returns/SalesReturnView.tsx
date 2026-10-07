"use client";

import React, { useState } from "react";
import {
  RotateCcw,
  Plus,
  Trash2,
  CheckCircle2,
  Calendar,
  User,
  Building2,
  Receipt,
} from "lucide-react";
import {
  Customer,
  Supplier,
  Product,
  useCreateSaleReturnMutation,
} from "@/redux/api/posApi";
import toast from "react-hot-toast";

interface ReturnItemState {
  id: string;
  product_id: number;
  product_name: string;
  product_serial: string;
  quantity: number;
  unit_price: number;
  condition: "good" | "damaged" | "scrap";
}

interface ExchangeItemState {
  id: string;
  product_id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
}

interface SalesReturnViewProps {
  customers: Customer[];
  suppliers: Supplier[];
  products: Product[];
  onNavigateToList: () => void;
}

export function SalesReturnView({
  customers,
  suppliers,
  products,
  onNavigateToList,
}: SalesReturnViewProps) {
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(
    customers.length > 0 ? customers[0].id : null
  );
  const [selectedSupplierId, setSelectedSupplierId] = useState<number | null>(
    suppliers.length > 0 ? suppliers[0].id : null
  );
  const [invoiceId, setInvoiceId] = useState("");
  const [returnDate, setReturnDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [comments, setComments] = useState("");
  const [cashRefund, setCashRefund] = useState<number>(0);

  // Return items list
  const [returnItems, setReturnItems] = useState<ReturnItemState[]>([
    {
      id: "ret-1",
      product_id: products[0]?.id || 1,
      product_name: products[0]?.name || "Electric Wire 1.5mm Red Coil (100m)",
      product_serial: "SN-99824-A",
      quantity: 1,
      unit_price: Number(products[0]?.unit_price || 3450),
      condition: "damaged",
    },
  ]);

  // Exchange items list
  const [exchangeItems, setExchangeItems] = useState<ExchangeItemState[]>([]);

  const [createSaleReturn, { isLoading: isSubmitting }] =
    useCreateSaleReturnMutation();

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);
  const prevDue = Number(selectedCustomer?.previous_due || 0);

  // Calculations
  const totalReturnValue = returnItems.reduce(
    (sum, item) => sum + item.quantity * item.unit_price,
    0
  );

  const totalExchangeValue = exchangeItems.reduce(
    (sum, item) => sum + item.quantity * item.unit_price,
    0
  );

  const netAdjustment = totalReturnValue - totalExchangeValue;
  const finalDue = Math.max(0, prevDue - (netAdjustment - cashRefund));

  // Add return item
  const handleAddReturnRow = () => {
    if (products.length === 0) return;
    const p = products[0];
    setReturnItems((prev) => [
      ...prev,
      {
        id: `ret-${Date.now()}`,
        product_id: p.id,
        product_name: p.name,
        product_serial: "",
        quantity: 1,
        unit_price: Number(p.unit_price),
        condition: "good",
      },
    ]);
  };

  // Add exchange item
  const handleAddExchangeRow = () => {
    if (products.length === 0) return;
    const p = products[0];
    setExchangeItems((prev) => [
      ...prev,
      {
        id: `exc-${Date.now()}`,
        product_id: p.id,
        product_name: p.name,
        quantity: 1,
        unit_price: Number(p.unit_price),
      },
    ]);
  };

  const updateReturnProduct = (id: string, pid: number) => {
    const prod = products.find((p) => p.id === pid);
    setReturnItems((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              product_id: pid,
              product_name: prod?.name || "",
              unit_price: Number(prod?.unit_price || 0),
            }
          : r
      )
    );
  };

  const updateExchangeProduct = (id: string, pid: number) => {
    const prod = products.find((p) => p.id === pid);
    setExchangeItems((prev) =>
      prev.map((ex) =>
        ex.id === id
          ? {
              ...ex,
              product_id: pid,
              product_name: prod?.name || "",
              unit_price: Number(prod?.unit_price || 0),
            }
          : ex
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId) {
      toast.error("Please select a customer.");
      return;
    }

    if (returnItems.length === 0 && exchangeItems.length === 0) {
      toast.error("Please add at least one return or exchange item.");
      return;
    }

    try {
      await createSaleReturn({
        customer_id: selectedCustomerId,
        supplier_id: selectedSupplierId,
        invoice_id: invoiceId || null,
        return_date: returnDate,
        cash_refund: cashRefund,
        comments,
        return_items: returnItems.map((r) => ({
          product_id: r.product_id,
          product_serial: r.product_serial,
          quantity: r.quantity,
          unit_price: r.unit_price,
          condition: r.condition,
        })),
        exchange_items: exchangeItems.map((e) => ({
          product_id: e.product_id,
          quantity: e.quantity,
          unit_price: e.unit_price,
        })),
      }).unwrap();

      toast.success("Sale return and exchange recorded successfully!");
      onNavigateToList();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to process sale return.");
    }
  };

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <RotateCcw className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-slate-900 tracking-tight">
              Sale Return & Exchange
            </h1>
            <p className="text-xs text-slate-500">
              Process customer warranty returns, item exchanges, and ledger balance adjustments
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onNavigateToList}
          className="text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 transition"
        >
          View Exchange History
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Meta selections */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
              Customer <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <select
                value={selectedCustomerId || ""}
                onChange={(e) => setSelectedCustomerId(Number(e.target.value))}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.code}) - Due: ৳{Number(c.previous_due).toLocaleString()}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
              Supplier (Optional)
            </label>
            <div className="relative">
              <Building2 className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <select
                value={selectedSupplierId || ""}
                onChange={(e) => setSelectedSupplierId(Number(e.target.value))}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
              >
                <option value="">All Suppliers</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
              Original Invoice #
            </label>
            <div className="relative">
              <Receipt className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="#S-20261005..."
                value={invoiceId}
                onChange={(e) => setInvoiceId(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
              Return Date
            </label>
            <div className="relative">
              <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="date"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Section 1: Return Products Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-4 py-2.5 bg-rose-50 border-b border-rose-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-600"></span>
              <h2 className="text-xs font-bold text-rose-900 uppercase tracking-wide">
                1. Return Products (Item Brought In By Customer)
              </h2>
            </div>
            <button
              type="button"
              onClick={handleAddReturnRow}
              className="flex items-center gap-1 text-[11px] font-bold bg-rose-600 hover:bg-rose-700 text-white px-2.5 py-1 rounded-md transition shadow-xs"
            >
              <Plus className="w-3 h-3" />
              <span>Add Return Item</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold">
                <tr>
                  <th className="px-3 py-2">#</th>
                  <th className="px-3 py-2 min-w-[200px]">Product</th>
                  <th className="px-3 py-2 min-w-[120px]">Serial / Batch</th>
                  <th className="px-3 py-2 w-28">Condition</th>
                  <th className="px-3 py-2 w-20 text-center">Qty</th>
                  <th className="px-3 py-2 w-28 text-right">Price (৳)</th>
                  <th className="px-3 py-2 w-28 text-right">Subtotal (৳)</th>
                  <th className="px-3 py-2 w-12 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {returnItems.map((item, index) => (
                  <tr key={item.id} className="hover:bg-slate-50/70">
                    <td className="px-3 py-2 text-slate-400 font-semibold">{index + 1}</td>
                    <td className="px-3 py-2">
                      <select
                        value={item.product_id}
                        onChange={(e) => updateReturnProduct(item.id, Number(e.target.value))}
                        className="w-full text-xs py-1 px-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-rose-500 font-medium"
                      >
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} [{p.code}]
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        placeholder="SN / Batch..."
                        value={item.product_serial}
                        onChange={(e) => {
                          const val = e.target.value;
                          setReturnItems((prev) =>
                            prev.map((r) => (r.id === item.id ? { ...r, product_serial: val } : r))
                          );
                        }}
                        className="w-full text-xs py-1 px-2 border border-slate-300 rounded-md"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <select
                        value={item.condition}
                        onChange={(e) => {
                          const cond = e.target.value as "good" | "damaged" | "scrap";
                          setReturnItems((prev) =>
                            prev.map((r) => (r.id === item.id ? { ...r, condition: cond } : r))
                          );
                        }}
                        className="w-full text-xs py-1 px-1.5 border border-slate-300 rounded-md font-medium"
                      >
                        <option value="good">Good (Restock)</option>
                        <option value="damaged">Damaged (Wastage)</option>
                        <option value="scrap">Scrap</option>
                      </select>
                    </td>
                    <td className="px-3 py-2 text-center">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => {
                          const q = Math.max(1, parseInt(e.target.value) || 1);
                          setReturnItems((prev) =>
                            prev.map((r) => (r.id === item.id ? { ...r, quantity: q } : r))
                          );
                        }}
                        className="w-16 text-center text-xs py-1 border border-slate-300 rounded-md font-bold"
                      />
                    </td>
                    <td className="px-3 py-2 text-right">
                      <input
                        type="number"
                        step="0.01"
                        value={item.unit_price}
                        onChange={(e) => {
                          const pr = Math.max(0, parseFloat(e.target.value) || 0);
                          setReturnItems((prev) =>
                            prev.map((r) => (r.id === item.id ? { ...r, unit_price: pr } : r))
                          );
                        }}
                        className="w-24 text-right text-xs py-1 px-2 border border-slate-300 rounded-md font-bold"
                      />
                    </td>
                    <td className="px-3 py-2 text-right font-extrabold text-slate-800">
                      ৳{(item.quantity * item.unit_price).toLocaleString()}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <button
                        type="button"
                        onClick={() =>
                          setReturnItems((prev) => prev.filter((r) => r.id !== item.id))
                        }
                        className="text-slate-400 hover:text-rose-600 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-slate-50 px-4 py-2 border-t border-slate-200 flex justify-end gap-3 text-xs font-bold text-slate-700">
            <span>Total Return Value:</span>
            <span className="text-rose-600 font-extrabold">
              ৳{totalReturnValue.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Section 2: Exchange Products Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-4 py-2.5 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              <h2 className="text-xs font-bold text-emerald-900 uppercase tracking-wide">
                2. Exchange Products (New Replacement Items Given to Customer)
              </h2>
            </div>
            <button
              type="button"
              onClick={handleAddExchangeRow}
              className="flex items-center gap-1 text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded-md transition shadow-xs"
            >
              <Plus className="w-3 h-3" />
              <span>Add Exchange Product</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            {exchangeItems.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 italic">
                No exchange items added yet. Click &apos;+ Add Exchange Product&apos; if customer is taking new items in place of the returned goods.
              </div>
            ) : (
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold">
                  <tr>
                    <th className="px-3 py-2">#</th>
                    <th className="px-3 py-2 min-w-[200px]">New Exchange Product</th>
                    <th className="px-3 py-2 w-20 text-center">Qty</th>
                    <th className="px-3 py-2 w-28 text-right">Price (৳)</th>
                    <th className="px-3 py-2 w-28 text-right">Subtotal (৳)</th>
                    <th className="px-3 py-2 w-12 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {exchangeItems.map((item, index) => (
                    <tr key={item.id} className="hover:bg-slate-50/70">
                      <td className="px-3 py-2 text-slate-400 font-semibold">{index + 1}</td>
                      <td className="px-3 py-2">
                        <select
                          value={item.product_id}
                          onChange={(e) => updateExchangeProduct(item.id, Number(e.target.value))}
                          className="w-full text-xs py-1 px-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-emerald-500 font-medium"
                        >
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} (Stock: {p.available_qty})
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => {
                            const q = Math.max(1, parseInt(e.target.value) || 1);
                            setExchangeItems((prev) =>
                              prev.map((ex) => (ex.id === item.id ? { ...ex, quantity: q } : ex))
                            );
                          }}
                          className="w-16 text-center text-xs py-1 border border-slate-300 rounded-md font-bold"
                        />
                      </td>
                      <td className="px-3 py-2 text-right">
                        <input
                          type="number"
                          step="0.01"
                          value={item.unit_price}
                          onChange={(e) => {
                            const pr = Math.max(0, parseFloat(e.target.value) || 0);
                            setExchangeItems((prev) =>
                              prev.map((ex) => (ex.id === item.id ? { ...ex, unit_price: pr } : ex))
                            );
                          }}
                          className="w-24 text-right text-xs py-1 px-2 border border-slate-300 rounded-md font-bold"
                        />
                      </td>
                      <td className="px-3 py-2 text-right font-extrabold text-slate-800">
                        ৳{(item.quantity * item.unit_price).toLocaleString()}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <button
                          type="button"
                          onClick={() =>
                            setExchangeItems((prev) => prev.filter((ex) => ex.id !== item.id))
                          }
                          className="text-slate-400 hover:text-rose-600 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {exchangeItems.length > 0 && (
            <div className="bg-slate-50 px-4 py-2 border-t border-slate-200 flex justify-end gap-3 text-xs font-bold text-slate-700">
              <span>Total Exchange Value:</span>
              <span className="text-emerald-600 font-extrabold">
                ৳{totalExchangeValue.toLocaleString()}
              </span>
            </div>
          )}
        </div>

        {/* Section 3: Bottom Calculation & Final Balance */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase">
              Comments & Return Reason
            </h3>
            <textarea
              rows={3}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Reason for return/warranty claim, condition notes..."
              className="w-full p-2.5 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
            />

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">
                Immediate Cash Refunded to Customer (৳)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={cashRefund}
                onChange={(e) => setCashRefund(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-32 text-right text-xs py-1.5 px-3 border border-slate-300 rounded-lg font-extrabold text-rose-600 focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>

          {/* Balance Cards Summary */}
          <div className="bg-slate-900 text-white p-4 rounded-xl shadow-md space-y-2.5">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              Transaction Balance Summary
            </h3>

            <div className="flex justify-between text-xs py-1 border-b border-slate-800">
              <span className="text-slate-400">Return Value Credit (+)</span>
              <span className="font-bold text-rose-400">৳{totalReturnValue.toLocaleString()}</span>
            </div>

            <div className="flex justify-between text-xs py-1 border-b border-slate-800">
              <span className="text-slate-400">Exchange Value Debit (-)</span>
              <span className="font-bold text-emerald-400">৳{totalExchangeValue.toLocaleString()}</span>
            </div>

            <div className="flex justify-between text-xs py-1 border-b border-slate-800">
              <span className="text-slate-400">Net Adjustment Difference</span>
              <span className="font-bold text-cyan-300">
                {netAdjustment >= 0 ? "+" : ""}৳{netAdjustment.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between text-xs py-1 border-b border-slate-800">
              <span className="text-slate-400">Customer Previous Due</span>
              <span className="font-bold text-violet-300">৳{prevDue.toLocaleString()}</span>
            </div>

            <div className="flex justify-between text-sm pt-1 items-center">
              <span className="font-bold text-slate-200">New Final Due:</span>
              <span className="font-black text-lg text-emerald-400">
                ৳{finalDue.toLocaleString()}
              </span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-3 py-2.5 rounded-lg bg-teal-500 hover:bg-teal-600 text-white font-extrabold text-xs transition flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? "Processing..." : "Complete Return & Exchange"}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
