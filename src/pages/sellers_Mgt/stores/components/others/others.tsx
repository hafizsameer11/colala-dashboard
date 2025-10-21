import images from "../../../../../constants/images";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSellerCoupons, createSellerCoupon, updateSellerCoupon, deleteSellerCoupon, getSellerLoyaltySettings, updateSellerLoyaltySettings, getSellerLoyaltyCustomers } from "../../../../../utils/queries/users";
import NewCoupon from "../../../Modals/newCoupon";
import PointsSettings from "../../../Modals/pointsSettings";
import NewUser from "../../../Modals/newUser";

const Others = () => {
  const { storeId } = useParams<{ storeId: string }>();
  const [activeTab, setActiveTab] = useState("Coupons");
  const tabs = ["Coupons", "Points"];
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [showPointsModal, setShowPointsModal] = useState(false);
  const [showNewUserModal, setShowNewUserModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingCoupon, setEditingCoupon] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);

  const queryClient = useQueryClient();

  // Helper function to construct proper image URL
  const getImageUrl = (profilePicture: string | null) => {
    if (!profilePicture) return images.sasha;
    return `https://colala.hmstech.xyz/storage/${profilePicture}`;
  };

  // Fetch coupons data
  const { data: couponsData, isLoading: couponsLoading, error: couponsError } = useQuery({
    queryKey: ['sellerCoupons', storeId, currentPage],
    queryFn: () => {
      if (!storeId) return Promise.reject(new Error('Store ID is required'));
      return getSellerCoupons(storeId, currentPage);
    },
    enabled: !!storeId && activeTab === "Coupons",
  });

  // Fetch loyalty settings
  const { data: loyaltySettingsData, isLoading: loyaltySettingsLoading, error: loyaltySettingsError } = useQuery({
    queryKey: ['sellerLoyaltySettings', storeId],
    queryFn: () => {
      if (!storeId) return Promise.reject(new Error('Store ID is required'));
      return getSellerLoyaltySettings(storeId);
    },
    enabled: !!storeId && activeTab === "Points",
  });

  // Fetch loyalty customers
  const { data: loyaltyCustomersData, isLoading: loyaltyCustomersLoading, error: loyaltyCustomersError } = useQuery({
    queryKey: ['sellerLoyaltyCustomers', storeId],
    queryFn: () => {
      if (!storeId) return Promise.reject(new Error('Store ID is required'));
      return getSellerLoyaltyCustomers(storeId);
    },
    enabled: !!storeId && activeTab === "Points",
  });

  // Create coupon mutation
  const createCouponMutation = useMutation({
    mutationFn: (couponData: any) => createSellerCoupon(storeId!, couponData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sellerCoupons', storeId] });
      setShowCouponModal(false);
    },
    onError: (error) => {
      console.error('Failed to create coupon:', error);
      alert('Failed to create coupon. Please try again.');
    },
  });

  // Update coupon mutation
  const updateCouponMutation = useMutation({
    mutationFn: ({ couponId, couponData }: { couponId: string | number; couponData: any }) => 
      updateSellerCoupon(storeId!, couponId, couponData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sellerCoupons', storeId] });
      setShowCouponModal(false);
    },
    onError: (error) => {
      console.error('Failed to update coupon:', error);
      alert('Failed to update coupon. Please try again.');
    },
  });

  // Delete coupon mutation
  const deleteCouponMutation = useMutation({
    mutationFn: (couponId: string | number) => deleteSellerCoupon(storeId!, couponId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sellerCoupons', storeId] });
    },
    onError: (error) => {
      console.error('Failed to delete coupon:', error);
      alert('Failed to delete coupon. Please try again.');
    },
  });

  // Update loyalty settings mutation
  const updateLoyaltySettingsMutation = useMutation({
    mutationFn: (settingsData: any) => updateSellerLoyaltySettings(storeId!, settingsData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sellerLoyaltySettings', storeId] });
      setShowPointsModal(false);
    },
    onError: (error) => {
      console.error('Failed to update loyalty settings:', error);
      alert('Failed to update loyalty settings. Please try again.');
    },
  });

  // Extract data
  const coupons = couponsData?.data?.coupons || [];
  const couponsPagination = couponsData?.data?.pagination;
  const loyaltySettings = loyaltySettingsData?.data?.settings;
  const loyaltyCustomers = loyaltyCustomersData?.data?.customers || [];
  const totalPointsBalance = loyaltyCustomersData?.data?.total_points_balance || 0;

  // Debug logging
  console.log('Loyalty Settings Data:', loyaltySettings);
  console.log('Loyalty Customers Data:', loyaltyCustomers);
  console.log('Total Points Balance:', totalPointsBalance);
  
  // Log individual customer data for debugging
  if (loyaltyCustomers.length > 0) {
    console.log('Sample customer data:', loyaltyCustomers[0]);
    console.log('Customer profile_picture:', loyaltyCustomers[0]?.profile_picture);
    console.log('Constructed image URL:', getImageUrl(loyaltyCustomers[0]?.profile_picture));
  }

  const handleCreateCoupon = (couponData: any) => {
    createCouponMutation.mutate(couponData);
  };

  const handleUpdateCoupon = (couponData: any) => {
    if (editingCoupon) {
      updateCouponMutation.mutate({ couponId: editingCoupon.id, couponData });
    }
  };

  const handleDeleteCoupon = (couponId: string | number) => {
    if (window.confirm('Are you sure you want to delete this coupon?')) {
      deleteCouponMutation.mutate(couponId);
    }
  };

  const handleEditCoupon = (coupon: any) => {
    setEditingCoupon(coupon);
    setEditMode(true);
    setShowCouponModal(true);
  };

  const handleCloseCouponModal = () => {
    setShowCouponModal(false);
    setEditMode(false);
    setEditingCoupon(null);
  };

  const handleUpdateLoyaltySettings = (settingsData: any) => {
    console.log('Others - handleUpdateLoyaltySettings called with:', settingsData);
    updateLoyaltySettingsMutation.mutate(settingsData);
  };

  const handlePageChange = (page: number) => {
    if (page !== currentPage) setCurrentPage(page);
  };

  const TabButtons = () => (
    <div className="flex items-center space-x-0.5 border border-[#989898] rounded-lg p-2 w-fit bg-white">
      {tabs.map((tab) => {
        const isActive = activeTab === tab;
        return (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-2 text-sm rounded-lg font-normal transition-all duration-200 cursor-pointer ${isActive ? "px-8 bg-[#E53E3E] text-white" : "px-8 text-black"
              }`}
          >
            {tab}
          </button>
        );
      })}
    </div>
  );

  return (
    <>
      <div>
        <div className="flex flex-row justify-between items-center">
          {/* Card 1 */}
          <div
            className="flex flex-row rounded-2xl  w-95"
            style={{ boxShadow: "0px 0px 2px 0px rgba(0, 0, 0, 0.25)" }}
          >
            <div className="bg-[#E53E3E] rounded-l-2xl p-7 flex justify-center items-center ">
              <img className="w-9 h-9" src={images.transaction1} alt="" />
            </div>
            <div className="flex flex-col bg-[#FFF1F1] rounded-r-2xl p-3 pr-11 gap-1">
              <span className="font-semibold text-[15px]">Total Coupons</span>
              <span className="font-semibold text-2xl">
                {couponsLoading ? "..." : couponsPagination?.total || 0}
              </span>
              <span className="text-[#00000080] text-[13px] ">
                <span className="text-[#1DB61D]">Active</span> coupons available
              </span>
            </div>
          </div>

          {/* Card 2 */}
          <div
            className="flex flex-row rounded-2xl w-95"
            style={{ boxShadow: "0px 0px 2px 0px rgba(0, 0, 0, 0.25)" }}
          >
            <div className="bg-[#E53E3E] rounded-l-2xl p-7 flex justify-center items-center ">
              <img className="w-9 h-9" src={images.transaction1} alt="" />
            </div>
            <div className="flex flex-col bg-[#FFF1F1] rounded-r-2xl p-3 pr-11 gap-1">
              <span className="font-semibold text-[15px]">
                Total Points Balance
              </span>
              <span className="font-semibold text-2xl">
                {loyaltyCustomersLoading ? "..." : totalPointsBalance.toLocaleString()}
              </span>
              <span className="text-[#00000080] text-[13px] ">
                <span className="text-[#1DB61D]">Points</span> across all customers
              </span>
            </div>
          </div>

          {/* Card 3 */}
          <div
            className="flex flex-row rounded-2xl w-95"
            style={{ boxShadow: "0px 0px 2px 0px rgba(0, 0, 0, 0.25)" }}
          >
            <div className="bg-[#E53E3E] rounded-l-2xl p-7 flex justify-center items-center ">
              <img className="w-9 h-9" src={images.transaction1} alt="" />
            </div>
            <div className="flex flex-col bg-[#FFF1F1] rounded-r-2xl p-3  gap-1">
              <span className="font-semibold text-[15px]">
                Ratings & Reviews
              </span>
              <div className="flex flex-row items-center gap-1">
                <div className="font-semibold text-2xl">4.5</div>
                <div>
                  <img className="w-5 h-5" src={images.start1} alt="" />
                </div>
              </div>
              <div className="text-[#00000080] text-[13px] flex flex-row items-center gap-2.5">
                <div>
                  <span className="text-[#1DB61D]">+5%</span> increase from last
                  month
                </div>
                <div>
                  <button className="bg-[#E53E3E] text-white px-4 py-2 rounded-xl cursor-pointer">
                    View All
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-row justify-between mt-5 gap-5">
          <div
            className="flex flex-col border border-[#989898] rounded-2xl w-full"
            style={{ boxShadow: "0px 0px 2px 0px rgba(0, 0, 0, 0.25)" }}
          >
            <div className="bg-[#F2F2F2] text-xl font-medium p-5 rounded-t-2xl">
              Coupon & Points
            </div>
            <div className="p-5 flex flex-col bg-white rounded-b-2xl gap-5">
              <div className="flex flex-row justify-between">
                <div>
                  <TabButtons />
                </div>
                <div>
                  {activeTab === "Coupons" ? (
                    <button
                      className="bg-[#E53E3E] text-white cursor-pointer px-6 py-3.5 rounded-2xl"
                      onClick={() => setShowCouponModal(true)}
                    >
                      Add New Code
                    </button>
                  ) : (
                    <button
                      className="bg-[#E53E3E] text-white cursor-pointer px-6 py-3.5 rounded-2xl"
                      onClick={() => setShowPointsModal(true)}
                    >
                      Points Settings
                    </button>
                  )}
                </div>
              </div>

              {activeTab === "Coupons" ? (
                // Coupons Section
                <>
                  {couponsLoading ? (
                    <div className="flex justify-center items-center py-8">
                      <div className="text-lg">Loading coupons...</div>
                    </div>
                  ) : couponsError ? (
                    <div className="flex justify-center items-center py-8">
                      <div className="text-lg text-red-500">Error loading coupons</div>
                    </div>
                  ) : coupons.length === 0 ? (
                    <div className="flex justify-center items-center py-8">
                      <div className="text-lg text-gray-500">No coupons found</div>
                    </div>
                  ) : (
                    <>
                      {coupons.map((coupon: any) => (
                        <div
                          key={coupon.id}
                          className="rounded-2xl flex flex-col p-3"
                          style={{ boxShadow: "0px 0px 4px 0px rgba(0, 0, 0, 0.25)" }}
                        >
                          <div className="border border-[#00000080] rounded-lg p-5 flex items-center justify-center text-xl font-semibold">
                            {coupon.code}
                          </div>
                          <div className="flex flex-row justify-between mt-3">
                            <div className="text-[#00000080] text-md">
                              Discount Type
                            </div>
                            <div className="font-semibold">
                              {coupon.discount_type === 'percentage' ? 'Percentage' : 'Fixed'}
                            </div>
                          </div>
                          <div className="flex flex-row justify-between mt-3">
                            <div className="text-[#00000080] text-md">
                              Discount Value
                            </div>
                            <div className="font-semibold">
                              {coupon.discount_value}%
                            </div>
                          </div>
                          <div className="flex flex-row justify-between mt-3">
                            <div className="text-[#00000080] text-md">
                              Date Created
                            </div>
                            <div className="font-semibold">
                              {new Date(coupon.created_at).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="flex flex-row justify-between mt-3">
                            <div className="text-[#00000080] text-md">
                              Times Used
                            </div>
                            <div className="font-semibold">{coupon.times_used}</div>
                          </div>
                          <div className="flex flex-row justify-between mt-3">
                            <div className="text-[#00000080] text-md">
                              Maximum Usage
                            </div>
                            <div className="font-semibold">{coupon.max_usage}</div>
                          </div>
                          <div className="flex flex-row justify-between mt-3">
                            <div className="text-[#00000080] text-md">
                              Status
                            </div>
                            <div className={`font-semibold ${coupon.status === 'active' ? 'text-green-500' : 'text-red-500'}`}>
                              {coupon.status}
                            </div>
                          </div>
                          {coupon.expiry_date && (
                            <div className="flex flex-row justify-between mt-3">
                              <div className="text-[#00000080] text-md">
                                Expiry Date
                              </div>
                              <div className="font-semibold">
                                {new Date(coupon.expiry_date).toLocaleDateString()}
                              </div>
                            </div>
                          )}
                          <div className="flex flex-row gap-4 mt-3">
                            <button
                              onClick={() => handleEditCoupon(coupon)}
                              disabled={updateCouponMutation.isPending}
                              className="border border-[#B8B8B8] rounded-xl p-3 cursor-pointer hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Edit Coupon"
                            >
                              <img src={images.edit1} alt="Edit" />
                            </button>
                            <button
                              onClick={() => handleDeleteCoupon(coupon.id)}
                              disabled={deleteCouponMutation.isPending}
                              className="border border-[#B8B8B8] rounded-xl p-3 cursor-pointer hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Delete Coupon"
                            >
                              <img src={images.delete1} alt="Delete" />
                            </button>
                          </div>
                        </div>
                      ))}

                      {/* Pagination */}
                      {couponsPagination && couponsPagination.last_page > 1 && (
                        <div className="flex justify-center items-center gap-2 mt-6">
                          <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Previous
                          </button>
                          <span className="px-4 py-2">
                            Page {currentPage} of {couponsPagination.last_page}
                          </span>
                          <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === couponsPagination.last_page}
                            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Next
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </>
              ) : (
                // Points Section
                <>
                  <div
                    className="flex flex-col p-4 gap-2 rounded-2xl"
                    style={{
                      background:
                        "linear-gradient(92.04deg, #F90909 1.72%, #920C5F 98.14%)",
                    }}
                  >
                    <div className="text-white text-lg">
                      Total Points Balance
                    </div>
                    <div className="text-white font-bold text-2xl">
                      {loyaltyCustomersLoading ? "..." : totalPointsBalance.toLocaleString()}
                    </div>
                  </div>

                  <div className="text-xl font-medium">Customers Points</div>

                  {loyaltyCustomersLoading ? (
                    <div className="flex justify-center items-center py-8">
                      <div className="text-lg">Loading customers...</div>
                    </div>
                  ) : loyaltyCustomersError ? (
                    <div className="flex justify-center items-center py-8">
                      <div className="text-lg text-red-500">Error loading customers</div>
                    </div>
                  ) : loyaltyCustomers.length === 0 ? (
                    <div className="flex justify-center items-center py-8">
                      <div className="text-lg text-gray-500">No customers found</div>
                    </div>
                  ) : (
                    loyaltyCustomers.map((customer: any, index: number) => (
                      <div
                        key={customer.user_id || index}
                        className="flex flex-row justify-between p-2 rounded-2xl"
                        style={{ boxShadow: "0px 0px 4px 0px rgba(0, 0, 0, 0.25)" }}
                      >
                        <div className="flex flex-row gap-2 items-center">
                          <div>
                            <img 
                              className="w-12 h-12 rounded-full object-cover" 
                              src={getImageUrl(customer.profile_picture)}
                              alt={customer.name || "Customer"}
                              onError={(e) => {
                                e.currentTarget.src = images.sasha;
                              }}
                            />
                          </div>
                          <div className="flex items-center font-medium">
                            {customer.name || "Unknown Customer"}
                          </div>
                        </div>
                        <div className="flex items-center font-bold text-xl text-[#E53E3E]">
                          {customer.points || 0}
                        </div>
                      </div>
                    ))
                  )}
                </>
              )}
            </div>
          </div>

          <div
            className="flex flex-col border border-[#989898] rounded-2xl w-full h-fit"
            style={{ boxShadow: "0px 0px 2px 0px rgba(0, 0, 0, 0.25)" }}
          >
            <div className="bg-[#F2F2F2]  p-4 rounded-t-2xl flex flex-row justify-between items-center">
              <div className="text-xl font-medium">Users With Access</div>
              <div>
                <button
                  className="bg-[#E53E3E] text-white rounded-xl px-6 py-2 cursor-pointer "
                  onClick={() => setShowNewUserModal(true)}
                >
                  Add New User
                </button>
              </div>
            </div>
            <div className="bg-white p-5 flex flex-col gap-5 rounded-b-2xl">
              <div className="text-[#00000080] w-110 tex-md">
                Grant users access to manage parts of your account input the
                user's email and you can add a unique password for each use
              </div>
              <div className="text-xl font-medium">Users</div>
              <div
                className="flex flex-row justify-between p-2 rounded-2xl"
                style={{ boxShadow: "0px 0px 4px 0px rgba(0, 0, 0, 0.25)" }}
              >
                <div className="flex flex-row gap-2 items-center">
                  <div>
                    <img className="w-12 h-12" src={images.sasha} alt="" />
                  </div>
                  <div className="flex flex-col justify-center">
                    <div className="font-medium">abcdef@gmail.com</div>
                    <div className="font-bold text-[#E53E3E]">Admin</div>
                  </div>
                </div>
                <div className="flex flex-row gap-4">
                  <div className="border border-[#B8B8B8] rounded-xl p-3">
                    <img src={images.edit1} alt="" />
                  </div>
                  <div className="border border-[#B8B8B8] rounded-xl p-3">
                    <img src={images.delete1} alt="" />
                  </div>
                </div>
              </div>
              <div
                className="flex flex-row justify-between p-2 rounded-2xl"
                style={{ boxShadow: "0px 0px 4px 0px rgba(0, 0, 0, 0.25)" }}
              >
                <div className="flex flex-row gap-2 items-center">
                  <div>
                    <img className="w-12 h-12" src={images.sasha} alt="" />
                  </div>
                  <div className="flex flex-col justify-center">
                    <div className="font-medium">abcdef@gmail.com</div>
                    <div className="font-bold text-[#E53E3E]">Admin</div>
                  </div>
                </div>
                <div className="flex flex-row gap-4">
                  <div className="border border-[#B8B8B8] rounded-xl p-3">
                    <img src={images.edit1} alt="" />
                  </div>
                  <div className="border border-[#B8B8B8] rounded-xl p-3">
                    <img src={images.delete1} alt="" />
                  </div>
                </div>
              </div>
              <div
                className="flex flex-row justify-between p-2 rounded-2xl"
                style={{ boxShadow: "0px 0px 4px 0px rgba(0, 0, 0, 0.25)" }}
              >
                <div className="flex flex-row gap-2 items-center">
                  <div>
                    <img className="w-12 h-12" src={images.sasha} alt="" />
                  </div>
                  <div className="flex flex-col justify-center">
                    <div className="font-medium">abcdef@gmail.com</div>
                    <div className="font-bold text-[#E53E3E]">Admin</div>
                  </div>
                </div>
                <div className="flex flex-row gap-4">
                  <div className="border border-[#B8B8B8] rounded-xl p-3">
                    <img src={images.edit1} alt="" />
                  </div>
                  <div className="border border-[#B8B8B8] rounded-xl p-3">
                    <img src={images.delete1} alt="" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <NewCoupon
          isOpen={showCouponModal}
          onClose={handleCloseCouponModal}
          onCreateCoupon={editMode ? handleUpdateCoupon : handleCreateCoupon}
          isLoading={editMode ? updateCouponMutation.isPending : createCouponMutation.isPending}
          editMode={editMode}
          initialCouponData={editingCoupon}
        />

        <PointsSettings
          isOpen={showPointsModal}
          onClose={() => setShowPointsModal(false)}
          loyaltySettings={loyaltySettings}
          onUpdateSettings={handleUpdateLoyaltySettings}
          isLoading={updateLoyaltySettingsMutation.isPending}
        />

        <NewUser
          isOpen={showNewUserModal}
          onClose={() => setShowNewUserModal(false)}
        />
      </div>
    </>
  );
};

export default Others;
