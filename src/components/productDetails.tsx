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
}

const ProductDetails: React.FC<ProductDetailsProps> = ({
  productTab,
  setProductTab,
  quantity,
  setQuantity,
}) => {
  return (
    <div className="mt-5">
      {/* Video Section */}
      <div className="relative rounded-2xl overflow-hidden">
        <img
          src={images.ivideo}
          alt="Product video thumbnail"
          className="w-full h-auto object-cover rounded-2xl"
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

      {/* Product Images */}
      <div className="flex flex-row mt-5 gap-3">
        <div>
          <img src={images.i1} alt="" />
        </div>
        <div>
          <img src={images.i2} alt="" />
        </div>
        <div>
          <img src={images.i3} alt="" />
        </div>
      </div>

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
          <ProductOverview quantity={quantity} setQuantity={setQuantity} />
        )}

        {productTab === "description" && (
          <ProductDescription />
        )}

        {productTab === "reviews" && (
          <ProductReviews />
        )}
      </div>
    </div>
  );
};

export default ProductDetails;
