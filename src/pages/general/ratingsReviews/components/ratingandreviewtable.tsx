import React, { useEffect, useMemo, useState } from "react";
import ProductRatingModal from "./productrating";

type RowType = "Store" | "Product";

interface RatingReview {
  id: string;
  type: RowType;           // <-- added: used by tab filter
  storeName: string;
  noOfReviews: number;
  averageRating: number;
  lastRating: string;
  other: string;
}

interface RatingAndReviewTableProps {
  title?: string;
  onRowSelect?: (selectedIds: string[]) => void;
  tabFilter?: "All" | "Store" | "Product";
  searchQuery?: string; // debounced text
}

const RatingAndReviewTable: React.FC<RatingAndReviewTableProps> = ({
  onRowSelect,
  tabFilter = "All",
  searchQuery = "",
}) => {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showProductRatingModal, setShowProductRatingModal] = useState(false);

  // Sample data — assign types for filtering
  const ratingReviews: RatingReview[] = [
    { id: "1", type: "Store",   storeName: "Benny's Bakery",    noOfReviews: 56,  averageRating: 5, lastRating: "18-07-2025/06:22AM", other: "View Reviews" },
    { id: "2", type: "Product", storeName: "Gadget Galaxy",     noOfReviews: 86,  averageRating: 3, lastRating: "05-06-2025/09:00AM", other: "View Reviews" },
    { id: "3", type: "Store",   storeName: "The Corner Shop",   noOfReviews: 340, averageRating: 5, lastRating: "20-07-2025/05:45PM", other: "View Reviews" },
    { id: "4", type: "Product", storeName: "Sasha Stores",       noOfReviews: 25,  averageRating: 4, lastRating: "20-07-2025/07:58PM", other: "View Reviews" },
    { id: "5", type: "Store",   storeName: "Mia's Boutique",     noOfReviews: 15,  averageRating: 4, lastRating: "15-07-2025/11:30AM", other: "View Reviews" },
    { id: "6", type: "Store",   storeName: "J.P. Haberdashery",  noOfReviews: 9,   averageRating: 4, lastRating: "19-07-2025/10:11PM", other: "View Reviews" },
    { id: "7", type: "Store",   storeName: "Leo's Emporium",     noOfReviews: 112, averageRating: 5, lastRating: "19-07-2025/02:15PM", other: "View Reviews" },
  ];

  // Filtered rows based on tab + search (case-insensitive)
  const filteredRows = useMemo(() => {
    const q = (searchQuery || "").toLowerCase();
    return ratingReviews.filter((row) => {
      const matchTab = tabFilter === "All" ? true : row.type === tabFilter;
      const matchSearch =
        !q ||
        row.storeName.toLowerCase().includes(q) ||
        String(row.noOfReviews).includes(q) ||
        String(row.averageRating).includes(q) ||
        row.lastRating.toLowerCase().includes(q);
      return matchTab && matchSearch;
    });
  }, [tabFilter, searchQuery]);

  // When filters change, clear selection so it stays consistent
  useEffect(() => {
    setSelectedRows([]);
    setSelectAll(false);
    onRowSelect?.([]);
  }, [tabFilter, searchQuery]);

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center justify-center gap-1">
        <span className=" text-black font-semibold">{rating}</span>
        <span className="text-[#E53E3E] ">★</span>
      </div>
    );
  };

  const handleViewReviews = () => {
    setShowProductRatingModal(true);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRows([]);
      onRowSelect?.([]);
    } else {
      const allIds = filteredRows.map((r) => r.id);
      setSelectedRows(allIds);
      onRowSelect?.(allIds);
    }
    setSelectAll(!selectAll);
  };

  const handleRowSelect = (ratingReviewId: string) => {
    let newSelectedRows: string[];
    if (selectedRows.includes(ratingReviewId)) {
      newSelectedRows = selectedRows.filter((id) => id !== ratingReviewId);
    } else {
      newSelectedRows = [...selectedRows, ratingReviewId];
    }
    setSelectedRows(newSelectedRows);
    setSelectAll(newSelectedRows.length === filteredRows.length);
    onRowSelect?.(newSelectedRows);
  };

  return (
    <div className="border border-[#989898] rounded-2xl w-[1160px] ml-1 mt-4 mb-4">
      <div className="bg-white p-5 rounded-t-2xl font-semibold text-[16px] border-b border-[#989898]">
        Reviews & Ratings
      </div>
      <div className="bg-white rounded-b-2xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#F2F2F2]">
            <tr>
              <th className="text-center p-3 font-normal w-12">
                <input
                  type="checkbox"
                  checked={selectAll && filteredRows.length > 0}
                  onChange={handleSelectAll}
                  className="w-5 h-5 border border-gray-300 rounded cursor-pointer"
                />
              </th>
              <th className="text-left p-3 font-normal">Store / Product</th>
              <th className="text-left p-3 font-normal">No of reviews</th>
              <th className="text-center p-3 font-normal">Average rating</th>
              <th className="text-center p-3 font-normal">Last Rating</th>
              <th className="text-center p-3 font-normal">Other</th>
            </tr>
          </thead>

          <tbody>
            {filteredRows.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-sm text-gray-500">
                  No reviews match your filter.
                </td>
              </tr>
            ) : (
              filteredRows.map((ratingReview, index) => (
                <tr
                  key={ratingReview.id}
                  className={`border-t border-[#E5E5E5] transition-colors ${
                    index === filteredRows.length - 1 ? "" : "border-b"
                  }`}
                >
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(ratingReview.id)}
                      onChange={() => handleRowSelect(ratingReview.id)}
                      className="w-5 h-5 border border-gray-300 rounded cursor-pointer text-center"
                    />
                  </td>
                  <td className="p-4 text-black text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 border border-gray-200">
                        {ratingReview.type}
                      </span>
                      <span>{ratingReview.storeName}</span>
                    </div>
                  </td>
                  <td className="p-4 text-black text-left">
                    {ratingReview.noOfReviews}
                  </td>
                  <td className="p-4 text-center">
                    {renderStars(ratingReview.averageRating)}
                  </td>
                  <td className="p-4 text-black text-center">
                    {ratingReview.lastRating}
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={handleViewReviews}
                      className="px-6 py-2 rounded-lg font-medium transition-colors cursor-pointer bg-[#E53E3E] text-white hover:bg-[#D32F2F]"
                    >
                      View Reviews
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Product Rating Modal */}
      <ProductRatingModal
        isOpen={showProductRatingModal}
        onClose={() => setShowProductRatingModal(false)}
      />
    </div>
  );
};

export default RatingAndReviewTable;
