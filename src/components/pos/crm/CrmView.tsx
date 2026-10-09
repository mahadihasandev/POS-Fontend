"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Phone,
  PhoneCall,
  Send,
  MessageCircle,
  Copy,
  Check,
  ExternalLink,
  Search,
  Plus,
  UserCheck,
  Clock,
  Sparkles,
  ArrowUpRight,
  Filter,
  ShieldCheck,
  Share2,
  Trash2,
  Calendar,
  Layers,
  MessageSquare,
} from "lucide-react";
import type { Customer } from "@/redux/api/posApi";
import toast from "react-hot-toast";

export interface CrmViewProps {
  customers: Customer[];
}

interface InteractionLog {
  id: string;
  customerName: string;
  phoneNumber: string;
  channel: "whatsapp" | "facebook" | "phone";
  type: string;
  notes: string;
  timestamp: string;
}

export function CrmView({ customers }: CrmViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<"directory" | "composer" | "activity">("directory");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDueOnly, setFilterDueOnly] = useState(false);

  // Quick Direct Contact bar state
  const [quickPhone, setQuickPhone] = useState("");
  const [fbPageUrl, setFbPageUrl] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("crm_fb_page_url") || "https://facebook.com";
    }
    return "https://facebook.com";
  });
  const [isEditingFb, setIsEditingFb] = useState(false);

  // Message Composer State
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customPhone, setCustomPhone] = useState("");
  const [customName, setCustomName] = useState("");
  const [composerMessage, setComposerMessage] = useState(
    "Hello! Thank you for contacting our store. How can we assist you today?"
  );
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Activity Logs persisted in localStorage
  const [logs, setLogs] = useState<InteractionLog[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("crm_interaction_logs");
        if (saved) return JSON.parse(saved);
      } catch {
        /* ignore */
      }
    }
    return [
      {
        id: "1",
        customerName: "RASHAL ELECTRIC (794944)",
        phoneNumber: "01812345001",
        channel: "phone",
        type: "Outgoing Call",
        notes: "Discussed pending balance of Tk. 12,500. Promised payment by next Monday.",
        timestamp: new Date(Date.now() - 3600000 * 2).toLocaleString(),
      },
      {
        id: "2",
        customerName: "Piplu Electric /Hardware",
        phoneNumber: "01812345002",
        channel: "whatsapp",
        type: "WhatsApp Chat",
        notes: "Sent invoice catalog and latest wholesale price list.",
        timestamp: new Date(Date.now() - 3600000 * 5).toLocaleString(),
      },
    ];
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("crm_interaction_logs", JSON.stringify(logs));
    }
  }, [logs]);

  const saveFbUrl = (url: string) => {
    setFbPageUrl(url);
    if (typeof window !== "undefined") {
      localStorage.setItem("crm_fb_page_url", url);
    }
    setIsEditingFb(false);
    toast.success("Facebook Business Page link saved.");
  };

  const logInteraction = (
    customerName: string,
    phoneNumber: string,
    channel: "whatsapp" | "facebook" | "phone",
    type: string,
    notes: string
  ) => {
    const newEntry: InteractionLog = {
      id: crypto.randomUUID(),
      customerName,
      phoneNumber,
      channel,
      type,
      notes,
      timestamp: new Date().toLocaleString(),
    };
    setLogs((prev) => [newEntry, ...prev]);
  };

  // Helper to format clean phone for WhatsApp
  const cleanPhoneForWa = (rawPhone: string) => {
    const digits = rawPhone.replace(/\D/g, "");
    if (digits.startsWith("0")) {
      return "880" + digits.slice(1);
    }
    if (digits.startsWith("880")) {
      return digits;
    }
    if (digits.length === 10) {
      return "880" + digits;
    }
    return digits;
  };

  // Channel Launchers
  const handleLaunchWhatsApp = (phoneNum: string, name: string, prefillMsg?: string) => {
    const targetPhone = cleanPhoneForWa(phoneNum);
    if (!targetPhone) {
      toast.error("Please enter a valid phone number.");
      return;
    }
    const text = prefillMsg || `Hello ${name}, thank you for contacting our store!`;
    const waUrl = `https://wa.me/${targetPhone}?text=${encodeURIComponent(text)}`;
    window.open(waUrl, "_blank", "noopener,noreferrer");
    logInteraction(name, phoneNum, "whatsapp", "WhatsApp Chat Started", "Opened direct chat link");
    toast.success(`Opening WhatsApp for ${name}...`);
  };

  const handleLaunchFacebook = (customerName?: string) => {
    let url = fbPageUrl;
    if (customerName) {
      url = `https://www.facebook.com/search/top?q=${encodeURIComponent(customerName)}`;
    }
    window.open(url, "_blank", "noopener,noreferrer");
    logInteraction(customerName || "Facebook Lead", "N/A", "facebook", "Facebook Link", "Opened Facebook profile/page");
    toast.success("Opening Facebook...");
  };

  const handleDirectCall = (phoneNum: string, name: string) => {
    if (!phoneNum) {
      toast.error("No phone number available.");
      return;
    }
    logInteraction(name, phoneNum, "phone", "Direct Call", "Initiated voice call");
    window.location.href = `tel:${phoneNum}`;
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Phone number copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Preset Message Templates
  const templates = [
    {
      title: "Due Payment Reminder",
      icon: "💳",
      getMessage: (c?: Customer | null) =>
        `Dear ${c?.name || "Customer"}, this is a gentle reminder from our store regarding your outstanding balance of Tk. ${Number(c?.previous_due || 0).toLocaleString()}. Please settle at your earliest convenience. Thank you!`,
    },
    {
      title: "New Arrivals & Wholesale Discount",
      icon: "🎉",
      getMessage: (c?: Customer | null) =>
        `Hello ${c?.name || "Valued Customer"}! New high-demand inventory has just arrived at our warehouse with special seasonal prices. Visit us today or reply to place your order!`,
    },
    {
      title: "Order & Payment Confirmation",
      icon: "✅",
      getMessage: (c?: Customer | null) =>
        `Dear ${c?.name || "Customer"}, we have successfully processed your order. Thank you for your continued business with Smart Account POS!`,
    },
    {
      title: "Customer Support Follow-up",
      icon: "🤝",
      getMessage: (c?: Customer | null) =>
        `Hi ${c?.name || "there"}, following up from our team to see how your recent purchase is performing. Let us know if you need any additional items or support!`,
    },
  ];

  // Filtered customer list
  const filteredCustomers = useMemo(() => {
    return (customers || []).filter((c) => {
      if (!c) return false;
      const nameStr = c.name || "";
      const phoneStr = c.phone || "";
      const codeStr = c.code || "";
      const areaStr = c.area || "";
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        nameStr.toLowerCase().includes(term) ||
        phoneStr.toLowerCase().includes(term) ||
        codeStr.toLowerCase().includes(term) ||
        areaStr.toLowerCase().includes(term);
      if (filterDueOnly) {
        return matchesSearch && Number(c.previous_due || 0) > 0;
      }
      return matchesSearch;
    });
  }, [customers, searchTerm, filterDueOnly]);

  return (
    <div className="space-y-6">
      {/* Top Banner / Channel Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* WhatsApp Card */}
        <div className="panel relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-emerald-50/30 border border-emerald-200/80 p-5 shadow-sm hover:shadow-md transition">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="size-11 rounded-2xl bg-[#25D366] text-white flex items-center justify-center shadow-sm shadow-emerald-500/20">
                <MessageCircle size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 text-sm">WhatsApp Business</h3>
                <p className="text-xs text-slate-500">1-Click Chat & Invoices</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-100 text-emerald-800">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Connected
            </span>
          </div>

          <div className="mt-4 flex gap-2">
            <input
              type="text"
              placeholder="e.g. 01700000000"
              value={quickPhone}
              onChange={(e) => setQuickPhone(e.target.value)}
              className="pos-field !h-9 text-xs flex-1"
            />
            <button
              onClick={() => handleLaunchWhatsApp(quickPhone, "Quick Lead")}
              disabled={!quickPhone.trim()}
              className="px-3 py-1.5 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
            >
              <Send size={13} />
              Chat
            </button>
          </div>
        </div>

        {/* Facebook Messenger Card */}
        <div className="panel relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-blue-50/30 border border-blue-200/80 p-5 shadow-sm hover:shadow-md transition">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="size-11 rounded-2xl bg-[#1877F2] text-white flex items-center justify-center shadow-sm shadow-blue-500/20">
                <svg className="size-6 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 text-sm">Facebook Page / Chat</h3>
                <p className="text-xs text-slate-500">Social Leads & Inquiries</p>
              </div>
            </div>
            <button
              onClick={() => setIsEditingFb(!isEditingFb)}
              className="text-[11px] font-medium text-blue-600 hover:text-blue-700 underline"
            >
              {isEditingFb ? "Cancel" : "Configure"}
            </button>
          </div>

          <div className="mt-4">
            {isEditingFb ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="https://facebook.com/your-page"
                  defaultValue={fbPageUrl}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveFbUrl((e.target as HTMLInputElement).value);
                  }}
                  className="pos-field !h-9 text-xs flex-1"
                />
                <button
                  onClick={(e) => {
                    const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                    saveFbUrl(input.value);
                  }}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold"
                >
                  Save
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleLaunchFacebook()}
                className="w-full py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center justify-center gap-2 transition"
              >
                <span>Open Facebook Page</span>
                <ArrowUpRight size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Direct Phone Call Card */}
        <div className="panel relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-indigo-50/30 border border-indigo-200/80 p-5 shadow-sm hover:shadow-md transition">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="size-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-sm shadow-indigo-500/20">
                <PhoneCall size={22} />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 text-sm">Phone & Voice Calls</h3>
                <p className="text-xs text-slate-500">Direct Customer Hotline</p>
              </div>
            </div>
            <span className="text-[11px] font-medium text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-md">
              Instant Dialer
            </span>
          </div>

          <div className="mt-4 flex gap-2">
            <input
              type="tel"
              placeholder="Enter phone number..."
              value={customPhone}
              onChange={(e) => setCustomPhone(e.target.value)}
              className="pos-field !h-9 text-xs flex-1"
            />
            <button
              onClick={() => handleDirectCall(customPhone, customName || "Direct Call")}
              disabled={!customPhone.trim()}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
            >
              <Phone size={13} />
              Call
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-200 gap-3 pb-3">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveSubTab("directory")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
              activeSubTab === "directory"
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            👥 Customer & Lead Directory ({customers.length})
          </button>
          <button
            onClick={() => setActiveSubTab("composer")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
              activeSubTab === "composer"
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            ✨ Quick Message Composer
          </button>
          <button
            onClick={() => setActiveSubTab("activity")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
              activeSubTab === "activity"
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            📋 Call & Outreach Log ({logs.length})
          </button>
        </div>

        {activeSubTab === "directory" && (
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs text-slate-700 font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={filterDueOnly}
                onChange={(e) => setFilterDueOnly(e.target.checked)}
                className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
              />
              Show Due Balance Only
            </label>
            <div className="relative w-56">
              <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pos-field !h-8 pl-8 text-xs w-full"
              />
            </div>
          </div>
        )}
      </div>

      {/* TAB 1: Customer Contact Directory */}
      {activeSubTab === "directory" && (
        <div className="panel overflow-hidden border border-slate-200 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3">Customer / Business</th>
                  <th className="px-5 py-3">Phone Number</th>
                  <th className="px-5 py-3">Area / Location</th>
                  <th className="px-5 py-3 text-right">Outstanding Due</th>
                  <th className="px-5 py-3 text-center">Quick Channel Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      No matching customer records found.
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((cust, idx) => {
                    const due = Number(cust?.previous_due || 0);
                    const custPhone = cust?.phone || "";
                    const custName = cust?.name || "Customer";
                    const custCode = cust?.code || (cust?.id ? `ID-${cust.id}` : `CUST-${idx + 1}`);
                    const rowKey = cust?.id ? `cust-${cust.id}` : `cust-idx-${idx}`;
                    return (
                      <tr key={rowKey} className="hover:bg-slate-50/80 transition">
                        <td className="px-5 py-3.5">
                          <div className="font-semibold text-slate-900">{custName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{custCode}</div>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-slate-800">{custPhone || "—"}</span>
                            {custPhone && (
                              <button
                                onClick={() => copyToClipboard(custPhone, `phone-${cust.id}`)}
                                className="text-slate-400 hover:text-slate-600 transition"
                                title="Copy Phone Number"
                              >
                                {copiedId === `phone-${cust.id}` ? (
                                  <Check size={12} className="text-emerald-600" />
                                ) : (
                                  <Copy size={12} />
                                )}
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-slate-600">
                          {cust.area || "—"}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <span
                            className={`font-semibold ${
                              due > 0 ? "text-rose-600" : "text-emerald-600"
                            }`}
                          >
                            Tk. {due.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center justify-center gap-2">
                            {/* WhatsApp Button */}
                            <button
                              onClick={() => {
                                const msg =
                                  due > 0
                                    ? `Dear ${cust.name}, this is Smart Account POS. Gentle reminder regarding your outstanding balance of Tk. ${due.toLocaleString()}. Thank you!`
                                    : `Hello ${cust.name}, hope you are doing well!`;
                                handleLaunchWhatsApp(custPhone, cust.name, msg);
                              }}
                              title="Open WhatsApp Chat"
                              className="size-8 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white border border-emerald-200 transition flex items-center justify-center shadow-xs"
                            >
                              <MessageCircle size={15} />
                            </button>

                            {/* Facebook Button */}
                            <button
                              onClick={() => handleLaunchFacebook(cust.name)}
                              title="Search / Message on Facebook"
                              className="size-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white border border-blue-200 transition flex items-center justify-center shadow-xs"
                            >
                              <svg className="size-3.5 fill-current" viewBox="0 0 24 24">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                              </svg>
                            </button>

                            {/* Phone Call Button */}
                            <button
                              onClick={() => handleDirectCall(custPhone, cust.name)}
                              title="Call Phone Number"
                              className="size-8 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white border border-indigo-200 transition flex items-center justify-center shadow-xs"
                            >
                              <Phone size={14} />
                            </button>

                            {/* Compose Pre-loaded Message */}
                            <button
                              onClick={() => {
                                setSelectedCustomer(cust);
                                setCustomName(cust.name);
                                setCustomPhone(custPhone);
                                setActiveSubTab("composer");
                              }}
                              title="Open in Message Composer"
                              className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 text-[11px] font-semibold transition"
                            >
                              Compose
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Quick Message Composer */}
      {activeSubTab === "composer" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Templates Column */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Select Preset Template
            </h4>
            <div className="space-y-2">
              {templates.map((tpl, i) => (
                <button
                  key={i}
                  onClick={() => setComposerMessage(tpl.getMessage(selectedCustomer))}
                  className="w-full text-left p-3.5 rounded-xl border border-slate-200 bg-white hover:border-teal-500 hover:shadow-xs transition group"
                >
                  <div className="flex items-center gap-2 font-semibold text-slate-800 text-xs">
                    <span>{tpl.icon}</span>
                    <span className="group-hover:text-teal-700">{tpl.title}</span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500 line-clamp-2">
                    {tpl.getMessage(selectedCustomer)}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Composer Form Column */}
          <div className="lg:col-span-2 panel p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                <Sparkles size={16} className="text-teal-600" />
                Message Dispatch Center
              </h3>
              {selectedCustomer && (
                <span className="text-xs text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full font-medium border border-teal-200">
                  Target: {selectedCustomer.name}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="pos-label">Recipient Customer</label>
                <select
                  value={selectedCustomer?.id || ""}
                  onChange={(e) => {
                    const found = customers.find((c) => String(c.id) === e.target.value);
                    setSelectedCustomer(found || null);
                    if (found) {
                      setCustomName(found.name);
                      setCustomPhone(found.phone || "");
                    }
                  }}
                  className="pos-field text-xs w-full"
                >
                  <option value="">-- Choose from existing customers --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="pos-label">Phone Number (with Country/Local Code)</label>
                <input
                  type="text"
                  placeholder="e.g. 01812345000"
                  value={customPhone}
                  onChange={(e) => setCustomPhone(e.target.value)}
                  className="pos-field text-xs w-full"
                />
              </div>
            </div>

            <div>
              <label className="pos-label">Message Content</label>
              <textarea
                rows={5}
                value={composerMessage}
                onChange={(e) => setComposerMessage(e.target.value)}
                placeholder="Type your WhatsApp, SMS, or Messenger text here..."
                className="pos-field !h-auto p-3 text-xs w-full font-sans"
              />
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(composerMessage);
                  toast.success("Message text copied!");
                }}
                className="pos-button-secondary text-xs flex items-center gap-1.5"
              >
                <Copy size={13} />
                Copy Message Text
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    handleLaunchWhatsApp(
                      customPhone || selectedCustomer?.phone || "",
                      customName || selectedCustomer?.name || "Customer",
                      composerMessage
                    )
                  }
                  className="px-4 py-2 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs transition"
                >
                  <MessageCircle size={15} />
                  Send via WhatsApp
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleDirectCall(
                      customPhone || selectedCustomer?.phone || "",
                      customName || selectedCustomer?.name || "Customer"
                    )
                  }
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs transition"
                >
                  <Phone size={15} />
                  Call Customer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Activity & Communication Log */}
      {activeSubTab === "activity" && (
        <div className="panel overflow-hidden border border-slate-200 shadow-sm">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-900 text-xs uppercase tracking-wider">
                Logged Customer Communications
              </h3>
              <p className="text-[11px] text-slate-500">
                Track phone calls, WhatsApp chats, and social discussions across your store
              </p>
            </div>
            {logs.length > 0 && (
              <button
                onClick={() => {
                  if (confirm("Clear communication logs?")) {
                    setLogs([]);
                  }
                }}
                className="text-xs text-rose-600 hover:text-rose-700 flex items-center gap-1 font-medium"
              >
                <Trash2 size={13} />
                Clear History
              </button>
            )}
          </div>

          <div className="divide-y divide-slate-100">
            {logs.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                No recent activity logged yet. When you initiate calls or WhatsApp messages, they will appear here.
              </div>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="p-4 hover:bg-slate-50 transition flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={`size-9 rounded-xl flex items-center justify-center text-white shrink-0 ${
                        log.channel === "whatsapp"
                          ? "bg-[#25D366]"
                          : log.channel === "facebook"
                            ? "bg-[#1877F2]"
                            : "bg-indigo-600"
                      }`}
                    >
                      {log.channel === "whatsapp" && <MessageCircle size={18} />}
                      {log.channel === "facebook" && (
                        <svg className="size-4 fill-current" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                      )}
                      {log.channel === "phone" && <Phone size={17} />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 text-xs">{log.customerName}</span>
                        <span className="text-[10px] text-slate-500 font-mono">({log.phoneNumber})</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-md font-medium bg-slate-100 text-slate-600">
                          {log.type}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-600">{log.notes}</p>
                    </div>
                  </div>

                  <span className="text-[11px] text-slate-400 flex items-center gap-1 shrink-0">
                    <Clock size={12} />
                    {log.timestamp}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
