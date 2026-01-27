import { useMemo, useState } from "react";
import images from "../../../../../constants/images";
import BulkActionDropdown from "../../../../../components/BulkActionDropdown";
import LatestOrders from "./latestOrders";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getSellerOrders } from "../../../../../utils/queries/users";

const Orders: React.FC = () => {
  const [activeTab, setActiveTab] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const { storeId } = useParams<{ storeId: string }>();

  const { data: ordersPage, isLoading, error } = useQuery({
    queryKey: ['sellerOrders', storeId, currentPage],
    queryFn: () => getSellerOrders(storeId!, currentPage),
    enabled: !!storeId,
    staleTime: 2 * 60 * 1000,
  });
  const stats = ordersPage?.data?.statistics;
  const ordersData = ordersPage?.data?.orders?.data || [];
  const pagination = ordersPage?.data?.orders;

  const tabs = [
    "All",
    "Order Placed",
    "Out for delivery",
    "Delivered",
    "Completed",
    "Disputed",
    "Uncompleted",
  ];

  const handleUserSelection = (selectedIds: string[]) => {
    // Handle selected user IDs
    console.log("Selected user IDs:", selectedIds);
    // You can use this to enable/disable bulk actions or perform other operations
  };

  const TabButtons = () => {
    return (
      <div className="flex items-center border border-[#989898] rounded-lg p-1.5 sm:p-2 w-fit bg-white overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg font-normal transition-all duration-200 cursor-pointer whitespace-nowrap ${
                isActive ? "px-4 sm:px-6 md:px-8 bg-[#E53E3E] text-white" : "px-2 sm:px-2.5 text-black"
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>
    );
  };

  const handleBulkActionSelect = (action: string) => {
    // Handle the bulk action selection from the parent component
    console.log("Bulk action selected in Orders:", action);
    // Add your custom logic here
  };

  return (
    <>
      <div>
        <div className="flex flex-row justify-between items-center">
          {/* Card 1 */}
          <div
            className="flex flex-row rounded-2xl  w-90"
            style={{ boxShadow: "0px 0px 2px 0px rgba(0, 0, 0, 0.25)" }}
          >
            <div className="bg-[#E53E3E] rounded-l-2xl p-7 flex justify-center items-center ">
              <img className="w-9 h-9" src={images.cycle} alt="" />
            </div>
            <div className="flex flex-col bg-[#FFF1F1] rounded-r-2xl p-3 pr-11 gap-1">
              <span className="font-semibold text-[15px]">{stats?.total_orders?.label || 'Total Orders'}</span>
              <span className="font-semibold text-2xl">{stats?.total_orders?.value ?? 0}</span>
              <span className="text-[#00000080] text-[13px] ">
                <span className="text-[#1DB61D]">+{stats?.total_orders?.increase ?? 0}%</span> increase from last
                month
              </span>
            </div>
          </div>

          {/* Card 2 */}

          <div
            className="flex flex-row rounded-2xl w-90"
            style={{ boxShadow: "0px 0px 2px 0px rgba(0, 0, 0, 0.25)" }}
          >
            <div className="bg-[#E53E3E] rounded-l-2xl p-7 flex justify-center items-center ">
              <img className="w-9 h-9" src={images.cycle} alt="" />
            </div>
            <div className="flex flex-col bg-[#FFF1F1] rounded-r-2xl p-3 pr-11 gap-1">
              <span className="font-semibold text-[15px]">{stats?.pending_orders?.label || 'Pending Orders'}</span>
              <span className="font-semibold text-2xl">{stats?.pending_orders?.value ?? 0}</span>
              <span className="text-[#00000080] text-[13px] ">
                <span className="text-[#1DB61D]">+{stats?.pending_orders?.increase ?? 0}%</span> increase from last
                month
              </span>
            </div>
          </div>

          {/* Card 3 */}

          <div
            className="flex flex-row rounded-2xl w-90"
            style={{ boxShadow: "0px 0px 2px 0px rgba(0, 0, 0, 0.25)" }}
          >
            <div className="bg-[#E53E3E] rounded-l-2xl p-7 flex justify-center items-center ">
              <img className="w-9 h-9" src={images.cycle} alt="" />
            </div>
            <div className="flex flex-col bg-[#FFF1F1] rounded-r-2xl p-3 pr-11 gap-1">
              <span className="font-semibold text-[15px]">{stats?.completed_orders?.label || 'Completed Orders'}</span>
              <span className="font-semibold text-2xl">{stats?.completed_orders?.value ?? 0}</span>
              <span className="text-[#00000080] text-[13px] ">
                <span className="text-[#1DB61D]">+{stats?.completed_orders?.increase ?? 0}%</span> increase from last
                month
              </span>
            </div>
          </div>
        </div>
        {/* Local filters (status tabs, date, bulk action, search) have been removed here
            because the main Orders page already provides these controls at the top. */}
        <div>
          <LatestOrders
            title="Latest Orders"
            onRowSelect={handleUserSelection}
            activeTab={activeTab}
            orders={ordersData}
            isLoading={isLoading}
            error={error}
            pagination={pagination}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </>
  );
};

export default Orders;
