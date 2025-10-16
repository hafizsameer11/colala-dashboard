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
    console.log("Bulk action selected in Promotions:", action);
    // do your bulk logic here using selected IDs from table (if you wire it up)
  };

  return (
    <div>
      <PageHeader title="Latest Promotions" />
      <div className="p-5">
        {/* Stat cards ... unchanged */}
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

        {/* Filters row */}
        <div className="mt-5 flex flex-row justify-between">
          <div className="flex flex-row items-center gap-2">
            <TabButtons />
            <div className="flex flex-row items-center gap-5 border border-[#989898] rounded-lg px-4 py-3.5 bg-white cursor-pointer">
              <div>Today</div>
              <div>
                <img className="w-3 h-3 mt-1" src={images.dropdown} alt="" />
              </div>
            </div>
            <BulkActionDropdown onActionSelect={handleBulkActionSelect} />
          </div>

          {/* Search (debounced) */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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
