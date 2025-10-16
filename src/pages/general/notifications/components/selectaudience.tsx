import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAudienceData } from "../../../../utils/queries/notifications";
import images from "../../../../constants/images";

interface SelectAudienceProps {
  isOpen: boolean;
  onClose: () => void;
  onApply?: (selectedUsers: string[]) => void;
}

interface User {
  id: string;
  name: string;
  email: string;
  user_code: string;
  profile_picture?: string;
  store_name?: string; // For sellers
}

const SelectAudience: React.FC<SelectAudienceProps> = ({
  isOpen,
  onClose,
  onApply,
}) => {
  const [activeTab, setActiveTab] = useState<"Buyers" | "Sellers">("Buyers");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch audience data from API
  const { data: audienceData, isLoading, error } = useQuery({
    queryKey: ['audienceData', searchQuery],
    queryFn: () => getAudienceData(searchQuery, 100),
    enabled: isOpen,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Transform API data to component format
  const buyers: User[] = useMemo(() => {
    if (!audienceData?.data?.buyers) return [];
    return audienceData.data.buyers.map((buyer: any) => ({
      id: buyer.id.toString(),
      name: buyer.name,
      email: buyer.email,
      user_code: buyer.user_code,
      profile_picture: buyer.profile_picture,
    }));
  }, [audienceData]);

  const sellers: User[] = useMemo(() => {
    if (!audienceData?.data?.sellers) return [];
    return audienceData.data.sellers.map((seller: any) => ({
      id: seller.id.toString(),
      name: seller.name,
      email: seller.email,
      user_code: seller.user_code,
      profile_picture: seller.profile_picture,
      store_name: seller.store_name,
    }));
  }, [audienceData]);

  const getCurrentUsers = () => (activeTab === "Buyers" ? buyers : sellers);

  const filteredUsers = useMemo(
    () =>
      getCurrentUsers().filter((user) =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.user_code.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [activeTab, searchQuery, buyers, sellers]
  );

  const handleUserToggle = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = (userType: "Buyers" | "Sellers") => {
    const currentUsers = userType === "Buyers" ? buyers : sellers;
    const currentUserIds = currentUsers.map((u) => u.id);
    const allSelected = currentUserIds.every((id) =>
      selectedUsers.includes(id)
    );

    setSelectedUsers((prev) => {
      if (allSelected) {
        // Deselect all in this group
        return prev.filter((id) => !currentUserIds.includes(id));
      }
      // Select all in this group (keep others intact, avoid dupes)
      const filteredPrev = prev.filter((id) => !currentUserIds.includes(id));
      return [...filteredPrev, ...currentUserIds];
    });
  };

  const handleApply = () => {
    onApply?.(selectedUsers);
    onClose();
  };

  const handleClose = () => {
    setSelectedUsers([]);
    setSearchQuery("");
    onClose();
  };

  const isUserSelected = (userId: string) => selectedUsers.includes(userId);

  // Helpers for section indicators
  const areAnySelected = (type: "Buyers" | "Sellers") => {
    const pool = type === "Buyers" ? buyers : sellers;
    return pool.some((u) => selectedUsers.includes(u.id));
  };
  const areAllSelected = (type: "Buyers" | "Sellers") => {
    const pool = type === "Buyers" ? buyers : sellers;
    return pool.every((u) => selectedUsers.includes(u.id));
  };

  const buyersAny = areAnySelected("Buyers");
  const buyersAll = areAllSelected("Buyers");
  const sellersAny = areAnySelected("Sellers");
  const sellersAll = areAllSelected("Sellers");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 bg-[#00000080] bg-opacity-50 flex justify-end">
      <div className="bg-white w-[500px] relative h-full overflow-y-auto">
        {/* Header */}
        <div className="border-b border-[#787878] px-3 py-3 sticky top-0 bg-white z-10">
          <div className="flex flex-row justify-between">
            <div className="flex items-center">
              <button
                onClick={handleClose}
                className="mr-1.5 text-gray-600 hover:text-gray-800"
              >
                <svg
                  className="w-6 h-6 cursor-pointer"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <h2 className="text-lg font-medium text-gray-900">
                Select Audience
              </h2>
            </div>
            <div className="flex flex-row items-center gap-2">
              <div>
                <button
                  onClick={handleApply}
                  className="bg-[#E53E3E] text-white px-6 py-3 cursor-pointer rounded-xl hover:bg-[#d32f2f] transition-colors text-sm font-medium"
                >
                  Apply
                </button>
              </div>
              <div>
                <div className="flex flex-row items-center gap-3">
                  <button
                    onClick={handleClose}
                    className="p-2 rounded-md cursor-pointer"
                    aria-label="Close"
                  >
                    <img className="w-7 h-7" src={images.close} alt="Close" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Statistics */}
          {audienceData?.data?.statistics && (
            <div className="mb-4 p-4 bg-gray-50 rounded-xl">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-[#E53E3E]">
                    {audienceData.data.statistics.total_buyers || 0}
                  </div>
                  <div className="text-sm text-gray-600">Total Buyers</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-[#E53E3E]">
                    {audienceData.data.statistics.total_sellers || 0}
                  </div>
                  <div className="text-sm text-gray-600">Total Sellers</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-[#E53E3E]">
                    {audienceData.data.statistics.total_users || 0}
                  </div>
                  <div className="text-sm text-gray-600">Total Users</div>
                </div>
              </div>
            </div>
          )}

          {/* Audience Type Selection */}
          <div className="mb-4 space-y-3">
            {/* Buyers Row */}
            <div
              className="flex items-center justify-between p-5 border border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50"
              role="button"
              onClick={() => handleSelectAll("Buyers")}
            >
              <span className="text font-medium text-gray-900 select-none">
                Buyers
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectAll("Buyers");
                }}
                aria-label="Toggle Buyers"
                className="w-5 h-5 rounded flex items-center justify-center cursor-pointer border border-gray-300"
              >
                {buyersAll ? (
                  // Full check
                  <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 20 20">
                    <rect
                      width="20"
                      height="20"
                      rx="3"
                      className="fill-[#E53E3E]"
                    />
                    <path
                      d="M5 10.5l3 3 7-7"
                      className="stroke-white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                  </svg>
                ) : buyersAny ? (
                  // Indeterminate (some selected)
                  <svg className="w-5 h-5" viewBox="0 0 20 20">
                    <rect
                      width="20"
                      height="20"
                      rx="3"
                      className="fill-white stroke-gray-300"
                    />
                    <rect
                      x="4.5"
                      y="9"
                      width="11"
                      height="2"
                      rx="1"
                      className="fill-[#E53E3E]"
                    />
                  </svg>
                ) : (
                  // Empty
                  <svg className="w-5 h-5" viewBox="0 0 20 20">
                    <rect
                      width="20"
                      height="20"
                      rx="3"
                      className="fill-white stroke-gray-300"
                    />
                  </svg>
                )}
              </button>
            </div>

            {/* Sellers Row */}
            <div
              className="flex items-center justify-between p-5 border border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50"
              role="button"
              onClick={() => handleSelectAll("Sellers")}
            >
              <span className="text font-medium text-gray-900 select-none">
                Sellers
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectAll("Sellers");
                }}
                aria-label="Toggle Sellers"
                className="w-5 h-5 rounded flex items-center justify-center cursor-pointer border border-gray-300"
              >
                {sellersAll ? (
                  <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 20 20">
                    <rect
                      width="20"
                      height="20"
                      rx="3"
                      className="fill-[#E53E3E]"
                    />
                    <path
                      d="M5 10.5l3 3 7-7"
                      className="stroke-white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                  </svg>
                ) : sellersAny ? (
                  <svg className="w-5 h-5" viewBox="0 0 20 20">
                    <rect
                      width="20"
                      height="20"
                      rx="3"
                      className="fill-white stroke-gray-300"
                    />
                    <rect
                      x="4.5"
                      y="9"
                      width="11"
                      height="2"
                      rx="1"
                      className="fill-[#E53E3E]"
                    />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 20 20">
                    <rect
                      width="20"
                      height="20"
                      rx="3"
                      className="fill-white stroke-gray-300"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-3 mb-5">
            <button
              onClick={() => setActiveTab("Buyers")}
              className={`w-full py-3 rounded-2xl cursor-pointer font-medium transition-colors ${
                activeTab === "Buyers"
                  ? "bg-[#E53E3E] text-white"
                  : "bg-white text-black border border-gray-300"
              }`}
            >
              Buyers
            </button>
            <button
              onClick={() => setActiveTab("Sellers")}
              className={`w-full py-3 rounded-2xl cursor-pointer font-medium transition-colors ${
                activeTab === "Sellers"
                  ? "bg-[#E53E3E] text-white"
                  : "bg-white text-black border border-gray-300"
              }`}
            >
              Sellers
            </button>
          </div>

          {/* Search */}
          <div className="mb-4">
            <input
              type="text"
              placeholder={`Search ${activeTab.toLowerCase()}`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          {/* User List */}
          <div className="space-y-3 max-h-80 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E53E3E]"></div>
              </div>
            ) : error ? (
              <div className="text-center text-red-500 py-4">
                <p>Error loading audience data</p>
                <p className="text-sm mt-2">{error.message}</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center text-gray-500 py-4">
                <p>No {activeTab.toLowerCase()} found</p>
                {searchQuery && <p className="text-sm mt-2">Try adjusting your search</p>}
              </div>
            ) : (
              filteredUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => handleUserToggle(user.id)}
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                    <img
                      src={user.profile_picture || "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNGM0Y0RjYiLz4KPHN2ZyB4PSI4IiB5PSI4IiB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSI+CjxwYXRoIGQ9Ik0yMCAyMXYtMmE0IDQgMCAwIDAtNC00SDhhNCA0IDAgMCAwLTQgNHYyIiBzdHJva2U9IiM5Q0EzQUYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjxjaXJjbGUgY3g9IjEyIiBjeT0iNyIgcj0iNCIgc3Ryb2tlPSIjOUNBM0FGIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4KPC9zdmc+"}
                      alt={user.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src =
                          "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNGM0Y0RjYiLz4KPHN2ZyB4PSI4IiB5PSI4IiB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSI+CjxwYXRoIGQ9Ik0yMCAyMXYtMmE0IDQgMCAwIDAtNC00SDhhNCA0IDAgMCAwLTQgNHYyIiBzdHJva2U9IiM5Q0EzQUYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjxjaXJjbGUgY3g9IjEyIiBjeT0iNyIgcj0iNCIgc3Ryb2tlPSIjOUNBM0FGIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4KPC9zdmc+";
                      }}
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900">
                      {user.name}
                    </span>
                    <span className="text-xs text-gray-500">{user.email}</span>
                    {user.store_name && (
                      <span className="text-xs text-blue-600">{user.store_name}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={isUserSelected(user.id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleUserToggle(user.id);
                    }}
                    className="w-4 h-4 rounded border-gray-300 text-[#E53E3E] focus:ring-[#E53E3E] cursor-pointer"
                  />
                </div>
              </div>
              ))
            )}
          </div>

          {/* Send Button */}
          <button
            onClick={handleApply}
            className="w-full mt-5 bg-[#E53E3E] text-white py-4 rounded-xl hover:bg-[#d32f2f] transition-colors font-medium cursor-pointer mb-10"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default SelectAudience;
