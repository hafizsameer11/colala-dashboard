import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import images from "../../../../../constants/images";
import BulkActionDropdown from "../../../../../components/BulkActionDropdown";
import LatestOrders from "./latestOrders";
import useDebouncedValue from "../../../../../hooks/useDebouncedValue";
import { getUserOrders } from "../../../../../utils/queries/users";

interface OrdersProps {
  userId?: string | number;
  onViewChat?: (orderId: string | number) => void;
  selectedPeriod?: string;
}

const Orders: React.FC<OrdersProps> = ({ userId, onViewChat, selectedPeriod = "All time" }) => {
  const [activeTab, setActiveTab] = useState("All");
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrders, setSelectedOrders] = useState<any[]>([]);
  const debouncedQuery = useDebouncedValue(query, 400);

  const tabs = [
    "All",
    "placed",
    "pending",
    "out_for_delivery",
    "delivered",
    "completed",
  ];

  // Fetch user orders data from API
  const { data: ordersData, isLoading, error } = useQuery({
    queryKey: ['userOrders', userId, currentPage, selectedPeriod],
    queryFn: () => getUserOrders(userId!, currentPage, selectedPeriod),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes
  });

  // Reset to page 1 when tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  const handleUserSelection = (selectedIds: string[]) => {
    console.log("Selected user IDs:", selectedIds);
  };

  const TabButtons = () => (
    <div className="flex items-center border border-[#989898] rounded-lg p-2 w-fit bg-white">
      {tabs.map((tab) => {
        const isActive = activeTab === tab;
        return (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-2 text-sm rounded-lg font-normal transition-all duration-200 cursor-pointer ${isActive ? "px-8 bg-[#E53E3E] text-white" : "px-2.5 text-black"
              }`}
          >
            {tab}
          </button>
        );
      })}
    </div>
  );

  const handleBulkActionSelect = (action: string) => {
    console.log("Bulk action selected in Orders:", action);
  };

  return (
    <>
      <div>
        <div className="flex flex-row justify-between items-center">
          {/* Total Orders Card */}
          <div
            className="flex flex-row rounded-2xl w-90"
            style={{ boxShadow: "0px 0px 2px 0px rgba(0, 0, 0, 0.25)" }}
          >
            <div className="bg-[#E53E3E] rounded-l-2xl p-7 flex justify-center items-center">
              <img className="w-9 h-9" src={images.cycle} alt="" />
            </div>
            <div className="flex flex-col bg-[#FFF1F1] rounded-r-2xl p-3 pr-11 gap-1">
              <span className="font-semibold text-[15px]">Total Orders</span>
              <span className="font-semibold text-2xl">
                {ordersData?.data?.statistics?.total_orders?.value || 0}
              </span>
              <span className="text-[#00000080] text-[13px]">
                <span className="text-[#1DB61D]">
                  +{ordersData?.data?.statistics?.total_orders?.increase || 0}%
                </span>{" "}
                increase from last month
              </span>
            </div>
          </div>

          {/* Pending Orders Card */}
          <div
            className="flex flex-row rounded-2xl w-90"
            style={{ boxShadow: "0px 0px 2px 0px rgba(0, 0, 0, 0.25)" }}
          >
            <div className="bg-[#E53E3E] rounded-l-2xl p-7 flex justify-center items-center">
              <img className="w-9 h-9" src={images.cycle} alt="" />
            </div>
            <div className="flex flex-col bg-[#FFF1F1] rounded-r-2xl p-3 pr-11 gap-1">
              <span className="font-semibold text-[15px]">Pending Orders</span>
              <span className="font-semibold text-2xl">
                {ordersData?.data?.statistics?.pending_orders?.value || 0}
              </span>
              <span className="text-[#00000080] text-[13px]">
                <span className="text-[#1DB61D]">
                  +{ordersData?.data?.statistics?.pending_orders?.increase || 0}%
                </span>{" "}
                increase from last month
              </span>
            </div>
          </div>

          {/* Completed Orders Card */}
          <div
            className="flex flex-row rounded-2xl w-90"
            style={{ boxShadow: "0px 0px 2px 0px rgba(0, 0, 0, 0.25)" }}
          >
            <div className="bg-[#E53E3E] rounded-l-2xl p-7 flex justify-center items-center">
              <img className="w-9 h-9" src={images.cycle} alt="" />
            </div>
            <div className="flex flex-col bg-[#FFF1F1] rounded-r-2xl p-3 pr-11 gap-1">
              <span className="font-semibold text-[15px]">Completed Orders</span>
              <span className="font-semibold text-2xl">
                {ordersData?.data?.statistics?.completed_orders?.value || 0}
              </span>
              <span className="text-[#00000080] text-[13px]">
                <span className="text-[#1DB61D]">
                  +{ordersData?.data?.statistics?.completed_orders?.increase || 0}%
                </span>{" "}
                increase from last month
              </span>
            </div>
          </div>
        </div>
        <div className="mt-5 flex flex-row gap-2">
          <div>
            <TabButtons />
          </div>
          <div>
            <BulkActionDropdown 
              onActionSelect={handleBulkActionSelect}
              selectedOrders={selectedOrders}
              orders={
                ordersData?.data?.store_orders?.data || 
                ordersData?.data?.orders?.data || 
                ordersData?.data?.recent_orders || 
                ordersData?.data?.orders || 
                []
              }
              dataType="orders"
            />
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Search"
              value={query}
              onChange={(e) => setQuery(e.target.value)} // <-- controlled + debounced
              className="pl-12 pr-6 py-3.5 border border-[#00000080] rounded-lg text-[15px] w-[240px] focus:outline-none bg-white shadow-[0_2px_6px_rgba(0,0,0,0.05)] placeholder-[#00000080]"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>
        <div>
          <LatestOrders
            title="Latest Orders"
            onRowSelect={handleUserSelection}
            onSelectedOrdersChange={setSelectedOrders}
            activeTab={activeTab}
            searchQuery={debouncedQuery}
            orders={
              ordersData?.data?.store_orders?.data || 
              ordersData?.data?.orders?.data || 
              ordersData?.data?.recent_orders || 
              ordersData?.data?.orders || 
              []
            }
            pagination={ordersData?.data?.store_orders?.pagination || ordersData?.data?.pagination || null}
            onPageChange={(page: number) => {
              setCurrentPage(page);
              // Scroll to top when page changes
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            isLoading={isLoading}
            error={error?.message || null}
            userId={userId}
            onViewChat={onViewChat}
          />
        </div>
      </div>
    </>
  );
};

export default Orders;
