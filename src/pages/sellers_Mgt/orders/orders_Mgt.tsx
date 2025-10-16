import PageHeader from "../../../components/PageHeader";
import StatCard from "../../../components/StatCard";
import StatCardGrid from "../../../components/StatCardGrid";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAdminOrders, updateOrderStatus } from "../../../utils/queries/users";
import images from "../../../constants/images";
import BulkActionDropdown from "../../../components/BulkActionDropdown";
import LatestOrders from "./latestOrders";

function useDebouncedValue<T>(value: T, delay = 450) {
  const [debounced, setDebounced] = useState<T>(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

const orders_Mgt = () => {
  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search, 450);

  const queryClient = useQueryClient();

  const tabs = [
    "All",
    "placed",
    "out_for_delivery", 
    "delivered",
    "completed",
    "disputed",
    "pending",
  ];

  // Fetch orders data
  const { data: ordersData, isLoading, error } = useQuery({
    queryKey: ['adminOrders', activeTab, currentPage],
    queryFn: () => getAdminOrders(currentPage, activeTab === "All" ? undefined : activeTab),
    keepPreviousData: true,
  });

  // Update order status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ storeOrderId, statusData }: { storeOrderId: string; statusData: any }) => 
      updateOrderStatus(storeOrderId, statusData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
    },
    onError: (error) => {
      console.error('Failed to update order status:', error);
      alert('Failed to update order status. Please try again.');
    },
  });

  // Extract data
  const orders = ordersData?.data?.orders || [];
  const statistics = ordersData?.data?.statistics || {};
  const pagination = ordersData?.data?.pagination;

  const handleUserSelection = (selectedIds: string[]) => {
    console.log("Selected user IDs:", selectedIds);
  };

  const handlePageChange = (page: number) => {
    if (page !== currentPage) setCurrentPage(page);
  };

  const handleStatusUpdate = (storeOrderId: string, statusData: any) => {
    updateStatusMutation.mutate({ storeOrderId, statusData });
  };

  const TabButtons = () => {
    return (
      <div className="flex items-center border border-[#989898] rounded-lg p-2 w-fit bg-white">
        {tabs.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 text-sm rounded-lg font-normal transition-all duration-200 cursor-pointer ${
                isActive ? "px-8 bg-[#E53E3E] text-white" : "px-2.5 text-black"
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
    console.log("Bulk action selected in Orders:", action);
  };

  return (
    <>
      <PageHeader title="Orders Management - Stores" />
      <div className="p-5">
        <StatCardGrid columns={3}>
          <StatCard
            icon={images.cycle}
            title="Total Orders"
            value={isLoading ? "..." : statistics.total_orders || 0}
            subtitle="Active orders across all stores"
          />
          <StatCard
            icon={images.cycle}
            title="Out for Delivery"
            value={isLoading ? "..." : statistics.out_for_delivery || 0}
            subtitle="Active delivery orders"
          />
          <StatCard
            icon={images.cycle}
            title="Delivered"
            value={isLoading ? "..." : statistics.delivered || 0}
            subtitle="Completed deliveries"
          />
        </StatCardGrid>
        <div className="mt-5 flex flex-row gap-2">
          <div>
            <TabButtons />
          </div>
          <div className="flex flex-row items-center gap-5 border border-[#989898] rounded-lg px-4 py-2 bg-white cursor-pointer">
            <div>Today</div>
            <div>
              <img className="w-3 h-3 mt-1" src={images.dropdown} alt="" />
            </div>
          </div>
          <div>
            <BulkActionDropdown onActionSelect={handleBulkActionSelect} />
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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
            activeTab={activeTab}
            searchTerm={debouncedSearch}
            orders={orders}
            isLoading={isLoading}
            error={error}
            pagination={pagination}
            currentPage={currentPage}
            onPageChange={handlePageChange}
            onStatusUpdate={handleStatusUpdate}
          />
        </div>
      </div>
    </>
  );
};

export default orders_Mgt;
