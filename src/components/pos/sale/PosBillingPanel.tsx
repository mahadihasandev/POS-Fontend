"use client";

import React from "react";
import {
  FileCheck,
  PauseCircle,
  MessageSquare,
  Mail,
  List as ListIcon,
} from "lucide-react";
import { FinancialAccount } from "@/redux/api/posApi";

export interface PosBillingPanelProps {
  invoiceTotal: number;
  discount: number;
  onChangeDiscount: (val: number) => void;
  specialDiscount: number;
  onChangeSpecialDiscount: (val: number) => void;
  deliveryCharge: number;
  onChangeDeliveryCharge: (val: number) => void;
  deliveryPayer: "company" | "customer";
  onChangeDeliveryPayer: (val: "company" | "customer") => void;
  previousDue: number;
  advancedAmount: number;
  totalPayable: number;
  paymentAccount: string;
  onChangePaymentAccount: (val: string) => void;
  accounts: FinancialAccount[];
  receivedAmount: number;
  onChangeReceivedAmount: (val: number) => void;
  changeReturn: number;
  dueAmount: number;
  printMode: "pos" | "normal";
  onChangePrintMode: (mode: "pos" | "normal") => void;
  sendSms: boolean;
  onToggleSendSms: (val: boolean) => void;
  emailInvoice: boolean;
  onToggleEmailInvoice: (val: boolean) => void;
  onSaveSale: () => void;
  onHoldSale: () => void;
  onNavigateToList: () => void;
  isSaving: boolean;
  receiveInputRef?: React.RefObject<HTMLInputElement | null>;
}

export function PosBillingPanel({
  invoiceTotal,
  discount,
  onChangeDiscount,
  specialDiscount,
  onChangeSpecialDiscount,
  deliveryCharge,
  onChangeDeliveryCharge,
  deliveryPayer,
  onChangeDeliveryPayer,
  previousDue,
  advancedAmount,
  totalPayable,
  paymentAccount,
  onChangePaymentAccount,
  accounts,
  receivedAmount,
  onChangeReceivedAmount,
  changeReturn,
  dueAmount,
  printMode,
  onChangePrintMode,
  sendSms,
  onToggleSendSms,
  emailInvoice,
  onToggleEmailInvoice,
  onSaveSale,
  onHoldSale,
  onNavigateToList,
  isSaving,
  receiveInputRef,
}: PosBillingPanelProps) {
  return (
    <div className="w-full lg:w-80 bg-white border border-slate-200 rounded-xl p-3.5 space-y-3 shadow-md select-none">
      {/* Financials Grid */}
      <div className="space-y-1.5 text-xs text-slate-800">
        {/* Invoice Total */}
        <div className="flex items-center justify-between pb-1 border-b border-slate-100">
          <span className="text-slate-800 font-bold">Invoice Total</span>
          <span className="font-mono font-extrabold text-slate-900 text-sm">
            {invoiceTotal.toFixed(2)}
          </span>
        </div>

        {/* Discount & Special Discount */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <div>
            <label className="text-[11px] text-slate-700 font-bold block mb-0.5">Discount</label>
            <input
              type="number"
              min={0}
              value={discount || ""}
              onChange={(e) => onChangeDiscount(parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              className="w-full h-7 px-2 text-right font-mono font-bold bg-white border border-slate-300 text-slate-900 rounded text-xs focus:outline-none focus:border-teal-600"
            />
          </div>
          <div>
            <label className="text-[11px] text-slate-700 font-bold block mb-0.5">Special Disc</label>
            <input
              type="number"
              min={0}
              value={specialDiscount || ""}
              onChange={(e) => onChangeSpecialDiscount(parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              className="w-full h-7 px-2 text-right font-mono font-bold bg-white border border-slate-300 text-slate-900 rounded text-xs focus:outline-none focus:border-teal-600"
            />
          </div>
        </div>

        {/* Delivery Charge & Delivery Payer */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <div>
            <label className="text-[11px] text-slate-700 font-bold block mb-0.5">Delivery Charge</label>
            <input
              type="number"
              min={0}
              value={deliveryCharge || ""}
              onChange={(e) => onChangeDeliveryCharge(parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              className="w-full h-7 px-2 text-right font-mono font-bold bg-white border border-slate-300 text-slate-900 rounded text-xs focus:outline-none focus:border-teal-600"
            />
          </div>
          <div>
            <label className="text-[11px] text-slate-700 font-bold block mb-0.5">Delivery Payer</label>
            <select
              value={deliveryPayer}
              onChange={(e) => onChangeDeliveryPayer(e.target.value as "company" | "customer")}
              className="w-full h-7 px-1 bg-white border border-slate-300 text-slate-900 font-semibold rounded text-[11px] focus:outline-none focus:border-teal-600"
            >
              <option value="company">Company Pay</option>
              <option value="customer">Customer Pay</option>
            </select>
          </div>
        </div>

        {/* Previous Due & Advanced */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-100">
          <span className="text-slate-700 text-[11px] font-semibold">Previous Due:</span>
          <span className="font-mono text-rose-600 font-bold text-xs">
            {previousDue.toFixed(2)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-700 text-[11px] font-semibold">Advanced Amount:</span>
          <span className="font-mono text-emerald-700 font-bold text-xs">
            {advancedAmount.toFixed(2)}
          </span>
        </div>

        {/* Total Payable Banner */}
        <div className="p-2.5 rounded-lg bg-slate-900 text-white flex items-center justify-between shadow-xs">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-200">
            Total Payable
          </span>
          <span className="text-lg font-mono font-extrabold text-violet-300">
            {totalPayable.toFixed(2)}{" "}
            <span className="text-[10px] text-white">TK</span>
          </span>
        </div>

        {/* Account Selector */}
        <div className="pt-1">
          <label className="text-[11px] text-slate-700 font-bold block mb-1">
            Payment Account
          </label>
          <select
            value={paymentAccount}
            onChange={(e) => onChangePaymentAccount(e.target.value)}
            className="w-full h-8 px-2 bg-white border border-slate-300 text-slate-900 rounded-lg text-xs font-semibold focus:outline-none focus:border-teal-600"
          >
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.name}>
                {acc.name} ({acc.account_type.toUpperCase()})
              </option>
            ))}
          </select>
        </div>

        {/* Receive Amount [F8] Highlight Box */}
        <div className="p-2 rounded-lg bg-violet-50 border-2 border-violet-300">
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-extrabold text-violet-900 flex items-center gap-1">
              <span>Receive</span>
              <span className="font-mono bg-violet-300 text-slate-950 px-1 rounded text-[10px] font-bold">
                [F8]
              </span>
            </label>
            <span className="text-[10px] font-bold text-violet-800">Cash Received</span>
          </div>
          <input
            ref={receiveInputRef}
            type="number"
            step="0.01"
            value={receivedAmount || ""}
            onChange={(e) => onChangeReceivedAmount(parseFloat(e.target.value) || 0)}
            placeholder="0.00"
            className="w-full h-9 px-3 text-right font-mono font-extrabold text-lg text-slate-950 bg-white border border-violet-300 rounded focus:outline-none focus:border-violet-500 shadow-xs"
          />
        </div>

        {/* Change Return (Bright Emerald Display) */}
        <div className="p-2.5 rounded-lg bg-emerald-50 border-2 border-emerald-400 flex items-center justify-between">
          <div>
            <span className="text-xs font-extrabold text-emerald-900 block">
              Change Return
            </span>
            <span className="text-[10px] text-emerald-700 font-semibold">
              {dueAmount > 0 ? `Remaining Due: ${dueAmount.toFixed(2)}` : "Fully Settled"}
            </span>
          </div>
          <span className="font-mono font-extrabold text-xl text-emerald-700">
            {changeReturn.toFixed(2)}
          </span>
        </div>

        {/* Print & Notification Toggles */}
        <div className="pt-2 border-t border-slate-200 space-y-2">
          {/* Print Mode Radio */}
          <div className="flex items-center justify-around bg-slate-100 p-1.5 rounded-lg border border-slate-200 text-xs">
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-800 font-semibold hover:text-slate-950">
              <input
                type="radio"
                name="printMode"
                checked={printMode === "pos"}
                onChange={() => onChangePrintMode("pos")}
                className="accent-teal-700"
              />
              <span>POS Print</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-800 font-semibold hover:text-slate-950">
              <input
                type="radio"
                name="printMode"
                checked={printMode === "normal"}
                onChange={() => onChangePrintMode("normal")}
                className="accent-teal-700"
              />
              <span>Normal Print</span>
            </label>
          </div>

          {/* SMS / Email Checkboxes */}
          <div className="flex items-center justify-between text-xs text-slate-700 font-semibold px-1">
            <label className="flex items-center gap-1.5 cursor-pointer hover:text-slate-950">
              <input
                type="checkbox"
                checked={sendSms}
                onChange={(e) => onToggleSendSms(e.target.checked)}
                className="accent-emerald-600"
              />
              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
              <span>Send SMS</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer hover:text-slate-950">
              <input
                type="checkbox"
                checked={emailInvoice}
                onChange={(e) => onToggleEmailInvoice(e.target.checked)}
                className="accent-indigo-600"
              />
              <Mail className="w-3.5 h-3.5 text-indigo-600" />
              <span>Email Invoice</span>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            {/* Save (F10) Primary Button */}
            <button
              type="button"
              disabled={isSaving || invoiceTotal <= 0}
              onClick={onSaveSale}
              className="w-full py-2.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-40 disabled:cursor-not-allowed text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-sm transition cursor-pointer"
            >
              <FileCheck className="w-4 h-4" />
              <span>Save (F10)</span>
            </button>

            {/* List Button */}
            <button
              type="button"
              onClick={onNavigateToList}
              className="w-full py-2.5 px-3 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition cursor-pointer"
            >
              <ListIcon className="w-4 h-4" />
              <span>Sales List</span>
            </button>
          </div>

          {/* Hold Sale Button */}
          <button
            type="button"
            disabled={invoiceTotal <= 0}
            onClick={onHoldSale}
            className="w-full py-2 px-3 rounded-lg bg-violet-300 hover:bg-violet-400 active:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-sm transition cursor-pointer"
          >
            <PauseCircle className="w-4 h-4 text-slate-950" />
            <span>Hold Sale</span>
          </button>
        </div>
      </div>
    </div>
  );
}
