import images from "../../../constants/images";
import PageHeader from "../../../components/PageHeader";
import StatCard from "../../../components/StatCard";
import StatCardGrid from "../../../components/StatCardGrid";
import BulkActionDropdown from "../../../components/BulkActionDropdown";
import { useState, useEffect } from "react";
import PromotionsTable from "./promotionsTable";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAdminPromotions, updatePromotionStatus, extendPromotion } from "../../../utils/queries/users";

// tiny debounce hook
function useDebouncedValue<T>(value: T, delay = 450) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced as T;
}

const Promotions = () => {
  const [activeTab, setActiveTab] = useState<
    "All" | "running" | "paused" | "scheduled" | "completed"
  >("All");
  const tabs: Array<"All" | "running" | "paused" | "scheduled" | "completed"> = [
    "All",
    "running",
    "paused",
    "scheduled",
    "completed",
  ];

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 450);
  const [currentPage, setCurrentPage] = useState(1);

  // API data fetching
  const { data: promotionsData, isLoading, error } = useQuery({
    queryKey: ['adminPromotions', activeTab, currentPage],
    queryFn: () => getAdminPromotions(currentPage, activeTab === "All" ? undefined : activeTab),
    keepPreviousData: true,
  });

  const queryClient = useQueryClient();

  // Extract data
  const promotions = promotionsData?.data?.promotions || [];
  const statistics = promotionsData?.data?.statistics || {};
  const pagination = promotionsData?.data?.pagination;

  // Mutations
  const updateStatusMutation = useMutation({
    mutationFn: ({ promotionId, statusData }: { promotionId: number | string; statusData: any }) => 
      updatePromotionStatus(promotionId, statusData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPromotions'] });
    },
  });

  const extendPromotionMutation = useMutation({
    mutationFn: ({ promotionId, extendData }: { promotionId: number | string; extendData: any }) => 
      extendPromotion(promotionId, extendData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPromotions'] });
    },
  });

  const handlePageChange = (page: number) => {
    if (page !== currentPage) setCurrentPage(page);
  };

  const handleStatusUpdate = (promotionId: number | string, statusData: any) => {
    updateStatusMutation.mutate({ promotionId, statusData });
  };

  const handleExtendPromotion = (promotionId: number | string, extendData: any) => {
    extendPromotionMutation.mutate({ promotionId, extendData });
  };

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
    console.log("Bulk action selected in Promotions:", action);
    // do your bulk logic here using selected IDs from table (if you wire it up)
  };

  return (
    <div>
      <PageHeader title="Latest Promotions" />
      <div className="p-3 sm:p-4 md:p-5">
        {/* Stat cards - responsive grid */}
        <StatCardGrid columns={3}>
          <StatCard
            icon={images.ChartLineUp}
            title="Promotion Revenue"
            value={`N${statistics.total_revenue || "0"}`}
            subtitle="Total promotion revenue"
          />
          <StatCard
            icon={images.ChartLineUp}
            title="Total Promotions"
            value={statistics.total_promotions || 0}
            subtitle="Total promotions"
          />
          <StatCard
            icon={images.ChartLineUp}
            title="Active Promotions"
            value={statistics.active_promotions || 0}
            subtitle="Active promotions"
          />
        </StatCardGrid>

        {/* Filters row - improved mobile layout */}
        <div className="mt-4 sm:mt-5 flex flex-col gap-3 sm:gap-4">
          {/* Top row: Tabs and Period dropdown */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full">
            <div className="w-full sm:w-auto">
              <TabButtons />
            </div>
            <div className="flex flex-row items-center gap-2 sm:gap-3 md:gap-5 border border-[#989898] rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 md:py-3.5 bg-white cursor-pointer text-xs sm:text-sm whitespace-nowrap w-full sm:w-auto justify-between sm:justify-start">
              <div>Today</div>
              <div>
                <img className="w-3 h-3 sm:w-4 sm:h-4" src={images.dropdown} alt="" />
              </div>
            </div>
            <div className="w-full sm:w-auto">
              <BulkActionDropdown onActionSelect={handleBulkActionSelect} />
            </div>
          </div>

          {/* Bottom row: Search */}
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search promotions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 sm:pl-12 pr-4 sm:pr-6 py-2 sm:py-2.5 md:py-3.5 border border-[#00000080] rounded-lg text-xs sm:text-sm md:text-[15px] w-full focus:outline-none bg-white shadow-[0_2px_6px_rgba(0,0,0,0.05)] placeholder-[#00000080]"
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

        {/* Table with filters */}
        <div>
          <PromotionsTable 
            activeTab={activeTab} 
            searchTerm={debouncedSearch}
            promotions={promotions}
            pagination={pagination}
            currentPage={currentPage}
            onPageChange={handlePageChange}
            isLoading={isLoading}
            error={error}
            onStatusUpdate={handleStatusUpdate}
            onExtendPromotion={handleExtendPromotion}
          />
        </div>
      </div>
    </div>
  );
};

export default Promotions;
