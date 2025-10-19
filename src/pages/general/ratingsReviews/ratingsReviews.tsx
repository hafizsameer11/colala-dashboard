import images from "../../../constants/images";
import PageHeader from "../../../components/PageHeader";
import { useEffect, useState } from "react";
import BulkActionDropdown from "../../../components/BulkActionDropdown";
import { useQuery } from "@tanstack/react-query";
import { getRatingsReviewsSummary } from "../../../utils/queries/users";

import RatingAndReviewTable from "./components/ratingandreviewtable";

type Tab = "All" | "Store" | "Product";

const AllRatingAndReview = () => {
  const [activeTab, setActiveTab] = useState<Tab>("All");
  const tabs: Tab[] = ["All", "Store", "Product"];

  // --- Search (debounced) ---
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchInput.trim()), 400); // 400ms delay
    return () => clearTimeout(t);
  }, [searchInput]);

  // Fetch ratings and reviews summary
  const { data: summaryData, isLoading: summaryLoading } = useQuery({
    queryKey: ['ratingsReviewsSummary'],
    queryFn: getRatingsReviewsSummary,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Debug logging
  console.log('Ratings Reviews Summary Debug - API data:', summaryData);

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
      <PageHeader title="Ratings and Reviews" />
      <div className="p-5">
        <div className="flex flex-row justify-between items-center gap-4">
          {/* Card 1 - Total Store Reviews */}
          <div
            className="flex flex-row rounded-2xl w-72"
            style={{ boxShadow: "0px 0px 2px 0px rgba(0, 0, 0, 0.25)" }}
          >
            <div className="bg-[#E53E3E] rounded-l-2xl p-5 flex justify-center items-center">
              <img className="w-7 h-7" src={images.star3} alt="" />
            </div>
            <div className="flex flex-col bg-[#FFF1F1] rounded-r-2xl p-3 pr-8 gap-1">
              <span className="font-semibold text-[13px]">
                Total Store Reviews
              </span>
              <span className="font-semibold text-xl">
                {summaryLoading ? '...' : (summaryData?.data?.total_store_reviews || 0).toLocaleString()}
              </span>
              <span className="text-[#00000080] text-[11px]">
                <span className="text-[#1DB61D]">+5%</span> increase from last
                month
              </span>
            </div>
          </div>

          {/* Card 2 - Total Product Reviews */}
          <div
            className="flex flex-row rounded-2xl w-72"
            style={{ boxShadow: "0px 0px 2px 0px rgba(0, 0, 0, 0.25)" }}
          >
            <div className="bg-[#E53E3E] rounded-l-2xl p-5 flex justify-center items-center">
              <img className="w-7 h-7" src={images.star3} alt="" />
            </div>
            <div className="flex flex-col bg-[#FFF1F1] rounded-r-2xl p-3 pr-8 gap-1">
              <span className="font-semibold text-[13px]">
                Total Product Reviews
              </span>
              <span className="font-semibold text-xl">
                {summaryLoading ? '...' : (summaryData?.data?.total_product_reviews || 0).toLocaleString()}
              </span>
              <span className="text-[#00000080] text-[11px]">
                <span className="text-[#1DB61D]">+5%</span> increase from last
                month
              </span>
            </div>
          </div>

          {/* Card 3 - Average Store Rating */}
          <div
            className="flex flex-row rounded-2xl w-72"
            style={{ boxShadow: "0px 0px 2px 0px rgba(0, 0, 0, 0.25)" }}
          >
            <div className="bg-[#E53E3E] rounded-l-2xl p-5 flex justify-center items-center">
              <img className="w-7 h-7" src={images.star3} alt="" />
            </div>
            <div className="flex flex-col bg-[#FFF1F1] rounded-r-2xl p-3 pr-8 gap-1">
              <span className="font-semibold text-[13px]">
                Average Store Rating
              </span>
              <div className="flex items-center gap-1">
                <span className="font-semibold text-xl">
                  {summaryLoading ? '...' : (summaryData?.data?.average_store_rating || 0).toFixed(1)}
                </span>
                <span className="text-[#E53E3E] text-lg">★</span>
              </div>
              <span className="text-[#00000080] text-[11px]">
                <span className="text-[#1DB61D]">+5%</span> increase from last
                month
              </span>
            </div>
          </div>

          {/* Card 4 - Average Product Rating */}
          <div
            className="flex flex-row rounded-2xl w-72"
            style={{ boxShadow: "0px 0px 2px 0px rgba(0, 0, 0, 0.25)" }}
          >
            <div className="bg-[#E53E3E] rounded-l-2xl p-5 flex justify-center items-center">
              <img className="w-7 h-7" src={images.star3} alt="" />
            </div>
            <div className="flex flex-col bg-[#FFF1F1] rounded-r-2xl p-3 pr-8 gap-1">
              <span className="font-semibold text-[13px]">
                Average Product Rating
              </span>
              <div className="flex items-center gap-1">
                <span className="font-semibold text-xl">
                  {summaryLoading ? '...' : (summaryData?.data?.average_product_rating || 0).toFixed(1)}
                </span>
                <span className="text-[#E53E3E] text-lg">★</span>
              </div>
              <span className="text-[#00000080] text-[11px]">
                <span className="text-[#1DB61D]">+5%</span> increase from last
                month
              </span>
            </div>
          </div>
        </div>
        <div>
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
            <div>
              <div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search"
                    value={searchInput}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    onChange={(e: any) => setSearchInput(e.target.value)}
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
        </div>

        <RatingAndReviewTable
          tabFilter={activeTab}
          searchQuery={debouncedSearch}
          onRowSelect={(selectedIds: string[]) =>
            console.log("Selected ratings:", selectedIds)
          }
        />
      </div>
    </>
  );
};

export default AllRatingAndReview;
