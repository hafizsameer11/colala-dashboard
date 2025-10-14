import React, { useState, useEffect, useMemo } from "react";
import OrderDetails from "../Modals/orderDetails";

interface ApiOrder {
  store_order_id: number;
  order_number: string;
  store_name: string;
  seller_name: string;
  customer_name: string;
  status: string;
  items_count: number;
  total_amount: string;
  created_at: string;
  formatted_date: string;
}

interface Order {
  id: string;
  orderNumber: string;
  storeName: string;
  sellerName: string;
  customerName: string;
  status: string;
  itemsCount: number;
  totalAmount: string;
  orderDate: string;
  formattedDate: string;
}

interface LatestOrdersProps {
  title?: string;
  onRowSelect?: (selectedIds: string[]) => void;
  activeTab?: string;
  searchTerm?: string;
  orders?: ApiOrder[];
  isLoading?: boolean;
  error?: any;
  pagination?: { current_page: number; last_page: number; total: number; per_page: number };
  currentPage?: number;
  onPageChange?: (page: number) => void;
  onStatusUpdate?: (storeOrderId: string, statusData: any) => void;
}

const statusColors: Record<string, string> = {
  "out_for_delivery":
    "text-[#0000FF] border border-[#0000FF] bg-[#0000FF1A] rounded-lg",
  "delivered": "text-[#800080] border border-[#800080] bg-[#8000801A] rounded-lg",
  "placed":
    "text-[#E53E3E] border border-[#E53E3E] bg-[#E53E3E1A] rounded-lg",
  "pending":
    "text-[#000000] border border-[#000000] bg-[#0000001A] rounded-lg",
  "disputed": "text-[#FF0000] border border-[#FF0000] bg-[#FF00001A] rounded-lg",
  "completed": "text-[#008000] border border-[#008000] bg-[#0080001A] rounded-lg",
};

const LatestOrders: React.FC<LatestOrdersProps> = ({
  title = "Latest Orders",
  onRowSelect,
  activeTab = "All",
  searchTerm = "",
  orders = [],
  isLoading = false,
  error,
  pagination,
  currentPage = 1,
  onPageChange,
  onStatusUpdate,
}) => {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Normalize API data to UI format
  const normalizedOrders: Order[] = useMemo(() => {
    return orders.map((order: ApiOrder) => ({
      id: order.store_order_id.toString(),
      orderNumber: order.order_number,
      storeName: order.store_name,
      sellerName: order.seller_name,
      customerName: order.customer_name,
      status: order.status,
      itemsCount: order.items_count,
      totalAmount: order.total_amount,
      orderDate: order.created_at,
      formattedDate: order.formatted_date,
    }));
  }, [orders]);

  // Combine tab filter + search filter
  const filteredOrders = useMemo(() => {
    const base =
      activeTab === "All"
        ? normalizedOrders
        : normalizedOrders.filter((o) => o.status === activeTab);
    const q = searchTerm.trim().toLowerCase();
    if (!q) return base;
    return base.filter((o) =>
      [o.storeName, o.sellerName, o.customerName, o.orderNumber, o.status]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [normalizedOrders, activeTab, searchTerm]);

  // Reset selection when tab or search changes
  useEffect(() => {
    setSelectedRows([]);
    setSelectAll(false);
  }, [activeTab, searchTerm]);

  const handleSelectAll = () => {
    const allIds = filteredOrders.map((order) => order.id);
    const newSelection = selectAll ? [] : allIds;
    setSelectedRows(newSelection);
    setSelectAll(!selectAll);
    onRowSelect?.(newSelection);
  };

  const handleRowSelect = (id: string) => {
    const isSelected = selectedRows.includes(id);
    const newSelection = isSelected
      ? selectedRows.filter((rowId) => rowId !== id)
      : [...selectedRows, id];
    setSelectedRows(newSelection);
    setSelectAll(newSelection.length === filteredOrders.length);
    onRowSelect?.(newSelection);
  };

  const handleShowDetails = () => setShowModal(true);

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
                  checked={selectAll && filteredOrders.length > 0}
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
                <td colSpan={7} className="p-6 text-center text-gray-500">
                  Loading orders...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-red-500">
                  Error loading orders. Please try again.
                </td>
              </tr>
            ) : filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-gray-500">
                  No orders found.
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
                      checked={selectedRows.includes(order.id)}
                      onChange={() => handleRowSelect(order.id)}
                      className="w-5 h-5"
                    />
                  </td>
                  <td className="p-3 text-left">{order.storeName}</td>
                  <td className="p-3 text-left">{order.customerName}</td>
                  <td className="p-3 font-bold">₦{parseFloat(order.totalAmount).toLocaleString()}</td>
                  <td className="p-3">{order.formattedDate}</td>
                  <td className="p-3">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        statusColors[order.status] || statusColors["pending"]
                      }`}
                    >
                      {order.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="p-3 space-x-2">
                    <button
                      onClick={() => {
                        setSelectedOrder(order);
                        setShowModal(true);
                      }}
                      className="bg-[#E53E3E] hover:bg-red-600 text-white px-6 py-2 rounded-lg cursor-pointer"
                    >
                      Details
                    </button>
                    <button className="bg-black hover:bg-gray-900 text-white px-4 py-2 rounded-lg cursor-pointer">
                      View Chat
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.last_page > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            onClick={() => onPageChange && onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="px-4 py-2">
            Page {currentPage} of {pagination.last_page}
          </span>
          <button
            onClick={() => onPageChange && onPageChange(currentPage + 1)}
            disabled={currentPage === pagination.last_page}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      <OrderDetails 
        isOpen={showModal} 
        onClose={() => setShowModal(false)}
        orderId={selectedOrder?.id}
        onStatusUpdate={onStatusUpdate}
      />
    </div>
  );
};

export default LatestOrders;
