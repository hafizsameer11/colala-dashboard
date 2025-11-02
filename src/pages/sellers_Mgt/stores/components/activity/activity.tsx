import React, { useState, useRef, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import images from "../../../../../constants/images";
import BulkActionDropdown from "../../../../../components/BulkActionDropdown";
import AddStoreModal from "../../../Modals/addStoreModel";
import { useToast } from "../../../../../contexts/ToastContext";
import { apiCall } from "../../../../../utils/customApiCall";
import Cookies from "js-cookie";
import { getUserNotifications } from "../../../../../utils/queries/users";
import { API_ENDPOINTS } from "../../../../../config/apiConfig";


interface ActivityProps {
  userData: {
    // User Info
    id?: string | number;
    full_name?: string;
    userName?: string;
    username?: string | null;
    email?: string;
    phone?: string;
    phoneNumber?: string;
    profile_picture?: string | null;
    profileImage?: string | null;
    is_verified?: number;
    is_active?: number;
    created_at?: string;
    last_login?: string;
    location?: string;
    
    // Store Info
    storeName?: string;
    storeEmail?: string;
    storePhone?: string;
    storeLocation?: string;
    bannerImage?: string | null;
    banner_image?: string | null;
    themeColor?: string | null;
    theme_color?: string | null;
    storeStatus?: string;
    status?: string;
    onboardingStatus?: string;
    onboarding_status?: string;
    businessDetails?: {
      businessType?: string;
      description?: string;
      website?: string;
      [key: string]: unknown;
    };
    business_details?: {
      businessType?: string;
      description?: string;
      website?: string;
      [key: string]: unknown;
    };
    
    // Financial Info
    walletBalance?: string;
    escrowBalance?: string | number;
    rewardBalance?: string | number;
    referralBalance?: string | number;
    loyaltyPoints?: string | number;
    
    // Store Data Arrays
    addresses?: Array<{
      id: number;
      store_id: number;
      state: string;
      local_government: string;
      full_address: string;
      is_main: boolean;
      opening_hours?: Array<{
        day: string;
        open_time: string;
        close_time: string;
      }>;
      created_at: string;
      updated_at: string;
    }>;
    deliveryPricing?: Array<{
      id: number;
      store_id: number;
      state: string;
      local_government: string;
      variant: string;
      price: string;
      is_free: number;
      created_at: string;
      updated_at: string;
    }>;
    socialLinks?: Array<{
      type: string;
      url: string;
      id?: string;
    }>;
    social_links?: Array<{
      type: string;
      url: string;
      id?: string;
    }>;
    categories?: Array<{
      id: number;
      name: string;
      description?: string;
    }>;
    
    // Statistics
    statistics?: {
      total_products?: number;
      total_orders?: number;
      total_revenue?: {
        amount: string;
        formatted: string;
      };
      total_customers?: number;
      average_rating?: number;
    };
    
    // Activities
    recentActivities?: Array<{ 
      id: number; 
      activity: string; 
      created_at: string 
    }>;
    recent_activities?: Array<{ 
      id: number; 
      activity: string; 
      created_at: string 
    }>;
    
    // Legacy fields for backward compatibility
    isVerified?: boolean;
    createdAt?: string;
  };
}

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

const updateSellerWallet = async (sellerId: string | number, action: 'topup' | 'withdraw', amount: number, description?: string) => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  try {
    const response = await apiCall(
      API_ENDPOINTS.STORE_DATA.TabsData.UpdateWallet(sellerId),
      'POST',
      { action, amount, description },
      token
    );
    return response;
  } catch (error) {
    console.error('Update seller wallet API call error:', error);
    throw error;
  }
};

const Activity: React.FC<ActivityProps> = ({ userData }) => {
  // const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState("");
  const [topUpDescription, setTopUpDescription] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawDescription, setWithdrawDescription] = useState("");
  const [notificationsPage, setNotificationsPage] = useState(1);
  const [notificationsFilter, setNotificationsFilter] = useState<'read' | 'unread' | undefined>(undefined);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
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
      
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['sellersList'] });
      queryClient.invalidateQueries({ queryKey: ['sellers'] });
      queryClient.invalidateQueries({ queryKey: ['sellerDetails'] });
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
      
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['sellersList'] });
      queryClient.invalidateQueries({ queryKey: ['sellers'] });
      queryClient.invalidateQueries({ queryKey: ['sellerDetails'] });
      
      // Redirect to sellers list after successful deletion
      setTimeout(() => {
        window.location.href = '/stores-mgt';
      }, 1500);
    },
    onError: (error) => {
      console.error('Remove seller error:', error);
      showToast('Failed to remove seller', 'error');
    },
  });

  // Top up wallet mutation
  const topUpMutation = useMutation({
    mutationFn: ({ amount, description }: { amount: number; description?: string }) => 
      updateSellerWallet(userData.id!, 'topup', amount, description),
    onSuccess: () => {
      showToast('Wallet topped up successfully!', 'success');
      setShowTopUpModal(false);
      setTopUpAmount("");
      setTopUpDescription("");
      // Refresh seller details to update wallet balance
      queryClient.invalidateQueries({ queryKey: ['sellerDetails', userData.id] });
    },
    onError: (error: unknown) => {
      console.error('Top up error:', error);
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to top up wallet. Please try again.';
      showToast(errorMessage, 'error');
    },
  });

  // Withdraw wallet mutation
  const withdrawMutation = useMutation({
    mutationFn: ({ amount, description }: { amount: number; description?: string }) => 
      updateSellerWallet(userData.id!, 'withdraw', amount, description),
    onSuccess: () => {
      showToast('Amount withdrawn successfully!', 'success');
      setShowWithdrawModal(false);
      setWithdrawAmount("");
      setWithdrawDescription("");
      // Refresh seller details to update wallet balance
      queryClient.invalidateQueries({ queryKey: ['sellerDetails', userData.id] });
    },
    onError: (error: unknown) => {
      console.error('Withdraw error:', error);
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to withdraw amount. Please try again.';
      showToast(errorMessage, 'error');
    },
  });

  // Get seller notifications query
  const { data: notificationsData, isLoading: isLoadingNotifications } = useQuery({
    queryKey: ['userNotifications', userData.id, notificationsPage, notificationsFilter],
    queryFn: () => getUserNotifications(userData.id!, notificationsPage, notificationsFilter),
    enabled: showNotificationsModal && !!userData.id,
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes
  });

  // Debug logging
  console.log('Activity component userData:', userData);
  console.log('Profile image URL:', userData.profileImage);

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
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleDropdownAction = (action: string) => {
    console.log(`${action} action triggered for seller:`, userData.userName || userData.full_name);
    setIsDropdownOpen(false);
    
    if (!userData.id) {
      showToast('Seller ID not found', 'error');
      return;
    }
    
    if (action === 'Toggle Block') {
      // Check current status to determine block/unblock action
      const isCurrentlyBlocked = userData.is_active === 0;
      const blockAction = isCurrentlyBlocked ? 'unblock' : 'block';
      
      toggleBlockMutation.mutate({
        sellerId: userData.id,
        action: blockAction
      });
    } else if (action === 'Delete Seller') {
      if (window.confirm('Are you sure you want to remove this seller? This action cannot be undone.')) {
        removeSellerMutation.mutate(userData.id);
      }
    } else {
      showToast('Unknown action', 'error');
    }
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
            onClick={() => !toggleBlockMutation.isPending && !removeSellerMutation.isPending && handleDropdownAction("Toggle Block")}
            className={`flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer ${
              toggleBlockMutation.isPending || removeSellerMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''
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
              {toggleBlockMutation.isPending ? 'Processing...' : 
               userData.is_active === 0 ? 'Unblock Seller' : 'Block Seller'}
            </span>
          </div>

          <div
            onClick={() => !toggleBlockMutation.isPending && !removeSellerMutation.isPending && handleDropdownAction("Delete Seller")}
            className={`flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer ${
              toggleBlockMutation.isPending || removeSellerMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''
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
              {removeSellerMutation.isPending ? 'Processing...' : 'Delete Seller'}
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
                {userData.walletBalance || 'N0'}
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
              <span className="text-4xl font-semibold">{userData.escrowBalance || 'N0'}</span>
            </div>
          </div>
          <div
            className="bg-[#E53E3E] flex flex-row w-full rounded-r-2xl gap-5 "
            style={{ boxShadow: "0px 0px 2px 0px rgba(0, 0, 0, 0.25)" }}
          >
            <div className=" flex flex-col">
              <div>
                <img
                  className="w-20 h-20 ml-5 mt-10 rounded-full object-cover"
                  src={userData.profileImage || userData.profile_picture || images.admin}
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = images.admin; }}
                  alt="Profile"
                />
              </div>
              {(userData.isVerified || userData.is_verified === 1) && (
                <div className="flex flex-row rounded-full text-[#E53E3E] items-center p-2 gap-3 mt-2 ml-2.5 bg-white ">
                  <div>Verified</div>
                  <div>
                    <img src={images.verified} alt="" />
                  </div>
                </div>
              )}
            </div>
            <div className=" flex flex-row p-5 gap-14">
              <div className="flex flex-col gap-5">
                <span className="text-[#FFFFFF80] text-[16px]">Name</span>
                <span className="text-white">{userData.userName || userData.full_name}</span>
                <span className="text-[#FFFFFF80] text-[16px]">Email</span>
                <span className="text-white">{userData.email}</span>
                <span className="text-[#FFFFFF80] text-[16px]">
                  Phone Number
                </span>
                <span className="text-white">{userData.phoneNumber || userData.phone}</span>
              </div>
              <div className="flex flex-col gap-5">
                <span className="text-[#FFFFFF80] text-[16px]">Location</span>
                <span className="text-white">{userData.location ?? 'N/A'}</span>
                <span className="text-[#FFFFFF80] text-[16px]">Last Login</span>
                <span className="text-white">{userData.last_login || 'N/A'}</span>
                <span className="text-[#FFFFFF80] text-[16px]">
                  Account Creation
                </span>
                <span className="text-white">{userData.created_at || 'N/A'}</span>
              </div>
              <div className="flex flex-col gap-5">
                <span className="text-[#FFFFFF80] text-[16px]">Username</span>
                <span className="text-white">{userData.username ?? 'N/A'}</span>
                {/* <span className="text-[#FFFFFF80] text-[16px]">
                  Loyalty Points
                </span>
                <div className="text-white flex flex-row gap-2">
                  <span className="font-bold">200</span>
                  <span
                    className="cursor-pointer underline"
                    onClick={() => setShowModal(true)}
                  >
                    View Details
                  </span>
                </div> */}
                <div className="flex flex-row mt-10 gap-2">
                  <div>
                    <img
                      className="w-10 h-10 cursor-pointer"
                      src={images.edit}
                      alt=""
                      onClick={() => setShowEditModal(true)}
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
          <div className="flex flex-row items-center gap-5 border border-[#989898] rounded-lg px-4 py-2 bg-white cursor-pointer">
            <div>Today</div>
            <div>
              <img className="w-3 h-3 mt-1" src={images.dropdown} alt="" />
            </div>
          </div>
          <div>
            <BulkActionDropdown onActionSelect={handleBulkActionSelect} />
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
                  {(userData.recentActivities ?? []).length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-6 text-center text-gray-500">No activities</td>
                    </tr>
                  ) : (
                    (userData.recentActivities ?? []).map((a) => (
                      <tr key={a.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <input
                            type="checkbox"
                            className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                          />
                        </td>
                        <td className="py-3 px-4 text-gray-800">{a.activity || 'N/A'}</td>
                        <td className="py-3 px-4 text-center text-gray-600">{a.created_at || 'N/A'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {/* <AddUserModal isOpen={showModal} onClose={() => setShowModal(false)} /> */}

      {/* Edit Store Modal */}
      <AddStoreModal 
        isOpen={showEditModal} 
        onClose={() => setShowEditModal(false)}
        initialTab="Level 1"
        editMode={true}
        initialStoreData={{
          id: String(userData.id),
          storeName: userData.storeName || userData.full_name,
          email: userData.storeEmail || userData.email,
          phoneNumber: userData.storePhone || userData.phoneNumber || userData.phone,
          category: userData.categories?.[0]?.id,
          showPhoneOnProfile: true, // Default value
          profileImage: userData.profileImage || userData.profile_picture,
          bannerImage: userData.bannerImage || userData.banner_image,
          socialLinks: userData.socialLinks || userData.social_links || [],
          location: userData.storeLocation || userData.location,
          storeStatus: userData.storeStatus || userData.status,
          businessDetails: userData.businessDetails || userData.business_details,
          addresses: userData.addresses,
          deliveryPricing: userData.deliveryPricing,
          isVerified: userData.isVerified || userData.is_verified === 1,
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
                  onChange={(e) => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    setTopUpAmount((e.target as any).value);
                  }}
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
                  onChange={(e) => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    setTopUpDescription((e.target as any).value);
                  }}
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
                  onChange={(e) => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    setWithdrawAmount((e.target as any).value);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E53E3E]"
                  placeholder="Enter amount"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Available Balance: ₦{userData.walletBalance || '0'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  value={withdrawDescription}
                  onChange={(e) => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    setWithdrawDescription((e.target as any).value);
                  }}
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
                {notificationsData.data.notifications.map((notification: { id: number; title?: string; message?: string; body?: string; is_read?: boolean; created_at: string }) => (
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
