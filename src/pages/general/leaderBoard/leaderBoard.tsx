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

  // --- Select All should apply to the currently visible (filtered) users ---
  const filteredIds = useMemo(
    () => filteredUsers.map((u: Store) => u.store_id),
    [filteredUsers]
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
      <div className="p-6">
        {/* Period Selector */}
        <div className="mb-6 flex justify-center">
          <div className="flex items-center space-x-0.5 border border-[#989898] rounded-lg p-2 w-fit bg-white">
            {(['today', 'weekly', 'monthly', 'all'] as const).map((period) => {
              const isActive = selectedPeriod === period;
              return (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`py-2 text-sm rounded-lg font-normal transition-all duration-200 cursor-pointer ${isActive ? "px-8 bg-[#E53E3E] text-white" : "px-4 text-black"
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
            <div className="flex justify-evenly items-end gap-6 mb-8">
              {/* 2nd Place */}
              <div className="flex flex-col items-center">
                <div className="bg-[#C0C0C0] rounded-t-[50px] rounded-[10px] pt-1 pb-2 text-center min-h-[200px] w-[367px] flex flex-col justify-between shadow-lg">
                  <div className="text-3xl font-bold ">2nd</div>
                  <div className="flex flex-col items-center">
                    <img
                      src={topThree[1] ? getImageUrl(topThree[1].profile_image) : images.bella}
                      alt={topThree[1]?.store_name || "Store"}
                      className="w-23 h-23 rounded-full mb-4"
                      onError={(e) => {
                        e.currentTarget.src = images.admin;
                      }}
                    />
                    <h3 className=" text-base mb-2">{topThree[1]?.store_name || "No Store"}</h3>
                    <p className="text-lg font-medium">{topThree[1]?.total_points || 0} points</p>
                  </div>
                </div>
              </div>

              {/* 1st Place */}
              <div className="flex flex-col items-center">
                <div className="bg-[#FFD700] rounded-t-[50px] rounded-[10px] p-8 text-center min-h-[240px] w-[367px] flex flex-col justify-between shadow-lg">
                  <div className="text-3xl font-bold mb-3">1st</div>
                  <div className="flex flex-col items-center">
                    <img
                      src={topThree[0] ? getImageUrl(topThree[0].profile_image) : images.sasha}
                      alt={topThree[0]?.store_name || "Store"}
                      className="w-28 h-28 rounded-full mb-4"
                      onError={(e) => {
                        e.currentTarget.src = images.admin;
                      }}
                    />
                    <h3 className=" text-base mb-2">{topThree[0]?.store_name || "No Store"}</h3>
                    <p className="text-xl font-medium">{topThree[0]?.total_points || 0} points</p>
                  </div>
                </div>
              </div>

              {/* 3rd Place */}
              <div className="flex flex-col items-center">
                <div className="bg-[#CE8946] rounded-t-[50px] rounded-[10px] p-[2px] text-center min-h-[160px] w-[367px] flex flex-col justify-between shadow-lg">
                  <div className="text-3xl font-bold">3rd</div>
                  <div className="flex flex-col items-center">
                    <img
                      src={topThree[2] ? getImageUrl(topThree[2].profile_image) : images.jennifer}
                      alt={topThree[2]?.store_name || "Store"}
                      className="w-18 h-18 rounded-full mb-4"
                      onError={(e) => {
                        e.currentTarget.src = images.admin;
                      }}
                    />
                    <h3 className=" text-base mb-1">{topThree[2]?.store_name || "No Store"}</h3>
                    <p className="text-base font-medium mb-1">{topThree[2]?.total_points || 0} points</p>
                  </div>
                </div>
              </div>
            </div>

            {/* All Users Table */}
            <div className="">
              {/* Header with Bulk Action and Search */}
              <div className="mt-5 flex flex-row justify-between">
                <div className="flex flex-row items-center gap-2">
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
                        onChange={handleSearchInputChange}
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

              <div className="bg-white rounded-2xl shadow-sm border-[0.3px] border-[#989898] mt-5">
                <div className="p-5 ">
                  <h2 className="text-lg font-semibold text-gray-900">All Users</h2>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[#F2F2F2]">
                      <tr>
                        <th className="p-3 text-left">
                          <input
                            type="checkbox"
                            className="rounded w-4 h-4 border-gray-300"
                            onChange={(e) => handleSelectAll((e.target as HTMLInputElement).checked)}
                            checked={allVisibleSelected}
                          />
                        </th>
                        <th className="p-3 text-left font-normal text-black">
                          Store Name
                        </th>
                        <th className="p-3 text-left font-normal text-black">
                          Position
                        </th>
                        <th className="p-3 text-left font-normal text-black">
                          Total Points
                        </th>
                        <th className="p-3 text-left font-normal text-black">
                          Orders
                        </th>
                        <th className="p-3 text-left font-normal text-black">
                          Followers
                        </th>
                        <th className="p-3 text-left font-normal text-black">
                          Revenue
                        </th>
                        <th className="p-3 text-center font-normal text-black">
                          Other
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-200">
                      {filteredUsers.map((store: Store, index: number) => (
                        <tr key={store.store_id} className="hover:bg-gray-50">
                          <td className="p-4 ">
                            <input
                              type="checkbox"
                              className="rounded w-4 h-4 border-gray-300"
                              checked={selectedUsers.includes(store.store_id)}
                        onChange={(e) =>
                          handleSelectUser(store.store_id, (e.target as HTMLInputElement).checked)
                        }
                            />
                          </td>
                          <td className="p-4 ">
                            <div className="flex items-center">
                              <img
                                src={getImageUrl(store.profile_image)}
                                alt={store.store_name}
                                className="h-10 w-10 rounded-full mr-3"
                                onError={(e) => {
                                  e.currentTarget.src = images.admin;
                                }}
                              />
                              <span className="text-gray-900">{store.store_name}</span>
                            </div>
                          </td>
                          <td className="p-4 font-bold text-gray-900">
                            {index + 1}
                          </td>
                          <td className="p-4 font-bold text-gray-900">
                            {store.total_points?.toLocaleString() || 0}
                          </td>
                          <td className="p-4 font-bold text-gray-900">
                            {store.orders_count?.toLocaleString() || 0}
                          </td>
                          <td className="p-4 font-bold text-gray-900">
                            {store.followers_count?.toLocaleString() || 0}
                          </td>
                          <td className="p-4 font-bold text-gray-900">
                            ₦{store.total_revenue?.toLocaleString() || 0}
                          </td>
                      <td className="px-6 py-3 flex justify-center">
                        <button 
                          onClick={() => handleStoreDetails(store)}
                          className="px-4 py-2 bg-[#E53E3E] text-white rounded-lg hover:bg-red-600 transition-colors cursor-pointer"
                        >
                          Store Details
                        </button>
                      </td>
                        </tr>
                      ))}

                      {filteredUsers.length === 0 && (
                        <tr>
                          <td
                            colSpan={7}
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
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default LeaderBoard;
