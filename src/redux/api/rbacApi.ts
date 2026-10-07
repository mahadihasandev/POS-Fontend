import { baseApi } from "./baseApi";

export interface PermissionItem {
  id: number;
  name: string;
  slug: string;
  module: string;
  description?: string;
}

export interface DesignationItem {
  id: number;
  name: string;
  slug: string;
  description?: string;
  users_count?: number;
  permissions: PermissionItem[];
}

export interface UserItem {
  id: number;
  name: string;
  email: string;
  designation_id?: number | null;
  designation?: {
    id: number;
    name: string;
    slug: string;
    permissions: PermissionItem[];
  } | null;
  created_at: string;
}

export const rbacApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDesignations: builder.query<{ success: boolean; data: DesignationItem[] }, void>({
      query: () => "/rbac/designations",
      providesTags: ["Designations"],
    }),

    createDesignation: builder.mutation<
      { success: boolean; message: string; data: DesignationItem },
      { name: string; slug: string; description?: string; permission_ids?: number[] }
    >({
      query: (body) => ({
        url: "/rbac/designations",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Designations"],
    }),

    updateDesignationPermissions: builder.mutation<
      { success: boolean; message: string; data: DesignationItem },
      { designationId: number; permission_ids: number[] }
    >({
      query: ({ designationId, permission_ids }) => ({
        url: `/rbac/designations/${designationId}/permissions`,
        method: "PUT",
        body: { permission_ids },
      }),
      invalidatesTags: ["Designations", "User"],
    }),

    getAllPermissions: builder.query<
      { success: boolean; data: Record<string, PermissionItem[]> },
      void
    >({
      query: () => "/rbac/permissions",
      providesTags: ["Permissions"],
    }),

    getUsers: builder.query<{ success: boolean; data: UserItem[] }, void>({
      query: () => "/rbac/users",
      providesTags: ["User"],
    }),

    updateUserDesignation: builder.mutation<
      { success: boolean; message: string; data: UserItem },
      { userId: number; designation_id: number }
    >({
      query: ({ userId, designation_id }) => ({
        url: `/rbac/users/${userId}/designation`,
        method: "PUT",
        body: { designation_id },
      }),
      invalidatesTags: ["User", "Designations"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetDesignationsQuery,
  useCreateDesignationMutation,
  useUpdateDesignationPermissionsMutation,
  useGetAllPermissionsQuery,
  useGetUsersQuery,
  useUpdateUserDesignationMutation,
} = rbacApi;
