import React, { useEffect, useMemo, useState } from "react";
import images from "../../../../constants/images";
import { getProfilePictureUrl } from "../../../../utils/imageUtils";

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
  newAdmin,
  searchTerm = "",
  pagination,
}) => {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);

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

  // No edit functionality needed for real API data

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
    </div>
  );
};

export default ManagementSettingTable;
