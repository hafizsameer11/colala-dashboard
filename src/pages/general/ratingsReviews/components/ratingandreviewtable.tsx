import React, { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getProductReviews, getStoreReviews, deleteProductReview, deleteStoreReview } from "../../../../utils/queries/users";
import ProductRatingModal from "./productrating";
import StoreRatingModal from "./storerating";

type RowType = "Store" | "Product";

interface RatingReview {
  id: string;
  type: RowType;       
  storeName: string;
  noOfReviews: number;
  averageRating: number;
  lastRating: string;
  other: string;
  user?: {
    id: number;
    full_name: string;
    email: string;
  };
  store?: {
    id: number;
    store_name: string;
  };
  comment?: string;
  images?: string[];
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
  const [showStoreRatingModal, setShowStoreRatingModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState<RatingReview | null>(null);

  // Fetch product reviews
  const { data: productReviewsData, isLoading: productLoading, error: productError } = useQuery({
    queryKey: ['productReviews', searchQuery],
    queryFn: () => getProductReviews(1, searchQuery),
    enabled: tabFilter === "All" || tabFilter === "Product",
  });

  // Fetch store reviews
  const { data: storeReviewsData, isLoading: storeLoading, error: storeError } = useQuery({
    queryKey: ['storeReviews', searchQuery],
    queryFn: () => getStoreReviews(1, searchQuery),
    enabled: tabFilter === "All" || tabFilter === "Store",
  });

  // Debug logging
  console.log('Product Reviews Debug:', productReviewsData);
  console.log('Store Reviews Debug:', storeReviewsData);

  // Transform API data to RatingReview format
  const ratingReviews: RatingReview[] = useMemo(() => {
    const productReviews = productReviewsData?.data?.reviews?.map((review: {
      id: number;
      rating: number;
      comment: string;
      images: string[];
      user: { id: number; full_name: string; email: string };
      store: { id: number; store_name: string };
      product?: { id: number; name: string };
      created_at: string;
      formatted_date: string;
    }) => ({
      id: `product-${review.id}`,
      type: "Product" as RowType,
      storeName: review.product?.name || "Unknown Product",
      noOfReviews: 1, // Each row represents one review
      averageRating: review.rating,
      lastRating: review.formatted_date || review.created_at,
      other: "View Reviews",
      user: review.user,
      store: review.store,
      comment: review.comment,
      images: review.images || [],
    })) || [];

    const storeReviews = storeReviewsData?.data?.reviews?.map((review: {
      id: number;
      rating: number;
      comment: string;
      images: string[];
      user: { id: number; full_name: string; email: string };
      store: { id: number; store_name: string };
      created_at: string;
      formatted_date: string;
    }) => ({
      id: `store-${review.id}`,
      type: "Store" as RowType,
      storeName: review.store?.store_name || "Unknown Store",
      noOfReviews: 1, // Each row represents one review
      averageRating: review.rating,
      lastRating: review.formatted_date || review.created_at,
      other: "View Reviews",
      user: review.user,
      store: review.store,
      comment: review.comment,
      images: review.images || [],
    })) || [];

    return [...productReviews, ...storeReviews];
  }, [productReviewsData, storeReviewsData]);

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
  }, [tabFilter, searchQuery, ratingReviews]);

  // When filters change, clear selection so it stays consistent
  useEffect(() => {
    setSelectedRows([]);
    setSelectAll(false);
    onRowSelect?.([]);
  }, [tabFilter, searchQuery, onRowSelect]);

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center justify-center gap-1">
        <span className=" text-black font-semibold">{rating}</span>
        <span className="text-[#E53E3E] ">★</span>
      </div>
    );
  };

  const handleViewReviews = (review: RatingReview) => {
    setSelectedReview(review);
    if (review.type === "Store") {
      setShowStoreRatingModal(true);
    } else {
      setShowProductRatingModal(true);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        if (reviewId.startsWith('product-')) {
          const id = reviewId.replace('product-', '');
          await deleteProductReview(id);
        } else if (reviewId.startsWith('store-')) {
          const id = reviewId.replace('store-', '');
          await deleteStoreReview(id);
        }
        // Refresh the data by invalidating queries
        // Note: In a real app, you'd use queryClient.invalidateQueries here
        window.location.reload(); // Temporary solution
      } catch (error) {
        console.error('Error deleting review:', error);
        alert('Failed to delete review. Please try again.');
      }
    }
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
            {productLoading || storeLoading ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-sm text-gray-500">
                  Loading reviews...
                </td>
              </tr>
            ) : productError || storeError ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-sm text-red-500">
                  Error loading reviews. Please try again.
                </td>
              </tr>
            ) : filteredRows.length === 0 ? (
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
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => handleViewReviews(ratingReview)}
                        className="px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer bg-[#E53E3E] text-white hover:bg-[#D32F2F] text-sm"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleDeleteReview(ratingReview.id)}
                        className="px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer bg-red-600 text-white hover:bg-red-700 text-sm"
                      >
                        Delete
                      </button>
                    </div>
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
        reviewData={selectedReview}
      />

      {/* Store Rating Modal */}
      <StoreRatingModal
        isOpen={showStoreRatingModal}
        onClose={() => setShowStoreRatingModal(false)}
        reviewData={selectedReview}
      />
    </div>
  );
};

export default RatingAndReviewTable;
