import React, { useState, useEffect, useMemo } from "react";
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
  statusFilter?: "All" | "Pending" | "Successful" | "Rejected";
  /** debounced string from parent */
  searchTerm?: string;
}

const StoreKYCTable: React.FC<StoreKYCTableProps> = ({
  title = "Latest Submissions",
  onRowSelect,
  levelFilter = "all",
  statusFilter = "All",
  searchTerm = "",
}) => {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedStoreLevel, setSelectedStoreLevel] = useState<1 | 2 | 3>(1);

  // Base data
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

  // Visible rows = level + status (tab) + search filters
  const visibleRows = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    const normalizeStatus = (tab: string) =>
      tab === "Failed" ? "Rejected" : tab;

    return storeKYC.filter((row) => {
      const levelOK = levelFilter === "all" ? true : row.level === levelFilter;
      const statusOK =
        statusFilter === "All"
          ? true
          : row.status ===
            (normalizeStatus(statusFilter) as StoreKYC["status"]);

      if (!q) return levelOK && statusOK;

      const haystack = [
        row.storeName,
        row.emailAddress,
        row.phoneNumber,
        row.submissionDate,
        `level ${row.level}`,
        row.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return levelOK && statusOK && haystack.includes(q);
    });
  }, [storeKYC, levelFilter, statusFilter, searchTerm]);

  // Keep the "select all" checkbox in sync with what's visible
  useEffect(() => {
    const visIds = new Set(visibleRows.map((r) => r.id));
    const visibleSelected = selectedRows.filter((id) => visIds.has(id));
    setSelectAll(
      visibleRows.length > 0 && visibleSelected.length === visibleRows.length
    );
  }, [visibleRows, selectedRows]);

  const handleShowDetails = (store: StoreKYC) => {
    setSelectedStoreLevel(store.level as 1 | 2 | 3);
    setShowModal(true);
  };

  // Select/Deselect all visible rows (keeps selections from other views)
  const handleSelectAll = () => {
    const visIds = visibleRows.map((r) => r.id);
    if (selectAll) {
      const remaining = selectedRows.filter((id) => !visIds.includes(id));
      setSelectedRows(remaining);
      onRowSelect?.(remaining);
      setSelectAll(false);
    } else {
      const union = Array.from(new Set([...selectedRows, ...visIds]));
      setSelectedRows(union);
      onRowSelect?.(union);
      setSelectAll(true);
    }
  };

  const handleRowSelect = (id: string) => {
    setSelectedRows((prev) => {
      const next = prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id];
      onRowSelect?.(next);
      return next;
    });
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
                  checked={selectAll && visibleRows.length > 0}
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
            {visibleRows.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-6 text-center text-gray-500">
                  No results found.
                </td>
              </tr>
            ) : (
              visibleRows.map((store, index) => (
                <tr
                  key={store.id}
                  className={`border-t border-[#E5E5E5] transition-colors ${
                    index === visibleRows.length - 1 ? "" : "border-b"
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
              ))
            )}
          </tbody>
        </table>
      </div>

      <AddStoreModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onProceedToSavedAddress={() => {}}
        initialTab={
          `Level ${selectedStoreLevel}` as "Level 1" | "Level 2" | "Level 3"
        }
      />
    </div>
  );
};

export default StoreKYCTable;
