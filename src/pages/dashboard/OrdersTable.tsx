import React, { useMemo, useState, useEffect } from "react";

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
}

const OrdersTable: React.FC<OrdersTableProps> = ({
  title = "Latest Orders",
  onRowSelect,
  onSelectedOrdersChange,
  filterStatus = "All",
  searchTerm = "",
  orders = [],
}) => {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  // Helper function to normalize order data
  const normalizeOrder = (order: Order): Order => ({
    id: order.id,
    storeName: order.store_name || order.storeName || 'Unknown Store',
    buyerName: order.buyer_name || order.buyerName || 'Unknown Buyer',
    productName: order.product_name || order.productName || 'Unknown Product',
    price: order.price || '₦0.00',
    orderDate: order.order_date || order.orderDate || 'Unknown Date',
    status: order.status || 'Unknown Status',
  });

  // Use real orders data or fallback to empty array
  const normalizedOrders = orders.map(normalizeOrder);

  // FILTER + SEARCH (case-insensitive includes on key fields)
  const filteredOrders = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return normalizedOrders
      .filter((o) => {
        if (filterStatus === "All") {
          return true;
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
    // optionally also clear selections not in the current view
    setSelectedRows((prev) =>
      prev.filter((id) => filteredOrders.some((o) => o.id === id))
    );
  }, [filterStatus, searchTerm]); // eslint-disable-line

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
      const visibleIds = filteredOrders.map((o) => o.id);
      setSelectedRows(visibleIds);
      onRowSelect?.(visibleIds);
      if (onSelectedOrdersChange) {
        onSelectedOrdersChange(filteredOrders);
      }
    }
    setSelectAll(!selectAll);
  };

  const handleRowSelect = (orderId: string) => {
    let newSelectedRows: string[];
    if (selectedRows.includes(orderId)) {
      newSelectedRows = selectedRows.filter((id) => id !== orderId);
    } else {
      newSelectedRows = [...selectedRows, orderId];
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

  const getStatusStyle = (status: Order["status"]) => {
    switch (status?.toLowerCase()) {
      case "placed":
        return "bg-[#E53E3E1A] text-[#E53E3E] border border-[#E53E3E]";
      case "pending":
        return "bg-[#1E90FF1A] text-[#1E90FF] border border-[#1E90FF]";
      case "delivered":
        return "bg-[#8000801A] text-[#800080] border border-[#800080]";
      case "completed":
        return "bg-[#0080001A] text-[#008000] border border-[#008000]";
      case "disputed":
        return "bg-[#FFA5001A] text-[#FFA500] border border-[#FFA500]";
      default:
        return "bg-gray-100 text-gray-600 border border-gray-300";
    }
  };

  return (
    <div className="border border-[#989898] rounded-2xl mt-5">
      <div className="bg-white p-5 rounded-t-2xl font-semibold text-[16px] border-b border-[#989898]">
        {title}
      </div>
      <div className="bg-white rounded-b-2xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#F2F2F2]">
            <tr>
              <th className="text-center p-3 font-semibold text-[14px] w-12">
                <input
                  type="checkbox"
                  checked={
                    selectAll &&
                    filteredOrders.length > 0 &&
                    selectedRows.length === filteredOrders.length
                  }
                  onChange={handleSelectAll}
                  className="w-5 h-5 border border-gray-300 rounded cursor-pointer"
                />
              </th>
              <th className="text-center p-3 font-semibold text-[14px]">
                Store Name
              </th>
              <th className="text-center p-3 font-semibold text-[14px]">
                Buyer Name
              </th>
              <th className="text-center p-3 font-semibold text-[14px]">
                Product Name
              </th>
              <th className="text-center p-3 font-semibold text-[14px]">
                Price
              </th>
              <th className="text-center p-3 font-semibold text-[14px]">
                Order Date
              </th>
              <th className="text-center p-3 font-semibold text-[14px]">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order, index) => (
              <tr
                key={order.id}
                className={`border-t border-[#E5E5E5] transition-colors ${
                  index === filteredOrders.length - 1 ? "" : "border-b"
                }`}
              >
                <td className="p-4 text-center">
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(order.id)}
                    onChange={() => handleRowSelect(order.id)}
                    className="w-5 h-5 border border-gray-300 rounded cursor-pointer"
                  />
                </td>
                <td className="p-4 text-[14px] text-black text-center">
                  {order.storeName}
                </td>
                <td className="p-4 text-[14px] text-black text-center">
                  {order.buyerName}
                </td>
                <td className="p-4 text-[14px] text-black text-center">
                  {order.productName}
                </td>
                <td className="p-4 text-[14px] font-semibold text-black text-center">
                  {order.price}
                </td>
                <td className="p-4 text-[14px] text-black text-center">
                  {order.orderDate}
                </td>
                <td className="p-4 text-center">
                  <span
                    className={`px-3 py-1 rounded-md text-[12px] font-medium ${getStatusStyle(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </span>
                </td>
              </tr>
            ))}

            {filteredOrders.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="p-6 text-center text-sm text-gray-500"
                >
                  No orders found for “{searchTerm}”{" "}
                  {filterStatus !== "All" ? `in ${filterStatus}` : ""}.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrdersTable;
