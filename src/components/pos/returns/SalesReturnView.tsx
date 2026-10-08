"use client";
import { useState } from "react";
import { RotateCcw, Plus, Trash2 } from "lucide-react";
import {
  Customer,
  Product,
  FinancialAccount,
  SaleRecord,
  useGetSalesQuery,
  useCreateSaleReturnMutation,
} from "@/redux/api/posApi";
import { errorMessage, localDate, money } from "@/lib/pos";
import { QueryState } from "../shared/QueryState";
import toast from "react-hot-toast";
export function SalesReturnView({
  customers,
  products,
  accounts,
  onNavigateToList,
}: {
  customers: Customer[];
  products: Product[];
  accounts: FinancialAccount[];
  onNavigateToList: () => void;
}) {
  const [customerId, setCustomerId] = useState("");
  const [search, setSearch] = useState("");
  const [sale, setSale] = useState<SaleRecord | null>(null);
  const [date, setDate] = useState(localDate());
  const [refund, setRefund] = useState(0);
  const [account, setAccount] = useState(accounts[0]?.name || "");
  const [comments, setComments] = useState("");
  const [returns, setReturns] = useState<
    Record<number, { quantity: number; condition: string }>
  >({});
  const [exchanges, setExchanges] = useState<
    { product_id: number; quantity: number }[]
  >([]);
  const { data, isLoading, error, refetch } = useGetSalesQuery({
    customer_id: customerId || undefined,
    invoice_id: search || undefined,
  });
  const [create, { isLoading: saving }] = useCreateSaleReturnMutation();
  const unitRefund = (item: NonNullable<SaleRecord["items"]>[number]) =>
    (Number(item.subtotal) / item.quantity) *
    (Number(sale?.invoice_total) > 0
      ? 1 -
        (Number(sale?.discount) + Number(sale?.special_discount)) /
          Number(sale?.invoice_total)
      : 0);
  const returnValue = (sale?.items || []).reduce(
    (sum, item) =>
      sum +
      Math.round(
        unitRefund(item) * (returns[item.product_id]?.quantity || 0) * 100,
      ) /
        100,
    0,
  );
  const exchangeValue = exchanges.reduce(
    (sum, item) =>
      sum +
      Number(products.find((p) => p.id === item.product_id)?.unit_price || 0) *
        item.quantity,
    0,
  );
  const net = returnValue - exchangeValue;
  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!sale?.customer_id || saving) return;
    const items = (sale.items || []).filter(
      (item) => returns[item.product_id]?.quantity > 0,
    );
    if (!items.length) {
      toast.error("Enter at least one returned quantity.");
      return;
    }
    try {
      await create({
        customer_id: sale.customer_id,
        supplier_id: sale.supplier_id,
        invoice_id: sale.invoice_id,
        return_date: date,
        cash_refund: refund,
        payment_account: account,
        comments,
        return_items: items.map((item) => ({
          product_id: item.product_id,
          quantity: returns[item.product_id].quantity,
          condition: returns[item.product_id].condition,
          unit_price: unitRefund(item),
        })),
        exchange_items: exchanges.map((item) => ({
          ...item,
          unit_price: Number(
            products.find((p) => p.id === item.product_id)?.unit_price || 0,
          ),
        })),
      }).unwrap();
      toast.success("Return and exchange recorded.");
      onNavigateToList();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[.18em] text-teal-700 font-semibold mb-1">
            Sales / Returns
          </p>
          <h1 className="text-2xl font-semibold text-slate-900">
            Return & exchange
          </h1>
          <p className="mt-1 text-xs text-slate-600">
            Reference an original invoice. Discounts and remaining quantities
            are checked by the server.
          </p>
        </div>
        <button className="pos-button-secondary" onClick={onNavigateToList}>
          Return history
        </button>
      </div>
      <div className="panel p-5 grid md:grid-cols-3 gap-4">
        <label>
          <span className="pos-label">Filter customer</span>
          <select
            className="pos-field"
            value={customerId}
            onChange={(e) => {
              setCustomerId(e.target.value);
              setSale(null);
            }}
          >
            <option value="">All customers</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="pos-label">Search invoice</span>
          <input
            className="pos-field"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Invoice number…"
          />
        </label>
        <label>
          <span className="pos-label">
            Original invoice · latest 15 matches
          </span>
          <select
            className="pos-field"
            value={sale?.id || ""}
            onChange={(e) => {
              const selected = data?.data.data.find(
                (s) => s.id === Number(e.target.value),
              );
              setSale(selected || null);
              setReturns({});
              setExchanges([]);
              setRefund(0);
            }}
          >
            <option value="">Select a completed invoice</option>
            {data?.data.data
              .filter((s) => s.customer_id)
              .map((s) => (
                <option key={s.id} value={s.id}>
                  {s.invoice_id} · {s.customer?.name}
                </option>
              ))}
          </select>
        </label>
      </div>
      {isLoading || error ? (
        <QueryState loading={isLoading} error={error} retry={refetch} />
      ) : !sale ? (
        <div className="panel p-12 text-center">
          <RotateCcw className="mx-auto text-teal-700 mb-3" />
          <p className="text-sm text-slate-600">
            Select the original invoice to begin a return.
          </p>
        </div>
      ) : (
        <form onSubmit={save} className="space-y-5">
          <div className="panel overflow-hidden">
            <div className="p-5 border-b border-slate-200">
              <h2 className="text-sm font-semibold">
                {sale.customer?.name} · {sale.sale_date.slice(0, 10)}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Only good items are restocked. Damaged and scrap items are
                recorded as losses.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="pos-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Sold</th>
                    <th>Refund per unit (TK)</th>
                    <th>Return quantity</th>
                    <th>Condition</th>
                  </tr>
                </thead>
                <tbody>
                  {sale.items?.map((item) => (
                    <tr key={item.id}>
                      <td className="font-medium">{item.product_name}</td>
                      <td>{item.quantity}</td>
                      <td>{money(unitRefund(item))}</td>
                      <td>
                        <input
                          aria-label={`Return quantity for ${item.product_name}`}
                          className="pos-field w-24"
                          type="number"
                          min={0}
                          max={item.quantity}
                          step={1}
                          value={returns[item.product_id]?.quantity || 0}
                          onChange={(e) =>
                            setReturns({
                              ...returns,
                              [item.product_id]: {
                                quantity: Number(e.target.value),
                                condition:
                                  returns[item.product_id]?.condition || "good",
                              },
                            })
                          }
                        />
                      </td>
                      <td>
                        <select
                          aria-label={`Condition of ${item.product_name}`}
                          className="pos-field"
                          value={returns[item.product_id]?.condition || "good"}
                          onChange={(e) =>
                            setReturns({
                              ...returns,
                              [item.product_id]: {
                                quantity:
                                  returns[item.product_id]?.quantity || 0,
                                condition: e.target.value,
                              },
                            })
                          }
                        >
                          <option value="good">Good · restock</option>
                          <option value="damaged">Damaged</option>
                          <option value="scrap">Scrap</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="panel p-5 space-y-3">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-semibold">Replacement products</h2>
              <button
                type="button"
                className="pos-button-secondary"
                onClick={() =>
                  setExchanges([...exchanges, { product_id: 0, quantity: 1 }])
                }
              >
                <Plus size={15} />
                Add replacement
              </button>
            </div>
            {exchanges.map((item, index) => (
              <div className="flex gap-3" key={index}>
                <select
                  required
                  aria-label="Replacement product"
                  className="pos-field flex-1"
                  value={item.product_id || ""}
                  onChange={(e) =>
                    setExchanges(
                      exchanges.map((it, i) =>
                        i === index
                          ? { ...it, product_id: Number(e.target.value) }
                          : it,
                      ),
                    )
                  }
                >
                  <option value="">Choose product</option>
                  {products
                    .filter((p) => p.is_active)
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} · {money(p.unit_price)} TK
                      </option>
                    ))}
                </select>
                <input
                  required
                  aria-label="Replacement quantity"
                  className="pos-field w-24"
                  type="number"
                  min={1}
                  step={1}
                  value={item.quantity}
                  onChange={(e) =>
                    setExchanges(
                      exchanges.map((it, i) =>
                        i === index
                          ? { ...it, quantity: Number(e.target.value) }
                          : it,
                      ),
                    )
                  }
                />
                <button
                  type="button"
                  aria-label="Remove replacement"
                  className="p-2 text-rose-600"
                  onClick={() =>
                    setExchanges(exchanges.filter((_, i) => i !== index))
                  }
                >
                  <Trash2 size={17} />
                </button>
              </div>
            ))}
            {!exchanges.length && (
              <p className="text-xs text-slate-500">
                Leave empty to process a return without an exchange.
              </p>
            )}
          </div>
          <div className="panel p-5">
            <div className="grid sm:grid-cols-3 gap-4">
              <label>
                <span className="pos-label">Return date</span>
                <input
                  required
                  className="pos-field"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </label>
              <label>
                <span className="pos-label">Cash refund (TK)</span>
                <input
                  className="pos-field"
                  type="number"
                  min={0}
                  max={Math.max(0, net)}
                  step="0.01"
                  value={refund}
                  onChange={(e) => setRefund(Number(e.target.value))}
                />
              </label>
              <label>
                <span className="pos-label">Refund account</span>
                <select
                  required
                  className="pos-field"
                  value={account}
                  onChange={(e) => setAccount(e.target.value)}
                >
                  {accounts.map((a) => (
                    <option key={a.id}>{a.name}</option>
                  ))}
                </select>
              </label>
            </div>
            <label className="block mt-4">
              <span className="pos-label">Reason / Comments</span>
              <textarea
                className="pos-field"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
              />
            </label>
            <div className="mt-5 flex flex-wrap justify-between gap-4 items-center">
              <div className="text-xs text-slate-600">
                Returned: <strong>{money(returnValue)}</strong> · Replacements:{" "}
                <strong>{money(exchangeValue)}</strong>
                <p className="mt-1">
                  Net credit:{" "}
                  <strong className="text-teal-800">
                    {money(net - refund)} TK
                  </strong>{" "}
                  · Unused credit becomes customer advance.
                </p>
              </div>
              <button className="pos-button" disabled={saving}>
                {saving ? "Processing…" : "Process return"}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
