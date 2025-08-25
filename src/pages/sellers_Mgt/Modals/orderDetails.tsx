import images from "../../../constants/images";
import React, { useState } from "react";
import ProductDetails from "../../../components/productDetails";
import OrderOverview from "./orderOverview";

interface OrderDetailsProps {
  isOpen: boolean;
  onClose: () => void;
}

const OrderDetails: React.FC<OrderDetailsProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<
    "track order" | "full order details"
  >("track order");
  // Sub-view flag: when true, we're inside Product Details while keeping the tab as Full Order Details
  const [isProductDetails, setIsProductDetails] = useState(false);
  // Product details inner tabs
  const [productTab, setProductTab] = useState<
    "overview" | "description" | "reviews"
  >("overview");
  // Quantity state for the counter
  const [quantity, setQuantity] = useState<number>(1);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 bg-[#00000080] bg-opacity-50 flex justify-end">
      <div className="bg-white w-[500px] relative h-full overflow-y-auto">
        {/* Header */}
        <div className="border-b border-[#787878] px-3 py-3 sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {isProductDetails && (
                <button
                  onClick={() => {
                    setIsProductDetails(false);
                    setProductTab("overview");
                  }}
                  className="p-2 -ml-2 rounded-md cursor-pointer"
                  aria-label="Back"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-5 h-5"
                  >
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </button>
              )}
              <h2 className="text-xl font-semibold">
                {isProductDetails ? "Product details" : "Order Details"}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-md  cursor-pointer"
              aria-label="Close"
            >
              <img src={images.close} alt="Close" />
            </button>
          </div>
        </div>

        <div className="p-5">
          {/* Tabs */}
          <div className="flex flex-row justify-between">
            <div className="flex p-1 gap-4 border border-[#989898] rounded-lg w-[335px]">
              <button
                onClick={() => setActiveTab("track order")}
                className={`px-6 py-2 rounded-lg font-medium cursor-pointer ${
                  activeTab === "track order"
                    ? "bg-[#E53E3E] text-white "
                    : "bg-transparent text-[#00000080]"
                }`}
              >
                Track Order
              </button>
              <button
                onClick={() => {
                  setActiveTab("full order details");
                  setIsProductDetails(false);
                }}
                className={`px-6 py-2 rounded-lg font-medium cursor-pointer ${
                  activeTab === "full order details"
                    ? "bg-red-500 text-white"
                    : "bg-transparent text-[#00000080]"
                }`}
              >
                Full Order Details
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="">
            {activeTab === "track order" && <OrderOverview />}
            {activeTab === "full order details" && !isProductDetails && (
              <div className="mt-5">
                <div className="flex flex-row ">
                  <div>
                    <picture>
                      <img
                        className="w-35 h-35 rounded-l-2xl"
                        src={images.iphone}
                        alt=""
                      />
                    </picture>
                  </div>
                  <div className="bg-[#F9F9F9] flex flex-col p-3 w-full rounded-r-2xl gap-1">
                    <span className="text-black text-[17px]">
                      Iphone 16 pro max - Black
                    </span>
                    <span className="text-[#E53E3E] font-bold text-[17px]">
                      N2,500,000
                    </span>
                    <div className="flex flex-row justify-between items-center mt-3">
                      <div>
                        <span className="text-[#E53E3E] font-bold text-[17px]">
                          Qty :1
                        </span>
                      </div>
                      <div>
                        <button
                          onClick={() => {
                            setActiveTab("full order details");
                            setIsProductDetails(true);
                            setProductTab("overview");
                          }}
                          className="bg-[#E53E3E] rounded-lg text-white px-4 py-2 cursor-pointer"
                        >
                          Product Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-row mt-3">
                  <div>
                    <picture>
                      <img
                        className="w-35 h-35 rounded-l-2xl"
                        src={images.iphone}
                        alt=""
                      />
                    </picture>
                  </div>
                  <div className="bg-[#F9F9F9] flex flex-col p-3 w-full rounded-r-2xl gap-1">
                    <span className="text-black text-[17px]">
                      Iphone 16 pro max - Black
                    </span>
                    <span className="text-[#E53E3E] font-bold text-[17px]">
                      N2,500,000
                    </span>
                    <div className="flex flex-row justify-between items-center mt-3">
                      <div>
                        <span className="text-[#E53E3E] font-bold text-[17px]">
                          Qty :1
                        </span>
                      </div>
                      <div>
                        <button
                          onClick={() => {
                            setActiveTab("full order details");
                            setIsProductDetails(true);
                            setProductTab("overview");
                          }}
                          className="bg-[#E53E3E] rounded-lg text-white px-4 py-2 cursor-pointer"
                        >
                          Product Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="w-full mt-3">
                  <div className="bg-[#E53E3E] text-white text-xl font-semibold p-2 rounded-t-2xl">
                    Order Details
                  </div>
                  <div className="border border-[#CDCDCD] rounded-b-2xl">
                    <div className="flex flex-row border-b border-[#CDCDCD] gap-21 p-2">
                      <span className="text-[#00000080]">Order ID</span>
                      <span>ORD-1234DFEKFK</span>
                    </div>
                    <div className="flex flex-row border-b border-[#CDCDCD] gap-15 p-2">
                      <span className="text-[#00000080]">Store Name</span>
                      <span>Sasha Stores</span>
                    </div>
                    <div className="flex flex-row border-b border-[#CDCDCD] gap-16 p-2">
                      <span className="text-[#00000080]">No of items</span>
                      <span>2</span>
                    </div>
                    <div className="flex flex-row border-b border-[#CDCDCD] gap-10 p-2">
                      <span className="text-[#00000080]">Discount Code</span>
                      <span>NEW123</span>
                    </div>
                    <div className="flex flex-row border-b border-[#CDCDCD] gap-12 p-2">
                      <span className="text-[#00000080]">Loyalty Points</span>
                      <span>200</span>
                    </div>
                    <div className="flex flex-row gap-28 p-2">
                      <span className="text-[#00000080]">Date</span>
                      <span>July 19,2025 - 07:22AM</span>
                    </div>
                  </div>
                </div>

                <div className="w-full mt-3">
                  <div className="bg-[#E53E3E] text-white text-xl font-semibold p-2 rounded-t-2xl">
                    Delivery Details
                  </div>
                  <div className="border border-[#CDCDCD] rounded-b-2xl">
                    <div className="flex flex-row border-b border-[#CDCDCD] gap-9 p-2">
                      <span className="text-[#00000080]">Phone Number</span>
                      <span>0701234567</span>
                    </div>
                    <div className="flex flex-row border-b border-[#CDCDCD] gap-27 p-2">
                      <span className="text-[#00000080]">State</span>
                      <span>Lagos</span>
                    </div>
                    <div className="flex flex-row border-b border-[#CDCDCD] gap-28 p-2">
                      <span className="text-[#00000080]">LGA</span>
                      <span>Ikeja</span>
                    </div>
                    <div className="flex flex-row border-b border-[#CDCDCD] gap-21 p-2">
                      <span className="text-[#00000080]">Address</span>
                      <span>No 2, abcd street, ikeja</span>
                    </div>
                  </div>
                </div>

                <div className="w-full mt-3">
                  <div className="bg-[#E53E3E] text-white text-xl font-semibold p-2 rounded-t-2xl">
                    Price Details
                  </div>
                  <div className="border border-[#CDCDCD] rounded-b-2xl">
                    <div className="flex flex-row border-b border-[#CDCDCD] gap-17 p-2">
                      <span className="text-[#00000080]">Items Cost</span>
                      <span className="font-bold">N2,500,000</span>
                    </div>
                    <div className="flex flex-row border-b border-[#CDCDCD] gap-3 p-2">
                      <span className="text-[#00000080]">Coupon Discount</span>
                      <span className="font-bold">-N5,000</span>
                    </div>
                    <div className="flex flex-row border-b border-[#CDCDCD] gap-7 p-2">
                      <span className="text-[#00000080]">Points Discount</span>
                      <span className="font-bold">-N5,000</span>
                    </div>
                    <div className="flex flex-row border-b border-[#CDCDCD] gap-15 p-2">
                      <span className="text-[#00000080]">Delivery Fee</span>
                      <span className="font-bold">N10,000</span>
                    </div>
                    <div className="flex flex-row border-b border-[#CDCDCD] gap-28 p-2">
                      <span className="text-[#00000080]">Total</span>
                      <span className="font-bold">N2,500,000</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    className="flex-1 bg-[#E53E3E] text-white py-3 px-4 rounded-lg hover:bg-red-600 focus:outline-none transition-colors font-normal cursor-pointer"
                  >
                    View Chat
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-[#ffffff] text-[#00000080] py-3 px-4 rounded-lg border border-[#989898] focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 transition-colors font-normal cursor-pointer"
                  >
                    Delete Order
                  </button>
                </div>
              </div>
            )}
            {activeTab === "full order details" && isProductDetails && (
              <ProductDetails
                productTab={productTab}
                setProductTab={setProductTab}
                quantity={quantity}
                setQuantity={setQuantity}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default OrderDetails;
