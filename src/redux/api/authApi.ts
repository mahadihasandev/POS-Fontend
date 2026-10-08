import { getCookie } from "cookies-next";
import { baseApi } from "./baseApi";

export interface User {
  id: number;
  name: string;
  email: string;
  designation: { id: number; name: string; slug: string } | null;
  permissions: string[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token?: string;
    access_token?: string;
    refresh_token?: string;
    token_type?: string;
    expires_in?: number;
  };
}

/**
 * Injected RTK Query endpoints for Authentication.
 * Demonstrates code-splitting and feature-driven API slices on top of baseApi.
 */
export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["Auth", "User"],
    }),
    register: builder.mutation<
      { success: boolean; message: string; data: { user: User } },
      { name: string; email: string; password: string; designation_id?: number }
    >({
      query: (userData) => ({
        url: "/auth/register",
        method: "POST",
        body: userData,
      }),
      invalidatesTags: ["User", "Designations"],
    }),
    logout: builder.mutation<{ success: boolean; message: string }, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
        body: { refresh_token: getCookie("refresh_token") },
      }),
    }),
    getMe: builder.query<{ success: boolean; data: User }, void>({
      query: () => "/auth/me",
      providesTags: ["User"],
    }),
  }),
  overrideExisting: process.env.NODE_ENV === "development",
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useGetMeQuery,
} = authApi;
