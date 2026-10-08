"use client";
import { errorMessage } from "@/lib/pos";
import { localDate } from "@/lib/pos";

import { Pagination, QueryState } from "../shared/QueryState";

import React, { useState } from "react";
import {
  ArrowRightLeft,
  Warehouse,
  Building2,
  Calendar,
  Trash2,
  CheckCircle2,
  History,
} from "lucide-react";
import {
  Product,
  Outlet,
  useGetStockTransfersQuery,
  useCreateStockTransferMutation,
} from "@/redux/api/posApi";
import toast from "react-hot-toast";

interface TransferItemRow {
  product_id: number;
  product_name: string;
  quantity: number;
  stock_available: number;
}

interface StockTransferViewProps {
  products: Product[];
  outlets: Outlet[];
}

export function StockTransferView({
  products,
  outlets,
}: StockTransferViewProps) {
  const [transferType, setTransferType] = useState<"warehouse" | "company">(
    "warehouse",
  );
  const [sourceName, setSourceName] = useState(
    outlets[0]?.name || "DATTA & BROTHERS ELECTRICS (Main Hub)",
  );
  const [destName, setDestName] = useState(
    outlets[1]?.name || "SMART ACCOUNT CENTRAL (Branch 2)",
  );
  const [transferDate, setTransferDate] = useState(localDate());
  const [note, setNote] = useState("");

  const [items, setItems] = useState<TransferItemRow[]>([
    {
      product_id: products[0]?.id || 1,
      product_name: products[0]?.name || "Electric Wire 1.5mm Red Coil (100m)",
      quantity: 10,
      stock_available: products[0]?.available_qty || 150,
    },
  ]);

  const [page, setPage] = useState(1);
  const {
    data: transfersData,
    refetch,
    error,
  } = useGetStockTransfersQuery({ page });
  const [createTransfer, { isLoading: isSubmitting }] =
    useCreateStockTransferMutation();

  const transferList = transfersData?.data?.data || [];

  const handleAddItem = (prod: Product) => {
    if (items.some((i) => i.product_id === prod.id)) {
      setItems(
        items.map((i) =>
          i.product_id === prod.id ? { ...i, quantity: i.quantity + 1 } : i,
        ),
      );
    } else {
      setItems([
        ...items,
        {
          product_id: prod.id,
          product_name: prod.name,
          quantity: 1,
          stock_available: prod.available_qty,
        },
      ]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sourceName === destName) {
      toast.error("Source and destination must be different.");
      return;
    }
    if (items.length === 0) {
      toast.error("Please add at least one item to transfer.");
      return;
    }

    try {
      await createTransfer({
        transfer_type: transferType,
        source_name: sourceName,
        destination_name: destName,
        transfer_date: transferDate,
        note,
        items: items.map((i) => ({
          product_id: i.product_id,
          quantity: i.quantity,
        })),
      }).unwrap();

      toast.success("Stock transfer executed successfully!");
      refetch();
      setNote("");
    } catch (err: unknown) {
      toast.error(errorMessage(err, "Failed to execute stock transfer."));
    }
  };

  return (
    <div className="space-y-4">
      {error && <QueryState error={error} retry={refetch} />}
      <Pagination
        page={page}
        lastPage={transfersData?.data?.last_page || 1}
        onChange={setPage}
      />
      {/* Header bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
            <ArrowRightLeft className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-slate-900 tracking-tight">
              Stock Transfer Management
            </h1>
            <p className="text-xs text-slate-500">
              Shift stock between warehouse distribution hubs or sister
              companies with transit audit
            </p>
          </div>
        </div>

        {/* Transfer type toggle */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg overflow-x-auto max-w-full">
          <button
            type="button"
            onClick={() => setTransferType("warehouse")}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition ${
              transferType === "warehouse"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Warehouse to Warehouse
          </button>
          <button
            type="button"
            onClick={() => setTransferType("company")}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition ${
              transferType === "company"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Company to Company
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Form panel (7 cols) */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-2">
              {transferType === "warehouse"
                ? "Warehouse Route"
                : "Company Route"}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Source{" "}
                  {transferType === "warehouse" ? "Warehouse" : "Company"}
                </label>
                <div className="relative">
                  <Warehouse className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    value={sourceName}
                    onChange={(e) => setSourceName(e.target.value)}
                    className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-lg border border-slate-300 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Destination{" "}
                  {transferType === "warehouse" ? "Warehouse" : "Company"}
                </label>
                <div className="relative">
                  <Building2 className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    value={destName}
                    onChange={(e) => setDestName(e.target.value)}
                    className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-lg border border-slate-300 font-medium"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Transfer Date
                </label>
                <div className="relative">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="date"
                    value={transferDate}
                    onChange={(e) => setTransferDate(e.target.value)}
                    className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-lg border border-slate-300 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Quick Add Product
                </label>
                <select
                  value=""
                  onChange={(e) => {
                    const pid = Number(e.target.value);
                    const p = products.find((prod) => prod.id === pid);
                    if (p) handleAddItem(p);
                  }}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-slate-50 font-medium"
                >
                  <option value="">+ Select Item to Transfer</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Stock: {p.available_qty})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Transfer Items Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="p-2.5">#</th>
                    <th className="p-2.5">Product Name</th>
                    <th className="p-2.5 text-center">Available Stock</th>
                    <th className="p-2.5 text-center w-28">Transfer Qty</th>
                    <th className="p-2.5 text-center w-12">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((it, idx) => (
                    <tr key={it.product_id} className="hover:bg-slate-50">
                      <td className="p-2.5 text-slate-400 font-semibold">
                        {idx + 1}
                      </td>
                      <td className="p-2.5 font-medium text-slate-900">
                        {it.product_name}
                      </td>
                      <td className="p-2.5 text-center text-slate-600 font-bold">
                        {it.stock_available}
                      </td>
                      <td className="p-2.5 text-center">
                        <input
                          type="number"
                          min="1"
                          max={it.stock_available}
                          value={it.quantity}
                          onChange={(e) =>
                            setItems(
                              items.map((i) =>
                                i.product_id === it.product_id
                                  ? {
                                      ...i,
                                      quantity: Math.max(
                                        1,
                                        parseInt(e.target.value) || 1,
                                      ),
                                    }
                                  : i,
                              ),
                            )
                          }
                          className="w-20 text-center py-1 border border-slate-300 rounded-md font-semibold text-teal-800"
                        />
                      </td>
                      <td className="p-2.5 text-center">
                        <button
                          type="button"
                          onClick={() =>
                            setItems(
                              items.filter(
                                (i) => i.product_id !== it.product_id,
                              ),
                            )
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

            <div className="bg-slate-50 p-3 border-t border-slate-200 flex justify-between items-center text-xs">
              <span className="text-slate-600">
                Total Products: <strong>{items.length}</strong> | Total Units:{" "}
                <strong>{items.reduce((s, i) => s + i.quantity, 0)}</strong>
              </span>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs transition shadow-xs flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>
                  {isSubmitting ? "Transferring..." : "Complete Transfer"}
                </span>
              </button>
            </div>
          </div>
        </form>

        {/* Right: Transfer History Log (5 cols) */}
        <div className="lg:col-span-5 bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-slate-500" />
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                Recent Stock Transfer Logs
              </h2>
            </div>
          </div>

          <div className="space-y-2.5 max-h-[500px] overflow-y-auto">
            {transferList.length === 0 ? (
              <p className="text-center text-xs text-slate-400 p-6 italic">
                No stock transfers logged yet.
              </p>
            ) : (
              transferList.map((trf) => (
                <div
                  key={trf.id}
                  className="p-3 rounded-lg border border-slate-200 bg-slate-50/60 text-xs space-y-1 hover:border-teal-300 transition"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-teal-800">
                      {trf.transfer_no}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                      {trf.status}
                    </span>
                  </div>
                  <div className="text-slate-700 font-medium">
                    {trf.source_name} ➔ {trf.destination_name}
                  </div>
                  <div className="flex justify-between text-slate-500 text-[11px] pt-1">
                    <span>Date: {trf.transfer_date}</span>
                    <span>
                      Units: <strong>{trf.total_items}</strong>
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
