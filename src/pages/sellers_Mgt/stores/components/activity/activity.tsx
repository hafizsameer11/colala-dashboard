import React, { useState, useRef, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import images from "../../../../../constants/images";
import BulkActionDropdown from "../../../../../components/BulkActionDropdown";
import AddStoreModal from "../../../Modals/addStoreModel";
import { useToast } from "../../../../../contexts/ToastContext";
import { apiCall } from "../../../../../utils/customApiCall";
import Cookies from "js-cookie";


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

const Activity: React.FC<ActivityProps> = ({ userData }) => {
  // const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
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
                  <button className="bg-white rounded-2xl px-6 py-2 text-black">
                    Topup
                  </button>
                </div>
                <div>
                  <button className="bg-white rounded-2xl px-6 py-2 text-black">
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
    </>
  );
};

export default Activity;
