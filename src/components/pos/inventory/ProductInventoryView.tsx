"use client";
import { useState } from "react";
import {
  Package,
  Search,
  Plus,
  Download,
  Pencil,
  ClipboardCheck,
  AlertTriangle,
  Archive,
  History,
} from "lucide-react";
import {
  Product,
  Supplier,
  useCreateProductMutation,
  useUpdateProductMutation,
  useAdjustStockMutation,
  useGetStockAdjustmentsQuery,
} from "@/redux/api/posApi";
import { downloadCsv, errorMessage, money } from "@/lib/pos";
import { Modal } from "../shared/Modal";
import { Pagination, QueryState } from "../shared/QueryState";
import toast from "react-hot-toast";
const empty: Omit<Product, "id"> = {
  name: "",
  code: "",
  barcode: "",
  unit: "pcs",
  available_qty: 0,
  unit_price: 0,
  cost_price: 0,
  low_stock_threshold: 25,
  is_active: true,
};
export function ProductInventoryView({
  products,
  suppliers,
  canManage,
}: {
  products: Product[];
  suppliers: Supplier[];
  canManage: boolean;
}) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [editing, setEditing] = useState<Product | "new" | null>(null);
  const [form, setForm] = useState(empty);
  const [counting, setCounting] = useState<Product | null>(null);
  const [count, setCount] = useState(0);
  const [reason, setReason] = useState("");
  const [history, setHistory] = useState(false);
  const [page, setPage] = useState(1);
  const [create, { isLoading: creating }] = useCreateProductMutation();
  const [update, { isLoading: updating }] = useUpdateProductMutation();
  const [adjust, { isLoading: adjusting }] = useAdjustStockMutation();
  const {
    data: adjustments,
    isLoading,
    error,
    refetch,
  } = useGetStockAdjustmentsQuery({ page }, { skip: !history });
  const filtered = products.filter(
    (p) =>
      [p.name, p.code, p.barcode].some((text) =>
        text.toLowerCase().includes(search.toLowerCase()),
      ) &&
      (filter === "all" ||
        (filter === "low" &&
          p.is_active &&
          p.available_qty <= p.low_stock_threshold) ||
        (filter === "out" && p.is_active && p.available_qty === 0) ||
        (filter === "inactive" && !p.is_active)),
  );
  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editing || creating || updating) return;
    try {
      if (editing === "new") await create(form).unwrap();
      else await update({ ...form, id: editing.id }).unwrap();
      toast.success("Product saved.");
      setEditing(null);
    } catch (e) {
      toast.error(errorMessage(e));
    }
  };
  const saveCount = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!counting || adjusting) return;
    try {
      await adjust({
        id: counting.id,
        expected_quantity: counting.available_qty,
        counted_quantity: count,
        reason,
      }).unwrap();
      toast.success("Stock count recorded.");
      setCounting(null);
    } catch (e) {
      toast.error(errorMessage(e));
    }
  };
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-[.18em] text-teal-700">
            Inventory / Catalog
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Products & stock
          </h1>
          <p className="mt-1 text-xs text-slate-600">
            Manage your catalog, stock counts, and replenishment levels.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            className="pos-button-secondary"
            onClick={() => setHistory(!history)}
          >
            <History size={15} />
            {history ? "Catalog" : "Count history"}
          </button>
          <button
            className="pos-button-secondary"
            disabled={!filtered.length}
            onClick={() =>
              downloadCsv(
                "inventory",
                filtered.map((p) => ({
                  name: p.name,
                  code: p.code,
                  barcode: p.barcode,
                  stock: p.available_qty,
                  unit: p.unit,
                  price: p.unit_price,
                  cost: p.cost_price,
                  threshold: p.low_stock_threshold,
                  active: p.is_active,
                })),
              )
            }
          >
            <Download size={15} />
            Export CSV
          </button>
          {canManage && (
            <button
              className="pos-button"
              onClick={() => {
                setForm(empty);
                setEditing("new");
              }}
            >
              <Plus size={16} />
              Add product
            </button>
          )}
        </div>
      </div>
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {[
          [
            "Active products",
            products.filter((p) => p.is_active).length,
            Package,
            "text-teal-700",
            "all",
          ],
          [
            "Low stock",
            products.filter(
              (p) => p.is_active && p.available_qty <= p.low_stock_threshold,
            ).length,
            AlertTriangle,
            "text-amber-700",
            "low",
          ],
          [
            "Out of stock",
            products.filter((p) => p.is_active && p.available_qty === 0).length,
            Archive,
            "text-rose-700",
            "out",
          ],
          [
            "Stock value · TK",
            money(
              products.reduce(
                (sum, p) => sum + p.available_qty * Number(p.cost_price),
                0,
              ),
            ),
            ClipboardCheck,
            "text-slate-700",
            "all",
          ],
        ].map(([label, value, Icon, color, target]) => (
          <button
            key={label as string}
            onClick={() => {
              setFilter(target as string);
              setHistory(false);
            }}
            className="panel flex items-center gap-3 p-4 text-left"
          >
            {typeof Icon !== "string" && typeof Icon !== "number" && (
              <Icon size={22} className={color as string} />
            )}
            <div>
              <p className="text-[11px] text-slate-600">{label as string}</p>
              <p className="mt-1 text-xl font-semibold tabular-nums text-slate-900">
                {value as string}
              </p>
            </div>
          </button>
        ))}
      </div>
      {history ? (
        <div className="panel overflow-hidden">
          <div className="border-b border-slate-200 p-5 text-sm font-semibold">
            Stock count audit
          </div>
          {isLoading || error ? (
            <QueryState loading={isLoading} error={error} retry={refetch} />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="pos-table">
                  <thead>
                    <tr>
                      {[
                        "Product",
                        "Before",
                        "Counted",
                        "Change",
                        "Reason",
                        "Recorded by",
                        "Date",
                      ].map((h) => (
                        <th key={h}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {adjustments?.data.data.map((row) => (
                      <tr key={row.id}>
                        <td>{row.product_name}</td>
                        <td>{row.previous_quantity}</td>
                        <td>{row.counted_quantity}</td>
                        <td className="tabular-nums">
                          {row.difference > 0 ? "+" : ""}
                          {row.difference}
                        </td>
                        <td>{row.reason}</td>
                        <td>{row.user_name}</td>
                        <td className="whitespace-nowrap">
                          {new Date(row.created_at).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                    {!adjustments?.data.data.length && (
                      <tr>
                        <td colSpan={7} className="text-center">
                          No stock counts recorded yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <Pagination
                page={page}
                lastPage={adjustments?.data.last_page || 1}
                onChange={setPage}
              />
            </>
          )}
        </div>
      ) : (
        <div className="panel overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-4">
            <div className="relative w-full sm:w-80">
              <Search
                size={16}
                className="absolute top-3 left-3 text-slate-500"
              />
              <input
                className="pos-field pl-9"
                aria-label="Search products"
                placeholder="Search name, SKU, or barcode…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              className="pos-field w-auto"
              aria-label="Stock filter"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All products ({products.length})</option>
              <option value="low">Low stock</option>
              <option value="out">Out of stock</option>
              <option value="inactive">Inactive products</option>
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="pos-table">
              <thead>
                <tr>
                  {[
                    "Product",
                    "SKU / Barcode",
                    "Available",
                    "Selling price",
                    "Cost",
                    "Status",
                    ...(canManage ? ["Actions"] : []),
                  ].map((h) => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <p className="font-semibold text-slate-900">{p.name}</p>
                      <p className="mt-1 text-[10px] text-slate-500">
                        Reorder at {p.low_stock_threshold} {p.unit}
                      </p>
                    </td>
                    <td className="font-mono text-[11px]">
                      {p.code}
                      <br />
                      <span className="text-slate-500">{p.barcode}</span>
                    </td>
                    <td className="whitespace-nowrap font-semibold tabular-nums">
                      {p.available_qty}{" "}
                      <span className="font-normal text-slate-500">
                        {p.unit}
                      </span>
                    </td>
                    <td className="whitespace-nowrap tabular-nums">
                      {money(p.unit_price)} TK
                    </td>
                    <td className="whitespace-nowrap tabular-nums">
                      {money(p.cost_price)}
                    </td>
                    <td>
                      <span
                        className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-semibold ${!p.is_active ? "bg-slate-100 text-slate-700" : p.available_qty === 0 ? "bg-rose-50 text-rose-700" : p.available_qty <= p.low_stock_threshold ? "bg-amber-50 text-amber-800" : "bg-teal-50 text-teal-800"}`}
                      >
                        {!p.is_active
                          ? "Inactive"
                          : p.available_qty === 0
                            ? "Out of stock"
                            : p.available_qty <= p.low_stock_threshold
                              ? "Low stock"
                              : "In stock"}
                      </span>
                    </td>
                    {canManage && (
                      <td>
                        <div className="flex gap-1">
                          <button
                            title={`Edit ${p.name}`}
                            className="rounded-lg p-2 hover:bg-slate-100"
                            onClick={() => {
                              setForm({ ...p });
                              setEditing(p);
                            }}
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            title={`Count ${p.name}`}
                            className="rounded-lg p-2 hover:bg-teal-50 text-teal-700"
                            onClick={() => {
                              setCounting(p);
                              setCount(p.available_qty);
                              setReason("");
                            }}
                          >
                            <ClipboardCheck size={16} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
                {!filtered.length && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center">
                      {products.length
                        ? "No products match these filters."
                        : "Add your first product to start selling."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 text-xs text-slate-500">
            {filtered.length} products · Stock is updated after each completed
            transaction.
          </div>
        </div>
      )}
      {editing && (
        <Modal
          title={editing === "new" ? "Add product" : "Edit product"}
          onClose={() => {
            if (!creating && !updating) setEditing(null);
          }}
        >
          <form onSubmit={save} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {[
                ["name", "Product name", "text"],
                ["code", "SKU / Code", "text"],
                ["barcode", "Barcode", "text"],
                ["unit", "Unit", "text"],
                ["unit_price", "Selling price (TK)", "number"],
                ["cost_price", "Cost price (TK)", "number"],
                ["low_stock_threshold", "Low stock threshold", "number"],
                ...(editing === "new"
                  ? [["available_qty", "Opening stock", "number"]]
                  : []),
              ].map(([key, label, type]) => (
                <label className={key === "name" ? "col-span-2" : ""} key={key}>
                  <span className="pos-label">{label}</span>
                  <input
                    required
                    className="pos-field"
                    type={type}
                    min={type === "number" ? 0 : undefined}
                    step={
                      key.includes("price")
                        ? "0.01"
                        : type === "number"
                          ? "1"
                          : undefined
                    }
                    value={String(form[key as keyof typeof form] ?? "")}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        [key]:
                          type === "number"
                            ? Number(e.target.value)
                            : e.target.value,
                      })
                    }
                  />
                </label>
              ))}
              <label className="col-span-2">
                <span className="pos-label">Supplier</span>
                <select
                  className="pos-field"
                  value={form.supplier_id || ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      supplier_id: e.target.value
                        ? Number(e.target.value)
                        : null,
                    })
                  }
                >
                  <option value="">No supplier</option>
                  {suppliers.map((sup) => (
                    <option key={sup.id} value={sup.id}>
                      {sup.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label className="flex items-center gap-2 text-xs font-medium">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) =>
                  setForm({ ...form, is_active: e.target.checked })
                }
              />
              Available for sale
            </label>
            <p className="text-xs text-slate-500">
              Use stock counts to change existing quantities. Inactive products
              remain in transaction history.
            </p>
            <button
              className="pos-button w-full"
              disabled={creating || updating}
            >
              {creating || updating ? "Saving…" : "Save product"}
            </button>
          </form>
        </Modal>
      )}
      {counting && (
        <Modal
          title={`Count stock · ${counting.name}`}
          onClose={() => {
            if (!adjusting) setCounting(null);
          }}
        >
          <form onSubmit={saveCount} className="space-y-4">
            <p className="text-sm text-slate-600">
              Recorded stock:{" "}
              <strong>
                {counting.available_qty} {counting.unit}
              </strong>
            </p>
            <label>
              <span className="pos-label">Actual counted quantity</span>
              <input
                className="pos-field"
                required
                type="number"
                min={0}
                step={1}
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
              />
            </label>
            <label>
              <span className="pos-label">Reason</span>
              <input
                required
                maxLength={255}
                className="pos-field"
                value={reason}
                placeholder="Physical count, damaged stock, correction…"
                onChange={(e) => setReason(e.target.value)}
              />
            </label>
            <p className="text-xs text-slate-500">
              Change: {count - counting.available_qty} {counting.unit}. Your
              name and this reason will be saved in the audit history.
            </p>
            <button className="pos-button w-full" disabled={adjusting}>
              {adjusting ? "Recording…" : "Record stock count"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
