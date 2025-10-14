import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import images from "../../../constants/images";

interface DotsDropdownProps {
  onActionSelect?: (action: string) => void;
}

const DotsDropdown: React.FC<DotsDropdownProps> = ({ onActionSelect }) => {
  const [isDotsDropdownOpen, setIsDotsDropdownOpen] = useState(false);
  const DotsActions = ["Block user", "Ban user"];
  const actionIcons: Record<string, string> = {
    "Block user": "/assets/layout/block.svg",
    "Ban user": "/assets/layout/ban.svg",
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsDotsDropdownOpen((s) => !s)}
        className="w-10 h-10 cursor-pointer"
      >
        <img src={images.dots} alt="Dots" />
      </button>
      {isDotsDropdownOpen && (
        <div className="absolute z-10 mt-2 right-5 w-44 bg-white border border-gray-200 rounded-lg shadow-lg">
          {DotsActions.map((action) => (
            <button
              key={action}
              onClick={() => {
                setIsDotsDropdownOpen(false);
                onActionSelect?.(action);
              }}
              className={`flex items-center gap-2.5 w-full text-left px-4 py-2 text-sm ${
                action === "Ban user" ? "text-[#FF0000]" : "text-black"
              } cursor-pointer font-medium`}
            >
              <img
                src={actionIcons[action]}
                alt={`${action} icon`}
                className="w-4 h-4"
              />
              <span>{action}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

interface StoreApi {
  id: number;
  store_name: string;
  email: string;
  phone: string;
  full_name: string;
  level: number;
  is_active: number;
  profile_picture: string | null;
  store_count: number;
  total_orders: number;
  total_revenue: number;
  created_at: string;
  last_login: string;
}

interface PaginationApi {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

interface StoreTableProps {
  title?: string;
  onRowSelect?: (selectedIds: string[]) => void;
  onSelectedUsersChange?: (users: StoreApi[]) => void;
  /** NEW: filter by level ("all" shows everything) */
  levelFilter?: number | "all";
  /** NEW: debounced search term from parent */
  searchTerm?: string;
  users?: StoreApi[];
  pagination?: PaginationApi;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  isLoading?: boolean;
  error?: any;
}

const StoreTable: React.FC<StoreTableProps> = ({
  title = "Users",
  onRowSelect,
  onSelectedUsersChange,
  levelFilter = "all",
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
  const navigate = useNavigate();

  // Normalize API data to UI shape
  const stores = useMemo(() => {
    return users.map((u) => ({
      id: u.id.toString(),
      storeName: u.store_name || u.full_name || 'No Store',
      email: u.email,
      phoneNumber: u.phone,
      level: u.level,
      isActive: !!u.is_active,
      storeCount: u.store_count,
      totalOrders: u.total_orders,
      totalRevenue: u.total_revenue,
      createdAt: u.created_at,
      lastLogin: u.last_login,
      profileImage: u.profile_picture,
    }));
  }, [users]);

  // NEW: filtered data (by level + search)
  const filteredStores = useMemo(() => {
    const q = (searchTerm || "").trim().toLowerCase();
    return stores
      .filter((s) => (levelFilter === "all" ? true : s.level === levelFilter))
      .filter((s) => {
        if (!q) return true;
        const haystack = [s.storeName, s.email, s.phoneNumber, String(s.level)]
          .join(" ")
          .toLowerCase();
        return haystack.includes(q);
      });
  }, [stores, levelFilter, searchTerm]);

  // Reset selection when filters change
  useEffect(() => {
    setSelectedRows([]);
    setSelectAll(false);
  }, [levelFilter, searchTerm, stores]);

  const handleSelectAll = () => {
    const allIds = filteredStores.map((store) => store.id);
    const newSelection = selectAll ? [] : allIds;
    setSelectedRows(newSelection);
    setSelectAll(!selectAll);
    onRowSelect?.(newSelection);
    if (onSelectedUsersChange) {
      const selected = users.filter((u) => newSelection.includes(u.id.toString()));
      onSelectedUsersChange(selected);
    }
  };

  const handleRowSelect = (id: string) => {
    const isSelected = selectedRows.includes(id);
    const newSelection = isSelected
      ? selectedRows.filter((rowId) => rowId !== id)
      : [...selectedRows, id];
    setSelectedRows(newSelection);
    setSelectAll(newSelection.length === filteredStores.length);
    onRowSelect?.(newSelection);
    if (onSelectedUsersChange) {
      const selected = users.filter((u) => newSelection.includes(u.id.toString()));
      onSelectedUsersChange(selected);
    }
  };

  const handleCustomerDetails = (store: Store) => {
    navigate(`/store-details/${store.id}`, { state: store });
  };

  return (
    <div className="border border-gray-300 rounded-2xl mt-5">
      <div className="bg-white p-5 rounded-t-2xl font-semibold text-lg border-b border-gray-300">
        {title}
      </div>
      <div className="bg-white rounded-b-2xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E53E3E]"></div>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">Failed to load stores.</div>
        ) : (
        <table className="w-full">
          <thead className="bg-[#F2F2F2]">
            <tr className="text-center">
              <th className="p-3 text-left font-semibold">
                <input
                  type="checkbox"
                  checked={selectAll && filteredStores.length > 0}
                  onChange={handleSelectAll}
                  className="w-5 h-5"
                />
              </th>
              <th className="p-3 text-left font-normal">Store Name</th>
              <th className="p-3 text-left font-normal">Owner</th>
              <th className="p-3 text-left font-normal">Email</th>
              <th className="p-3 text-left font-normal">Phone No</th>
              <th className="p-3 text-center font-normal">Level</th>
              <th className="p-3 text-center font-normal">Stores</th>
              <th className="p-3 text-center font-normal">Orders</th>
              <th className="p-3 text-center font-normal">Revenue</th>
              <th className="p-3 text-center font-normal">Actions</th>
              <th className="p-3 text-right font-normal">Other</th>
            </tr>
          </thead>
          <tbody>
            {filteredStores.length === 0 ? (
              <tr>
                <td colSpan={11} className="p-6 text-center text-gray-500">
                  No matching stores.
                </td>
              </tr>
            ) : (
              filteredStores.map((store) => (
                <tr
                  key={store.id}
                  className="text-center border-t border-gray-200"
                >
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(store.id)}
                      onChange={() => handleRowSelect(store.id)}
                      className="w-5 h-5"
                    />
                  </td>
                  <td className="p-3 text-left flex items-center justify-start gap-2">
                    <img
                      src="/assets/layout/admin.png"
                      alt="User"
                      className="w-8 h-8 rounded-full"
                    />
                    <span>{store.storeName}</span>
                  </td>
                  <td className="p-3 text-left">{(store as any).full_name || '-'}</td>
                  <td className="p-3 text-left">{store.email}</td>
                  <td className="p-3 text-left">{store.phoneNumber}</td>
                  <td className="p-3 font-bold">{store.level}</td>
                  <td className="p-3 font-semibold">{(store as any).storeCount}</td>
                  <td className="p-3 font-semibold">{(store as any).totalOrders}</td>
                  <td className="p-3 font-semibold">₦{((store as any).totalRevenue || 0).toLocaleString?.() || (store as any).totalRevenue}</td>
                  <td className="p-3 space-x-1">
                    <button
                      onClick={() => handleCustomerDetails(store)}
                      className="bg-[#E53E3E] hover:bg-red-600 text-white px-4 py-2 rounded-lg cursor-pointer"
                    >
                      Customer Details
                    </button>
                    <button className="bg-black hover:bg-gray-900 text-white px-4 py-2 rounded-lg cursor-pointer">
                      Transactions
                    </button>
                  </td>
                  <td className="p-3 text-right">
                    <DotsDropdown
                      onActionSelect={(action) =>
                        console.log(`Action ${action} for store ${store.id}`)
                      }
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        )}

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

export default StoreTable;
