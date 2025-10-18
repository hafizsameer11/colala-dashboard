import images from "../constants/images";
import React from "react";
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
        store_email: productDetails.data.store_info.seller_email,
        store_location: productDetails.data.store_info.store_location,
        average_rating: productDetails.data.statistics?.average_rating || 0,
        total_sold: productDetails.data.statistics?.total_sold || 0,
        followers_count: productDetails.data.statistics?.followers_count || 0,
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

      {/* Product Images */}
      {realProductData?.complete?.images && realProductData.complete.images.length > 0 && (
        <div className="flex flex-row mt-5 gap-3">
          {realProductData.complete.images.slice(0, 3).map((image: any, index: number) => (
            <div key={index}>
              <img 
                src={image.path.startsWith('http') 
                  ? image.path 
                  : `https://colala.hmstech.xyz/storage/${image.path}`}
                alt={`Product image ${index + 1}`}
                className="w-full h-auto object-cover rounded-lg"
                onError={(e) => {
                  e.currentTarget.src = images[`i${index + 1}` as keyof typeof images] || images.i1;
                }}
              />
            </div>
          ))}
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
