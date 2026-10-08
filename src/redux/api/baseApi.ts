import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { getCookie } from "cookies-next";
import { saveSession, clearSession } from "@/lib/session";

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
const rawQuery = fetchBaseQuery({
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
});
let refreshPending: Promise<boolean> | null = null;
const baseQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extra) => {
  const url = typeof args === "string" ? args : args.url;
  let result = await rawQuery(args, api, extra);
  if (
    result.error?.status === 401 &&
    !url.startsWith("/auth/login") &&
    !url.startsWith("/auth/refresh") &&
    url !== "/auth/logout"
  ) {
    const refreshToken = getCookie("refresh_token");
    if (refreshToken) {
      if (!refreshPending) {
        refreshPending = (async () => {
          const response = await rawQuery(
            {
              url: "/auth/refresh",
              method: "POST",
              body: { refresh_token: refreshToken },
            },
            api,
            extra,
          );
          const body = response.data as
            | { data?: { access_token?: string; refresh_token?: string } }
            | undefined;
          if (!body?.data?.access_token) return false;
          saveSession(body.data, getCookie("remember_session") === "yes");
          return true;
        })();
      }
      const pending = refreshPending;
      let refreshed = false;
      try {
        refreshed = await pending;
      } finally {
        if (refreshPending === pending) refreshPending = null;
      }
      if (refreshed) result = await rawQuery(args, api, extra);
    }
    if (result.error?.status === 401) {
      clearSession();
      if (
        typeof window !== "undefined" &&
        window.location.pathname !== "/login"
      )
        window.location.replace("/login");
    }
  }
  const body = result.data as
    | { success?: boolean; message?: string }
    | undefined;
  if (body?.success === false)
    return {
      error: {
        status: "CUSTOM_ERROR",
        error: body.message || "Request failed",
        data: body,
      },
    };
  return result;
};

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery,
  tagTypes: [
    "StockAdjustments",
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
