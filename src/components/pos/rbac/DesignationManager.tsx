"use client";
import { useState } from "react";
import {
  ShieldCheck,
  Users,
  Plus,
  Save,
  UserPlus,
  Search,
  Check,
} from "lucide-react";
import toast from "react-hot-toast";
import { errorMessage } from "@/lib/pos";
import {
  useGetDesignationsQuery,
  useGetAllPermissionsQuery,
  useUpdateDesignationPermissionsMutation,
  useCreateDesignationMutation,
  useGetUsersQuery,
  useUpdateUserDesignationMutation,
} from "@/redux/api/rbacApi";
import { useRegisterMutation } from "@/redux/api/authApi";
import { Modal } from "../shared/Modal";
import { QueryState } from "../shared/QueryState";

export function DesignationManager({
  canManageUsers,
}: {
  canManageUsers: boolean;
}) {
  const roles = useGetDesignationsQuery();
  const permissions = useGetAllPermissionsQuery();
  const staff = useGetUsersQuery(undefined, { skip: !canManageUsers });
  const [updatePermissions, { isLoading: saving }] =
    useUpdateDesignationPermissionsMutation();
  const [createRole, { isLoading: creating }] = useCreateDesignationMutation();
  const [assignRole, { isLoading: assigning }] =
    useUpdateUserDesignationMutation();
  const [register, { isLoading: registering }] = useRegisterMutation();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [draft, setDraft] = useState<number[] | null>(null);
  const [roleOpen, setRoleOpen] = useState(false);
  const [staffOpen, setStaffOpen] = useState(false);
  const [roleForm, setRoleForm] = useState({
    name: "",
    slug: "",
    description: "",
  });
  const [staffForm, setStaffForm] = useState({
    name: "",
    email: "",
    password: "",
    designation_id: "",
  });
  const [search, setSearch] = useState("");
  const designations = roles.data?.data || [];
  const current =
    designations.find((role) => role.id === selectedId) || designations[0];
  const selected =
    draft ?? current?.permissions.map((permission) => permission.id) ?? [];
  const isAdmin = current?.slug === "admin";
  const users = (staff.data?.data || []).filter((user) =>
    `${user.name} ${user.email}`.toLowerCase().includes(search.toLowerCase()),
  );
  const savePermissions = async () => {
    if (!current || saving) return;
    try {
      await updatePermissions({
        designationId: current.id,
        permission_ids: selected,
      }).unwrap();
      // Keep the local selection until the invalidated role query has caught up.
      await roles.refetch().unwrap();
      setDraft(null);
      toast.success("Permissions saved.");
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };
  const saveRole = async (event: React.FormEvent) => {
    event.preventDefault();
    if (creating) return;
    try {
      const result = await createRole({
        ...roleForm,
        name: roleForm.name.trim(),
        slug: roleForm.slug.trim().toLowerCase(),
        permission_ids: [],
      }).unwrap();
      setSelectedId(result.data.id);
      setDraft(null);
      setRoleOpen(false);
      setRoleForm({ name: "", slug: "", description: "" });
      toast.success("Role created. Select its permissions to grant access.");
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };
  const saveStaff = async (event: React.FormEvent) => {
    event.preventDefault();
    if (registering || !staffForm.designation_id) return;
    try {
      await register({
        ...staffForm,
        name: staffForm.name.trim(),
        email: staffForm.email.trim(),
        designation_id: Number(staffForm.designation_id),
      }).unwrap();
      setStaffOpen(false);
      setStaffForm({ name: "", email: "", password: "", designation_id: "" });
      toast.success("Staff account created with its assigned role.");
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };
  if (
    roles.isLoading ||
    permissions.isLoading ||
    roles.error ||
    permissions.error
  )
    return (
      <QueryState
        loading={roles.isLoading || permissions.isLoading}
        error={roles.error || permissions.error}
        retry={() => {
          void roles.refetch();
          void permissions.refetch();
        }}
      />
    );
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-[.18em] text-teal-700">
            Administration / Team access
          </p>
          <h1 className="text-2xl font-semibold text-slate-900">
            Staff & permissions
          </h1>
          <p className="mt-1 text-xs text-slate-600">
            Give every team member the right access to your business.
          </p>
        </div>
        <button
          className="pos-button-secondary"
          onClick={() => setRoleOpen(true)}
        >
          <Plus size={16} />
          Create role
        </button>
      </div>
      <div className="grid gap-5 xl:grid-cols-[300px_1fr]">
        <section className="panel self-start p-4">
          <div className="mb-4 flex items-center justify-between px-1">
            <h2 className="text-sm font-semibold">Team roles</h2>
            <span className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-600">
              {designations.length}
            </span>
          </div>
          <div className="space-y-2">
            {designations.map((role) => (
              <button
                key={role.id}
                disabled={saving}
                aria-pressed={current?.id === role.id}
                onClick={() => {
                  if (
                    draft !== null &&
                    !window.confirm("Discard unsaved permission changes?")
                  )
                    return;
                  setSelectedId(role.id);
                  setDraft(null);
                }}
                className={`w-full rounded-xl border p-4 text-left ${current?.id === role.id ? "border-teal-600 bg-teal-50" : "border-slate-200 hover:bg-slate-50"}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-slate-900">
                    {role.name}
                  </span>
                  {current?.id === role.id && (
                    <Check size={16} className="text-teal-700" />
                  )}
                </div>
                <p className="mt-2 text-xs leading-5 text-slate-600">
                  {role.description || "Custom team role"}
                </p>
                <p className="mt-3 text-[11px] text-slate-500">
                  {role.slug === "admin"
                    ? "Full access"
                    : `${role.permissions.length} permissions`}{" "}
                  · {role.users_count || 0} staff
                </p>
              </button>
            ))}
          </div>
          {!designations.length && (
            <p className="py-8 text-center text-sm text-slate-500">
              Create a role to get started.
            </p>
          )}
        </section>
        <section className="panel overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 p-5">
            <div>
              <h2 className="text-base font-semibold">
                {current?.name || "Role"} permissions
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                {isAdmin
                  ? "Administrators have access to all workspace features."
                  : "Select the actions this role can perform."}
              </p>
            </div>
            <button
              disabled={!current || isAdmin || saving || draft === null}
              className="pos-button"
              onClick={savePermissions}
            >
              <Save size={15} />
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
          {isAdmin && (
            <div className="mx-5 mt-5 flex gap-3 rounded-lg border border-teal-200 bg-teal-50 p-3 text-xs leading-5 text-teal-900">
              <ShieldCheck size={18} className="shrink-0" />
              Admin access is built in. Choose another role to customize
              permissions.
            </div>
          )}
          <div className="space-y-6 p-5">
            {Object.entries(permissions.data?.data || {}).map(
              ([module, items]) => (
                <fieldset key={module} disabled={isAdmin || saving || !current}>
                  <legend className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    {module}
                  </legend>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {items.map((permission) => (
                      <label
                        key={permission.id}
                        className={`flex items-start gap-3 rounded-lg border p-3 ${isAdmin || selected.includes(permission.id) ? "border-teal-200 bg-teal-50/40" : "border-slate-200"}`}
                      >
                        <input
                          type="checkbox"
                          className="mt-0.5 size-4 shrink-0 accent-teal-700"
                          checked={isAdmin || selected.includes(permission.id)}
                          onChange={() =>
                            setDraft(
                              selected.includes(permission.id)
                                ? selected.filter((id) => id !== permission.id)
                                : [...selected, permission.id],
                            )
                          }
                        />
                        <span>
                          <span className="block text-xs font-medium text-slate-900">
                            {permission.name}
                          </span>
                          {permission.description && (
                            <span className="mt-1 block text-[11px] leading-5 text-slate-500">
                              {permission.description}
                            </span>
                          )}
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              ),
            )}
          </div>
        </section>
      </div>
      {canManageUsers && (
        <section className="panel overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-5">
            <div className="flex items-center gap-3">
              <Users size={20} className="text-teal-700" />
              <div>
                <h2 className="text-sm font-semibold">Team members</h2>
                <p className="mt-1 text-xs text-slate-500">
                  Manage staff accounts and assigned roles.
                </p>
              </div>
            </div>
            <button className="pos-button" onClick={() => setStaffOpen(true)}>
              <UserPlus size={16} />
              Add staff member
            </button>
          </div>
          {staff.isLoading || staff.error ? (
            <QueryState
              loading={staff.isLoading}
              error={staff.error}
              retry={staff.refetch}
            />
          ) : (
            <>
              <div className="relative m-4 max-w-sm">
                <Search
                  size={16}
                  className="absolute left-3 top-3 text-slate-500"
                />
                <input
                  aria-label="Search staff"
                  placeholder="Search name or email"
                  className="pos-field !pl-9"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>
              <div className="overflow-x-auto">
                <table className="pos-table">
                  <thead>
                    <tr>
                      <th>Team member</th>
                      <th>Email address</th>
                      <th>Assigned role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td className="font-medium whitespace-nowrap">
                          {user.name}
                        </td>
                        <td>{user.email}</td>
                        <td>
                          <select
                            aria-label={`Role for ${user.name}`}
                            className="pos-field min-w-40"
                            disabled={assigning}
                            value={user.designation_id ?? ""}
                            onChange={async (event) => {
                              try {
                                await assignRole({
                                  userId: user.id,
                                  designation_id: Number(event.target.value),
                                }).unwrap();
                                toast.success("Staff role updated.");
                              } catch (error) {
                                toast.error(errorMessage(error));
                              }
                            }}
                          >
                            <option value="" disabled>
                              Unassigned
                            </option>
                            {designations.map((role) => (
                              <option key={role.id} value={role.id}>
                                {role.name}
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                    {!users.length && (
                      <tr>
                        <td colSpan={3} className="text-center">
                          No matching team members.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>
      )}
      {roleOpen && (
        <Modal
          title="Create team role"
          onClose={() => {
            if (!creating) setRoleOpen(false);
          }}
        >
          <form className="space-y-4" onSubmit={saveRole}>
            <label className="block">
              <span className="pos-label">Role name</span>
              <input
                autoFocus
                required
                maxLength={100}
                className="pos-field"
                value={roleForm.name}
                onChange={(event) =>
                  setRoleForm({
                    ...roleForm,
                    name: event.target.value,
                    slug: event.target.value
                      .toLowerCase()
                      .trim()
                      .replace(/[^a-z0-9]+/g, "-"),
                  })
                }
                placeholder="e.g. Store supervisor"
              />
            </label>
            <label className="block">
              <span className="pos-label">Role identifier</span>
              <input
                required
                pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                maxLength={100}
                className="pos-field"
                value={roleForm.slug}
                onChange={(event) =>
                  setRoleForm({ ...roleForm, slug: event.target.value })
                }
              />
            </label>
            <label className="block">
              <span className="pos-label">Description</span>
              <textarea
                className="pos-field"
                rows={3}
                value={roleForm.description}
                onChange={(event) =>
                  setRoleForm({ ...roleForm, description: event.target.value })
                }
              />
            </label>
            <button disabled={creating} className="pos-button w-full">
              {creating ? "Creating…" : "Create role"}
            </button>
          </form>
        </Modal>
      )}
      {staffOpen && (
        <Modal
          title="Add staff member"
          onClose={() => {
            if (!registering) setStaffOpen(false);
          }}
        >
          <form className="space-y-4" onSubmit={saveStaff}>
            <label className="block">
              <span className="pos-label">Full name</span>
              <input
                autoFocus
                required
                maxLength={120}
                className="pos-field"
                autoComplete="name"
                value={staffForm.name}
                onChange={(event) =>
                  setStaffForm({ ...staffForm, name: event.target.value })
                }
              />
            </label>
            <label className="block">
              <span className="pos-label">Email address</span>
              <input
                type="email"
                required
                maxLength={255}
                autoComplete="email"
                className="pos-field"
                value={staffForm.email}
                onChange={(event) =>
                  setStaffForm({ ...staffForm, email: event.target.value })
                }
              />
            </label>
            <label className="block">
              <span className="pos-label">Password</span>
              <input
                type="password"
                required
                minLength={8}
                pattern="(?=.*[A-Za-z])(?=.*[0-9]).{8,}"
                autoComplete="new-password"
                className="pos-field"
                value={staffForm.password}
                onChange={(event) =>
                  setStaffForm({ ...staffForm, password: event.target.value })
                }
              />
              <span className="mt-1 block text-xs text-slate-500">
                At least 8 characters, including a letter and a number.
              </span>
            </label>
            <label className="block">
              <span className="pos-label">Assigned role</span>
              <select
                required
                className="pos-field"
                value={staffForm.designation_id}
                onChange={(event) =>
                  setStaffForm({
                    ...staffForm,
                    designation_id: event.target.value,
                  })
                }
              >
                <option value="">Choose a role</option>
                {designations.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </label>
            <button disabled={registering} className="pos-button w-full">
              {registering ? "Creating…" : "Create staff account"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
