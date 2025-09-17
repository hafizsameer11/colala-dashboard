import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import images from "../../../../constants/images";

interface DotsDropdownProps {
  onActionSelect?: (action: string) => void;
}

const DotsDropdown: React.FC<DotsDropdownProps> = ({ onActionSelect }) => {
  const [isDotsDropdownOpen, setIsDotsDropdownOpen] = useState(false);
  const DotsActions = ["Block user", "Ban user"];
  const actionIcons: Record<string, string> = {
    "Block user": "/assets/layout/block.svg",
    "Ban user": "/assets/layout/ban.svg",
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsDotsDropdownOpen((s) => !s)}
        className="w-10 h-10 cursor-pointer"
      >
        <img src={images.dots} alt="Dots" />
      </button>

      {isDotsDropdownOpen && (
        <div className="absolute z-10 mt-2 right-5 w-44 bg-white border border-gray-200 rounded-lg shadow-lg">
          {DotsActions.map((action) => (
            <button
              key={action}
              onClick={() => {
                setIsDotsDropdownOpen(false);
                onActionSelect?.(action);
                console.log("Selected Dots action:", action);
              }}
              className={`flex items-center gap-2.5 w-full text-left px-4 py-2 text-sm ${
                action === "Ban user" ? "text-[#FF0000]" : "text-black"
              } cursor-pointer font-medium`}
            >
              <img src={actionIcons[action]} alt="" className="w-4 h-4" />
              <span>{action}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

interface User {
  id: string;
  userName: string;
  email: string;
  phoneNumber: string;
  walletBalance: string;
  userType: "Buyer" | "Seller";
  userImage?: string;
}

interface UsersTableProps {
  title?: string;
  onRowSelect?: (selectedIds: string[]) => void;
  filterType?: "All" | "Buyers" | "Sellers"; // <-- from parent tabs
  searchTerm?: string; // <-- debounced search from parent
}

const UsersTable: React.FC<UsersTableProps> = ({
  title = "All Users",
  onRowSelect,
  filterType = "All",
  searchTerm = "",
}) => {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const navigate = useNavigate();

  const users: User[] = [
    {
      id: "1",
      userName: "Adebayo Williams",
      email: "adebayo.w@outlook.com",
      phoneNumber: "09098765432",
      walletBalance: "₦15,750",
      userType: "Buyer",
    },
    {
      id: "2",
      userName: "Halima Abubakar",
      email: "halima.abubakar@protonmail.com",
      phoneNumber: "08056781234",
      walletBalance: "₦110,300",
      userType: "Buyer",
    },
    {
      id: "3",
      userName: "Chidinma Okoro",
      email: "chidinma.okoro@yahoo.com",
      phoneNumber: "08021234567",
      walletBalance: "₦42,500",
      userType: "Buyer",
    },
    {
      id: "4",
      userName: "Fatima Bello",
      email: "fatima.bello@icloud.com",
      phoneNumber: "08181122334",
      walletBalance: "₦78,000",
      userType: "Seller",
    },
    {
      id: "5",
      userName: "Emeka Eze",
      email: "emeka.eze.ng@gmail.com",
      phoneNumber: "07065557788",
      walletBalance: "₦5,200",
      userType: "Buyer",
    },
    {
      id: "6",
      userName: "Tunde Ogunsola",
      email: "tunde.ogunsola@live.com",
      phoneNumber: "09034445566",
      walletBalance: "₦33,999",
      userType: "Seller",
    },
    {
      id: "7",
      userName: "Tunde Ogunsola",
      email: "tunde.ogunsola@live.com",
      phoneNumber: "09034445566",
      walletBalance: "₦33,999",
      userType: "Buyer",
    },
  ];

  // Map tab -> filter
  const matchesTab = (u: User) => {
    if (filterType === "All") return true;
    if (filterType === "Buyers") return u.userType === "Buyer";
    if (filterType === "Sellers") return u.userType === "Seller";
    return true;
  };

  // Search across common fields (case-insensitive)
  const filteredUsers = useMemo(() => {
    const term = (searchTerm || "").toLowerCase();
    return users.filter(matchesTab).filter((u) => {
      if (!term) return true;
      const haystack = [
        u.userName,
        u.email,
        u.phoneNumber,
        u.walletBalance,
        u.userType,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(term);
    });
  }, [users, filterType, searchTerm]);

  // keep selection in sync with filtered view
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

  const handleCustomerDetails = (user: User) => {
    navigate(`/customer-details/${user.id}`, { state: user });
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
              <th className="p-3 text-center font-normal">Email</th>
              <th className="p-3 text-center font-normal">Phone No</th>
              <th className="p-3 text-center font-normal">Wallet Balance</th>
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
                <td className="p-3">{user.email}</td>
                <td className="p-3">{user.phoneNumber}</td>
                <td className="p-3 font-bold">{user.walletBalance}</td>
                <td className="p-3">{user.userType}</td>
                <td className="p-3 flex flex-row items-center gap-2">
                  <div>
                    <button
                      onClick={() => handleCustomerDetails(user)}
                      className="bg-[#E53E3E] hover:bg-red-600 text-white px-4 py-2 rounded-lg cursor-pointer"
                    >
                      User Details
                    </button>
                  </div>
                  <div>
                    <DotsDropdown
                      onActionSelect={(action) =>
                        console.log(`Action ${action} for user ${user.id}`)
                      }
                    />
                  </div>
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
