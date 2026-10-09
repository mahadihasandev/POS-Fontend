export const tabPermissions: Record<string, string> = {
  dashboard: "reports.view",
  "pos-new": "sales.create",
  "pos-supplier": "sales.create",
  "sales-list": "sales.view",
  collection: "collections.create",
  "collection-supplier": "collections.create",
  "sales-return": "sales.returns",
  "sales-exchange-list": "sales.view",
  "purchase-new": "purchases.create",
  "purchase-list": "purchases.view",
  "purchase-payment": "purchases.payments",
  "purchase-return": "purchases.returns",
  products: "inventory.view",
  transfers: "inventory.manage",
  wastages: "inventory.manage",
  customers: "sales.view",
  suppliers: "purchases.view",
  marketers: "reports.view",
  accounts: "accounts.view",
  expenses: "accounts.expenses",
  reports: "reports.view",
  rbac: "designations.manage",
  crm: "sales.view",
};
export function canOpenTab(tab: string, permissions: string[], admin: boolean) {
  return (
    Boolean(tabPermissions[tab]) &&
    (admin || permissions.includes(tabPermissions[tab]))
  );
}

export const workspacePages = [
  { id: "dashboard", label: "Business overview", group: "Overview" },
  { id: "pos-new", label: "New sale", group: "Sales" },
  { id: "pos-supplier", label: "Supplier sale", group: "Sales" },
  { id: "sales-list", label: "Sales register", group: "Sales" },
  { id: "collection", label: "Due collection", group: "Sales" },
  { id: "collection-supplier", label: "Supplier collection", group: "Sales" },
  { id: "sales-return", label: "Return & exchange", group: "Sales" },
  { id: "sales-exchange-list", label: "Return history", group: "Sales" },
  { id: "purchase-new", label: "Add purchase", group: "Purchasing" },
  { id: "purchase-list", label: "Purchase register", group: "Purchasing" },
  { id: "purchase-payment", label: "Supplier payments", group: "Purchasing" },
  { id: "purchase-return", label: "Purchase returns", group: "Purchasing" },
  { id: "products", label: "Products & stock", group: "Inventory" },
  { id: "transfers", label: "Stock transfers", group: "Inventory" },
  { id: "wastages", label: "Wastage & losses", group: "Inventory" },
  { id: "customers", label: "Customers", group: "People" },
  { id: "suppliers", label: "Suppliers", group: "People" },
  { id: "marketers", label: "Marketers & commissions", group: "People" },
  { id: "accounts", label: "Accounts & transfers", group: "Finance" },
  { id: "expenses", label: "Expense vouchers", group: "Finance" },
  { id: "reports", label: "Reports & audit", group: "Finance" },
  { id: "rbac", label: "Staff & permissions", group: "Administration" },
  { id: "crm", label: "CRM & Social Channels", group: "CRM" },
];
