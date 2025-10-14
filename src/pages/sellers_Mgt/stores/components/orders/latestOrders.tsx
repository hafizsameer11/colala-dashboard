import React, { useState, useEffect, useMemo } from "react";
import OrderDetails from "../../../Modals/orderDetails";
import { useParams } from "react-router-dom";

interface OrderUi {
  id: string;
  storeName: string;
  productName: string;
  price: string;
  orderDate: string;
  status: string;
}

interface LatestOrdersProps {
  title?: string;
  onRowSelect?: (selectedIds: string[]) => void;
  activeTab?: string;
  orders?: any[];
  isLoading?: boolean;
  error?: any;
  pagination?: any;
  onPageChange?: (page: number) => void;
}

const statusColors = (status: string) => {
  switch ((status || '').toLowerCase()) {
    case 'out_for_delivery':
    case 'out for delivery':
      return "text-[#0000FF] border border-[#0000FF] bg-[#0000FF1A] rounded-lg";
    case 'delivered':
      return "text-[#800080] border border-[#800080] bg-[#8000801A] rounded-lg";
    case 'placed':
    case 'order placed':
      return "text-[#E53E3E] border border-[#E53E3E] bg-[#E53E3E1A] rounded-lg";
    case 'uncompleted':
      return "text-[#000000] border border-[#000000] bg-[#0000001A] rounded-lg";
    case 'disputed':
      return "text-[#FF0000] border border-[#FF0000] bg-[#FF00001A] rounded-lg";
    case 'completed':
      return "text-[#008000] border border-[#008000] bg-[#0080001A] rounded-lg";
    case 'pending':
      return "text-[#1E90FF] border border-[#1E90FF] bg-[#1E90FF1A] rounded-lg";
    default:
      return "text-gray-600 border border-gray-400 bg-gray-100 rounded-lg";
  }
};

const LatestOrders: React.FC<LatestOrdersProps> = ({
  title = "Latest Orders",
  onRowSelect,
  activeTab = "All",
  orders = [],
  isLoading = false,
  error,
  pagination,
  onPageChange,
}) => {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const normalized: OrderUi[] = useMemo(() => {
    return (orders || []).map((o: any) => ({
      id: String(o.id),
      storeName: o.store_name || 'N/A',
      productName: (o.items && o.items[0]?.product_name) || 'N/A',
      price: o.total || 'N/A',
      orderDate: o.created_at || 'N/A',
      status: o.status || 'N/A',
    }));
  }, [orders]);
  const [showModal, setShowModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const { storeId } = useParams<{ storeId: string }>();

  // Filter orders based on active tab
  const filteredOrders = useMemo(() => {
    const tab = (activeTab || 'All').toLowerCase();
    if (tab === 'all') return normalized;
    return normalized.filter((o) => (o.status || '').toLowerCase() === tab);
  }, [normalized, activeTab]);

  // Reset selected rows when tab changes
  useEffect(() => {
    setSelectedRows([]);
    setSelectAll(false);
  }, [activeTab]);

  const handleSelectAll = () => {
    const allIds = filteredOrders.map((order) => order.id);
    const newSelection = selectAll ? [] : allIds;
    setSelectedRows(newSelection);
    setSelectAll(!selectAll);
    if (onRowSelect) onRowSelect(newSelection);
  };

  const handleRowSelect = (id: string) => {
    const isSelected = selectedRows.includes(id);
    const newSelection = isSelected
      ? selectedRows.filter((rowId) => rowId !== id)
      : [...selectedRows, id];
    setSelectedRows(newSelection);
    setSelectAll(newSelection.length === filteredOrders.length);
    if (onRowSelect) onRowSelect(newSelection);
  };

  const handleShowDetails = (order: OrderUi) => {
    setSelectedOrderId(order.id);
    setShowModal(true);
  };

  return (
    <div className="border border-gray-300 rounded-2xl mt-5">
      <div className="bg-white p-5 rounded-t-2xl font-semibold text-lg border-b border-gray-300">
        {title}
      </div>
      <div className="bg-white rounded-b-2xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E53E3E]"></div>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">Failed to load orders.</div>
        ) : (
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
            {filteredOrders.map((order) => (
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
                <td className="p-3 text-left">{order.productName}</td>
                <td className="p-3 font-bold">{order.price}</td>
                <td className="p-3">{order.orderDate}</td>
                <td className="p-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors(order.status)}`}>
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
                  <button className="bg-black hover:bg-gray-900 text-white px-4 py-2 rounded-lg cursor-pointer">
                    View Chat
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        )}
      </div>

      {pagination && pagination.last_page > 1 && (
        <div className="bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {((pagination.current_page - 1) * pagination.per_page) + 1} to {Math.min(pagination.current_page * pagination.per_page, pagination.total)} of {pagination.total} results
          </div>
          <div className="flex items-center space-x-2">
            <button onClick={() => onPageChange?.(pagination.current_page - 1)} disabled={pagination.current_page <= 1} className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Previous</button>
            {Array.from({ length: Math.min(5, pagination.last_page) }, (_, i) => {
              const pageNum = Math.max(1, Math.min(pagination.last_page - 4, pagination.current_page - 2)) + i;
              if (pageNum > pagination.last_page) return null;
              return (
                <button key={pageNum} onClick={() => onPageChange?.(pageNum)} className={`px-3 py-2 text-sm font-medium rounded-md ${pagination.current_page === pageNum ? 'bg-[#E53E3E] text-white' : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'}`}>{pageNum}</button>
              );
            })}
            <button onClick={() => onPageChange?.(pagination.current_page + 1)} disabled={pagination.current_page >= pagination.last_page} className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrderId && (
        <OrderDetails 
          isOpen={showModal} 
          onClose={() => setShowModal(false)} 
          userId={storeId} 
          orderId={selectedOrderId}
        />
      )}
    </div>
  );
};

export default LatestOrders;
