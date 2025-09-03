import React, { useState, useEffect } from "react";
import AddStoreModal from "./addStoreModel";

interface StoreKYC {
  id: string;
  storeName: string;
  emailAddress: string;
  phoneNumber: string;
  submissionDate: string;
  level: number;
  status: "Successful" | "Pending" | "Rejected";
}

interface StoreKYCTableProps {
  title?: string;
  onRowSelect?: (selectedIds: string[]) => void;
  levelFilter?: number | "all";
}

const StoreKYCTable: React.FC<StoreKYCTableProps> = ({
  title = "Latest Submissions",
  onRowSelect,
  levelFilter = "all",
}) => {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedStoreLevel, setSelectedStoreLevel] = useState<1 | 2 | 3>(1);

  // Sample data based on the image
  const storeKYC: StoreKYC[] = [
    {
      id: "1",
      storeName: "Eze & Sons Ventures",
      emailAddress: "ezeandsons@icloud.com",
      phoneNumber: "07065432109B",
      submissionDate: "14-07-2025/10:00AM",
      level: 1,
      status: "Successful",
    },
    {
      id: "2",
      storeName: "Segun's Auto Parts",
      emailAddress: "segunautoparts@yandex.com",
      phoneNumber: "09098765432I",
      submissionDate: "12-07-2025/03:20PM",
      level: 1,
      status: "Successful",
    },
    {
      id: "3",
      storeName: "Bello Electronics",
      emailAddress: "belloelectronics@outlook.com",
      phoneNumber: "09023456789",
      submissionDate: "16-07-2025/02:15PM",
      level: 2,
      status: "Rejected",
    },
    {
      id: "4",
      storeName: "Amina's Spices",
      emailAddress: "aminaspices@proton.me",
      phoneNumber: "08187654321O",
      submissionDate: "15-07-2025/04:00PM",
      level: 3,
      status: "Successful",
    },
    {
      id: "5",
      storeName: "Adewale Stores",
      emailAddress: "adewalestores@gmail.com",
      phoneNumber: "07032345678",
      submissionDate: "18-07-2025/11:30AM",
      level: 2,
      status: "Successful",
    },
    {
      id: "6",
      storeName: "Fatima's Fabrics",
      emailAddress: "fatimasfabrics@gmail.com",
      phoneNumber: "08023456789O",
      submissionDate: "13-07-2025/12:55PM",
      level: 3,
      status: "Pending",
    },
    {
      id: "7",
      storeName: "Chidinma's Boutique",
      emailAddress: "chidimmaboutique@yahoo.com",
      phoneNumber: "08059876543Z",
      submissionDate: "17-07-2025/09:45AM",
      level: 2,
      status: "Pending",
    },
  ];

  // Filter data based on level
  const filteredStoreKYC =
    levelFilter === "all"
      ? storeKYC
      : storeKYC.filter((store) => store.level === levelFilter);

  // Reset selection when filter changes
  useEffect(() => {
    setSelectedRows([]);
    setSelectAll(false);
  }, [levelFilter]);

  const handleShowDetails = (store: StoreKYC) => {
    setSelectedStoreLevel(store.level as 1 | 2 | 3);
    setShowModal(true);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRows([]);
    } else {
      setSelectedRows(filteredStoreKYC.map((store) => store.id));
    }
    setSelectAll(!selectAll);

    if (onRowSelect) {
      onRowSelect(selectAll ? [] : filteredStoreKYC.map((store) => store.id));
    }
  };

  const handleRowSelect = (storeId: string) => {
    let newSelectedRows;
    if (selectedRows.includes(storeId)) {
      newSelectedRows = selectedRows.filter((id) => id !== storeId);
    } else {
      newSelectedRows = [...selectedRows, storeId];
    }

    setSelectedRows(newSelectedRows);
    setSelectAll(newSelectedRows.length === filteredStoreKYC.length);

    if (onRowSelect) {
      onRowSelect(newSelectedRows);
    }
  };

  const getStatusStyle = (status: StoreKYC["status"]) => {
    switch (status) {
      case "Successful":
        return "bg-[#0080001A] text-[#008000] border border-[#008000]";
      case "Pending":
        return "bg-[#AAAAAA1A] text-[#FFA500] border border-[#FFA500]";
      case "Rejected":
        return "bg-[#FF00001A] text-[#FF0000] border border-[#FF0000]";
      default:
        return "bg-gray-100 text-gray-600 border border-gray-300";
    }
  };

  return (
    <div className="border border-[#989898] rounded-2xl mt-5">
      <div className="bg-white p-5 rounded-t-2xl font-semibold text-[16px] border-b border-[#989898]">
        {title}
      </div>
      <div className="bg-white rounded-b-2xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#F2F2F2]">
            <tr>
              <th className="text-center p-3 font-normal text-[14px] w-12">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                  className="w-5 h-5 border border-gray-300 rounded cursor-pointer"
                />
              </th>
              <th className="text-left p-3 font-normal text-[14px]">
                Store Name
              </th>
              <th className="text-left p-3 font-normal text-[14px]">
                Email Address
              </th>
              <th className="text-left p-3 font-normal text-[14px]">
                Phone Number
              </th>
              <th className="text-left p-3 font-normal text-[14px]">
                Submission Date
              </th>
              <th className="text-center p-3 font-normal text-[14px]">Level</th>
              <th className="text-center p-3 font-normal text-[14px]">
                Status
              </th>
              <th className="text-center p-3 font-normal text-[14px]">Other</th>
            </tr>
          </thead>
          <tbody>
            {filteredStoreKYC.map((store, index) => (
              <tr
                key={store.id}
                className={`border-t border-[#E5E5E5] transition-colors ${
                  index === filteredStoreKYC.length - 1 ? "" : "border-b"
                }`}
              >
                <td className="p-4">
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(store.id)}
                    onChange={() => handleRowSelect(store.id)}
                    className="w-5 h-5 border border-gray-300 rounded cursor-pointer text-center"
                  />
                </td>
                <td className="p-4 text-[14px] text-black text-left">
                  {store.storeName}
                </td>
                <td className="p-4 text-[14px] text-black text-left">
                  {store.emailAddress}
                </td>
                <td className="p-4 text-[14px] text-black text-left">
                  {store.phoneNumber}
                </td>
                <td className="p-4 text-[14px] text-black text-left">
                  {store.submissionDate}
                </td>
                <td className="p-4 text-[14px] text-black text-center">
                  {store.level}
                </td>
                <td className="p-4 text-center">
                  <span
                    className={`px-3 py-1 rounded-md text-[12px] font-medium ${getStatusStyle(
                      store.status
                    )}`}
                  >
                    {store.status}
                  </span>
                </td>
                <td className="p-4 text-center">
                  <button
                    onClick={() => handleShowDetails(store)}
                    className="bg-[#E53E3E] text-white px-6 py-2.5 rounded-lg text-[15px] font-medium hover:bg-[#D32F2F] transition-colors cursor-pointer"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AddStoreModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onProceedToSavedAddress={() => {
          // Handle proceed to saved address
        }}
        initialTab={
          `Level ${selectedStoreLevel}` as "Level 1" | "Level 2" | "Level 3"
        }
      />
    </div>
  );
};

export default StoreKYCTable;
