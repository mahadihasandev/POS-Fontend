"use client";
import { useEffect, useRef, useState } from "react";
import { Search, Package, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import {
  Customer,
  Supplier,
  Marketer,
  Product,
  FinancialAccount,
  CartItem,
  SaleRecord,
  CreateSalePayload,
  useCreateSaleMutation,
} from "@/redux/api/posApi";
import { PosHeaderBanner } from "./PosHeaderBanner";
import { PosCustomerRow } from "./PosCustomerRow";
import { PosBarcodeScanner } from "./PosBarcodeScanner";
import { PosProductRow } from "./PosProductRow";
import { PosCartTable } from "./PosCartTable";
import { PosBillingPanel } from "./PosBillingPanel";
import { InvoiceReceiptModal } from "./InvoiceReceiptModal";
import { sounds } from "@/lib/sound";
import { errorMessage, localDate, money } from "@/lib/pos";
export interface PosTerminalProps {
  saleType: "normal" | "supplier_wise";
  customers: Customer[];
  suppliers: Supplier[];
  marketers: Marketer[];
  products: Product[];
  accounts: FinancialAccount[];
  outletName: string;
  outletId: number | null;
  userId: number;
  onNavigateToList: () => void;
  initialSale: SaleRecord | null;
  onSaleFinished: () => void;
  canHold: boolean;
  heldCount: number;
  onOpenHoldList: () => void;
}
type Draft = {
  customer: number | null;
  supplier: number | null;
  marketer: number | null;
  date: string;
  note: string;
  items: CartItem[];
  discount: number;
  special: number;
  delivery: number;
  payer: "company" | "customer";
  account: string;
  received: number;
  heldId: number | null;
};
const round = (n: number) => Math.round(n * 100) / 100;
function freshDraft(account: string): Draft {
  return {
    customer: null,
    supplier: null,
    marketer: null,
    date: localDate(),
    note: "",
    items: [],
    discount: 0,
    special: 0,
    delivery: 0,
    payer: "company",
    account,
    received: 0,
    heldId: null,
  };
}
function fromHeld(
  sale: SaleRecord,
  products: Product[],
  account: string,
): Draft {
  return {
    ...freshDraft(account),
    customer: sale.customer_id || null,
    supplier: sale.supplier_id || null,
    marketer: sale.marketer_id || null,
    date: sale.sale_date.slice(0, 10),
    note: sale.note || "",
    discount: Number(sale.discount),
    special: Number(sale.special_discount),
    delivery: Number(sale.delivery_charge),
    payer: sale.delivery_payer === "customer" ? "customer" : "company",
    account: sale.payment_account,
    heldId: sale.id,
    items: (sale.items || []).map((item) => {
      const product = products.find((p) => p.id === item.product_id);
      if (!product)
        throw new Error(`Product ${item.product_name} is no longer available.`);
      return {
        product,
        quantity: item.quantity,
        unit_price: Number(item.unit_price),
        discount_percent: Number(item.discount_percent),
        subtotal: Number(item.subtotal),
        profit: round(
          Number(item.subtotal) - Number(product.cost_price) * item.quantity,
        ),
      };
    }),
  };
}
export function PosTerminal({
  saleType,
  customers,
  suppliers,
  marketers,
  products,
  accounts,
  outletName,
  outletId,
  userId,
  onNavigateToList,
  initialSale,
  onSaleFinished,
  canHold,
  heldCount,
  onOpenHoldList,
}: PosTerminalProps) {
  const storageKey = `pos-draft:${userId}:${outletId}:${saleType}`;
  const [draft, setDraft] = useState<Draft>(() => {
    if (initialSale) {
      try {
        return fromHeld(initialSale, products, accounts[0]?.name || "");
      } catch {
        return freshDraft(accounts[0]?.name || "");
      }
    }
    try {
      const saved = sessionStorage.getItem(storageKey);
      if (saved) {
        const value = JSON.parse(saved) as { version: number; draft: Draft };
        if (value.version === 1 && Array.isArray(value.draft.items))
          return value.draft;
      }
    } catch {
      /* Storage may be disabled. */
    }
    return freshDraft(accounts[0]?.name || "");
  });
  const patch = (values: Partial<Draft>) =>
    setDraft((d) => ({ ...d, ...values }));
  const [query, setQuery] = useState("");
  const [completedSale, setCompletedSale] = useState<SaleRecord | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [printMode, setPrintMode] = useState<"pos" | "normal">("pos");
  const [createSale, { isLoading: isSaving }] = useCreateSaleMutation();
  const busy = useRef(false);
  const [savedAttempt] = useState<{ fingerprint: string; id: string } | null>(
    () => {
      try {
        return JSON.parse(
          sessionStorage.getItem(`${storageKey}:attempt`) || "null",
        );
      } catch {
        return null;
      }
    },
  );
  const attempt = useRef(savedAttempt);
  const customerRef = useRef<HTMLSelectElement>(null),
    barcodeRef = useRef<HTMLInputElement>(null),
    productRef = useRef<HTMLSelectElement>(null),
    receiveRef = useRef<HTMLInputElement>(null);
  const items = draft.items.map((item) => ({
    ...item,
    product: products.find((p) => p.id === item.product.id) || item.product,
  }));
  const customer = customers.find((c) => c.id === draft.customer);
  const previousDue = Number(customer?.previous_due || 0);
  const invoiceTotal = round(
    items.reduce((sum, item) => sum + item.subtotal, 0),
  );
  const gross = round(
    invoiceTotal -
      draft.discount -
      draft.special +
      (draft.payer === "customer" ? draft.delivery : 0) +
      previousDue,
  );
  const advancedUsed = Math.min(
    Number(customer?.advanced_amount || 0),
    Math.max(0, gross),
  );
  const payable = round(Math.max(0, gross - advancedUsed));
  const change = round(Math.max(0, draft.received - payable)),
    due = round(Math.max(0, payable - draft.received));
  const catalog = products.filter(
    (p) =>
      p.is_active &&
      (!draft.supplier || p.supplier_id === draft.supplier) &&
      [p.name, p.code, p.barcode].some((text) =>
        text.toLowerCase().includes(query.toLowerCase()),
      ),
  );
  useEffect(() => {
    try {
      if (draft.items.length)
        sessionStorage.setItem(
          storageKey,
          JSON.stringify({ version: 1, draft }),
        );
      else sessionStorage.removeItem(storageKey);
    } catch {
      /* Checkout still works without browser storage. */
    }
  }, [draft, storageKey]);
  useEffect(() => {
    if (!draft.items.length) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [draft.items.length]);
  const add = (
    product: Product,
    quantity = 1,
    price = Number(product.unit_price),
  ): boolean => {
    const existing = draft.items.find((item) => item.product.id === product.id);
    const nextQty = (existing?.quantity || 0) + quantity;
    if (
      !product.is_active ||
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      nextQty > product.available_qty ||
      !Number.isFinite(price) ||
      price < 0
    ) {
      toast.error(
        "Check the quantity and price. Available stock cannot be exceeded.",
      );
      return false;
    }
    const percent = existing?.discount_percent || 0;
    const subtotal = round(nextQty * price * (1 - percent / 100));
    const row = {
      product,
      quantity: nextQty,
      unit_price: price,
      discount_percent: percent,
      subtotal,
      profit: round(subtotal - Number(product.cost_price) * nextQty),
    };
    patch({
      items: existing
        ? items.map((item) => (item.product.id === product.id ? row : item))
        : [...items, row],
    });
    return true;
  };
  const scan = (barcode: string) => {
    const product = products.find(
      (p) =>
        p.barcode.toLowerCase() === barcode.toLowerCase() ||
        p.code.toLowerCase() === barcode.toLowerCase(),
    );
    if (!product) {
      toast.error("Barcode not found in catalog.");
      return false;
    }
    if (draft.supplier && product.supplier_id !== draft.supplier) {
      toast.error("This product belongs to another supplier.");
      return false;
    }
    return add(product);
  };
  const updateItem = (index: number, quantity: number, percent: number) => {
    const item = items[index];
    if (
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > item.product.available_qty
    ) {
      toast.error(
        `Only ${item.product.available_qty} ${item.product.unit} available.`,
      );
      return;
    }
    percent = Math.min(100, Math.max(0, percent));
    const subtotal = round(quantity * item.unit_price * (1 - percent / 100));
    patch({
      items: items.map((it, i) =>
        i === index
          ? {
              ...it,
              quantity,
              discount_percent: percent,
              subtotal,
              profit: round(
                subtotal - Number(it.product.cost_price) * quantity,
              ),
            }
          : it,
      ),
    });
  };
  const save = async (hold = false) => {
    if (busy.current || isSaving || completedSale) return;
    if (!items.length) {
      toast.error("Add a product before saving.");
      return;
    }
    if (!outletId) {
      toast.error("Choose a branch before saving.");
      return;
    }
    if (draft.discount + draft.special > invoiceTotal) {
      toast.error("Discounts cannot exceed the invoice total.");
      return;
    }
    if (!hold && !draft.customer && due > 0) {
      toast.error(
        "Choose a customer for a credit sale or receive the full amount.",
      );
      return;
    }
    const payload: CreateSalePayload = {
      outlet_id: outletId,
      held_sale_id: draft.heldId,
      customer_id: draft.customer,
      supplier_id: draft.supplier,
      marketer_id: draft.marketer,
      sale_date: draft.date,
      sale_type: saleType,
      note: draft.note,
      discount: draft.discount,
      special_discount: draft.special,
      delivery_charge: draft.delivery,
      delivery_payer: draft.payer,
      payment_account: draft.account,
      paid_amount: hold ? 0 : draft.received,
      is_hold: hold,
      items: items.map((item) => ({
        product_id: item.product.id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        discount_percent: item.discount_percent,
      })),
    };
    const fingerprint = JSON.stringify(payload);
    if (attempt.current?.fingerprint !== fingerprint)
      attempt.current = { fingerprint, id: crypto.randomUUID() };
    payload.request_id = attempt.current.id;
    try {
      sessionStorage.setItem(
        `${storageKey}:attempt`,
        JSON.stringify(attempt.current),
      );
    } catch {
      /* Storage is optional. */
    }
    busy.current = true;
    try {
      const result = await createSale(payload).unwrap();
      attempt.current = null;
      try {
        sessionStorage.removeItem(`${storageKey}:attempt`);
      } catch {
        /* Storage is optional. */
      }
      setDraft(freshDraft(draft.account));
      sounds.playSuccessChime();
      if (hold) {
        toast.success("Sale saved to the hold queue.");
        onSaleFinished();
      } else {
        setCompletedSale(result.data);
        toast.success("Sale completed.");
      }
    } catch (error) {
      toast.error(errorMessage(error));
      sounds.playErrorBeep();
    } finally {
      busy.current = false;
    }
  };
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (completedSale || document.querySelector('[role="dialog"]')) return;
      const targets: Record<string, HTMLElement | null> = {
        F1: customerRef.current,
        F2: barcodeRef.current,
        F3: productRef.current,
        F8: receiveRef.current,
      };
      if (event.key in targets) {
        event.preventDefault();
        targets[event.key]?.focus();
      }
      if (event.key === "F10") {
        event.preventDefault();
        void save();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });
  return (
    <div
      className={`space-y-5 ${fullscreen ? "fixed inset-0 z-40 overflow-y-auto bg-slate-100 p-4" : ""}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[.18em] text-teal-700 mb-1">
            Sales / Checkout
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            {saleType === "supplier_wise"
              ? "Supplier checkout"
              : "Point of sale"}
          </h1>
          <p className="mt-1 text-xs text-slate-600">
            {draft.heldId
              ? "Resumed order · original held sale is kept until you save."
              : "Scan, add, and settle. Your draft is saved in this browser tab."}
          </p>
        </div>
        <button
          className="pos-button-secondary"
          disabled={!items.length || isSaving}
          onClick={() => {
            if (
              window.confirm(
                "Clear this checkout draft? Held sales remain in the queue.",
              )
            ) {
              attempt.current = null;
              try {
                sessionStorage.removeItem(`${storageKey}:attempt`);
              } catch {
                /* Storage is optional. */
              }
              setDraft(freshDraft(draft.account));
              onSaleFinished();
            }
          }}
        >
          <Trash2 size={15} />
          <span className="hidden sm:inline">Clear cart</span>
        </button>
      </div>
      <div className="flex flex-col xl:flex-row gap-5 items-start">
        <div className="w-full min-w-0 xl:flex-1 panel overflow-hidden">
          <PosHeaderBanner
            title={draft.heldId ? "Resumed checkout" : "New transaction"}
            heldCount={heldCount}
            onOpenHoldList={onOpenHoldList}
            isFullscreen={fullscreen}
            onToggleFullscreen={() => setFullscreen(!fullscreen)}
          />
          <PosCustomerRow
            customers={customers}
            suppliers={suppliers}
            marketers={marketers}
            selectedCustomerId={draft.customer}
            onSelectCustomer={(customer) => patch({ customer })}
            selectedSupplierId={draft.supplier}
            onSelectSupplier={(supplier) => patch({ supplier })}
            selectedMarketerId={draft.marketer}
            onSelectMarketer={(marketer) => patch({ marketer })}
            saleDate={draft.date}
            onChangeSaleDate={(date) => patch({ date })}
            note={draft.note}
            onChangeNote={(note) => patch({ note })}
            customerInputRef={customerRef}
          />
          <PosBarcodeScanner onScanBarcode={scan} inputRef={barcodeRef} />
          <div className="border-b border-slate-200 p-4">
            <div className="flex items-center justify-between gap-3 mb-3">
              <span className="flex gap-2 items-center text-xs font-semibold">
                <Package size={15} className="text-teal-700" />
                Quick add products
              </span>
              <div className="relative w-48 sm:w-64">
                <Search
                  size={14}
                  className="absolute left-2.5 top-2.5 text-slate-500"
                />
                <input
                  aria-label="Search quick products"
                  className="w-full h-8 rounded-lg border border-slate-300 pl-8 pr-2 text-xs"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search products…"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {catalog.slice(0, 6).map((p) => (
                <button
                  key={p.id}
                  disabled={p.available_qty <= 0}
                  onClick={() => {
                    if (add(p)) sounds.playScanBeep();
                  }}
                  className="rounded-xl border border-slate-200 p-3 text-left hover:border-teal-600 hover:bg-teal-50 transition"
                >
                  <p
                    className="truncate text-[11px] font-semibold text-slate-900"
                    title={p.name}
                  >
                    {p.name}
                  </p>
                  <div className="mt-2 flex justify-between gap-2">
                    <span className="text-xs font-semibold text-teal-800 tabular-nums">
                      {money(p.unit_price)}
                    </span>
                    <span
                      className={`text-[9px] ${p.available_qty <= p.low_stock_threshold ? "text-amber-800" : "text-slate-500"}`}
                    >
                      {p.available_qty} {p.unit}
                    </span>
                  </div>
                </button>
              ))}
              {!catalog.length && (
                <p className="col-span-3 py-4 text-xs text-slate-600">
                  No available products match your search.
                </p>
              )}
            </div>
          </div>
          <PosProductRow
            products={products.filter(
              (p) =>
                p.is_active &&
                (!draft.supplier || p.supplier_id === draft.supplier),
            )}
            onAddItem={add}
            productInputRef={productRef}
          />
          <div className="flex justify-between px-4 py-3 text-xs border-b border-slate-200">
            <span className="font-semibold">
              Current cart{" "}
              <span className="ml-2 rounded-full bg-teal-50 px-2 py-0.5 text-teal-800">
                {items.length}
              </span>
            </span>
            <span className="text-slate-500">
              {items.reduce((sum, item) => sum + item.quantity, 0)} units
            </span>
          </div>
          <PosCartTable
            items={items}
            onUpdateQty={(index, qty) =>
              updateItem(index, qty, items[index].discount_percent)
            }
            onUpdateDiscount={(index, percent) =>
              updateItem(index, items[index].quantity, percent)
            }
            onRemoveItem={(index) =>
              patch({ items: items.filter((_, i) => i !== index) })
            }
          />
        </div>
        <PosBillingPanel
          invoiceTotal={invoiceTotal}
          discount={draft.discount}
          onChangeDiscount={(discount) =>
            patch({ discount: Math.max(0, discount) })
          }
          specialDiscount={draft.special}
          onChangeSpecialDiscount={(special) =>
            patch({ special: Math.max(0, special) })
          }
          deliveryCharge={draft.delivery}
          onChangeDeliveryCharge={(delivery) =>
            patch({ delivery: Math.max(0, delivery) })
          }
          deliveryPayer={draft.payer}
          onChangeDeliveryPayer={(payer) => patch({ payer })}
          previousDue={previousDue}
          advancedAmount={advancedUsed}
          totalPayable={payable}
          paymentAccount={draft.account}
          onChangePaymentAccount={(account) => patch({ account })}
          accounts={accounts}
          receivedAmount={draft.received}
          onChangeReceivedAmount={(received) =>
            patch({ received: Math.max(0, received) })
          }
          changeReturn={change}
          dueAmount={due}
          printMode={printMode}
          onChangePrintMode={setPrintMode}
          onSaveSale={() => {
            void save();
          }}
          onHoldSale={() => {
            void save(true);
          }}
          onNavigateToList={onNavigateToList}
          isSaving={isSaving}
          receiveInputRef={receiveRef}
          canHold={canHold}
          hasItems={items.length > 0}
        />
      </div>
      <InvoiceReceiptModal
        isOpen={!!completedSale}
        sale={completedSale}
        outletName={outletName}
        printMode={printMode}
        onClose={() => {
          setCompletedSale(null);
          onSaleFinished();
        }}
      />
    </div>
  );
}
