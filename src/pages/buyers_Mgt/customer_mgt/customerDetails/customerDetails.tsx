import React, { useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import PageHeader from "../../../../components/PageHeader";
import Activity from "./activity/activity";
import Orders from "./orders/orders";
import Chats from "./chats/chats";
import Transaction from "./transaction/transaction";
import SocialFeed from "./socialFeed/socialFeed";
import { getUserProfile } from "../../../../utils/queries/users";

const CustomerDetails: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { state } = useLocation();
  const [activeTab, setActiveTab] = useState("Activity");

  // Fetch user profile data from API
  const { data: profileData, isLoading, error } = useQuery({
    queryKey: ['userProfile', userId],
    queryFn: () => getUserProfile(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Extract the user data from API response or fallback to state/local data
  const userData = profileData?.data || state || {
    id: userId,
    full_name: "Unknown",
    user_name: "Unknown",
    email: "No email",
    phone: "No phone number",
    wallet: { shopping_balance: "₦0", escrow_balance: "₦0" },
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
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E53E3E]"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="text-center text-red-500">
            <p className="text-lg font-semibold">Error loading user profile</p>
            <p className="text-sm">{error.message}</p>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case "Activity":
        return <Activity userData={userData} />;
      case "Orders":
        return <Orders userId={userId} />;
      case "Chats":
        return <Chats userId={userId} />;
      case "Transactions":
        return <Transaction userId={userId} />;
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
