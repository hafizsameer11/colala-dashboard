import React, { useState } from "react";

interface Order {
  id: string;
  storeName: string;
  buyerName: string;
  productName: string;
  price: string;
  orderDate: string;
  status: "Order Placed" | "Delivered" | "Completed";
}

interface OrdersTableProps {
  title?: string;
  onRowSelect?: (selectedIds: string[]) => void;
}

const OrdersTable: React.FC<OrdersTableProps> = ({
  title = "Latest Orders",
  onRowSelect,
}) => {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  // Sample data based on the image
  const orders: Order[] = [
    {
      id: "1",
      storeName: "Qamardeen Malik",
      buyerName: "Alex Adewale",
      productName: "iphone16 pro max",
      price: "₦2,400,000",
      orderDate: "21-07-2025/07:22AM",
      status: "Order Placed",
    },
    {
      id: "2",
      storeName: "Qamardeen Malik",
      buyerName: "Alex Adewale",
      productName: "iphone16 pro max",
      price: "₦2,400,000",
      orderDate: "21-07-2025/07:22AM",
      status: "Delivered",
    },
    {
      id: "3",
      storeName: "Qamardeen Malik",
      buyerName: "Alex Adewale",
      productName: "iphone16 pro max",
      price: "₦2,400,000",
      orderDate: "21-07-2025/07:22AM",
      status: "Completed",
    },
  ];

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRows([]);
    } else {
      setSelectedRows(orders.map((order) => order.id));
    }
    setSelectAll(!selectAll);

    if (onRowSelect) {
      onRowSelect(selectAll ? [] : orders.map((order) => order.id));
    }
  };

  const handleRowSelect = (orderId: string) => {
    let newSelectedRows;
    if (selectedRows.includes(orderId)) {
      newSelectedRows = selectedRows.filter((id) => id !== orderId);
    } else {
      newSelectedRows = [...selectedRows, orderId];
    }

    setSelectedRows(newSelectedRows);
    setSelectAll(newSelectedRows.length === orders.length);

    if (onRowSelect) {
      onRowSelect(newSelectedRows);
    }
  };

  const getStatusStyle = (status: Order["status"]) => {
    switch (status) {
      case "Order Placed":
        return "bg-[#E53E3E1A] text-[#E53E3E] border border-[#E53E3E]";
      case "Delivered":
        return "bg-[#8000801A] text-[#800080] border border-[#800080]";
      case "Completed":
        return "bg-[#0080001A] text-[#008000] border border-[#008000]";
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
                  checked={selectAll}
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
              <th className="text-center p-3 font-semibold text-[14px]">Price</th>
              <th className="text-center p-3 font-semibold text-[14px]">
                Order Date
              </th>
              <th className="text-center p-3 font-semibold text-[14px]">
                Status
              </th>
              <th className="text-center p-3 font-semibold text-[14px]">Other</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order, index) => (
              <tr
                key={order.id}
                className={`border-t border-[#E5E5E5] transition-colors ${
                  index === orders.length - 1 ? "" : "border-b"
                }`}
              >
                <td className="p-4">
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(order.id)}
                    onChange={() => handleRowSelect(order.id)}
                    className="w-5 h-5 border border-gray-300 rounded cursor-pointer text-center"
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
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrdersTable;
