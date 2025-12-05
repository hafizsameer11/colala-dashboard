import images from "../../../constants/images";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../../components/PageHeader";
import BulkActionDropdown from "../../../components/BulkActionDropdown";
import AllUsersTable from "./components/allUsersTable";
import StatCard from "../../../components/StatCard";
import StatCardGrid from "../../../components/StatCardGrid";
import AddUserModal from "../../../components/addUserModel";
import { getAllUsersStats } from "../../../utils/queries/users";
import { filterByPeriod } from "../../../utils/periodFilter";

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

  // Fetch all users data (currently not used in this component)
  // const { data: allUsersData, isLoading: isLoadingUsers, error: usersError } = useQuery({
  //   queryKey: ['allUsers', currentPage, debouncedSearch],
  //   queryFn: () => getAllUsers(currentPage, debouncedSearch || undefined),
  //   staleTime: 5 * 60 * 1000, // 5 minutes
  // });

  // Fetch statistics
  const { data: statsData, isLoading: isLoadingStats } = useQuery({
    queryKey: ['allUsersStats'],
    queryFn: getAllUsersStats,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Debug logging
  console.log('AllUsers Debug - Stats data:', statsData);

  const tabs: Tab[] = ["All", "Buyers", "Sellers"];

  const TabButtons = () => (
    <div className="flex items-center space-x-0.5 border border-[#989898] rounded-lg p-1.5 sm:p-2 w-fit bg-white overflow-x-auto">
      {tabs.map((tab) => {
        const isActive = activeTab === tab;
        return (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg font-normal transition-all duration-200 cursor-pointer whitespace-nowrap ${
              isActive ? "px-4 sm:px-6 md:px-8 bg-[#E53E3E] text-white" : "px-2 sm:px-3 md:px-4 text-black"
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

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
    setCurrentPage(1);
  };

  return (
    <>
      <PageHeader title="All Users" onPeriodChange={handlePeriodChange} defaultPeriod="All time" />
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
              <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-800 mb-1">Data Period</h3>
                    <p className="text-sm text-gray-600">
                      From {new Date(statsData.data.date_range.from).toLocaleDateString()} to {new Date(statsData.data.date_range.to).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500 mb-1">Total Days</div>
                    <div className="text-lg font-semibold text-gray-800">
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
        <div className="mt-4 sm:mt-5 flex flex-col sm:flex-row justify-between gap-3 sm:gap-0">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-2">
            <div className="overflow-x-auto">
              <TabButtons />
            </div>
            <div>
              <BulkActionDropdown onActionSelect={handleBulkActionSelect} />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-2">
            <div className="flex flex-col sm:flex-row gap-2">
              <button 
                onClick={handleAddNewBuyer}
                className="bg-black text-white cursor-pointer px-3 sm:px-4 py-2.5 sm:py-3.5 rounded-2xl hover:bg-gray-800 transition-colors duration-200 text-sm sm:text-base whitespace-nowrap"
              >
                Add New Buyer
              </button>
              <button 
                onClick={handleAddNewSeller}
                className="bg-[#E53E3E] text-white cursor-pointer px-3 sm:px-4 py-2.5 sm:py-3.5 rounded-2xl hover:bg-red-600 transition-colors duration-200 text-sm sm:text-base whitespace-nowrap"
              >
                Add New Seller
              </button>
            </div>
            <div className="relative w-full sm:w-auto">
              <input
                type="text"
                placeholder="Search"
                value={searchInput}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onChange={(e: any) => setSearchInput(e.target.value)}
                className="pl-12 pr-6 py-2.5 sm:py-3.5 border border-[#00000080] rounded-lg text-sm sm:text-[15px] w-full sm:w-[280px] md:w-[363px] focus:outline-none bg-white shadow-[0_2px_6px_rgba(0,0,0,0.05)] placeholder-[#00000080]"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
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
