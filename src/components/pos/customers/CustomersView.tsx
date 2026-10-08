"use client";
import { downloadCsv, errorMessage } from "@/lib/pos";

import React, { useState } from "react";
import {
  Users,
  Search,
  MapPin,
  Plus,
  Upload,
  Layers,
  Download,
} from "lucide-react";
import {
  Customer,
  useCreateCustomerMutation,
  useImportCustomersMutation,
  useGetCustomerCategoriesQuery,
} from "@/redux/api/posApi";
import toast from "react-hot-toast";

export interface CustomersViewProps {
  customers: Customer[];
  onSelectCustomerForCollection?: (customer: Customer) => void;
}

export function CustomersView({
  customers,
  onSelectCustomerForCollection,
}: CustomersViewProps) {
  const [activeTab, setActiveTab] = useState<
    "manage" | "dues" | "add" | "upload" | "categories"
  >("manage");
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importCustomers, { isLoading: isImporting }] =
    useImportCustomersMutation();
  const [searchTerm, setSearchTerm] = useState("");

  // Add customer form state
  const [name, setName] = useState("");
  const [code, setCode] = useState(
    () => `CUST-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
  );
  const [phone, setPhone] = useState("");
  const [area, setArea] = useState("");
  const [prevDue, setPrevDue] = useState<number>(0);
  const [advance, setAdvance] = useState<number>(0);

  const [createCustomer, { isLoading: isCreating }] =
    useCreateCustomerMutation();
  const { data: catData } = useGetCustomerCategoriesQuery();
  const categories = catData?.data || [];

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please provide customer name.");
      return;
    }

    try {
      await createCustomer({
        name,
        code,
        phone,
        area,
        previous_due: prevDue,
        advanced_amount: advance,
      }).unwrap();

      toast.success(`Customer ${name} registered successfully!`);
      setName("");
      setPhone("");
      setPrevDue(0);
      setAdvance(0);
      setCode(`CUST-${crypto.randomUUID().slice(0, 8).toUpperCase()}`);
      setActiveTab("manage");
    } catch (err: unknown) {
      toast.error(errorMessage(err, "Failed to create customer."));
    }
  };

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.phone && c.phone.includes(searchTerm)) ||
      (c.area && c.area.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  const duesOnly = filtered.filter((c) => Number(c.previous_due) > 0);

  const totalReceivable = customers.reduce(
    (sum, c) => sum + Number(c.previous_due),
    0,
  );

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="bg-white border border-slate-200 p-4 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-slate-900 tracking-tight">
              Customer Management & Accounts
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Market Total Outstanding:{" "}
              <strong className="text-rose-600 font-black">
                ৳{totalReceivable.toLocaleString()}
              </strong>
            </p>
          </div>
        </div>

        {/* Sub Navigation Tabs (Matching screenshots 11.01.34 AM - 11.01.45 AM) */}
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
            Manage Customer
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("dues")}
            className={`px-3 py-1.5 rounded-md transition ${
              activeTab === "dues"
                ? "bg-white text-rose-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Customer Due List
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("add")}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-md transition ${
              activeTab === "add"
                ? "bg-teal-700 text-white shadow-xs"
                : "text-teal-800 hover:bg-teal-50"
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Customer</span>
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
          <button
            type="button"
            onClick={() => setActiveTab("categories")}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-md transition ${
              activeTab === "categories"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Customer Area</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Manage Customers */}
      {activeTab === "manage" && (
        <div className="space-y-3">
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by customer name, code, phone, area..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-500 font-medium"
              />
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3.5">Customer Name</th>
                    <th className="py-2.5 px-3.5">Code</th>
                    <th className="py-2.5 px-3.5">Area / Zone</th>
                    <th className="py-2.5 px-3.5">Phone</th>
                    <th className="py-2.5 px-3.5 text-right">Previous Due</th>
                    <th className="py-2.5 px-3.5 text-right">
                      Advanced Amount
                    </th>
                    <th className="py-2.5 px-3.5 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50 transition">
                      <td className="py-2.5 px-3.5 font-bold text-slate-900">
                        {c.name}
                      </td>
                      <td className="py-2.5 px-3.5 font-mono font-bold text-teal-800">
                        {c.code}
                      </td>
                      <td className="py-2.5 px-3.5 text-slate-700 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{c.area || "General Market"}</span>
                      </td>
                      <td className="py-2.5 px-3.5 text-slate-700 font-mono">
                        {c.phone || "—"}
                      </td>
                      <td className="py-2.5 px-3.5 text-right font-extrabold text-rose-600">
                        ৳{Number(c.previous_due).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3.5 text-right font-extrabold text-emerald-600">
                        ৳{Number(c.advanced_amount).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => onSelectCustomerForCollection?.(c)}
                          className="px-2.5 py-1 rounded-md bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 text-[11px] font-bold transition cursor-pointer shadow-xs"
                        >
                          Collect Due
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

      {/* Tab 2: Customer Due List */}
      {activeTab === "dues" && (
        <div className="space-y-3">
          <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl flex justify-between items-center text-xs">
            <span className="font-bold text-rose-900">
              Filtered Due Accounts ({duesOnly.length} customers with
              outstanding balances)
            </span>
            <span className="font-black text-sm text-rose-700">
              Total: ৳
              {duesOnly
                .reduce((s, c) => s + Number(c.previous_due), 0)
                .toLocaleString()}
            </span>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3.5">Customer Name</th>
                  <th className="py-2.5 px-3.5">Code</th>
                  <th className="py-2.5 px-3.5">Area</th>
                  <th className="py-2.5 px-3.5">Phone</th>
                  <th className="py-2.5 px-3.5 text-right">Payable Due</th>
                  <th className="py-2.5 px-3.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {duesOnly.map((c) => (
                  <tr key={c.id} className="hover:bg-rose-50/40">
                    <td className="py-2.5 px-3.5 font-bold text-slate-900">
                      {c.name}
                    </td>
                    <td className="py-2.5 px-3.5 font-mono font-bold text-slate-600">
                      {c.code}
                    </td>
                    <td className="py-2.5 px-3.5 text-slate-600">
                      {c.area || "General"}
                    </td>
                    <td className="py-2.5 px-3.5 font-mono text-slate-600">
                      {c.phone || "—"}
                    </td>
                    <td className="py-2.5 px-3.5 text-right font-black text-rose-600 text-sm">
                      ৳{Number(c.previous_due).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3.5 text-center">
                      <button
                        type="button"
                        onClick={() => onSelectCustomerForCollection?.(c)}
                        className="px-3 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition shadow-xs"
                      >
                        Collect Now
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Add Customer Form */}
      {activeTab === "add" && (
        <form
          onSubmit={handleAddCustomer}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4 max-w-2xl"
        >
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-2">
            Register New Customer
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Customer Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Al-Madina Hardware & Electric"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 font-medium focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Customer Code
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
                Mobile Number
              </label>
              <input
                type="text"
                placeholder="018XXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Area / Market Zone
              </label>
              <input
                type="text"
                placeholder="e.g. Nawabpur Road"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 font-medium"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Opening Previous Due (৳)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={prevDue}
                onChange={(e) => setPrevDue(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 font-bold text-rose-600"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Opening Advanced Amount (৳)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={advance}
                onChange={(e) => setAdvance(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 font-bold text-emerald-600"
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
              className="px-5 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-extrabold transition shadow-xs"
            >
              {isCreating ? "Saving..." : "Save Customer"}
            </button>
          </div>
        </form>
      )}

      {/* Tab 4: Upload Customer by CSV (Screenshot 11.01.43 AM) */}
      {activeTab === "upload" && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs max-w-xl space-y-4">
          <div>
            <h2 className="text-sm font-extrabold text-slate-900">
              Bulk Customer CSV Import
            </h2>
            <p className="text-xs text-slate-500">
              Upload customer account master list in bulk via spreadsheet
              template
            </p>
          </div>

          <label className="block border-2 border-dashed border-slate-300 rounded-xl p-6 space-y-3">
            <Upload className="w-8 h-8 text-teal-600" />
            <span className="block text-xs text-slate-600">
              Select a CSV file (up to 2 MB and 1,000 customers).
            </span>
            <input
              type="file"
              aria-label="Customer CSV file"
              accept=".csv"
              onChange={(e) => setImportFile(e.target.files?.[0] || null)}
              className="text-xs max-w-full"
            />
            <span className="block text-xs text-slate-500">
              Unique customer codes are required. All rows are validated before
              import; opening due and advance remain zero.
            </span>
          </label>
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() =>
                downloadCsv("customers_template", [
                  {
                    name: "Example customer",
                    code: "CUST-EXAMPLE",
                    phone: "01700000000",
                    area: "Dhaka",
                  },
                ])
              }
              className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-teal-700"
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
                  const result = await importCustomers(body).unwrap();
                  toast.success(`${result.data.imported} customers imported.`);
                  setImportFile(null);
                  setActiveTab("manage");
                } catch (error) {
                  toast.error(errorMessage(error));
                }
              }}
              className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs"
            >
              {isImporting ? "Importing…" : "Import Data"}
            </button>
          </div>
        </div>
      )}

      {/* Tab 5: Customer Category & Area (Screenshot 11.01.45 AM) */}
      {activeTab === "categories" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                Customer Territorial Zones & Areas
              </h2>
              <p className="text-xs text-slate-500">
                Group accounts by geographic wholesale market locations
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="p-3 rounded-lg border border-slate-200 bg-slate-50 space-y-1 hover:border-teal-300 transition"
              >
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-teal-600" />
                  <span className="font-bold text-xs text-slate-900">
                    {cat.name}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  {cat.description || "General zone"}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
