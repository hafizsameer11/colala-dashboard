import images from "../../../constants/images";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAdminProductDetails } from "../../../utils/queries/users";
import Overview from "./overview";
import Description from "./description";
import Review from "./review";
import ProductStats from "./productStats";

interface ProductDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: any;
}

const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  isOpen,
  onClose,
  product,
}) => {
  const [activeTab, setActiveTab] = useState<
    "Product Details" | "Product Stats"
  >("Product Details");

  const [productTab, setProductTab] = useState<
    "overview" | "description" | "reviews"
  >("overview");

  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

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
  const images = productDetails?.data?.images || [];
  const variants = productDetails?.data?.variants || [];
  const reviews = productDetails?.data?.reviews || [];
  const statistics = productDetails?.data?.statistics;
  const reviewsCount = productDetails?.data?.reviews_count || 0;

  const renderTabContent = () => {
    switch (activeTab) {
      case "Product Details":
        return (
          <div className="">
            {isLoading ? (
              <div className="text-center py-8">Loading product details...</div>
            ) : error ? (
              <div className="text-center py-8 text-red-500">Failed to load product details</div>
            ) : (
              <>
                {/* Video Section */}
                {productInfo?.video && (
                  <div className="relative rounded-2xl overflow-hidden">
                    <video
                      src={productInfo.video}
                      className="w-full h-auto object-cover rounded-2xl"
                      controls
                    />
                  </div>
                )}

                {/* Main Product Image */}
                {images.length > 0 && (
                  <div className="mt-5">
                    <div className="relative w-full h-80 mb-4 rounded-2xl overflow-hidden">
                      <img 
                        src={images[selectedImageIndex]?.url} 
                        alt={`Product image ${selectedImageIndex + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMDAgMjAwTDI1MCAyNTBMMjAwIDMwMEwxNTAgMjUwTDIwMCAyMDBaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPg==';
                        }}
                      />
                    </div>
                    
                    {/* Thumbnail Images */}
                    <div className="flex flex-row gap-3">
                      {images.map((img: any, index: number) => (
                        <div 
                          key={img.id || index} 
                          className={`relative cursor-pointer transition-all duration-200 ${
                            selectedImageIndex === index 
                              ? 'ring-2 ring-red-500 ring-offset-2' 
                              : 'hover:ring-2 hover:ring-gray-300'
                          }`}
                          onClick={() => setSelectedImageIndex(index)}
                        >
                          <img 
                            src={img.url} 
                            alt={`Product thumbnail ${index + 1}`}
                            className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                            onError={(e) => {
                              e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik00MCA0MEw1MCA1MEw0MCA2MEwzMCA1MEw0MCA0MFoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+';
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Show placeholder if no images */}
                {images.length === 0 && (
                  <div className="mt-5">
                    <div className="w-full h-80 bg-gray-100 rounded-2xl border border-gray-200 flex items-center justify-center">
                      <span className="text-gray-400 text-lg">No Product Images</span>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Tab Buttons */}
            <div className="flex gap-2 pt-4">
              <button
                type="button"
                onClick={() => setProductTab("overview")}
                className={`flex-1 py-3 px-4 rounded-lg border border-[#CDCDCD] cursor-pointer transition-colors ${
                  productTab === "overview"
                    ? "bg-[#E53E3E] text-white"
                    : "bg-white text-[#00000080]"
                }`}
              >
                Overview
              </button>
              <button
                type="button"
                onClick={() => setProductTab("description")}
                className={`flex-1 py-3 px-4 rounded-lg border border-[#CDCDCD] cursor-pointer transition-colors ${
                  productTab === "description"
                    ? "bg-[#E53E3E] text-white"
                    : "bg-white text-[#00000080]"
                }`}
              >
                Description
              </button>
              <button
                type="button"
                onClick={() => setProductTab("reviews")}
                className={`flex-1 py-3 px-4 rounded-lg border border-[#CDCDCD] cursor-pointer transition-colors ${
                  productTab === "reviews"
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
                  images={images}
                  variants={variants}
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
            <div className="flex items-center">
              <button
                onClick={onClose}
                className="p-2 rounded-md  cursor-pointer"
                aria-label="Close"
              >
                <img 
                  className="w-7 h-7" 
                  src={images.close} 
                  alt="Close" 
                  onError={(e) => {
                    e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgiIGhlaWdodD0iMjgiIHZpZXdCb3g9IjAgMCAyOCAyOCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIxIDdMMjEgMjFMMjEgN0wyMSAyMVoiIHN0cm9rZT0iIzAwMDAwMCIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPHBhdGggZD0iTTcgN0wyMSAyMSIgc3Ryb2tlPSIjMDAwMDAwIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8cGF0aCBkPSJNMjEgN0w3IDIxIiBzdHJva2U9IiMwMDAwMDAiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPg==';
                  }}
                />
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
                className={`px-6 py-3 rounded-xl cursor-pointer font-medium transition-colors text-sm ${
                  activeTab === tab
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
    </div>
  );
};

export default ProductDetailsModal;
