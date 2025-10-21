import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import images from "../../../constants/images";
import BulkActionDropdown from "../../../components/BulkActionDropdown";
import LevelDropdown from "../../../components/levelDropdown";
import PageHeader from "../../../components/PageHeader";
import StoreKYCTable from "./components/storeKYCTable";
import { getAdminStores } from "../../../utils/queries/users";

// tiny debounce hook
function useDebouncedValue<T>(value: T, delay = 450) {
  const [debounced, setDebounced] = useState<T>(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

const StoreKYC = () => {
  const [activeTab, setActiveTab] = useState<
    "All" | "Pending" | "Successful" | "Rejected"
  >("All");
  const [selectedLevel, setSelectedLevel] = useState<number | "all">("all");
  const tabs: Array<"All" | "Pending" | "Successful" | "Rejected"> = [
    "All",
    "Pending",
    "Successful",
    "Rejected",
  ];

  // search (debounced)
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 450);
  
  // pagination state
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch stores data
  const { data: storesData, isLoading, error } = useQuery({
    queryKey: ['adminStores', activeTab, selectedLevel, currentPage],
    queryFn: () => getAdminStores(currentPage, activeTab, selectedLevel),
    staleTime: 2 * 60 * 1000,
  });

  // Debug logging to understand the data structure
  console.log('StoreKYC Debug - storesData:', storesData);
  console.log('StoreKYC Debug - storesData.data:', storesData?.data);
  console.log('StoreKYC Debug - storesData.data.stores:', storesData?.data?.stores);
  console.log('StoreKYC Debug - storesData.data.stores.data:', storesData?.data?.stores?.data);
  
  // Extract stores from the correct nested structure: data.stores.data
  const stores = Array.isArray(storesData?.data?.stores?.data) ? storesData.data.stores.data : [];
  const statistics = storesData?.data?.summary_stats || {};
  const pagination = storesData?.data?.pagination || {};

  const TabButtons = () => (
    <div className="flex items-center space-x-0.5 border border-[#989898] rounded-lg p-2 w-fit bg-white">
      {tabs.map((tab) => {
        const isActive = activeTab === tab;
        return (
          <button
            key={tab}
            onClick={() => handleTabChange(tab)}
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

  const handleLevelActionSelect = (level: string) => {
    if (level === "All") setSelectedLevel("all");
    else if (level === "Level 1") setSelectedLevel(1);
    else if (level === "Level 2") setSelectedLevel(2);
    else if (level === "Level 3") setSelectedLevel(3);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Reset pagination when tab changes
  const handleTabChange = (tab: "All" | "Pending" | "Successful" | "Rejected") => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  return (
    <>
      <PageHeader title="Stores KYC" />
      <div className="p-5">
        {/* top cards (unchanged) */}
        <div className="flex flex-row justify-between items-center">
          {/* Card 1 */}
          <div
            className="flex flex-row rounded-2xl  w-90"
            style={{ boxShadow: "0px 0px 2px 0px rgba(0, 0, 0, 0.25)" }}
          >
            <div className="bg-[#E53E3E] rounded-l-2xl p-7 flex justify-center items-center ">
              <img className="w-9 h-9" src={images.kyc} alt="" />
            </div>
            <div className="flex flex-col bg-[#FFF1F1] rounded-r-2xl p-3 pr-11 gap-1">
              <span className="font-semibold text-[15px]">Total Stores</span>
              <span className="font-semibold text-2xl">{statistics.total_stores?.count || 0}</span>
              <span className="text-[#00000080] text-[13px] ">
                <span className="text-[#1DB61D]">+{statistics.total_stores?.increase || 0}%</span> increase from last
                month
              </span>
            </div>
          </div>

          {/* Card 2 */}
          <div
            className="flex flex-row rounded-2xl w-90"
            style={{ boxShadow: "0px 0px 2px 0px rgba(0, 0, 0, 0.25)" }}
          >
            <div className="bg-[#E53E3E] rounded-l-2xl p-7 flex justify-center items-center ">
              <img className="w-9 h-9" src={images.kyc} alt="" />
            </div>
            <div className="flex flex-col bg-[#FFF1F1] rounded-r-2xl p-3 pr-11 gap-1">
              <span className="font-semibold text-[15px]">Pending KYC</span>
              <span className="font-semibold text-2xl">{statistics.pending_kyc?.count || 0}</span>
              <span className="text-[#00000080] text-[13px] ">
                <span className="text-[#1DB61D]">+{statistics.pending_kyc?.increase || 0}%</span> increase from last
                month
              </span>
            </div>
          </div>

          {/* Card 3 */}
          <div
            className="flex flex-row rounded-2xl w-90"
            style={{ boxShadow: "0px 0px 2px 0px rgba(0, 0, 0, 0.25)" }}
          >
            <div className="bg-[#E53E3E] rounded-l-2xl p-7 flex justify-center items-center ">
              <img className="w-9 h-9" src={images.kyc} alt="" />
            </div>
            <div className="flex flex-col bg-[#FFF1F1] rounded-r-2xl p-3 pr-11 gap-1">
              <span className="font-semibold text-[15px]">Approved KYC</span>
              <span className="font-semibold text-2xl">{statistics.approved_kyc?.count || 0}</span>
              <span className="text-[#00000080] text-[13px] ">
                <span className="text-[#1DB61D]">+{statistics.approved_kyc?.increase || 0}%</span> increase from last
                month
              </span>
            </div>
          </div>
        </div>

        {/* filters */}
        <div className="mt-5 flex flex-row justify-between">
          <div className="flex flex-row items-center gap-2">
            <TabButtons />
            <div className="flex flex-row items-center gap-5 border border-[#989898] rounded-lg px-4 py-3.5 bg-white cursor-pointer">
              <div>Today</div>
              <div>
                <img className="w-3 h-3 mt-1" src={images.dropdown} alt="" />
              </div>
            </div>
            <LevelDropdown onLevelSelect={handleLevelActionSelect} />
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

        {/* table with filters */}
        <div>
          <StoreKYCTable
            stores={stores}
            statistics={statistics}
            pagination={pagination}
            levelFilter={selectedLevel}
            statusFilter={activeTab}
            searchTerm={debouncedSearch}
            isLoading={isLoading}
            error={error}
            currentPage={currentPage}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </>
  );
};

export default StoreKYC;
