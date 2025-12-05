import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import images from "../../../constants/images";
import { useToast } from "../../../contexts/ToastContext";
import { apiCall } from "../../../utils/customApiCall";
import Cookies from "js-cookie";
import { deleteStore } from "../../../utils/queries/users";

// Seller-specific API functions
const toggleSellerBlock = async (sellerId: string | number, action: 'block' | 'unblock') => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  try {
    const response = await apiCall(
      `https://colala.hmstech.xyz/api/admin/seller-users/${sellerId}/toggle-block`,
      'POST',
      { action },
      token
    );
    return response;
  } catch (error) {
    console.error('Toggle seller block API call error:', error);
    throw error;
  }
};

const removeSeller = async (sellerId: string | number) => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  try {
    const response = await apiCall(
      `https://colala.hmstech.xyz/api/admin/seller-users/${sellerId}/remove`,
      'DELETE',
      undefined,
      token
    );
    return response;
  } catch (error) {
    console.error('Remove seller API call error:', error);
    throw error;
  }
};

interface DotsDropdownProps {
  onActionSelect?: (action: string) => void;
  store: Store;
  onStoreDeleted?: (storeId: string) => void;
}

const DotsDropdown: React.FC<DotsDropdownProps> = ({ onActionSelect, store, onStoreDeleted }) => {
  const [isDotsDropdownOpen, setIsDotsDropdownOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  // Seller block/unblock mutation
  const toggleBlockMutation = useMutation({
    mutationFn: ({ sellerId, action }: { sellerId: string | number; action: 'block' | 'unblock' }) => 
      toggleSellerBlock(sellerId, action),
    onSuccess: (_, variables) => {
      const actionMessages = {
        block: 'Seller blocked successfully',
        unblock: 'Seller unblocked successfully'
      };
      showToast(actionMessages[variables.action], 'success');
      
      // Invalidate all seller-related queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['sellersList'] });
      queryClient.invalidateQueries({ queryKey: ['sellers'] });
      queryClient.invalidateQueries({ queryKey: ['sellerDetails'] });
      queryClient.invalidateQueries({ queryKey: ['sellerStats'] });
      queryClient.invalidateQueries({ queryKey: ['allSellers'] });
    },
    onError: (error) => {
      console.error('Toggle block error:', error);
      showToast('Failed to update seller status', 'error');
    },
  });

  // Remove seller mutation
  const removeSellerMutation = useMutation({
    mutationFn: (sellerId: string | number) => removeSeller(sellerId),
    onSuccess: () => {
      showToast('Seller removed successfully', 'success');
      
      // Invalidate all seller-related queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['sellersList'] });
      queryClient.invalidateQueries({ queryKey: ['sellers'] });
      queryClient.invalidateQueries({ queryKey: ['sellerDetails'] });
      queryClient.invalidateQueries({ queryKey: ['sellerStats'] });
      queryClient.invalidateQueries({ queryKey: ['allSellers'] });
      
      // Notify parent component about deleted store
      onStoreDeleted?.(store.id);
    },
    onError: (error) => {
      console.error('Remove seller error:', error);
      showToast('Failed to remove seller', 'error');
    },
  });

  // Delete store mutation
  const deleteStoreMutation = useMutation({
    mutationFn: (storeId: string | number) => deleteStore(storeId),
    onSuccess: () => {
      showToast('Store deactivated successfully', 'success');
      setShowDeleteConfirm(false);
      
      // Invalidate all store-related queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['adminStores'] });
      queryClient.invalidateQueries({ queryKey: ['sellerUsers'] });
      queryClient.invalidateQueries({ queryKey: ['sellersList'] });
      queryClient.invalidateQueries({ queryKey: ['sellers'] });
      queryClient.invalidateQueries({ queryKey: ['sellerDetails'] });
      queryClient.invalidateQueries({ queryKey: ['sellerStats'] });
      
      // Notify parent component about deleted store
      onStoreDeleted?.(store.id);
    },
    onError: (error) => {
      console.error('Delete store error:', error);
      showToast('Failed to delete store', 'error');
      setShowDeleteConfirm(false);
    },
  });

  const handleDropdownAction = (action: string) => {
    setIsDotsDropdownOpen(false);
    
    if (action === 'Block user') {
      // Check current status to determine block/unblock action
      const isCurrentlyBlocked = !store.isActive;
      const blockAction = isCurrentlyBlocked ? 'unblock' : 'block';
      
      toggleBlockMutation.mutate({
        sellerId: store.id,
        action: blockAction
      });
    } else if (action === 'Ban user') {
      if (window.confirm('Are you sure you want to remove this seller? This action cannot be undone.')) {
        removeSellerMutation.mutate(store.id);
      }
    } else if (action === 'Delete store') {
      setShowDeleteConfirm(true);
    }
    
    onActionSelect?.(action);
  };

  const handleConfirmDelete = () => {
    deleteStoreMutation.mutate(store.storeId);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const DotsActions = ["Block user", "Ban user", "Delete store"];
  const actionIcons: Record<string, string> = {
    "Block user": "/assets/layout/block.svg",
    "Ban user": "/assets/layout/ban.svg",
    "Delete store": "/assets/layout/ban.svg",
  };

  return (
    <>
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
                onClick={() => handleDropdownAction(action)}
                disabled={toggleBlockMutation.isPending || removeSellerMutation.isPending || deleteStoreMutation.isPending}
                className={`flex items-center gap-2.5 w-full text-left px-4 py-2 text-sm ${
                  action === "Ban user" || action === "Delete store" ? "text-[#FF0000]" : "text-black"
                } font-medium ${
                  toggleBlockMutation.isPending || removeSellerMutation.isPending || deleteStoreMutation.isPending
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'cursor-pointer'
                }`}
              >
                <img
                  src={actionIcons[action]}
                  alt={`${action} icon`}
                  className="w-4 h-4"
                />
                <span>
                  {action === 'Block user' && toggleBlockMutation.isPending ? 'Processing...' :
                   action === 'Ban user' && removeSellerMutation.isPending ? 'Processing...' :
                   action === 'Delete store' && deleteStoreMutation.isPending ? 'Processing...' :
                   action === 'Block user' && !store.isActive ? 'Unblock Seller' :
                   action === 'Block user' ? 'Block Seller' :
                   action}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Delete Store Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                <img src={images.error} alt="Warning" className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Store</h3>
                <p className="text-sm text-gray-500">This action will deactivate the store</p>
              </div>
            </div>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete <span className="font-semibold">{store.storeName}</span>? This will permanently deactivate the store and set its visibility to 0.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleCancelDelete}
                disabled={deleteStoreMutation.isPending}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleteStoreMutation.isPending}
                className={`flex-1 px-4 py-2 bg-red-500 text-white rounded-lg transition-colors ${
                  deleteStoreMutation.isPending ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-600'
                }`}
              >
                {deleteStoreMutation.isPending ? 'Deleting...' : 'Delete Store'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

interface StoreApi {
  id: number;
  store_id: number;
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

interface Store {
  id: string;
  storeId: string;
  storeName: string;
  email: string;
  phoneNumber: string;
  level: number;
  isActive: boolean;
  storeCount: number;
  totalOrders: number;
  totalRevenue: number;
  createdAt: string;
  lastLogin: string;
  profileImage: string | null;
  full_name?: string;
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
  error?: string | null;
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
  const queryClient = useQueryClient();

  // Normalize API data to UI shape
  const stores = useMemo(() => {
    return users.map((u) => ({
      id: u.id.toString(),
      storeId: u.store_id?.toString() || u.id.toString(),
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
      full_name: u.full_name,
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

  const handleTransactions = (store: Store) => {
    navigate(`/store-details/${store.id}?tab=transactions`, { state: store });
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
        <table className="w-full bg-white rounded-lg shadow-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr className="text-center">
              <th className="p-3 text-left font-semibold">
                <input
                  type="checkbox"
                  checked={selectAll && filteredStores.length > 0}
                  onChange={handleSelectAll}
                  className="w-5 h-5"
                />
              </th>
              <th className="p-3 text-left font-medium text-gray-600">Store Name</th>
            
              <th className="p-3 text-left font-medium text-gray-600">Email</th>
              <th className="p-3 text-left font-medium text-gray-600">Phone No</th>
              <th className="p-3 text-center font-medium text-gray-600">Level</th>
              <th className="p-3 text-center font-medium text-gray-600">Stores</th>
              <th className="p-3 text-center font-medium text-gray-600">Orders</th>
              <th className="p-3 text-center font-medium text-gray-600">Revenue</th>
              <th className="p-3 text-center font-medium text-gray-600">Actions</th>
              <th className="p-3 text-right font-medium text-gray-600">Other</th>
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
                  className="text-center border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(store.id)}
                      onChange={() => handleRowSelect(store.id)}
                      className="w-5 h-5"
                    />
                  </td>
                  <td className="p-3 text-left flex items-center gap-3">
                    <img
                      src={store.profileImage || images.admin}
                      alt="User"
                      className="w-10 h-10 rounded-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = images.admin;
                      }}
                    />
                    <span className="font-medium text-gray-900">{store.storeName}</span>
                  </td>
                  <td className="p-3 text-left text-gray-700">{store.email}</td>
                  <td className="p-3 text-left text-gray-700">{store.phoneNumber}</td>
                  <td className="p-3 text-center">
                    <span className="inline-flex items-center justify-center w-6 h-6 bg-gray-100 text-gray-800 text-sm font-bold rounded-full">
                      {store.level}
                    </span>
                  </td>
                  <td className="p-3 text-center font-semibold text-gray-700">{store.storeCount || 0}</td>
                  <td className="p-3 text-center font-semibold text-gray-700">{store.totalOrders || 0}</td>
                  <td className="p-3 text-center font-semibold text-gray-700">₦{(store.totalRevenue || 0).toLocaleString()}</td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleCustomerDetails(store)}
                        className="bg-[#E53E3E] hover:bg-red-600 text-white px-2 py-1.5 rounded-md text-xs font-medium transition-colors"
                      >
                        Store Details
                      </button>
                      <button 
                        onClick={() => handleTransactions(store)}
                        className="bg-black hover:bg-gray-800 text-white px-2 py-1.5 rounded-md text-sm font-medium transition-colors"
                      >
                        Transactions
                      </button>
                    </div>
                  </td>
                  <td className="p-3 text-right">
                    <DotsDropdown
                      store={store}
                      onActionSelect={(action) =>
                        console.log(`Action ${action} for store ${store.id}`)
                      }
                      onStoreDeleted={(storeId) => {
                        // Invalidate all seller-related queries to refresh the data
                        queryClient.invalidateQueries({ queryKey: ['sellersList'] });
                        queryClient.invalidateQueries({ queryKey: ['sellers'] });
                        queryClient.invalidateQueries({ queryKey: ['sellerDetails'] });
                        queryClient.invalidateQueries({ queryKey: ['sellerStats'] });
                        
                        // Also remove from selected rows if it was selected
                        setSelectedRows(prev => prev.filter(id => id !== storeId));
                        
                        console.log(`Store ${storeId} deleted and data refreshed`);
                      }}
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
