"use client";
import { errorMessage } from "@/lib/pos";

import React, { useState } from "react";
import toast from "react-hot-toast";
import {
  ShieldCheck,
  Shield,
  Users,
  Plus,
  Key,
  Save,
  AlertCircle,
} from "lucide-react";
import {
  useGetDesignationsQuery,
  useGetAllPermissionsQuery,
  useUpdateDesignationPermissionsMutation,
  useCreateDesignationMutation,
  useGetUsersQuery,
  useUpdateUserDesignationMutation,
} from "@/redux/api/rbacApi";
import { useRegisterMutation } from "@/redux/api/authApi";
import { Badge } from "@/components/ui/badge";
import { UserPlus } from "lucide-react";

export function DesignationManager() {
  const { data: designationsData, refetch: refetchDesignations } =
    useGetDesignationsQuery();
  const { data: permissionsData } = useGetAllPermissionsQuery();
  const { data: usersData, refetch: refetchUsers } = useGetUsersQuery();

  const [updatePermissions, { isLoading: isUpdating }] =
    useUpdateDesignationPermissionsMutation();
  const [createDesignation, { isLoading: isCreating }] =
    useCreateDesignationMutation();
  const [updateUserDesignation] = useUpdateUserDesignationMutation();
  const [registerUser, { isLoading: isRegistering }] = useRegisterMutation();

  const [selectedDesignationId, setSelectedDesignationId] = useState<number>(1);
  const [customPermissionIds, setCustomPermissionIds] = useState<
    number[] | null
  >(null);

  // New Designation Form
  const [showNewModal, setShowNewModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [newDesc, setNewDesc] = useState("");

  // Internal User Registration Form (Only from inside webapp by logged in user)
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regDesignationId, setRegDesignationId] = useState<number | "">("");

  const designations = designationsData?.data || [];
  const permissionsByModule = permissionsData?.data || {};
  const users = usersData?.data || [];

  const currentDesignation =
    designations.find((d) => d.id === selectedDesignationId) || designations[0];

  // Derive active permissions without calling setState inside an effect
  const activePermissionIds =
    customPermissionIds !== null
      ? customPermissionIds
      : currentDesignation?.permissions.map((p) => p.id) || [];

  const handleSelectDesignation = (id: number) => {
    setSelectedDesignationId(id);
    setCustomPermissionIds(null); // Reset to designation's saved permissions
  };

  const handleTogglePermission = (permId: number) => {
    if (currentDesignation?.slug === "admin") {
      toast("Admin designation has unrestricted access to all permissions.", {
        icon: "ℹ️",
      });
      return;
    }

    setCustomPermissionIds((prev) => {
      const current =
        prev !== null
          ? prev
          : currentDesignation?.permissions.map((p) => p.id) || [];
      return current.includes(permId)
        ? current.filter((id) => id !== permId)
        : [...current, permId];
    });
  };

  const handleSavePermissions = async () => {
    if (!currentDesignation) return;

    try {
      const res = await updatePermissions({
        designationId: currentDesignation.id,
        permission_ids: activePermissionIds,
      }).unwrap();

      toast.success(res.message || "Permissions updated successfully!");
      setCustomPermissionIds(null);
      refetchDesignations();
    } catch {
      toast.error("Failed to update designation permissions.");
    }
  };

  const handleCreateNew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newSlug.trim()) {
      toast.error("Name and Slug are required.");
      return;
    }

    try {
      await createDesignation({
        name: newName,
        slug: newSlug.toLowerCase().replace(/\s+/g, "-"),
        description: newDesc,
        permission_ids: [],
      }).unwrap();

      toast.success("New designation created successfully!");
      setNewName("");
      setNewSlug("");
      setNewDesc("");
      setShowNewModal(false);
      refetchDesignations();
    } catch {
      toast.error("Failed to create designation.");
    }
  };

  const handleAssignUser = async (userId: number, designationId: number) => {
    try {
      await updateUserDesignation({
        userId,
        designation_id: designationId,
      }).unwrap();
      toast.success("User designation updated successfully!");
      refetchUsers();
    } catch {
      toast.error("Failed to update user designation.");
    }
  };

  const handleRegisterUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim() || !regPassword.trim()) {
      toast.error("All registration fields are required.");
      return;
    }

    try {
      const res = await registerUser({
        name: regName,
        email: regEmail,
        password: regPassword,
      }).unwrap();

      const createdUserId = res?.data?.user?.id;
      if (createdUserId && regDesignationId) {
        await updateUserDesignation({
          userId: createdUserId,
          designation_id: Number(regDesignationId),
        }).unwrap();
      }

      toast.success(`Staff account for ${regName} registered successfully!`);
      setShowRegisterModal(false);
      setRegName("");
      setRegEmail("");
      setRegPassword("");
      setRegDesignationId("");
      refetchUsers();
    } catch (err: unknown) {
      toast.error(errorMessage(err, "Failed to register staff account."));
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 px-5 py-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-50 text-purple-700 border border-purple-200">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-wide">
              Designations & Permission Control (RBAC)
            </h2>
            <p className="text-xs text-slate-600 font-medium">
              Grant or revoke specific module permissions per employee
              designation.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow-sm transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Designation</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Designations List (col 4) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                System Designations
              </span>
              <span className="text-xs text-purple-700 font-mono font-bold">
                {designations.length} Roles
              </span>
            </div>

            <div className="space-y-2">
              {designations.map((desig) => {
                const isSelected = desig.id === currentDesignation?.id;
                return (
                  <button
                    key={desig.id}
                    type="button"
                    onClick={() => handleSelectDesignation(desig.id)}
                    className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-purple-50 border-purple-500 text-purple-950 shadow-sm"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm text-slate-900">
                        {desig.name}
                      </span>
                      <Badge
                        variant={desig.slug === "admin" ? "rose" : "indigo"}
                      >
                        {desig.slug === "admin" ? "Super Admin" : "Designation"}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-1">
                      {desig.description || "Custom operational role"}
                    </p>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                      <span>{desig.permissions?.length || 0} Permissions</span>
                      <span>{desig.users_count || 0} Staff assigned</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Permission Matrix (col 8) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            {/* Designation Header & Save Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-purple-700" />
                  <h3 className="font-bold text-base text-slate-900">
                    Permissions for:{" "}
                    <span className="text-purple-700">
                      {currentDesignation?.name}
                    </span>
                  </h3>
                </div>
                <p className="text-xs text-slate-600 mt-0.5 font-medium">
                  Check or uncheck boxes below to grant or revoke specific
                  authority.
                </p>
              </div>

              <button
                type="button"
                disabled={isUpdating || currentDesignation?.slug === "admin"}
                onClick={handleSavePermissions}
                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs shadow-sm transition cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{isUpdating ? "Saving..." : "Save Permissions"}</span>
              </button>
            </div>

            {currentDesignation?.slug === "admin" && (
              <div className="p-3 rounded-lg bg-purple-50 border border-purple-200 text-xs text-purple-900 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-purple-700 shrink-0" />
                <span>
                  The <strong>Admin</strong> designation possesses full,
                  unrevokable root authority over all application subsystems.
                </span>
              </div>
            )}

            {/* Permissions Grouped by Module */}
            <div className="space-y-4">
              {Object.entries(permissionsByModule).map(
                ([moduleName, perms]) => (
                  <div
                    key={moduleName}
                    className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-purple-800 uppercase tracking-wider">
                        Module: {moduleName}
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium">
                        {perms.length} features
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {perms.map((perm) => {
                        const isChecked =
                          currentDesignation?.slug === "admin" ||
                          activePermissionIds.includes(perm.id);

                        return (
                          <label
                            key={perm.id}
                            className={`flex items-start gap-2.5 p-2.5 rounded-lg border transition-all cursor-pointer ${
                              isChecked
                                ? "bg-white border-purple-500 text-slate-900 shadow-sm"
                                : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              disabled={currentDesignation?.slug === "admin"}
                              onChange={() => handleTogglePermission(perm.id)}
                              className="accent-purple-600 w-4 h-4 mt-0.5"
                            />
                            <div>
                              <span className="font-bold text-xs block text-slate-900">
                                {perm.name}
                              </span>
                              <span className="text-[10px] text-purple-700 block font-mono font-semibold">
                                {perm.slug}
                              </span>
                              {perm.description && (
                                <span className="text-[11px] text-slate-600 block mt-0.5">
                                  {perm.description}
                                </span>
                              )}
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>

          {/* User Staff Assignment Table */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-teal-700" />
                <h3 className="font-bold text-sm text-slate-900">
                  Staff Designation Assignments
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowRegisterModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Register New Staff User</span>
              </button>
            </div>
            <p className="text-xs text-slate-600 font-medium">
              Register new staff accounts and assign roles. Registration can
              only be performed from inside this webapp by an authenticated
              administrator.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Staff Name</th>
                    <th className="py-2.5 px-3">Email</th>
                    <th className="py-2.5 px-3">Current Designation</th>
                    <th className="py-2.5 px-3 text-center">Change Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50 transition">
                      <td className="py-2 px-3 font-bold text-slate-900">
                        {u.name}
                      </td>
                      <td className="py-2 px-3 font-mono text-slate-600">
                        {u.email}
                      </td>
                      <td className="py-2 px-3">
                        <Badge
                          variant={
                            u.designation?.slug === "admin" ? "rose" : "indigo"
                          }
                        >
                          {u.designation?.name || "Unassigned"}
                        </Badge>
                      </td>
                      <td className="py-2 px-3 text-center">
                        <select
                          value={u.designation_id ?? ""}
                          onChange={(e) =>
                            handleAssignUser(u.id, Number(e.target.value))
                          }
                          className="h-7 px-2 rounded-lg bg-slate-50 border border-slate-300 text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-purple-600"
                        >
                          {designations.map((d) => (
                            <option key={d.id} value={d.id}>
                              {d.name}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Add New Designation Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <form
            onSubmit={handleCreateNew}
            className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-purple-700" />
                <h3 className="font-bold text-base text-slate-900">
                  Create Designation
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-800 font-semibold mb-1">
                  Designation Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Cashier"
                  value={newName}
                  onChange={(e) => {
                    setNewName(e.target.value);
                    if (!newSlug) {
                      setNewSlug(
                        e.target.value.toLowerCase().replace(/\s+/g, "-"),
                      );
                    }
                  }}
                  className="w-full h-9 px-3 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-purple-600"
                />
              </div>

              <div>
                <label className="block text-slate-800 font-semibold mb-1">
                  Unique Slug Identifier *
                </label>
                <input
                  type="text"
                  required
                  placeholder="senior-cashier"
                  value={newSlug}
                  onChange={(e) => setNewSlug(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-purple-600"
                />
              </div>

              <div>
                <label className="block text-slate-800 font-semibold mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Responsibilities and access scope..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-purple-600"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreating}
                className="px-5 py-2 rounded-lg bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold shadow-sm cursor-pointer"
              >
                {isCreating ? "Creating..." : "Save Designation"}
              </button>
            </div>
          </form>
        </div>
      )}
      {/* Register New Staff Member Modal (Internal Registration Only) */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <form
            onSubmit={handleRegisterUser}
            className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-teal-600" />
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    Register Staff Account
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Internal authorization and staff account creation
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowRegisterModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-800 font-semibold mb-1">
                  Full Staff Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tanvir Ahmed"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-teal-600"
                />
              </div>

              <div>
                <label className="block text-slate-800 font-semibold mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="tanvir@smartpos.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-teal-600"
                />
              </div>

              <div>
                <label className="block text-slate-800 font-semibold mb-1">
                  Temporary Password *
                </label>
                <input
                  type="password"
                  required
                  placeholder="Minimum 8 characters"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-teal-600"
                />
              </div>

              <div>
                <label className="block text-slate-800 font-semibold mb-1">
                  Assigned Designation / Role
                </label>
                <select
                  value={regDesignationId}
                  onChange={(e) =>
                    setRegDesignationId(
                      e.target.value ? Number(e.target.value) : "",
                    )
                  }
                  className="w-full h-9 px-3 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 font-semibold focus:bg-white focus:outline-none focus:border-teal-600"
                >
                  <option value="">-- Choose Designation --</option>
                  {designations.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.slug})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowRegisterModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isRegistering}
                className="px-5 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-sm transition cursor-pointer disabled:opacity-50"
              >
                {isRegistering ? "Registering..." : "Create Account"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
