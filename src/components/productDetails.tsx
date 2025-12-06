import images from "../constants/images";
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAdminProductDetails } from "../utils/queries/users";
import ProductOverview from "./productOverview";
import ProductDescription from "./productDescription";
import ProductReviews from "./productReviews";

interface ProductDetailsProps {
  productTab: "overview" | "description" | "reviews";
  setProductTab: (tab: "overview" | "description" | "reviews") => void;
  quantity: number;
  setQuantity: (quantity: number) => void;
  productData?: any;
}

const ProductDetails: React.FC<ProductDetailsProps> = ({
  productTab,
  setProductTab,
  quantity,
  setQuantity,
  productData,
}) => {
  // State for image modal
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  // State for image carousel
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Extract product ID from the order item data
  const productId = productData?.complete?.product?.id || productData?.product?.id;
  
  // Fetch real product details using the product ID
  const { data: productDetails, isLoading, error } = useQuery({
    queryKey: ['adminProductDetails', productId],
    queryFn: () => getAdminProductDetails(productId!),
    enabled: !!productId,
    staleTime: 5 * 60 * 1000,
  });

  // Transform API response to match expected structure
  const realProductData = productDetails?.data ? {
    // Create the nested structure that ProductOverview expects
    complete: {
      product: {
        id: productDetails.data.product_info?.id,
        name: productDetails.data.product_info?.name,
        description: productDetails.data.product_info?.description,
        price: productDetails.data.product_info?.price,
        discount_price: productDetails.data.product_info?.discount_price,
        status: productDetails.data.product_info?.status,
        quantity: productDetails.data.product_info?.quantity,
        created_at: productDetails.data.product_info?.created_at,
        updated_at: productDetails.data.product_info?.updated_at,
        average_rating: productDetails.data.statistics?.average_rating || 0,
      },
      // Map images from API response
      images: productDetails.data.images?.map((img: any) => ({
        id: img.id,
        path: img.url,
        is_main: img.id === productDetails.data.images[0]?.id ? 1 : 0
      })) || [],
      // Map store info
      store: productDetails.data.store_info ? {
        id: productDetails.data.store_info.store_id,
        store_name: productDetails.data.store_info.store_name,
        seller_name: productDetails.data.store_info.seller_name,
        store_email: productDetails.data.store_info.seller_email,
        store_location: productDetails.data.store_info.store_location,
        profile_image: productDetails.data.store_info.profile_image,
        banner_image: productDetails.data.store_info.banner_image,
        average_rating: productDetails.data.statistics?.average_rating || 0,
        total_sold: productDetails.data.statistics?.total_sold || 0,
        followers_count: productDetails.data.statistics?.followers_count || 0,
      } : null,
      // Map category for badges
      category: productDetails.data.category ? {
        id: productDetails.data.category.id,
        name: productDetails.data.category.name,
        title: productDetails.data.category.title,
      } : null,
      // Map reviews
      reviews: productDetails.data.reviews || [],
      // Map statistics
      statistics: productDetails.data.statistics || {},
      // Map variants
      variants: productDetails.data.variants || []
    }
  } : productData;
  
  // Debug: Log the product data structure
  console.log('ProductDetails - productId:', productId);
  console.log('ProductDetails - Raw API Response:', productDetails);
  console.log('ProductDetails - Transformed Data:', realProductData);
  console.log('ProductDetails - isLoading:', isLoading);
  console.log('ProductDetails - error:', error);
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="mt-5 flex items-center justify-center py-8">
        <div className="text-gray-500">Loading product details...</div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="mt-5 flex items-center justify-center py-8">
        <div className="text-red-500">Error loading product details. Please try again.</div>
      </div>
    );
  }

  return (
    <div className="mt-5">
     

      {/* Video Section */}
      {realProductData?.complete?.video && (
        <div className="relative rounded-2xl overflow-hidden">
          <img
            src={realProductData.complete.video.startsWith('http') 
              ? realProductData.complete.video 
              : `https://colala.hmstech.xyz/storage/${realProductData.complete.video}`}
            alt="Product video thumbnail"
            className="w-full h-auto object-cover rounded-2xl"
            onError={(e) => {
              e.currentTarget.src = images.ivideo;
            }}
          />
          <button
            type="button"
            className="absolute inset-0 flex items-center justify-center cursor-pointer"
            aria-label="Play product video"
          >
            <span className="bg-[#000000CC] rounded-full w-20 h-20 flex items-center justify-center shadow-lg">
              <img className="w-8 h-8" src={images.video} alt="Play" />
            </span>
          </button>
        </div>
      )}

      {/* Product Images - Carousel/Slider */}
      {realProductData?.complete?.images && realProductData.complete.images.length > 0 && (
        <div className="relative mt-5">
          <div className="relative overflow-hidden rounded-lg">
            {/* Main Image Display */}
            <div className="relative">
              <img
                src={
                  realProductData.complete.images[currentImageIndex].path.startsWith('http')
                    ? realProductData.complete.images[currentImageIndex].path
                    : `https://colala.hmstech.xyz/storage/${realProductData.complete.images[currentImageIndex].path}`
                }
                alt={`Product image ${currentImageIndex + 1}`}
                className="w-full h-auto object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => setSelectedImageIndex(currentImageIndex)}
                onError={(e) => {
                  e.currentTarget.src = images.i1;
                }}
              />
              
              {/* Navigation Arrows - Only show if more than 1 image */}
              {realProductData.complete.images.length > 1 && (
                <>
                  {/* Previous Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImageIndex((prev) => 
                        prev === 0 ? realProductData.complete.images.length - 1 : prev - 1
                      );
                    }}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-2 transition-all z-10"
                    aria-label="Previous image"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-6 h-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>

                  {/* Next Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImageIndex((prev) => 
                        prev === realProductData.complete.images.length - 1 ? 0 : prev + 1
                      );
                    }}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-2 transition-all z-10"
                    aria-label="Next image"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-6 h-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </>
              )}

              {/* Image Counter Badge */}
              {realProductData.complete.images.length > 1 && (
                <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm z-10">
                  {currentImageIndex + 1} / {realProductData.complete.images.length}
                </div>
              )}
            </div>

            {/* Thumbnail Slider - Show if more than 1 image */}
            {realProductData.complete.images.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {realProductData.complete.images.map((image: any, index: number) => {
                  const thumbUrl = image.path.startsWith('http')
                    ? image.path
                    : `https://colala.hmstech.xyz/storage/${image.path}`;
                  return (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        index === currentImageIndex
                          ? 'border-[#E53E3E] scale-105 shadow-md'
                          : 'border-gray-300 opacity-70 hover:opacity-100 hover:border-gray-400'
                      }`}
                    >
                      <img
                        src={thumbUrl}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = images.i1;
                        }}
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Image Modal/Lightbox */}
      {selectedImageIndex !== null && realProductData?.complete?.images && (
        <div 
          className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4"
          onClick={() => setSelectedImageIndex(null)}
        >
          <div className="relative max-w-6xl max-h-[90vh] w-full h-full flex items-center justify-center">
            {/* Close Button */}
            <button
              onClick={() => setSelectedImageIndex(null)}
              className="absolute top-4 right-4 z-10 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-3 transition-colors"
              aria-label="Close image viewer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Previous Button */}
            {selectedImageIndex > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImageIndex(selectedImageIndex - 1);
                }}
                className="absolute left-4 z-10 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-3 transition-colors"
                aria-label="Previous image"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
            )}

            {/* Next Button */}
            {selectedImageIndex < realProductData.complete.images.length - 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImageIndex(selectedImageIndex + 1);
                }}
                className="absolute right-4 z-10 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-3 transition-colors"
                aria-label="Next image"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            )}

            {/* Image */}
            <img
              src={
                realProductData.complete.images[selectedImageIndex].path.startsWith('http')
                  ? realProductData.complete.images[selectedImageIndex].path
                  : `https://colala.hmstech.xyz/storage/${realProductData.complete.images[selectedImageIndex].path}`
              }
              alt={`Product image ${selectedImageIndex + 1}`}
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
              onError={(e) => {
                e.currentTarget.src = images.i1;
              }}
            />

            {/* Image Counter */}
            {realProductData.complete.images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-4 py-2 rounded-full text-sm">
                {selectedImageIndex + 1} / {realProductData.complete.images.length}
              </div>
            )}

            {/* Thumbnail Navigation */}
            {realProductData.complete.images.length > 1 && (
              <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 flex gap-2 max-w-full overflow-x-auto px-4">
                {realProductData.complete.images.map((image: any, index: number) => {
                  const thumbUrl = image.path.startsWith('http')
                    ? image.path
                    : `https://colala.hmstech.xyz/storage/${image.path}`;
                  return (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedImageIndex(index);
                      }}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                        index === selectedImageIndex
                          ? 'border-white scale-110'
                          : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={thumbUrl}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = images.i1;
                        }}
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
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
          <ProductOverview 
            quantity={quantity} 
            setQuantity={setQuantity} 
            productData={realProductData}
          />
        )}

        {productTab === "description" && (
          <ProductDescription productData={realProductData} />
        )}

        {productTab === "reviews" && (
          <ProductReviews productData={realProductData} />
        )}
      </div>
    </div>
  );
};

export default ProductDetails;
