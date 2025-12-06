import React, { useEffect, useMemo, useState } from "react";
import PromotionsModal from "../Modals/promotionsModal";

interface ApiPromotion {
  id: number;
  product_name: string | null;
  product_image: string | null;
  store_name: string;
  seller_name: string;
  amount: number;
  duration: number;
  status: string;
  reach: number;
  impressions: number;
  clicks: number;
  cpc: string;
  created_at: string;
  formatted_date: string;
  status_color: string;
}

interface Promotion {
  id: string;
  storeName: string;
  sellerName: string;
  product: string;
  productImage: string | null;
  amount: string;
  duration: string;
  date: string;
  status: string;
  statusColor: string;
  reach: number;
  impressions: number;
  clicks: number;
  cpc: string;
}

interface PromotionsTableProps {
  title?: string;
  onRowSelect?: (selectedIds: string[]) => void;
  activeTab: "All" | "running" | "paused" | "scheduled" | "completed";
  /** debounced */
  searchTerm?: string;
  promotions?: ApiPromotion[];
  pagination?: any;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  isLoading?: boolean;
  error?: any;
  onStatusUpdate?: (promotionId: number | string, statusData: any) => void;
  onExtendPromotion?: (promotionId: number | string, extendData: any) => void;
}

const PromotionsTable: React.FC<PromotionsTableProps> = ({
  title = "Latest Submissions",
  onRowSelect,
  activeTab,
  searchTerm = "",
  promotions = [],
  pagination,
  currentPage = 1,
  onPageChange,
  isLoading = false,
  error,
  onStatusUpdate,
  onExtendPromotion,
}) => {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);

  // Normalize API data to UI format
  const normalizedPromotions: Promotion[] = useMemo(() => {
    return promotions.map((promo: ApiPromotion) => ({
      id: promo.id.toString(),
      storeName: promo.store_name,
      sellerName: promo.seller_name,
      product: promo.product_name || "No Product",
      productImage: promo.product_image,
      amount: `₦${promo.amount.toLocaleString()}`,
      duration: `${promo.duration} Days`,
      date: promo.formatted_date,
      status: promo.status,
      statusColor: promo.status_color,
      reach: promo.reach,
      impressions: promo.impressions,
      clicks: promo.clicks,
      cpc: promo.cpc,
    }));
  }, [promotions]);


  const handleModalOpen = (promotion: Promotion) => {
    setSelectedPromotion(promotion);
    setIsModalOpen(true);
  };

  // Filter promotions based on activeTab and searchTerm
  const visiblePromotions = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();

    const statusOk = (promo: Promotion) =>
      activeTab === "All" ? true : promo.status === activeTab;

    const searchOk = (promo: Promotion) => {
      if (!q) return true;
      return [promo.storeName, promo.sellerName, promo.product, promo.amount, promo.status]
        .join(" ")
        .toLowerCase()
        .includes(q);
    };

    return normalizedPromotions.filter((promo) => statusOk(promo) && searchOk(promo));
  }, [normalizedPromotions, activeTab, searchTerm]);

  // Select All should affect only visible rows
  const handleSelectAll = () => {
    const visibleIds = visiblePromotions.map((p) => p.id);
    if (selectAll) {
      // unselect only visible
      const remaining = selectedRows.filter((id) => !visibleIds.includes(id));
      setSelectedRows(remaining);
      setSelectAll(false);
      onRowSelect?.(remaining);
    } else {
      // add all visible to selection (keep any previously selected)
      const union = Array.from(new Set([...selectedRows, ...visibleIds]));
      setSelectedRows(union);
      setSelectAll(true);
      onRowSelect?.(union);
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

  // Keep selectAll checkbox in sync with the current filtered view
  useEffect(() => {
    const visibleIds = new Set(visiblePromotions.map((p) => p.id));
    const visibleSelected = selectedRows.filter((id) => visibleIds.has(id));
    setSelectAll(
      visiblePromotions.length > 0 &&
        visibleSelected.length === visiblePromotions.length
    );
  }, [visiblePromotions, selectedRows]);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "running":
        return "bg-[#0080001A] text-[#008000] border border-[#008000]";
      case "paused":
        return "bg-[#FFA5001A] text-[#FFA500] border border-[#FFA500]";
      case "scheduled":
        return "bg-[#0066CC1A] text-[#0066CC] border border-[#0066CC]";
      case "completed":
        return "bg-[#0080001A] text-[#008000] border border-[#008000]";
      default:
        return "bg-gray-100 text-gray-600 border border-gray-300";
    }
  };

  return (
    <div className="border border-[#989898] rounded-2xl mt-5">
      <div className="bg-white p-3 sm:p-4 md:p-5 rounded-t-2xl font-semibold text-sm sm:text-base md:text-[16px] border-b border-[#989898]">
        {title}
      </div>
      <div className="bg-white rounded-b-2xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E53E3E]"></div>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">Failed to load promotions.</div>
        ) : (
          <>
            {/* Desktop/Tablet Table View - with horizontal scroll */}
            <div className="hidden sm:block overflow-x-auto" style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'thin' }}>
              <div className="inline-block min-w-full align-middle">
                <table className="w-full bg-white rounded-lg shadow-sm min-w-[900px]">
                  <thead className="bg-[#F2F2F2] sticky top-0 z-10">
                    <tr>
                      <th className="text-center p-2 md:p-3 font-normal text-xs md:text-[14px] w-12 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectAll && visiblePromotions.length > 0}
                          onChange={handleSelectAll}
                          className="w-4 h-4 md:w-5 md:h-5 border border-gray-300 rounded cursor-pointer"
                        />
                      </th>
                      <th className="text-left p-2 md:p-3 font-normal text-xs md:text-[14px] whitespace-nowrap">
                        Store Name
                      </th>
                      <th className="text-center p-2 md:p-3 font-normal text-xs md:text-[14px] whitespace-nowrap">
                        Product
                      </th>
                      <th className="text-center p-2 md:p-3 font-normal text-xs md:text-[14px] whitespace-nowrap">
                        Amount
                      </th>
                      <th className="text-center p-2 md:p-3 font-normal text-xs md:text-[14px] whitespace-nowrap">
                        Duration
                      </th>
                      <th className="text-center p-2 md:p-3 font-normal text-xs md:text-[14px] whitespace-nowrap">Date</th>
                      <th className="text-center p-2 md:p-3 font-normal text-xs md:text-[14px] whitespace-nowrap">
                        Status
                      </th>
                      <th className="text-center p-2 md:p-3 font-normal text-xs md:text-[14px] whitespace-nowrap">Other</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visiblePromotions.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-6 text-center text-gray-500">
                          No promotions found.
                        </td>
                      </tr>
                    ) : (
                      visiblePromotions.map((promotion, index) => (
                        <tr
                          key={promotion.id}
                          className={`border-t border-[#E5E5E5] transition-colors hover:bg-gray-50 ${
                            index === visiblePromotions.length - 1 ? "" : "border-b"
                          }`}
                        >
                          <td className="p-2 md:p-4 text-center whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={selectedRows.includes(promotion.id)}
                              onChange={() => handleRowSelect(promotion.id)}
                              className="w-4 h-4 md:w-5 md:h-5 border border-gray-300 rounded cursor-pointer mx-auto"
                            />
                          </td>
                          <td className="p-2 md:p-4 text-xs md:text-[14px] text-black text-left whitespace-nowrap">
                            <span className="truncate block max-w-[150px]">{promotion.storeName}</span>
                          </td>
                          <td className="p-2 md:p-4 text-xs md:text-[14px] text-black text-left whitespace-nowrap">
                            <div className="flex items-center gap-2 md:gap-3">
                              <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                                <img
                                  src={promotion.productImage || "/assets/layout/itable.png"}
                                  alt={promotion.product}
                                  className="w-full h-full object-cover rounded-lg"
                                  onError={(e) => {
                                    e.currentTarget.style.display = "none";
                                    e.currentTarget.parentElement!.classList.add(
                                      "bg-gray-400"
                                    );
                                  }}
                                />
                              </div>
                              <span className="text-left truncate max-w-[120px] md:max-w-none">{promotion.product}</span>
                            </div>
                          </td>
                          <td className="p-2 md:p-4 text-xs md:text-[14px] text-black font-semibold text-center whitespace-nowrap">
                            {promotion.amount}
                          </td>
                          <td className="p-2 md:p-4 text-xs md:text-[14px] text-black text-center whitespace-nowrap">
                            {promotion.duration}
                          </td>
                          <td className="p-2 md:p-4 text-xs md:text-[14px] font-semibold text-black text-center whitespace-nowrap">
                            {promotion.date}
                          </td>
                          <td className="p-2 md:p-4 text-center whitespace-nowrap">
                            <span
                              className={`px-2 md:px-3 py-1 rounded-md text-[10px] md:text-[12px] font-medium ${
                                promotion.status === "running"
                                  ? "bg-green-100 text-green-800"
                                  : promotion.status === "paused"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : promotion.status === "scheduled"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {promotion.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="p-2 md:p-4 text-center whitespace-nowrap">
                            <button
                              onClick={() => handleModalOpen(promotion)}
                              className="bg-[#E53E3E] text-white px-3 md:px-6 py-1.5 md:py-2.5 rounded-lg text-xs md:text-[15px] font-medium hover:bg-[#D32F2F] transition-colors cursor-pointer whitespace-nowrap"
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
            </div>

            {/* Mobile Card View */}
            <div className="sm:hidden">
              {visiblePromotions.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  No promotions found.
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {visiblePromotions.map((promotion) => (
                    <div
                      key={promotion.id}
                      className="p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <input
                            type="checkbox"
                            checked={selectedRows.includes(promotion.id)}
                            onChange={() => handleRowSelect(promotion.id)}
                            className="w-5 h-5 mt-1 flex-shrink-0"
                          />
                          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                            <img
                              src={promotion.productImage || "/assets/layout/itable.png"}
                              alt={promotion.product}
                              className="w-full h-full object-cover rounded-lg"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                                e.currentTarget.parentElement!.classList.add(
                                  "bg-gray-400"
                                );
                              }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 text-sm truncate">{promotion.product}</h3>
                            <p className="text-xs text-gray-500 truncate">{promotion.storeName}</p>
                          </div>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-md text-[10px] font-medium flex-shrink-0 ml-2 ${
                            promotion.status === "running"
                              ? "bg-green-100 text-green-800"
                              : promotion.status === "paused"
                              ? "bg-yellow-100 text-yellow-800"
                              : promotion.status === "scheduled"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {promotion.status.toUpperCase()}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                        <div>
                          <span className="text-gray-500 text-xs">Amount:</span>
                          <p className="text-gray-900 font-semibold">{promotion.amount}</p>
                        </div>
                        <div>
                          <span className="text-gray-500 text-xs">Duration:</span>
                          <p className="text-gray-900 font-medium">{promotion.duration}</p>
                        </div>
                        <div className="col-span-2">
                          <span className="text-gray-500 text-xs">Date:</span>
                          <p className="text-gray-900 font-semibold">{promotion.date}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleModalOpen(promotion)}
                        className="w-full bg-[#E53E3E] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#D32F2F] transition-colors"
                      >
                        View Details
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.last_page > 1 && (
        <div className="bg-white border-t border-gray-200 px-3 sm:px-4 md:px-6 py-3 md:py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs sm:text-sm text-gray-700 text-center sm:text-left">
              Showing {((currentPage - 1) * (pagination.per_page || 20)) + 1} to {Math.min(currentPage * (pagination.per_page || 20), pagination.total)} of {pagination.total} results
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2 flex-wrap justify-center">
              <button
                onClick={() => onPageChange && onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm">
                Page {currentPage} of {pagination.last_page}
              </span>
              <button
                onClick={() => onPageChange && onPageChange(currentPage + 1)}
                disabled={currentPage === pagination.last_page}
                className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      <PromotionsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        promotion={selectedPromotion}
        onStatusUpdate={onStatusUpdate}
        onExtendPromotion={onExtendPromotion}
      />
    </div>
  );
};

export default PromotionsTable;
