import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getCookie } from "cookies-next";

/**
 * Resolves the dynamic base API URL from environment variables
 * with fallback to local Laravel backend API v1 endpoint.
 */
const getBaseUrl = (): string => {
  if (typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  return "http://localhost:8000/api/v1";
};

/**
 * Base RTK Query API configuration with dynamic baseUrl,
 * automatic Bearer token injection from cookies-next,
 * and centralized cache tag registration.
 */
export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: getBaseUrl(),
    prepareHeaders: (headers) => {
      // Extract authentication token from cookies-next
      const rawToken =
        getCookie("token") ??
        getCookie("auth_token") ??
        getCookie("access_token");

      if (typeof rawToken === "string" && rawToken.trim().length > 0) {
        headers.set("Authorization", `Bearer ${rawToken.trim()}`);
      }

      headers.set("Accept", "application/json");
      return headers;
    },
  }),
  tagTypes: [
    "Auth",
    "User",
    "PosBootstrap",
    "Products",
    "Sales",
    "HeldSales",
    "Collections",
    "Dashboard",
    "Designations",
    "Permissions",
    "DriveItem",
    "Summary",
    "Purchases",
    "SupplierPayments",
    "SaleReturns",
    "Marketers",
    "Transfers",
    "Wastages",
    "Reports",
    "PurchaseReturns",
    "Expenses",
    "AccountTransfers",
  ],
  endpoints: () => ({}),
});
