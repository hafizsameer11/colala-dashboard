import PageHeader from "../../../components/PageHeader";
import StatCard from "../../../components/StatCard";
import StatCardGrid from "../../../components/StatCardGrid";
import { useState, useEffect, useRef, useMemo } from "react";
import images from "../../../constants/images";
import BulkActionDropdown from "../../../components/BulkActionDropdown";
import DateFilter from "../../../components/DateFilter";
import type { DateFilterState } from "../../../components/DateFilter";
import LatestOrders from "../customer_mgt/customerDetails/orders/latestOrders";
import useDebouncedValue from "../../../hooks/useDebouncedValue";
import { useQuery } from "@tanstack/react-query";
import { getBuyerOrders } from "../../../utils/queries/users";
import ChatsModel from "../../general/chats/components/chatmodel";

const OrdersMgt = () => {
  const [activeTab, setActiveTab] = useState("All");
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrders, setSelectedOrders] = useState<unknown[]>([]);
  const [dateFilter, setDateFilter] = useState<DateFilterState>({
    filterType: 'period',
    period: 'All time',
    dateFrom: null,
    dateTo: null,
  });
  const [showChatModal, setShowChatModal] = useState(false);
  const [selectedChatData, setSelectedChatData] = useState<{
    id: string | number;
    storeName: string;
    userName: string;
    lastMessage: string;
    chatDate: string;
    type: string;
    other: string;
    isUnread: boolean;
  } | null>(null);
  const debouncedQuery = useDebouncedValue(query, 400);

  // Map tab names to backend status values
  const getStatusFromTab = (tab: string): string | undefined => {
    const statusMap: { [key: string]: string } = {
      "All": undefined,
      "Order Placed": "placed",
      "Out for delivery": "out_for_delivery",
      "Delivered": "delivered",
      "Completed": "completed",
      "Disputed": "disputed",
      "Uncompleted": "uncompleted",
    };
    return statusMap[tab];
  };

  // Fetch buyer orders data from API
  const { data: ordersData, isLoading, error } = useQuery({
    queryKey: ['buyerOrders', currentPage, activeTab, dateFilter.period, dateFilter.dateFrom, dateFilter.dateTo, debouncedQuery],
    queryFn: () => getBuyerOrders(
      currentPage, 
      getStatusFromTab(activeTab), 
      dateFilter.filterType === 'period' ? dateFilter.period || undefined : undefined,
      debouncedQuery,
      false,
      dateFilter.filterType === 'custom' ? dateFilter.dateFrom || undefined : undefined,
      dateFilter.filterType === 'custom' ? dateFilter.dateTo || undefined : undefined
    ),
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes
  });

  const tabs = [
    "All",
    "Order Placed",
    "Out for delivery",
    "Delivered",
    "Completed",
    "Disputed",
    "Uncompleted",
  ];

  const handleUserSelection = (selectedIds: string[]) => {
    console.log("Selected user IDs:", selectedIds);
  };

  const TabButtons = () => (
    <div className="flex items-center border border-[#989898] rounded-lg p-1.5 sm:p-2 w-fit bg-white overflow-x-auto">
      {tabs.map((tab) => {
        const isActive = activeTab === tab;
        return (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg font-normal transition-all duration-200 cursor-pointer whitespace-nowrap ${
              isActive ? "px-4 sm:px-6 md:px-8 bg-[#E53E3E] text-white" : "px-2 sm:px-2.5 text-black"
            }`}
          >
            {tab}
          </button>
        );
      })}
    </div>
  );

  const handleBulkActionSelect = (action: string) => {
    console.log("Bulk action selected in Orders:", action);
    
    // Export actions are handled by BulkActionDropdown component internally
    // Only handle non-export actions here
    switch (action) {
      case "Delete": {
        if (selectedOrders.length === 0) {
          alert("Please select orders to perform this action");
          return;
        }
        if (confirm(`Are you sure you want to delete ${selectedOrders.length} order(s)?`)) {
          console.log("Deleting orders:", selectedOrders);
          // Add delete logic here
        }
        break;
      }
        
      default: {
        // Export actions (CSV/PDF) are handled by BulkActionDropdown
        console.log("Action handled by BulkActionDropdown:", action);
      }
    }
  };

  const handleSelectedOrdersChange = (orders: unknown[]) => {
    setSelectedOrders(orders);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset to page 1 when tab, search query, or date filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, debouncedQuery, dateFilter]);

  const handleViewChat = (orderId: string | number) => {
    console.log("Opening chat modal for order:", orderId);
    
    // Find the order data to get chat information
    const order = ordersData?.data?.store_orders?.data?.find((order: unknown) => {
      const orderObj = order as {
        id: string | number;
        chat?: {
          id: string | number;
          last_message?: string;
          is_dispute?: boolean;
        };
        store?: { name?: string };
        buyer?: { name?: string };
        order_date?: string;
      };
      return orderObj.id === orderId;
    });
    
    if (order) {
      const orderObj = order as {
        id: string | number;
        chat?: {
          id: string | number;
          last_message?: string;
          is_dispute?: boolean;
        };
        store?: { name?: string };
        buyer?: { name?: string };
        order_date?: string;
      };
      
      if (orderObj.chat) {
        // Create chat data object that matches the expected format
        const chatData = {
          id: orderObj.chat.id,
          storeName: orderObj.store?.name || 'Unknown Store',
          userName: orderObj.buyer?.name || 'Unknown User',
          lastMessage: orderObj.chat.last_message || 'No messages yet',
          chatDate: orderObj.order_date || 'Unknown Date',
          type: orderObj.chat.is_dispute ? 'Dispute' : 'Support',
          other: 'View Chat',
          isUnread: false
        };
        
        setSelectedChatData(chatData);
        setShowChatModal(true);
      } else {
        console.log("No chat found for order:", orderId);
        // You could show a toast notification here
      }
    } else {
      console.log("Order not found:", orderId);
    }
  };

  const handleCloseChatModal = () => {
    setShowChatModal(false);
    setSelectedChatData(null);
  };

  const handleDateFilterChange = (filter: DateFilterState) => {
    setDateFilter(filter);
    setCurrentPage(1);
  };

  // Orders are already filtered by backend based on selectedPeriod
  const allOrders = ordersData?.data?.store_orders?.data || [];
  const filteredOrders = allOrders;

  return (
    <>
      <PageHeader 
        title="Orders Management" 
        showDropdown={false}
      />

      <div className="p-3 sm:p-4 md:p-5">
        <StatCardGrid columns={3}>
          <StatCard
            icon={images.cycle}
            title="Total Orders"
            value={ordersData?.data?.summary_stats?.total_store_orders?.count || 0}
            subtitle={`+${ordersData?.data?.summary_stats?.total_store_orders?.increase || 0}% increase from last month`}
          />
          <StatCard
            icon={images.cycle}
            title="Pending Orders"
            value={ordersData?.data?.summary_stats?.pending_store_orders?.count || 0}
            subtitle={`+${ordersData?.data?.summary_stats?.pending_store_orders?.increase || 0}% increase from last month`}
          />
          <StatCard
            icon={images.cycle}
            title="Completed Orders"
            value={ordersData?.data?.summary_stats?.completed_store_orders?.count || 0}
            subtitle={`+${ordersData?.data?.summary_stats?.completed_store_orders?.increase || 0}% increase from last month`}
          />
        </StatCardGrid>
        <div className="mt-4 sm:mt-5 flex flex-col gap-3 sm:gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
            <div className="overflow-x-auto w-full sm:w-auto">
              <TabButtons />
            </div>
            <DateFilter
              defaultFilterType={dateFilter.filterType}
              defaultPeriod={dateFilter.period || 'All time'}
              defaultDateFrom={dateFilter.dateFrom}
              defaultDateTo={dateFilter.dateTo}
              onFilterChange={handleDateFilterChange}
            />
            <div>
              <BulkActionDropdown 
                onActionSelect={handleBulkActionSelect}
                selectedOrders={selectedOrders}
                orders={filteredOrders}
                dataType="orders"
                exportConfig={{
                  dataType: "orders",
                  status: getStatusFromTab(activeTab),
                  period: dateFilter.filterType === 'period' && dateFilter.period && dateFilter.period !== 'All time' ? dateFilter.period : undefined,
                  dateFrom: dateFilter.filterType === 'custom' ? dateFilter.dateFrom || undefined : undefined,
                  dateTo: dateFilter.filterType === 'custom' ? dateFilter.dateTo || undefined : undefined,
                  search: debouncedQuery && debouncedQuery.trim() ? debouncedQuery.trim() : undefined,
                }}
              />
            </div>
          </div>
          <div className="relative w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-12 pr-6 py-2.5 sm:py-3.5 border border-[#00000080] rounded-lg text-sm sm:text-[15px] w-full sm:w-[200px] md:w-[240px] focus:outline-none bg-white shadow-[0_2px_6px_rgba(0,0,0,0.05)] placeholder-[#00000080]"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>
        <div>
          <LatestOrders
            title="Latest Orders"
            onRowSelect={handleUserSelection}
            onSelectedOrdersChange={handleSelectedOrdersChange}
            activeTab={activeTab}
            searchQuery={debouncedQuery}
            orders={filteredOrders}
            pagination={ordersData?.data?.store_orders || null}
            onPageChange={handlePageChange}
            isLoading={isLoading}
            error={error?.message || null}
            onViewChat={handleViewChat}
          />
        </div>
      </div>

      {/* Chat Modal */}
      <ChatsModel 
        isOpen={showChatModal} 
        onClose={handleCloseChatModal} 
        chatData={selectedChatData}
        buyerPart={true}
      />
    </>
  );
};

export default OrdersMgt;
