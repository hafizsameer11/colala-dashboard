import React, { useMemo, useState, useEffect } from "react";
import ProductDetailsModal from "../../Modals/productDetailsModal";

interface ApiProduct {
  id: number;
  name: string;
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
}

interface ProductsTableProps {
  title?: string;
  onRowSelect?: (selectedIds: string[]) => void;
  /** "All" | "General" | "Sponsored" from parent */
  activeTab?: "All" | "General" | "Sponsored";
  /** debounced search string from parent */
  searchTerm?: string;
  products?: ApiProduct[];
  pagination?: any;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  isLoading?: boolean;
  error?: any;
  onBulkAction?: (action: string) => void;
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
  onBulkAction,
}) => {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

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
    setSelectedProduct(product);
    setShowModal(true);
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
              <th className="p-4 text-center font-normal">Sponsored</th>
              <th className="p-4 text-center font-normal">Other</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7} className="p-6 text-center">
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E53E3E]"></div>
                  </div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-red-500">
                  <p className="text-sm">Error loading products</p>
                </td>
              </tr>
            ) : visibleProducts.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-gray-500">
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
                      <span className="font-semibold text-[#E53E3E]">{product.price}</span>
                      {product.discountPrice && (
                        <span className="text-sm text-gray-500 line-through">{product.discountPrice}</span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-left">
                    <span className="text-gray-600">{product.date}</span>
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
        product={selectedProduct}
      />
    </div>
  );
};

export default ProductsTable;
