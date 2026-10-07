import { baseApi } from "./baseApi";

export interface Outlet {
  id: number;
  name: string;
  code: string;
  address?: string;
}

export interface Supplier {
  id: number;
  name: string;
  code: string;
  phone?: string;
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
  supplier_id?: number;
  name: string;
  code: string;
  barcode: string;
  available_qty: number;
  unit_price: string | number;
  cost_price: string | number;
  unit: string;
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
      sms_info: { balance: number; credit_limit: number };
      available_amount: number;
    };
    accounts: FinancialAccount[];
    recent_sales: SaleRecord[];
  };
}

export const posApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
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
      invalidatesTags: ["PosBootstrap", "Products", "Sales", "HeldSales", "Dashboard"],
    }),

    getSales: builder.query<
      { success: boolean; data: { data: SaleRecord[]; total: number } },
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

    getHeldSales: builder.query<{ success: boolean; data: SaleRecord[] }, void>({
      query: () => "/pos/sales/held",
      providesTags: ["HeldSales"],
    }),

    resumeSale: builder.mutation<
      { success: boolean; message: string; data: SaleRecord },
      number
    >({
      query: (id) => ({
        url: `/pos/sales/held/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["HeldSales", "PosBootstrap"],
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
      invalidatesTags: ["Collections", "PosBootstrap", "Dashboard"],
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
      { success: boolean; data: { data: any[]; total: number } },
      { supplier_id?: number | string; chalan_no?: string; page?: number }
    >({
      query: (params) => ({
        url: "/pos/purchases",
        params,
      }),
      providesTags: ["Purchases"],
    }),

    createPurchase: builder.mutation<
      { success: boolean; message: string; data: any },
      any
    >({
      query: (body) => ({
        url: "/pos/purchases",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Purchases", "Products", "PosBootstrap", "Dashboard"],
    }),

    getSupplierPayments: builder.query<
      { success: boolean; data: { data: any[]; total: number } },
      void
    >({
      query: () => "/pos/purchases/payments",
      providesTags: ["SupplierPayments"],
    }),

    createSupplierPayment: builder.mutation<
      { success: boolean; message: string; data: any },
      any
    >({
      query: (body) => ({
        url: "/pos/purchases/payments",
        method: "POST",
        body,
      }),
      invalidatesTags: ["SupplierPayments", "PosBootstrap", "Dashboard"],
    }),

    // Sales Returns & Exchanges
    getSaleReturns: builder.query<
      { success: boolean; data: { data: any[]; total: number } },
      { customer_id?: number | string; return_no?: string; page?: number }
    >({
      query: (params) => ({
        url: "/pos/returns",
        params,
      }),
      providesTags: ["SaleReturns"],
    }),

    createSaleReturn: builder.mutation<
      { success: boolean; message: string; data: any },
      any
    >({
      query: (body) => ({
        url: "/pos/returns",
        method: "POST",
        body,
      }),
      invalidatesTags: ["SaleReturns", "Sales", "Products", "PosBootstrap"],
    }),

    // Marketers
    getMarketers: builder.query<{ success: boolean; data: any[] }, void>({
      query: () => "/pos/marketers",
      providesTags: ["Marketers"],
    }),

    createMarketer: builder.mutation<
      { success: boolean; message: string; data: any },
      any
    >({
      query: (body) => ({
        url: "/pos/marketers",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Marketers", "PosBootstrap"],
    }),

    createMarketerPayment: builder.mutation<
      { success: boolean; message: string; data: any },
      any
    >({
      query: (body) => ({
        url: "/pos/marketers/payments",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Marketers"],
    }),

    // Stock Transfers
    getStockTransfers: builder.query<
      { success: boolean; data: { data: any[]; total: number } },
      void
    >({
      query: () => "/pos/transfers",
      providesTags: ["Transfers"],
    }),

    createStockTransfer: builder.mutation<
      { success: boolean; message: string; data: any },
      any
    >({
      query: (body) => ({
        url: "/pos/transfers",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Transfers", "Products", "PosBootstrap"],
    }),

    // Wastages
    getWastages: builder.query<
      { success: boolean; data: { data: any[]; total: number } },
      void
    >({
      query: () => "/pos/wastages",
      providesTags: ["Wastages"],
    }),

    createWastage: builder.mutation<
      { success: boolean; message: string; data: any },
      any
    >({
      query: (body) => ({
        url: "/pos/wastages",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Wastages", "Products", "PosBootstrap"],
    }),

    // Suppliers & Customers
    createSupplier: builder.mutation<
      { success: boolean; message: string; data: any },
      any
    >({
      query: (body) => ({
        url: "/pos/suppliers",
        method: "POST",
        body,
      }),
      invalidatesTags: ["PosBootstrap"],
    }),

    createCustomer: builder.mutation<
      { success: boolean; message: string; data: any },
      any
    >({
      query: (body) => ({
        url: "/pos/customers",
        method: "POST",
        body,
      }),
      invalidatesTags: ["PosBootstrap"],
    }),

    getCustomerCategories: builder.query<
      { success: boolean; data: any[] },
      void
    >({
      query: () => "/pos/customer-categories",
    }),

    // Reports
    getReports: builder.query<
      { success: boolean; message: string; data: any },
      { type: string; threshold?: number; date?: string; customer_id?: number; supplier_id?: number }
    >({
      query: (params) => ({
        url: "/pos/reports",
        params,
      }),
      providesTags: ["Reports"],
    }),

    // Purchase Returns (Vendor debit note)
    getPurchaseReturns: builder.query<
      { success: boolean; data: any },
      { supplier_id?: number; return_no?: string } | void
    >({
      query: (params) => ({
        url: "/pos/purchases/returns",
        params: params || undefined,
      }),
      providesTags: ["PurchaseReturns"],
    }),

    createPurchaseReturn: builder.mutation<
      { success: boolean; message: string; data: any },
      any
    >({
      query: (body) => ({
        url: "/pos/purchases/returns",
        method: "POST",
        body,
      }),
      invalidatesTags: ["PurchaseReturns", "Purchases", "Products", "PosBootstrap", "Reports"],
    }),

    // General Expenses
    getExpenses: builder.query<
      { success: boolean; data: any },
      { category?: string; date?: string } | void
    >({
      query: (params) => ({
        url: "/pos/expenses",
        params: params || undefined,
      }),
      providesTags: ["Expenses"],
    }),

    createExpense: builder.mutation<
      { success: boolean; message: string; data: any },
      any
    >({
      query: (body) => ({
        url: "/pos/expenses",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Expenses", "PosBootstrap", "Reports", "Dashboard"],
    }),

    // Account Transfers
    getAccountTransfers: builder.query<
      { success: boolean; data: any },
      void
    >({
      query: () => "/pos/accounts/transfers",
      providesTags: ["AccountTransfers"],
    }),

    createAccountTransfer: builder.mutation<
      { success: boolean; message: string; data: any },
      any
    >({
      query: (body) => ({
        url: "/pos/accounts/transfers",
        method: "POST",
        body,
      }),
      invalidatesTags: ["AccountTransfers", "PosBootstrap", "Reports"],
    }),
  }),
  overrideExisting: false,
});

export const {
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
  useGetCustomerCategoriesQuery,
  useGetReportsQuery,
  useGetPurchaseReturnsQuery,
  useCreatePurchaseReturnMutation,
  useGetExpensesQuery,
  useCreateExpenseMutation,
  useGetAccountTransfersQuery,
  useCreateAccountTransferMutation,
} = posApi;

