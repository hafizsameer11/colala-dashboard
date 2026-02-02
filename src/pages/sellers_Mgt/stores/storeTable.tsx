import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import images from "../../../constants/images";
import { useToast } from "../../../contexts/ToastContext";
import { usePermissions } from "../../../hooks/usePermissions";
import { apiCall } from "../../../utils/customApiCall";
import Cookies from "js-cookie";
import { deleteStore, hardDeleteStore } from "../../../utils/queries/users";

// Seller-specific API functions
const toggleSellerBlock = async (sellerId: string | number, action: 'block' | 'unblock') => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  try {
    const response = await apiCall(
      `hhttps://api.colalamall.com/api/admin/seller-users/${sellerId}/toggle-block`,
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
      `hhttps://api.colalamall.com/api/admin/seller-users/${sellerId}/remove`,
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
  onAssignAccountOfficer?: (store: Store) => void;
}

const DotsDropdown: React.FC<DotsDropdownProps> = ({ onActionSelect, store, onStoreDeleted, onAssignAccountOfficer }) => {
  const [isDotsDropdownOpen, setIsDotsDropdownOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { hasPermission, hasRole } = usePermissions();
  
  // Check permissions for actions
  const canBlock = hasPermission('sellers.suspend');
  const canBan = hasPermission('sellers.remove');
  const canDelete = hasPermission('sellers.delete');
  const canHardDelete = hasPermission('sellers.delete'); // reuse same permission for hard delete
  // Account officers should NEVER be able to assign account officers, even if they have the permission
  const canAssignAccountOfficer = hasPermission('sellers.assign_account_officer') && !hasRole('account_officer');

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

  // Hard delete store mutation
  const hardDeleteStoreMutation = useMutation({
    mutationFn: (storeId: string | number) => hardDeleteStore(storeId),
    onSuccess: () => {
      showToast('Store hard-deleted successfully', 'success');
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
      console.error('Hard delete store error:', error);
      showToast('Failed to hard delete store', 'error');
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
    } else if (action === 'Hard delete store') {
      if (window.confirm('This will permanently delete the store and all related data. This action cannot be undone. Continue?')) {
        hardDeleteStoreMutation.mutate(store.storeId);
      }
    } else if (action === 'Assign Account Officer') {
      onAssignAccountOfficer?.(store);
    }
    
    onActionSelect?.(action);
  };

  const handleConfirmDelete = () => {
    deleteStoreMutation.mutate(store.storeId);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  // Filter actions based on permissions
  const allActions = [
    { name: "Assign Account Officer", permission: canAssignAccountOfficer },
    { name: "Block user", permission: canBlock },
    { name: "Ban user", permission: canBan },
    { name: "Delete store", permission: canDelete },
    { name: "Hard delete store", permission: canHardDelete },
  ];
  const DotsActions = allActions.filter(action => action.permission).map(action => action.name);
  
  const actionIcons: Record<string, string> = {
    "Block user": "/assets/layout/block.svg",
    "Ban user": "/assets/layout/ban.svg",
    "Delete store": "/assets/layout/ban.svg",
    "Hard delete store": "/assets/layout/ban.svg",
  };
  
  // If no permissions, don't show dropdown
  if (DotsActions.length === 0) {
    return null;
  }

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
                disabled={toggleBlockMutation.isPending || removeSellerMutation.isPending || deleteStoreMutation.isPending || hardDeleteStoreMutation.isPending}
                className={`flex items-center gap-2.5 w-full text-left px-4 py-2 text-sm ${
                  action === "Ban user" || action === "Delete store" ? "text-[#FF0000]" : 
                  action === "Assign Account Officer" ? "text-[#1DB61D]" : "text-black"
                } font-medium ${
                  toggleBlockMutation.isPending || removeSellerMutation.isPending || deleteStoreMutation.isPending || hardDeleteStoreMutation.isPending
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'cursor-pointer'
                }`}
              >
                {actionIcons[action] && (
                  <img
                    src={actionIcons[action]}
                    alt={`${action} icon`}
                    className="w-4 h-4"
                  />
                )}
                <span>
                  {action === 'Block user' && toggleBlockMutation.isPending ? 'Processing...' :
                   action === 'Ban user' && removeSellerMutation.isPending ? 'Processing...' :
                   action === 'Delete store' && deleteStoreMutation.isPending ? 'Processing...' :
                   action === 'Hard delete store' && hardDeleteStoreMutation.isPending ? 'Processing...' :
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
  subscription?: {
    id: number;
    plan_name: string;
    plan_id: number;
    status: string;
    start_date: string;
    end_date: string;
    price: string;
    currency: string;
    duration_days: number;
  } | null;
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
  subscriptionPlan?: string | null;
  subscriptionStatus?: string | null;
  subscriptionEndDate?: string | null;
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
  searchTerm = "",
  users = [],
  pagination,
  currentPage = 1,
  onPageChange,
  isLoading = false,
  error,
  onAssignAccountOfficer,
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
      subscriptionPlan: u.subscription?.plan_name || null,
      subscriptionStatus: u.subscription?.status || null,
      subscriptionEndDate: u.subscription?.end_date || null,
    }));
  }, [users]);

  // NEW: filtered data (by level + search)
  const filteredStores = useMemo(() => {
    const q = (searchTerm || "").trim().toLowerCase();
    return stores
      .filter((s) => {
        if (!q) return true;
        const haystack = [s.storeName, s.email, s.phoneNumber, String(s.level)]
          .join(" ")
          .toLowerCase();
        return haystack.includes(q);
      });
  }, [stores, searchTerm]);

  // Reset selection when filters change
  useEffect(() => {
    setSelectedRows([]);
    setSelectAll(false);
  }, [searchTerm, stores]);

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
      <div className="bg-white p-3 sm:p-4 md:p-5 rounded-t-2xl font-semibold text-base sm:text-lg border-b border-gray-300">
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
          <>
            {/* Desktop/Tablet Table View - with horizontal scroll */}
            <div className="hidden sm:block overflow-x-auto" style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'thin' }}>
              <div className="inline-block min-w-full align-middle">
                <table className="w-full bg-white rounded-lg shadow-sm min-w-[900px]">
                  <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                    <tr className="text-center">
                      <th className="p-2 md:p-3 text-left font-semibold whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectAll && filteredStores.length > 0}
                          onChange={handleSelectAll}
                          className="w-4 h-4 md:w-5 md:h-5 cursor-pointer"
                        />
                      </th>
                      <th className="p-2 md:p-3 text-left font-medium text-gray-600 text-xs md:text-sm whitespace-nowrap">Store Name</th>
                      <th className="p-2 md:p-3 text-left font-medium text-gray-600 text-xs md:text-sm whitespace-nowrap">Email</th>
                      <th className="p-2 md:p-3 text-left font-medium text-gray-600 text-xs md:text-sm whitespace-nowrap">Phone No</th>
                      <th className="p-2 md:p-3 text-center font-medium text-gray-600 text-xs md:text-sm whitespace-nowrap">Level</th>
                      <th className="p-2 md:p-3 text-center font-medium text-gray-600 text-xs md:text-sm whitespace-nowrap">Stores</th>
                      <th className="p-2 md:p-3 text-center font-medium text-gray-600 text-xs md:text-sm whitespace-nowrap">Orders</th>
                      <th className="p-2 md:p-3 text-center font-medium text-gray-600 text-xs md:text-sm whitespace-nowrap">Revenue</th>
                      <th className="p-2 md:p-3 text-center font-medium text-gray-600 text-xs md:text-sm whitespace-nowrap">Subscription</th>
                      <th className="p-2 md:p-3 text-center font-medium text-gray-600 text-xs md:text-sm whitespace-nowrap">Actions</th>
                      <th className="p-2 md:p-3 text-right font-medium text-gray-600 text-xs md:text-sm whitespace-nowrap">Other</th>
                    </tr>
                  </thead>
                <tbody>
                  {filteredStores.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="p-6 text-center text-gray-500">
                        No matching stores.
                      </td>
                    </tr>
                  ) : (
                    filteredStores.map((store) => (
                      <tr
                        key={store.id}
                        className="text-center border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="p-2 md:p-3 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedRows.includes(store.id)}
                            onChange={() => handleRowSelect(store.id)}
                            className="w-4 h-4 md:w-5 md:h-5 cursor-pointer"
                          />
                        </td>
                        <td className="p-2 md:p-3 text-left whitespace-nowrap">
                          <div className="flex items-center gap-2 md:gap-3">
                            <img
                              src={store.profileImage || images.admin}
                              alt="User"
                              className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover flex-shrink-0"
                              onError={(e) => {
                                e.currentTarget.src = images.admin;
                              }}
                            />
                            <span className="font-medium text-gray-900 text-xs md:text-sm truncate max-w-[150px]">{store.storeName}</span>
                          </div>
                        </td>
                        <td className="p-2 md:p-3 text-left text-gray-700 text-xs md:text-sm whitespace-nowrap">
                          <span className="truncate block max-w-[180px]">{store.email}</span>
                        </td>
                        <td className="p-2 md:p-3 text-left text-gray-700 text-xs md:text-sm whitespace-nowrap">{store.phoneNumber}</td>
                        <td className="p-2 md:p-3 text-center whitespace-nowrap">
                          <span className="inline-flex items-center justify-center w-6 h-6 bg-gray-100 text-gray-800 text-xs md:text-sm font-bold rounded-full">
                            {store.level}
                          </span>
                        </td>
                        <td className="p-2 md:p-3 text-center font-semibold text-gray-700 text-xs md:text-sm whitespace-nowrap">{store.storeCount || 0}</td>
                        <td className="p-2 md:p-3 text-center font-semibold text-gray-700 text-xs md:text-sm whitespace-nowrap">{store.totalOrders || 0}</td>
                        <td className="p-2 md:p-3 text-center font-semibold text-gray-700 text-xs md:text-sm whitespace-nowrap">₦{(store.totalRevenue || 0).toLocaleString()}</td>
                        <td className="p-2 md:p-3 text-center text-xs md:text-sm whitespace-nowrap">
                          {store.subscriptionPlan ? (
                            <div className="flex flex-col items-center gap-0.5">
                              <span className="font-semibold text-gray-900">{store.subscriptionPlan}</span>
                              <span className="text-[10px] md:text-xs text-gray-500">
                                {store.subscriptionStatus || ''}{store.subscriptionEndDate ? ` · ends ${store.subscriptionEndDate}` : ''}
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-xs">No plan</span>
                          )}
                        </td>
                        <td className="p-2 md:p-3 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1 md:gap-2 flex-wrap">
                            <button
                              onClick={() => handleCustomerDetails(store)}
                              className="bg-[#E53E3E] hover:bg-red-600 text-white px-2 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap"
                            >
                              Details
                            </button>
                            <button 
                              onClick={() => handleTransactions(store)}
                              className="bg-black hover:bg-gray-800 text-white px-2 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap"
                            >
                              Transactions
                            </button>
                          </div>
                        </td>
                        <td className="p-2 md:p-3 text-right whitespace-nowrap">
                          <DotsDropdown
                            store={store}
                            onActionSelect={(action) =>
                              console.log(`Action ${action} for store ${store.id}`)
                            }
                            onStoreDeleted={(storeId) => {
                              queryClient.invalidateQueries({ queryKey: ['sellersList'] });
                              queryClient.invalidateQueries({ queryKey: ['sellers'] });
                              queryClient.invalidateQueries({ queryKey: ['sellerDetails'] });
                              queryClient.invalidateQueries({ queryKey: ['sellerStats'] });
                              setSelectedRows(prev => prev.filter(id => id !== storeId));
                              console.log(`Store ${storeId} deleted and data refreshed`);
                            }}
                            onAssignAccountOfficer={onAssignAccountOfficer}
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              </div>
            </div>

            {/* Mobile Card View */}
            <div className="sm:hidden">
              {filteredStores.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  No matching stores.
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {filteredStores.map((store) => (
                    <div
                      key={store.id}
                      className="p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3 flex-1">
                          <input
                            type="checkbox"
                            checked={selectedRows.includes(store.id)}
                            onChange={() => handleRowSelect(store.id)}
                            className="w-5 h-5 mt-1"
                          />
                          <img
                            src={store.profileImage || images.admin}
                            alt="User"
                            className="w-12 h-12 rounded-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = images.admin;
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 text-sm truncate">{store.storeName}</h3>
                            <p className="text-xs text-gray-500 truncate">{store.email}</p>
                          </div>
                        </div>
                        <DotsDropdown
                          store={store}
                          onActionSelect={(action) =>
                            console.log(`Action ${action} for store ${store.id}`)
                          }
                          onAssignAccountOfficer={onAssignAccountOfficer}
                          onStoreDeleted={(storeId) => {
                            queryClient.invalidateQueries({ queryKey: ['sellersList'] });
                            queryClient.invalidateQueries({ queryKey: ['sellers'] });
                            queryClient.invalidateQueries({ queryKey: ['sellerDetails'] });
                            queryClient.invalidateQueries({ queryKey: ['sellerStats'] });
                            setSelectedRows(prev => prev.filter(id => id !== storeId));
                            console.log(`Store ${storeId} deleted and data refreshed`);
                          }}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                        <div>
                          <span className="text-gray-500 text-xs">Phone:</span>
                          <p className="text-gray-900 font-medium">{store.phoneNumber}</p>
                        </div>
                        <div>
                          <span className="text-gray-500 text-xs">Level:</span>
                          <p className="text-gray-900 font-medium">
                            <span className="inline-flex items-center justify-center w-6 h-6 bg-gray-100 text-gray-800 text-xs font-bold rounded-full">
                              {store.level}
                            </span>
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500 text-xs">Stores:</span>
                          <p className="text-gray-900 font-semibold">{store.storeCount || 0}</p>
                        </div>
                        <div>
                          <span className="text-gray-500 text-xs">Orders:</span>
                          <p className="text-gray-900 font-semibold">{store.totalOrders || 0}</p>
                        </div>
                        <div>
                          <span className="text-gray-500 text-xs">Revenue:</span>
                          <p className="text-gray-900 font-semibold">₦{(store.totalRevenue || 0).toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="text-gray-500 text-xs">Subscription:</span>
                          {store.subscriptionPlan ? (
                            <p className="text-gray-900 font-semibold text-xs">
                              {store.subscriptionPlan}
                              {store.subscriptionStatus ? ` · ${store.subscriptionStatus}` : ''}
                              {store.subscriptionEndDate ? ` · ends ${store.subscriptionEndDate}` : ''}
                            </p>
                          ) : (
                            <p className="text-gray-400 text-xs">No plan</p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 mt-3">
                        <button
                          onClick={() => handleCustomerDetails(store)}
                          className="w-full bg-[#E53E3E] hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                        >
                          Store Details
                        </button>
                        <button 
                          onClick={() => handleTransactions(store)}
                          className="w-full bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                        >
                          Transactions
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Pagination */}
        {pagination && pagination.last_page > 1 && (
          <div className="bg-white border-t border-gray-200 px-3 sm:px-4 md:px-6 py-3 md:py-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs sm:text-sm text-gray-700 text-center sm:text-left">
                Showing {((currentPage - 1) * pagination.per_page) + 1} to {Math.min(currentPage * pagination.per_page, pagination.total)} of {pagination.total} results
              </div>
              <div className="flex items-center space-x-1 sm:space-x-2 flex-wrap justify-center">
                <button
                  onClick={() => onPageChange?.(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
                      className={`px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-md ${
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
                  className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoreTable;
