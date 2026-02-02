import PageHeader from "../../../components/PageHeader";
import StatCard from "../../../components/StatCard";
import StatCardGrid from "../../../components/StatCardGrid";
import { useState, useEffect, useRef, useMemo } from "react";
import images from "../../../constants/images";
import BulkActionDropdown from "../../../components/BulkActionDropdown";
import LatestOrders from "../customer_mgt/customerDetails/orders/latestOrders";
import useDebouncedValue from "../../../hooks/useDebouncedValue";
import { useQuery } from "@tanstack/react-query";
import { getBuyerOrders } from "../../../utils/queries/users";
import Papa from 'papaparse';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import ChatsModel from "../../general/chats/components/chatmodel";

const OrdersMgt = () => {
  const [activeTab, setActiveTab] = useState("All");
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrders, setSelectedOrders] = useState<unknown[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<string>("All time");
  const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);
  const dateDropdownRef = useRef<HTMLDivElement>(null);
  const [showChatModal, setShowChatModal] = useState(false);
  
  // Date period options matching PageHeader
  const datePeriodOptions = [
    "Today",
    "This Week",
    "Last Month",
    "Last 6 Months",
    "Last Year",
    "All time",
  ];
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
    queryKey: ['buyerOrders', currentPage, activeTab, selectedPeriod, debouncedQuery],
    queryFn: () => getBuyerOrders(currentPage, getStatusFromTab(activeTab), selectedPeriod, debouncedQuery),
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
    
    if (selectedOrders.length === 0) {
      alert("Please select orders to perform this action");
      return;
    }

    switch (action) {
      case "Export as CSV": {
        // Export selected orders to CSV
        const csvData = selectedOrders.map((order: unknown) => {
          const orderObj = order as {
            id: string | number;
            order_no?: string;
            buyer?: { name?: string };
            store?: { name?: string };
            product?: { name?: string };
            status?: string;
            order_date?: string;
            pricing?: { subtotal_with_shipping?: string };
          };
          return {
            'Order ID': orderObj.id,
            'Order No': orderObj.order_no || 'N/A',
            'Buyer Name': orderObj.buyer?.name || 'N/A',
            'Store Name': orderObj.store?.name || 'N/A',
            'Product Name': orderObj.product?.name || 'N/A',
            'Status': orderObj.status || 'N/A',
            'Order Date': orderObj.order_date || 'N/A',
            'Total Price': orderObj.pricing?.subtotal_with_shipping || 'N/A'
          };
        });
        
        const csv = Papa.unparse(csvData);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `orders_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        break;
      }
        
      case "Export as PDF": {
        // Export selected orders to PDF
        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text('Orders Report', 14, 22);
        
        const headers = ['Order ID', 'Order No', 'Buyer Name', 'Store Name', 'Product Name', 'Status', 'Order Date'];
        const tableData = selectedOrders.map((order: unknown) => {
          const orderObj = order as {
            id: string | number;
            order_no?: string;
            buyer?: { name?: string };
            store?: { name?: string };
            product?: { name?: string };
            status?: string;
            order_date?: string;
          };
          return [
            orderObj.id,
            orderObj.order_no || 'N/A',
            orderObj.buyer?.name || 'N/A',
            orderObj.store?.name || 'N/A',
            orderObj.product?.name || 'N/A',
            orderObj.status || 'N/A',
            orderObj.order_date || 'N/A'
          ];
        });
        
        (doc as unknown as { autoTable: (options: unknown) => void }).autoTable({
          head: [headers],
          body: tableData,
          startY: 30,
          styles: { fontSize: 8 },
          headStyles: { fillColor: [229, 62, 62] }
        });
        
        doc.save(`orders_${new Date().toISOString().split('T')[0]}.pdf`);
        break;
      }
        
      case "Delete": {
        if (confirm(`Are you sure you want to delete ${selectedOrders.length} order(s)?`)) {
          console.log("Deleting orders:", selectedOrders);
          // Add delete logic here
        }
        break;
      }
        
      default: {
        console.log("Unknown action:", action);
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

  // Reset to page 1 when tab or search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, debouncedQuery]);

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

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
    setCurrentPage(1);
  };
  
  // Handle local date dropdown toggle
  const handleDateDropdownToggle = () => {
    setIsDateDropdownOpen(!isDateDropdownOpen);
  };
  
  // Handle local date period selection
  const handleDatePeriodSelect = (period: string) => {
    setSelectedPeriod(period);
    setIsDateDropdownOpen(false);
    setCurrentPage(1);
  };
  
  // Close date dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dateDropdownRef.current && !dateDropdownRef.current.contains(event.target as Node)) {
        setIsDateDropdownOpen(false);
      }
    };

    if (isDateDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDateDropdownOpen]);

  // Orders are already filtered by backend based on selectedPeriod
  const allOrders = ordersData?.data?.store_orders?.data || [];
  const filteredOrders = allOrders;

  return (
    <>
      <PageHeader 
        title="Orders Management" 
        onPeriodChange={handlePeriodChange} 
        defaultPeriod={selectedPeriod}
        timeOptions={datePeriodOptions}
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
        <div className="mt-4 sm:mt-5 flex flex-col sm:flex-row gap-2 sm:gap-2">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-2">
            <div className="overflow-x-auto w-full sm:w-auto">
              <TabButtons />
            </div>
            <div className="relative" ref={dateDropdownRef}>
              <div 
                className="flex flex-row items-center gap-3 sm:gap-5 border border-[#989898] rounded-lg px-3 sm:px-4 py-2 sm:py-2 bg-white cursor-pointer text-xs sm:text-sm hover:bg-gray-50 transition-colors"
                onClick={handleDateDropdownToggle}
              >
                <div>{selectedPeriod}</div>
                <img 
                  className={`w-3 h-3 mt-1 transition-transform ${isDateDropdownOpen ? 'rotate-180' : ''}`} 
                  src={images.dropdown} 
                  alt="" 
                />
              </div>
              {isDateDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 bg-white rounded-lg border border-[#989898] py-2 w-44 z-50 shadow-lg">
                  {datePeriodOptions.map((option) => (
                    <div
                      key={option}
                      onClick={() => handleDatePeriodSelect(option)}
                      className={`px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer transition-colors ${
                        selectedPeriod === option ? "bg-gray-100 font-semibold" : ""
                      }`}
                    >
                      {option}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <BulkActionDropdown 
                onActionSelect={handleBulkActionSelect}
                selectedOrders={selectedOrders}
                orders={filteredOrders}
                dataType="orders"
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
