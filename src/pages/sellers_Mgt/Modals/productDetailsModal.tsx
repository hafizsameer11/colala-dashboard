import images from "../../../constants/images";
import { useState } from "react";
import Overview from "./overview";
import Description from "./description";
import Review from "./review";
import ProductStats from "./productStats";

interface ProductDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<
    "Product Details" | "Product Stats"
  >("Product Details");

  const [productTab, setProductTab] = useState<
    "overview" | "description" | "reviews"
  >("overview");

  const [quantity, setQuantity] = useState(1);

  const tabs = ["Product Details", "Product Stats"];

  const renderTabContent = () => {
    switch (activeTab) {
      case "Product Details":
        return (
          <div className="">
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
                <Overview quantity={quantity} setQuantity={setQuantity} />
              )}

              {productTab === "description" && <Description />}

              {productTab === "reviews" && <Review />}
            </div>
          </div>
        );
      case "Product Stats":
        return <ProductStats />;
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
                <img className="w-7 h-7" src={images.close} alt="Close" />
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
