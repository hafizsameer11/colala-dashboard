import images from "../../../constants/images";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import PageHeader from "../../../components/PageHeader";
import BulkActionDropdown from "../../../components/BulkActionDropdown";
import AllUsersTable from "./components/allUsersTable";
import StatCard from "../../../components/StatCard";
import StatCardGrid from "../../../components/StatCardGrid";
import { getAllUsers, getAllUsersStats } from "../../../utils/queries/users";

type Tab = "All" | "Buyers" | "Sellers";

const AllUsers = () => {
  const [activeTab, setActiveTab] = useState<Tab>("All");
  const [currentPage, setCurrentPage] = useState(1);

  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchInput.trim()), 500);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Fetch all users data
  const { data: allUsersData, isLoading: isLoadingUsers, error: usersError } = useQuery({
    queryKey: ['allUsers', currentPage, debouncedSearch],
    queryFn: () => getAllUsers(currentPage, debouncedSearch || undefined),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch statistics
  const { data: statsData, isLoading: isLoadingStats } = useQuery({
    queryKey: ['allUsersStats'],
    queryFn: getAllUsersStats,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const tabs: Tab[] = ["All", "Buyers", "Sellers"];

  const TabButtons = () => (
    <div className="flex items-center space-x-0.5 border border-[#989898] rounded-lg p-2 w-fit bg-white">
      {tabs.map((tab) => {
        const isActive = activeTab === tab;
        return (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-2 text-sm rounded-lg font-normal transition-all duration-200 cursor-pointer ${
              isActive ? "px-8 bg-[#E53E3E] text-white" : "px-4 text-black"
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

  return (
    <>
      <PageHeader title="All Users" />
      <div className="p-5">
        {isLoadingStats ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E53E3E]"></div>
          </div>
        ) : statsData?.data ? (
          <StatCardGrid columns={3}>
            <StatCard
              icon={images.Users}
              title="Total Users"
              value={statsData.data.statistics?.total_users || 0}
              subtitle="All registered users"
            />
            <StatCard
              icon={images.Users}
              title="Buyer Users"
              value={statsData.data.statistics?.buyer_users || 0}
              subtitle="Registered buyers"
            />
            <StatCard
              icon={images.Users}
              title="Seller Users"
              value={statsData.data.statistics?.seller_users || 0}
              subtitle="Registered sellers"
            />
          </StatCardGrid>
        ) : (
          <div className="text-center text-red-500">
            <p className="text-sm">Error loading user statistics</p>
          </div>
        )}
        <div className="mt-5 flex flex-row justify-between">
          <div className="flex gap-2">
            <div>
              <TabButtons />
            </div>
            <div>
              <BulkActionDropdown onActionSelect={handleBulkActionSelect} />
            </div>
          </div>
          <div className="flex flex-row gap-2">
            <div>
              <button className="bg-black text-white cursor-pointer px-4 py-3.5 rounded-2xl">
                Add New Buyer
              </button>
            </div>
            <div>
              <button className="bg-[#E53E3E] text-white cursor-pointer px-4 py-3.5 rounded-2xl">
                Add New Seller
              </button>
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-12 pr-6 py-3.5 border border-[#00000080] rounded-lg text-[15px] w-[363px] focus:outline-none bg-white shadow-[0_2px_6px_rgba(0,0,0,0.05)] placeholder-[#00000080]"
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
    </>
  );
};

export default AllUsers;
