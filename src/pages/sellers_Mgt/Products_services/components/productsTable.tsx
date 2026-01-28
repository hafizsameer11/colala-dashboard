import React, { useMemo, useState, useEffect, useRef } from "react";
import ProductDetailsModal from "../../Modals/productDetailsModal";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProductStatus } from "../../../../utils/queries/users";
import { useToast } from "../../../../contexts/ToastContext";
import images from "../../../../constants/images";

interface ApiProduct {
  id: number;
  name: string;
  description?: string;
  price: string;
  discount_price: string;
  store_name: string;
  seller_name: string;
  status: string;
  is_sold: number;
  is_unavailable: number;
  is_sponsored: boolean;
  quantity: number;
  reviews_count: number;
  average_rating: number;
  created_at: string;
  formatted_date: string;
  primary_image: string | null;
}

interface Product {
  id: string;
  storeName: string;
  productName: string;
  price: string;
  discountPrice?: string;
  date: string;
  sponsored: boolean;
  productImage: string;
  status: string;
  quantity: number;
  reviewsCount: number;
  averageRating: number;
  is_sold?: number;
  is_unavailable?: number;
}

interface ProductsTableProps {
  title?: string;
  onRowSelect?: (selectedIds: string[]) => void;
  /** "All" | "General" | "Sponsored" from parent */
  activeTab?: "All" | "General" | "Sponsored";
  /** debounced search string from parent */
  searchTerm?: string;
  products?: ApiProduct[];
  pagination?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  currentPage?: number;
  onPageChange?: (page: number) => void;
  isLoading?: boolean;
  error?: Error | null;
}

const ProductsTable: React.FC<ProductsTableProps> = ({
  title = "All Products",
  onRowSelect,
  activeTab = "All",
  searchTerm = "",
  products = [],
  pagination,
  currentPage = 1,
  onPageChange,
  isLoading = false,
  error,
}) => {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState<{ [key: string]: boolean }>({});
  const statusDropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState<{ productId: string; status: string } | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  
  // Status update mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ productId, statusData }: { productId: number | string; statusData: { status: string; rejection_reason?: string; is_sold?: boolean; is_unavailable?: boolean } }) =>
      updateProductStatus(productId, statusData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      queryClient.invalidateQueries({ queryKey: ['adminServices'] });
      showToast('Product status updated successfully', 'success');
      setShowRejectionModal(false);
      setRejectionReason("");
      setPendingStatusChange(null);
    },
    onError: (error: unknown) => {
      console.error('Update product status error:', error);
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to update product status. Please try again.';
      showToast(errorMessage, 'error');
    },
  });

  // Normalize API data to UI format
  const normalizedProducts: Product[] = useMemo(() => {
    return products.map((product: ApiProduct) => ({
      id: product.id.toString(),
      storeName: product.store_name,
      productName: product.name,
      price: `₦${parseFloat(product.price).toLocaleString()}`,
      discountPrice: product.discount_price ? `₦${parseFloat(product.discount_price).toLocaleString()}` : undefined,
      date: product.formatted_date,
      sponsored: product.is_sponsored,
      productImage: product.primary_image || "/assets/layout/itable.png",
      status: product.status,
      quantity: product.quantity,
      reviewsCount: product.reviews_count,
      averageRating: product.average_rating,
      is_sold: product.is_sold,
      is_unavailable: product.is_unavailable,
    }));
  }, [products]);

  const visibleProducts = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();

    const tabMatch = (p: Product) =>
      activeTab === "All"
        ? true
        : activeTab === "Sponsored"
        ? p.sponsored
        : !p.sponsored;

    const searchMatch = (p: Product) => {
      if (!q) return true;
      return [p.storeName, p.productName, p.price, p.date]
        .join(" ")
        .toLowerCase()
        .includes(q);
    };

    return normalizedProducts.filter((p) => tabMatch(p) && searchMatch(p));
  }, [normalizedProducts, activeTab, searchTerm]);

  // keep selectAll synced with currently visible rows
  useEffect(() => {
    const visIds = new Set(visibleProducts.map((p) => p.id));
    const visibleSelected = selectedRows.filter((id) => visIds.has(id));
    setSelectAll(
      visibleProducts.length > 0 &&
        visibleSelected.length === visibleProducts.length
    );
  }, [visibleProducts, selectedRows]);

  // select all for visible rows (keeps selections from other views)
  const handleSelectAll = () => {
    const visIds = visibleProducts.map((p) => p.id);
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

  const handleShowDetails = (product: Product) => {
    // Find the original API product data
    const originalProduct = products.find(p => String(p.id) === product.id);
    if (originalProduct) {
      setSelectedProduct({
        id: String(originalProduct.id),
        storeName: originalProduct.store_name,
        productName: originalProduct.name,
        price: originalProduct.price,
        discountPrice: originalProduct.discount_price,
        date: originalProduct.formatted_date,
        sponsored: originalProduct.is_sponsored,
        productImage: originalProduct.primary_image || '',
        status: originalProduct.status,
        quantity: originalProduct.quantity,
        reviewsCount: originalProduct.reviews_count,
        averageRating: originalProduct.average_rating,
        is_sold: originalProduct.is_sold,
        is_unavailable: originalProduct.is_unavailable,
      });
      setShowModal(true);
    }
  };
  
  const handleStatusToggle = (productId: string) => {
    setStatusDropdownOpen(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }));
  };
  
  const handleStatusChange = (productId: string, newStatus: string) => {
    // Close dropdown
    setStatusDropdownOpen(prev => ({
      ...prev,
      [productId]: false
    }));

    // If status is inactive, show rejection reason modal
    if (newStatus === 'inactive') {
      setPendingStatusChange({ productId, status: newStatus });
      setShowRejectionModal(true);
      setRejectionReason("");
    } else {
      // For other statuses, update directly
      confirmStatusChange(productId, newStatus);
    }
  };

  const confirmStatusChange = (productId: string, newStatus: string, rejectionReason?: string) => {
    const product = normalizedProducts.find(p => p.id === productId);
    if (!product) return;
    
    const statusData: { status: string; rejection_reason?: string; is_sold?: boolean; is_unavailable?: boolean } = {
      status: newStatus,
    };
    
    // Add rejection reason if provided
    if (rejectionReason && rejectionReason.trim()) {
      statusData.rejection_reason = rejectionReason.trim();
    }
    
    // Include is_sold and is_unavailable if they exist
    if (product.is_sold !== undefined) {
      statusData.is_sold = Boolean(product.is_sold);
    }
    if (product.is_unavailable !== undefined) {
      statusData.is_unavailable = Boolean(product.is_unavailable);
    }
    
    updateStatusMutation.mutate({ productId, statusData });
  };

  const handleRejectionSubmit = () => {
    if (pendingStatusChange) {
      confirmStatusChange(pendingStatusChange.productId, pendingStatusChange.status, rejectionReason);
    }
  };

  const handleRejectionCancel = () => {
    setShowRejectionModal(false);
    setRejectionReason("");
    setPendingStatusChange(null);
  };
  
  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      Object.keys(statusDropdownRefs.current).forEach((productId) => {
        if (statusDropdownRefs.current[productId] && !statusDropdownRefs.current[productId]?.contains(event.target as Node)) {
          setStatusDropdownOpen(prev => ({
            ...prev,
            [productId]: false
          }));
        }
      });
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const getStatusDisplay = (status: string) => {
    const statusMap: { [key: string]: { label: string; color: string } } = {
      'active': { label: 'Active', color: 'bg-green-500' },
      'inactive': { label: 'Inactive', color: 'bg-red-500' },
      'draft': { label: 'Draft', color: 'bg-gray-500' },
    };
    return statusMap[status] || { label: status.charAt(0).toUpperCase() + status.slice(1), color: 'bg-gray-500' };
  };

  return (
    <div className="border border-[#00000040] rounded-2xl mt-5">
      <div className="bg-white p-5 rounded-t-2xl font-semibold text-lg border-b border-[#00000040]">
        {title}
      </div>
      <div className="bg-white rounded-b-2xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#F2F2F2]">
            <tr className="text-left">
              <th className="p-4 font-normal">
                <input
                  type="checkbox"
                  checked={selectAll && visibleProducts.length > 0}
                  onChange={handleSelectAll}
                  className="w-5 h-5"
                />
              </th>
              <th className="p-4 text-left font-normal">Store Name</th>
              <th className="p-4 text-left font-normal">Product name</th>
              <th className="p-4 text-left font-normal">Price</th>
              <th className="p-4 text-left font-normal">Date</th>
              <th className="p-4 text-center font-normal">Status</th>
              <th className="p-4 text-center font-normal">Sponsored</th>
              <th className="p-4 text-center font-normal">Other</th>
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
                  <p className="text-sm">Error loading products</p>
                </td>
              </tr>
            ) : visibleProducts.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-6 text-center text-gray-500">
                  No products found.
                </td>
              </tr>
            ) : (
              visibleProducts.map((product) => (
                <tr key={product.id} className="border-t border-[#00000040] ">
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(product.id)}
                      onChange={() => handleRowSelect(product.id)}
                      className="w-5 h-5"
                    />
                  </td>
                  <td className="p-4 text-left">
                    <span className="font-medium">{product.storeName}</span>
                  </td>
                  <td className="p-4 text-left">
                    <div className="flex items-center gap-3">
                      <img
                        src={product.productImage}
                        alt={product.productName}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <span className="font-medium">{product.productName}</span>
                    </div>
                  </td>
                  <td className="p-4 text-left">
                    <div className="flex flex-col">
                      <span className="font-semibold text-[#E53E3E]">
                        {product.discountPrice ?? product.price}
                      </span>
                      {product.discountPrice && (
                        <span className="text-sm text-gray-500 line-through">
                          {product.price}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-left">
                    <span className="text-gray-600">{product.date}</span>
                  </td>
                  <td className="p-4 text-center">
                    <div className="relative inline-block" ref={(el) => { statusDropdownRefs.current[product.id] = el; }}>
                      <button
                        onClick={() => handleStatusToggle(product.id)}
                        disabled={updateStatusMutation.isPending}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          product.status === 'active' 
                            ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                            : product.status === 'inactive'
                            ? 'bg-red-100 text-red-800 hover:bg-red-200'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        } ${updateStatusMutation.isPending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        <span className={`w-2 h-2 rounded-full ${getStatusDisplay(product.status).color}`}></span>
                        {getStatusDisplay(product.status).label}
                        <img 
                          src={images.dropdown} 
                          alt="" 
                          className={`w-3 h-3 transition-transform ${statusDropdownOpen[product.id] ? 'rotate-180' : ''}`}
                        />
                      </button>
                      {statusDropdownOpen[product.id] && (
                        <div className="absolute z-10 mt-1 right-0 bg-white border border-gray-200 rounded-lg shadow-lg min-w-[120px]">
                          <button
                            onClick={() => handleStatusChange(product.id, 'active')}
                            className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors first:rounded-t-lg ${
                              product.status === 'active' ? 'bg-green-50 font-semibold' : ''
                            }`}
                          >
                            Active
                          </button>
                          <button
                            onClick={() => handleStatusChange(product.id, 'inactive')}
                            className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors last:rounded-b-lg ${
                              product.status === 'inactive' ? 'bg-red-50 font-semibold' : ''
                            }`}
                          >
                            Inactive
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex justify-center">
                      <div
                        className={`w-5 h-5 rounded-full ${
                          product.sponsored ? "bg-[#008000]" : "bg-[#FF0000]"
                        }`}
                      />
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => handleShowDetails(product)}
                      className="bg-[#E53E3E] hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer"
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
        <div className="flex justify-center items-center gap-2 mt-6 p-4">
          <button
            onClick={() => onPageChange && onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>
          <span className="px-4 py-2">
            Page {currentPage} of {pagination.last_page}
          </span>
          <button
            onClick={() => onPageChange && onPageChange(currentPage + 1)}
            disabled={currentPage === pagination.last_page}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}

      <ProductDetailsModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        product={selectedProduct || undefined}
      />

      {/* Rejection Reason Modal */}
      {showRejectionModal && pendingStatusChange && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Set Product to Inactive</h3>
                <button
                  onClick={handleRejectionCancel}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                  aria-label="Close"
                >
                  <img src={images.close} alt="Close" className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rejection Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Enter reason for making this product inactive (e.g., Product images are low quality)"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53E3E] focus:border-[#E53E3E] resize-none"
                  maxLength={500}
                />
                <div className="mt-1 text-xs text-gray-500 text-right">
                  {rejectionReason.length}/500 characters
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleRejectionCancel}
                  disabled={updateStatusMutation.isPending}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRejectionSubmit}
                  disabled={updateStatusMutation.isPending || !rejectionReason.trim()}
                  className="flex-1 px-4 py-2 bg-[#E53E3E] text-white rounded-lg hover:bg-[#D32F2F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {updateStatusMutation.isPending ? 'Updating...' : 'Confirm Inactive'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsTable;
