import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAdminProductDetails, deleteSellerProduct } from "../../../utils/queries/users";
import { useToast } from "../../../contexts/ToastContext";
import Overview from "./overview";
import Description from "./description";
import Review from "./review";
import ProductStats from "./productStats";
import AddNewProduct from "./addNewProduct";
import images from "../../../constants/images";

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

interface ProductDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product;
  userId?: string;
}

const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  isOpen,
  onClose,
  product,
  userId,
}) => {
  const [activeTab, setActiveTab] = useState<
    "Product Details" | "Product Stats"
  >("Product Details");

  const [productTab, setProductTab] = useState<
    "overview" | "description" | "reviews"
  >("overview");

  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const tabs = ["Product Details", "Product Stats"];

  // Reset selected image when product changes
  useEffect(() => {
    setSelectedImageIndex(0);
  }, [product?.id]);

  // Fetch product details
  const { data: productDetails, isLoading, error } = useQuery({
    queryKey: ['adminProductDetails', product?.id],
    queryFn: () => getAdminProductDetails(product!.id),
    enabled: isOpen && !!product?.id,
    staleTime: 2 * 60 * 1000,
  });

  const productInfo = productDetails?.data?.product_info;
  const storeInfo = productDetails?.data?.store_info;
  const productImages = productDetails?.data?.images || [];
  const variants = productDetails?.data?.variants || [];
  const reviews = productDetails?.data?.reviews || [];
  const statistics = productDetails?.data?.statistics;

  // Get userId from prop or from storeInfo (fallback)
  const resolvedUserId = userId || storeInfo?.id || storeInfo?.user_id || storeInfo?.store_id;

  const resolveStorageUrl = (path?: string | null) => {
    if (!path) return "";
    const trimmedPath = path.replace(/^\/+/, "");
    return path.startsWith("http")
      ? path
      : `hhttps://api.colalamall.com/storage/${trimmedPath}`;
  };

  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: () => {
      if (!resolvedUserId) {
        throw new Error('Store/User ID not found. Cannot delete product.');
      }
      if (!product?.id) {
        throw new Error('Product ID not found. Cannot delete product.');
      }
      return deleteSellerProduct(resolvedUserId, product.id);
    },
    onSuccess: () => {
      showToast('Product deleted successfully', 'success');
      // Invalidate and refetch product lists
      queryClient.invalidateQueries({ queryKey: ['sellerProducts'] });
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      queryClient.invalidateQueries({ queryKey: ['sellerProductDetails'] });
      // Close the modal
      onClose();
    },
    onError: (error: any) => {
      console.error('Failed to delete product:', error);
      const errorMessage = error?.message || error?.response?.data?.message || 'Failed to delete product';
      showToast(errorMessage, 'error');
    },
  });

  const handleEditProduct = () => {
    setShowEditModal(true);
  };

  const handleDeleteProduct = () => {
    if (!resolvedUserId) {
      showToast('Store/User ID not found. Cannot delete product.', 'error');
      return;
    }
    if (!product?.id) {
      showToast('Product ID not found. Cannot delete product.', 'error');
      return;
    }
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    deleteProductMutation.mutate();
    setShowDeleteConfirm(false);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  // Debug logging
  console.log('Product details data:', productDetails?.data);
  console.log('Product ID:', product?.id);
  console.log('Images array:', productImages);
  console.log('Selected image index:', selectedImageIndex);
  console.log('Current image:', productImages[selectedImageIndex]);

  const renderTabContent = () => {
    switch (activeTab) {
      case "Product Details":
        return (
          <div className="">
            {isLoading ? (
              <div className="flex flex-col justify-center items-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E53E3E] mb-4"></div>
                <p className="text-gray-600 text-sm">Loading product details...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col justify-center items-center py-16">
                <div className="text-red-500 text-center">
                  <p className="text-lg font-semibold mb-2">Failed to load product details</p>
                  <p className="text-sm text-gray-600">Please try again later</p>
                </div>
              </div>
            ) : (
              <>
                {/* Video Section - Show video if available, otherwise show images */}
                {productInfo?.video ? (
                  <div className="relative rounded-2xl overflow-hidden">
                    <video
                      src={resolveStorageUrl(productInfo.video)}
                      className="w-full h-auto object-cover rounded-2xl"
                      controls
                      preload="metadata"
                    />
                  </div>
                ) : (
                  <>
                    {/* Main Product Image - Only show if no video */}
                    {productImages.length > 0 && (
                      <div className="mt-5">
                        <div className="relative w-full h-80 mb-4 rounded-2xl overflow-hidden">
                          <img
                            src={
                              productImages[selectedImageIndex]?.url ||
                              resolveStorageUrl(productImages[selectedImageIndex]?.path)
                            }
                            alt={`Product image ${selectedImageIndex + 1}`}
                            className="w-full h-full object-contain bg-[#F9F9F9]"
                            onError={(e) => {
                              e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMDAgMjAwTDI1MCAyNTBMMjAwIDMwMEwxNTAgMjUwTDIwMCAyMDBaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPg==';
                            }}
                          />
                        </div>

                        {/* Thumbnail Images */}
                        {productImages.length > 1 && (
                          <div className="flex flex-row gap-3">
                            {productImages.map((img: { id?: string; url?: string; path?: string }, index: number) => (
                              <div
                                key={img.id || index}
                                className={`relative cursor-pointer transition-all duration-200 ${selectedImageIndex === index
                                    ? 'ring-2 ring-red-500 ring-offset-2'
                                    : 'hover:ring-2 hover:ring-gray-300'
                                  }`}
                                onClick={() => setSelectedImageIndex(index)}
                              >
                                <img
                                  src={img.url || resolveStorageUrl(img.path)}
                                  alt={`Product thumbnail ${index + 1}`}
                                  className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                                  onError={(e) => {
                                    e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik00MCA0MEw1MCA1MEw0MCA2MEwzMCA1MEw0MCA0MFoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+';
                                  }}
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Show placeholder if no images and no video */}
                    {productImages.length === 0 && (
                      <div className="mt-5">
                        <div className="w-full h-80 bg-gray-100 rounded-2xl border border-gray-200 flex items-center justify-center">
                          <span className="text-gray-400 text-lg">No Product Images</span>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </>
            )}

            {/* Tab Buttons */}
            <div className="flex gap-2 pt-4">
              <button
                type="button"
                onClick={() => setProductTab("overview")}
                className={`flex-1 py-3 px-4 rounded-lg border border-[#CDCDCD] cursor-pointer transition-colors ${productTab === "overview"
                    ? "bg-[#E53E3E] text-white"
                    : "bg-white text-[#00000080]"
                  }`}
              >
                Overview
              </button>
              <button
                type="button"
                onClick={() => setProductTab("description")}
                className={`flex-1 py-3 px-4 rounded-lg border border-[#CDCDCD] cursor-pointer transition-colors ${productTab === "description"
                    ? "bg-[#E53E3E] text-white"
                    : "bg-white text-[#00000080]"
                  }`}
              >
                Description
              </button>
              <button
                type="button"
                onClick={() => setProductTab("reviews")}
                className={`flex-1 py-3 px-4 rounded-lg border border-[#CDCDCD] cursor-pointer transition-colors ${productTab === "reviews"
                    ? "bg-[#E53E3E] text-white"
                    : "bg-white text-[#00000080]"
                  }`}
              >
                Reviews
              </button>
            </div>

            {/* Tab Content */}
            <div className="mt-5">
              {productTab === "overview" && (
                <Overview
                  quantity={quantity}
                  setQuantity={setQuantity}
                  productInfo={productInfo}
                  storeInfo={storeInfo}
                  images={productImages}
                  variants={variants}
                  productId={product?.id}
                  userId={userId}
                  onEditProduct={handleEditProduct}
                  onDeleteProduct={handleDeleteProduct}
                  onViewAnalytics={() => {
                    setActiveTab("Product Stats");
                  }}
                  onUpdateStatus={() => {
                    // TODO: Implement status update functionality
                    console.log('Update status for product:', product?.id);
                  }}
                />
              )}

              {productTab === "description" && (
                <Description
                  productInfo={productInfo}
                  variants={variants}
                />
              )}

              {productTab === "reviews" && (
                <Review
                  reviews={reviews}
                  statistics={statistics}
                />
              )}
            </div>
          </div>
        );
      case "Product Stats":
        return <ProductStats statistics={statistics} />;
      default:
        return null;
    }
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-100 bg-[#00000080] bg-opacity-50 flex justify-end">
      <div className="bg-white w-[600px] relative h-full overflow-y-auto">
        {/* Header */}
        <div className="border-b border-[#787878] px-3 py-3 sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Product Details</h2>
            <div className="flex items-center gap-3">


              {/* Close Button */}
              <button
                onClick={onClose}
                className="w-16 h-16 bg-white border border-gray-200 rounded-2xl flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
                aria-label="Close"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        <div className="p-5">
          {/* Tab Buttons */}
          <div className="flex bg-white rounded-xl p-1 mb-6 w-fit border border-[#989898]">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() =>
                  setActiveTab(tab as "Product Details" | "Product Stats")
                }
                className={`px-6 py-3 rounded-xl cursor-pointer font-medium transition-colors text-sm ${activeTab === tab
                    ? "bg-[#E53E3E] text-white shadow-sm"
                    : "text-[#000000] "
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {renderTabContent()}
        </div>
      </div>

      {/* Edit Product Modal */}
      {showEditModal && (
        <AddNewProduct
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          selectedStore={storeInfo}
          editMode={true}
          initialProductData={productDetails?.data}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                <img src={images.error} alt="Warning" className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Product</h3>
                <p className="text-sm text-gray-500">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this product? This will permanently remove the product and all its associated data.
            </p>
            <div className="flex gap-3">
              <button
                onClick={cancelDelete}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleteProductMutation.isPending}
                className={`flex-1 px-4 py-2 bg-red-500 text-white rounded-lg transition-colors ${deleteProductMutation.isPending ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-600'
                  }`}
              >
                {deleteProductMutation.isPending ? 'Deleting...' : 'Delete Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailsModal;
