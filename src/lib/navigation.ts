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
};
export function canOpenTab(tab: string, permissions: string[], admin: boolean) {
  return (
    Boolean(tabPermissions[tab]) &&
    (admin || permissions.includes(tabPermissions[tab]))
  );
}
