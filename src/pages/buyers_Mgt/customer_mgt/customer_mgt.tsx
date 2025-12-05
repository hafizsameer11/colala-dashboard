import PageHeader from "../../../components/PageHeader";
import StatCard from "../../../components/StatCard";
import StatCardGrid from "../../../components/StatCardGrid";
import images from "../../../constants/images";
import BulkActionDropdown from "../../../components/BulkActionDropdown";
import UsersTable from "./usersTable";
import AddUserModal from "../../../components/addUserModel";
import { useState } from "react";
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
  
  const debouncedQuery = useDebouncedValue(query, 400);

  // ============================================================================
  // API DATA FETCHING
  // ============================================================================
  
  /**
   * Fetch user statistics (total, active, new users)
   */
  const { data: userStats, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ['userStats'],
    queryFn: getUserStats,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  /**
   * Fetch users list with pagination and search
   */
  const { data: usersData, isLoading: usersLoading, error: usersError } = useQuery({
    queryKey: ['usersList', currentPage, debouncedQuery],
    queryFn: () => getUsersList(currentPage, debouncedQuery),
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes
  });

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================
  
  const handleUserSelection = (selectedIds: string[]) => {
    // Handle user selection
  };

  const handleSelectedUsersChange = (users: any[]) => {
    setSelectedUsers(users);
  };

  const [selectedPeriod, setSelectedPeriod] = useState<string>("All time");

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
      <PageHeader title="User Management" onPeriodChange={handlePeriodChange} defaultPeriod="All time" />

      <div className="bg-[#F5F5F5]">
        <div className="p-3 sm:p-4 md:p-5">
          {/* ========================================================================
              USER STATISTICS CARDS
          ======================================================================== */}
          {statsLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E53E3E]"></div>
            </div>
          ) : statsError ? (
            <div className="flex justify-center items-center h-32">
              <div className="text-red-500 text-center">
                <p className="text-sm">Error loading user statistics</p>
              </div>
            </div>
          ) : (
            <StatCardGrid columns={3}>
              <StatCard
                icon={images.Users}
                title="Total Users"
                value={userStats?.data?.total_users?.value || 0}
                subtitle={`+${userStats?.data?.total_users?.increase || 0}% increase from last month`}
              />
              <StatCard
                icon={images.Users}
                title="Active Users"
                value={userStats?.data?.active_users?.value || 0}
                subtitle={`+${userStats?.data?.active_users?.increase || 0}% increase from last month`}
              />
              <StatCard
                icon={images.Users}
                title="New Users"
                value={userStats?.data?.new_users?.value || 0}
                subtitle={`+${userStats?.data?.new_users?.increase || 0}% increase from last month`}
              />
            </StatCardGrid>
          )}

          <div className="mt-4 sm:mt-5">
            <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0">
              <div>
                <BulkActionDropdown 
                  onActionSelect={handleBulkActionSelect}
                  orders={usersData?.data?.data || []}
                  selectedOrders={selectedUsers}
                  dataType="users"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:gap-5">
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
              users={usersData?.data?.data || []}
              pagination={usersData?.data || null}
              onPageChange={handlePageChange}
              isLoading={usersLoading}
              error={usersError}
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
