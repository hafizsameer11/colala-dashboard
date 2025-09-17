import React, { useMemo, useState } from "react";

interface Order {
  id: string;
  storeName: string;
  buyerName: string;
  productName: string;
  price: string;
  orderDate: string;
  status:
    | "Order Placed"
    | "Delivered"
    | "Completed"
    | "Out for delivery"
    | "Disputed";
}

interface OrdersTableProps {
  title?: string;
  onRowSelect?: (selectedIds: string[]) => void;
  filterStatus?: string; // e.g., "All", "Delivered"
  searchTerm?: string; // debounced term from parent
}

const OrdersTable: React.FC<OrdersTableProps> = ({
  title = "Latest Orders",
  onRowSelect,
  filterStatus = "All",
  searchTerm = "",
}) => {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  // Sample data (add a couple more statuses so tabs feel real)
  const orders: Order[] = [
    {
      id: "1",
      storeName: "Qamardeen Malik",
      buyerName: "Alex Adewale",
      productName: "iPhone 16 Pro Max",
      price: "₦2,400,000",
      orderDate: "21-07-2025/07:22AM",
      status: "Order Placed",
    },
    {
      id: "2",
      storeName: "Sasha Stores",
      buyerName: "Adam Sandler",
      productName: "Galaxy S24 Ultra",
      price: "₦1,950,000",
      orderDate: "22-07-2025/05:40PM",
      status: "Delivered",
    },
    {
      id: "3",
      storeName: "Tech World",
      buyerName: "Sofia Rossi",
      productName: "MacBook Air M3",
      price: "₦3,100,000",
      orderDate: "22-07-2025/10:12AM",
      status: "Completed",
    },
    {
      id: "4",
      storeName: "Gadget Hub",
      buyerName: "David Chen",
      productName: "AirPods Pro 2",
      price: "₦220,000",
      orderDate: "23-07-2025/03:03PM",
      status: "Out for delivery",
    },
    {
      id: "5",
      storeName: "Qamardeen Malik",
      buyerName: "Emma Watson",
      productName: "Apple Watch Ultra 2",
      price: "₦980,000",
      orderDate: "24-07-2025/11:05AM",
      status: "Disputed",
    },
  ];

  // FILTER + SEARCH (case-insensitive includes on key fields)
  const filteredOrders = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return orders
      .filter((o) =>
        filterStatus === "All"
          ? true
          : o.status === (filterStatus as Order["status"])
      )
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
  }, [orders, filterStatus, searchTerm]);

  // when filter/search changes, reset select-all to reflect current view
  React.useEffect(() => {
    setSelectAll(false);
    // optionally also clear selections not in the current view
    setSelectedRows((prev) =>
      prev.filter((id) => filteredOrders.some((o) => o.id === id))
    );
  }, [filterStatus, searchTerm]); // eslint-disable-line

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRows([]);
      onRowSelect?.([]);
    } else {
      const visibleIds = filteredOrders.map((o) => o.id);
      setSelectedRows(visibleIds);
      onRowSelect?.(visibleIds);
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
    onRowSelect?.(newSelectedRows);
  };

  const getStatusStyle = (status: Order["status"]) => {
    switch (status) {
      case "Order Placed":
        return "bg-[#E53E3E1A] text-[#E53E3E] border border-[#E53E3E]";
      case "Delivered":
        return "bg-[#8000801A] text-[#800080] border border-[#800080]";
      case "Completed":
        return "bg-[#0080001A] text-[#008000] border border-[#008000]";
      case "Out for delivery":
        return "bg-[#1E90FF1A] text-[#1E90FF] border border-[#1E90FF]";
      case "Disputed":
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
              <th className="text-center p-3 font-semibold text-[14px]">
                Other
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
                <td className="p-4 text-center">
                  <button className="bg-[#E53E3E] text-white px-6 py-2.5 rounded-lg text-[15px] font-medium hover:bg-[#D32F2F] transition-colors cursor-pointer">
                    Details
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
