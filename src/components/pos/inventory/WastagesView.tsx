"use client";
import { useState } from "react";
import { Plus } from "lucide-react";
import {
  Product,
  useGetWastagesQuery,
  useCreateWastageMutation,
} from "@/redux/api/posApi";
import { localDate, money, errorMessage } from "@/lib/pos";
import { Modal } from "../shared/Modal";
import { QueryState, Pagination } from "../shared/QueryState";
import toast from "react-hot-toast";
export function WastagesView({ products }: { products: Product[] }) {
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    product_id: "",
    quantity: 1,
    reason: "damaged",
    wastage_date: localDate(),
    note: "",
  });
  const { data, isLoading, error, refetch } = useGetWastagesQuery({ page });
  const [create, { isLoading: saving }] = useCreateWastageMutation();
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    try {
      await create({ ...form, product_id: Number(form.product_id) }).unwrap();
      toast.success("Stock loss recorded.");
      setOpen(false);
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[.18em] text-teal-700 font-semibold mb-1">
            Inventory / Losses
          </p>
          <h1 className="text-2xl font-semibold text-slate-900">
            Wastage & losses
          </h1>
          <p className="mt-1 text-xs text-slate-600">
            Track damaged, expired, lost, or scrapped stock.
          </p>
        </div>
        <button className="pos-button" onClick={() => setOpen(true)}>
          <Plus size={16} />
          Record loss
        </button>
      </div>
      {isLoading || error ? (
        <QueryState loading={isLoading} error={error} retry={refetch} />
      ) : (
        <div className="panel overflow-hidden">
          <div className="overflow-x-auto">
            <table className="pos-table">
              <thead>
                <tr>
                  {[
                    "Product",
                    "Quantity",
                    "Cost / Unit",
                    "Total loss (TK)",
                    "Reason",
                    "Date",
                  ].map((h) => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data?.data.data.map((row) => (
                  <tr key={row.id}>
                    <td className="font-medium">{row.product_name}</td>
                    <td>{row.quantity}</td>
                    <td>{money(row.unit_cost)}</td>
                    <td className="font-semibold text-rose-700">
                      {money(row.total_loss)}
                    </td>
                    <td>{row.reason}</td>
                    <td>{row.wastage_date.slice(0, 10)}</td>
                  </tr>
                ))}
                {!data?.data.data.length && (
                  <tr>
                    <td colSpan={6} className="py-10 text-center">
                      No stock losses recorded.
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
        </div>
      )}
      {open && (
        <Modal
          title="Record stock loss"
          onClose={() => {
            if (!saving) setOpen(false);
          }}
        >
          <form onSubmit={save} className="space-y-4">
            <label>
              <span className="pos-label">Product</span>
              <select
                required
                className="pos-field"
                value={form.product_id}
                onChange={(e) =>
                  setForm({ ...form, product_id: e.target.value })
                }
              >
                <option value="">Choose product</option>
                {products
                  .filter((p) => p.is_active && p.available_qty > 0)
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} · {p.available_qty} available
                    </option>
                  ))}
              </select>
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label>
                <span className="pos-label">Quantity</span>
                <input
                  required
                  type="number"
                  min={1}
                  max={
                    products.find((p) => p.id === Number(form.product_id))
                      ?.available_qty
                  }
                  step={1}
                  className="pos-field"
                  value={form.quantity}
                  onChange={(e) =>
                    setForm({ ...form, quantity: Number(e.target.value) })
                  }
                />
              </label>
              <label>
                <span className="pos-label">Reason</span>
                <select
                  className="pos-field"
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                >
                  {["damaged", "expired", "lost", "scrap"].map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </label>
            </div>
            <label>
              <span className="pos-label">Date</span>
              <input
                required
                type="date"
                className="pos-field"
                value={form.wastage_date}
                onChange={(e) =>
                  setForm({ ...form, wastage_date: e.target.value })
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
            <button className="pos-button w-full" disabled={saving}>
              {saving ? "Recording…" : "Record loss"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
