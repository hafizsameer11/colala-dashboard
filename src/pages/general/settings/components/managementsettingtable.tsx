import React, { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import images from "../../../../constants/images";
import { getProfilePictureUrl } from "../../../../utils/imageUtils";
import { assignUserRoles, getAllRoles } from "../../../../utils/queries/rbac";
import { useToast } from "../../../../contexts/ToastContext";
import { apiCall } from "../../../../utils/customApiCall";
import { API_ENDPOINTS } from "../../../../config/apiConfig";
import Cookies from "js-cookie";

interface Admin {
  id: number;
  full_name: string;
  user_name?: string | null;
  email: string;
  phone: string;
  profile_picture: string | null;
  role: "admin" | "moderator" | "super_admin";
  is_active: boolean | number; // API returns 1/0, but we'll convert to boolean
  wallet_balance: string;
  created_at: string;
}

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  total: number;
  perPage: number;
  onPageChange: (page: number) => void;
}

interface ManagementSettingTableProps {
  title?: string;
  users: Admin[];
  onRowSelect?: (selectedIds: string[]) => void;
  onAdminDetails?: (admin: Admin) => void;
  onAdminUpdated?: () => void;
  newAdmin?: {
    name: string;
    email: string;
    password: string;
    role: string;
  } | null;
  searchTerm?: string;
  pagination?: PaginationProps;
}

const ManagementSettingTable: React.FC<ManagementSettingTableProps> = ({
  users,
  onRowSelect,
  onAdminDetails,
  onAdminUpdated,
  searchTerm = "",
  pagination,
}) => {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const [editFormData, setEditFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    role: "" as "admin" | "moderator" | "super_admin",
  });
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  // Fetch all available roles for the dropdown
  const { data: rolesData } = useQuery({
    queryKey: ['allRoles'],
    queryFn: getAllRoles,
    staleTime: 5 * 60 * 1000,
  });

  const availableRoles = rolesData?.data || [];

  // Keep selected rows valid if users list changes
  useEffect(() => {
    if (selectedRows.length === 0) return;
    const ids = new Set(users.map((u) => u.id.toString()));
    setSelectedRows((prev) => prev.filter((id) => ids.has(id)));
  }, [users]);

  // No need to handle newAdmin here since we're using real API data

  // Normalize users data - convert is_active from number to boolean
  const normalizedUsers = useMemo(() => {
    return users.map((user) => ({
      ...user,
      is_active: typeof user.is_active === 'number' ? user.is_active === 1 : user.is_active,
    }));
  }, [users]);

  // Filtering (case-insensitive, multiple fields)
  const filteredUsers = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return normalizedUsers;
    return normalizedUsers.filter((user) => {
      const haystack = [
        user.full_name,
        user.user_name || '',
        user.role,
        user.email,
        user.phone,
        user.created_at,
        user.is_active ? 'active' : 'inactive',
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [normalizedUsers, searchTerm]);

  // Keep select-all in sync for filtered view
  useEffect(() => {
    const filteredIds = new Set(filteredUsers.map((u) => u.id.toString()));
    const visibleSelected = selectedRows.filter((id) => filteredIds.has(id));
    setSelectAll(
      filteredUsers.length > 0 &&
        visibleSelected.length === filteredUsers.length
    );
  }, [filteredUsers, selectedRows]);

  const handleSelectAll = () => {
    if (selectAll) {
      const filteredIds = new Set(filteredUsers.map((u) => u.id.toString()));
      const remaining = selectedRows.filter((id) => !filteredIds.has(id));
      setSelectedRows(remaining);
      onRowSelect?.(remaining);
      setSelectAll(false);
    } else {
      const allVisible = filteredUsers.map((u) => u.id.toString());
      const unique = Array.from(new Set([...selectedRows, ...allVisible]));
      setSelectedRows(unique);
      onRowSelect?.(unique);
      setSelectAll(true);
    }
  };

  const handleRowSelect = (userId: string) => {
    setSelectedRows((prev) => {
      const next = prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId];
      onRowSelect?.(next);
      return next;
    });
  };

  const handleUserDetails = (user: Admin) => onAdminDetails?.(user);

  const handleEditClick = (user: Admin) => {
    setEditingAdmin(user);
    setEditFormData({
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    });
  };

  // Mutation to update admin user
  const updateAdminMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const token = Cookies.get('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }
      return await apiCall(
        API_ENDPOINTS.ALL_USERS.Update(editingAdmin!.id),
        'POST',
        formData,
        token
      );
    },
    onSuccess: async () => {
      showToast("Admin account updated successfully", "success");
      // Update role via RBAC if role changed
      if (editingAdmin && editFormData.role !== editingAdmin.role) {
        const role = availableRoles.find((r: any) => r.slug === editFormData.role);
        if (role) {
          try {
            await assignUserRoles(editingAdmin.id, [role.id]);
          } catch (error) {
            console.error("Failed to update role:", error);
          }
        }
      }
      setEditingAdmin(null);
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      onAdminUpdated?.();
    },
    onError: (error: any) => {
      console.error("Update admin error:", error);
      showToast(error?.message || "Failed to update admin account", "error");
    },
  });

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAdmin) return;
    
    const formData = new FormData();
    formData.append("full_name", editFormData.full_name);
    formData.append("email", editFormData.email);
    formData.append("phone", editFormData.phone);
    formData.append("role", editFormData.role);
    updateAdminMutation.mutate(formData);
  };

  return (
    <div className="border border-[#989898] rounded-2xl w-full mt-4 mb-4">
      <div className="bg-white p-5 rounded-t-2xl font-semibold text-[16px] border-b border-[#989898]">
        Admins
      </div>
      <div className="bg-white rounded-b-2xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#F2F2F2]">
            <tr>
              <th className="text-center p-3 font-semibold text-[14px] w-12">
                <input
                  type="checkbox"
                  checked={selectAll && filteredUsers.length > 0}
                  onChange={handleSelectAll}
                  className="w-5 h-5 border border-gray-300 rounded cursor-pointer"
                />
              </th>
              <th className="text-left p-3 font-normal">User Name</th>
              <th className="text-left p-3 font-normal">Email</th>
              <th className="text-left p-3 font-normal">Role</th>
              <th className="text-left p-3 font-normal">Phone</th>
              <th className="text-left p-3 font-normal">Date Joined</th>
              <th className="text-center p-3 font-normal">Status</th>
              <th className="text-center p-3 font-normal">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-6 text-center text-gray-500">
                  No results found.
                </td>
              </tr>
            ) : (
              filteredUsers.map((user, index) => (
                <tr
                  key={user.id}
                  className={`border-t border-[#E5E5E5] transition-colors ${
                    index === filteredUsers.length - 1 ? "" : "border-b"
                  }`}
                >
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(user.id.toString())}
                      onChange={() => handleRowSelect(user.id.toString())}
                      className="w-5 h-5 border border-gray-300 rounded cursor-pointer"
                    />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={getProfilePictureUrl(user.profile_picture, images.admin)}
                        alt={user.full_name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="flex flex-col">
                        <span className="text-black font-medium">
                          {user.full_name}
                        </span>
                        {user.user_name && (
                          <span className="text-xs text-gray-500">
                            @{user.user_name}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-black">{user.email}</td>
                  <td className="p-4 text-black capitalize">{user.role}</td>
                  <td className="p-4 text-black">{user.phone}</td>
                  <td className="p-4 text-black">{user.created_at}</td>
                  <td className="p-4">
                    <div className="flex items-center justify-center">
                      <div
                        className={`w-5 h-5 rounded-full ${
                          user.is_active
                            ? "bg-[#008000]"
                            : "bg-red-500"
                        }`}
                      />
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-end items-center gap-2">
                      <button
                        onClick={() => handleEditClick(user)}
                        className="p-2 rounded-lg font-medium transition-colors cursor-pointer bg-blue-500 text-white hover:bg-blue-600"
                        title="Edit Admin"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleUserDetails(user)}
                        className="px-6 py-2.5 rounded-lg font-medium transition-colors cursor-pointer bg-[#E53E3E] text-white hover:bg-[#D32F2F]"
                      >
                        User Details
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between p-4 bg-white border-t border-gray-200">
          <div className="text-sm text-gray-700">
            Showing {((pagination.currentPage - 1) * pagination.perPage) + 1} to{' '}
            {Math.min(pagination.currentPage * pagination.perPage, pagination.total)} of{' '}
            {pagination.total} results
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="px-3 py-2 text-sm">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            <button
              onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Edit Admin Modal */}
      {editingAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Edit Admin Account</h2>
                <button
                  onClick={() => setEditingAdmin(null)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={editFormData.full_name}
                  onChange={(e) => setEditFormData({ ...editFormData, full_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53E3E]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53E3E]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53E3E]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <select
                  value={editFormData.role}
                  onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value as "admin" | "moderator" | "super_admin" })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53E3E] capitalize"
                  required
                >
                  {availableRoles
                    .filter((r: any) => r.is_active)
                    .map((role: any) => (
                      <option key={role.id} value={role.slug}>
                        {role.name}
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setEditingAdmin(null)}
                  className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  disabled={updateAdminMutation.isPending}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#E53E3E] text-white rounded-lg hover:bg-[#D32F2F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={updateAdminMutation.isPending}
                >
                  {updateAdminMutation.isPending ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagementSettingTable;
