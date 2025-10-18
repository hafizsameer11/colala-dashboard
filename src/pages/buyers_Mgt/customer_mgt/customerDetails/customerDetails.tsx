import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import PageHeader from "../../../../components/PageHeader";
import Activity from "./activity/activity";
import Orders from "./orders/orders";
import Chats from "./chats/chats";
import Transaction from "./transaction/transaction";
import SocialFeed from "./socialFeed/socialFeed";
import { getUserDetails } from "../../../../utils/queries/users";

const CustomerDetails: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { state } = useLocation();
  const [activeTab, setActiveTab] = useState("Activity");
  const [selectedChatId, setSelectedChatId] = useState<string | number | null>(null);

  // Handle activeTab from navigation state
  useEffect(() => {
    if (state?.activeTab) {
      setActiveTab(state.activeTab);
    }
  }, [state?.activeTab]);

  // Fetch user profile data from API
  const { data: profileData, isLoading, error } = useQuery({
    queryKey: ['userDetails', userId],
    queryFn: () => getUserDetails(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Transform API response to match component expectations
  const userData = profileData?.data ? {
    // Map user_info to top level
    id: profileData.data.user_info?.id || userId,
    full_name: profileData.data.user_info?.full_name || "Unknown",
    user_name: profileData.data.user_info?.user_name || "Unknown",
    email: profileData.data.user_info?.email || "No email",
    phone: profileData.data.user_info?.phone || "No phone",
    country: profileData.data.user_info?.country || "Unknown",
    state: profileData.data.user_info?.state || "Unknown",
    profile_picture: profileData.data.user_info?.profile_picture || null,
    last_login: profileData.data.user_info?.last_login || "Never",
    account_created_at: profileData.data.user_info?.created_at || "Unknown",
    loyalty_points: profileData.data.statistics?.total_loyalty_points || 0,
    is_blocked: profileData.data.user_info?.status === "blocked",
    role: profileData.data.user_info?.role || "buyer",

    // Map wallet_info
    wallet: {
      shopping_balance: profileData.data.wallet_info?.shopping_balance || "0",
      escrow_balance: profileData.data.wallet_info?.escrow_balance || "0",
    },

    // Map statistics
    statistics: profileData.data.statistics || {
      total_orders: 0,
      total_transactions: 0,
      total_loyalty_points: 0,
      total_spent: 0,
      average_order_value: 0,
    },

    // Map activities
    activities: profileData.data.activities || [],

    // Legacy fields for backward compatibility
    userName: profileData.data.user_info?.full_name || "Unknown",
    phoneNumber: profileData.data.user_info?.phone || "No phone",
    walletBalance: profileData.data.wallet_info?.shopping_balance || "0",
  } : state || {
    id: userId,
    full_name: "Unknown",
    user_name: "Unknown",
    email: "No email",
    phone: "No phone number",
    user_info: {
      full_name: "Unknown",
      email: "No email",
      phone: "No phone number",
    },
    wallet_info: {
      balance: "₦0",
      escrow_balance: "₦0",
    },
    store_info: {
      store_name: "No store",
    },
    statistics: {
      total_orders: 0,
      total_transactions: 0,
      total_loyalty_points: 0,
      total_spent: 0,
      average_order_value: 0,
    },
    activities: [],
    recent_orders: [],
    recent_transactions: [],
  };

  const tabs = ["Activity", "Orders", "Chats", "Transactions", "Social Feed"];

  const handlePeriodChange = (period: string) => {
    console.log("Period changed to:", period);
  };

  const handleViewChat = (orderId: string | number) => {
    console.log("Navigating to chat for order:", orderId);
    setSelectedChatId(orderId);
    setActiveTab("Chats");
  };

  const handleChatOpened = () => {
    console.log("Chat opened, clearing selectedChatId");
    setSelectedChatId(null);
  };

  const TabButtons = () => (
    <div className="flex items-center space-x-0.5 border border-[#989898] rounded-lg p-2 w-fit bg-white">
      {tabs.map((tab) => {
        const isActive = activeTab === tab;
        return (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-2 text-sm rounded-lg font-normal transition-all duration-200 cursor-pointer ${isActive ? "px-8 bg-[#E53E3E] text-white" : "px-4 text-black"
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
        return <Orders userId={userId} onViewChat={handleViewChat} />;
      case "Chats":
        return <Chats userId={userId} selectedChatId={selectedChatId} onChatOpened={handleChatOpened} />;
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
