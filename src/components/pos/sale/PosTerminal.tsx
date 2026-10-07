"use client";

import React, { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import {
  Customer,
  Supplier,
  Marketer,
  Product,
  FinancialAccount,
  CartItem,
  SaleRecord,
  useCreateSaleMutation,
  useGetHeldSalesQuery,
  useResumeSaleMutation,
} from "@/redux/api/posApi";
import { PosHeaderBanner } from "./PosHeaderBanner";
import { PosCustomerRow } from "./PosCustomerRow";
import { PosBarcodeScanner } from "./PosBarcodeScanner";
import { PosProductRow } from "./PosProductRow";
import { PosCartTable } from "./PosCartTable";
import { PosBillingPanel } from "./PosBillingPanel";
import { HoldListModal } from "./HoldListModal";
import { InvoiceReceiptModal } from "./InvoiceReceiptModal";
import { sounds } from "@/lib/sound";

export interface PosTerminalProps {
  saleType: "normal" | "supplier_wise";
  customers: Customer[];
  suppliers: Supplier[];
  marketers: Marketer[];
  products: Product[];
  accounts: FinancialAccount[];
  outletName: string;
  onNavigateToList: () => void;
}

export function PosTerminal({
  saleType,
  customers,
  suppliers,
  marketers,
  products,
  accounts,
  outletName,
  onNavigateToList,
}: PosTerminalProps) {
  // Input references for keyboard shortcuts [F1], [F2], [F3], [F8]
  const customerInputRef = useRef<HTMLSelectElement>(null);
  const barcodeInputRef = useRef<HTMLInputElement>(null);
  const productInputRef = useRef<HTMLSelectElement>(null);
  const receiveInputRef = useRef<HTMLInputElement>(null);

  // Header State
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [selectedSupplierId, setSelectedSupplierId] = useState<number | null>(null);
  const [selectedMarketerId, setSelectedMarketerId] = useState<number | null>(null);
  const [saleDate, setSaleDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [note, setNote] = useState<string>("");

  // Cart Items
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Billing State
  const [discount, setDiscount] = useState<number>(0);
  const [specialDiscount, setSpecialDiscount] = useState<number>(0);
  const [deliveryCharge, setDeliveryCharge] = useState<number>(0);
  const [deliveryPayer, setDeliveryPayer] = useState<"company" | "customer">("company");
  const [paymentAccount, setPaymentAccount] = useState<string>("Cash");
  const [receivedAmount, setReceivedAmount] = useState<number>(0);

  // Printing & Notification
  const [printMode, setPrintMode] = useState<"pos" | "normal">("pos");
  const [sendSms, setSendSms] = useState<boolean>(true);
  const [emailInvoice, setEmailInvoice] = useState<boolean>(false);

  // Modal States
  const [isHoldModalOpen, setIsHoldModalOpen] = useState<boolean>(false);
  const [completedSale, setCompletedSale] = useState<SaleRecord | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // RTK Query Mutations
  const [createSale, { isLoading: isSaving }] = useCreateSaleMutation();
  const { data: heldSalesData, refetch: refetchHeld } = useGetHeldSalesQuery();
  const [resumeSale] = useResumeSaleMutation();

  const heldSales = heldSalesData?.data || [];

  // Customer Financials
  const currentCustomer = customers.find((c) => c.id === selectedCustomerId);
  const previousDue = currentCustomer ? Number(currentCustomer.previous_due) : 0;
  const advancedAmount = currentCustomer ? Number(currentCustomer.advanced_amount) : 0;

  // Real-Time Math Calculations
  const invoiceTotal = cartItems.reduce((acc, it) => acc + it.subtotal, 0);
  const deliveryToAdd = deliveryPayer === "customer" ? deliveryCharge : 0;
  const grossPayable = invoiceTotal - discount - specialDiscount + deliveryToAdd + previousDue - advancedAmount;
  const totalPayable = Math.max(0, grossPayable);
  const changeReturn = Math.max(0, receivedAmount - totalPayable);
  const dueAmount = Math.max(0, totalPayable - receivedAmount);

  // 1. Barcode Fast Add Handler
  const handleScanBarcode = (barcode: string): boolean => {
    const found = products.find(
      (p) =>
        p.barcode.toLowerCase() === barcode.toLowerCase() ||
        p.code.toLowerCase() === barcode.toLowerCase()
    );

    if (!found) {
      toast.error(`Barcode '${barcode}' not found in catalog.`);
      return false;
    }

    if (found.available_qty <= 0) {
      toast.error(`'${found.name}' is out of stock!`);
      return false;
    }

    setCartItems((prev) => {
      const existingIdx = prev.findIndex((it) => it.product.id === found.id);
      if (existingIdx >= 0) {
        const updated = [...prev];
        const item = updated[existingIdx];
        const newQty = item.quantity + 1;
        const subtotal = round(newQty * item.unit_price * (1 - item.discount_percent / 100));
        const profit = round(subtotal - Number(found.cost_price) * newQty);
        updated[existingIdx] = { ...item, quantity: newQty, subtotal, profit };
        return updated;
      }

      const unitPrice = Number(found.unit_price);
      const subtotal = unitPrice;
      const profit = round(unitPrice - Number(found.cost_price));
      return [
        ...prev,
        {
          product: found,
          quantity: 1,
          unit_price: unitPrice,
          discount_percent: 0,
          subtotal,
          profit,
        },
      ];
    });

    toast.success(`Added: ${found.name}`);
    return true;
  };

  // 2. Product Row Manual Add Handler
  const handleAddItem = (product: Product, quantity: number, price: number) => {
    setCartItems((prev) => {
      const existingIdx = prev.findIndex((it) => it.product.id === product.id);
      if (existingIdx >= 0) {
        const updated = [...prev];
        const item = updated[existingIdx];
        const newQty = item.quantity + quantity;
        const subtotal = round(newQty * price * (1 - item.discount_percent / 100));
        const profit = round(subtotal - Number(product.cost_price) * newQty);
        updated[existingIdx] = {
          ...item,
          quantity: newQty,
          unit_price: price,
          subtotal,
          profit,
        };
        return updated;
      }

      const subtotal = round(quantity * price);
      const profit = round(subtotal - Number(product.cost_price) * quantity);
      return [
        ...prev,
        {
          product,
          quantity,
          unit_price: price,
          discount_percent: 0,
          subtotal,
          profit,
        },
      ];
    });
  };

  // 3. Cart Updates
  const handleUpdateQty = (index: number, newQty: number) => {
    setCartItems((prev) => {
      const updated = [...prev];
      const item = updated[index];
      const subtotal = round(newQty * item.unit_price * (1 - item.discount_percent / 100));
      const profit = round(subtotal - Number(item.product.cost_price) * newQty);
      updated[index] = { ...item, quantity: newQty, subtotal, profit };
      return updated;
    });
  };

  const handleUpdateDiscount = (index: number, discountPercent: number) => {
    setCartItems((prev) => {
      const updated = [...prev];
      const item = updated[index];
      const subtotal = round(item.quantity * item.unit_price * (1 - discountPercent / 100));
      const profit = round(subtotal - Number(item.product.cost_price) * item.quantity);
      updated[index] = {
        ...item,
        discount_percent: discountPercent,
        subtotal,
        profit,
      };
      return updated;
    });
  };

  const handleRemoveItem = (index: number) => {
    setCartItems((prev) => prev.filter((_, i) => i !== index));
  };

  // 4. Reset Active Sale Form
  const resetSale = () => {
    setCartItems([]);
    setSelectedCustomerId(null);
    setSelectedSupplierId(null);
    setSelectedMarketerId(null);
    setNote("");
    setDiscount(0);
    setSpecialDiscount(0);
    setDeliveryCharge(0);
    setReceivedAmount(0);
  };

  // 5. Save Sale (F10)
  const handleSaveSale = async () => {
    if (cartItems.length === 0) {
      toast.error("Cart is empty. Add products before completing sale.");
      return;
    }

    try {
      const payload = {
        outlet_id: 1,
        customer_id: selectedCustomerId,
        supplier_id: selectedSupplierId,
        marketer_id: selectedMarketerId,
        sale_date: saleDate,
        sale_type: saleType,
        note,
        discount,
        special_discount: specialDiscount,
        delivery_charge: deliveryCharge,
        delivery_payer: deliveryPayer,
        payment_account: paymentAccount,
        paid_amount: receivedAmount,
        is_hold: false,
        items: cartItems.map((it) => ({
          product_id: it.product.id,
          quantity: it.quantity,
          unit_price: it.unit_price,
          discount_percent: it.discount_percent,
        })),
      };

      const res = await createSale(payload).unwrap();
      sounds.playSuccessChime();
      toast.success(res.message || "Sale finalized successfully!");
      setCompletedSale(res.data);
      resetSale();
    } catch (err: unknown) {
      const msg = (err as { data?: { message?: string } })?.data?.message || "Failed to finalize sale.";
      toast.error(msg);
      sounds.playErrorBeep();
    }
  };

  // 6. Hold Sale
  const handleHoldSale = async () => {
    if (cartItems.length === 0) {
      toast.error("Cart is empty.");
      return;
    }

    try {
      const payload = {
        outlet_id: 1,
        customer_id: selectedCustomerId,
        supplier_id: selectedSupplierId,
        marketer_id: selectedMarketerId,
        sale_date: saleDate,
        sale_type: saleType,
        note: note ? `[HELD] ${note}` : "[HELD SALE]",
        discount,
        special_discount: specialDiscount,
        delivery_charge: deliveryCharge,
        delivery_payer: deliveryPayer,
        payment_account: paymentAccount,
        paid_amount: 0,
        is_hold: true,
        items: cartItems.map((it) => ({
          product_id: it.product.id,
          quantity: it.quantity,
          unit_price: it.unit_price,
          discount_percent: it.discount_percent,
        })),
      };

      await createSale(payload).unwrap();
      toast.success("Order queued to Hold List!");
      refetchHeld();
      resetSale();
    } catch {
      toast.error("Failed to hold sale.");
    }
  };

  // 7. Resume Held Sale
  const handleResumeSale = async (sale: SaleRecord) => {
    try {
      await resumeSale(sale.id).unwrap();

      // Populate into current cart
      setSelectedCustomerId(sale.customer ? sale.customer.id : null);
      setSelectedSupplierId(sale.supplier ? sale.supplier.id : null);
      setDiscount(Number(sale.discount));
      setSpecialDiscount(Number(sale.special_discount));
      setDeliveryCharge(Number(sale.delivery_charge));

      if (sale.items && sale.items.length > 0) {
        const restored: CartItem[] = sale.items.map((it) => {
          const match = products.find((p) => p.id === it.id) || {
            id: it.id,
            name: it.product_name,
            code: it.product_code,
            barcode: "",
            available_qty: 100,
            unit_price: it.unit_price,
            cost_price: 0,
            unit: "pcs",
          };
          const price = Number(it.unit_price);
          const dis = Number(it.discount_percent);
          const sub = Number(it.subtotal);
          return {
            product: match,
            quantity: it.quantity,
            unit_price: price,
            discount_percent: dis,
            subtotal: sub,
            profit: 0,
          };
        });
        setCartItems(restored);
      }

      setIsHoldModalOpen(false);
      refetchHeld();
      toast.success(`Resumed ${sale.invoice_id} to active cart!`);
    } catch {
      toast.error("Failed to resume held sale.");
    }
  };

  // Keyboard Shortcuts Hook ([F1], [F2], [F3], [F8], [F10])
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F1") {
        e.preventDefault();
        customerInputRef.current?.focus();
      } else if (e.key === "F2") {
        e.preventDefault();
        barcodeInputRef.current?.focus();
      } else if (e.key === "F3") {
        e.preventDefault();
        productInputRef.current?.focus();
      } else if (e.key === "F8") {
        e.preventDefault();
        receiveInputRef.current?.focus();
      } else if (e.key === "F10") {
        e.preventDefault();
        handleSaveSale();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  const bannerTitle =
    saleType === "supplier_wise" ? "+ Supplier Wise Sale" : "+ Add New Sale";

  return (
    <div
      className={`space-y-4 animate-in fade-in duration-200 ${
        isFullscreen ? "fixed inset-0 z-50 bg-slate-100 p-4 overflow-y-auto" : ""
      }`}
    >
      {/* 2-Column POS Layout */}
      <div className="flex flex-col lg:flex-row items-start gap-4">
        {/* Left Column: POS Header, Customer Row, Barcode, Product Entry, Cart Table */}
        <div className="w-full lg:flex-1 shadow-2xl rounded-xl">
          {/* Header Banner */}
          <PosHeaderBanner
            title={bannerTitle}
            heldCount={heldSales.length}
            onOpenHoldList={() => setIsHoldModalOpen(true)}
            isFullscreen={isFullscreen}
            onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
          />

          {/* Customer & Supplier Filter Row */}
          <PosCustomerRow
            customers={customers}
            suppliers={suppliers}
            marketers={marketers}
            selectedCustomerId={selectedCustomerId}
            onSelectCustomer={setSelectedCustomerId}
            selectedSupplierId={selectedSupplierId}
            onSelectSupplier={setSelectedSupplierId}
            selectedMarketerId={selectedMarketerId}
            onSelectMarketer={setSelectedMarketerId}
            saleDate={saleDate}
            onChangeSaleDate={setSaleDate}
            note={note}
            onChangeNote={setNote}
            customerInputRef={customerInputRef}
          />

          {/* Rapid Barcode Scanner Input */}
          <PosBarcodeScanner
            onScanBarcode={handleScanBarcode}
            inputRef={barcodeInputRef}
          />

          {/* Product Quick-Add Line */}
          <PosProductRow
            products={products}
            onAddItem={handleAddItem}
            productInputRef={productInputRef}
          />

          {/* Cart Table with Quantity Steppers */}
          <PosCartTable
            items={cartItems}
            onUpdateQty={handleUpdateQty}
            onUpdateDiscount={handleUpdateDiscount}
            onRemoveItem={handleRemoveItem}
          />
        </div>

        {/* Right Column: Billing & Financial Settlement Panel */}
        <PosBillingPanel
          invoiceTotal={invoiceTotal}
          discount={discount}
          onChangeDiscount={setDiscount}
          specialDiscount={specialDiscount}
          onChangeSpecialDiscount={setSpecialDiscount}
          deliveryCharge={deliveryCharge}
          onChangeDeliveryCharge={setDeliveryCharge}
          deliveryPayer={deliveryPayer}
          onChangeDeliveryPayer={setDeliveryPayer}
          previousDue={previousDue}
          advancedAmount={advancedAmount}
          totalPayable={totalPayable}
          paymentAccount={paymentAccount}
          onChangePaymentAccount={setPaymentAccount}
          accounts={accounts}
          receivedAmount={receivedAmount}
          onChangeReceivedAmount={setReceivedAmount}
          changeReturn={changeReturn}
          dueAmount={dueAmount}
          printMode={printMode}
          onChangePrintMode={setPrintMode}
          sendSms={sendSms}
          onToggleSendSms={setSendSms}
          emailInvoice={emailInvoice}
          onToggleEmailInvoice={setEmailInvoice}
          onSaveSale={handleSaveSale}
          onHoldSale={handleHoldSale}
          onNavigateToList={onNavigateToList}
          isSaving={isSaving}
          receiveInputRef={receiveInputRef}
        />
      </div>

      {/* Held Sales Queue Modal */}
      <HoldListModal
        isOpen={isHoldModalOpen}
        onClose={() => setIsHoldModalOpen(false)}
        heldSales={heldSales}
        onResumeSale={handleResumeSale}
        onDiscardSale={async (id) => {
          await resumeSale(id).unwrap();
          refetchHeld();
          toast.success("Held sale removed.");
        }}
      />

      {/* Printable Thermal Receipt Modal */}
      <InvoiceReceiptModal
        isOpen={!!completedSale}
        onClose={() => setCompletedSale(null)}
        sale={completedSale}
        outletName={outletName}
      />
    </div>
  );
}

function round(val: number): number {
  return Math.round(val * 100) / 100;
}
