import images from "../constants/images";
import React from "react";
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
  return (
    <div className="mt-5">
      {/* Video Section */}
      {productData?.compelete?.product?.video && (
        <div className="relative rounded-2xl overflow-hidden">
          <img
            src={`https://colala.hmstech.xyz/storage/${productData.compelete.product.video}`}
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
      {productData?.compelete?.images && productData.compelete.images.length > 0 && (
        <div className="flex flex-row mt-5 gap-3">
          {productData.compelete.images.slice(0, 3).map((image: any, index: number) => (
            <div key={index}>
              <img 
                src={`https://colala.hmstech.xyz/storage/${image.path}`}
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
            productData={productData}
          />
        )}

        {productTab === "description" && (
          <ProductDescription productData={productData} />
        )}

        {productTab === "reviews" && (
          <ProductReviews productData={productData} />
        )}
      </div>
    </div>
  );
};

export default ProductDetails;
