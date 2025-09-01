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

interface Store {
  id: string;
  storeName: string;
  email: string;
  phoneNumber: string;
  level: number;
  walletBalance?: string;
  userImage?: string;
}

interface StoreTableProps {
  title?: string;
  onRowSelect?: (selectedIds: string[]) => void;
}

const StoreTable: React.FC<StoreTableProps> = ({
  title = "Users",
  onRowSelect,
}) => {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const navigate = useNavigate();

  const stores: Store[] = [
    {
      id: "1",
      storeName: "Adebayo Stores",
      email: "adebayo.w@outlook.com",
      phoneNumber: "09098765432",
      level: 1,
      walletBalance: "₦150,000",
    },
    {
      id: "2",
      storeName: "Halima Stores",
      email: "halima.abubakar@protonmail.com",
      phoneNumber: "08056781234",
      level: 2,
      walletBalance: "₦250,000",
    },
    {
      id: "3",
      storeName: "Chidinma Stores",
      email: "chidinma.okoro@yahoo.com",
      phoneNumber: "08021234567",
      level: 3,
      walletBalance: "₦180,000",
    },
    {
      id: "4",
      storeName: "Fatima Stores",
      email: "fatima.bello@icloud.com",
      phoneNumber: "08181122334",
      level: 1,
      walletBalance: "₦95,000",
    },
    {
      id: "5",
      storeName: "Emeka Stores",
      email: "emeka.eze.ng@gmail.com",
      phoneNumber: "07065557788",
      level: 1,
      walletBalance: "₦320,000",
    },
    {
      id: "6",
      storeName: "Tunde Stores",
      email: "tunde.ogunsola@live.com",
      phoneNumber: "09034445566",
      level: 1,
      walletBalance: "₦75,000",
    },
    {
      id: "7",
      storeName: "Tunde Stores",
      email: "tunde.ogunsola@live.com",
      phoneNumber: "09034445566",
      level: 2,
      walletBalance: "₦195,000",
    },
  ];

  const handleSelectAll = () => {
    const allIds = stores.map((store) => store.id);
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
    setSelectAll(newSelection.length === stores.length);

    if (onRowSelect) {
      onRowSelect(newSelection);
    }
  };

  const handleCustomerDetails = (store: Store) => {
    navigate(`/store-details/${store.id}`, { state: store });
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
              <th className="p-3 text-left font-normal">Store Name</th>
              <th className="p-3 text-left font-normal">Email</th>
              <th className="p-3 text-left font-normal">Phone No</th>
              <th className="p-3 text-center font-normal">Level</th>
              <th className="p-3 text-center font-normal">Actions</th>
              <th className="p-3 text-right font-normal">Other</th>
            </tr>
          </thead>
          <tbody>
            {stores.map((store) => (
              <tr
                key={store.id}
                className="text-center border-t border-gray-200"
              >
                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(store.id)}
                    onChange={() => handleRowSelect(store.id)}
                    className="w-5 h-5"
                  />
                </td>
                <td className="p-3 text-left flex items-center justify-start gap-2">
                  <img
                    src="/assets/layout/admin.png"
                    alt="User"
                    className="w-8 h-8 rounded-full"
                  />
                  <span>{store.storeName}</span>
                </td>
                <td className="p-3 text-left">{store.email}</td>
                <td className="p-3 text-left">{store.phoneNumber}</td>
                <td className="p-3 font-bold">{store.level}</td>
                <td className="p-3 space-x-1">
                  <button
                    onClick={() => handleCustomerDetails(store)}
                    className="bg-[#E53E3E] hover:bg-red-600 text-white px-4 py-2 rounded-lg cursor-pointer"
                  >
                    Customer Details
                  </button>
                  <button className="bg-black hover:bg-gray-900 text-white px-4 py-2 rounded-lg cursor-pointer">
                    Transactions
                  </button>
                </td>
                <td className="p-3 text-right">
                  <DotsDropdown
                    onActionSelect={(action) =>
                      console.log(`Action ${action} for store ${store.id}`)
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StoreTable;
