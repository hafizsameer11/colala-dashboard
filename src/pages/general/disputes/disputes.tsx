import PageHeader from "../../../components/PageHeader";
import images from "../../../constants/images";
import { useEffect, useState } from "react";
import BulkActionDropdown from "../../../components/BulkActionDropdown";
import DisputesTable from "./components/disputeTable";
import { getDisputeStatistics } from "../../../utils/queries/disputes";

type Tab = "All" | "Pending" | "On Hold" | "Resolved";

const Disputes = () => {
  const [activeTab, setActiveTab] = useState<Tab>("All");
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

  return (
    <>
      <PageHeader title="Disputes" />

      <div className="p-5">
        <div className="flex flex-row justify-between items-center">
          {/* Total Disputes Card */}
          <div
            className="flex flex-row rounded-2xl w-90"
            style={{ boxShadow: "0px 0px 2px 0px rgba(0, 0, 0, 0.25)" }}
          >
            <div className="bg-[#E53E3E] rounded-l-2xl p-7 flex justify-center items-center ">
              <img className="w-9 h-9" src={images.chats} alt="" />
            </div>
            <div className="flex flex-col bg-[#FFF1F1] rounded-r-2xl p-3 pr-11 gap-1">
              <span className="font-semibold text-[15px]">Total Disputes</span>
              <span className="font-semibold text-2xl">
                {isLoadingStats ? '...' : disputeStats.total_disputes}
              </span>
              <span className="text-[#00000080] text-[13px] ">
                <span className="text-[#1DB61D]">+5%</span> increase from last
                month
              </span>
            </div>
          </div>

          {/* Pending Disputes Card */}
          <div
            className="flex flex-row rounded-2xl w-90"
            style={{ boxShadow: "0px 0px 2px 0px rgba(0, 0, 0, 0.25)" }}
          >
            <div className="bg-[#E53E3E] rounded-l-2xl p-7 flex justify-center items-center ">
              <img className="w-9 h-9" src={images.chats} alt="" />
            </div>
            <div className="flex flex-col bg-[#FFF1F1] rounded-r-2xl p-3 pr-11 gap-1">
              <span className="font-semibold text-[15px]">Pending Disputes</span>
              <span className="font-semibold text-2xl">
                {isLoadingStats ? '...' : disputeStats.pending_disputes}
              </span>
              <span className="text-[#00000080] text-[13px] ">
                <span className="text-[#1DB61D]">+5%</span> increase from last
                month
              </span>
            </div>
          </div>

          {/* Resolved Disputes Card */}
          <div
            className="flex flex-row rounded-2xl w-90"
            style={{ boxShadow: "0px 0px 2px 0px rgba(0, 0, 0, 0.25)" }}
          >
            <div className="bg-[#E53E3E] rounded-l-2xl p-7 flex justify-center items-center ">
              <img className="w-9 h-9" src={images.chats} alt="" />
            </div>
            <div className="flex flex-col bg-[#FFF1F1] rounded-r-2xl p-3 pr-11 gap-1">
              <span className="font-semibold text-[15px]">Resolved Disputes</span>
              <span className="font-semibold text-2xl">
                {isLoadingStats ? '...' : disputeStats.resolved_disputes}
              </span>
              <span className="text-[#00000080] text-[13px] ">
                <span className="text-[#1DB61D]">+5%</span> increase from last
                month
              </span>
            </div>
          </div>

          {/* On Hold Disputes Card */}
          <div
            className="flex flex-row rounded-2xl w-90"
            style={{ boxShadow: "0px 0px 2px 0px rgba(0, 0, 0, 0.25)" }}
          >
            <div className="bg-[#E53E3E] rounded-l-2xl p-7 flex justify-center items-center ">
              <img className="w-9 h-9" src={images.chats} alt="" />
            </div>
            <div className="flex flex-col bg-[#FFF1F1] rounded-r-2xl p-3 pr-11 gap-1">
              <span className="font-semibold text-[15px]">On Hold Disputes</span>
              <span className="font-semibold text-2xl">
                {isLoadingStats ? '...' : disputeStats.on_hold_disputes}
              </span>
              <span className="text-[#00000080] text-[13px] ">
                <span className="text-[#1DB61D]">+5%</span> increase from last
                month
              </span>
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-row justify-between">
          <div className="flex flex-row items-center gap-2">
            <div>
              <TabButtons />
            </div>

            <div className="flex flex-row items-center gap-5 border border-[#989898] rounded-lg px-4 py-3.5 bg-white cursor-pointer">
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
          <div>
            <div className="relative">
              <input
                type="text"
                placeholder="Search"
                value={searchInput}
                onChange={(e) => {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  setSearchInput((e.target as any).value);
                }}
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
      </div>

      {/* Table gets tab + debounced search */}
      <div>
        <DisputesTable activeTab={activeTab} search={debouncedSearch} />
      </div>
    </>
  );
};

export default Disputes;
