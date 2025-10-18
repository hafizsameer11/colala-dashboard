import React, { useState, useEffect, useMemo } from "react";
import BuyerOrderDetails from "../../../../../components/buyerOrderDetails";

interface Order {
  id: string | number;
  order_no?: string;
  store_name?: string;
  product_name?: string;
  price?: string;
  order_date?: string;
  status?: string;
  status_color?: string;
  // Legacy fields for backward compatibility
  storeName?: string;
  productName?: string;
  orderDate?: string;
}

interface LatestOrdersProps {
  title?: string;
  onRowSelect?: (selectedIds: string[]) => void;
  onSelectedOrdersChange?: (selectedOrders: Order[]) => void;
  activeTab?: string;
  searchQuery?: string;
  orders?: Order[];
  pagination?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  onPageChange?: (page: number) => void;
  isLoading?: boolean;
  error?: string | null;
  userId?: string | number;
  onViewChat?: (orderId: string | number) => void;
}

const getStatusStyle = (status?: string) => {
  switch (status?.toLowerCase()) {
    case "placed":
      return "text-[#E53E3E] border border-[#E53E3E] bg-[#E53E3E1A] rounded-lg";
    case "pending":
      return "text-[#1E90FF] border border-[#1E90FF] bg-[#1E90FF1A] rounded-lg";
    case "out_for_delivery":
      return "text-[#0000FF] border border-[#0000FF] bg-[#0000FF1A] rounded-lg";
    case "delivered":
      return "text-[#800080] border border-[#800080] bg-[#8000801A] rounded-lg";
    case "completed":
      return "text-[#008000] border border-[#008000] bg-[#0080001A] rounded-lg";
    default:
      return "text-gray-600 border border-gray-300 bg-gray-100 rounded-lg";
  }
};

const LatestOrders: React.FC<LatestOrdersProps> = ({
  title = "Latest Orders",
  onRowSelect,
  onSelectedOrdersChange,
  activeTab = "All",
  searchQuery = "",
  orders = [],
  isLoading = false,
  error = null,
  onViewChat,
}) => {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  // Normalize orders data from API
  const normalizeOrder = (order: Order): Order => ({
    id: order.id,
    order_no: order.order_no || 'N/A',
    store_name: order.store_name || 'Unknown Store',
    product_name: order.product_name || 'Unknown Product',
    price: order.price || '₦0.00',
    order_date: order.order_date || 'Unknown Date',
    status: order.status || 'Unknown Status',
    status_color: order.status_color,
    // Legacy fields for backward compatibility
    storeName: order.store_name || 'Unknown Store',
    productName: order.product_name || 'Unknown Product',
    orderDate: order.order_date || 'Unknown Date',
  });

  // Debug: Log the orders data
  console.log('LatestOrders - orders data:', orders);
  console.log('LatestOrders - first order:', orders[0]);
  
  const normalizedOrders = orders.map(normalizeOrder);
  console.log('LatestOrders - normalized orders:', normalizedOrders);

  // 1) Filter by tab
  const byTab = useMemo(() => {
    return activeTab === "All"
      ? normalizedOrders
      : normalizedOrders.filter((o) => o.status?.toLowerCase() === activeTab.toLowerCase());
  }, [normalizedOrders, activeTab]);

  // 2) Filter by search (case-insensitive)
  const filteredOrders = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return byTab;
    return byTab.filter((o) =>
      [o.store_name, o.product_name, o.price, o.order_date, o.order_no].some((field) =>
        field?.toLowerCase().includes(q)
      )
    );
  }, [byTab, searchQuery]);

  // Reset selection when tab or search changes
  useEffect(() => {
    setSelectedRows([]);
    setSelectAll(false);
  }, [activeTab, searchQuery]);

  const handleSelectAll = () => {
    const visibleIds = filteredOrders.map((o) => String(o.id));
    const allSelected = visibleIds.every((id) => selectedRows.includes(id));
    const newSelection = allSelected
      ? selectedRows.filter((id) => !visibleIds.includes(id))
      : Array.from(new Set([...selectedRows, ...visibleIds]));
    setSelectedRows(newSelection);
    setSelectAll(!allSelected);
    onRowSelect?.(newSelection);
    
    // Call onSelectedOrdersChange with actual order objects
    if (onSelectedOrdersChange) {
      const selectedOrders = filteredOrders.filter(order => 
        newSelection.includes(String(order.id))
      );
      onSelectedOrdersChange(selectedOrders);
    }
  };

  const handleRowSelect = (id: string) => {
    const isSelected = selectedRows.includes(id);
    const newSelection = isSelected
      ? selectedRows.filter((rowId) => rowId !== id)
      : [...selectedRows, id];
    setSelectedRows(newSelection);
    setSelectAll(
      filteredOrders.length > 0 &&
        filteredOrders.every((o) => newSelection.includes(String(o.id)))
    );
    onRowSelect?.(newSelection);
    
    // Call onSelectedOrdersChange with actual order objects
    if (onSelectedOrdersChange) {
      const selectedOrders = filteredOrders.filter(order => 
        newSelection.includes(String(order.id))
      );
      onSelectedOrdersChange(selectedOrders);
    }
  };

  const [showModal, setShowModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | number | null>(null);

  const handleShowDetails = (order: Order) => {
    setSelectedOrderId(order.id);
    setShowModal(true);
  };

  const handleViewChat = (order: Order) => {
    if (onViewChat) {
      onViewChat(order.id);
    }
  };

  return (
    <div className="border border-gray-300 rounded-2xl mt-5">
      <div className="bg-white p-5 rounded-t-2xl font-semibold text-lg border-b border-gray-300">
        {title}
      </div>

      <div className="bg-white rounded-b-2xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#F2F2F2]">
            <tr className="text-center">
              <th className="p-3 text-left font-semibold">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                  className="w-5 h-5"
                />
              </th>
              <th className="p-3 text-left font-semibold">Store Name</th>
              <th className="p-3 text-left font-semibold">Product Name</th>
              <th className="p-3 text-center font-semibold">Price</th>
              <th className="p-3 text-center font-semibold">Order Date</th>
              <th className="p-3 text-center font-semibold">Status</th>
              <th className="p-3 text-center font-semibold">Other</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7} className="p-6 text-center">
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E53E3E]"></div>
                  </div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-red-500">
                  <p className="text-sm">Error loading orders</p>
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr
                  key={order.id}
                  className="text-center border-t border-gray-200"
                >
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(String(order.id))}
                      onChange={() => handleRowSelect(String(order.id))}
                      className="w-5 h-5"
                    />
                  </td>
                  <td className="p-3 text-left">{order.store_name}</td>
                  <td className="p-3 text-left">{order.product_name}</td>
                  <td className="p-3 font-bold">{order.price}</td>
                  <td className="p-3">{order.order_date}</td>
                  <td className="p-3">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusStyle(order.status)}`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="p-3 space-x-2">
                    <button
                      onClick={() => handleShowDetails(order)}
                      className="bg-[#E53E3E] hover:bg-red-600 text-white px-6 py-2 rounded-lg cursor-pointer"
                    >
                      Details
                    </button>
                    <button 
                      onClick={() => handleViewChat(order)}
                      className="bg-black hover:bg-gray-900 text-white px-4 py-2 rounded-lg cursor-pointer"
                    >
                      View Chat
                    </button>
                  </td>
                </tr>
              ))
            )}
            {!isLoading && !error && filteredOrders.length === 0 && (
              <tr>
                <td colSpan={7} className="p-6 text-center text-gray-500">
                  No orders found for "{searchQuery}".
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedOrderId && (
        <BuyerOrderDetails 
          isOpen={showModal} 
          onClose={() => {
            setShowModal(false);
            setSelectedOrderId(null);
          }}
          orderId={selectedOrderId}
        />
      )}
    </div>
  );
};

export default LatestOrders;
