"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getCookie } from "cookies-next";
import { useWorkspaceNavigation } from "@/lib/useWorkspaceNavigation";
import { WorkspaceSearch } from "@/components/pos/shared/WorkspaceSearch";
import { useGetMeQuery } from "@/redux/api/authApi";
import { canOpenTab, workspacePages } from "@/lib/navigation";
import { QueryState } from "@/components/pos/shared/QueryState";
import { ExpensesView } from "@/components/pos/accounts/ExpensesView";
import { WastagesView } from "@/components/pos/inventory/WastagesView";
import type { SaleRecord } from "@/redux/api/posApi";
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
import { CrmView } from "@/components/pos/crm/CrmView";

import {
  useGetBootstrapDataQuery,
  useGetHeldSalesQuery,
  useResumeSaleMutation,
} from "@/redux/api/posApi";
import toast from "react-hot-toast";

export default function PosApp() {
  const [activeTab, setActiveTab] = useWorkspaceNavigation();
  const mainRef = useRef<HTMLElement>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0, behavior: "instant" });
  }, [activeTab]);
  useEffect(() => {
    const handle = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen((open) => !open);
      }
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, []);
  const router = useRouter();
  const [resumedSale, setResumedSale] = useState<SaleRecord | null>(null);
  const [currentOutlet, setCurrentOutlet] = useState<string>("");
  const [isHoldModalOpen, setIsHoldModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [hasToken, setHasToken] = useState<boolean | null>(null);

  useEffect(() => {
    const token = getCookie("token");
    if (!token) {
      setHasToken(false);
      router.replace("/login");
    } else {
      setHasToken(true);
    }
  }, [router]);

  const {
    data: profile,
    isLoading: profileLoading,
    error: profileError,
    refetch: refetchProfile,
  } = useGetMeQuery(undefined, {
    skip: hasToken !== true,
  });
  const permissions = profile?.data?.permissions || [];
  const isAdmin = profile?.data?.designation?.slug === "admin";
  const can = (permission: string) =>
    isAdmin || permissions.includes(permission);
  const {
    data: bootstrapData,
    isLoading: bootstrapLoading,
    error: bootstrapError,
    refetch,
  } = useGetBootstrapDataQuery(undefined, {
    skip: !profile || !can("inventory.view"),
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });
  const { data: heldSalesData, refetch: refetchHeld } = useGetHeldSalesQuery(
    undefined,
    { skip: !profile || !can("sales.hold") },
  );
  const [resumeSale] = useResumeSaleMutation();

  const outlets = bootstrapData?.data?.outlets || [];
  const selectedOutlet =
    outlets.find((outlet) => outlet.name === currentOutlet) || outlets[0];
  const outletName = selectedOutlet?.name || "Choose a branch";

  const customers = bootstrapData?.data?.customers || [];
  const suppliers = bootstrapData?.data?.suppliers || [];
  const marketers = bootstrapData?.data?.marketers || [];
  const products = bootstrapData?.data?.products || [];
  const accounts = bootstrapData?.data?.accounts || [];
  const heldSales = heldSalesData?.data || [];

  const navigate = (tab: string) => {
    if (!canOpenTab(tab, permissions, isAdmin)) {
      toast.error("You do not have permission to open this module.");
      return;
    }
    setActiveTab(tab);
    setIsSidebarOpen(false);
  };
  const viewTab = canOpenTab(activeTab, permissions, isAdmin)
    ? activeTab
    : can("reports.view")
      ? "dashboard"
      : workspacePages.find((page) => canOpenTab(page.id, permissions, isAdmin))
          ?.id || "";

  const isUnauthorized =
    hasToken === false ||
    (profileError as { status?: number | string })?.status === 401 ||
    (profileError as { originalStatus?: number })?.originalStatus === 401;

  if (hasToken === null || profileLoading || isUnauthorized)
    return (
      <div className="p-8">
        <QueryState loading />
      </div>
    );
  if (profileError)
    return (
      <div className="p-8">
        <QueryState error={profileError} retry={refetchProfile} />
      </div>
    );

  return (
    <div className="h-dvh overflow-hidden bg-slate-100 text-slate-900 flex flex-col pos-app font-sans selection:bg-teal-600 selection:text-white">
      <a
        href="#workspace-content"
        className="skip-link"
        onClick={(event) => {
          event.preventDefault();
          mainRef.current?.focus();
        }}
      >
        Skip to workspace
      </a>
      {searchOpen && (
        <WorkspaceSearch
          permissions={permissions}
          isAdmin={isAdmin}
          onSelect={navigate}
          onClose={() => setSearchOpen(false)}
        />
      )}
      <div className="flex flex-1 min-h-0">
        {/* Topbar Component with Quick Action Shortcuts & Mobile Hamburger */}
        <PosSidebar
          activeTab={viewTab}
          onSelectTab={navigate}
          userPermissions={permissions}
          isAdmin={isAdmin}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        <div className="flex flex-1 min-w-0 flex-col">
          <PosTopbar
            onOpenSearch={() => setSearchOpen(true)}
            activeTab={viewTab}
            currentOutlet={outletName}
            onSelectOutlet={setCurrentOutlet}
            outlets={outlets}
            heldCount={heldSales.length}
            onOpenHoldModal={() => setIsHoldModalOpen(true)}
            currentUserRole={profile?.data?.designation?.name || "Staff"}
            userName={profile?.data?.name || "Staff"}
            canSell={can("sales.create")}
            canHold={can("sales.hold")}
            onSelectTab={navigate}
            onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          />
          {/* Dynamic View Router */}
          <main
            ref={mainRef}
            id="workspace-content"
            tabIndex={-1}
            className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-5 lg:p-6 bg-slate-100 pb-24 lg:pb-6"
          >
            {!viewTab ? (
              <div className="panel p-10 text-center">
                <h1 className="text-xl font-semibold">Your account is ready</h1>
                <p className="mt-3 text-sm text-slate-600">
                  Ask your administrator to assign workspace permissions before
                  you begin.
                </p>
              </div>
            ) : bootstrapLoading ? (
              <QueryState loading />
            ) : bootstrapError ? (
              <QueryState error={bootstrapError} retry={refetch} />
            ) : (
              <>
                {/* Sales: Supplier Wise Sale */}
                {viewTab === "pos-supplier" && (
                  <PosTerminal
                    key={`${selectedOutlet?.id}-${resumedSale?.id || "new"}`}
                    outletId={selectedOutlet?.id || null}
                    userId={profile?.data?.id || 0}
                    initialSale={
                      resumedSale?.outlet_id === selectedOutlet?.id &&
                      resumedSale.sale_type === "supplier_wise"
                        ? resumedSale
                        : null
                    }
                    onSaleFinished={() => setResumedSale(null)}
                    canHold={can("sales.hold")}
                    heldCount={heldSales.length}
                    onOpenHoldList={() => setIsHoldModalOpen(true)}
                    saleType="supplier_wise"
                    customers={customers}
                    suppliers={suppliers}
                    marketers={marketers}
                    products={products}
                    accounts={accounts}
                    outletName={outletName}
                    onNavigateToList={() => setActiveTab("sales-list")}
                  />
                )}

                {/* Sales: Standard New Sale */}
                {viewTab === "pos-new" && (
                  <PosTerminal
                    key={`${selectedOutlet?.id}-${resumedSale?.id || "new"}`}
                    outletId={selectedOutlet?.id || null}
                    userId={profile?.data?.id || 0}
                    initialSale={
                      resumedSale?.outlet_id === selectedOutlet?.id &&
                      resumedSale.sale_type === "normal"
                        ? resumedSale
                        : null
                    }
                    onSaleFinished={() => setResumedSale(null)}
                    canHold={can("sales.hold")}
                    heldCount={heldSales.length}
                    onOpenHoldList={() => setIsHoldModalOpen(true)}
                    saleType="normal"
                    customers={customers}
                    suppliers={suppliers}
                    marketers={marketers}
                    products={products}
                    accounts={accounts}
                    outletName={outletName}
                    onNavigateToList={() => setActiveTab("sales-list")}
                  />
                )}

                {/* Sales: Due Collection */}
                {viewTab === "collection" && (
                  <CustomerDueCollection
                    customers={customers}
                    accounts={accounts}
                    suppliers={suppliers}
                    initialMode="general"
                  />
                )}

                {/* Sales: Supplier Wise Due Collection (Screenshot 11.00.09 AM) */}
                {viewTab === "collection-supplier" && (
                  <CustomerDueCollection
                    customers={customers}
                    accounts={accounts}
                    suppliers={suppliers}
                    initialMode="supplier_wise"
                  />
                )}

                {/* Sales: Sales History / List */}
                {viewTab === "sales-list" && (
                  <SalesListView
                    customers={customers}
                    onNavigateToNewSale={() => setActiveTab("pos-supplier")}
                    outletName={outletName}
                  />
                )}

                {/* Sales: Return & Exchange */}
                {viewTab === "sales-return" && (
                  <SalesReturnView
                    customers={customers}
                    accounts={accounts}
                    products={products}
                    onNavigateToList={() => setActiveTab("sales-exchange-list")}
                  />
                )}

                {/* Sales: Exchange Info List */}
                {viewTab === "sales-exchange-list" && (
                  <SaleExchangeListView
                    customers={customers}
                    onNavigateToNewReturn={() => setActiveTab("sales-return")}
                  />
                )}

                {/* Purchases: Add New Purchase */}
                {viewTab === "purchase-new" && (
                  <AddPurchaseView
                    suppliers={suppliers}
                    products={products}
                    accounts={accounts}
                    outlets={outlets}
                    onNavigateToList={() => setActiveTab("purchase-list")}
                  />
                )}

                {/* Purchases: Purchase List */}
                {viewTab === "purchase-list" && (
                  <PurchaseListView
                    suppliers={suppliers}
                    onNavigateToNewPurchase={() => setActiveTab("purchase-new")}
                    onNavigateToSupplierPayment={() =>
                      setActiveTab("purchase-payment")
                    }
                  />
                )}

                {/* Purchases: Supplier Payment */}
                {viewTab === "purchase-payment" && (
                  <SupplierPaymentView
                    suppliers={suppliers}
                    accounts={accounts}
                    onNavigateToPurchases={() => setActiveTab("purchase-list")}
                  />
                )}

                {/* Purchases: Purchase Return & Vendor Debit Note (Screenshot 11.00.35 AM) */}
                {viewTab === "purchase-return" && (
                  <PurchaseReturnView
                    suppliers={suppliers}
                    products={products}
                    accounts={accounts}
                    outlets={outlets}
                    onNavigateToPurchases={() => setActiveTab("purchase-list")}
                  />
                )}

                {/* Dashboard & Financial Accounts */}
                {viewTab === "dashboard" && (
                  <DashboardView
                    onNavigate={navigate}
                    permissions={permissions}
                    isAdmin={isAdmin}
                  />
                )}

                {/* Products Stock Catalog */}
                {viewTab === "products" && (
                  <ProductInventoryView
                    products={products}
                    suppliers={suppliers}
                    canManage={can("inventory.manage")}
                  />
                )}

                {/* Customers & Dues Directory */}
                {viewTab === "customers" && (
                  <CustomersView
                    customers={customers}
                    onSelectCustomerForCollection={() =>
                      setActiveTab("collection")
                    }
                  />
                )}

                {/* Suppliers Directory */}
                {viewTab === "suppliers" && (
                  <SuppliersView
                    suppliers={suppliers}
                    onNavigateToSupplierPayment={() =>
                      setActiveTab("purchase-payment")
                    }
                  />
                )}

                {viewTab === "expenses" && <ExpensesView accounts={accounts} />}
                {viewTab === "wastages" && <WastagesView products={products} />}
                {/* General Accounts & Ledgers */}
                {viewTab === "accounts" && <AccountsView accounts={accounts} />}

                {/* Marketers & Tiered Commission Slabs */}
                {viewTab === "marketers" && (
                  <MarketersView accounts={accounts} />
                )}

                {/* Stock Transfer (Warehouse to Warehouse & Company) */}
                {viewTab === "transfers" && (
                  <StockTransferView products={products} outlets={outlets} />
                )}

                {/* Executive Reports & Inventory Intelligence */}
                {viewTab === "reports" && <ReportsView />}

                {/* Multi-User RBAC & Designations */}
                {viewTab === "rbac" && (
                  <DesignationManager canManageUsers={can("users.manage")} />
                )}

                {/* CRM & Social Outreach Channel (WhatsApp, Facebook, Phone) */}
                {viewTab === "crm" && <CrmView customers={customers} />}
              </>
            )}
          </main>
        </div>
      </div>

      {/* Global Hold List Modal */}
      <HoldListModal
        isOpen={isHoldModalOpen}
        onClose={() => setIsHoldModalOpen(false)}
        heldSales={heldSales}
        onResumeSale={async (sale) => {
          const target = outlets.find((outlet) => outlet.id === sale.outlet_id);
          if (!target) {
            toast.error("The held sale's branch is unavailable.");
            return;
          }
          if (!can("sales.create")) {
            toast.error("You need checkout permission to resume a sale.");
            return;
          }
          const draftKey = `pos-draft:${profile?.data.id}:${target.id}:${sale.sale_type}`;
          if (
            sessionStorage.getItem(draftKey) &&
            !window.confirm(
              "Replace the current checkout draft with this held sale?",
            )
          )
            return;
          if (
            sale.items?.some(
              (item) =>
                !products.find((product) => product.id === item.product_id),
            )
          ) {
            toast.error(
              "This sale contains a missing product. Update the catalog before resuming.",
            );
            return;
          }
          setCurrentOutlet(target.name);
          setResumedSale(sale);
          setIsHoldModalOpen(false);
          setActiveTab(
            sale.sale_type === "supplier_wise" ? "pos-supplier" : "pos-new",
          );
          toast.success(`Resumed ${sale.invoice_id} to POS cart!`);
        }}
        onDiscardSale={async (id) => {
          try {
            await resumeSale(id).unwrap();
            refetchHeld();
            toast.success("Held order discarded.");
          } catch {
            toast.error("Could not discard this held sale.");
          }
        }}
      />

      {/* Smartphone Bottom Navigation Bar (Visible on mobile screens) */}
      <PosMobileBottomNav
        activeTab={viewTab}
        onSelectTab={navigate}
        heldCount={heldSales.length}
        onOpenHoldModal={() => setIsHoldModalOpen(true)}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        permissions={permissions}
        isAdmin={isAdmin}
      />
    </div>
  );
}
