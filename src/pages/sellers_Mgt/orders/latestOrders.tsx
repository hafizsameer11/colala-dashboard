import React, { useState, useEffect } from "react";
import OrderDetails from "../Modals/orderDetails";

interface Order {
  id: string;
  storeName: string;
  productName: string;
  price: string;
  orderDate: string;
  status:
    | "Out for delivery"
    | "Delivered"
    | "Order Placed"
    | "Uncompleted"
    | "Disputed"
    | "Completed";
}

interface LatestOrdersProps {
  title?: string;
  onRowSelect?: (selectedIds: string[]) => void;
  activeTab?: string;
}

const statusColors: Record<Order["status"], string> = {
  "Out for delivery":
    "text-[#0000FF] border border-[#0000FF] bg-[#0000FF1A] rounded-lg",
  Delivered: "text-[#800080] border border-[#800080] bg-[#8000801A] rounded-lg",
  "Order Placed":
    "text-[#E53E3E] border border-[#E53E3E] bg-[#E53E3E1A] rounded-lg",
  Uncompleted:
    "text-[#000000] border border-[#000000] bg-[#0000001A] rounded-lg",
  Disputed: "text-[#FF0000] border border-[#FF0000] bg-[#FF00001A] rounded-lg",
  Completed: "text-[#008000] border border-[#008000] bg-[#0080001A] rounded-lg",
};

const LatestOrders: React.FC<LatestOrdersProps> = ({
  title = "Latest Orders",
  onRowSelect,
  activeTab = "All",
}) => {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  const orders: Order[] = [
    {
      id: "1",
      storeName: "Gadget Haven",
      productName: "Samsung Galaxy S24 Ultra",
      price: "₦1,950,500",
      orderDate: "20-07-2025/09:15PM",
      status: "Out for delivery",
    },
    {
      id: "2",
      storeName: "Jumia Electronics",
      productName: "Sony WH-1000XM5 Headphones",
      price: "₦420,000",
      orderDate: "15-07-2025/10:05AM",
      status: "Delivered",
    },
    {
      id: "3",
      storeName: "Tech Bros Inc.",
      productName: "MacBook Air M3",
      price: "₦1,750,000",
      orderDate: "18-07-2025/12:30PM",
      status: "Order Placed",
    },
    {
      id: "4",
      storeName: "Konga Deals",
      productName: "Dell XPS 15 Laptop",
      price: "₦2,250,000",
      orderDate: "12-07-2025/06:55PM",
      status: "Uncompleted",
    },
    {
      id: "5",
      storeName: "Slot Limited",
      productName: "GoPro HERO12 Black",
      price: "₦585,000",
      orderDate: "10-07-2025/02:18PM",
      status: "Order Placed",
    },
    {
      id: "6",
      storeName: "Pointek Online",
      productName: "DJI Mini 4 Pro Drone",
      price: "₦1,100,000",
      orderDate: "05-06-2025/08:40AM",
      status: "Disputed",
    },
    {
      id: "7",
      storeName: "Franko Trading",
      productName: "Apple Watch Series 9",
      price: "₦715,000",
      orderDate: "28-05-2025/11:59PM",
      status: "Completed",
    },
  ];
  const [showModal, setShowModal] = useState(false);

  // Filter orders based on active tab
  const filteredOrders =
    activeTab === "All"
      ? orders
      : orders.filter((order) => order.status === activeTab);

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

  const handleShowDetails = () => {
    setShowModal(true);
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
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      statusColors[order.status]
                    }`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="p-3 space-x-2">
                  <button
                    onClick={() => handleShowDetails()}
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
      </div>

      {/* Order Details Modal */}
      <OrderDetails isOpen={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
};

export default LatestOrders;
