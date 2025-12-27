import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateOrderStatus } from "../../../utils/queries/users";
import { useToast } from "../../../contexts/ToastContext";
import images from "../../../constants/images";

interface OrderOverviewProps {
  orderData?: any;
}

// StatusDropdown component
const StatusDropdown: React.FC<{ orderData?: any }> = ({ orderData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  // Reverse mapping from backend status to UI display
  const reverseStatusMapping: Record<string, string> = {
    "pending": "Pending",
    "processing": "Processing",
    "shipped": "Shipped",
    "out_for_delivery": "Out for delivery",
    "delivered": "Delivered",
    "completed": "Order Completed",
    "disputed": "Disputed",
    "cancelled": "Cancelled",
    // Legacy support for old status values
    "placed": "Pending", // Map old "placed" to "Pending"
  };

  // Status mapping from UI display to backend API values
  // API accepts: pending, processing, shipped, out_for_delivery, delivered, completed, disputed, cancelled
  const statusMapping: Record<string, string> = {
    "Pending": "pending",
    "Processing": "processing",
    "Shipped": "shipped",
    "Out for delivery": "out_for_delivery",
    "Delivered": "delivered",
    "Order Completed": "completed",
    "Disputed": "disputed",
    "Cancelled": "cancelled",
  };

  const statusOptions = [
    "Pending",
    "Processing",
    "Shipped",
    "Out for delivery",
    "Delivered",
    "Order Completed",
    "Disputed",
    "Cancelled",
  ];

  // Get current status display text
  const currentStatus = orderData?.status 
    ? (reverseStatusMapping[orderData.status] || orderData.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()))
    : "Change Status";

  // Update order status mutation
  const updateStatusMutation = useMutation({
    mutationFn: (statusData: { status: string; notes?: string; delivery_code?: string }) => {
      // Get the store order ID (this is what the API expects for /admin/orders/{storeOrderId}/status)
      const storeOrderId = orderData?.id || 
                           orderData?.store_order_id || 
                           orderData?.storeOrderId ||
                           orderData?.order_id;
      if (!storeOrderId) {
        console.error('Order data:', orderData);
        throw new Error('Store Order ID not found in order data');
      }
      return updateOrderStatus(storeOrderId, statusData);
    },
    onMutate: async (statusData) => {
      // Cancel any outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: ['adminOrderDetails'] });
      await queryClient.cancelQueries({ queryKey: ['dashboard'] });

      // Snapshot the previous values
      const previousDashboard = queryClient.getQueryData(['dashboard']);

      // Optimistically update the dashboard cache (latest orders)
      queryClient.setQueryData(['dashboard'], (old: any) => {
        if (!old?.data?.latest_orders) return old;
        
        const storeOrderId = orderData?.id || 
                             orderData?.store_order_id || 
                             orderData?.storeOrderId ||
                             orderData?.order_id;
        
        return {
          ...old,
          data: {
            ...old.data,
            latest_orders: old.data.latest_orders.map((order: any) => {
              // Match by order ID or store_order_id
              if (order.id === storeOrderId || order.store_order_id === storeOrderId || order.order_id === storeOrderId) {
                return {
                  ...order,
                  status: statusData.status
                };
              }
              return order;
            })
          }
        };
      });

      // Return context with snapshotted values
      return { previousDashboard };
    },
    onSuccess: () => {
      // Invalidate all related queries for real-time updates
      queryClient.invalidateQueries({ queryKey: ['adminOrderDetails'] });
      queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
      queryClient.invalidateQueries({ queryKey: ['sellerOrders'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] }); // This is the key fix!
      queryClient.invalidateQueries({ queryKey: ['latest-orders'] });
      showToast('Order status updated successfully', 'success');
      setIsOpen(false);
    },
    onError: (error: any, variables, context) => {
      // Rollback to previous values on error
      if (context?.previousDashboard) {
        queryClient.setQueryData(['dashboard'], context.previousDashboard);
      }
      
      console.error('Failed to update order status:', error);
      const errorMessage = error?.data?.message || error?.message || 'Failed to update order status';
      showToast(errorMessage, 'error');
    },
  });

  const handleStatusSelect = (status: string) => {
    const backendStatus = statusMapping[status];
    if (!backendStatus) {
      showToast('Invalid status selected', 'error');
      return;
    }

    // Get the store order ID (this is what the API expects)
    const storeOrderId = orderData?.id || 
                         orderData?.store_order_id || 
                         orderData?.storeOrderId ||
                         orderData?.order_id;
    
    if (!storeOrderId) {
      console.error('Order data:', orderData);
      showToast('Order ID not found. Please refresh and try again.', 'error');
      return;
    }

    setIsOpen(false);

    // Call the API to update the order status
    updateStatusMutation.mutate({
      status: backendStatus,
    });
  };

  return (
    <div className="relative w-full">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white border border-[#989898] rounded-lg px-4 py-4 text-left flex items-center justify-between hover:border-gray-400 focus:outline-none focus:border-blue-500 cursor-pointer"
      >
        <span className="text-[#00000080]">{currentStatus}</span>
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
  deliveryCode?: string;
  notes?: string;
}

const TimelineItem: React.FC<TimelineItemProps> = ({
  title,
  orderId,
  date,
  deliveryCode,
  notes,
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
          <div className="flex flex-row border-b border-[#CDCDCD] gap-15 p-2">
            <span className="text-[#00000080]">Date</span>
            <span>{date}</span>
          </div>
          {deliveryCode && (
            <div className="flex flex-row border-b border-[#CDCDCD] gap-15 p-2">
              <span className="text-[#00000080]">Delivery Code</span>
              <span className="font-semibold text-blue-600">{deliveryCode}</span>
            </div>
          )}
          {notes && (
            <div className="flex flex-row gap-15 p-2">
              <span className="text-[#00000080]">Notes</span>
              <span className="text-sm">{notes}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface OrderOverviewProps { orderData?: any }
const OrderOverview: React.FC<OrderOverviewProps> = ({ orderData }) => {
  const timelineData = (orderData?.tracking || []).map((t: any) => ({
    title: t.status?.replaceAll('_',' ') || 'Status',
    orderId: orderData?.order_no || 'N/A',
    date: t.created_at || 'N/A',
    deliveryCode: t.delivery_code || null,
    notes: t.notes || null,
  }));
  const fallbackTimeline = [
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
          <StatusDropdown orderData={orderData} />
        </div>

        {/* Timeline */}
        {(timelineData.length ? timelineData : fallbackTimeline).map((item, index) => (
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
