import { baseApi } from "./baseApi";

export interface Outlet {
  id: number;
  name: string;
  code: string;
  address?: string;
  phone?: string;
}

export interface Supplier {
  id: number;
  name: string;
  code: string;
  phone?: string;
  previous_due?: number;
}

export interface Customer {
  id: number;
  name: string;
  code: string;
  phone?: string;
  area?: string;
  previous_due: string | number;
  advanced_amount: string | number;
}

export interface Marketer {
  id: number;
  name: string;
}

export interface Product {
  id: number;
  supplier_id?: number | null;
  name: string;
  code: string;
  barcode: string;
  available_qty: number;
  unit_price: string | number;
  cost_price: string | number;
  unit: string;
  low_stock_threshold: number;
  is_active: boolean;
}

export interface FinancialAccount {
  id: number;
  name: string;
  account_type: string;
  account_number?: string;
  balance: string | number;
}

export interface PosBootstrapResponse {
  success: boolean;
  data: {
    outlets: Outlet[];
    suppliers: Supplier[];
    customers: Customer[];
    marketers: Marketer[];
    products: Product[];
    accounts: FinancialAccount[];
    held_count: number;
  };
}

export interface CartItem {
  product: Product;
  quantity: number;
  unit_price: number;
  discount_percent: number;
  subtotal: number;
  profit: number;
}

export interface CreateSalePayload {
  request_id?: string;
  held_sale_id?: number | null;
  outlet_id?: number | null;
  customer_id?: number | null;
  supplier_id?: number | null;
  marketer_id?: number | null;
  sale_date: string;
  sale_type: "normal" | "supplier_wise";
  note?: string;
  discount: number;
  special_discount: number;
  delivery_charge: number;
  delivery_payer: "company" | "customer";
  payment_account: string;
  paid_amount: number;
  is_hold?: boolean;
  items: Array<{
    product_id: number;
    quantity: number;
    unit_price: number;
    discount_percent: number;
  }>;
}

export interface SaleRecord {
  outlet_id: number;
  customer_id?: number | null;
  supplier_id?: number | null;
  marketer_id?: number | null;
  outlet?: Outlet;
  id: number;
  invoice_id: string;
  sale_date: string;
  sale_type: string;
  note?: string;
  invoice_total: string | number;
  discount: string | number;
  special_discount: string | number;
  delivery_charge: string | number;
  delivery_payer: string;
  previous_due: string | number;
  advanced: string | number;
  payable_amount: string | number;
  paid_amount: string | number;
  due_amount: string | number;
  change_return: string | number;
  payment_account: string;
  status: string;
  customer?: Customer;
  supplier?: Supplier;
  user?: { id: number; name: string };
  marketer?: Marketer;
  items?: Array<{
    id: number;
    product_id: number;
    product_name: string;
    product_code: string;
    quantity: number;
    unit_price: string | number;
    discount_percent: string | number;
    subtotal: string | number;
  }>;
}

export interface CreateCollectionPayload {
  customer_id: number;
  collection_date: string;
  payment_method: string;
  account: string;
  receivable_due: number;
  discount_amount: number;
  paid_amount: number;
  send_sms?: boolean;
}

export interface CollectionRecord {
  id: number;
  collection_number: string;
  customer_id: number;
  collection_date: string;
  payment_method: string;
  account: string;
  receivable_due: string | number;
  discount_amount: string | number;
  paid_amount: string | number;
  send_sms: boolean;
  customer?: Customer;
  user?: { id: number; name: string };
}

export interface DashboardResponse {
  success: boolean;
  data: {
    metrics: {
      today: { sale: number; purchase: number };
      yesterday: { sale: number; purchase: number };
      monthly: { sale: number; purchase: number };
      today_ga: { income: number; expense: number };
      monthly_ga: { income: number; expense: number };
      liabilities: { payable_due: number; receivable_due: number };
      available_amount: number;
    };
    accounts: FinancialAccount[];
    recent_sales: SaleRecord[];
    stock: { products: number; low: number; out: number };
    sales_trend: { date: string; sale: number }[];
  };
}

export interface Page<T> {
  data: T[];
  total: number;
  current_page: number;
  last_page: number;
}
export interface PurchaseItem {
  id: number;
  product_id: number;
  product_name: string;
  product_code: string;
  quantity: number;
  free_qty: number;
  unit_cost: string | number;
  subtotal: string | number;
}
export interface PurchaseRecord {
  id: number;
  chalan_no: string;
  supplier_id: number;
  outlet_id: number;
  purchase_date: string;
  note?: string;
  subtotal: string | number;
  discount: string | number;
  tax: string | number;
  total_payable: string | number;
  paid_amount: string | number;
  due_amount: string | number;
  status: string;
  supplier?: Supplier;
  items: PurchaseItem[];
}
export interface SupplierPaymentRecord {
  id: number;
  payment_no: string;
  payment_date: string;
  supplier?: Supplier;
  account: string;
  paid_amount: string | number;
  remaining_due: string | number;
}
export interface SaleReturnRecord {
  id: number;
  return_no: string;
  invoice_id: string;
  return_date: string;
  customer?: Customer;
  supplier?: Supplier;
  return_amount: string | number;
  exchange_amount: string | number;
  net_adjustment: string | number;
  cash_refund: string | number;
  final_due: string | number;
  comments?: string;
}
export interface MarketerSlab {
  id?: number;
  start_amount: number;
  end_amount: number;
  percentage: number;
}
export interface MarketerRecord {
  id: number;
  name: string;
  phone: string;
  total_sales: number;
  commission_earned: number;
  amount_paid: number;
  balance: number;
  slabs: MarketerSlab[];
}
export interface TransferRecord {
  id: number;
  transfer_no: string;
  status: string;
  source_name: string;
  destination_name: string;
  transfer_date: string;
  total_items: number;
}
export interface WastageRecord {
  id: number;
  product_name: string;
  quantity: number;
  unit_cost: string | number;
  total_loss: string | number;
  reason: string;
  wastage_date: string;
}
export interface ExpenseRecord {
  id: number;
  voucher_no: string;
  title: string;
  expense_category: string;
  account_name: string;
  payee_name: string;
  amount: string | number;
  expense_date: string;
}
export interface AccountTransferRecord {
  id: number;
  transfer_no: string;
  from_account: string;
  to_account: string;
  amount: string | number;
  transfer_date: string;
}
export interface PurchaseReturnRecord {
  id: number;
  return_no: string;
  chalan_no: string;
  supplier?: Supplier;
  return_date: string;
  total_return_amount: string | number;
  cash_refund: string | number;
  due_deduction: string | number;
  status: string;
}
export interface CustomerCategory {
  id: number;
  name: string;
  type: string;
  description?: string;
}

export const posApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createProduct: builder.mutation<
      { success: boolean; data: Product },
      Omit<Product, "id">
    >({
      query: (body) => ({ url: "/pos/products", method: "POST", body }),
      invalidatesTags: [
        "Reports",
        "Dashboard",
        "PosBootstrap",
        "Products",
        "StockAdjustments",
      ],
    }),
    updateProduct: builder.mutation<
      { success: boolean; data: Product },
      Product
    >({
      query: ({ id, ...body }) => ({
        url: `/pos/products/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Reports", "Dashboard", "PosBootstrap", "Products"],
    }),
    adjustStock: builder.mutation<
      { success: boolean; data: Product },
      {
        id: number;
        expected_quantity: number;
        counted_quantity: number;
        reason: string;
      }
    >({
      query: ({ id, ...body }) => ({
        url: `/pos/products/${id}/adjustments`,
        method: "POST",
        body,
      }),
      invalidatesTags: [
        "Reports",
        "Dashboard",
        "PosBootstrap",
        "Products",
        "StockAdjustments",
      ],
    }),
    getStockAdjustments: builder.query<
      {
        data: {
          data: {
            id: number;
            product_name: string;
            user_name: string;
            previous_quantity: number;
            counted_quantity: number;
            difference: number;
            reason: string;
            created_at: string;
          }[];
          current_page: number;
          last_page: number;
        };
      },
      { page: number }
    >({
      query: (params) => ({ url: "/pos/stock-adjustments", params }),
      providesTags: ["StockAdjustments"],
    }),
    getBootstrapData: builder.query<PosBootstrapResponse, void>({
      query: () => "/pos/bootstrap",
      providesTags: ["PosBootstrap", "Products"],
    }),

    searchProducts: builder.query<
      { success: boolean; data: Product[] },
      { q: string; supplier_id?: number }
    >({
      query: (params) => ({
        url: "/pos/products",
        params,
      }),
      providesTags: ["Products"],
    }),

    createSale: builder.mutation<
      { success: boolean; message: string; data: SaleRecord },
      CreateSalePayload
    >({
      query: (body) => ({
        url: "/pos/sales",
        method: "POST",
        body,
      }),
      invalidatesTags: [
        "Reports",
        "Dashboard",
        "PosBootstrap",
        "Products",
        "Sales",
        "HeldSales",
      ],
    }),

    getSales: builder.query<
      {
        success: boolean;
        data: {
          data: SaleRecord[];
          total: number;
          current_page: number;
          last_page: number;
        };
      },
      {
        start_date?: string;
        end_date?: string;
        customer_id?: number | string;
        invoice_id?: string;
        page?: number;
      }
    >({
      query: (params) => ({
        url: "/pos/sales",
        params,
      }),
      providesTags: ["Sales"],
    }),

    getHeldSales: builder.query<{ success: boolean; data: SaleRecord[] }, void>(
      {
        query: () => "/pos/sales/held",
        providesTags: ["HeldSales"],
      },
    ),

    resumeSale: builder.mutation<
      { success: boolean; message: string; data: SaleRecord },
      number
    >({
      query: (id) => ({
        url: `/pos/sales/held/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Reports", "Dashboard", "HeldSales", "PosBootstrap"],
    }),

    createCollection: builder.mutation<
      { success: boolean; message: string; data: CollectionRecord },
      CreateCollectionPayload
    >({
      query: (body) => ({
        url: "/pos/collections",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Reports", "Dashboard", "Collections", "PosBootstrap"],
    }),

    getCollections: builder.query<
      { success: boolean; data: { data: CollectionRecord[]; total: number } },
      void
    >({
      query: () => "/pos/collections",
      providesTags: ["Collections"],
    }),

    getDashboard: builder.query<DashboardResponse, void>({
      query: () => "/pos/dashboard",
      providesTags: ["Dashboard"],
    }),

    // Purchases
    getPurchases: builder.query<
      { success: boolean; data: Page<PurchaseRecord> },
      { supplier_id?: number | string; chalan_no?: string; page?: number }
    >({
      query: (params) => ({
        url: "/pos/purchases",
        params,
      }),
      providesTags: ["Purchases"],
    }),

    createPurchase: builder.mutation<
      { success: boolean; message: string; data: unknown },
      Record<string, unknown>
    >({
      query: (body) => ({
        url: "/pos/purchases",
        method: "POST",
        body,
      }),
      invalidatesTags: [
        "Reports",
        "Dashboard",
        "Purchases",
        "Products",
        "PosBootstrap",
      ],
    }),

    getSupplierPayments: builder.query<
      { success: boolean; data: Page<SupplierPaymentRecord> },
      { page?: number } | void
    >({
      query: (params) => ({
        params: params || undefined,
        url: "/pos/purchases/payments",
      }),
      providesTags: ["SupplierPayments"],
    }),

    createSupplierPayment: builder.mutation<
      { success: boolean; message: string; data: unknown },
      Record<string, unknown>
    >({
      query: (body) => ({
        url: "/pos/purchases/payments",
        method: "POST",
        body,
      }),
      invalidatesTags: [
        "Reports",
        "Dashboard",
        "SupplierPayments",
        "PosBootstrap",
      ],
    }),

    // Sales Returns & Exchanges
    getSaleReturns: builder.query<
      { success: boolean; data: Page<SaleReturnRecord> },
      { customer_id?: number | string; return_no?: string; page?: number }
    >({
      query: (params) => ({
        url: "/pos/returns",
        params,
      }),
      providesTags: ["SaleReturns"],
    }),

    createSaleReturn: builder.mutation<
      { success: boolean; message: string; data: unknown },
      Record<string, unknown>
    >({
      query: (body) => ({
        url: "/pos/returns",
        method: "POST",
        body,
      }),
      invalidatesTags: [
        "Reports",
        "Dashboard",
        "SaleReturns",
        "Sales",
        "Products",
        "PosBootstrap",
      ],
    }),

    // Marketers
    getMarketers: builder.query<
      { success: boolean; data: MarketerRecord[] },
      void
    >({
      query: () => "/pos/marketers",
      providesTags: ["Marketers"],
    }),

    createMarketer: builder.mutation<
      { success: boolean; message: string; data: unknown },
      Record<string, unknown>
    >({
      query: (body) => ({
        url: "/pos/marketers",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Reports", "Dashboard", "Marketers", "PosBootstrap"],
    }),

    createMarketerPayment: builder.mutation<
      { success: boolean; message: string; data: unknown },
      Record<string, unknown>
    >({
      query: (body) => ({
        url: "/pos/marketers/payments",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Reports", "Dashboard", "Marketers"],
    }),

    // Stock Transfers
    getStockTransfers: builder.query<
      { success: boolean; data: Page<TransferRecord> },
      { page?: number } | void
    >({
      query: (params) => ({
        params: params || undefined,
        url: "/pos/transfers",
      }),
      providesTags: ["Transfers"],
    }),

    createStockTransfer: builder.mutation<
      { success: boolean; message: string; data: unknown },
      Record<string, unknown>
    >({
      query: (body) => ({
        url: "/pos/transfers",
        method: "POST",
        body,
      }),
      invalidatesTags: [
        "Reports",
        "Dashboard",
        "Transfers",
        "Products",
        "PosBootstrap",
      ],
    }),

    // Wastages
    getWastages: builder.query<
      { success: boolean; data: Page<WastageRecord> },
      { page?: number } | void
    >({
      query: (params) => ({
        params: params || undefined,
        url: "/pos/wastages",
      }),
      providesTags: ["Wastages"],
    }),

    createWastage: builder.mutation<
      { success: boolean; message: string; data: unknown },
      Record<string, unknown>
    >({
      query: (body) => ({
        url: "/pos/wastages",
        method: "POST",
        body,
      }),
      invalidatesTags: [
        "Reports",
        "Dashboard",
        "Wastages",
        "Products",
        "PosBootstrap",
      ],
    }),

    // Suppliers & Customers
    createSupplier: builder.mutation<
      { success: boolean; message: string; data: unknown },
      Record<string, unknown>
    >({
      query: (body) => ({
        url: "/pos/suppliers",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Reports", "Dashboard", "PosBootstrap"],
    }),

    importSuppliers: builder.mutation<
      { success: boolean; data: { imported: number } },
      FormData
    >({
      query: (body) => ({ url: "/pos/suppliers/import", method: "POST", body }),
      invalidatesTags: ["PosBootstrap", "Dashboard", "Reports"],
    }),
    importCustomers: builder.mutation<
      { success: boolean; data: { imported: number } },
      FormData
    >({
      query: (body) => ({ url: "/pos/customers/import", method: "POST", body }),
      invalidatesTags: ["PosBootstrap", "Dashboard", "Reports"],
    }),

    createCustomer: builder.mutation<
      { success: boolean; message: string; data: unknown },
      Record<string, unknown>
    >({
      query: (body) => ({
        url: "/pos/customers",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Reports", "Dashboard", "PosBootstrap"],
    }),

    getCustomerCategories: builder.query<
      { success: boolean; data: CustomerCategory[] },
      void
    >({
      query: () => "/pos/customer-categories",
    }),

    // Reports
    getReports: builder.query<
      {
        success: boolean;
        message: string;
        data: Record<string, unknown> | Record<string, unknown>[];
      },
      {
        type: string;
        threshold?: number;
        date?: string;
        customer_id?: number;
        supplier_id?: number;
      }
    >({
      query: (params) => ({
        url: "/pos/reports",
        params,
      }),
      providesTags: ["Reports"],
    }),

    // Purchase Returns (Vendor debit note)
    getPurchaseReturns: builder.query<
      { success: boolean; data: Page<PurchaseReturnRecord> },
      { page?: number; supplier_id?: number; return_no?: string } | void
    >({
      query: (params) => ({
        url: "/pos/purchases/returns",
        params: params || undefined,
      }),
      providesTags: ["PurchaseReturns"],
    }),

    createPurchaseReturn: builder.mutation<
      { success: boolean; message: string; data: unknown },
      Record<string, unknown>
    >({
      query: (body) => ({
        url: "/pos/purchases/returns",
        method: "POST",
        body,
      }),
      invalidatesTags: [
        "Reports",
        "Dashboard",
        "PurchaseReturns",
        "Purchases",
        "Products",
        "PosBootstrap",
      ],
    }),

    // General Expenses
    getExpenses: builder.query<
      { success: boolean; data: Page<ExpenseRecord> },
      { page?: number; category?: string; date?: string } | void
    >({
      query: (params) => ({
        url: "/pos/expenses",
        params: params || undefined,
      }),
      providesTags: ["Expenses"],
    }),

    createExpense: builder.mutation<
      { success: boolean; message: string; data: unknown },
      Record<string, unknown>
    >({
      query: (body) => ({
        url: "/pos/expenses",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Reports", "Dashboard", "Expenses", "PosBootstrap"],
    }),

    // Account Transfers
    getAccountTransfers: builder.query<
      { success: boolean; data: Page<AccountTransferRecord> },
      { page?: number } | void
    >({
      query: (params) => ({
        params: params || undefined,
        url: "/pos/accounts/transfers",
      }),
      providesTags: ["AccountTransfers"],
    }),

    createAccountTransfer: builder.mutation<
      { success: boolean; message: string; data: unknown },
      Record<string, unknown>
    >({
      query: (body) => ({
        url: "/pos/accounts/transfers",
        method: "POST",
        body,
      }),
      invalidatesTags: [
        "Reports",
        "Dashboard",
        "AccountTransfers",
        "PosBootstrap",
      ],
    }),
  }),
  overrideExisting: process.env.NODE_ENV === "development",
});

export const {
  useCreateProductMutation,
  useUpdateProductMutation,
  useAdjustStockMutation,
  useGetStockAdjustmentsQuery,
  useGetBootstrapDataQuery,
  useLazySearchProductsQuery,
  useCreateSaleMutation,
  useGetSalesQuery,
  useGetHeldSalesQuery,
  useResumeSaleMutation,
  useCreateCollectionMutation,
  useGetCollectionsQuery,
  useGetDashboardQuery,
  // ERP Module Hooks
  useGetPurchasesQuery,
  useCreatePurchaseMutation,
  useGetSupplierPaymentsQuery,
  useCreateSupplierPaymentMutation,
  useGetSaleReturnsQuery,
  useCreateSaleReturnMutation,
  useGetMarketersQuery,
  useCreateMarketerMutation,
  useCreateMarketerPaymentMutation,
  useGetStockTransfersQuery,
  useCreateStockTransferMutation,
  useGetWastagesQuery,
  useCreateWastageMutation,
  useCreateSupplierMutation,
  useCreateCustomerMutation,
  useImportCustomersMutation,
  useImportSuppliersMutation,
  useGetCustomerCategoriesQuery,
  useGetReportsQuery,
  useGetPurchaseReturnsQuery,
  useCreatePurchaseReturnMutation,
  useGetExpensesQuery,
  useCreateExpenseMutation,
  useGetAccountTransfersQuery,
  useCreateAccountTransferMutation,
} = posApi;
