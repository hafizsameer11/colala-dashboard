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
    <div className="border border-[#989898] rounded-2xl mt-5 overflow-x-auto">
      <div className="bg-white p-5 rounded-t-2xl font-semibold text-[16px] border-b border-[#989898]">
        {title}
      </div>
      <div className="bg-white rounded-b-2xl overflow-hidden">
        <table className="w-full min-w-[800px]">
          <thead className="bg-[#F2F2F2]">
            <tr>
              <th className="text-center p-3 font-normal text-[14px] w-12">
                <input
                  type="checkbox"
                  checked={selectAll && visiblePromotions.length > 0}
                  onChange={handleSelectAll}
                  className="w-5 h-5 border border-gray-300 rounded cursor-pointer"
                />
              </th>
              <th className="text-left p-3 font-normal text-[14px]">
                Store Name
              </th>
              <th className="text-center p-3 font-normal text-[14px]">
                Product
              </th>
              <th className="text-center p-3 font-normal text-[14px]">
                Amount
              </th>
              <th className="text-center p-3 font-normal text-[14px]">
                Duration
              </th>
              <th className="text-center p-3 font-normal text-[14px]">Date</th>
              <th className="text-center p-3 font-normal text-[14px]">
                Status
              </th>
              <th className="text-center p-3 font-normal text-[14px]">Other</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={8} className="p-6 text-center">
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E53E3E]"></div>
                  </div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={8} className="p-6 text-center text-red-500">
                  <p className="text-sm">Error loading promotions</p>
                </td>
              </tr>
            ) : visiblePromotions.length === 0 ? (
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
                  <td className="p-4 text-center">
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(promotion.id)}
                      onChange={() => handleRowSelect(promotion.id)}
                      className="w-5 h-5 border border-gray-300 rounded cursor-pointer mx-auto"
                    />
                  </td>
                  <td className="p-4 text-[14px] text-black text-left">
                    {promotion.storeName}
                  </td>
                  <td className="p-4 text-[14px] text-black text-left">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
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
                      <span className="text-left">{promotion.product}</span>
                    </div>
                  </td>
                  <td className="p-4 text-[14px] text-black font-semibold text-center">
                    {promotion.amount}
                  </td>
                  <td className="p-4 text-[14px] text-black text-center">
                    {promotion.duration}
                  </td>
                  <td className="p-4 text-[14px] font-semibold text-black text-center">
                    {promotion.date}
                  </td>
                  <td className="p-4 text-center">
                    <span
                      className={`px-3 py-1 rounded-md text-[12px] font-medium ${
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
                  <td className="p-4 text-center">
                    <button
                      onClick={() => handleModalOpen(promotion)}
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
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            onClick={() => onPageChange && onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="px-4 py-2">
            Page {currentPage} of {pagination.last_page}
          </span>
          <button
            onClick={() => onPageChange && onPageChange(currentPage + 1)}
            disabled={currentPage === pagination.last_page}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
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
