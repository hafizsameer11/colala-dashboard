import PageHeader from "../../../components/PageHeader";
import images from "../../../constants/images";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getLeaderboard } from "../../../utils/queries/users";
import BulkActionDropdown from "../../../components/BulkActionDropdown";

interface Store {
  store_id: number;
  store_name: string;
  seller_name: string;
  total_points: number;
  followers_count: number;
  orders_count: number;
  products_count: number;
  total_revenue: number;
  average_rating: number;
  profile_image: string | null;
  store_location: string;
  store_status: string;
}

const LeaderBoard = () => {
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'weekly' | 'monthly' | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const navigate = useNavigate();

  // Fetch leaderboard data
  const { data: leaderboardData, isLoading, error } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: getLeaderboard,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Extract data from API response
  const currentPeriodData = useMemo(() => {
    return leaderboardData?.data?.[selectedPeriod] || [];
  }, [leaderboardData, selectedPeriod]);

  const topThree = currentPeriodData.slice(0, 3);

  // --- Debounced search state ---
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchInput.trim()), 500);
    return () => clearTimeout(t);
  }, [searchInput]);

  // --- Filter dataset by debounced search term ---
  const filteredUsers = useMemo(() => {
    const q = debouncedSearch.toLowerCase();
    if (!q) return currentPeriodData;

    return currentPeriodData.filter((u: Store) => {
      const haystack = [
        u.store_name,
        u.seller_name,
        String(u.total_points),
        String(u.followers_count),
        String(u.orders_count),
        String(u.total_revenue),
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(q);
    });
  }, [debouncedSearch, currentPeriodData]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedPeriod, debouncedSearch]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  // --- Select All should apply to the currently visible (paginated) users ---
  const filteredIds = useMemo(
    () => paginatedUsers.map((u: Store) => u.store_id),
    [paginatedUsers]
  );
  const allVisibleSelected =
    filteredIds.length > 0 &&
    filteredIds.every((id: number) => selectedUsers.includes(id));

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      // Select only the visible (filtered) rows
      const union = Array.from(new Set([...selectedUsers, ...filteredIds]));
      setSelectedUsers(union);
    } else {
      // Deselect only the visible (filtered) rows
      setSelectedUsers((prev) =>
        prev.filter((id) => !filteredIds.includes(id))
      );
    }
  };

  const handleSelectUser = (storeId: number, checked: boolean) => {
    setSelectedUsers((prev) =>
      checked ? [...prev, storeId] : prev.filter((id) => id !== storeId)
    );
  };

  const handleStoreDetails = (store: Store) => {
    navigate(`/store-details/${store.store_id}`, { state: store });
  };

  const handleBulkActionSelect = (action: string) => {
    console.log("Bulk action selected in Orders:", action);
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setSearchInput((e.target as any).value);
  };

  const getImageUrl = (profileImage: string | null) => {
    if (!profileImage) return images.admin;
    return `https://colala.hmstech.xyz/storage/${profileImage}`;
  };

  return (
    <>
      <PageHeader title="Seller Leaderboard" />
      <div className="p-3 sm:p-4 md:p-6">
        {/* Period Selector */}
        <div className="mb-4 sm:mb-6 flex justify-center">
          <div className="flex items-center space-x-0.5 border border-[#989898] rounded-lg p-1.5 sm:p-2 w-fit bg-white overflow-x-auto">
            {(['today', 'weekly', 'monthly', 'all'] as const).map((period) => {
              const isActive = selectedPeriod === period;
              return (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg font-normal transition-all duration-200 cursor-pointer whitespace-nowrap ${isActive ? "px-4 sm:px-6 md:px-8 bg-[#E53E3E] text-white" : "px-2 sm:px-3 md:px-4 text-black"
                    }`}
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E53E3E]"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex justify-center items-center h-64">
            <div className="text-lg text-red-600">Error loading leaderboard data. Please try again.</div>
          </div>
        )}

        {/* Content */}
        {!isLoading && !error && (
          <>
            {/* Leaderboard Podium */}
            <div className="flex flex-col sm:flex-row justify-center sm:justify-evenly items-center sm:items-end gap-4 sm:gap-6 mb-6 sm:mb-8">
              {/* 2nd Place */}
              <div className="flex flex-col items-center w-full sm:w-auto">
                <div className="bg-[#C0C0C0] rounded-t-[50px] rounded-[10px] pt-1 pb-2 text-center min-h-[180px] sm:min-h-[200px] w-full max-w-[280px] sm:w-[280px] md:w-[367px] flex flex-col justify-between shadow-lg">
                  <div className="text-2xl sm:text-3xl font-bold">2nd</div>
                  <div className="flex flex-col items-center">
                    <img
                      src={topThree[1] ? getImageUrl(topThree[1].profile_image) : images.bella}
                      alt={topThree[1]?.store_name || "Store"}
                      className="w-16 h-16 sm:w-20 sm:h-20 md:w-23 md:h-23 rounded-full mb-3 sm:mb-4"
                      onError={(e) => {
                        e.currentTarget.src = images.admin;
                      }}
                    />
                    <h3 className="text-sm sm:text-base mb-1 sm:mb-2 px-2 truncate w-full">{topThree[1]?.store_name || "No Store"}</h3>
                    <p className="text-base sm:text-lg font-medium">{topThree[1]?.total_points || 0} points</p>
                  </div>
                </div>
              </div>

              {/* 1st Place */}
              <div className="flex flex-col items-center w-full sm:w-auto order-first sm:order-none">
                <div className="bg-[#FFD700] rounded-t-[50px] rounded-[10px] p-4 sm:p-6 md:p-8 text-center min-h-[200px] sm:min-h-[240px] w-full max-w-[280px] sm:w-[280px] md:w-[367px] flex flex-col justify-between shadow-lg">
                  <div className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-3">1st</div>
                  <div className="flex flex-col items-center">
                    <img
                      src={topThree[0] ? getImageUrl(topThree[0].profile_image) : images.sasha}
                      alt={topThree[0]?.store_name || "Store"}
                      className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full mb-3 sm:mb-4"
                      onError={(e) => {
                        e.currentTarget.src = images.admin;
                      }}
                    />
                    <h3 className="text-sm sm:text-base mb-1 sm:mb-2 px-2 truncate w-full">{topThree[0]?.store_name || "No Store"}</h3>
                    <p className="text-lg sm:text-xl font-medium">{topThree[0]?.total_points || 0} points</p>
                  </div>
                </div>
              </div>

              {/* 3rd Place */}
              <div className="flex flex-col items-center w-full sm:w-auto">
                <div className="bg-[#CE8946] rounded-t-[50px] rounded-[10px] p-[2px] text-center min-h-[140px] sm:min-h-[160px] w-full max-w-[280px] sm:w-[280px] md:w-[367px] flex flex-col justify-between shadow-lg">
                  <div className="text-2xl sm:text-3xl font-bold">3rd</div>
                  <div className="flex flex-col items-center">
                    <img
                      src={topThree[2] ? getImageUrl(topThree[2].profile_image) : images.jennifer}
                      alt={topThree[2]?.store_name || "Store"}
                      className="w-14 h-14 sm:w-16 sm:h-16 md:w-18 md:h-18 rounded-full mb-3 sm:mb-4"
                      onError={(e) => {
                        e.currentTarget.src = images.admin;
                      }}
                    />
                    <h3 className="text-sm sm:text-base mb-1 px-2 truncate w-full">{topThree[2]?.store_name || "No Store"}</h3>
                    <p className="text-sm sm:text-base font-medium mb-1">{topThree[2]?.total_points || 0} points</p>
                  </div>
                </div>
              </div>
            </div>

            {/* All Users Table */}
            <div className="">
              {/* Header with Bulk Action and Search */}
              <div className="mt-4 sm:mt-5 flex flex-col sm:flex-row justify-between gap-3 sm:gap-0">
                <div className="flex flex-row items-center gap-2">
                  <div>
                    <BulkActionDropdown onActionSelect={handleBulkActionSelect} />
                  </div>
                </div>
                <div className="w-full sm:w-auto">
                  <div>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search"
                        value={searchInput}
                        onChange={handleSearchInputChange}
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

              <div className="bg-white rounded-2xl shadow-sm border-[0.3px] border-[#989898] mt-4 sm:mt-5">
                <div className="p-3 sm:p-4 md:p-5">
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900">All Users</h2>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[800px]">
                    <thead className="bg-[#F2F2F2]">
                      <tr>
                        <th className="p-2 sm:p-3 text-left">
                          <input
                            type="checkbox"
                            className="rounded w-4 h-4 border-gray-300"
                            onChange={(e) => handleSelectAll((e.target as HTMLInputElement).checked)}
                            checked={allVisibleSelected}
                          />
                        </th>
                        <th className="p-2 sm:p-3 text-left font-normal text-black text-xs sm:text-sm">
                          Store Name
                        </th>
                        <th className="p-2 sm:p-3 text-left font-normal text-black text-xs sm:text-sm">
                          Position
                        </th>
                        <th className="p-2 sm:p-3 text-left font-normal text-black text-xs sm:text-sm">
                          Total Points
                        </th>
                        <th className="p-2 sm:p-3 text-left font-normal text-black text-xs sm:text-sm">
                          Orders
                        </th>
                        <th className="p-2 sm:p-3 text-left font-normal text-black text-xs sm:text-sm">
                          Followers
                        </th>
                        <th className="p-2 sm:p-3 text-left font-normal text-black text-xs sm:text-sm">
                          Revenue
                        </th>
                        <th className="p-2 sm:p-3 text-center font-normal text-black text-xs sm:text-sm">
                          Other
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-200">
                      {paginatedUsers.map((store: Store, index: number) => (
                        <tr key={store.store_id} className="hover:bg-gray-50">
                          <td className="p-2 sm:p-3 md:p-4">
                            <input
                              type="checkbox"
                              className="rounded w-4 h-4 border-gray-300"
                              checked={selectedUsers.includes(store.store_id)}
                        onChange={(e) =>
                          handleSelectUser(store.store_id, (e.target as HTMLInputElement).checked)
                        }
                            />
                          </td>
                          <td className="p-2 sm:p-3 md:p-4">
                            <div className="flex items-center">
                              <img
                                src={getImageUrl(store.profile_image)}
                                alt={store.store_name}
                                className="h-8 w-8 sm:h-10 sm:w-10 rounded-full mr-2 sm:mr-3"
                                onError={(e) => {
                                  e.currentTarget.src = images.admin;
                                }}
                              />
                              <span className="text-xs sm:text-sm text-gray-900 truncate">{store.store_name}</span>
                            </div>
                          </td>
                          <td className="p-2 sm:p-3 md:p-4 font-bold text-xs sm:text-sm text-gray-900">
                            {startIndex + index + 1}
                          </td>
                          <td className="p-2 sm:p-3 md:p-4 font-bold text-xs sm:text-sm text-gray-900">
                            {store.total_points?.toLocaleString() || 0}
                          </td>
                          <td className="p-2 sm:p-3 md:p-4 font-bold text-xs sm:text-sm text-gray-900">
                            {store.orders_count?.toLocaleString() || 0}
                          </td>
                          <td className="p-2 sm:p-3 md:p-4 font-bold text-xs sm:text-sm text-gray-900">
                            {store.followers_count?.toLocaleString() || 0}
                          </td>
                          <td className="p-2 sm:p-3 md:p-4 font-bold text-xs sm:text-sm text-gray-900">
                            ₦{store.total_revenue?.toLocaleString() || 0}
                          </td>
                      <td className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 flex justify-center">
                        <button 
                          onClick={() => handleStoreDetails(store)}
                          className="px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 bg-[#E53E3E] text-white rounded-lg hover:bg-red-600 transition-colors cursor-pointer text-xs sm:text-sm"
                        >
                          Store Details
                        </button>
                      </td>
                        </tr>
                      ))}

                      {paginatedUsers.length === 0 && (
                        <tr>
                          <td
                            colSpan={8}
                            className="p-6 text-center text-sm text-gray-500"
                          >
                            No stores found
                            {debouncedSearch ? ` for "${debouncedSearch}"` : ""}.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Showing {startIndex + 1} to {Math.min(endIndex, filteredUsers.length)} of {filteredUsers.length} results
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage <= 1}
                        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      
                      {/* Page numbers */}
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                        if (pageNum > totalPages) return null;
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`px-3 py-2 text-sm font-medium rounded-md ${
                              currentPage === pageNum
                                ? 'bg-[#E53E3E] text-white'
                                : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      
                      <button
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage >= totalPages}
                        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default LeaderBoard;
