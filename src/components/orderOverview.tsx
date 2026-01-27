import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { bulkActionBuyerOrders } from "../utils/queries/users";
import { useToast } from "../contexts/ToastContext";
import { usePermissions } from "../hooks/usePermissions";
import images from "../constants/images";

interface OrderData {
  order_no?: string | number;
  status?: string;
  tracking?: Array<{
    status: string;
    created_at: string;
  }>;
  created_at?: string;
}

interface OrderOverviewProps {
  orderData?: OrderData;
}

// StatusDropdown component
interface StatusDropdownProps {
  orderData?: OrderData;
  onStatusChange?: () => void;
}

const StatusDropdown: React.FC<StatusDropdownProps> = ({ orderData, onStatusChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("Change Status");
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { hasPermission } = usePermissions();
  
  // Check permissions for actions
  const canUpdateStatus = hasPermission('buyer_orders.update_status') || hasPermission('seller_orders.update_status');
  const canDelete = hasPermission('buyer_orders.delete') || hasPermission('seller_orders.delete');

  // Status mapping from UI to backend values
  const statusMapping: Record<string, string> = {
    "Order Placed": "placed",
    "Out for delivery": "out_for_delivery", 
    "Delivered": "delivered",
    "Funds in Escrow Wallet": "escrow",
    "Order Completed": "completed",
  };

  const statusOptions = [
    "Order Placed",
    "Out for delivery", 
    "Delivered",
    "Funds in Escrow Wallet",
    "Order Completed",
  ];

  // Quick action handlers
  const handleMarkCompleted = () => {
    if (!orderData?.order_no) {
      showToast('Order ID not found', 'error');
      return;
    }
    
    bulkActionMutation.mutate({
      orderIds: [String(orderData.order_no)],
      action: 'mark_completed'
    });
  };

  const handleMarkDisputed = () => {
    if (!orderData?.order_no) {
      showToast('Order ID not found', 'error');
      return;
    }
    
    bulkActionMutation.mutate({
      orderIds: [String(orderData.order_no)],
      action: 'mark_disputed'
    });
  };

  const handleDeleteOrder = () => {
    if (!orderData?.order_no) {
      showToast('Order ID not found', 'error');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this order?')) {
      bulkActionMutation.mutate({
        orderIds: [String(orderData.order_no)],
        action: 'delete'
      });
    }
  };

  // Bulk action mutation
  const bulkActionMutation = useMutation({
    mutationFn: ({ orderIds, action, status }: { 
      orderIds: string[], 
      action: 'update_status' | 'mark_completed' | 'mark_disputed' | 'delete',
      status?: string 
    }) => bulkActionBuyerOrders(orderIds, action, status),
    onSuccess: (_, variables) => {
      const actionMessages = {
        update_status: 'Order status updated successfully',
        mark_completed: 'Order marked as completed',
        mark_disputed: 'Order marked as disputed',
        delete: 'Order deleted successfully'
      };
      showToast(actionMessages[variables.action], 'success');
      
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['buyerOrders'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['orderDetails'] });
      
      // Call parent callback if provided
      onStatusChange?.();
    },
    onError: (error) => {
      console.error('Bulk action error:', error);
      showToast('Failed to update order status', 'error');
    },
  });

  const handleStatusSelect = (status: string) => {
    if (!orderData?.order_no) {
      showToast('Order ID not found', 'error');
      return;
    }

    const backendStatus = statusMapping[status];
    if (!backendStatus) {
      showToast('Invalid status selected', 'error');
      return;
    }

    setSelectedStatus(status);
    setIsOpen(false);

    // Call the API to update the order status
    bulkActionMutation.mutate({
      orderIds: [String(orderData.order_no)],
      action: 'update_status',
      status: backendStatus
    });
  };

  // Don't show status dropdown if user can't update status
  if (!canUpdateStatus) {
    return (
      <div className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-4 text-center">
        <span className="text-gray-500 text-sm">View only - No permission to update status</span>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      <button
        onClick={() => !bulkActionMutation.isPending && setIsOpen(!isOpen)}
        disabled={bulkActionMutation.isPending}
        className={`w-full bg-white border border-[#989898] rounded-lg px-4 py-4 text-left flex items-center justify-between hover:border-gray-400 focus:outline-none focus:border-blue-500 cursor-pointer ${
          bulkActionMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        <span className="text-[#00000080]">
          {bulkActionMutation.isPending ? 'Updating...' : selectedStatus}
        </span>
        {bulkActionMutation.isPending ? (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-400"></div>
        ) : (
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
        )}
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

      {/* Quick Action Buttons - Only show if user has permissions */}
      {(canUpdateStatus || canDelete) && (
        <div className="mt-4 flex flex-wrap gap-2">
          {canUpdateStatus && (
            <>
              <button
                onClick={handleMarkCompleted}
                disabled={bulkActionMutation.isPending}
                className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-3 py-2 rounded text-sm font-medium"
              >
                Mark Completed
              </button>
              <button
                onClick={handleMarkDisputed}
                disabled={bulkActionMutation.isPending}
                className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-400 text-white px-3 py-2 rounded text-sm font-medium"
              >
                Mark Disputed
              </button>
            </>
          )}
          {canDelete && (
            <button
              onClick={handleDeleteOrder}
              disabled={bulkActionMutation.isPending}
              className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white px-3 py-2 rounded text-sm font-medium"
            >
              Delete Order
            </button>
          )}
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
  isCompleted?: boolean;
}

const TimelineItem: React.FC<TimelineItemProps> = ({
  title,
  orderId,
  date,
  isCompleted = false,
}) => {
  return (
    <div className="flex flex-row mt-5 gap-3">
      <div>
        {isCompleted ? (
          <img className="w-8 h-8" src={images.tick} alt="" />
        ) : (
          <div className="w-8 h-8 rounded-full border-2 border-gray-300 bg-white flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-gray-300"></div>
          </div>
        )}
      </div>
      <div className="flex-1">
        <div className={`text-white text-xl font-semibold p-2 rounded-t-2xl ${
          isCompleted ? 'bg-[#E53E3E]' : 'bg-gray-400'
        }`}>
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

const OrderOverview: React.FC<OrderOverviewProps> = ({ orderData }) => {
  // Define the complete tracking timeline
  const allTrackingSteps = [
    { key: "pending", title: "Pending", order: 1 },
    { key: "placed", title: "Order Placed", order: 2 },
    { key: "out_for_delivery", title: "Out for delivery", order: 3 },
    { key: "delivered", title: "Delivered", order: 4 },
    { key: "escrow", title: "Funds in Escrow Wallet", order: 5 },
    { key: "completed", title: "Order Completed", order: 6 },
  ];

  // Get current order status
  const currentStatus = orderData?.status || "pending";
  
  // Determine which steps to show based on current status
  const getTimelineSteps = () => {
    const currentStep = allTrackingSteps.find(step => step.key === currentStatus);
    const currentOrder = currentStep?.order || 1;
    
    // Show steps up to current status, plus escrow if delivered or completed
    const stepsToShow = allTrackingSteps.filter(step => {
      if (step.order <= currentOrder) return true;
      if (currentStatus === "delivered" && step.key === "escrow") return true;
      if (currentStatus === "completed" && step.key === "escrow") return true;
      return false;
    });

    return stepsToShow.map(step => {
      const trackingEvent = orderData?.tracking?.find(event => event.status === step.key);
      return {
        title: step.title,
        orderId: String(orderData?.order_no || "N/A"),
        date: trackingEvent?.created_at || orderData?.created_at || "N/A",
        isCompleted: step.order <= currentOrder || (step.key === "escrow" && (currentStatus === "delivered" || currentStatus === "completed"))
      };
    });
  };

  const timelineData = getTimelineSteps();

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
        {timelineData.map((item, index) => (
          <TimelineItem
            key={index}
            title={item.title}
            orderId={item.orderId}
            date={item.date}
            isCompleted={item.isCompleted}
          />
        ))}
      </div>
    </div>
  );
};

export default OrderOverview;
