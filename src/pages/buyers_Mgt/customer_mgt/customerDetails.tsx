import React, { useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import PageHeader from "../../../components/PageHeader";
import Activity from "./activity";
import Orders from "./orders";
import Chats from "./chats";
import Transaction from "./transaction";
import SocialFeed from "./socialFeed";

const CustomerDetails: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { state } = useLocation();
  const [activeTab, setActiveTab] = useState("Activity");

  // Extract the user from the state (fallback in case it's missing)
  const userData = state || {
    id: userId,
    userName: "Unknown",
    email: "No email",
    phoneNumber: "No phone number",
    walletBalance: "₦0",
  };

  const tabs = ["Activity", "Orders", "Chats", "Transactions", "Social Feed"];

  const handlePeriodChange = (period: string) => {
    console.log("Period changed to:", period);
  };

  const TabButtons = () => (
    <div className="flex items-center space-x-0.5 border border-[#989898] rounded-lg p-2 w-fit bg-white">
      {tabs.map((tab) => {
        const isActive = activeTab === tab;
        return (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-2 text-sm rounded-lg font-normal transition-all duration-200 cursor-pointer ${
              isActive ? "px-8 bg-[#E53E3E] text-white" : "px-4 text-black"
            }`}
          >
            {tab}
          </button>
        );
      })}
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "Activity":
        return <Activity userData={userData} />;
      case "Orders":
        return <Orders />;
      case "Chats":
        return <Chats />;
      case "Transactions":
        return <Transaction />;
      case "Social Feed":
        return <SocialFeed />;
      default:
        return null;
    }
  };

  return (
    <div>
      <PageHeader
        title={
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-45 text-[20px] font-semibold">
            <div className="flex items-center gap-1">
              <span style={{ color: "#00000080" }}>User Management</span>
              <span className="mx-1">/</span>
              <span className="text-black">Customer Details</span>
            </div>
            <TabButtons />
          </div>
        }
        onPeriodChange={handlePeriodChange}
      />

      <div className="bg-[#F5F5F5] min-h-screen p-5">
        {/* Tab Content */}
        <div className="mb-6">{renderTabContent()}</div>
      </div>
    </div>
  );
};

export default CustomerDetails;
