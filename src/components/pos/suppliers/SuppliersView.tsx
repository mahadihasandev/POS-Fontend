"use client";
import { downloadCsv, errorMessage } from "@/lib/pos";

import React, { useState } from "react";
import { Building2, Search, Plus, Upload, Download } from "lucide-react";
import {
  Supplier,
  useCreateSupplierMutation,
  useImportSuppliersMutation,
} from "@/redux/api/posApi";
import toast from "react-hot-toast";

export interface SuppliersViewProps {
  suppliers: Supplier[];
  onNavigateToSupplierPayment?: () => void;
}

export function SuppliersView({
  suppliers,
  onNavigateToSupplierPayment,
}: SuppliersViewProps) {
  const [activeTab, setActiveTab] = useState<
    "manage" | "dues" | "add" | "upload"
  >("manage");
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importSuppliers, { isLoading: isImporting }] =
    useImportSuppliersMutation();
  const [searchTerm, setSearchTerm] = useState("");

  // Add Supplier form state
  const [name, setName] = useState("");
  const [code, setCode] = useState(
    () => `SUP-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
  );
  const [phone, setPhone] = useState("");

  const [createSupplier, { isLoading: isCreating }] =
    useCreateSupplierMutation();

  const handleAddSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please provide supplier name.");
      return;
    }

    try {
      await createSupplier({
        name,
        code,
        phone,
      }).unwrap();

      toast.success(`Supplier ${name} registered successfully!`);
      setName("");
      setPhone("");
      setCode(`SUP-${crypto.randomUUID().slice(0, 8).toUpperCase()}`);
      setActiveTab("manage");
    } catch (err: unknown) {
      toast.error(errorMessage(err, "Failed to create supplier."));
    }
  };

  const filtered = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.phone && s.phone.includes(searchTerm)),
  );

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="bg-white border border-slate-200 p-4 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-slate-900 tracking-tight">
              Suppliers Directory & Vendor Management
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Registered Vendor Partners:{" "}
              <strong>{suppliers.length} Companies</strong>
            </p>
          </div>
        </div>

        {/* Sub Navigation Tabs (Screenshots 11.01.16 AM - 11.01.27 AM) */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-bold overflow-x-auto max-w-full">
          <button
            type="button"
            onClick={() => setActiveTab("manage")}
            className={`px-3 py-1.5 rounded-md transition ${
              activeTab === "manage"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Manage Supplier
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("dues")}
            className={`px-3 py-1.5 rounded-md transition ${
              activeTab === "dues"
                ? "bg-white text-teal-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Supplier Due List
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("add")}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-md transition ${
              activeTab === "add"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-blue-800 hover:bg-blue-50"
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Supplier</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("upload")}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-md transition ${
              activeTab === "upload"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload CSV</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Manage Supplier */}
      {activeTab === "manage" && (
        <div className="space-y-3">
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by supplier name, code, contact..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3.5">#</th>
                    <th className="py-2.5 px-3.5">Supplier Name</th>
                    <th className="py-2.5 px-3.5">Vendor Code</th>
                    <th className="py-2.5 px-3.5">Phone Contact</th>
                    <th className="py-2.5 px-3.5 text-center">Status</th>
                    <th className="py-2.5 px-3.5 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((s, idx) => (
                    <tr key={s.id} className="hover:bg-slate-50 transition">
                      <td className="py-2.5 px-3.5 text-slate-400 font-semibold">
                        {idx + 1}
                      </td>
                      <td className="py-2.5 px-3.5 font-bold text-slate-900">
                        {s.name}
                      </td>
                      <td className="py-2.5 px-3.5 font-mono font-bold text-blue-700">
                        {s.code}
                      </td>
                      <td className="py-2.5 px-3.5 text-slate-700 font-mono">
                        {s.phone || "—"}
                      </td>
                      <td className="py-2.5 px-3.5 text-center">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-300">
                          Active Vendor
                        </span>
                      </td>
                      <td className="py-2.5 px-3.5 text-center">
                        <button
                          type="button"
                          onClick={onNavigateToSupplierPayment}
                          className="px-2.5 py-1 rounded-md bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-[11px] font-bold transition shadow-xs cursor-pointer"
                        >
                          Payment
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Supplier Due List (Screenshot 11.01.19 AM) */}
      {activeTab === "dues" && (
        <div className="space-y-3">
          <div className="bg-teal-50 border border-teal-200 p-3 rounded-xl flex justify-between items-center text-xs">
            <span className="font-bold text-teal-900">
              Vendors with Outstanding Balances
            </span>
            <span className="font-bold text-sm text-teal-800">
              Total Payable Dues: ৳6,940,202.30
            </span>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3.5">Supplier Name</th>
                  <th className="py-2.5 px-3.5">Code</th>
                  <th className="py-2.5 px-3.5">Contact</th>
                  <th className="py-2.5 px-3.5 text-right">Payable Due</th>
                  <th className="py-2.5 px-3.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {suppliers.map((s) => (
                  <tr key={s.id} className="hover:bg-teal-50/40">
                    <td className="py-2.5 px-3.5 font-bold text-slate-900">
                      {s.name}
                    </td>
                    <td className="py-2.5 px-3.5 font-mono text-slate-600">
                      {s.code}
                    </td>
                    <td className="py-2.5 px-3.5 font-mono text-slate-600">
                      {s.phone || "—"}
                    </td>
                    <td className="py-2.5 px-3.5 text-right font-bold text-rose-600 text-sm">
                      ৳{Number(s.previous_due || 0).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3.5 text-center">
                      <button
                        type="button"
                        onClick={onNavigateToSupplierPayment}
                        className="px-3 py-1 rounded-md bg-teal-600 hover:bg-teal-700 text-white text-[11px] font-bold transition shadow-xs cursor-pointer"
                      >
                        Pay Now
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Add Supplier Form (Screenshot 11.01.23 AM) */}
      {activeTab === "add" && (
        <form
          onSubmit={handleAddSupplier}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4 max-w-xl"
        >
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-2">
            Register New Supplier / Vendor
          </h2>

          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Supplier Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. SUPERSTAR Electronics Limited"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 font-medium focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Supplier Code
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 font-mono font-bold text-slate-700"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Phone Contact
              </label>
              <input
                type="text"
                placeholder="019XXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 font-mono"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("manage")}
              className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreating}
              className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition shadow-xs"
            >
              {isCreating ? "Saving..." : "Save Supplier"}
            </button>
          </div>
        </form>
      )}

      {/* Tab 4: Upload CSV (Screenshot 11.01.27 AM) */}
      {activeTab === "upload" && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs max-w-xl space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Bulk Supplier CSV Import
            </h2>
            <p className="text-xs text-slate-500">
              Upload vendor list in bulk via spreadsheet template
            </p>
          </div>

          <label className="block border-2 border-dashed border-slate-300 rounded-xl p-6 space-y-3">
            <Upload className="w-8 h-8 text-teal-600" />
            <span className="block text-xs text-slate-600">
              Select a CSV file (2 MB / 1,000 suppliers maximum). Codes must be
              unique; all rows are validated before saving.
            </span>
            <input
              type="file"
              aria-label="Supplier CSV file"
              accept=".csv"
              onChange={(e) => setImportFile(e.target.files?.[0] || null)}
              className="text-xs max-w-full"
            />
          </label>
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() =>
                downloadCsv("suppliers_template", [
                  {
                    name: "Example vendor",
                    code: "SUP-EXAMPLE",
                    phone: "01700000000",
                    address: "Dhaka",
                  },
                ])
              }
              className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-blue-700"
            >
              <Download className="w-4 h-4" />
              <span>Download CSV Template</span>
            </button>

            <button
              type="button"
              disabled={!importFile || isImporting}
              onClick={async () => {
                if (!importFile) return;
                const body = new FormData();
                body.append("file", importFile);
                try {
                  const result = await importSuppliers(body).unwrap();
                  toast.success(`${result.data.imported} suppliers imported.`);
                  setImportFile(null);
                  setActiveTab("manage");
                } catch (error) {
                  toast.error(errorMessage(error));
                }
              }}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs"
            >
              {isImporting ? "Importing…" : "Import Data"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
