import images from "../../../constants/images";
import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../../components/PageHeader";
import BulkActionDropdown from "../../../components/BulkActionDropdown";
import AllUsersTable from "./components/allUsersTable";
import StatCard from "../../../components/StatCard";
import StatCardGrid from "../../../components/StatCardGrid";
import AddUserModal from "../../../components/addUserModel";
import { getAllUsersStats, getAllUsers } from "../../../utils/queries/users";

type Tab = "All" | "Buyers" | "Sellers";

const AllUsers = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [userRole, setUserRole] = useState<"buyer" | "seller">("buyer");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("All time");

  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchInput.trim()), 500);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Fetch all users data for export
  const { data: allUsersData } = useQuery({
    queryKey: ['allUsers', currentPage, debouncedSearch, selectedPeriod],
    queryFn: () => getAllUsers(currentPage, debouncedSearch || undefined, selectedPeriod),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Extract and transform users for export
  const allUsersRaw = useMemo(() => {
    if (!allUsersData?.data?.users) return [];
    
    return allUsersData.data.users.map((user: any) => ({
      id: user.id?.toString() || '',
      full_name: user.full_name || 'Unknown User',
      userName: user.full_name || 'Unknown User',
      user_name: user.user_name || null,
      email: user.email || 'No email',
      phone: user.phone || 'No phone',
      phoneNumber: user.phone || 'No phone',
      wallet_balance: user.wallet_balance || 0,
      walletBalance: user.wallet_balance ? `₦${user.wallet_balance}` : '₦0',
      role: user.role || 'buyer',
      userType: user.role === 'seller' ? 'Seller' : 'Buyer',
      created_at: user.created_at || user.formatted_date || null,
      createdAt: user.created_at || user.formatted_date || null,
      updated_at: user.updated_at || null,
      formatted_date: user.formatted_date || user.created_at || null,
      date: user.formatted_date || user.created_at || null,
      is_active: user.is_active !== undefined ? user.is_active : true,
      isActive: user.is_active !== undefined ? user.is_active : true,
      is_disabled: user.is_disabled || false,
      country: user.country || null,
      state: user.state || null,
      user_code: user.user_code || null,
      referral_code: user.referral_code || null,
      plan: user.plan || null,
      otp_verified: user.otp_verified || 0,
      email_verified_at: user.email_verified_at || null,
      last_seen_at: user.last_seen_at || null,
      last_login: user.last_login || null,
      status: user.status || null,
      visibility: user.visibility,
      store_id: user.store_id || null,
      store_count: user.store_count,
      total_orders: user.total_orders,
      total_revenue: user.total_revenue,
      store: user.store || null,
      wallet: user.wallet || null,
      subscription: user.subscription || null,
    }));
  }, [allUsersData]);
  
  // Users are already filtered by backend based on selectedPeriod
  const allUsers = allUsersRaw;

  // Fetch statistics
  const { data: statsData, isLoading: isLoadingStats } = useQuery({
    queryKey: ['allUsersStats', selectedPeriod],
    queryFn: () => getAllUsersStats(selectedPeriod),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Debug logging
  console.log('AllUsers Debug - Stats data:', statsData);

  const tabs: Tab[] = ["All", "Buyers", "Sellers"];

  const TabButtons = () => (
    <div 
      className="flex items-center space-x-0.5 border border-[#989898] rounded-lg p-1 sm:p-1.5 md:p-2 w-full sm:w-fit bg-white overflow-x-auto"
      style={{ 
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none'
      }}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab;
        return (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg font-normal transition-all duration-200 cursor-pointer whitespace-nowrap flex-shrink-0 ${
              isActive ? "px-2 sm:px-4 md:px-6 lg:px-8 bg-[#E53E3E] text-white" : "px-2 sm:px-3 md:px-4 text-black"
            }`}
          >
            {tab}
          </button>
        );
      })}
    </div>
  );

  const handleBulkActionSelect = (action: string) => {
    console.log("Bulk action selected in Orders:", action);
  };

  const handleUserSelection = (selectedIds: string[]) => {
    console.log("Selected user IDs:", selectedIds);
  };

  // Handler for Add New Buyer button
  const handleAddNewBuyer = () => {
    setUserRole("buyer");
    setShowAddUserModal(true);
  };

  // Handler for Add New Seller button
  const handleAddNewSeller = () => {
    // Navigate to seller stores management page where the add store functionality exists
    navigate("/stores-mgt");
  };

  // Handler for closing the add user modal
  const handleCloseAddUserModal = () => {
    setShowAddUserModal(false);
  };

  // Date period options
  const datePeriodOptions = [
    "Today",
    "This Week",
    "Last Month",
    "Last 6 Months",
    "Last Year",
    "All time",
  ];

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
    setCurrentPage(1);
  };

  return (
    <>
      <PageHeader 
        title="All Users" 
        onPeriodChange={handlePeriodChange} 
        defaultPeriod={selectedPeriod}
        timeOptions={datePeriodOptions}
      />
      <div className="p-3 sm:p-4 md:p-5">
        {isLoadingStats ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E53E3E]"></div>
          </div>
        ) : statsData?.data ? (
          <>
            <StatCardGrid columns={4}>
              <StatCard
                icon={images.Users}
                title="Total Users"
                value={statsData.data.activity_stats?.total_users || 0}
                subtitle="All registered users"
              />
              <StatCard
                icon={images.Users}
                title="Active Users"
                value={statsData.data.activity_stats?.active_users || 0}
                subtitle="Currently active"
              />
              <StatCard
                icon={images.Users}
                title="Buyer Users"
                value={statsData.data.activity_stats?.buyer_users || 0}
                subtitle="Registered buyers"
              />
              <StatCard
                icon={images.Users}
                title="Seller Users"
                value={statsData.data.activity_stats?.seller_users || 0}
                subtitle="Registered sellers"
              />
            </StatCardGrid>
            
            {/* Additional Activity Stats */}
            <div className="mt-4">
              <StatCardGrid columns={4}>
                <StatCard
                  icon={images.Users}
                  title="Users with Orders"
                  value={statsData.data.activity_stats?.users_with_orders || 0}
                  subtitle="Users who have placed orders"
                />
                <StatCard
                  icon={images.Users}
                  title="Users with Transactions"
                  value={statsData.data.activity_stats?.users_with_transactions || 0}
                  subtitle="Users with transaction history"
                />
                <StatCard
                  icon={images.Users}
                  title="Inactive Users"
                  value={statsData.data.activity_stats?.inactive_users || 0}
                  subtitle="Currently inactive"
                />
                <StatCard
                  icon={images.Users}
                  title="Registration Trends"
                  value={statsData.data.registration_trends?.length || 0}
                  subtitle="Daily registration data points"
                />
              </StatCardGrid>
            </div>

            {/* Date Range Info */}
            {statsData.data.date_range && (
              <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                  <div className="flex-1">
                    <h3 className="text-xs sm:text-sm font-semibold text-gray-800 mb-1">Data Period</h3>
                    <p className="text-xs sm:text-sm text-gray-600">
                      From {new Date(statsData.data.date_range.from).toLocaleDateString()} to {new Date(statsData.data.date_range.to).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-left sm:text-right flex-shrink-0">
                    <div className="text-xs text-gray-500 mb-1">Total Days</div>
                    <div className="text-base sm:text-lg font-semibold text-gray-800">
                      {Math.ceil((new Date(statsData.data.date_range.to).getTime() - new Date(statsData.data.date_range.from).getTime()) / (1000 * 60 * 60 * 24))} days
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center text-red-500">
            <p className="text-sm">Error loading user statistics</p>
          </div>
        )}
        {/* Filters and Actions Row - Improved Mobile Layout */}
        <div className="mt-4 sm:mt-5 flex flex-col gap-3 sm:gap-4">
          {/* Top Row: Tabs and Bulk Actions */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full">
            <div className="w-full sm:w-auto overflow-x-auto" style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              <TabButtons />
            </div>
            <div className="w-full sm:w-auto">
              <BulkActionDropdown 
                onActionSelect={handleBulkActionSelect}
                orders={allUsers}
                dataType="users"
              />
            </div>
          </div>
          
          {/* Bottom Row: Add Buttons and Search */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
              <button 
                onClick={handleAddNewBuyer}
                className="bg-black text-white cursor-pointer px-3 sm:px-4 py-2.5 sm:py-3.5 rounded-2xl hover:bg-gray-800 transition-colors duration-200 text-sm sm:text-base whitespace-nowrap w-full sm:w-auto"
              >
                Add New Buyer
              </button>
              <button 
                onClick={handleAddNewSeller}
                className="bg-[#E53E3E] text-white cursor-pointer px-3 sm:px-4 py-2.5 sm:py-3.5 rounded-2xl hover:bg-red-600 transition-colors duration-200 text-sm sm:text-base whitespace-nowrap w-full sm:w-auto"
              >
                Add New Seller
              </button>
            </div>
            <div className="relative w-full sm:w-auto sm:flex-shrink-0">
              <input
                type="text"
                placeholder="Search users..."
                value={searchInput}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onChange={(e: any) => setSearchInput(e.target.value)}
                className="pl-10 sm:pl-12 pr-4 sm:pr-6 py-2.5 sm:py-3.5 border border-[#00000080] rounded-lg text-xs sm:text-sm md:text-[15px] w-full sm:w-[280px] md:w-[363px] focus:outline-none bg-white shadow-[0_2px_6px_rgba(0,0,0,0.05)] placeholder-[#00000080]"
              />
              <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-5">
          <AllUsersTable
            onRowSelect={handleUserSelection}
            filterType={activeTab}
            searchTerm={debouncedSearch}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {/* Add User Modal */}
      <AddUserModal
        isOpen={showAddUserModal}
        onClose={handleCloseAddUserModal}
        defaultRole={userRole}
      />
    </>
  );
};

export default AllUsers;
