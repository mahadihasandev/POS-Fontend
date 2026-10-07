"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCookie } from "cookies-next";
import { PosTopbar } from "@/components/pos/PosTopbar";
import { PosSidebar } from "@/components/pos/PosSidebar";
import { PosTerminal } from "@/components/pos/sale/PosTerminal";
import { CustomerDueCollection } from "@/components/pos/collection/CustomerDueCollection";
import { SalesListView } from "@/components/pos/history/SalesListView";
import { DashboardView } from "@/components/pos/dashboard/DashboardView";
import { ProductInventoryView } from "@/components/pos/inventory/ProductInventoryView";
import { CustomersView } from "@/components/pos/customers/CustomersView";
import { SuppliersView } from "@/components/pos/suppliers/SuppliersView";
import { AccountsView } from "@/components/pos/accounts/AccountsView";
import { DesignationManager } from "@/components/pos/rbac/DesignationManager";
import { HoldListModal } from "@/components/pos/sale/HoldListModal";
import { PosMobileBottomNav } from "@/components/pos/PosMobileBottomNav";
// Extended ERP Module Views
import { SalesReturnView } from "@/components/pos/returns/SalesReturnView";
import { SaleExchangeListView } from "@/components/pos/returns/SaleExchangeListView";
import { AddPurchaseView } from "@/components/pos/purchases/AddPurchaseView";
import { PurchaseListView } from "@/components/pos/purchases/PurchaseListView";
import { SupplierPaymentView } from "@/components/pos/purchases/SupplierPaymentView";
import { MarketersView } from "@/components/pos/marketers/MarketersView";
import { StockTransferView } from "@/components/pos/transfers/StockTransferView";
import { ReportsView } from "@/components/pos/reports/ReportsView";
import { PurchaseReturnView } from "@/components/pos/purchases/PurchaseReturnView";

import {
  useGetBootstrapDataQuery,
  useGetHeldSalesQuery,
  useResumeSaleMutation,
} from "@/redux/api/posApi";
import toast from "react-hot-toast";

export default function PosApp() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>("pos-supplier");
  const [currentOutlet, setCurrentOutlet] = useState<string>("DATTA & BROTHERS ELECTRICS");
  const [currentUserRole, setCurrentUserRole] = useState<"admin" | "cashier" | "manager">("admin");
  const [isHoldModalOpen, setIsHoldModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const rawToken = getCookie("token") ?? getCookie("auth_token") ?? getCookie("access_token");
    if (!rawToken) {
      router.push("/login");
      return;
    }
    const savedRole = getCookie("user_role");
    if (savedRole === "admin" || savedRole === "cashier" || savedRole === "manager") {
      setCurrentUserRole(savedRole);
    }
  }, [router]);

  // Load backend POS bootstrap data
  const { data: bootstrapData, refetch } = useGetBootstrapDataQuery();
  const { data: heldSalesData, refetch: refetchHeld } = useGetHeldSalesQuery();
  const [resumeSale] = useResumeSaleMutation();

  const outlets = bootstrapData?.data?.outlets || [
    { id: 1, name: "DATTA & BROTHERS ELECTRICS", code: "OUT-01" },
    { id: 2, name: "SMART ACCOUNT CENTRAL", code: "OUT-02" },
  ];

  const customers = bootstrapData?.data?.customers || [];
  const suppliers = bootstrapData?.data?.suppliers || [];
  const marketers = bootstrapData?.data?.marketers || [];
  const products = bootstrapData?.data?.products || [];
  const accounts = bootstrapData?.data?.accounts || [];
  const heldSales = heldSalesData?.data || [];

  // Simulated role permissions
  const rolePermissions: Record<string, string[]> = {
    admin: [
      "sales.create",
      "sales.view",
      "sales.edit",
      "sales.delete",
      "sales.hold",
      "collections.create",
      "collections.view",
      "inventory.view",
      "inventory.manage",
      "accounts.view",
      "reports.view",
      "designations.manage",
      "users.manage",
    ],
    cashier: [
      "sales.create",
      "sales.view",
      "sales.hold",
      "collections.create",
      "inventory.view",
    ],
    manager: [
      "sales.create",
      "sales.view",
      "sales.edit",
      "sales.hold",
      "collections.create",
      "collections.view",
      "inventory.view",
      "inventory.manage",
      "accounts.view",
      "reports.view",
    ],
  };

  const currentPermissions = rolePermissions[currentUserRole] || [];
  const isAdmin = currentUserRole === "admin";

  const handleSwitchUserRole = (role: "admin" | "cashier" | "manager") => {
    setCurrentUserRole(role);
    toast.success(`Active user role switched to ${role.toUpperCase()}`);
    if (role === "cashier" && activeTab === "rbac") {
      setActiveTab("pos-supplier");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans selection:bg-teal-600 selection:text-white">
      {/* Topbar Component with Quick Action Shortcuts & Mobile Hamburger */}
      <PosTopbar
        currentOutlet={currentOutlet}
        onSelectOutlet={setCurrentOutlet}
        outlets={outlets}
        heldCount={heldSales.length}
        onOpenHoldModal={() => setIsHoldModalOpen(true)}
        currentUserRole={currentUserRole}
        onSwitchUserRole={handleSwitchUserRole}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        isSidebarOpen={isSidebarOpen}
      />

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar Component with Full Modules Accordion (Off-canvas Drawer on mobile) */}
        <PosSidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          userPermissions={currentPermissions}
          isAdmin={isAdmin}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Dynamic View Router */}
        <main className="flex-1 overflow-y-auto p-2.5 sm:p-4 md:p-5 bg-slate-100 pb-20 lg:pb-5">
          {/* Sales: Supplier Wise Sale */}
          {activeTab === "pos-supplier" && (
            <PosTerminal
              saleType="supplier_wise"
              customers={customers}
              suppliers={suppliers}
              marketers={marketers}
              products={products}
              accounts={accounts}
              outletName={currentOutlet}
              onNavigateToList={() => setActiveTab("sales-list")}
            />
          )}

          {/* Sales: Standard New Sale */}
          {activeTab === "pos-new" && (
            <PosTerminal
              saleType="normal"
              customers={customers}
              suppliers={suppliers}
              marketers={marketers}
              products={products}
              accounts={accounts}
              outletName={currentOutlet}
              onNavigateToList={() => setActiveTab("sales-list")}
            />
          )}

          {/* Sales: Due Collection */}
          {activeTab === "collection" && (
            <CustomerDueCollection
              customers={customers}
              accounts={accounts}
              suppliers={suppliers}
              initialMode="general"
            />
          )}

          {/* Sales: Supplier Wise Due Collection (Screenshot 11.00.09 AM) */}
          {activeTab === "collection-supplier" && (
            <CustomerDueCollection
              customers={customers}
              accounts={accounts}
              suppliers={suppliers}
              initialMode="supplier_wise"
            />
          )}

          {/* Sales: Sales History / List */}
          {activeTab === "sales-list" && (
            <SalesListView
              customers={customers}
              onNavigateToNewSale={() => setActiveTab("pos-supplier")}
              outletName={currentOutlet}
            />
          )}

          {/* Sales: Return & Exchange */}
          {activeTab === "sales-return" && (
            <SalesReturnView
              customers={customers}
              suppliers={suppliers}
              products={products}
              onNavigateToList={() => setActiveTab("sales-exchange-list")}
            />
          )}

          {/* Sales: Exchange Info List */}
          {activeTab === "sales-exchange-list" && (
            <SaleExchangeListView
              customers={customers}
              onNavigateToNewReturn={() => setActiveTab("sales-return")}
            />
          )}

          {/* Purchases: Add New Purchase */}
          {activeTab === "purchase-new" && (
            <AddPurchaseView
              suppliers={suppliers}
              products={products}
              accounts={accounts}
              outlets={outlets}
              onNavigateToList={() => setActiveTab("purchase-list")}
            />
          )}

          {/* Purchases: Purchase List */}
          {activeTab === "purchase-list" && (
            <PurchaseListView
              suppliers={suppliers}
              onNavigateToNewPurchase={() => setActiveTab("purchase-new")}
              onNavigateToSupplierPayment={() => setActiveTab("purchase-payment")}
            />
          )}

          {/* Purchases: Supplier Payment */}
          {activeTab === "purchase-payment" && (
            <SupplierPaymentView
              suppliers={suppliers}
              accounts={accounts}
              onNavigateToPurchases={() => setActiveTab("purchase-list")}
            />
          )}

          {/* Purchases: Purchase Return & Vendor Debit Note (Screenshot 11.00.35 AM) */}
          {activeTab === "purchase-return" && (
            <PurchaseReturnView
              suppliers={suppliers}
              products={products}
              accounts={accounts}
              outlets={outlets}
              onNavigateToPurchases={() => setActiveTab("purchase-list")}
            />
          )}

          {/* Dashboard & Financial Accounts */}
          {activeTab === "dashboard" && <DashboardView />}

          {/* Products Stock Catalog */}
          {activeTab === "products" && (
            <ProductInventoryView products={products} />
          )}

          {/* Customers & Dues Directory */}
          {activeTab === "customers" && (
            <CustomersView
              customers={customers}
              onSelectCustomerForCollection={() => setActiveTab("collection")}
            />
          )}

          {/* Suppliers Directory */}
          {activeTab === "suppliers" && (
            <SuppliersView
              suppliers={suppliers}
              onNavigateToSupplierPayment={() => setActiveTab("purchase-payment")}
            />
          )}

          {/* General Accounts & Ledgers */}
          {activeTab === "accounts" && (
            <AccountsView accounts={accounts} />
          )}

          {/* Marketers & Tiered Commission Slabs */}
          {activeTab === "marketers" && <MarketersView />}

          {/* Stock Transfer (Warehouse to Warehouse & Company) */}
          {activeTab === "transfers" && (
            <StockTransferView products={products} outlets={outlets} />
          )}

          {/* Executive Reports & Inventory Intelligence */}
          {activeTab === "reports" && (
            <ReportsView suppliers={suppliers} products={products} />
          )}

          {/* Multi-User RBAC & Designations */}
          {activeTab === "rbac" && <DesignationManager />}
        </main>
      </div>

      {/* Global Hold List Modal */}
      <HoldListModal
        isOpen={isHoldModalOpen}
        onClose={() => setIsHoldModalOpen(false)}
        heldSales={heldSales}
        onResumeSale={async (sale) => {
          await resumeSale(sale.id).unwrap();
          setIsHoldModalOpen(false);
          refetchHeld();
          refetch();
          setActiveTab("pos-supplier");
          toast.success(`Resumed ${sale.invoice_id} to POS cart!`);
        }}
        onDiscardSale={async (id) => {
          await resumeSale(id).unwrap();
          refetchHeld();
          toast.success("Held order discarded.");
        }}
      />

      {/* Smartphone Bottom Navigation Bar (Visible on mobile screens) */}
      <PosMobileBottomNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        heldCount={heldSales.length}
        onOpenHoldModal={() => setIsHoldModalOpen(true)}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        isSidebarOpen={isSidebarOpen}
      />
    </div>
  );
}
