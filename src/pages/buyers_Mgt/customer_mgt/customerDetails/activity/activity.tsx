import React, { useState, useRef, useEffect, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { bulkActionUsers, getUserNotifications } from "../../../../../utils/queries/users";
import { topUpWallet, withdrawWallet } from "../../../../../utils/mutations/users";
import { useToast } from "../../../../../contexts/ToastContext";
import images from "../../../../../constants/images";
import BulkActionDropdown from "../../../../../components/BulkActionDropdown";
import EditUserModal from "../../../../../components/editUserModel";

interface ActivityProps {
  userData: {
    id?: string | number;
    full_name?: string;
    user_name?: string;
    email?: string;
    phone?: string;
    country?: string;
    state?: string;
    profile_picture?: string | null;
    last_login?: string;
    account_created_at?: string;
    loyalty_points?: number;
    is_blocked?: boolean;
    role?: string;
    wallet?: {
      shopping_balance?: string;
      escrow_balance?: string;
    };
    statistics?: {
      total_orders?: number;
      total_transactions?: number;
      total_loyalty_points?: number;
      total_spent?: number;
      average_order_value?: number;
    };
    activities?: Array<{
      id: number;
      activity: string;
      created_at: string;
    }>;
    // Legacy fields for backward compatibility
    userName?: string;
    phoneNumber?: string;
    walletBalance?: string;
  };
}

const Activity: React.FC<ActivityProps> = ({ userData }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>("All Time");
  const [topUpAmount, setTopUpAmount] = useState("");
  const [topUpDescription, setTopUpDescription] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawDescription, setWithdrawDescription] = useState("");
  const [notificationsPage, setNotificationsPage] = useState(1);
  const [notificationsFilter, setNotificationsFilter] = useState<'read' | 'unread' | undefined>(undefined);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const filterDropdownRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  // Bulk action mutation
  const bulkActionMutation = useMutation({
    mutationFn: ({ userIds, action }: { userIds: string[], action: 'activate' | 'deactivate' | 'delete' }) => 
      bulkActionUsers(userIds, action),
    onSuccess: (_, variables) => {
      const actionMessages = {
        activate: 'User activated successfully',
        deactivate: 'User deactivated successfully', 
        delete: 'User deleted successfully'
      };
      showToast(actionMessages[variables.action], 'success');
      
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['usersList'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['buyerUsers'] });
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
      queryClient.invalidateQueries({ queryKey: ['userStats'] });
      
      // If user was deleted, redirect or handle accordingly
      if (variables.action === 'delete') {
        // You might want to redirect to users list or close the modal
        setTimeout(() => {
          window.location.href = '/customer-mgt';
        }, 1500);
      }
    },
    onError: (error) => {
      console.error('Bulk action error:', error);
      showToast('Failed to perform action', 'error');
    },
  });

  // Top up wallet mutation
  const topUpMutation = useMutation({
    mutationFn: ({ amount, description }: { amount: number; description?: string }) => 
      topUpWallet(userData.id!, amount, description),
    onSuccess: () => {
      showToast('Wallet topped up successfully!', 'success');
      setShowTopUpModal(false);
      setTopUpAmount("");
      setTopUpDescription("");
      // Refresh user details to update wallet balance
      queryClient.invalidateQueries({ queryKey: ['userDetails', userData.id] });
    },
    onError: (error: any) => {
      console.error('Top up error:', error);
      const errorMessage = error?.response?.data?.message || 'Failed to top up wallet. Please try again.';
      showToast(errorMessage, 'error');
    },
  });

  // Withdraw wallet mutation
  const withdrawMutation = useMutation({
    mutationFn: ({ amount, description }: { amount: number; description?: string }) => 
      withdrawWallet(userData.id!, amount, description),
    onSuccess: () => {
      showToast('Amount withdrawn successfully!', 'success');
      setShowWithdrawModal(false);
      setWithdrawAmount("");
      setWithdrawDescription("");
      // Refresh user details to update wallet balance
      queryClient.invalidateQueries({ queryKey: ['userDetails', userData.id] });
    },
    onError: (error: any) => {
      console.error('Withdraw error:', error);
      const errorMessage = error?.response?.data?.message || 'Failed to withdraw amount. Please try again.';
      showToast(errorMessage, 'error');
    },
  });

  // Get user notifications query
  const { data: notificationsData, isLoading: isLoadingNotifications } = useQuery({
    queryKey: ['userNotifications', userData.id, notificationsPage, notificationsFilter],
    queryFn: () => getUserNotifications(userData.id!, notificationsPage, notificationsFilter),
    enabled: showNotificationsModal && !!userData.id,
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes
  });

  const handleBulkActionSelect = (action: string) => {
    // Handle the bulk action selection from the parent component
    console.log("Bulk action selected in Activity:", action);
    // Add your custom logic here
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
      if (
        filterDropdownRef.current &&
        !filterDropdownRef.current.contains(event.target as Node)
      ) {
        setIsFilterDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleDropdownAction = (action: string) => {
    console.log(`${action} action triggered for user:`, userData.userName);
    setIsDropdownOpen(false);
    
    if (!userData.id) {
      showToast('User ID not found', 'error');
      return;
    }
    
    const actionMap: Record<string, 'activate' | 'deactivate' | 'delete'> = {
      'Block User': 'deactivate',
      'Delete User': 'delete'
    };
    
    const mappedAction = actionMap[action];
    if (mappedAction) {
      bulkActionMutation.mutate({
        userIds: [String(userData.id)],
        action: mappedAction
      });
    } else {
      showToast('Unknown action', 'error');
    }
  };

  const handleEditUser = () => {
    setShowEditModal(true);
  };

  const handleTopUp = () => {
    setShowTopUpModal(true);
  };

  const handleWithdraw = () => {
    setShowWithdrawModal(true);
  };

  const handleTopUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(topUpAmount);
    if (isNaN(amount) || amount <= 0) {
      showToast('Please enter a valid amount', 'error');
      return;
    }
    topUpMutation.mutate({ amount, description: topUpDescription || undefined });
  };

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      showToast('Please enter a valid amount', 'error');
      return;
    }
    withdrawMutation.mutate({ amount, description: withdrawDescription || undefined });
  };

  const handleBellClick = () => {
    setShowNotificationsModal(true);
  };

  // Filter activities based on selected period
  const filterActivities = (activities: Array<{ id: number; activity: string; created_at: string }>, filter: string) => {
    if (!activities || activities.length === 0) return [];
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (filter) {
      case "Today":
        return activities.filter((activity) => {
          const activityDate = new Date(activity.created_at);
          return activityDate >= today;
        });
      case "This Week":
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return activities.filter((activity) => {
          const activityDate = new Date(activity.created_at);
          return activityDate >= weekAgo;
        });
      case "This Month":
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return activities.filter((activity) => {
          const activityDate = new Date(activity.created_at);
          return activityDate >= monthAgo;
        });
      case "All Time":
        return activities;
      default:
        return activities;
    }
  };

  const handleFilterSelect = (filter: string) => {
    setSelectedFilter(filter);
    setIsFilterDropdownOpen(false);
  };

  const filteredActivities = useMemo(() => {
    if (!userData?.activities || !Array.isArray(userData.activities) || userData.activities.length === 0) {
      return [];
    }
    return filterActivities(userData.activities, selectedFilter);
  }, [userData?.activities, selectedFilter]);

  const DotsDropdown = () => (
    <div className="relative" ref={dropdownRef}>
      <div
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="cursor-pointer"
      >
        <img className="w-10 h-10 cursor-pointer" src={images.dot} alt="" />
      </div>

      {isDropdownOpen && (
        <div
          className="absolute right-0 top-12 bg-white rounded-lg border border-gray-200 py-2 w-48 z-50"
          style={{ boxShadow: "5px 5px 15px 0px rgba(0, 0, 0, 0.25)" }}
        >
          <div
            onClick={() => !bulkActionMutation.isPending && handleDropdownAction("Block User")}
            className={`flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer ${
              bulkActionMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <svg
              className="w-5 h-5 mr-3 text-gray-600"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM4 12c0-4.42 3.58-8 8-8 1.85 0 3.55.63 4.9 1.69L5.69 16.9C4.63 15.55 4 13.85 4 12zm8 8c-1.85 0-3.55-.63-4.9-1.69L18.31 7.1C19.37 8.45 20 10.15 20 12c0 4.42-3.58 8-8 8z"
                fill="currentColor"
              />
            </svg>
            <span className="text-gray-800 font-medium">
              {bulkActionMutation.isPending ? 'Processing...' : 'Block User'}
            </span>
          </div>

          <div
            onClick={() => !bulkActionMutation.isPending && handleDropdownAction("Delete User")}
            className={`flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer ${
              bulkActionMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <svg
              className="w-5 h-5 mr-3 text-gray-600"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"
                fill="currentColor"
              />
            </svg>
            <span className="text-gray-800 font-medium">
              {bulkActionMutation.isPending ? 'Processing...' : 'Delete User'}
            </span>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      <div className="">
        <div className="flex flex-row">
          <div className="flex flex-col ">
            <div className="bg-[#FF6B6B] w-[350px] text-white flex flex-col rounded-tl-2xl p-5 gap-6">
              <span className="text-xl font-normal">
                Shopping Wallet Balance
              </span>
              <span className="text-4xl font-semibold">
                ₦{userData.wallet?.shopping_balance || userData.walletBalance || '0'}
              </span>
              <div className="flex flex-row gap-5 ">
                <div>
                  <button 
                    onClick={handleTopUp}
                    className="bg-white rounded-2xl px-6 py-2 text-black hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    Topup
                  </button>
                </div>
                <div>
                  <button 
                    onClick={handleWithdraw}
                    className="bg-white rounded-2xl px-6 py-2 text-black hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    Withdraw
                  </button>
                </div>
              </div>
            </div>
            <div className="bg-[#731313] text-white rounded-bl-2xl p-5 flex flex-col gap-5 w-[350px]">
              <span className="text-xl font-normal">Escrow Wallet Balance</span>
              <span className="text-4xl font-semibold">₦{userData.wallet?.escrow_balance || '0'}</span>
            </div>
          </div>
          <div
            className="bg-[#E53E3E] flex flex-row w-full rounded-r-2xl gap-5 "
            style={{ boxShadow: "0px 0px 2px 0px rgba(0, 0, 0, 0.25)" }}
          >
            <div className="ml-5 mt-10">
              <img 
                className="w-20 h-20 rounded-full object-cover" 
                src={userData.profile_picture 
                  ? `https://colala.hmstech.xyz/storage/${userData.profile_picture}` 
                  : images.admin
                } 
                alt="Profile" 
                onError={(e) => {
                  e.currentTarget.src = images.admin;
                }}
              />
            </div>
            <div className=" flex flex-row p-5 gap-14">
              <div className="flex flex-col gap-5">
                <span className="text-[#FFFFFF80] text-[16px]">Name</span>
                <span className="text-white">{userData.full_name || userData.userName || 'Unknown'}</span>
                <span className="text-[#FFFFFF80] text-[16px]">Email</span>
                <span className="text-white">{userData.email || 'No email'}</span>
                <span className="text-[#FFFFFF80] text-[16px]">
                  Phone Number
                </span>
                <span className="text-white">{userData.phone || userData.phoneNumber || 'No phone'}</span>
              </div>
              <div className="flex flex-col gap-5">
                <span className="text-[#FFFFFF80] text-[16px]">Location</span>
                <span className="text-white">{userData.state || 'Unknown'}, {userData.country || 'Unknown'}</span>
                <span className="text-[#FFFFFF80] text-[16px]">Last Login</span>
                <span className="text-white">
                  {userData?.activities?.[0]?.created_at 
                    ? new Date(userData?.activities?.[0]?.created_at).toLocaleDateString() 
                    : 'Never'
                  }
                </span>
                <span className="text-[#FFFFFF80] text-[16px]">
                  Account Creation
                </span>
                <span className="text-white">
                  {userData.account_created_at 
                    ? new Date(userData.account_created_at).toLocaleDateString() 
                    : 'Unknown'
                  }
                </span>
              </div>
              <div className="flex flex-col gap-5">
                <span className="text-[#FFFFFF80] text-[16px]">Username</span>
                <span className="text-white">{userData.user_name || 'Unknown'}</span>
                <span className="text-[#FFFFFF80] text-[16px]">
                  Loyalty Points
                </span>
                <div className="text-white flex flex-row gap-2">
                  <span className="font-bold">{userData.loyalty_points || 0}</span>
                  <span
                    className="cursor-pointer underline"
                    onClick={() => setShowEditModal(true)}
                  >
                    View Details
                  </span>
                </div>
                <div className="flex flex-row mt-10 gap-2">
                  <div>
                    <img
                      className="w-10 h-10 cursor-pointer"
                      src={images.edit}
                      alt=""
                      onClick={handleEditUser}
                    />
                  </div>
                  <div>
                    <img
                      className="w-10 h-10 cursor-pointer"
                      src={images.bell}
                      alt=""
                      onClick={handleBellClick}
                    />
                  </div>
                  <div>
                    <DotsDropdown />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-row mt-5 gap-5">
          <div className="relative" ref={filterDropdownRef}>
            <div 
              className="flex flex-row items-center gap-5 border border-[#989898] rounded-lg px-4 py-2 bg-white cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
            >
              <div>{selectedFilter}</div>
              <div>
                <img className="w-3 h-3 mt-1" src={images.dropdown} alt="" />
              </div>
            </div>
            
            {isFilterDropdownOpen && (
              <div
                className="absolute top-full left-0 mt-1 bg-white rounded-lg border border-[#989898] py-2 w-40 z-50 shadow-lg"
                style={{ boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)" }}
              >
                {["Today", "This Week", "This Month", "All Time"].map((filter) => (
                  <div
                    key={filter}
                    onClick={() => handleFilterSelect(filter)}
                    className={`px-4 py-2 hover:bg-gray-50 cursor-pointer transition-colors ${
                      selectedFilter === filter ? "bg-gray-100 font-semibold" : ""
                    }`}
                  >
                    {filter}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div>
            <BulkActionDropdown 
              onActionSelect={handleBulkActionSelect}
              orders={activitiesForExport}
              dataType="activities"
            />
          </div>
        </div>

        <div className="mt-5">
          <div className="bg-white rounded-2xl border border-[#989898]">
            <div className="p-5">
              <h3 className="text-lg font-semibold">User Activity</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                      />
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Activity
                    </th>
                    <th className="text-center py-3 px-4 font-medium text-gray-600">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredActivities && filteredActivities.length > 0 ? (
                    filteredActivities.map((activity) => (
                      <tr key={activity.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <input
                            type="checkbox"
                            className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                          />
                        </td>
                        <td className="py-3 px-4 text-gray-800">
                          {activity?.activity}
                        </td>
                        <td className="py-3 px-4 text-center text-gray-600">
                          {new Date(activity.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="py-8 px-4 text-center text-gray-500">
                        {userData.activities && userData.activities.length > 0 
                          ? `No activities found for ${selectedFilter.toLowerCase()}`
                          : "No recent activities found"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Edit User Modal */}
      <EditUserModal 
        isOpen={showEditModal} 
        onClose={() => setShowEditModal(false)} 
        userData={{
          user_info: {
            id: userData.id,
            full_name: userData.full_name,
            user_name: userData.user_name,
            email: userData.email,
            phone: userData.phone,
            country: userData.country,
            state: userData.state,
            role: userData.role || "buyer",
            profile_picture: userData.profile_picture,
            created_at: userData.account_created_at,
            updated_at: userData.account_created_at,
          },
          wallet_info: userData.wallet,
          statistics: userData.statistics,
        }}
      />

      {/* Top Up Modal */}
      {showTopUpModal && (
        <div 
          className="fixed inset-0 z-50 bg-[#00000080] bg-opacity-50 flex items-center justify-center"
          onClick={() => {
            if (!topUpMutation.isPending) {
              setShowTopUpModal(false);
              setTopUpAmount("");
              setTopUpDescription("");
            }
          }}
        >
          <div 
            className="bg-white rounded-2xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Top Up Wallet</h2>
              <button
                onClick={() => {
                  setShowTopUpModal(false);
                  setTopUpAmount("");
                  setTopUpDescription("");
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleTopUpSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount (₦)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E53E3E]"
                  placeholder="Enter amount"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  value={topUpDescription}
                  onChange={(e) => setTopUpDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E53E3E] resize-none"
                  rows={3}
                  placeholder="Enter description"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowTopUpModal(false);
                    setTopUpAmount("");
                    setTopUpDescription("");
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={topUpMutation.isPending}
                  className="flex-1 bg-[#E53E3E] text-white py-2 px-4 rounded-md hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {topUpMutation.isPending ? 'Processing...' : 'Top Up'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div 
          className="fixed inset-0 z-50 bg-[#00000080] bg-opacity-50 flex items-center justify-center"
          onClick={() => {
            if (!withdrawMutation.isPending) {
              setShowWithdrawModal(false);
              setWithdrawAmount("");
              setWithdrawDescription("");
            }
          }}
        >
          <div 
            className="bg-white rounded-2xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Withdraw from Wallet</h2>
              <button
                onClick={() => {
                  setShowWithdrawModal(false);
                  setWithdrawAmount("");
                  setWithdrawDescription("");
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleWithdrawSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount (₦)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E53E3E]"
                  placeholder="Enter amount"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Available Balance: ₦{userData.wallet?.shopping_balance || userData.walletBalance || '0'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  value={withdrawDescription}
                  onChange={(e) => setWithdrawDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E53E3E] resize-none"
                  rows={3}
                  placeholder="Enter description"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowWithdrawModal(false);
                    setWithdrawAmount("");
                    setWithdrawDescription("");
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={withdrawMutation.isPending}
                  className="flex-1 bg-[#E53E3E] text-white py-2 px-4 rounded-md hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {withdrawMutation.isPending ? 'Processing...' : 'Withdraw'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notifications Modal */}
      {showNotificationsModal && (
        <div 
          className="fixed inset-0 z-50 bg-[#00000080] bg-opacity-50 flex items-center justify-center"
          onClick={() => setShowNotificationsModal(false)}
        >
          <div 
            className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">User Notifications</h2>
              <button
                onClick={() => setShowNotificationsModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Filters */}
            <div className="flex gap-3 mb-4">
              <button
                onClick={() => setNotificationsFilter(undefined)}
                className={`px-4 py-2 rounded-md ${notificationsFilter === undefined ? 'bg-[#E53E3E] text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                All
              </button>
              <button
                onClick={() => setNotificationsFilter('unread')}
                className={`px-4 py-2 rounded-md ${notificationsFilter === 'unread' ? 'bg-[#E53E3E] text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                Unread
              </button>
              <button
                onClick={() => setNotificationsFilter('read')}
                className={`px-4 py-2 rounded-md ${notificationsFilter === 'read' ? 'bg-[#E53E3E] text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                Read
              </button>
            </div>

            {/* Statistics */}
            {notificationsData?.data?.statistics && (
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Total</p>
                    <p className="text-lg font-semibold">{notificationsData.data.statistics.total_notifications}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Unread</p>
                    <p className="text-lg font-semibold text-red-600">{notificationsData.data.statistics.unread_count}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Read</p>
                    <p className="text-lg font-semibold text-green-600">{notificationsData.data.statistics.read_count}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications List */}
            {isLoadingNotifications ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E53E3E]"></div>
              </div>
            ) : notificationsData?.data?.notifications && notificationsData.data.notifications.length > 0 ? (
              <div className="space-y-3">
                {notificationsData.data.notifications.map((notification: any) => (
                  <div
                    key={notification.id}
                    className={`border rounded-lg p-4 ${notification.is_read ? 'bg-gray-50' : 'bg-white border-l-4 border-l-[#E53E3E]'}`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{notification.title || 'Notification'}</p>
                        <p className="text-sm text-gray-600 mt-1">{notification.message || notification.body}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(notification.created_at).toLocaleString()}
                        </p>
                      </div>
                      {!notification.is_read && (
                        <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">New</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                No notifications found
              </div>
            )}

            {/* Pagination */}
            {notificationsData?.data?.pagination && (
              <div className="flex justify-between items-center mt-6 pt-4 border-t">
                <button
                  onClick={() => setNotificationsPage(prev => Math.max(1, prev - 1))}
                  disabled={notificationsPage === 1}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600">
                  Page {notificationsData.data.pagination.current_page} of {notificationsData.data.pagination.last_page}
                </span>
                <button
                  onClick={() => setNotificationsPage(prev => prev + 1)}
                  disabled={notificationsPage >= notificationsData.data.pagination.last_page}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Activity;
