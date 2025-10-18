import PageHeader from "../../../components/PageHeader";
import StatCard from "../../../components/StatCard";
import StatCardGrid from "../../../components/StatCardGrid";
import { useState } from "react";
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

  // Fetch buyer orders data from API
  const { data: ordersData, isLoading, error } = useQuery({
    queryKey: ['buyerOrders', currentPage],
    queryFn: () => getBuyerOrders(currentPage),
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
    <div className="flex items-center border border-[#989898] rounded-lg p-2 w-fit bg-white">
      {tabs.map((tab) => {
        const isActive = activeTab === tab;
        return (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-2 text-sm rounded-lg font-normal transition-all duration-200 cursor-pointer ${
              isActive ? "px-8 bg-[#E53E3E] text-white" : "px-2.5 text-black"
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
  };

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

  return (
    <>
      <PageHeader title="Orders Management" />

      <div className="p-5">
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
        <div className="mt-5 flex flex-row gap-2">
          <div>
            <TabButtons />
          </div>
          <div className="flex flex-row items-center gap-5 border border-[#989898] rounded-lg px-4 py-2 bg-white cursor-pointer">
            <div>Today</div>
            <div>
              <img className="w-3 h-3 mt-1" src={images.dropdown} alt="" />
            </div>
          </div>
          <div>
            <BulkActionDropdown 
              onActionSelect={handleBulkActionSelect}
              selectedOrders={selectedOrders}
              orders={ordersData?.data?.store_orders?.data || []}
              dataType="orders"
            />
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-12 pr-6 py-3.5 border border-[#00000080] rounded-lg text-[15px] w-[240px] focus:outline-none bg-white shadow-[0_2px_6px_rgba(0,0,0,0.05)] placeholder-[#00000080]"
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
            orders={ordersData?.data?.store_orders?.data || []}
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
