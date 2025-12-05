import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import images from "../../../../constants/images";
import { getAllUsers, deleteAllUser } from "../../../../utils/queries/users";
import { useToast } from "../../../../contexts/ToastContext";

interface DotsDropdownProps {
  onActionSelect?: (action: string) => void;
  user: User;
  onUserDeleted?: (userId: string) => void;
}

const DotsDropdown: React.FC<DotsDropdownProps> = ({ onActionSelect, user, onUserDeleted }) => {
  const [isDotsDropdownOpen, setIsDotsDropdownOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: (userId: string | number) => deleteAllUser(userId),
    onSuccess: () => {
      showToast('User deleted successfully', 'success');
      setShowDeleteConfirm(false);
      
      // Invalidate all user-related queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
      queryClient.invalidateQueries({ queryKey: ['usersList'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['buyerUsers'] });
      queryClient.invalidateQueries({ queryKey: ['allUsersStats'] });
      
      // Notify parent component about deleted user
      onUserDeleted?.(user.id);
    },
    onError: (error: any) => {
      console.error('Delete user error:', error);
      const errorMessage = error?.data?.message || error?.message || 'Failed to delete user';
      showToast(errorMessage, 'error');
      setShowDeleteConfirm(false);
    },
  });

  const handleDropdownAction = (action: string) => {
    setIsDotsDropdownOpen(false);
    
    if (action === 'Delete user') {
      setShowDeleteConfirm(true);
    }
    
    onActionSelect?.(action);
  };

  const handleConfirmDelete = () => {
    deleteUserMutation.mutate(user.id);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const DotsActions = ["Block user", "Ban user", "Delete user"];
  const actionIcons: Record<string, string> = {
    "Block user": "/assets/layout/block.svg",
    "Ban user": "/assets/layout/ban.svg",
    "Delete user": "/assets/layout/ban.svg",
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
                disabled={deleteUserMutation.isPending}
                className={`flex items-center gap-2.5 w-full text-left px-4 py-2 text-sm ${
                  action === "Ban user" || action === "Delete user" ? "text-[#FF0000]" : "text-black"
                } font-medium ${
                  deleteUserMutation.isPending
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'cursor-pointer'
                }`}
              >
                <img src={actionIcons[action]} alt="" className="w-4 h-4" />
                <span>
                  {action === 'Delete user' && deleteUserMutation.isPending ? 'Processing...' : action}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Delete User Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                <img src={images.error} alt="Warning" className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete User</h3>
                <p className="text-sm text-gray-500">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete <span className="font-semibold">{user.userName}</span>? This will permanently delete the user account and all associated data.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleCancelDelete}
                disabled={deleteUserMutation.isPending}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleteUserMutation.isPending}
                className={`flex-1 px-4 py-2 bg-red-500 text-white rounded-lg transition-colors ${
                  deleteUserMutation.isPending ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-600'
                }`}
              >
                {deleteUserMutation.isPending ? 'Deleting...' : 'Delete User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

interface User {
  id: string;
  userName: string;
  email: string;
  phoneNumber: string;
  walletBalance: string;
  userType: "Buyer" | "Seller";
  userImage?: string;
}

interface UsersTableProps {
  title?: string;
  onRowSelect?: (selectedIds: string[]) => void;
  filterType?: "All" | "Buyers" | "Sellers"; // <-- from parent tabs
  searchTerm?: string; // <-- debounced search from parent
  currentPage?: number;
  onPageChange?: (page: number) => void;
}

const UsersTable: React.FC<UsersTableProps> = ({
  title = "All Users",
  onRowSelect,
  filterType = "All",
  searchTerm = "",
  currentPage = 1,
  onPageChange,
}) => {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const navigate = useNavigate();

  // Helper function to construct proper image URL
  const getImageUrl = (profilePicture: string | null | undefined) => {
    if (!profilePicture) return "/assets/layout/admin.png";
    return `https://colala.hmstech.xyz/storage/${profilePicture}`;
  };

  // Fetch users data from API
  const { data: usersData, isLoading, error } = useQuery({
    queryKey: ['allUsers', currentPage, searchTerm],
    queryFn: () => getAllUsers(currentPage, searchTerm || undefined),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Transform API data to component format
  const users: User[] = useMemo(() => {
    if (!usersData?.data?.users) return [];
    
    return usersData.data.users.map((user: any) => ({
      id: user.id.toString(),
      userName: user.full_name || "Unknown User",
      email: user.email || "No email",
      phoneNumber: user.phone || "No phone",
      walletBalance: user.wallet_balance ? `₦${user.wallet_balance}` : "₦0",
      userType: user.role === "seller" ? "Seller" : "Buyer",
      userImage: user.profile_picture,
      storeName: user.store_name,
    }));
  }, [usersData]);

  // Map tab -> filter
  const matchesTab = (u: User) => {
    if (filterType === "All") return true;
    if (filterType === "Buyers") return u.userType === "Buyer";
    if (filterType === "Sellers") return u.userType === "Seller";
    return true;
  };

  // Search across common fields (case-insensitive)
  const filteredUsers = useMemo(() => {
    const term = (searchTerm || "").toLowerCase();
    return users.filter(matchesTab).filter((u) => {
      if (!term) return true;
      const haystack = [
        u.userName,
        u.email,
        u.phoneNumber,
        u.walletBalance,
        u.userType,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(term);
    });
  }, [users, filterType, searchTerm]);

  // keep selection in sync with filtered view
  useEffect(() => {
    setSelectAll(false);
    setSelectedRows((prev) =>
      prev.filter((id) => filteredUsers.some((u) => u.id === id))
    );
  }, [filterType, searchTerm]); // eslint-disable-line

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRows([]);
      onRowSelect?.([]);
    } else {
      const visibleIds = filteredUsers.map((u) => u.id);
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

  const handleCustomerDetails = (user: User) => {
    navigate(`/all-users/${user.id}`, { state: user });
  };

  if (isLoading) {
    return (
      <div className="border border-gray-300 rounded-2xl mt-5">
        <div className="bg-white p-5 rounded-t-2xl font-semibold text-lg border-b border-gray-300">
          {title}
        </div>
        <div className="bg-white rounded-b-2xl p-8">
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E53E3E]"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border border-gray-300 rounded-2xl mt-5">
        <div className="bg-white p-5 rounded-t-2xl font-semibold text-lg border-b border-gray-300">
          {title}
        </div>
        <div className="bg-white rounded-b-2xl p-8">
          <div className="text-center text-red-500">
            <p className="text-sm">Error loading users</p>
          </div>
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
              <th className="p-3 text-center font-normal">Email</th>
              <th className="p-3 text-center font-normal">Phone No</th>
              <th className="p-3 text-center font-normal">Wallet Balance</th>
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
                    checked={selectedRows.includes(user.id)}
                    onChange={() => handleRowSelect(user.id)}
                    className="w-5 h-5"
                  />
                </td>
                <td className="p-3 text-left flex items-center justify-start gap-2">
                  <img
                    src={getImageUrl(user.userImage || null)}
                    alt="User"
                    className="w-8 h-8 rounded-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/assets/layout/admin.png";
                    }}
                  />
                  <span>{user.userName}</span>
                </td>
                <td className="p-3">{user.email}</td>
                <td className="p-3">{user.phoneNumber}</td>
                <td className="p-3 font-bold">{user.walletBalance}</td>
                <td className="p-3">{user.userType}</td>
                <td className="p-3 flex flex-row items-center gap-2">
                  <div>
                    <button
                      onClick={() => handleCustomerDetails(user)}
                      className="bg-[#E53E3E] hover:bg-red-600 text-white px-4 py-2 rounded-lg cursor-pointer"
                    >
                      User Details
                    </button>
                  </div>
                  <div>
                    <DotsDropdown
                      user={user}
                      onActionSelect={(action) =>
                        console.log(`Action ${action} for user ${user.id}`)
                      }
                      onUserDeleted={(userId) => {
                        // Remove from selected rows if it was selected
                        setSelectedRows(prev => prev.filter(id => id !== userId));
                        // The query will be invalidated by the mutation in DotsDropdown
                      }}
                    />
                  </div>
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
        {usersData?.data?.pagination && (
          <div className="flex justify-between items-center p-4 border-t border-gray-200">
            <div className="text-sm text-gray-500">
              Showing {((currentPage - 1) * (usersData.data.pagination.per_page || 20)) + 1} to{" "}
              {Math.min(currentPage * (usersData.data.pagination.per_page || 20), usersData.data.pagination.total || 0)} of{" "}
              {usersData.data.pagination.total || 0} results
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onPageChange?.(currentPage - 1)}
                disabled={currentPage <= 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-3 py-1 text-sm">
                Page {currentPage} of {usersData.data.pagination.last_page || 1}
              </span>
              <button
                onClick={() => onPageChange?.(currentPage + 1)}
                disabled={currentPage >= (usersData.data.pagination.last_page || 1)}
                className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
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
