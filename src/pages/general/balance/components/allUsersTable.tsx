import React, { useMemo, useState, useEffect } from "react";

interface User {
  id: string;
  userName: string;
  shoppingBalance: string;
  escrowBalance: string;
  pointsBalance: string;
  userType: "Buyer" | "Seller";
  userImage?: string;
}

interface UsersTableProps {
  title?: string;
  onRowSelect?: (selectedIds: string[]) => void;
  filterType?: "All" | "Buyers" | "Sellers";
  searchTerm?: string;
}

const UsersTable: React.FC<UsersTableProps> = ({
  title = "All Users",
  onRowSelect,
  filterType = "All",
  searchTerm = "",
}) => {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  const users: User[] = [
    {
      id: "1",
      userName: "Ibrahim Musa",
      shoppingBalance: "₦250,000",
      escrowBalance: "₦250,000",
      pointsBalance: "800",
      userType: "Buyer",
    },
    {
      id: "2",
      userName: "Emeka Okafor",
      shoppingBalance: "₦1,200,000",
      escrowBalance: "₦950,000",
      pointsBalance: "1500",
      userType: "Seller",
    },
    {
      id: "3",
      userName: "Funmilayo Adekunle",
      shoppingBalance: "₦50,000",
      escrowBalance: "₦45,000",
      pointsBalance: "210",
      userType: "Buyer",
    },
    {
      id: "4",
      userName: "Fatima Bello",
      shoppingBalance: "₦88,000",
      escrowBalance: "₦88,000",
      pointsBalance: "420",
      userType: "Buyer",
    },
    {
      id: "5",
      userName: "Chiamaka Nwosu",
      shoppingBalance: "₦75,500",
      escrowBalance: "₦50,000",
      pointsBalance: "350",
      userType: "Seller",
    },
    {
      id: "6",
      userName: "Tunde Ojo",
      shoppingBalance: "₦310,000",
      escrowBalance: "₦200,000",
      pointsBalance: "650",
      userType: "Buyer",
    },
    {
      id: "7",
      userName: "Adebayo Williams",
      shoppingBalance: "₦100,000",
      escrowBalance: "₦100,000",
      pointsBalance: "500",
      userType: "Buyer",
    },
  ];

  // Tab filter
  const matchesTab = (u: User) => {
    if (filterType === "All") return true;
    if (filterType === "Buyers") return u.userType === "Buyer";
    if (filterType === "Sellers") return u.userType === "Seller";
    return true;
  };

  // Search across fields (case-insensitive)
  const filteredUsers = useMemo(() => {
    const term = (searchTerm || "").toLowerCase();

    return users.filter(matchesTab).filter((u) => {
      if (!term) return true;
      const haystack = [
        u.userName,
        u.shoppingBalance,
        u.escrowBalance,
        u.pointsBalance,
        u.userType,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(term);
    });
  }, [users, filterType, searchTerm]);

  // keep selection in sync with current view
  useEffect(() => {
    setSelectAll(false);
    setSelectedRows((prev) =>
      prev.filter((id) => filteredUsers.some((u) => u.id === id))
    );
  }, [filterType, searchTerm]); // eslint-disable-line

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRows([]);
      onRowSelect?.([]);
    } else {
      const visibleIds = filteredUsers.map((u) => u.id);
      setSelectedRows(visibleIds);
      onRowSelect?.(visibleIds);
    }
    setSelectAll(!selectAll);
  };

  const handleRowSelect = (id: string) => {
    const isSelected = selectedRows.includes(id);
    const newSelection = isSelected
      ? selectedRows.filter((rowId) => rowId !== id)
      : [...selectedRows, id];

    setSelectedRows(newSelection);
    setSelectAll(
      newSelection.length > 0 && newSelection.length === filteredUsers.length
    );
    onRowSelect?.(newSelection);
  };

  return (
    <div className="border border-gray-300 rounded-2xl mt-5">
      <div className="bg-white p-5 rounded-t-2xl font-semibold text-lg border-b border-gray-300">
        {title}
      </div>
      <div className="bg-white rounded-b-2xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#F2F2F2]">
            <tr className="text-center">
              <th className="p-3 text-left font-semibold">
                <input
                  type="checkbox"
                  checked={
                    selectAll &&
                    filteredUsers.length > 0 &&
                    selectedRows.length === filteredUsers.length
                  }
                  onChange={handleSelectAll}
                  className="w-5 h-5"
                />
              </th>
              <th className="p-3 text-left font-normal">User Name</th>
              <th className="p-3 text-left font-normal">Shopping balance</th>
              <th className="p-3 text-center font-normal">Escrow balance</th>
              <th className="p-3 text-center font-normal">Points Balance</th>
              <th className="p-3 text-center font-normal">User type</th>
              <th className="p-3 text-center font-normal">Other</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr
                key={user.id}
                className="text-center border-t border-gray-200"
              >
                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(user.id)}
                    onChange={() => handleRowSelect(user.id)}
                    className="w-5 h-5"
                  />
                </td>
                <td className="p-3 text-left flex items-center justify-start gap-2">
                  <img
                    src="/assets/layout/admin.png"
                    alt="User"
                    className="w-8 h-8 rounded-full"
                  />
                  <span>{user.userName}</span>
                </td>
                <td className="p-3 text-left font-semibold">
                  {user.shoppingBalance}
                </td>
                <td className="p-3 font-semibold">{user.escrowBalance}</td>
                <td className="p-3 font-semibold">{user.pointsBalance}</td>
                <td className="p-3">{user.userType}</td>
                <td className="p-3 flex items-center justify-start gap-2">
                  <button className="bg-[#E53E3E] hover:bg-red-600 text-white px-4 py-2 rounded-lg cursor-pointer">
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
                  No users found{searchTerm ? ` for “${searchTerm}”` : ""}
                  {filterType !== "All" ? ` in ${filterType}` : ""}.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersTable;
