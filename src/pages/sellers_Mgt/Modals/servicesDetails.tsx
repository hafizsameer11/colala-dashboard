import images from "../../../constants/images";
import { useState } from "react";

interface ServicesDetailsProps {
  isOpen: boolean;
  onClose: () => void;
}

const ServicesDetails: React.FC<ServicesDetailsProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<
    "Product Details" | "Product Stats"
  >("Product Details");

  const tabs = ["Product Details", "Product Stats"];

  const renderTabContent = () => {
    switch (activeTab) {
      case "Product Details":
        return (
          <div className="">
            {/* Video Section */}
            <div className="relative rounded-2xl overflow-hidden">
              <img src={images.serviceDetails} alt="" />
            </div>

            {/* Product Images */}
            <div className="flex flex-row mt-5 gap-3">
              <div>
                <img src={images.s1} alt="" />
              </div>
              <div>
                <img src={images.s2} alt="" />
              </div>
              <div>
                <img src={images.s3} alt="" />
              </div>
            </div>

            <div className="mt-5">
              <div className="flex flex-row justify-between border-b border-b-[#00000080] p-1 pb-5">
                <div className="flex flex-col gap-2">
                  <div className="text-xl font-medium">
                    Sasha Fashion Designing
                  </div>
                  <div className="text-xl font-bold text-[#E53E3E]">
                    N5,000 - N100,000
                  </div>
                </div>
                <div className="flex flex-row items-center">
                  <div>
                    <img className="w-8 h-8" src={images.start1} alt="" />
                  </div>
                  <div className="text-[#00000080] text-2xl">4.5</div>
                </div>
              </div>
              <div className="border-b border-b-[#00000080] p-1 pb-5 flex flex-col mt-5">
                <div className="text-[#00000080] text-lg font-semibold">
                  Description
                </div>
                <div className="font-semibold text-xl">
                  We sew all kinds of dresses, we are your one stop shop for any
                  form of dresses
                </div>
              </div>
            </div>
            <div className="mt-5 flex flex-col border-[0.3px] border-[#CDCDCD] rounded-2xl">
              <div className="bg-[#E53E3E] text-white font-bold text-xl p-4 rounded-t-2xl">
                Price Breakdown
              </div>
              <div className="flex flex-row p-4 border-b-[0.3px] border-b-[#CDCDCD]">
                <div className="text-[#00000080] text-lg w-40 ">General</div>
                <div className="text-lg">N5,000 - N10,000</div>
              </div>
              <div className="flex flex-row p-4 border-b-[0.3px] border-b-[#CDCDCD]">
                <div className="text-[#00000080] text-lg w-40 ">Male Wear</div>
                <div className="text-lg">N5,000 - N10,000</div>
              </div>
              <div className="flex flex-row p-4 border-b-[0.3px] border-b-[#CDCDCD]">
                <div className="text-[#00000080] text-lg w-40 ">
                  Female Wear
                </div>
                <div className="text-lg">N5,000 - N10,000</div>
              </div>
              <div className="flex flex-row p-4 border-b-[0.3px] border-b-[#CDCDCD]">
                <div className="text-[#00000080] text-lg w-40 ">Kids wear</div>
                <div className="text-lg">N5,000 - N10,000</div>
              </div>
              <div className="flex flex-row p-4 border-b-[0.3px] border-b-[#CDCDCD]">
                <div className="text-[#00000080] text-lg w-40 ">
                  Wedding wear
                </div>
                <div className="text-lg">N5,000 - N10,000</div>
              </div>
              <div className="flex flex-row p-4 ">
                <div className="text-[#00000080] text-lg w-40 ">Tents</div>
                <div className="text-lg">N5,000 - N10,000</div>
              </div>
            </div>
            <div className="mt-5">
              <div className="flex gap-3">
                {/* Delete Button */}
                <button
                  type="button"
                  className="w-16 h-16 bg-white border border-gray-200 rounded-2xl flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <img className="w-6 h-6" src={images.delete1} alt="Delete" />
                </button>

                {/* Analytics Button */}
                <button
                  type="button"
                  className="w-16 h-16 bg-white border border-gray-200 rounded-2xl flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <img
                    className="w-6 h-6"
                    src={images.analyticsIcon}
                    alt="Analytics"
                  />
                </button>

                {/* Edit Product Button */}
                <button
                  type="button"
                  className="flex-1 bg-[#E53E3E] text-white rounded-2xl py-4 px-6 font-medium cursor-pointer hover:bg-red-600 transition-colors"
                >
                  Edit Product
                </button>
              </div>
            </div>
          </div>
        );
      case "Product Stats":
        return (
          <div>
            <div className="flex flex-col gap-3">
              <div className="flex flex-row justify-between gap-3">
                <div className="flex flex-col border border-[#989898] rounded-xl items-center justify-center gap-2 py-3 px-4 flex-1 min-h-[80px]">
                  <div className="text-[#000000B2] text-sm">Views</div>
                  <div className="font-bold text-lg">2,500</div>
                </div>
                <div className="flex flex-col border border-[#989898] rounded-xl items-center justify-center gap-2 py-3 px-4 flex-1 min-h-[80px]">
                  <div className="text-[#000000B2] text-sm">Impressions</div>
                  <div className="font-bold text-lg">2,500</div>
                </div>
                <div className="flex flex-col border border-[#989898] rounded-xl items-center justify-center gap-2 py-3 px-4 flex-1 min-h-[80px]">
                  <div className="text-[#000000B2] text-sm">Visitors</div>
                  <div className="font-bold text-lg">2,500</div>
                </div>
              </div>
              <div className="flex flex-row justify-between gap-3">
                <div className="flex flex-col border border-[#989898] rounded-xl items-center justify-center gap-2 py-3 px-4 flex-1 min-h-[80px]">
                  <div className="text-[#000000B2] text-sm">Chats</div>
                  <div className="font-bold text-lg">2,500</div>
                </div>
                <div className="flex flex-col border border-[#989898] rounded-xl items-center justify-center gap-2 py-3 px-4 flex-1 min-h-[80px]">
                  <div className="text-[#000000B2] text-sm">Reviews</div>
                  <div className="font-bold text-lg">2,500</div>
                </div>
                <div className="flex flex-col border border-[#989898] rounded-xl items-center justify-center gap-2 py-3 px-4 flex-1 min-h-[80px]">
                  <div className="text-[#000000B2] text-sm">
                    Date Created
                  </div>
                  <div className="font-bold text-lg">07 - 22 - 25</div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-100 bg-[#00000080] bg-opacity-50 flex justify-end">
      <div className="bg-white w-[500px] relative h-full overflow-y-auto">
        {" "}
        {/* Header */}
        <div className="border-b border-[#787878] px-3 py-3 sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Service Details</h2>
            <div className="flex items-center">
              <button
                onClick={onClose}
                className="p-2 rounded-md cursor-pointer"
                aria-label="Close"
              >
                <img className="w-7 h-7" src={images.close} alt="Close" />
              </button>
            </div>
          </div>
        </div>
        <div className="p-5">
          {" "}
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

export default ServicesDetails;
