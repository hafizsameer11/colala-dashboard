import React, { useState } from "react";
import images from "../../../constants/images";

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

// Timeline Item component for reusability
interface TimelineItemProps {
  title: string;
  orderId: string;
  date: string;
}

const TimelineItem: React.FC<TimelineItemProps> = ({
  title,
  orderId,
  date,
}) => {
  return (
    <div className="flex flex-row mt-5 gap-3">
      <div>
        <img className="w-8 h-8" src={images.tick} alt="" />
      </div>
      <div className="flex-1">
        <div className="bg-[#E53E3E] text-white text-xl font-semibold p-2 rounded-t-2xl">
          {title}
        </div>
        <div className="border border-[#CDCDCD] rounded-b-2xl">
          <div className="flex flex-row border-b border-[#CDCDCD] gap-15 p-2">
            <span className="text-[#00000080]">Order ID</span>
            <span>{orderId}</span>
          </div>
          <div className="flex flex-row gap-15 p-2">
            <span className="text-[#00000080]">Date</span>
            <span>{date}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const OrderOverview: React.FC = () => {
  const timelineData = [
    {
      title: "Order Placed",
      orderId: "ORD-1234DFEKFK",
      date: "July 19,2025 - 07:22AM",
    },
    {
      title: "Out for delivery",
      orderId: "ORD-1234DFEKFK",
      date: "July 19,2025 - 07:22AM",
    },
    {
      title: "Delivered",
      orderId: "ORD-1234DFEKFK",
      date: "July 19,2025 - 07:22AM",
    },
    {
      title: "Funds in Escrow Wallet",
      orderId: "ORD-1234DFEKFK",
      date: "July 19,2025 - 07:22AM",
    },
    {
      title: "Order Completed",
      orderId: "ORD-1234DFEKFK",
      date: "July 19,2025 - 07:22AM",
    },
  ];

  return (
    <div className="mt-5">
      <div className="flex flex-col">
        <div>
          <span className="font-semibold text-xl">Change Order Status</span>
        </div>
        <div className="mt-4">
          <StatusDropdown />
        </div>

        {/* Timeline */}
        {timelineData.map((item, index) => (
          <TimelineItem
            key={index}
            title={item.title}
            orderId={item.orderId}
            date={item.date}
          />
        ))}
      </div>
    </div>
  );
};

export default OrderOverview;
