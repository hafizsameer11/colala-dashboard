import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import images from "../../../constants/images";
interface DotsDropdownProps {
  onActionSelect?: (action: string) => void;
}

const DotsDropdown: React.FC<DotsDropdownProps> = ({ onActionSelect }) => {
  const [isDotsDropdownOpen, setIsDotsDropdownOpen] = useState(false);

  const DotsActions = ["Block user", "Ban user"];

  // Icons for each action (use your actual icon paths here)
  const actionIcons: Record<string, string> = {
    "Block user": "/assets/layout/block.svg", // replace with your actual image paths
    "Ban user": "/assets/layout/ban.svg",
  };

  const handleDotsDropdownToggle = () => {
    setIsDotsDropdownOpen(!isDotsDropdownOpen);
  };

  const handleDotsOptionSelect = (action: string) => {
    setIsDotsDropdownOpen(false);

    if (onActionSelect) {
      onActionSelect(action);
    }

    console.log("Selected Dots action:", action);
  };

  return (
    <div className="relative">
      <button
        onClick={handleDotsDropdownToggle}
        className="w-10 h-10 cursor-pointer"
      >
        <img src={images.dots} alt="Dots" />
      </button>

      {isDotsDropdownOpen && (
        <div className="absolute z-10 mt-2 right-5 w-44 bg-white border border-gray-200 rounded-lg shadow-lg">
          {DotsActions.map((action) => (
            <button
              key={action}
              onClick={() => handleDotsOptionSelect(action)}
              className={`flex items-center gap-2.5 w-full text-left px-4 py-2 text-sm ${
                action === "Ban user" ? "text-[#FF0000]" : "text-black"
              } cursor-pointer font-medium`}
            >
              <img
                src={actionIcons[action]}
                alt={`${action} icon`}
                className="w-4 h-4"
              />
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
  userType: string;
  userImage?: string;
}

interface UsersTableProps {
  title?: string;
  onRowSelect?: (selectedIds: string[]) => void;
}

const UsersTable: React.FC<UsersTableProps> = ({
  title = "All Users",
  onRowSelect,
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

  const handleSelectAll = () => {
    const allIds = users.map((user) => user.id);
    const newSelection = selectAll ? [] : allIds;
    setSelectedRows(newSelection);
    setSelectAll(!selectAll);

    if (onRowSelect) {
      onRowSelect(newSelection);
    }
  };

  const handleRowSelect = (id: string) => {
    const isSelected = selectedRows.includes(id);
    const newSelection = isSelected
      ? selectedRows.filter((rowId) => rowId !== id)
      : [...selectedRows, id];

    setSelectedRows(newSelection);
    setSelectAll(newSelection.length === users.length);

    if (onRowSelect) {
      onRowSelect(newSelection);
    }
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
                  checked={selectAll}
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
            {users.map((user) => (
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
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersTable;
