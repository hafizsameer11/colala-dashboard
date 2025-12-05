import PageHeader from "../../../components/PageHeader";
import images from "../../../constants/images";
import { useEffect, useState } from "react";
import BulkActionDropdown from "../../../components/BulkActionDropdown";
import DisputesTable from "./components/disputeTable";
import { getDisputeStatistics } from "../../../utils/queries/disputes";
import { filterByPeriod } from "../../../utils/periodFilter";

type Tab = "All" | "Pending" | "On Hold" | "Resolved";

const Disputes = () => {
  const [activeTab, setActiveTab] = useState<Tab>("All");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("All time");
  const tabs: Tab[] = ["All", "Pending", "On Hold", "Resolved"];

  // --- Search with debounce ---
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // --- Dispute Statistics State ---
  const [disputeStats, setDisputeStats] = useState({
    total_disputes: 0,
    pending_disputes: 0,
    resolved_disputes: 0,
    on_hold_disputes: 0,
    recent_disputes: 0,
    disputes_by_category: [],
    disputes_by_status: []
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(searchInput.trim()), 300);
    return () => clearTimeout(id);
  }, [searchInput]);

  // Fetch dispute statistics on component mount
  useEffect(() => {
    const fetchDisputeStatistics = async () => {
      try {
        setIsLoadingStats(true);
        const response = await getDisputeStatistics();
        if (response.status === 'success') {
          setDisputeStats(response.data);
        }
      } catch (error: unknown) {
        console.error('Error fetching dispute statistics:', error);
        console.error('Failed to load dispute statistics');
      } finally {
        setIsLoadingStats(false);
      }
    };

    fetchDisputeStatistics();
  }, []);

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

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
  };

  return (
    <>
      <PageHeader title="Disputes" onPeriodChange={handlePeriodChange} defaultPeriod="All time" />

      <div className="p-3 sm:p-4 md:p-5">
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-4">
          {/* Total Disputes Card */}
          <div
            className="flex flex-row rounded-2xl flex-1 min-w-0"
            style={{ boxShadow: "0px 0px 2px 0px rgba(0, 0, 0, 0.25)" }}
          >
            <div className="bg-[#E53E3E] rounded-l-2xl p-4 sm:p-5 md:p-7 flex justify-center items-center">
              <img className="w-6 h-6 sm:w-7 sm:h-7 md:w-9 md:h-9" src={images.chats} alt="" />
            </div>
            <div className="flex flex-col bg-[#FFF1F1] rounded-r-2xl p-2 sm:p-3 pr-4 sm:pr-6 md:pr-11 gap-1 flex-1 min-w-0">
              <span className="font-semibold text-xs sm:text-sm md:text-[15px]">Total Disputes</span>
              <span className="font-semibold text-lg sm:text-xl md:text-2xl">
                {isLoadingStats ? '...' : disputeStats.total_disputes}
              </span>
              <span className="text-[#00000080] text-[10px] sm:text-xs md:text-[13px]">
                <span className="text-[#1DB61D]">+5%</span> increase from last
                month
              </span>
            </div>
          </div>

          {/* Pending Disputes Card */}
          <div
            className="flex flex-row rounded-2xl flex-1 min-w-0"
            style={{ boxShadow: "0px 0px 2px 0px rgba(0, 0, 0, 0.25)" }}
          >
            <div className="bg-[#E53E3E] rounded-l-2xl p-4 sm:p-5 md:p-7 flex justify-center items-center">
              <img className="w-6 h-6 sm:w-7 sm:h-7 md:w-9 md:h-9" src={images.chats} alt="" />
            </div>
            <div className="flex flex-col bg-[#FFF1F1] rounded-r-2xl p-2 sm:p-3 pr-4 sm:pr-6 md:pr-11 gap-1 flex-1 min-w-0">
              <span className="font-semibold text-xs sm:text-sm md:text-[15px]">Pending Disputes</span>
              <span className="font-semibold text-lg sm:text-xl md:text-2xl">
                {isLoadingStats ? '...' : disputeStats.pending_disputes}
              </span>
              <span className="text-[#00000080] text-[10px] sm:text-xs md:text-[13px]">
                <span className="text-[#1DB61D]">+5%</span> increase from last
                month
              </span>
            </div>
          </div>

          {/* Resolved Disputes Card */}
          <div
            className="flex flex-row rounded-2xl flex-1 min-w-0"
            style={{ boxShadow: "0px 0px 2px 0px rgba(0, 0, 0, 0.25)" }}
          >
            <div className="bg-[#E53E3E] rounded-l-2xl p-4 sm:p-5 md:p-7 flex justify-center items-center">
              <img className="w-6 h-6 sm:w-7 sm:h-7 md:w-9 md:h-9" src={images.chats} alt="" />
            </div>
            <div className="flex flex-col bg-[#FFF1F1] rounded-r-2xl p-2 sm:p-3 pr-4 sm:pr-6 md:pr-11 gap-1 flex-1 min-w-0">
              <span className="font-semibold text-xs sm:text-sm md:text-[15px]">Resolved Disputes</span>
              <span className="font-semibold text-lg sm:text-xl md:text-2xl">
                {isLoadingStats ? '...' : disputeStats.resolved_disputes}
              </span>
              <span className="text-[#00000080] text-[10px] sm:text-xs md:text-[13px]">
                <span className="text-[#1DB61D]">+5%</span> increase from last
                month
              </span>
            </div>
          </div>

          {/* On Hold Disputes Card */}
          <div
            className="flex flex-row rounded-2xl flex-1 min-w-0"
            style={{ boxShadow: "0px 0px 2px 0px rgba(0, 0, 0, 0.25)" }}
          >
            <div className="bg-[#E53E3E] rounded-l-2xl p-4 sm:p-5 md:p-7 flex justify-center items-center">
              <img className="w-6 h-6 sm:w-7 sm:h-7 md:w-9 md:h-9" src={images.chats} alt="" />
            </div>
            <div className="flex flex-col bg-[#FFF1F1] rounded-r-2xl p-2 sm:p-3 pr-4 sm:pr-6 md:pr-11 gap-1 flex-1 min-w-0">
              <span className="font-semibold text-xs sm:text-sm md:text-[15px]">On Hold Disputes</span>
              <span className="font-semibold text-lg sm:text-xl md:text-2xl">
                {isLoadingStats ? '...' : disputeStats.on_hold_disputes}
              </span>
              <span className="text-[#00000080] text-[10px] sm:text-xs md:text-[13px]">
                <span className="text-[#1DB61D]">+5%</span> increase from last
                month
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 sm:mt-5 flex flex-col sm:flex-row justify-between gap-3 sm:gap-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-2">
            <div className="overflow-x-auto w-full sm:w-auto">
              <TabButtons />
            </div>

            <div className="flex flex-row items-center gap-3 sm:gap-5 border border-[#989898] rounded-lg px-3 sm:px-4 py-2.5 sm:py-3.5 bg-white cursor-pointer text-xs sm:text-sm">
              <div>Today</div>
              <div>
                <img className="w-3 h-3 mt-1" src={images.dropdown} alt="" />
              </div>
            </div>

            <div>
              <BulkActionDropdown onActionSelect={handleBulkActionSelect} />
            </div>
          </div>

          {/* Search with debounce */}
          <div className="w-full sm:w-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search"
                value={searchInput}
                onChange={(e) => {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  setSearchInput((e.target as any).value);
                }}
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

      {/* Table gets tab + debounced search */}
      <div>
        <DisputesTable activeTab={activeTab} search={debouncedSearch} />
      </div>
    </>
  );
};

export default Disputes;
