import React, { useState } from "react";
import images from "../../../../constants/images";
import { getProfilePictureUrl } from "../../../../utils/imageUtils";
import BulkActionDropdown from "../../../../components/BulkActionDropdown";

interface Admin {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  profile_picture: string | null;
  role: "admin" | "moderator" | "super_admin";
  is_active: boolean;
  wallet_balance: string;
  created_at: string;
  user_name?: string;
}

interface UserDetails {
  user_info: {
    id: number;
    full_name: string;
    email: string;
    phone: string;
    user_name: string;
    country: string;
    state: string;
    role: "buyer" | "seller";
    status: "active" | "inactive";
    profile_picture: string | null;
    user_code: string;
    created_at: string;
    updated_at: string;
  };
  wallet_info: {
    id: number;
    balance: string | null;
    escrow_balance: string | null;
    points_balance: string | null;
    created_at: string;
  };
  store_info: any | null;
  statistics: {
    total_orders: number;
    total_transactions: number;
    total_loyalty_points: number;
    total_spent: number;
    average_order_value: number;
  };
  recent_orders: any[];
  activities: Array<{
    id: number;
    activity: string;
    created_at: string;
  }>;
  recent_transactions: any[];
}

interface AdminDetailProps {
  admin: Admin;
  userDetails?: UserDetails | null;
  onBack: () => void;
  loading?: boolean;
  error?: any;
}

interface ActivityItem {
  id: string;
  activity: string;
  date: string;
}

const AdminDetail: React.FC<AdminDetailProps> = ({ 
  admin, 
  userDetails, 
  onBack, 
  loading = false, 
  error = null 
}) => {
  const [activeTab, setActiveTab] = useState("Admin Management");
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [selectAllActivities, setSelectAllActivities] = useState(false);
  const [isActionsDropdownOpen, setIsActionsDropdownOpen] = useState(false);

  const handleBulkActionSelect = (action: string) => {
    // Handle the bulk action selection from the parent component
    console.log("Bulk action selected in Orders:", action);
    // Add your custom logic here
  };

  // Use real activity data from API
  const activities: ActivityItem[] = userDetails?.activities?.map(activity => ({
    id: activity.id.toString(),
    activity: activity.activity,
    date: new Date(activity.created_at).toLocaleString()
  })) || [];

  const handleSelectAllActivities = () => {
    if (selectAllActivities) {
      setSelectedActivities([]);
    } else {
      setSelectedActivities(activities.map((activity) => activity.id));
    }
    setSelectAllActivities(!selectAllActivities);
  };

  const handleActivitySelect = (activityId: string) => {
    let newSelectedActivities;
    if (selectedActivities.includes(activityId)) {
      newSelectedActivities = selectedActivities.filter(
        (id) => id !== activityId
      );
    } else {
      newSelectedActivities = [...selectedActivities, activityId];
    }
    setSelectedActivities(newSelectedActivities);
    setSelectAllActivities(newSelectedActivities.length === activities.length);
  };

  const CustomHeader = () => (
    <div className="flex items-center justify-between p-6 bg-white border-b border-t border-[#787878]">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <span className="text-gray-400">|</span>
        <span className="text-gray-500 text-xl">User Management</span>
        <span className="text-gray-400">/</span>
        <span className="text-gray-900 text-xl font-medium">User Details</span>
      </div>

      <div className="flex items-center gap-3">
        {/* Main Tabs Group */}
        <div className="flex items-center bg-white border border-gray-300 rounded-lg p-2 overflow-x-auto">
          {["General", "Admin Management", "Categories", "Service Categories", "Brands", "FAQs", "Knowledge Base", "Terms"].map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer whitespace-nowrap ${
                  isActive
                    ? "bg-[#E53E3E] text-white"
                    : "text-gray-700 hover:text-gray-900"
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Loading user details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-600">Error loading user details. Please try again.</div>
      </div>
    );
  }

  return (
    <>
      <CustomHeader />
      <div className="p-6">
        {/* Admin Profile Card */}
        <div className="bg-[#E53E3E] rounded-2xl h-[277px] p-6 text-white mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center  gap-4">
              <img
                src={getProfilePictureUrl(admin.profile_picture, images.admin)}
                alt={admin.full_name}
                className="w-16 h-16 rounded-full -mt-26 object-cover border-2 border-white"
              />
              <div className="space-y-3">
                {/* Name and Location */}
                <div className="flex gap-12">
                  <div>
                    <div className="text-sm text-[#FFFFFF80] opacity-90 mb-4">
                      Name
                    </div>
                    <div className="font-xs text-[14px]">{admin.full_name}</div>
                  </div>
                  <div>
                    <div className="text-sm ml-22 text-[#FFFFFF80] opacity-90 mb-4">
                      Location
                    </div>
                    <div className="font-xs ml-22 text-[14px]">
                      {userDetails?.user_info?.country && userDetails?.user_info?.state 
                        ? `${userDetails.user_info.state}, ${userDetails.user_info.country}`
                        : "Not specified"}
                    </div>
                  </div>
                </div>

                {/* Email and Phone */}
                <div className="flex gap-12">
                  <div>
                    <div className="text-sm text-[#FFFFFF80] opacity-90 mb-4">
                      Email
                    </div>
                    <div className="font-xs text-[14px]">
                      {admin.email}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm ml-4 text-[#FFFFFF80] opacity-90 mb-4">
                      Phone
                    </div>
                    <div className="font-xs ml-4 text-[14px]">
                      {admin.phone}
                    </div>
                  </div>
                </div>

                {/* Account Creation */}
                <div>
                  <div className="text-sm text-[#FFFFFF80] opacity-90 mb-4">
                    Account Creation
                  </div>
                  <div className="font-xs text-[14px]">{admin.dateJoined}</div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-[0.1] mt-48">
              <button className="p-2  bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors">
                <img
                  src={images.edit}
                  alt="Edit"
                  className="w-10 h-10 cursor-pointer"
                />
              </button>
              <button className="p-2  bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors">
                <img
                  src={images.bell}
                  alt="Delete"
                  className="w-10 h-10 cursor-pointer"
                />
              </button>
              <div className="relative">
                <button
                  onClick={() =>
                    setIsActionsDropdownOpen(!isActionsDropdownOpen)
                  }
                  className="p-2  bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
                >
                  <img
                    src={images.dot}
                    alt="More"
                    className="w-10 h-10 cursor-pointer "
                  />
                </button>

                {isActionsDropdownOpen && (
                  <div className="absolute top-full right-0 mt-2 w-40 bg-white text-gray-900 border border-gray-200 rounded-lg shadow-lg z-10">
                    <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors flex items-center gap-2 first:rounded-t-lg">
                      <img
                        src="/public/assets/layout/block.svg"
                        alt="Block"
                        className="w-4 h-4"
                      />
                      Block User
                    </button>
                    <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors flex items-center gap-2 last:rounded-b-lg">
                      <img
                        src={images.delete1}
                        alt="Delete"
                        className="w-4 h-4"
                      />
                      Delete Admin
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Controls Row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            {/* Date Filter Dropdown */}
            <div className="flex flex-row items-center gap-5 border border-[#989898] rounded-lg px-4 py-3.5 bg-white cursor-pointer">
              <div>Today</div>
              <div>
                <img className="w-3 h-3 mt-1" src={images.dropdown} alt="" />
              </div>
            </div>

            {/* Bulk Action */}
            <div>
              <BulkActionDropdown onActionSelect={handleBulkActionSelect} />
            </div>
          </div>
        </div>

        {/* User Activity Section */}
        <div className="border border-[#989898] rounded-2xl w-full">
          <div className="bg-white p-5 rounded-t-2xl font-semibold text-[16px] border-b border-[#989898]">
            User Activity
          </div>
          <div className="bg-white rounded-b-2xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-[#F2F2F2]">
                <tr>
                  <th className="text-center p-3 font-semibold text-[14px] w-12">
                    <input
                      type="checkbox"
                      checked={selectAllActivities}
                      onChange={handleSelectAllActivities}
                      className="w-5 h-5 border border-gray-300 rounded cursor-pointer"
                    />
                  </th>
                  <th className="text-left p-3 font-semibold">
                    Activity
                  </th>
                  <th className="text-left p-3 font-semibold">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {activities.map((activity, index) => (
                  <tr
                    key={activity.id}
                    className={`border-t border-[#E5E5E5] transition-colors ${
                      index === activities.length - 1 ? "" : "border-b"
                    }`}
                  >
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedActivities.includes(activity.id)}
                        onChange={() => handleActivitySelect(activity.id)}
                        className="w-5 h-5 border border-gray-300 rounded cursor-pointer"
                      />
                    </td>
                    <td className="p-4  text-black">
                      {activity.activity}
                    </td>
                    <td className="p-4  text-black">
                      {activity.date}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDetail;
