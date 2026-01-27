import React, { useMemo, useState, useEffect } from "react";
import { useParams, useLocation, useSearchParams } from "react-router-dom";
import PageHeader from "../../../../components/PageHeader";
import { useQuery } from "@tanstack/react-query";
import { getSellerDetails } from "../../../../utils/queries/users";
import Activity from "../components/activity/activity";
import Orders from "../components/orders/orders";
import Chats from "../components/chats/chats";
import Transaction from "../components/transaction/transaction";
import SocialFeed from "../components/socialFeed/socialFeed";
import Products from "../components/products/products";
import Announcements from "../components/announcement/announcements";
import Others from "../components/others/others";

const StoreDetails: React.FC = () => {
  const { storeId } = useParams<{ storeId: string }>();
  const { state } = useLocation();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("Activity");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("All time");

  // Read tab parameter from URL and set active tab
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl) {
      // Capitalize first letter to match tab names
      const capitalizedTab = tabFromUrl.charAt(0).toUpperCase() + tabFromUrl.slice(1);
      setActiveTab(capitalizedTab);
    }
  }, [searchParams]);

  const { data: sellerDetails, isLoading, error } = useQuery({
    queryKey: ['sellerDetails', storeId],
    queryFn: () => getSellerDetails(storeId!),
    enabled: !!storeId,
    staleTime: 5 * 60 * 1000,
  });

  // Map API to existing userData shape expected by tabs
  const userData = useMemo(() => {
    if (sellerDetails?.data) {
      const d = sellerDetails.data;
      console.log('Raw API data:', d);
      console.log('Store profile image:', d.store_info?.profile_image);
      return {
        // Use the real store id for edit/update routes (Level1/2/3 update expect store_id)
        id: d.store_info?.id || d.user_info?.id || storeId,
        // Store user ID separately for wallet operations (top up/withdraw need user_id, not store_id)
        userId: d.user_info?.id || storeId,
        userName: d.user_info?.full_name || 'Unknown',
        email: d.user_info?.email || 'No email',
        phoneNumber: d.user_info?.phone || 'No phone number',
        walletBalance: d.financial_info?.store_wallet_balance?.formatted || 'N/A',
        escrowBalance: d.financial_info?.escrow_wallet_balance?.formatted || 'N/A',
        rewardBalance: d.financial_info?.reward_balance?.formatted || 'N/A',
        referralBalance: d.financial_info?.referral_balance?.formatted || 'N/A',
        loyaltyPoints: typeof d.financial_info?.loyalty_points === 'number' ? d.financial_info.loyalty_points : 'N/A',
        profileImage: d.store_info?.profile_image || null,
        bannerImage: d.store_info?.banner_image || null,
        storeName: d.store_info?.store_name || 'Unknown Store',
        storeEmail: d.store_info?.store_email || 'No email',
        storePhone: d.store_info?.store_phone || 'No phone',
        storeLocation: d.store_info?.store_location || 'No location',
        storeStatus: d.store_info?.status || 'Unknown',
        onboardingStatus: d.store_info?.onboarding_status || 'Unknown',
        themeColor: d.store_info?.theme_color || null,
        businessDetails: d.store_info?.business_details || null,
        addresses: d.store_info?.addresses || [],
        deliveryPricing: d.store_info?.delivery_pricing || [],
        socialLinks: d.store_info?.social_links || [],
        categories: d.store_info?.categories || [],
        isActive: !!d.user_info?.is_active,
        isVerified: !!d.user_info?.is_verified,
        createdAt: d.user_info?.account_creation || d.user_info?.created_at || 'N/A',
        created_at: d.user_info?.account_creation || d.user_info?.created_at || 'N/A',
        lastLogin: d.user_info?.last_login || 'N/A',
        last_login: d.user_info?.last_login || 'N/A',
        location: d.user_info?.location || 'N/A',
        username: d.user_info?.username || d.user_info?.user_name || 'N/A',
        stats: d.statistics || null,
        recentActivities: d.recent_activities || [],
      };
    }
    return (
      state || {
        id: storeId,
        userId: storeId, // Fallback: use storeId as userId if no state
        userName: "Unknown",
        email: "N/A",
        phoneNumber: "N/A",
        walletBalance: "N/A",
        escrowBalance: "N/A",
        rewardBalance: "N/A",
        referralBalance: "N/A",
        loyaltyPoints: "N/A",
        createdAt: 'N/A',
        lastLogin: 'N/A',
        location: 'N/A',
        username: 'N/A',
        recentActivities: [],
      }
    );
  }, [sellerDetails, state, storeId]);

  const tabs = [
    "Activity",
    "Orders",
    "Chats",
    "Transactions",
    "Social Feed",
    "Products",
    "Announcements",
    "Others",
  ];

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
    console.log("Period changed to:", period);
  };

  const TabButtons = () => (
    <div 
      className="flex items-center border border-[#989898] space-x-0.5 rounded-lg p-1 sm:p-1.5 md:p-2 w-full sm:w-fit bg-white overflow-x-auto tab-buttons-container" 
      style={{ 
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none'
      }}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab;
        return (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg font-normal transition-all duration-200 cursor-pointer whitespace-nowrap flex-shrink-0 ${isActive ? "px-2 sm:px-4 md:px-6 bg-[#E53E3E] text-white" : "px-2 sm:px-3 text-black"
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
        return <Activity userData={userData} storeId={storeId!} selectedPeriod={selectedPeriod} />;
      case "Orders":
        return <Orders />;
      case "Chats":
        return <Chats />;
      case "Transactions":
        return <Transaction />;
      case "Social Feed":
        return (
          <>
            {/* @ts-ignore ensure props pass-through for SocialFeed */}
            <SocialFeed
              storeUserId={storeId!}
              storePostStoreId={sellerDetails?.data?.store_info?.id}
            />
          </>
        );
      case "Products":
        return <Products />;
      case "Announcements":
        return <Announcements />;
      case "Others":
        return <Others />;
      default:
        return null;
    }
  };

  return (
    <div>
      <PageHeader
        title={
          <div className="flex flex-col gap-3 sm:gap-4 lg:flex-row lg:items-center lg:justify-between w-full">
            <div className="flex items-center text-base sm:text-lg md:text-xl lg:text-[20px] font-semibold">
              <span style={{ color: "#00000080" }} className="text-sm sm:text-base md:text-lg lg:text-[20px]">User Management</span>
              <span className="mx-1 sm:mx-2">/</span>
              <span className="text-black text-sm sm:text-base md:text-lg lg:text-[20px]">Store Details</span>
            </div>
            <div className="w-full sm:w-auto">
              <TabButtons />
            </div>
          </div>
        }
        onPeriodChange={handlePeriodChange}
        defaultPeriod={selectedPeriod}
        timeOptions={[
          "Today",
          "This Week",
          "This Month",
          "Last Month",
          "This Year",
          "All time",
        ]}
      />

      <div className="bg-[#F5F5F5] min-h-screen p-3 sm:p-4 md:p-5">
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E53E3E]"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-500">Failed to load seller details</div>
        ) : (
          <div className="mb-6">{renderTabContent()}</div>
        )}
      </div>
    </div>
  );
};

export default StoreDetails;
