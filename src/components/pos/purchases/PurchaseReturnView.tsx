"use client";
import { useState } from "react";
import {
  Supplier,
  Product,
  FinancialAccount,
  PurchaseRecord,
  useGetPurchasesQuery,
  useCreatePurchaseReturnMutation,
} from "@/redux/api/posApi";
import { errorMessage, localDate, money } from "@/lib/pos";
import { QueryState } from "../shared/QueryState";
import toast from "react-hot-toast";
export function PurchaseReturnView({
  suppliers,
  accounts,
  onNavigateToPurchases,
}: {
  suppliers: Supplier[];
  products: Product[];
  accounts: FinancialAccount[];
  outlets: { id: number; name: string }[];
  onNavigateToPurchases: () => void;
}) {
  const [supplier, setSupplier] = useState("");
  const [query, setQuery] = useState("");
  const [purchase, setPurchase] = useState<PurchaseRecord | null>(null);
  const [qty, setQty] = useState<Record<number, number>>({});
  const [date, setDate] = useState(localDate());
  const [refund, setRefund] = useState(0);
  const [reason, setReason] = useState("defective");
  const [note, setNote] = useState("");
  const [account, setAccount] = useState(accounts[0]?.name || "");
  const { data, isLoading, error, refetch } = useGetPurchasesQuery({
    supplier_id: supplier || undefined,
    chalan_no: query || undefined,
  });
  const [create, { isLoading: saving }] = useCreatePurchaseReturnMutation();
  const netUnitCost = (item: PurchaseRecord["items"][number]) =>
    purchase && Number(purchase.subtotal) > 0
      ? (Number(item.subtotal) * Number(purchase.total_payable)) /
        Number(purchase.subtotal) /
        (item.quantity + item.free_qty)
      : 0;
  const total = (purchase?.items || []).reduce(
    (sum, item) => sum + (qty[item.product_id] || 0) * netUnitCost(item),
    0,
  );
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!purchase || saving) return;
    const items = purchase.items.filter((item) => qty[item.product_id] > 0);
    if (!items.length) {
      toast.error("Enter a return quantity.");
      return;
    }
    try {
      await create({
        supplier_id: purchase.supplier_id,
        outlet_id: purchase.outlet_id,
        chalan_no: purchase.chalan_no,
        return_date: date,
        cash_refund: refund,
        due_deduction: total - refund,
        payment_account: account,
        note,
        items: items.map((item) => ({
          product_id: item.product_id,
          quantity: qty[item.product_id],
          unit_cost: Number(item.unit_cost),
          reason,
        })),
      }).unwrap();
      toast.success("Purchase return recorded.");
      onNavigateToPurchases();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };
  return (
    <div className="space-y-5">
      <div className="flex justify-between gap-3 items-center">
        <div>
          <p className="text-[10px] uppercase tracking-[.18em] text-teal-700 font-semibold mb-1">
            Purchasing / Returns
          </p>
          <h1 className="text-2xl font-semibold text-slate-900">
            Return to supplier
          </h1>
          <p className="mt-1 text-xs text-slate-600">
            Use an original purchase to return stock and settle supplier credit.
          </p>
        </div>
        <button
          className="pos-button-secondary"
          onClick={onNavigateToPurchases}
        >
          Purchases
        </button>
      </div>
      <div className="panel p-5 grid md:grid-cols-3 gap-4">
        <label>
          <span className="pos-label">Supplier</span>
          <select
            className="pos-field"
            value={supplier}
            onChange={(e) => {
              setSupplier(e.target.value);
              setPurchase(null);
            }}
          >
            <option value="">All suppliers</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="pos-label">Search chalan</span>
          <input
            className="pos-field"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Chalan number…"
          />
        </label>
        <label>
          <span className="pos-label">
            Original purchase · latest 15 matches
          </span>
          <select
            className="pos-field"
            value={purchase?.id || ""}
            onChange={(e) => {
              setPurchase(
                data?.data.data.find((p) => p.id === Number(e.target.value)) ||
                  null,
              );
              setQty({});
              setRefund(0);
            }}
          >
            <option value="">Choose purchase</option>
            {data?.data.data.map((p) => (
              <option key={p.id} value={p.id}>
                {p.chalan_no} · {p.supplier?.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      {isLoading || error ? (
        <QueryState loading={isLoading} error={error} retry={refetch} />
      ) : purchase ? (
        <form onSubmit={save} className="panel overflow-hidden">
          <div className="p-5 border-b border-slate-200">
            <h2 className="text-sm font-semibold">
              {purchase.supplier?.name} · {purchase.chalan_no}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Returns cannot exceed purchased quantities or available stock. The
              server checks prior returns.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="pos-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Purchased / Free</th>
                  <th>Net unit cost (TK)</th>
                  <th>Return quantity</th>
                  <th>Return value</th>
                </tr>
              </thead>
              <tbody>
                {purchase.items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.product_name}</td>
                    <td>
                      {item.quantity} + {item.free_qty}
                    </td>
                    <td>{money(netUnitCost(item))}</td>
                    <td>
                      <input
                        className="pos-field w-24"
                        aria-label={`Return ${item.product_name}`}
                        type="number"
                        min={0}
                        max={item.quantity + item.free_qty}
                        step={1}
                        value={qty[item.product_id] || 0}
                        onChange={(e) =>
                          setQty({
                            ...qty,
                            [item.product_id]: Number(e.target.value),
                          })
                        }
                      />
                    </td>
                    <td>
                      {money((qty[item.product_id] || 0) * netUnitCost(item))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-5 space-y-4">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <label>
                <span className="pos-label">Date</span>
                <input
                  required
                  className="pos-field"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </label>
              <label>
                <span className="pos-label">Refund received (TK)</span>
                <input
                  className="pos-field"
                  type="number"
                  min={0}
                  max={total}
                  step="0.01"
                  value={refund}
                  onChange={(e) => setRefund(Number(e.target.value))}
                />
              </label>
              <label>
                <span className="pos-label">Receiving account</span>
                <select
                  className="pos-field"
                  value={account}
                  onChange={(e) => setAccount(e.target.value)}
                >
                  {accounts.map((a) => (
                    <option key={a.id}>{a.name}</option>
                  ))}
                </select>
              </label>
              <label>
                <span className="pos-label">Reason</span>
                <input
                  required
                  className="pos-field"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </label>
            </div>
            <label>
              <span className="pos-label">Note</span>
              <textarea
                className="pos-field"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </label>
            <div className="flex items-center justify-between gap-4">
              <p className="text-xs text-slate-600">
                Return value: <strong>{money(total)} TK</strong>
                <br />
                Supplier due reduction:{" "}
                <strong>{money(total - refund)} TK</strong>
              </p>
              <button className="pos-button" disabled={saving}>
                {saving ? "Processing…" : "Process purchase return"}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="panel p-12 text-center text-sm text-slate-600">
          Choose the original purchase to begin.
        </div>
      )}
    </div>
  );
}
