import images from "../../../constants/images";
import PageHeader from "../../../components/PageHeader";
import { useEffect, useState, useMemo, useRef } from "react";
import BulkActionDropdown from "../../../components/BulkActionDropdown";
import { useQuery } from "@tanstack/react-query";
import { getRatingsReviewsSummary, getProductReviews, getStoreReviews } from "../../../utils/queries/users";
import { filterByPeriod } from "../../../utils/periodFilter";

import RatingAndReviewTable from "./components/ratingandreviewtable";

type Tab = "All" | "Store" | "Product";

const AllRatingAndReview = () => {
  const [activeTab, setActiveTab] = useState<Tab>("All");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("All time");
  const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);
  const dateDropdownRef = useRef<HTMLDivElement>(null);
  const tabs: Tab[] = ["All", "Store", "Product"];
  
  // Date period options
  const datePeriodOptions = [
    "Today",
    "This Week",
    "Last Month",
    "Last 6 Months",
    "Last Year",
    "All time",
  ];

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

  // Fetch all product reviews for export (fetch multiple pages to get all data)
  const [allProductReviews, setAllProductReviews] = useState<any[]>([]);
  const [allStoreReviews, setAllStoreReviews] = useState<any[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);

  useEffect(() => {
    const fetchAllReviews = async () => {
      try {
        setIsLoadingReviews(true);
        
        // Fetch all product reviews by checking pagination
        const allProducts: any[] = [];
        let productPage = 1;
        let hasMoreProducts = true;
        
        while (hasMoreProducts && productPage <= 100) { // Safety limit
          const result = await getProductReviews(productPage);
          const reviews = result?.data?.reviews || [];
          if (reviews.length > 0) {
            allProducts.push(...reviews);
            const pagination = result?.data?.pagination;
            if (pagination && productPage >= pagination.last_page) {
              hasMoreProducts = false;
            } else {
              productPage++;
            }
          } else {
            hasMoreProducts = false;
          }
        }
        setAllProductReviews(allProducts);
        
        // Fetch all store reviews by checking pagination
        const allStores: any[] = [];
        let storePage = 1;
        let hasMoreStores = true;
        
        while (hasMoreStores && storePage <= 100) { // Safety limit
          const result = await getStoreReviews(storePage);
          const reviews = result?.data?.reviews || [];
          if (reviews.length > 0) {
            allStores.push(...reviews);
            const pagination = result?.data?.pagination;
            if (pagination && storePage >= pagination.last_page) {
              hasMoreStores = false;
            } else {
              storePage++;
            }
          } else {
            hasMoreStores = false;
          }
        }
        setAllStoreReviews(allStores);
      } catch (error) {
        console.error('Error fetching reviews for export:', error);
      } finally {
        setIsLoadingReviews(false);
      }
    };
    
    fetchAllReviews();
  }, []);

  // Filter reviews by period
  const periodFilteredProductReviews = filterByPeriod(allProductReviews, selectedPeriod, ['created_at', 'formatted_date', 'date']);
  const periodFilteredStoreReviews = filterByPeriod(allStoreReviews, selectedPeriod, ['created_at', 'formatted_date', 'date']);

  // Transform reviews for BulkActionDropdown export
  const reviewsForExport = useMemo(() => {
    const productReviews = periodFilteredProductReviews.map((review: any) => ({
      id: `product-${review.id}`,
      type: 'Product',
      reviewType: 'Product',
      storeName: review.store?.store_name || review.store?.name || 'N/A',
      productName: review.product?.name || 'N/A',
      userName: review.user?.full_name || review.user?.name || 'N/A',
      user_name: review.user?.full_name || review.user?.name || 'N/A',
      userEmail: review.user?.email || 'N/A',
      user_email: review.user?.email || 'N/A',
      rating: review.rating,
      averageRating: review.rating,
      comment: review.comment || 'N/A',
      review: review.comment || 'N/A',
      created_at: review.created_at || '',
      createdAt: review.created_at || '',
      formatted_date: review.formatted_date || review.created_at || '',
      formattedDate: review.formatted_date || review.created_at || '',
      lastRating: review.formatted_date || review.created_at || '',
      date: review.formatted_date || review.created_at || '',
      noOfReviews: 1,
      user: review.user,
      store: review.store,
      product: review.product,
    }));

    const storeReviews = periodFilteredStoreReviews.map((review: any) => ({
      id: `store-${review.id}`,
      type: 'Store',
      reviewType: 'Store',
      storeName: review.store?.store_name || review.store?.name || 'N/A',
      productName: 'N/A',
      userName: review.user?.full_name || review.user?.name || 'N/A',
      user_name: review.user?.full_name || review.user?.name || 'N/A',
      userEmail: review.user?.email || 'N/A',
      user_email: review.user?.email || 'N/A',
      rating: review.rating,
      averageRating: review.rating,
      comment: review.comment || 'N/A',
      review: review.comment || 'N/A',
      created_at: review.created_at || '',
      createdAt: review.created_at || '',
      formatted_date: review.formatted_date || review.created_at || '',
      formattedDate: review.formatted_date || review.created_at || '',
      lastRating: review.formatted_date || review.created_at || '',
      date: review.formatted_date || review.created_at || '',
      noOfReviews: 1,
      user: review.user,
      store: review.store,
    }));

    // Filter based on active tab
    if (activeTab === 'Product') {
      return productReviews;
    } else if (activeTab === 'Store') {
      return storeReviews;
    } else {
      return [...productReviews, ...storeReviews];
    }
  }, [periodFilteredProductReviews, periodFilteredStoreReviews, activeTab]);

  // Debug logging
  console.log('Ratings Reviews Summary Debug - API data:', summaryData);

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
  
  // Handle local date dropdown toggle
  const handleDateDropdownToggle = () => {
    setIsDateDropdownOpen(!isDateDropdownOpen);
  };
  
  // Handle local date period selection
  const handleDatePeriodSelect = (period: string) => {
    setSelectedPeriod(period);
    setIsDateDropdownOpen(false);
  };
  
  // Close date dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dateDropdownRef.current && !dateDropdownRef.current.contains(event.target as Node)) {
        setIsDateDropdownOpen(false);
      }
    };

    if (isDateDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDateDropdownOpen]);

  return (
    <>
      <PageHeader 
        title="Ratings and Reviews" 
        onPeriodChange={handlePeriodChange}
        defaultPeriod={selectedPeriod}
        timeOptions={datePeriodOptions}
      />
      <div className="p-3 sm:p-4 md:p-5">
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-4">
          {/* Card 1 - Total Store Reviews */}
          <div
            className="flex flex-row rounded-2xl flex-1 min-w-0"
            style={{ boxShadow: "0px 0px 2px 0px rgba(0, 0, 0, 0.25)" }}
          >
            <div className="bg-[#E53E3E] rounded-l-2xl p-3 sm:p-4 md:p-5 flex justify-center items-center">
              <img className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" src={images.star3} alt="" />
            </div>
            <div className="flex flex-col bg-[#FFF1F1] rounded-r-2xl p-2 sm:p-3 pr-4 sm:pr-6 md:pr-8 gap-1 flex-1 min-w-0">
              <span className="font-semibold text-[11px] sm:text-xs md:text-[13px]">
                Total Store Reviews
              </span>
              <span className="font-semibold text-lg sm:text-xl">
                {summaryLoading ? '...' : (summaryData?.data?.total_store_reviews || 0).toLocaleString()}
              </span>
              <span className="text-[#00000080] text-[10px] sm:text-[11px]">
                <span className="text-[#1DB61D]">+5%</span> increase from last
                month
              </span>
            </div>
          </div>

          {/* Card 2 - Total Product Reviews */}
          <div
            className="flex flex-row rounded-2xl flex-1 min-w-0"
            style={{ boxShadow: "0px 0px 2px 0px rgba(0, 0, 0, 0.25)" }}
          >
            <div className="bg-[#E53E3E] rounded-l-2xl p-3 sm:p-4 md:p-5 flex justify-center items-center">
              <img className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" src={images.star3} alt="" />
            </div>
            <div className="flex flex-col bg-[#FFF1F1] rounded-r-2xl p-2 sm:p-3 pr-4 sm:pr-6 md:pr-8 gap-1 flex-1 min-w-0">
              <span className="font-semibold text-[11px] sm:text-xs md:text-[13px]">
                Total Product Reviews
              </span>
              <span className="font-semibold text-lg sm:text-xl">
                {summaryLoading ? '...' : (summaryData?.data?.total_product_reviews || 0).toLocaleString()}
              </span>
              <span className="text-[#00000080] text-[10px] sm:text-[11px]">
                <span className="text-[#1DB61D]">+5%</span> increase from last
                month
              </span>
            </div>
          </div>

          {/* Card 3 - Average Store Rating */}
          <div
            className="flex flex-row rounded-2xl flex-1 min-w-0"
            style={{ boxShadow: "0px 0px 2px 0px rgba(0, 0, 0, 0.25)" }}
          >
            <div className="bg-[#E53E3E] rounded-l-2xl p-3 sm:p-4 md:p-5 flex justify-center items-center">
              <img className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" src={images.star3} alt="" />
            </div>
            <div className="flex flex-col bg-[#FFF1F1] rounded-r-2xl p-2 sm:p-3 pr-4 sm:pr-6 md:pr-8 gap-1 flex-1 min-w-0">
              <span className="font-semibold text-[11px] sm:text-xs md:text-[13px]">
                Average Store Rating
              </span>
              <div className="flex items-center gap-1">
                <span className="font-semibold text-lg sm:text-xl">
                  {summaryLoading ? '...' : (summaryData?.data?.average_store_rating || 0).toFixed(1)}
                </span>
                <span className="text-[#E53E3E] text-base sm:text-lg">★</span>
              </div>
              <span className="text-[#00000080] text-[10px] sm:text-[11px]">
                <span className="text-[#1DB61D]">+5%</span> increase from last
                month
              </span>
            </div>
          </div>

          {/* Card 4 - Average Product Rating */}
          <div
            className="flex flex-row rounded-2xl flex-1 min-w-0"
            style={{ boxShadow: "0px 0px 2px 0px rgba(0, 0, 0, 0.25)" }}
          >
            <div className="bg-[#E53E3E] rounded-l-2xl p-3 sm:p-4 md:p-5 flex justify-center items-center">
              <img className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" src={images.star3} alt="" />
            </div>
            <div className="flex flex-col bg-[#FFF1F1] rounded-r-2xl p-2 sm:p-3 pr-4 sm:pr-6 md:pr-8 gap-1 flex-1 min-w-0">
              <span className="font-semibold text-[11px] sm:text-xs md:text-[13px]">
                Average Product Rating
              </span>
              <div className="flex items-center gap-1">
                <span className="font-semibold text-lg sm:text-xl">
                  {summaryLoading ? '...' : (summaryData?.data?.average_product_rating || 0).toFixed(1)}
                </span>
                <span className="text-[#E53E3E] text-base sm:text-lg">★</span>
              </div>
              <span className="text-[#00000080] text-[10px] sm:text-[11px]">
                <span className="text-[#1DB61D]">+5%</span> increase from last
                month
              </span>
            </div>
          </div>
        </div>
        <div>
          <div className="mt-4 sm:mt-5 flex flex-col sm:flex-row justify-between gap-3 sm:gap-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-2">
              <div className="overflow-x-auto w-full sm:w-auto">
                <TabButtons />
              </div>
              <div className="relative" ref={dateDropdownRef}>
                <div 
                  className="flex flex-row items-center gap-3 sm:gap-5 border border-[#989898] rounded-lg px-3 sm:px-4 py-2.5 sm:py-3.5 bg-white cursor-pointer text-xs sm:text-sm hover:bg-gray-50 transition-colors"
                  onClick={handleDateDropdownToggle}
                >
                  <div>{selectedPeriod}</div>
                  <img 
                    className={`w-3 h-3 mt-1 transition-transform ${isDateDropdownOpen ? 'rotate-180' : ''}`} 
                    src={images.dropdown} 
                    alt="" 
                  />
                </div>
                {isDateDropdownOpen && (
                  <div className="absolute top-full left-0 mt-1 bg-white rounded-lg border border-[#989898] py-2 w-44 z-50 shadow-lg">
                    {datePeriodOptions.map((option) => (
                      <div
                        key={option}
                        onClick={() => handleDatePeriodSelect(option)}
                        className={`px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer transition-colors ${
                          selectedPeriod === option ? "bg-gray-100 font-semibold" : ""
                        }`}
                      >
                        {option}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <BulkActionDropdown 
                  onActionSelect={handleBulkActionSelect}
                  orders={reviewsForExport}
                  dataType="ratings"
                  exportConfig={{
                    dataType: "ratings",
                    reviewType: activeTab === "Store" ? "stores" : activeTab === "Product" ? "products" : undefined,
                    search: debouncedSearch?.trim() || undefined,
                    period: selectedPeriod !== "All time" ? selectedPeriod : undefined,
                  }}
                />
              </div>
            </div>
            <div className="w-full sm:w-auto">
              <div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search"
                    value={searchInput}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    onChange={(e: any) => setSearchInput(e.target.value)}
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

        <RatingAndReviewTable
          tabFilter={activeTab}
          searchQuery={debouncedSearch}
          selectedPeriod={selectedPeriod}
          onRowSelect={(selectedIds: string[]) =>
            console.log("Selected ratings:", selectedIds)
          }
        />
      </div>
    </>
  );
};

export default AllRatingAndReview;
