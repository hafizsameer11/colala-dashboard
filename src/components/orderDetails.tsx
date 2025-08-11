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
  //   const [showPassword, setShowPassword] = useState(false);
  //   const [showAddAddressForm, setShowAddAddressForm] = useState(false);

  //   // Form state
  //   const [formData, setFormData] = useState({
  //     username: "",
  //     fullName: "",
  //     email: "",
  //     phoneNumber: "",
  //     password: "",
  //   });

  //   // Address form state
  //   const [addressData, setAddressData] = useState({
  //     phoneNumber: "",
  //     state: "",
  //     localGovernment: "",
  //     fullAddress: "",
  //   });

  //   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //     const { name, value } = e.target;
  //     setFormData((prev) => ({
  //       ...prev,
  //       [name]: value,
  //     }));
  //   };

  //   const handleAddressInputChange = (
  //     e: React.ChangeEvent<
  //       HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
  //     >
  //   ) => {
  //     const { name, value } = e.target;
  //     setAddressData((prev) => ({
  //       ...prev,
  //       [name]: value,
  //     }));
  //   };

  //   const handleAddressSubmit = (e: React.FormEvent) => {
  //     e.preventDefault();
  //     console.log("Address submitted:", addressData);
  //     // Add your address submission logic here
  //     setShowAddAddressForm(false); // Hide form after submission
  //   };

  //   const handleSubmit = (e: React.FormEvent) => {
  //     e.preventDefault();
  //     console.log("Form submitted:", formData);
  //     // Add your form submission logic here
  //     // You can call an API, validate the data, etc.
  //     onClose(); // Close modal after submission
  //   };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 bg-[#00000080] bg-opacity-50 flex justify-end">
      <div className="bg-white w-[500px] relative h-full overflow-y-auto">
        {/* Header */}
        <div className="border-b border-[#787878] p-3 sticky top-0 bg-white z-10">
          <button
            onClick={onClose}
            className="absolute flex items-center right-3 cursor-pointer"
          >
            <img src={images.close} alt="Close" />
          </button>
          <h2 className="text-xl font-semibold">Order Details</h2>
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
                onClick={() => setActiveTab("full order details")}
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
            {activeTab === "full order details" && (
              <div className="mt-5">hi</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
