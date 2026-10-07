"use client";

import React, { useState, useEffect } from "react";
import {
  ShoppingBag,
  Barcode,
  Search,
  Plus,
  Trash2,
  CheckCircle2,
  Calendar,
  Building2,
  Warehouse,
  DollarSign,
  Clock,
} from "lucide-react";
import {
  Supplier,
  Product,
  FinancialAccount,
  Outlet,
  useCreatePurchaseMutation,
} from "@/redux/api/posApi";
import toast from "react-hot-toast";

interface PurchaseItemState {
  product_id: number;
  product_name: string;
  barcode: string;
  quantity: number;
  free_qty: number;
  unit_cost: number;
}

interface AddPurchaseViewProps {
  suppliers: Supplier[];
  products: Product[];
  accounts: FinancialAccount[];
  outlets: Outlet[];
  onNavigateToList: () => void;
}

export function AddPurchaseView({
  suppliers,
  products,
  accounts,
  outlets,
  onNavigateToList,
}: AddPurchaseViewProps) {
  const [selectedSupplierId, setSelectedSupplierId] = useState<number | null>(
    suppliers.length > 0 ? suppliers[0].id : null
  );
  const [selectedOutletId, setSelectedOutletId] = useState<number | null>(
    outlets.length > 0 ? outlets[0].id : null
  );
  const [chalanNo, setChalanNo] = useState(
    `CH-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
  );
  const [purchaseDate, setPurchaseDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [barcodeSearch, setBarcodeSearch] = useState("");
  const [note, setNote] = useState("");

  // Cart
  const [cart, setCart] = useState<PurchaseItemState[]>([
    {
      product_id: products[0]?.id || 1,
      product_name: products[0]?.name || "Electric Wire 1.5mm Red Coil (100m)",
      barcode: products[0]?.barcode || "890123450001",
      quantity: 50,
      free_qty: 2,
      unit_cost: Number(products[0]?.cost_price || 2900),
    },
  ]);

  // Billing
  const [discount, setDiscount] = useState<number>(0);
  const [tax, setTax] = useState<number>(0);
  const [paidAmount, setPaidAmount] = useState<number>(100000);
  const [paymentAccount, setPaymentAccount] = useState<string>(
    accounts[0]?.name || "Cash"
  );

  const [createPurchase, { isLoading: isSubmitting }] =
    useCreatePurchaseMutation();

  // Calculations
  const subtotal = cart.reduce(
    (sum, item) => sum + item.quantity * item.unit_cost,
    0
  );
  const totalPayable = Math.max(0, subtotal - discount + tax);
  const dueAmount = Math.max(0, totalPayable - paidAmount);

  // Add product by barcode or selection
  const handleAddProduct = (prod: Product) => {
    const existing = cart.find((i) => i.product_id === prod.id);
    if (existing) {
      setCart(
        cart.map((i) =>
          i.product_id === prod.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      );
    } else {
      setCart([
        ...cart,
        {
          product_id: prod.id,
          product_name: prod.name,
          barcode: prod.barcode,
          quantity: 1,
          free_qty: 0,
          unit_cost: Number(prod.cost_price || 0),
        },
      ]);
    }
    toast.success(`Added ${prod.name} to purchase cart.`);
  };

  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeSearch.trim()) return;
    const match = products.find(
      (p) =>
        p.barcode.toLowerCase() === barcodeSearch.trim().toLowerCase() ||
        p.code.toLowerCase() === barcodeSearch.trim().toLowerCase()
    );
    if (match) {
      handleAddProduct(match);
      setBarcodeSearch("");
    } else {
      toast.error("No product found matching barcode/SKU.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplierId) {
      toast.error("Please select a supplier.");
      return;
    }

    if (cart.length === 0) {
      toast.error("Please add at least one item to purchase cart.");
      return;
    }

    try {
      await createPurchase({
        supplier_id: selectedSupplierId,
        outlet_id: selectedOutletId,
        chalan_no: chalanNo,
        purchase_date: purchaseDate,
        note,
        discount,
        tax,
        paid_amount: paidAmount,
        payment_account: paymentAccount,
        items: cart.map((i) => ({
          product_id: i.product_id,
          quantity: i.quantity,
          free_qty: i.free_qty,
          unit_cost: i.unit_cost,
        })),
      }).unwrap();

      toast.success("Purchase order and stock levels updated successfully!");
      onNavigateToList();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to save purchase.");
    }
  };

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-slate-900 tracking-tight">
              Add New Purchase / Chalan Intake
            </h1>
            <p className="text-xs text-slate-500">
              Receive inventory from suppliers, record chalan batches, update purchase costs and payables
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onNavigateToList}
          className="text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 transition"
        >
          View Purchases History
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Form & Item Cart (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Metadata Cards */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Supplier <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Building2 className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <select
                  value={selectedSupplierId || ""}
                  onChange={(e) => setSelectedSupplierId(Number(e.target.value))}
                  className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                >
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
                Warehouse / Outlet
              </label>
              <div className="relative">
                <Warehouse className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <select
                  value={selectedOutletId || ""}
                  onChange={(e) => setSelectedOutletId(Number(e.target.value))}
                  className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                >
                  {outlets.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Chalan / Invoice No <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={chalanNo}
                onChange={(e) => setChalanNo(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white font-bold text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Purchase Date
              </label>
              <div className="relative">
                <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="date"
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                  className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Barcode Search bar */}
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <Barcode className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Scan product barcode [F2] or type SKU / Name..."
                value={barcodeSearch}
                onChange={(e) => setBarcodeSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleBarcodeSubmit(e);
                  }
                }}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Quick product selector dropdown */}
            <div className="w-full sm:w-64">
              <select
                onChange={(e) => {
                  const pid = Number(e.target.value);
                  const p = products.find((prod) => prod.id === pid);
                  if (p) handleAddProduct(p);
                }}
                value=""
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-slate-50 font-medium"
              >
                <option value="">+ Add Product from Catalog</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (Stock: {p.available_qty})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Cart Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-3 py-2.5">#</th>
                    <th className="px-3 py-2.5">Barcode</th>
                    <th className="px-3 py-2.5 min-w-[200px]">Product Name</th>
                    <th className="px-3 py-2.5 w-20 text-center">Qty</th>
                    <th className="px-3 py-2.5 w-24 text-right">Cost Price (৳)</th>
                    <th className="px-3 py-2.5 w-20 text-center">Free Qty</th>
                    <th className="px-3 py-2.5 w-28 text-right">Subtotal (৳)</th>
                    <th className="px-3 py-2.5 w-12 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {cart.map((item, idx) => (
                    <tr key={item.product_id} className="hover:bg-slate-50/70">
                      <td className="px-3 py-2 text-slate-400 font-semibold">{idx + 1}</td>
                      <td className="px-3 py-2 font-mono text-slate-500">{item.barcode}</td>
                      <td className="px-3 py-2 font-medium text-slate-900">{item.product_name}</td>
                      <td className="px-3 py-2 text-center">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            setCart(
                              cart.map((c) =>
                                c.product_id === item.product_id
                                  ? { ...c, quantity: Math.max(1, parseInt(e.target.value) || 1) }
                                  : c
                              )
                            )
                          }
                          className="w-16 text-center text-xs py-1 border border-slate-300 rounded-md font-bold"
                        />
                      </td>
                      <td className="px-3 py-2 text-right">
                        <input
                          type="number"
                          step="0.01"
                          value={item.unit_cost}
                          onChange={(e) =>
                            setCart(
                              cart.map((c) =>
                                c.product_id === item.product_id
                                  ? { ...c, unit_cost: Math.max(0, parseFloat(e.target.value) || 0) }
                                  : c
                              )
                            )
                          }
                          className="w-24 text-right text-xs py-1 px-2 border border-slate-300 rounded-md font-bold"
                        />
                      </td>
                      <td className="px-3 py-2 text-center">
                        <input
                          type="number"
                          min="0"
                          value={item.free_qty}
                          onChange={(e) =>
                            setCart(
                              cart.map((c) =>
                                c.product_id === item.product_id
                                  ? { ...c, free_qty: Math.max(0, parseInt(e.target.value) || 0) }
                                  : c
                              )
                            )
                          }
                          className="w-16 text-center text-xs py-1 border border-slate-300 rounded-md"
                        />
                      </td>
                      <td className="px-3 py-2 text-right font-extrabold text-slate-800">
                        ৳{(item.quantity * item.unit_cost).toLocaleString()}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <button
                          type="button"
                          onClick={() =>
                            setCart(cart.filter((c) => c.product_id !== item.product_id))
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
              <span>Cart Items: {cart.length}</span>
              <span>Total Units: {cart.reduce((s, i) => s + i.quantity + i.free_qty, 0)}</span>
              <span>Subtotal: <strong className="text-teal-700">৳{subtotal.toLocaleString()}</strong></span>
            </div>
          </div>

          <div>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Purchase order internal notes / truck chalan details..."
              className="w-full p-2.5 text-xs rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Right Column: Billing Panel (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-2">
              Purchase Settlement
            </h2>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Subtotal (Items)</span>
                <span className="font-bold text-slate-800">৳{subtotal.toLocaleString()}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-600">Supplier Discount</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={discount}
                  onChange={(e) => setDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-28 text-right py-1 px-2 border border-slate-300 rounded-md font-bold text-emerald-600"
                />
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-600">Tax / VAT (৳)</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={tax}
                  onChange={(e) => setTax(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-28 text-right py-1 px-2 border border-slate-300 rounded-md font-bold text-slate-800"
                />
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                <span className="font-extrabold text-slate-800 text-sm">Total Payable</span>
                <span className="font-black text-base text-teal-800">
                  ৳{totalPayable.toLocaleString()}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Payment Account
                  </label>
                  <select
                    value={paymentAccount}
                    onChange={(e) => setPaymentAccount(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white font-medium"
                  >
                    {accounts.map((a) => (
                      <option key={a.id} value={a.name}>
                        {a.name} (৳{Number(a.balance).toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-700 font-bold">Given / Paid Amount</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-28 text-right py-1 px-2 border border-slate-300 rounded-md font-black text-teal-700 text-sm"
                  />
                </div>

                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-600 font-bold">Balance Due to Supplier</span>
                  <span className="font-black text-sm text-rose-600">
                    ৳{dueAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs transition flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50 mt-4"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? "Processing..." : "Complete Purchase [F10]"}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
