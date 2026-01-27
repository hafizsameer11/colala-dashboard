import PageHeader from "../../../components/PageHeader";
import StatCard from "../../../components/StatCard";
import StatCardGrid from "../../../components/StatCardGrid";
import images from "../../../constants/images";
import BulkActionDropdown from "../../../components/BulkActionDropdown";
import UsersTable from "./usersTable";
import AddUserModal from "../../../components/addUserModel";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getUserStats, getUsersList } from "../../../utils/queries/users";
import useDebouncedValue from "../../../hooks/useDebouncedValue";

const customer_mgt = () => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  const [showModal, setShowModal] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Date period filter - synchronized with PageHeader
  const [selectedPeriod, setSelectedPeriod] = useState<string>("All time");
  const datePeriodOptions = [
    "Today",
    "This Week",
    "This Month",
    "All time",
  ];
  
  const debouncedQuery = useDebouncedValue(query, 400);

  // ============================================================================
  // API DATA FETCHING
  // ============================================================================
  
  /**
   * Fetch users list with pagination and search
   * Note: This endpoint also returns statistics in the response
   */
  const { data: usersData, isLoading: usersLoading, error: usersError } = useQuery({
    queryKey: ['usersList', currentPage, debouncedQuery, selectedPeriod],
    queryFn: () => getUsersList(currentPage, debouncedQuery, selectedPeriod),
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes
  });

  /**
   * Fetch user statistics (always fetch for accurate stats)
   * The users list endpoint includes stats, but we'll use the dedicated stats endpoint for reliability
   */
  const { data: userStats, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ['userStats', selectedPeriod],
    queryFn: () => getUserStats(selectedPeriod),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Get users from API response (API handles filtering by period)
  const allUsers = usersData?.data?.users || usersData?.data?.data || [];
  
  // Calculate new users (users created in the last 30 days) from API data
  // Note: This is calculated from the filtered data returned by the API
  const newUsersCount = useMemo(() => {
    if (!allUsers || allUsers.length === 0) return 0;
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    return allUsers.filter((user: any) => {
      if (!user.created_at) return false;
      const createdDate = new Date(user.created_at);
      return createdDate >= thirtyDaysAgo;
    }).length;
  }, [allUsers]);

  // Extract statistics - ALWAYS prioritize usersData since it includes stats in the response
  // Use useMemo to ensure stable reference and proper extraction
  const statistics = useMemo(() => {
    // ALWAYS use usersData?.data?.statistics first (this is the primary source from getUsersList)
    // Only fall back to userStats if usersData statistics are not available
    const rawStatistics = usersData?.data?.statistics 
      ? usersData.data.statistics 
      : (userStats?.data?.statistics || userStats?.data || {});
    
    // Helper function to extract numeric value (handles both direct numbers and objects with value property)
    const getStatValue = (stat: any): number => {
      if (stat === null || stat === undefined) return 0;
      if (typeof stat === 'number') return stat;
      if (typeof stat === 'string') {
        const parsed = parseInt(stat, 10);
        return isNaN(parsed) ? 0 : parsed;
      }
      if (typeof stat === 'object' && stat !== null) {
        // Check if it's an object with a 'value' property
        if ('value' in stat) {
          return typeof stat.value === 'number' ? stat.value : 0;
        }
        // If it's an array, return its length (shouldn't happen, but handle it)
        if (Array.isArray(stat)) {
          return stat.length;
        }
      }
      return 0;
    };

    // Extract and normalize statistics values - ensure we get the actual numbers
    const stats = {
      total_users: getStatValue(rawStatistics?.total_users),
      buyer_users: getStatValue(rawStatistics?.buyer_users),
      seller_users: getStatValue(rawStatistics?.seller_users),
      active_users: getStatValue(rawStatistics?.active_users),
      inactive_users: getStatValue(rawStatistics?.inactive_users),
    };
    
    // Debug: Log the data structures to understand the response
    console.log('=== Statistics Debug (Customer Management) ===');
    console.log('Full usersData object:', JSON.stringify(usersData, null, 2));
    console.log('usersData?.data:', usersData?.data);
    console.log('usersData?.data?.statistics:', usersData?.data?.statistics);
    console.log('userStats?.data:', userStats?.data);
    console.log('userStats?.data?.statistics:', userStats?.data?.statistics);
    console.log('Selected Raw Statistics:', rawStatistics);
    console.log('Final Normalized Statistics:', stats);
    console.log('=============================================');
    
    return stats;
  }, [usersData, userStats]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================
  
  const handleUserSelection = (selectedIds: string[]) => {
    // Handle user selection
  };

  const handleSelectedUsersChange = (users: any[]) => {
    setSelectedUsers(users);
  };

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
    setCurrentPage(1);
    console.log("Period changed to:", period);
  };

  const handleBulkActionSelect = (action: string) => {
    console.log("Bulk action selected:", action);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleUsersDeleted = (deletedUserIds: string[]) => {
    // Users are automatically refreshed via query invalidation
    // This callback can be used for additional logic if needed
    console.log('Users deleted:', deletedUserIds);
  };


  return (
    <>
      <PageHeader 
        title="User Management" 
        onPeriodChange={handlePeriodChange} 
        defaultPeriod={selectedPeriod}
        timeOptions={datePeriodOptions}
      />

      <div className="bg-[#F5F5F5]">
        <div className="p-3 sm:p-4 md:p-5">
          {/* ========================================================================
              USER STATISTICS CARDS
          ======================================================================== */}
          {usersLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E53E3E]"></div>
            </div>
          ) : usersError ? (
            <div className="flex justify-center items-center h-32">
              <div className="text-red-500 text-center">
                <p className="text-sm">Error loading user data</p>
              </div>
            </div>
          ) : (
            <StatCardGrid columns={3}>
              <StatCard
                icon={images.Users}
                title="Total Users"
                value={statistics.total_users}
                // subtitle={`${statistics.buyer_users} buyers, ${statistics.seller_users} sellers`}
              />
              <StatCard
                icon={images.Users}
                title="Active Users"
                value={statistics.active_users}
                // subtitle={`${statistics.inactive_users} inactive users`}
              />
              <StatCard
                icon={images.Users}
                title="New Users"
                value={newUsersCount}
                // subtitle="Users registered in the last 30 days"
              />
            </StatCardGrid>
          )}

          <div className="mt-4 sm:mt-5">
            <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0">
              <div>
                <BulkActionDropdown 
                  onActionSelect={handleBulkActionSelect}
                  orders={allUsers}
                  selectedOrders={selectedUsers}
                  dataType="users"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-5">
                <div>
                  <button
                    onClick={() => setShowModal(true)}
                    className="bg-[#E53E3E] text-white px-4 sm:px-5 py-2.5 sm:py-3.5 rounded-lg cursor-pointer text-center text-sm sm:text-base w-full sm:w-auto whitespace-nowrap"
                  >
                    Add new user
                  </button>
                </div>
                <div className="w-full sm:w-auto">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)} // <-- controlled input
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
            </div>
          </div>

          <div className="mt-5">
              <UsersTable
              title="Users"
              onRowSelect={handleUserSelection}
              onSelectedUsersChange={handleSelectedUsersChange}
              onUsersDeleted={handleUsersDeleted}
              searchQuery={debouncedQuery}
              users={allUsers}
              pagination={usersData?.data || null}
              onPageChange={handlePageChange}
              isLoading={usersLoading}
              error={usersError ? (usersError instanceof Error ? usersError.message : String(usersError)) : null}
            />
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      <AddUserModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  );
};

export default customer_mgt;
