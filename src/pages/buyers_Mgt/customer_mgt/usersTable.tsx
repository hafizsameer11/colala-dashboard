import React, { useMemo, useState, useEffect } from "react";
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

interface User {
  id: number;
  full_name: string;
  email: string;
  phone?: string;
  profile_picture?: string;
  role: string;
  is_active: number;
  wallet_balance: string;
  created_at: string;
  // Legacy fields for backward compatibility
  userName?: string;
  phoneNumber?: string;
  walletBalance?: string;
  userImage?: string;
}

interface UsersTableProps {
  title?: string;
  onRowSelect?: (selectedIds: string[]) => void;
  onSelectedUsersChange?: (selectedUsers: User[]) => void;
  searchQuery?: string;
  users?: User[];
  pagination?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from?: number;
    to?: number;
    prev_page_url?: string | null;
    next_page_url?: string | null;
  };
  onPageChange?: (page: number) => void;
  isLoading?: boolean;
  error?: string | null;
}

const UsersTable: React.FC<UsersTableProps> = ({
  title = "Users",
  onRowSelect,
  onSelectedUsersChange,
  searchQuery = "",
  users = [],
  pagination = null,
  onPageChange,
  isLoading = false,
  error = null,
}) => {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const navigate = useNavigate();

  // Helper function to normalize user data from API
  const normalizeUser = (user: User): User => ({
    id: user.id,
    full_name: user.full_name || 'Unknown User',
    email: user.email || 'No email',
    phone: user.phone || 'No phone',
    profile_picture: user.profile_picture,
    role: user.role || 'buyer',
    is_active: user.is_active || 0,
    wallet_balance: user.wallet_balance || '0.00',
    created_at: user.created_at || 'Unknown date',
    // Legacy fields for backward compatibility
    userName: user.full_name || 'Unknown User',
    phoneNumber: user.phone || 'No phone',
    walletBalance: user.wallet_balance || '₦0.00',
    userImage: user.profile_picture,
  });

  // Use real users data or fallback to empty array
  const normalizedUsers = users.map(normalizeUser);


  // Case-insensitive filtering on name, email, phone
  const filteredUsers = useMemo(() => {
    const q = (searchQuery || "").trim().toLowerCase();
    if (!q) return normalizedUsers;
    return normalizedUsers.filter((u) =>
      [u.full_name, u.email, u.phone || ''].some((field) =>
        field.toLowerCase().includes(q)
      )
    );
  }, [normalizedUsers, searchQuery]);

  // Keep "Select All" in sync with filtered list
  useEffect(() => {
    setSelectAll(
      filteredUsers.length > 0 &&
        filteredUsers.every((u) => selectedRows.includes(String(u.id)))
    );
  }, [filteredUsers, selectedRows]);

  // Remove the problematic useEffect hooks that cause infinite loops
  // We'll handle the selection in the event handlers instead

  const handleSelectAll = () => {
    const visibleIds = filteredUsers.map((u) => String(u.id));
    const allSelected = visibleIds.every((id) => selectedRows.includes(id));
    const newSelection = allSelected
      ? selectedRows.filter((id) => !visibleIds.includes(id)) // unselect visible
      : Array.from(new Set([...selectedRows, ...visibleIds])); // add visible
    setSelectedRows(newSelection);
    setSelectAll(!allSelected);
    
    // Call parent functions directly
    onRowSelect?.(newSelection);
    if (onSelectedUsersChange) {
      const selectedUsers = filteredUsers.filter(user => 
        newSelection.includes(String(user.id))
      );
      onSelectedUsersChange(selectedUsers);
    }
  };

  const handleRowSelect = (id: string) => {
    const isSelected = selectedRows.includes(id);
    const newSelection = isSelected
      ? selectedRows.filter((rowId) => rowId !== id)
      : [...selectedRows, id];

    setSelectedRows(newSelection);
    setSelectAll(
      filteredUsers.length > 0 &&
        filteredUsers.every((u) => newSelection.includes(String(u.id)))
    );
    
    // Call parent functions directly
    onRowSelect?.(newSelection);
    if (onSelectedUsersChange) {
      const selectedUsers = filteredUsers.filter(user => 
        newSelection.includes(String(user.id))
      );
      onSelectedUsersChange(selectedUsers);
    }
  };

  const handleCustomerDetails = (user: User) => {
    navigate(`/customer-details/${user.id}`, { state: user });
  };

  const handleTransactions = (user: User) => {
    navigate(`/customer-details/${user.id}`, { 
      state: { ...user, activeTab: 'Transactions' } 
    });
  };

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
                  checked={selectAll}
                  onChange={handleSelectAll}
                  className="w-5 h-5"
                />
              </th>
              <th className="p-3 text-left font-semibold">User Name</th>
              <th className="p-3 text-center font-semibold">Email</th>
              <th className="p-3 text-center font-semibold">Phone No</th>
              <th className="p-3 text-center font-semibold">Wallet Balance</th>
              <th className="p-3 text-center font-semibold">Actions</th>
              <th className="p-3 text-left font-semibold">Other</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7} className="p-6 text-center">
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E53E3E]"></div>
                  </div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-red-500">
                  <p className="text-sm">Error loading users</p>
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
              <tr
                key={user.id}
                className="text-center border-t border-gray-200"
              >
                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(String(user.id))}
                    onChange={() => handleRowSelect(String(user.id))}
                    className="w-5 h-5"
                  />
                </td>
                <td className="p-3 text-left flex items-center justify-start gap-2">
                  <img
                    src={user.profile_picture 
                      ? `https://colala.hmstech.xyz/storage/${user.profile_picture}` 
                      : "/assets/layout/admin.png"
                    }
                    alt="User"
                    className="w-8 h-8 rounded-full object-cover"
                    onError={(e) => {
                      // Fallback to dummy image if API image fails to load
                      e.currentTarget.src = "/assets/layout/admin.png";
                    }}
                  />
                  <span>{user.full_name}</span>
                </td>
                <td className="p-3">{user.email}</td>
                <td className="p-3">{user.phone || 'No phone'}</td>
                <td className="p-3 font-bold">₦{user.wallet_balance}</td>
                <td className="p-3 space-x-1">
                  <button
                    onClick={() => handleCustomerDetails(user)}
                    className="bg-[#E53E3E] hover:bg-red-600 text-white px-4 py-2 rounded-lg cursor-pointer"
                  >
                    Customer Details
                  </button>
                  <button 
                    onClick={() => handleTransactions(user)}
                    className="bg-black hover:bg-gray-900 text-white px-4 py-2 rounded-lg cursor-pointer"
                  >
                    Transactions
                  </button>
                </td>
                <td className="p-3">
                  <DotsDropdown
                    onActionSelect={(action) =>
                      console.log(`Action ${action} for user ${user.id}`)
                    }
                  />
                </td>
              </tr>
            ))
            )}
            {!isLoading && !error && filteredUsers.length === 0 && (
              <tr>
                <td colSpan={7} className="p-6 text-center text-gray-500">
                  No users found for "{searchQuery}".
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.last_page > 1 && (
        <div className="flex justify-between items-center mt-4 px-4 py-3 bg-white border-t border-gray-200">
          <div className="text-sm text-gray-700">
            Showing {pagination.from} to {pagination.to} of {pagination.total} results
          </div>
          <div className="flex items-center space-x-2">
            {/* Previous Button */}
            <button
              onClick={() => onPageChange?.(pagination.current_page - 1)}
              disabled={!pagination.prev_page_url}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            {/* Page Numbers */}
            <div className="flex space-x-1">
              {Array.from({ length: Math.min(5, pagination.last_page) }, (_, i) => {
                const pageNum = i + 1;
                const isActive = pageNum === pagination.current_page;
                return (
                  <button
                    key={pageNum}
                    onClick={() => onPageChange?.(pageNum)}
                    className={`px-3 py-1 text-sm border rounded-md ${
                      isActive
                        ? 'bg-[#E53E3E] text-white border-[#E53E3E]'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            {/* Next Button */}
            <button
              onClick={() => onPageChange?.(pagination.current_page + 1)}
              disabled={!pagination.next_page_url}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersTable;
