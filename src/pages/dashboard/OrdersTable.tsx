import React, { useMemo, useState } from "react";
import { formatCurrency } from "../../utils/formatCurrency";

interface Order {
  id: string | number;
  store_name?: string;
  buyer_name?: string;
  product_name?: string;
  price?: string;
  order_date?: string;
  status?: string;
  status_color?: string;
  // Legacy fields for backward compatibility
  storeName?: string;
  buyerName?: string;
  productName?: string;
  orderDate?: string;
}

interface OrdersTableProps {
  title?: string;
  onRowSelect?: (selectedIds: string[]) => void;
  onSelectedOrdersChange?: (selectedOrders: Order[]) => void;
  filterStatus?: string; // e.g., "All", "placed", "delivered"
  searchTerm?: string; // debounced term from parent
  orders?: Order[]; // Real orders data from API
  onViewDetails?: (orderId: string | number) => void; // Handler for viewing order details
}

const OrdersTable: React.FC<OrdersTableProps> = ({
  title = "Latest Orders",
  onRowSelect,
  onSelectedOrdersChange,
  filterStatus = "All",
  searchTerm = "",
  orders = [],
  onViewDetails,
}) => {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  // Helper function to normalize order data
  const normalizeOrder = (order: any): Order => {
    // Extract status_color from the raw order object
    // API sends it as "status_color" (snake_case), handle both formats
    // Access it directly from the raw object to ensure we get it
    const rawStatusColor = (order && typeof order === 'object')
      ? (order.status_color || order.statusColor || order['status_color'])
      : undefined;

    // Clean and validate status_color
    let statusColor: string | undefined = undefined;
    if (rawStatusColor !== undefined && rawStatusColor !== null) {
      const colorStr = String(rawStatusColor).trim();
      if (colorStr !== "" && colorStr !== "undefined" && colorStr !== "null") {
        statusColor = colorStr;
      }
    }

    return {
      id: order.id,
      storeName: order.store_name || order.storeName || 'Unknown Store',
      buyerName: order.buyer_name || order.buyerName || 'Unknown Buyer',
      productName: order.product_name || order.productName || 'Unknown Product',
      price: order.price || '₦0.00',
      orderDate: order.order_date || order.orderDate || 'Unknown Date',
      status: order.status || 'Unknown Status',
      status_color: statusColor, // Preserve status_color from API - this is critical!
    };
  };

  // Memoize normalized orders to prevent infinite loops
  const normalizedOrders = useMemo(() => {
    return orders.map(normalizeOrder);
  }, [orders]);

  // FILTER + SEARCH (case-insensitive includes on key fields)
  const filteredOrders = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return normalizedOrders
      .filter((o) => {
        if (filterStatus === "All") {
          // Exclude completed orders from "All" tab - they should only show in "Completed" tab
          const orderStatus = o.status?.toLowerCase() || '';
          return !orderStatus.includes('completed');
        }
        return o.status?.toLowerCase() === filterStatus.toLowerCase();
      })
      .filter((o) => {
        if (!term) return true;
        const haystack = [
          o.storeName,
          o.buyerName,
          o.productName,
          o.price,
          o.orderDate,
          o.status,
        ]
          .join(" ")
          .toLowerCase();
        return haystack.includes(term);
      });
  }, [normalizedOrders, filterStatus, searchTerm]);

  // when filter/search changes, reset select-all to reflect current view
  React.useEffect(() => {
    setSelectAll(false);
    // Clear selections that are no longer in the filtered view
    // We calculate filtered IDs here to avoid dependency on filteredOrders array reference
    const term = searchTerm.toLowerCase();
    const currentFilteredIds = normalizedOrders
      .filter((o) => {
        if (filterStatus === "All") {
          // Exclude completed orders from "All" tab - they should only show in "Completed" tab
          const orderStatus = o.status?.toLowerCase() || '';
          return !orderStatus.includes('completed');
        }
        return o.status?.toLowerCase() === filterStatus.toLowerCase();
      })
      .filter((o) => {
        if (!term) return true;
        const haystack = [
          o.storeName,
          o.buyerName,
          o.productName,
          o.price,
          o.orderDate,
          o.status,
        ]
          .join(" ")
          .toLowerCase();
        return haystack.includes(term);
      })
      .map((o) => String(o.id));
    
    setSelectedRows((prev) => prev.filter((id) => currentFilteredIds.includes(id)));
  }, [filterStatus, searchTerm, normalizedOrders]);

  // Remove the problematic useEffect hooks that cause infinite loops
  // We'll handle the selection in the event handlers instead

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRows([]);
      onRowSelect?.([]);
      if (onSelectedOrdersChange) {
        onSelectedOrdersChange([]);
      }
    } else {
      const visibleIds = filteredOrders.map((o) => String(o.id));
      setSelectedRows(visibleIds);
      onRowSelect?.(visibleIds);
      if (onSelectedOrdersChange) {
        onSelectedOrdersChange(filteredOrders);
      }
    }
    setSelectAll(!selectAll);
  };

  const handleRowSelect = (orderId: string | number) => {
    const orderIdStr = String(orderId);
    let newSelectedRows: string[];
    if (selectedRows.includes(orderIdStr)) {
      newSelectedRows = selectedRows.filter((id) => id !== orderIdStr);
    } else {
      newSelectedRows = [...selectedRows, orderIdStr];
    }
    setSelectedRows(newSelectedRows);
    setSelectAll(newSelectedRows.length === filteredOrders.length);

    // Call parent functions directly
    onRowSelect?.(newSelectedRows);
    if (onSelectedOrdersChange) {
      const selectedOrders = filteredOrders.filter(order =>
        newSelectedRows.includes(String(order.id))
      );
      onSelectedOrdersChange(selectedOrders);
    }
  };

  // Helper function to format status text for display
  const formatStatusText = (status: Order["status"]): string => {
    if (!status) return "Unknown Status";
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  // Map status_color from API to CSS classes
  const getStatusColorStyle = (statusColor?: string): string | null => {
    if (!statusColor || statusColor.trim() === "") return null;

    const colorLower = statusColor.toLowerCase().trim();
    switch (colorLower) {
      case "gray":
      case "grey":
        return "bg-gray-100 text-gray-600 border border-gray-300";
      case "purple":
        return "bg-[#8000801A] text-[#800080] border border-[#800080]";
      case "blue":
        return "bg-[#1E90FF1A] text-[#1E90FF] border border-[#1E90FF]";
      case "green":
        return "bg-[#0080001A] text-[#008000] border border-[#008000]";
      case "red":
        return "bg-[#E53E3E1A] text-[#E53E3E] border border-[#E53E3E]";
      case "orange":
        return "bg-[#FFA5001A] text-[#FFA500] border border-[#FFA500]";
      case "brown":
        return "bg-[#8B45131A] text-[#8B4513] border border-[#8B4513]";
      default:
        return null;
    }
  };

  const getStatusStyle = (status: Order["status"], statusColor?: string): string => {
    // CRITICAL: Always prioritize status_color from API - it's the source of truth
    // EXCEPTION: If the API returns "gray" or "grey", we might want to override it 
    // because it's often used as a default for statuses that should have color (like accepted/paid)

    // Check if status_color exists and is valid
    if (statusColor !== undefined && statusColor !== null && statusColor !== "") {
      const colorStr = String(statusColor).trim().toLowerCase();

      // Only proceed if it's a non-empty string and not "undefined" or "null"
      if (colorStr !== "" && colorStr !== "undefined" && colorStr !== "null") {
        // If it's NOT gray/grey, use it immediately. 
        // If it IS gray, we'll fall through to the status check to see if we have a better specific color.
        if (colorStr !== "gray" && colorStr !== "grey") {
          const colorStyle = getStatusColorStyle(colorStr);
          if (colorStyle) {
            return colorStyle;
          }
        }
      }
    }

    // Fallback: Use status-based styling
    const statusLower = status?.toLowerCase().trim() || "";

    // Handle statuses with underscores and variations
    if (statusLower.includes("pending_acceptance") || statusLower === "pending_acceptance" || statusLower === "pending acceptance") {
      return "bg-[#FFA5001A] text-[#FFA500] border border-[#FFA500]"; // Orange/Yellow for pending acceptance
    }
    if (statusLower.includes("out_for_delivery") || statusLower === "out_for_delivery" || statusLower === "out for delivery") {
      return "bg-[#1E90FF1A] text-[#1E90FF] border border-[#1E90FF]"; // Blue for out_for_delivery
    }
    if (statusLower === "accepted" || (statusLower.includes("accepted") && !statusLower.includes("pending"))) {
      return "bg-[#0080001A] text-[#008000] border border-[#008000]"; // Green for accepted
    }
    if (statusLower === "paid" || statusLower.includes("paid")) {
      return "bg-[#0080001A] text-[#008000] border border-[#008000]"; // Green for paid
    }
    if (statusLower === "delivered") {
      return "bg-[#8000801A] text-[#800080] border border-[#800080]"; // Purple for delivered
    }

    // Handle standard statuses
    switch (statusLower) {
      case "placed":
        return "bg-[#E53E3E1A] text-[#E53E3E] border border-[#E53E3E]";
      case "pending":
        return "bg-[#FFA5001A] text-[#FFA500] border border-[#FFA500]"; // Orange/Yellow for pending
      case "completed":
        return "bg-[#0080001A] text-[#008000] border border-[#008000]";
      case "disputed":
        return "bg-[#FFA5001A] text-[#FFA500] border border-[#FFA500]";
      default:
        // If we fell through to here and had a gray color from API, use it now
        if (statusColor && (statusColor.toLowerCase() === "gray" || statusColor.toLowerCase() === "grey")) {
          return "bg-gray-100 text-gray-600 border border-gray-300";
        }
        // Default to grey if status is unknown
        return "bg-gray-100 text-gray-600 border border-gray-300";
    }
  };

  return (
    <div className="border border-[#989898] rounded-2xl mt-4 md:mt-5">
      <div className="bg-white p-3 sm:p-4 md:p-5 rounded-t-2xl font-semibold text-sm sm:text-base md:text-[16px] border-b border-[#989898]">
        {title}
      </div>
      <div className="bg-white rounded-b-2xl overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead className="bg-[#F2F2F2]">
            <tr>
              <th className="text-center p-2 sm:p-3 font-semibold text-xs sm:text-sm md:text-[14px] w-10 sm:w-12">
                <input
                  type="checkbox"
                  checked={
                    selectAll &&
                    filteredOrders.length > 0 &&
                    selectedRows.length === filteredOrders.length
                  }
                  onChange={handleSelectAll}
                  className="w-4 h-4 sm:w-5 sm:h-5 border border-gray-300 rounded cursor-pointer"
                />
              </th>
              <th className="text-center p-2 sm:p-3 font-semibold text-xs sm:text-sm md:text-[14px]">
                Store Name
              </th>
              <th className="text-center p-2 sm:p-3 font-semibold text-xs sm:text-sm md:text-[14px]">
                Buyer Name
              </th>
              <th className="text-center p-2 sm:p-3 font-semibold text-xs sm:text-sm md:text-[14px]">
                Product Name
              </th>
              <th className="text-center p-2 sm:p-3 font-semibold text-xs sm:text-sm md:text-[14px]">
                Price
              </th>
              <th className="text-center p-2 sm:p-3 font-semibold text-xs sm:text-sm md:text-[14px] hidden md:table-cell">
                Order Date
              </th>
              <th className="text-center p-2 sm:p-3 font-semibold text-xs sm:text-sm md:text-[14px]">
                Status
              </th>
              <th className="text-center p-2 sm:p-3 font-semibold text-xs sm:text-sm md:text-[14px]">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order, index) => (
              <tr
                key={order.id}
                className={`border-t border-[#E5E5E5] transition-colors ${index === filteredOrders.length - 1 ? "" : "border-b"
                  }`}
              >
                <td className="p-2 sm:p-3 md:p-4 text-center">
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(String(order.id))}
                    onChange={() => handleRowSelect(order.id)}
                    className="w-4 h-4 sm:w-5 sm:h-5 border border-gray-300 rounded cursor-pointer"
                  />
                </td>
                <td className="p-2 sm:p-3 md:p-4 text-xs sm:text-sm md:text-[14px] text-black text-center">
                  <span className="truncate block max-w-[100px] sm:max-w-none">{order.storeName}</span>
                </td>
                <td className="p-2 sm:p-3 md:p-4 text-xs sm:text-sm md:text-[14px] text-black text-center">
                  <span className="truncate block max-w-[100px] sm:max-w-none">{order.buyerName}</span>
                </td>
                <td className="p-2 sm:p-3 md:p-4 text-xs sm:text-sm md:text-[14px] text-black text-center">
                  <span className="truncate block max-w-[120px] sm:max-w-[200px] md:max-w-none">{order.productName}</span>
                </td>
                <td className="p-2 sm:p-3 md:p-4 text-xs sm:text-sm md:text-[14px] font-semibold text-black text-center">
                  {formatCurrency(order.price)}
                </td>
                <td className="p-2 sm:p-3 md:p-4 text-xs sm:text-sm md:text-[14px] text-black text-center hidden md:table-cell">
                  {order.orderDate}
                </td>
                <td className="p-2 sm:p-3 md:p-4 text-center">
                  <div className="flex flex-col items-center gap-1">
                    <span
                      className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-md text-[10px] sm:text-[11px] md:text-[12px] font-medium ${getStatusStyle(
                        order.status || "",
                        order.status_color
                      )}`}
                    >
                      {formatStatusText(order.status || "")}
                    </span>
                    <span className="text-[9px] sm:text-[10px] text-gray-500 md:hidden">
                      {order.orderDate}
                    </span>
                  </div>
                </td>
                <td className="p-2 sm:p-3 md:p-4 text-center">
                  <button
                    onClick={() => onViewDetails?.(order.id)}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 bg-[#E53E3E] text-white text-xs sm:text-sm rounded-lg hover:bg-red-600 transition-colors font-medium cursor-pointer"
                  >
                    View Detail
                  </button>
                </td>
              </tr>
            ))}

            {filteredOrders.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="p-6 text-center text-sm text-gray-500"
                >
                  No orders found for "{searchTerm}"{" "}
                  {filterStatus !== "All" ? `in ${filterStatus}` : ""}.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div >
  );
};

export default OrdersTable;
