import PageHeader from "../../../components/PageHeader";
import images from "../../../constants/images";
import { leaderboardUsers } from "./components/leaderboardData";
import { useEffect, useMemo, useState } from "react";
import BulkActionDropdown from "../../../components/BulkActionDropdown";

const LeaderBoard = () => {
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);

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
    if (!q) return leaderboardUsers;

    return leaderboardUsers.filter((u) => {
      const haystack = [
        u.name,
        String(u.position),
        u.balance,
        String(u.pointsBalance),
        u.userType,
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(q);
    });
  }, [debouncedSearch]);

  // --- Select All should apply to the currently visible (filtered) users ---
  const filteredIds = useMemo(
    () => filteredUsers.map((u) => u.id),
    [filteredUsers]
  );
  const allVisibleSelected =
    filteredIds.length > 0 &&
    filteredIds.every((id) => selectedUsers.includes(id));

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

  const handleSelectUser = (userId: number, checked: boolean) => {
    setSelectedUsers((prev) =>
      checked ? [...prev, userId] : prev.filter((id) => id !== userId)
    );
  };

  const handleBulkActionSelect = (action: string) => {
    console.log("Bulk action selected in Orders:", action);
  };
  return (
    <>
      <PageHeader title="Seller Leaderboard" />
      <div className="p-6">
        {/* Leaderboard Podium */}
        <div className="flex justify-evenly items-end gap-6 mb-8">
          {/* 2nd Place */}
          <div className="flex flex-col items-center">
            <div className="bg-[#C0C0C0] rounded-t-[50px] rounded-[10px] pt-1 pb-2 text-center min-h-[200px] w-[367px] flex flex-col justify-between shadow-lg">
              <div className="text-3xl font-bold ">2nd</div>
              <div className="flex flex-col items-center">
                <img
                  src={images.bella}
                  alt="Bella"
                  className="w-23 h-23 rounded-full mb-4"
                />
                <h3 className=" text-base mb-2">Bella Stores</h3>
                <p className="text-lg font-medium">400 points</p>
              </div>
            </div>
          </div>

          {/* 1st Place */}
          <div className="flex flex-col items-center">
            <div className="bg-[#FFD700] rounded-t-[50px] rounded-[10px] p-8 text-center min-h-[240px] w-[367px] flex flex-col justify-between shadow-lg">
              <div className="text-3xl font-bold mb-3">1st</div>
              <div className="flex flex-col items-center">
                <img
                  src={images.sasha}
                  alt="Sasha"
                  className="w-28 h-28 rounded-full mb-4"
                />
                <h3 className=" text-base mb-2">Sasha Stores</h3>
                <p className="text-xl font-medium">400 points</p>
              </div>
            </div>
          </div>

          {/* 3rd Place */}
          <div className="flex flex-col items-center">
            <div className="bg-[#CE8946] rounded-t-[50px] rounded-[10px] p-[2px] text-center min-h-[160px] w-[367px] flex flex-col justify-between shadow-lg">
              <div className="text-3xl font-bold">3rd</div>
              <div className="flex flex-col items-center">
                <img
                  src={images.jennifer}
                  alt="Jennifer"
                  className="w-18 h-18 rounded-full mb-4"
                />
                <h3 className=" text-base mb-1">Jennifer Stores</h3>
                <p className="text-base font-medium mb-1">400 points</p>
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
                    onChange={(e) => setSearchInput(e.target.value)}
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
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        checked={allVisibleSelected}
                      />
                    </th>
                    <th className="p-3 text-left font-normal text-black">
                      User Name
                    </th>
                    <th className="p-3 text-left font-normal text-black">
                      Position
                    </th>
                    <th className="p-3 text-left font-normal text-black">
                      Balance
                    </th>
                    <th className="p-3 text-left font-normal text-black">
                      Points Balance
                    </th>
                    <th className="p-3 text-left font-normal text-black">
                      User type
                    </th>
                    <th className="p-3 text-center font-normal text-black">
                      Other
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="p-4 ">
                        <input
                          type="checkbox"
                          className="rounded w-4 h-4 border-gray-300"
                          checked={selectedUsers.includes(user.id)}
                          onChange={(e) =>
                            handleSelectUser(user.id, e.target.checked)
                          }
                        />
                      </td>
                      <td className="p-4 ">
                        <div className="flex items-center">
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="h-10 w-10 rounded-full mr-3"
                          />
                          <span className="text-gray-900">{user.name}</span>
                        </div>
                      </td>
                      <td className="p-4 font-bold text-gray-900">
                        {user.position}
                      </td>
                      <td className="p-4 font-bold text-gray-900">
                        {user.balance}
                      </td>
                      <td className="p-4 font-bold text-gray-900">
                        {user.pointsBalance}
                      </td>
                      <td className="px-6 text-gray-900">{user.userType}</td>
                      <td className="px-6 py-3 flex justify-center">
                        <button className="px-4 py-2 bg-[#E53E3E] text-white rounded-lg hover:bg-red-600 transition-colors">
                          User Details
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
                        No users found
                        {debouncedSearch ? ` for “${debouncedSearch}”` : ""}.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LeaderBoard;
