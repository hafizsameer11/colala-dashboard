import images from "../constants/images";
import React, { useState } from "react";


// StatusDropdown component
const StatusDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("Change Status");

  const statusOptions = [
    "Order Placed",
    "Out for delivery",
    "Delivered",
    "Funds in Escrow Wallet",
    "Order Completed",
  ];

  const handleStatusSelect = (status: string) => {
    setSelectedStatus(status);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white border border-[#989898] rounded-lg px-4 py-4 text-left flex items-center justify-between hover:border-gray-400 focus:outline-none focus:border-blue-500 cursor-pointer"
      >
        <span className="text-[#00000080]">{selectedStatus}</span>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
          {statusOptions.map((status, index) => (
            <button
              key={index}
              onClick={() => handleStatusSelect(status)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50 border-b border-gray-100 last:border-b-0 first:rounded-t-lg last:rounded-b-lg cursor-pointer"
            >
              <span className="text-gray-700">{status}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

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
              className="p-2 rounded-md hover:bg-gray-100 cursor-pointer"
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

            <div className="flex items-center">
              <img className="w-10 h-10" src={images.cart} alt="Cart" />
            </div>
          </div>

          {/* Tab Content */}
          <div className="">
            {activeTab === "track order" && (
              <div className="mt-5">
                {/* Profile tab content goes here */}
                <div className="flex flex-col">
                  <div>
                    <span className="font-semibold text-xl">
                      Change Order Status
                    </span>
                  </div>
                  <div className="mt-4">
                    <StatusDropdown />
                  </div>

                  <div className="flex flex-row mt-5 gap-3">
                    <div>
                      <img className="w-8 h-8" src={images.tick} alt="" />
                    </div>
                    <div className=" flex-1">
                      <div className="bg-[#E53E3E] text-white text-xl font-semibold p-2 rounded-t-2xl">
                        Order Placed
                      </div>
                      <div className="border border-[#CDCDCD] rounded-b-2xl">
                        <div className="flex flex-row border-b border-[#CDCDCD] gap-15 p-2">
                          <span className="text-[#00000080]">Order ID</span>
                          <span>ORD-1234DFEKFK</span>
                        </div>
                        <div className="flex flex-row gap-15 p-2">
                          <span className="text-[#00000080]">Date</span>
                          <span>July 19,2025 - 07:22AM</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-row mt-5 gap-3">
                    <div>
                      <img className="w-8 h-8" src={images.tick} alt="" />
                    </div>
                    <div className=" flex-1">
                      <div className="bg-[#E53E3E] text-white text-xl font-semibold p-2 rounded-t-2xl">
                        Out for delivery
                      </div>
                      <div className="border border-[#CDCDCD] rounded-b-2xl">
                        <div className="flex flex-row border-b border-[#CDCDCD] gap-15 p-2">
                          <span className="text-[#00000080]">Order ID</span>
                          <span>ORD-1234DFEKFK</span>
                        </div>
                        <div className="flex flex-row gap-15 p-2">
                          <span className="text-[#00000080]">Date</span>
                          <span>July 19,2025 - 07:22AM</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-row mt-5 gap-3">
                    <div>
                      <img className="w-8 h-8" src={images.tick} alt="" />
                    </div>
                    <div className=" flex-1">
                      <div className="bg-[#E53E3E] text-white text-xl font-semibold p-2 rounded-t-2xl">
                        Delivered
                      </div>
                      <div className="border border-[#CDCDCD] rounded-b-2xl">
                        <div className="flex flex-row border-b border-[#CDCDCD] gap-15 p-2">
                          <span className="text-[#00000080]">Order ID</span>
                          <span>ORD-1234DFEKFK</span>
                        </div>
                        <div className="flex flex-row gap-15 p-2">
                          <span className="text-[#00000080]">Date</span>
                          <span>July 19,2025 - 07:22AM</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-row mt-5 gap-3">
                    <div>
                      <img className="w-8 h-8" src={images.tick} alt="" />
                    </div>
                    <div className=" flex-1">
                      <div className="bg-[#E53E3E] text-white text-xl font-semibold p-2 rounded-t-2xl">
                        Funds in Escrow Wallet
                      </div>
                      <div className="border border-[#CDCDCD] rounded-b-2xl">
                        <div className="flex flex-row border-b border-[#CDCDCD] gap-15 p-2">
                          <span className="text-[#00000080]">Order ID</span>
                          <span>ORD-1234DFEKFK</span>
                        </div>
                        <div className="flex flex-row gap-15 p-2">
                          <span className="text-[#00000080]">Date</span>
                          <span>July 19,2025 - 07:22AM</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-row mt-5 gap-3">
                    <div>
                      <img className="w-8 h-8" src={images.tick} alt="" />
                    </div>
                    <div className=" flex-1">
                      <div className="bg-[#E53E3E] text-white text-xl font-semibold p-2 rounded-t-2xl">
                        Order Completed
                      </div>
                      <div className="border border-[#CDCDCD] rounded-b-2xl">
                        <div className="flex flex-row border-b border-[#CDCDCD] gap-15 p-2">
                          <span className="text-[#00000080]">Order ID</span>
                          <span>ORD-1234DFEKFK</span>
                        </div>
                        <div className="flex flex-row gap-15 p-2">
                          <span className="text-[#00000080]">Date</span>
                          <span>July 19,2025 - 07:22AM</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
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
              <div className="mt-5">
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

                {/* Tab panels */}
                <div className="mt-5">
                  {productTab === "overview" && (
                    <div className="">
                    </div>
                  )}
                  {productTab === "description" && (
                    <div className="text-sm text-[#000000CC] space-y-2">
                      <p>
                        Crafted with aerospace‑grade materials for durability
                        and style. Long‑lasting battery life with fast charging
                        support.
                      </p>
                      <p>Includes: Phone, USB‑C cable, documentation.</p>
                    </div>
                  )}
                  {productTab === "reviews" && (
                    <div className="text-sm text-[#000000CC] space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="font-semibold">Sasha</div>
                        <div>
                          Excellent device, camera is amazing and battery lasts
                          all day.
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="font-semibold">Ethan</div>
                        <div>Worth the upgrade. Screen is super smooth.</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
