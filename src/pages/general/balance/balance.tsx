import PageHeader from "../../../components/PageHeader";
import images from "../../../constants/images";
import { useState, useEffect, useMemo } from "react";
import BulkActionDropdown from "../../../components/BulkActionDropdown";
import AllUsersTable from "./components/allUsersTable";
import UserBalanceDetailsModal from "./components/userBalanceDetailsModal";
import { useQuery } from "@tanstack/react-query";
import { getBalanceData } from "../../../utils/queries/users";

type Tab = "All" | "Buyers" | "Sellers";

const Balance = () => {
  const [activeTab, setActiveTab] = useState<Tab>("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [showUserDetailsModal, setShowUserDetailsModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<string>("All time");
  const tabs: Tab[] = ["All", "Buyers", "Sellers"];
  
  // Date period options
  const datePeriodOptions = [
    "Today",
    "This Week",
    "Last Month",
    "Last 6 Months",
    "Last Year",
    "All time",
  ];

  // Debounced search
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchInput.trim()), 500);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Fetch balance data
  const { data: balanceData, isLoading, error } = useQuery({
    queryKey: ['balanceData', currentPage, selectedPeriod],
    queryFn: () => getBalanceData(currentPage, selectedPeriod),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const statistics = balanceData?.data?.statistics;
  const usersRaw = balanceData?.data?.users || [];
  const pagination = balanceData?.data?.pagination;
  
  // Transform users for export with balance information (backend handles period filtering)
  const usersForExport = useMemo(() => {
    return usersRaw.map((user: any) => ({
      id: user.id?.toString() || '',
      full_name: user.full_name || 'Unknown User',
      userName: user.full_name || 'Unknown User',
      email: user.email || 'No email',
      phone: user.phone || 'No phone',
      phoneNumber: user.phone || 'No phone',
      role: user.role || 'buyer',
      userType: user.role === 'seller' ? 'Seller' : 'Buyer',
      shopping_balance: user.shopping_balance || 0,
      reward_balance: user.reward_balance || 0,
      referral_balance: user.referral_balance || 0,
      loyalty_points: user.loyalty_points || 0,
      escrow_balance: user.escrow_balance || 0,
      created_at: user.created_at || user.formatted_date || null,
      createdAt: user.created_at || user.formatted_date || null,
      formatted_date: user.formatted_date || user.created_at || null,
      date: user.formatted_date || user.created_at || null,
      is_active: true,
      isActive: true,
    }));
  }, [usersRaw]);
  
  // Users for table display (backend handles period filtering)
  const users = usersRaw;

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

  const handleUserDetailsClick = (userId: number) => {
    setSelectedUserId(userId);
    setShowUserDetailsModal(true);
  };

  const handleCloseUserDetailsModal = () => {
    setShowUserDetailsModal(false);
    setSelectedUserId(null);
  };
  
  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
    setCurrentPage(1); // Reset to first page when period changes
  };

  return (
    <>
      <PageHeader 
        title="Balance"
        defaultPeriod={selectedPeriod}
        timeOptions={datePeriodOptions}
        onPeriodChange={handlePeriodChange}
      />
      <div className="p-3 sm:p-4 md:p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Total Shopping wallet balance */}
          <div
            className="flex flex-col rounded-2xl p-4 sm:p-5 md:p-6 w-full min-w-0"
            style={{
              boxShadow: "0px 0px 2px 0px rgba(0, 0, 0, 0.25)",
              background:
                "linear-gradient(115.92deg, #FF0000 2.93%, #2C0182 100.86%)",
            }}
          >
            <div className="flex flex-row items-start ">
              <div className="mr-4">
                <img src={images.balance1} alt="" className="w-12 h-12" />
              </div>
              <div className="flex flex-col gap-2 flex-1">
                <div className="text-white font-semibold text-lg">
                  Total Shopping wallet balance
                </div>
                <div className="text-white font-bold text-3xl">
                  ₦{statistics?.total_shopping_balance || "0"}
                </div>
              </div>
            </div>
            <div className="flex flex-row justify-between mt-6 pt-4 ">
              <div className="flex flex-col gap-1">
                <div className="text-lg text-[#FFFFFF80]">
                  Buyer App Balance
                </div>
                <div className="text-2xl text-white font-bold">
                  ₦{statistics?.buyer_shopping_balance || "0"}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <div className="text-lg text-[#FFFFFF80]">
                  Seller App Balance
                </div>
                <div className="text-2xl text-white font-bold">
                  ₦{statistics?.seller_shopping_balance || "0"}
                </div>
              </div>
            </div>
          </div>

          {/* Total Escrow wallet balance */}
          <div
            className="flex flex-col rounded-2xl p-4 sm:p-5 md:p-6 w-full min-w-0"
            style={{
              boxShadow: "0px 0px 2px 0px rgba(0, 0, 0, 0.25)",
              background:
                "linear-gradient(115.92deg, #FF0000 2.93%, #2C0182 100.86%)",
            }}
          >
            <div className="flex flex-row items-start">
              <div className="mr-4">
                <img src={images.balance1} alt="" className="w-12 h-12" />
              </div>
              <div className="flex flex-col gap-2 flex-1">
                <div className="text-white font-semibold text-lg">
                  Total Escrow wallet balance
                </div>
                <div className="text-white font-bold text-3xl">
                  ₦{statistics?.total_escrow_balance || "0"}
                </div>
              </div>
            </div>
            <div className="flex flex-row justify-between mt-6 pt-4 ">
              <div className="flex flex-col gap-1">
                <div className="text-lg text-[#FFFFFF80]">
                  Buyer App Balance
                </div>
                <div className="text-2xl text-white font-bold">
                  ₦{statistics?.buyer_escrow_balance || "0"}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <div className="text-lg text-[#FFFFFF80]">
                  Seller App Balance
                </div>
                <div className="text-2xl text-white font-bold">
                  ₦{statistics?.seller_escrow_balance || "0"}
                </div>
              </div>
            </div>
          </div>

          {/* Total points balance */}
          <div
            className="flex flex-col rounded-2xl p-4 sm:p-5 md:p-6 w-full min-w-0"
            style={{
              boxShadow: "0px 0px 2px 0px rgba(0, 0, 0, 0.25)",
              background:
                "linear-gradient(115.92deg, #FF0000 2.93%, #2C0182 100.86%)",
            }}
          >
            <div className="flex flex-row items-start">
              <div className="mr-4">
                <img src={images.balance1} alt="" className="w-12 h-12" />
              </div>
              <div className="flex flex-col gap-2 flex-1">
                <div className="text-white font-semibold text-lg">
                  Total points balance
                </div>
                <div className="text-white font-bold text-3xl">
                  {statistics?.total_loyalty_points || "0"}
                </div>
              </div>
            </div>
            <div className="flex flex-row justify-between mt-6 pt-4 ">
              <div className="flex flex-col gap-1">
                <div className="text-lg text-[#FFFFFF80]">
                  Buyer App Balance
                </div>
                <div className="text-2xl text-white font-bold">
                  {statistics?.buyer_loyalty_points || "0"}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <div className="text-lg text-[#FFFFFF80]">
                  Seller App Balance
                </div>
                <div className="text-2xl text-white font-bold">
                  {statistics?.seller_loyalty_points || "0"}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4 sm:mt-5 flex flex-col sm:flex-row justify-between gap-3 sm:gap-0">
          <div className="flex gap-2">
            <div>
              <TabButtons />
            </div>
            <div>
              <BulkActionDropdown 
                onActionSelect={handleBulkActionSelect}
                orders={usersForExport as any}
                dataType="users"
              />
            </div>
          </div>
          <div className="">
            <div className="relative">
              <input
                type="text"
                placeholder="Search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
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
            users={users}
            pagination={pagination}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            isLoading={isLoading}
            error={error}
            onUserDetailsClick={handleUserDetailsClick}
          />
        </div>
      </div>

      {/* User Balance Details Modal */}
      <UserBalanceDetailsModal
        isOpen={showUserDetailsModal}
        onClose={handleCloseUserDetailsModal}
        userId={selectedUserId}
      />
    </>
  );
};

export default Balance;
