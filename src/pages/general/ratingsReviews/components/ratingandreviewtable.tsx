import React, { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProductReviews, getStoreReviews, deleteProductReview, deleteStoreReview } from "../../../../utils/queries/users";
import { useToast } from "../../../../contexts/ToastContext";
import ProductRatingModal from "./productrating";
import StoreRatingModal from "./storerating";
import images from "../../../../constants/images";
import { filterByPeriod } from "../../../../utils/periodFilter";

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
  product?: {
    id: number;
    name: string;
  };
  comment?: string;
  images?: string[];
}

interface RatingAndReviewTableProps {
  title?: string;
  onRowSelect?: (selectedIds: string[]) => void;
  tabFilter?: "All" | "Store" | "Product";
  searchQuery?: string; // debounced text
  selectedPeriod?: string; // date period filter
}

const RatingAndReviewTable: React.FC<RatingAndReviewTableProps> = ({
  onRowSelect,
  tabFilter = "All",
  searchQuery = "",
  selectedPeriod = "All time",
}) => {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showProductRatingModal, setShowProductRatingModal] = useState(false);
  const [showStoreRatingModal, setShowStoreRatingModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState<RatingReview | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  // Fetch product reviews
  const { data: productReviewsData, isLoading: productLoading, error: productError } = useQuery({
    queryKey: ['productReviews', currentPage, searchQuery, tabFilter],
    queryFn: () => getProductReviews(currentPage, searchQuery),
    enabled: tabFilter === "All" || tabFilter === "Product",
  });

  // Fetch store reviews
  const { data: storeReviewsData, isLoading: storeLoading, error: storeError } = useQuery({
    queryKey: ['storeReviews', currentPage, searchQuery, tabFilter],
    queryFn: () => getStoreReviews(currentPage, searchQuery),
    enabled: tabFilter === "All" || tabFilter === "Store",
  });

  // Delete product review mutation
  const deleteProductReviewMutation = useMutation({
    mutationFn: (reviewId: number | string) => deleteProductReview(reviewId),
    onSuccess: () => {
      showToast('Product review deleted successfully', 'success');
      setShowDeleteConfirm(false);
      setReviewToDelete(null);
      queryClient.invalidateQueries({ queryKey: ['productReviews'] });
      queryClient.invalidateQueries({ queryKey: ['ratingsReviewsSummary'] });
    },
    onError: (error: any) => {
      console.error('Delete product review error:', error);
      const errorMessage = error?.data?.message || error?.message || 'Failed to delete product review';
      showToast(errorMessage, 'error');
      setShowDeleteConfirm(false);
      setReviewToDelete(null);
    },
  });

  // Delete store review mutation
  const deleteStoreReviewMutation = useMutation({
    mutationFn: (reviewId: number | string) => deleteStoreReview(reviewId),
    onSuccess: () => {
      showToast('Store review deleted successfully', 'success');
      setShowDeleteConfirm(false);
      setReviewToDelete(null);
      queryClient.invalidateQueries({ queryKey: ['storeReviews'] });
      queryClient.invalidateQueries({ queryKey: ['ratingsReviewsSummary'] });
    },
    onError: (error: any) => {
      console.error('Delete store review error:', error);
      const errorMessage = error?.data?.message || error?.message || 'Failed to delete store review';
      showToast(errorMessage, 'error');
      setShowDeleteConfirm(false);
      setReviewToDelete(null);
    },
  });

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [tabFilter, searchQuery]);

  // Debug logging
  console.log('Product Reviews Debug:', productReviewsData);
  console.log('Store Reviews Debug:', storeReviewsData);

  // Transform API data to RatingReview format
  const allRatingReviews: RatingReview[] = useMemo(() => {
    const productReviews = productReviewsData?.data?.reviews?.map((review: any) => ({
      id: `product-${review.id}`,
      type: "Product" as RowType,
      storeName: review.product?.name || "Unknown Product",
      noOfReviews: 1, // Each row represents one review
      averageRating: review.rating,
      lastRating: review.formatted_date || review.created_at,
      other: "View Reviews",
      user: review.user,
      store: review.store,
      product: review.product,
      comment: review.comment,
      images: review.images || [],
    })) || [];

    const storeReviews = storeReviewsData?.data?.reviews?.map((review: any) => ({
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
  
  // Filter by date period
  const ratingReviews = useMemo(() => {
    if (selectedPeriod === "All time") {
      return allRatingReviews;
    }
    return filterByPeriod(allRatingReviews, selectedPeriod, ['created_at', 'formatted_date', 'lastRating', 'date']);
  }, [allRatingReviews, selectedPeriod]);

  // Get pagination data (use product or store pagination based on active filter)
  const pagination = useMemo(() => {
    if (tabFilter === "Product" && productReviewsData?.data?.pagination) {
      return productReviewsData.data.pagination;
    }
    if (tabFilter === "Store" && storeReviewsData?.data?.pagination) {
      return storeReviewsData.data.pagination;
    }
    // For "All", use product pagination as default
    return productReviewsData?.data?.pagination || storeReviewsData?.data?.pagination || null;
  }, [tabFilter, productReviewsData, storeReviewsData]);

  // Filtered rows based on tab (search is handled by API)
  // For "All" tab, we combine both product and store reviews
  // For specific tabs, API already filters by type, so we just use the data as-is
  const filteredRows = useMemo(() => {
    if (tabFilter === "All") {
      // When showing "All", combine both types (search is done client-side for cross-type search)
      const q = (searchQuery || "").toLowerCase();
      if (q) {
        return ratingReviews.filter((row) => {
          return (
            row.storeName.toLowerCase().includes(q) ||
            String(row.noOfReviews).includes(q) ||
            String(row.averageRating).includes(q) ||
            row.lastRating.toLowerCase().includes(q)
          );
        });
      }
      return ratingReviews;
    } else {
      // For specific tabs, API already filters by type and search, so use data as-is
      return ratingReviews;
    }
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

  const handleDeleteReview = (reviewId: string) => {
    setReviewToDelete(reviewId);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    if (!reviewToDelete) return;
    
    if (reviewToDelete.startsWith('product-')) {
      const id = reviewToDelete.replace('product-', '');
      deleteProductReviewMutation.mutate(id);
    } else if (reviewToDelete.startsWith('store-')) {
      const id = reviewToDelete.replace('store-', '');
      deleteStoreReviewMutation.mutate(id);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setReviewToDelete(null);
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
                        disabled={deleteProductReviewMutation.isPending || deleteStoreReviewMutation.isPending}
                        className="px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer bg-[#E53E3E] text-white hover:bg-[#D32F2F] text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleDeleteReview(ratingReview.id)}
                        disabled={deleteProductReviewMutation.isPending || deleteStoreReviewMutation.isPending}
                        className="px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer bg-red-600 text-white hover:bg-red-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {deleteProductReviewMutation.isPending || deleteStoreReviewMutation.isPending ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.last_page > 1 && (
        <div className="bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {((currentPage - 1) * pagination.per_page) + 1} to {Math.min(currentPage * pagination.per_page, pagination.total)} of {pagination.total} results
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage <= 1}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            {/* Page numbers */}
            {Array.from({ length: Math.min(5, pagination.last_page) }, (_, i) => {
              const pageNum = Math.max(1, Math.min(pagination.last_page - 4, currentPage - 2)) + i;
              if (pageNum > pagination.last_page) return null;
              
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    currentPage === pageNum
                      ? 'bg-[#E53E3E] text-white'
                      : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage >= pagination.last_page}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                <img src={images.error} alt="Warning" className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Review</h3>
                <p className="text-sm text-gray-500">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this review? This will permanently remove the review and all its associated data.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleCancelDelete}
                disabled={deleteProductReviewMutation.isPending || deleteStoreReviewMutation.isPending}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleteProductReviewMutation.isPending || deleteStoreReviewMutation.isPending}
                className={`flex-1 px-4 py-2 bg-red-500 text-white rounded-lg transition-colors ${
                  deleteProductReviewMutation.isPending || deleteStoreReviewMutation.isPending
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-red-600'
                }`}
              >
                {deleteProductReviewMutation.isPending || deleteStoreReviewMutation.isPending
                  ? 'Deleting...'
                  : 'Delete Review'}
              </button>
            </div>
          </div>
        </div>
      )}

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
