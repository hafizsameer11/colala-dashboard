import React, { useMemo, useState, useEffect } from "react";

interface User {
  id: number;
  full_name: string;
  email: string;
  phone: string | null;
  role: string | null;
  shopping_balance: number;
  reward_balance: number;
  referral_balance: number;
  loyalty_points: number;
  escrow_balance: number;
  created_at: string;
  formatted_date: string;
}

interface Pagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

interface UsersTableProps {
  title?: string;
  onRowSelect?: (selectedIds: string[]) => void;
  filterType?: "All" | "Buyers" | "Sellers";
  searchTerm?: string;
  users?: User[];
  pagination?: Pagination;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  isLoading?: boolean;
  error?: any;
}

const UsersTable: React.FC<UsersTableProps> = ({
  title = "All Users",
  onRowSelect,
  filterType = "All",
  searchTerm = "",
  users = [],
  pagination,
  currentPage = 1,
  onPageChange,
  isLoading = false,
  error,
}) => {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  // Tab filter
  const matchesTab = (u: User) => {
    if (filterType === "All") return true;
    if (filterType === "Buyers") return u.role === "buyer";
    if (filterType === "Sellers") return u.role === "seller";
    return true;
  };

  // Search across fields (case-insensitive)
  const filteredUsers = useMemo(() => {
    const term = (searchTerm || "").toLowerCase();

    return users.filter(matchesTab).filter((u) => {
      if (!term) return true;
      const haystack = [
        u.full_name,
        u.email,
        u.phone || "",
        u.role || "",
        u.shopping_balance.toString(),
        u.escrow_balance.toString(),
        u.loyalty_points.toString(),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(term);
    });
  }, [users, filterType, searchTerm]);

  // keep selection in sync with current view
  useEffect(() => {
    setSelectAll(false);
    setSelectedRows((prev) =>
      prev.filter((id) => filteredUsers.some((u) => u.id.toString() === id))
    );
  }, [filterType, searchTerm]); // eslint-disable-line

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRows([]);
      onRowSelect?.([]);
    } else {
      const visibleIds = filteredUsers.map((u) => u.id.toString());
      setSelectedRows(visibleIds);
      onRowSelect?.(visibleIds);
    }
    setSelectAll(!selectAll);
  };

  const handleRowSelect = (id: string) => {
    const isSelected = selectedRows.includes(id);
    const newSelection = isSelected
      ? selectedRows.filter((rowId) => rowId !== id)
      : [...selectedRows, id];

    setSelectedRows(newSelection);
    setSelectAll(
      newSelection.length > 0 && newSelection.length === filteredUsers.length
    );
    onRowSelect?.(newSelection);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="border border-gray-300 rounded-2xl mt-5">
        <div className="bg-white p-5 rounded-t-2xl font-semibold text-lg border-b border-gray-300">
          {title}
        </div>
        <div className="bg-white rounded-b-2xl p-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E53E3E]"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="border border-gray-300 rounded-2xl mt-5">
        <div className="bg-white p-5 rounded-t-2xl font-semibold text-lg border-b border-gray-300">
          {title}
        </div>
        <div className="bg-white rounded-b-2xl p-8 text-center text-red-500">
          <p>Error loading users data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-gray-300 rounded-2xl mt-5">
      <div className="bg-white p-5 rounded-t-2xl font-semibold text-lg border-b border-gray-300">
        {title}
      </div>
      <div className="bg-white rounded-b-2xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#F2F2F2]">
            <tr className="text-center">
              <th className="p-3 text-left font-semibold">
                <input
                  type="checkbox"
                  checked={
                    selectAll &&
                    filteredUsers.length > 0 &&
                    selectedRows.length === filteredUsers.length
                  }
                  onChange={handleSelectAll}
                  className="w-5 h-5"
                />
              </th>
              <th className="p-3 text-left font-normal">User Name</th>
              <th className="p-3 text-left font-normal">Shopping balance</th>
              <th className="p-3 text-center font-normal">Escrow balance</th>
              <th className="p-3 text-center font-normal">Points Balance</th>
              <th className="p-3 text-center font-normal">User type</th>
              <th className="p-3 text-center font-normal">Other</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr
                key={user.id}
                className="text-center border-t border-gray-200"
              >
                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(user.id.toString())}
                    onChange={() => handleRowSelect(user.id.toString())}
                    className="w-5 h-5"
                  />
                </td>
                <td className="p-3 text-left flex items-center justify-start gap-2">
                  <img
                    src="/assets/layout/admin.png"
                    alt="User"
                    className="w-8 h-8 rounded-full"
                  />
                  <span>{user.full_name}</span>
                </td>
                <td className="p-3 text-left font-semibold">
                  ₦{user.shopping_balance.toLocaleString()}
                </td>
                <td className="p-3 font-semibold">₦{user.escrow_balance.toLocaleString()}</td>
                <td className="p-3 font-semibold">{user.loyalty_points.toLocaleString()}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    user.role === 'buyer' 
                      ? 'bg-blue-100 text-blue-800' 
                      : user.role === 'seller' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {user.role || 'No Role'}
                  </span>
                </td>
                <td className="p-3 flex items-center justify-start gap-2">
                  <button className="bg-[#E53E3E] hover:bg-red-600 text-white px-4 py-2 rounded-lg cursor-pointer">
                    User Details
                  </button>
                </td>
              </tr>
            ))}

            {filteredUsers.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="p-6 text-center text-sm text-gray-500"
                >
                  No users found{searchTerm ? ` for "${searchTerm}"` : ""}
                  {filterType !== "All" ? ` in ${filterType}` : ""}.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        
        {/* Pagination */}
        {pagination && pagination.last_page > 1 && (
          <div className="bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {((currentPage - 1) * pagination.per_page) + 1} to {Math.min(currentPage * pagination.per_page, pagination.total)} of {pagination.total} results
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onPageChange?.(currentPage - 1)}
                disabled={currentPage <= 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              {/* Page numbers */}
              {Array.from({ length: Math.min(5, pagination.last_page) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(pagination.last_page - 4, currentPage - 2)) + i;
                if (pageNum > pagination.last_page) return null;
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => onPageChange?.(pageNum)}
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                      currentPage === pageNum
                        ? 'bg-[#E53E3E] text-white'
                        : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button
                onClick={() => onPageChange?.(currentPage + 1)}
                disabled={currentPage >= pagination.last_page}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersTable;
