import React, { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import PageHeader from "../../../components/PageHeader";
import { getUserActivities, getUserDetails } from "../../../utils/queries/users";
import images from "../../../constants/images";
import BulkActionDropdown from "../../../components/BulkActionDropdown";
import EditUserModal from "../../../components/editUserModel";
import LoyaltyPointsModal from "../../../components/loyaltyPointsModal";

const UserDetailsPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const [showLoyaltyModal, setShowLoyaltyModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Period filter shared with activities API
  const [selectedPeriod, setSelectedPeriod] = useState<string>("All time");
  const [activitiesPage, setActivitiesPage] = useState(1);
  const ACTIVITIES_PER_PAGE = 20;

  // Fetch user profile data from API
  const { data: profileData, isLoading, error } = useQuery({
    queryKey: ['userDetails', userId],
    queryFn: () => getUserDetails(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Fetch activities from new admin user activities endpoint with period filter
  const {
    data: activitiesData,
    isLoading: isLoadingActivities,
    error: activitiesError,
  } = useQuery({
    queryKey: ['userActivities', userId, activitiesPage, selectedPeriod],
    queryFn: () => getUserActivities(userId!, activitiesPage, selectedPeriod, ACTIVITIES_PER_PAGE),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
  });

  // Extract the user data from API response
  const userData = profileData?.data;

  // Debug logging
  console.log('UserDetailsPage Debug - userData:', userData);

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
    setActivitiesPage(1);
    console.log("Period changed to:", period);
  };

  const handleBulkActionSelect = (action: string) => {
    console.log("Bulk action selected:", action);
  };

  // Normalise activities from API (new route) or fallback to userData.activities
  let activities: Array<{ id: number; activity?: string; description?: string; created_at: string }> =
    userData?.activities || [];

  if (activitiesData?.data?.activities) {
    const rawActivities = activitiesData.data.activities;
    const list = Array.isArray(rawActivities)
      ? rawActivities
      : Array.isArray(rawActivities.data)
        ? rawActivities.data
        : [];
    activities = list;
  }

  const activitiesPagination =
    activitiesData?.data?.activities && !Array.isArray(activitiesData.data.activities)
      ? activitiesData.data.activities
      : null;

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
    console.log(`${action} action triggered for user:`, userData?.user_info?.full_name);
    setIsDropdownOpen(false);
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
            onClick={() => handleDropdownAction("Block User")}
            className="flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer"
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
            <span className="text-gray-800 font-medium">Block User</span>
          </div>

          <div
            onClick={() => handleDropdownAction("Delete User")}
            className="flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer"
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
            <span className="text-gray-800 font-medium">Delete User</span>
          </div>
        </div>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <div>
        <PageHeader title="User Details" />
        <div className="bg-[#F5F5F5] min-h-screen p-5">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E53E3E]"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <PageHeader title="User Details" />
        <div className="bg-[#F5F5F5] min-h-screen p-5">
          <div className="flex justify-center items-center h-64">
            <div className="text-center text-red-500">
              <p className="text-lg font-semibold">Error loading user profile</p>
              <p className="text-sm">{error.message}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 text-[20px] font-semibold">
            <div className="flex items-center gap-1">
              <span style={{ color: "#00000080" }}>All Users</span>
              <span className="mx-1">/</span>
              <span className="text-black">User Details</span>
            </div>
          </div>
        }
        onPeriodChange={handlePeriodChange}
        defaultPeriod={selectedPeriod}
        timeOptions={[
          "Today",
          "This Week",
          "This Month",
          "Last Month",
          "This Year",
          "All time",
        ]}
      />

      <div className="bg-[#F5F5F5] min-h-screen p-5">
        <div className="">
          <div className="flex flex-row">
            <div className="flex flex-col ">
              <div className="bg-[#FF6B6B] w-[350px] text-white flex flex-col rounded-tl-2xl p-5 gap-6">
                <span className="text-xl font-normal">
                  Shopping Wallet Balance
                </span>
                <span className="text-4xl font-semibold">
                  ₦{userData?.wallet_info?.balance || '0'}
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
                <span className="text-4xl font-semibold">₦{userData?.wallet_info?.escrow_balance || '0'}</span>
              </div>
            </div>
            <div
              className="bg-[#E53E3E] flex flex-row w-full rounded-r-2xl gap-5 "
              style={{ boxShadow: "0px 0px 2px 0px rgba(0, 0, 0, 0.25)" }}
            >
              <div className="ml-5 mt-10">
                <img 
                  className="w-20 h-20 rounded-full object-cover" 
                  src={userData?.user_info?.profile_picture 
                    ? `hhttps://api.colalamall.com/storage/${userData.user_info.profile_picture}` 
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
                  <span className="text-white">{userData?.user_info?.full_name || 'Unknown'}</span>
                  <span className="text-[#FFFFFF80] text-[16px]">Email</span>
                  <span className="text-white">{userData?.user_info?.email || 'No email'}</span>
                  <span className="text-[#FFFFFF80] text-[16px]">
                    Phone Number
                  </span>
                  <span className="text-white">{userData?.user_info?.phone || 'No phone'}</span>
                </div>
                <div className="flex flex-col gap-5">
                  <span className="text-[#FFFFFF80] text-[16px]">Location</span>
                  <span className="text-white">{userData?.user_info?.state || 'Unknown'}, {userData?.user_info?.country || 'Unknown'}</span>
                  <span className="text-[#FFFFFF80] text-[16px]">Last Login</span>
                  <span className="text-white">{userData?.user_info?.last_login || 'Never'}</span>
                  <span className="text-[#FFFFFF80] text-[16px]">
                    Account Creation
                  </span>
                  <span className="text-white">{userData?.user_info?.created_at ? new Date(userData.user_info.created_at).toLocaleDateString() : 'Unknown'}</span>
                </div>
                <div className="flex flex-col gap-5">
                  <span className="text-[#FFFFFF80] text-[16px]">Username</span>
                  <span className="text-white">{userData?.user_info?.user_name || userData?.user_info?.full_name || 'Unknown'}</span>
                  <span className="text-[#FFFFFF80] text-[16px]">
                    Loyalty Points
                  </span>
                  <div className="text-white flex flex-row gap-2">
                    <span className="font-bold">{userData?.statistics?.total_loyalty_points || 0}</span>
                    <span
                      className="cursor-pointer underline"
                      onClick={() => setShowLoyaltyModal(true)}
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
              <div>{selectedPeriod}</div>
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
                {isLoadingActivities ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E53E3E]"></div>
                  </div>
                ) : activitiesError ? (
                  <div className="py-8 px-4 text-center text-red-500">
                    Failed to load activities
                  </div>
                ) : (
                  <>
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
                        {activities && activities.length > 0 ? (
                          activities.map((activity) => (
                            <tr key={activity.id} className="hover:bg-gray-50">
                              <td className="py-3 px-4">
                                <input
                                  type="checkbox"
                                  className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                                />
                              </td>
                              <td className="py-3 px-4 text-gray-800">
                                {activity.activity || activity.description || '—'}
                              </td>
                              <td className="py-3 px-4 text-center text-gray-600">
                                {activity.created_at}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={3} className="py-8 px-4 text-center text-gray-500">
                              No recent activities found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>

                    {activitiesPagination && (
                      <div className="flex justify-between items-center mt-4 px-5 pb-4">
                        <button
                          onClick={() => setActivitiesPage((prev) => Math.max(1, prev - 1))}
                          disabled={activitiesPagination.current_page <= 1}
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Previous
                        </button>
                        <span className="text-sm text-gray-600">
                          Page {activitiesPagination.current_page} of{" "}
                          {activitiesPagination.last_page ?? activitiesPagination.current_page}
                        </span>
                        <button
                          onClick={() => setActivitiesPage((prev) => prev + 1)}
                          disabled={
                            activitiesPagination.last_page
                              ? activitiesPagination.current_page >= activitiesPagination.last_page
                              : false
                          }
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Loyalty Points Modal */}
        <LoyaltyPointsModal 
          isOpen={showLoyaltyModal} 
          onClose={() => setShowLoyaltyModal(false)} 
          userData={userData}
        />
        
        {/* Edit User Modal */}
        <EditUserModal 
          isOpen={showEditModal} 
          onClose={() => setShowEditModal(false)} 
          userData={userData}
        />
      </div>
    </div>
  );
};

export default UserDetailsPage;
