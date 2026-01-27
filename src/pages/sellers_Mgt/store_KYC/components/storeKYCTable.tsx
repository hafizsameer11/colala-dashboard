import React, { useState, useEffect, useMemo } from "react";
import AddStoreModal from "./addStoreModel";
import ViewStoreModal from "./viewStoreModal";

interface ApiStore {
  id: number;
  store_name: string;
  store_email: string;
  store_phone: string;
  profile_image: string | null;
  banner_image: string | null;
  owner_name: string | null;
  owner_email: string | null;
  owner_phone: string | null;
  status: "pending" | "approved" | "rejected";
  level: number;
  submission_date: string;
  formatted_date: string;
}

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
  stores?: ApiStore[];
  statistics?: any;
  pagination?: any;
  isLoading?: boolean;
  error?: any;
  currentPage?: number;
  onPageChange?: (page: number) => void;
}

const StoreKYCTable: React.FC<StoreKYCTableProps> = ({
  title = "Latest Submissions",
  onRowSelect,
  levelFilter = "all",
  statusFilter = "All",
  searchTerm = "",
  stores = [],
  statistics = {},
  pagination = {},
  isLoading = false,
  error = null,
  currentPage = 1,
  onPageChange,
}) => {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedStoreId, setSelectedStoreId] = useState<number | string | null>(null);
  const [selectedStoreLevel, setSelectedStoreLevel] = useState<1 | 2 | 3>(1);

  // Transform API data to UI format
  const normalizedStores = useMemo(() => {
    console.log('StoreKYCTable Debug - Raw stores data:', stores);
    
    // Ensure stores is an array before mapping
    if (!stores || !Array.isArray(stores)) {
      console.log('StoreKYCTable Debug - Stores is not an array:', stores);
      return [];
    }
    
    const transformed = stores.map((store: ApiStore): StoreKYC => {
      // Handle the actual API response structure
      const storeName = store.store_name || "N/A";
      const emailAddress = store.store_email || "N/A"; // Use store_email instead of owner_email
      const phoneNumber = store.store_phone || "N/A"; // Use store_phone from API
      const submissionDate = store.formatted_date || store.submission_date || new Date().toLocaleDateString();
      const level = store.level || 1; // Use level from API
      
      // Map status from API response
      const status = store.status === "pending" ? "Pending" : 
                    store.status === "approved" ? "Successful" : 
                    store.status === "rejected" ? "Rejected" : "Pending";
      
      return {
        id: store.id.toString(),
        storeName,
        emailAddress,
        phoneNumber,
        submissionDate,
        level,
        status
      };
    });
    
    console.log('StoreKYCTable Debug - Transformed stores:', transformed);
    return transformed;
  }, [stores]);

  // Use real API data
  const storeKYC: StoreKYC[] = normalizedStores;

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
    setSelectedStoreId(parseInt(store.id));
    setShowViewModal(true);
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
            {isLoading ? (
              <tr>
                <td colSpan={8} className="p-6 text-center text-gray-500">
                  Loading stores...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={8} className="p-6 text-center text-red-500">
                  Error loading stores. Please try again.
                </td>
              </tr>
            ) : visibleRows.length === 0 ? (
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

      {/* Pagination */}
      {pagination && pagination.last_page > 1 && (
        <div className="bg-white border-t border-[#E5E5E5] px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {((currentPage - 1) * (pagination.per_page || 20)) + 1} to {Math.min(currentPage * (pagination.per_page || 20), pagination.total || 0)} of {pagination.total || 0} results
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Previous Button */}
              <button
                onClick={() => onPageChange?.(currentPage - 1)}
                disabled={currentPage <= 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              {/* Page Numbers */}
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, pagination.last_page || 1) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min((pagination.last_page || 1) - 4, currentPage - 2)) + i;
                  if (pageNum > (pagination.last_page || 1)) return null;
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => onPageChange?.(pageNum)}
                      className={`px-3 py-2 text-sm font-medium rounded-lg ${
                        currentPage === pageNum
                          ? "bg-[#E53E3E] text-white"
                          : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              {/* Next Button */}
              <button
                onClick={() => onPageChange?.(currentPage + 1)}
                disabled={currentPage >= (pagination.last_page || 1)}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      <AddStoreModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onProceedToSavedAddress={() => {}}
        initialTab={
          `Level ${selectedStoreLevel}` as "Level 1" | "Level 2" | "Level 3"
        }
      />
      
      <ViewStoreModal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        storeId={selectedStoreId}
      />
    </div>
  );
};

export default StoreKYCTable;
