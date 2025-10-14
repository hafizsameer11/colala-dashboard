import React, { useMemo, useState } from "react";
import ProductDetailsModal from "../../../Modals/productDetailsModal";

interface ApiProduct {
  id: number;
  name: string;
  brand: string | null;
  description: string | null;
  price: string;
  discount_price: string | null;
  status: string; // draft | active
  is_sold: number;
  is_unavailable: number;
  quantity: number;
  has_variants: number;
  is_sponsored: boolean;
  sponsored_status: string;
  main_image: string | null;
  store_name: string;
  category?: { id: number; title: string; image: string } | null;
  stats?: { views: number; impressions: number; clicks: number; carts: number; orders: number; chats: number };
  created_at: string;
}

interface ProductsTableProps {
  title?: string;
  onRowSelect?: (selectedIds: string[]) => void;
  products: ApiProduct[];
  isLoading?: boolean;
  error?: any;
  pagination?: { current_page: number; last_page: number; total: number; per_page: number };
  currentPage?: number;
  onPageChange?: (page: number) => void;
  activeTab?: string; // All | General | Sponsored
  userId?: string;
}

const ProductsTable: React.FC<ProductsTableProps> = ({
  title = "All Products",
  onRowSelect,
  products = [],
  isLoading,
  error,
  pagination,
  currentPage = 1,
  onPageChange,
  activeTab = 'All',
  userId,
}) => {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  const normalizedProducts = useMemo(() => {
    let list = products.map((p) => ({
      id: String(p.id),
      storeName: p.store_name || 'N/A',
      productName: p.name || 'N/A',
      price: p.price || 'N/A',
      date: p.created_at || 'N/A',
      sponsored: Boolean(p.is_sponsored) || p.sponsored_status === 'active',
      productImage: p.main_image || '/assets/layout/iphone.png',
      status: p.status,
    }));
    if (activeTab === 'General') {
      list = list.filter((p) => !p.sponsored);
    } else if (activeTab === 'Sponsored') {
      list = list.filter((p) => p.sponsored);
    }
    return list;
  }, [products, activeTab]);

  const handleSelectAll = () => {
    const allIds = normalizedProducts.map((product) => product.id);
    const newSelection = selectAll ? [] : allIds;
    setSelectedRows(newSelection);
    setSelectAll(!selectAll);

    if (onRowSelect) {
      onRowSelect(newSelection);
    }
  };

  const handleRowSelect = (id: string) => {
    const isSelected = selectedRows.includes(id);
    const newSelection = isSelected
      ? selectedRows.filter((rowId) => rowId !== id)
      : [...selectedRows, id];

    setSelectedRows(newSelection);
    setSelectAll(newSelection.length === normalizedProducts.length);

    if (onRowSelect) {
      onRowSelect(newSelection);
    }
  };

  //   const handleViewDetails = (product: Product) => {
  //     console.log("View details for product:", product);
  //     // Add your view details logic here
  //   };

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
                  checked={selectAll}
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
                <td colSpan={7} className="p-6 text-center text-gray-500">Loading...</td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-red-500">Failed to load products</td>
              </tr>
            ) : normalizedProducts.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-gray-500">No products found</td>
              </tr>
            ) : (
            normalizedProducts.map((product) => (
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
                  <span className="font-semibold">{product.price}</span>
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
                    onClick={() => {
                      setSelectedProductId(product.id);
                      setShowModal(true);
                    }}
                    className="bg-[#E53E3E] hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            )))}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      {pagination && pagination.last_page > 1 && (
        <div className="flex justify-between items-center p-4">
          <div className="text-sm text-gray-600">
            Page {currentPage} of {pagination.last_page} • Total {pagination.total}
          </div>
          <div className="flex gap-2">
            <button
              disabled={currentPage <= 1}
              onClick={() => onPageChange && onPageChange(currentPage - 1)}
              className="px-3 py-2 border rounded disabled:opacity-50"
            >
              Prev
            </button>
            <button
              disabled={currentPage >= pagination.last_page}
              onClick={() => onPageChange && onPageChange(currentPage + 1)}
              className="px-3 py-2 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
      <ProductDetailsModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedProductId(null);
        }}
        userId={userId}
        productId={selectedProductId || undefined}
      />
    </div>
  );
};

export default ProductsTable;
