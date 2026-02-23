import PageHeader from "../../../components/PageHeader";
import StatCard from "../../../components/StatCard";
import StatCardGrid from "../../../components/StatCardGrid";
import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import { getAdminOrders, getSellerOrders, updateOrderStatus } from "../../../utils/queries/users";
import images from "../../../constants/images";
import BulkActionDropdown from "../../../components/BulkActionDropdown";
import DateFilter from "../../../components/DateFilter";
import type { DateFilterState } from "../../../components/DateFilter";
import LatestOrders from "./latestOrders";

function useDebouncedValue<T>(value: T, delay = 450) {
  const [debounced, setDebounced] = useState<T>(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

const OrdersMgt = () => {
  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [dateFilter, setDateFilter] = useState<DateFilterState>({
    filterType: 'period',
    period: 'All time',
    dateFrom: null,
    dateTo: null,
  });
  const debouncedSearch = useDebouncedValue(search, 450);
  const location = useLocation();

  const queryClient = useQueryClient();

  // Check if we're on the admin orders page (orders-mgt-sellers)
  const isAdminOrdersPage = location.pathname.includes('orders-mgt-sellers');

  const tabs = [
    "All",
    "placed",
    "out_for_delivery", 
    "delivered",
    "completed",
    "disputed",
    "pending",
  ];

  // Fetch orders data - Use different APIs based on URL
  const sellerId = 1; // For seller-specific orders
  const { data: ordersData, isLoading, error } = useQuery({
    queryKey: isAdminOrdersPage 
      ? ['adminOrders', activeTab, currentPage, dateFilter.period, dateFilter.dateFrom, dateFilter.dateTo, debouncedSearch]
      : ['sellerOrders', sellerId, activeTab, currentPage, dateFilter.period, dateFilter.dateFrom, dateFilter.dateTo, debouncedSearch],
    queryFn: () => isAdminOrdersPage 
      ? getAdminOrders(
          currentPage, 
          activeTab === "All" ? undefined : activeTab,
          dateFilter.filterType === 'period' ? dateFilter.period || undefined : undefined,
          dateFilter.filterType === 'custom' ? dateFilter.dateFrom || undefined : undefined,
          dateFilter.filterType === 'custom' ? dateFilter.dateTo || undefined : undefined,
          debouncedSearch && debouncedSearch.trim() ? debouncedSearch.trim() : undefined
        )
      : getSellerOrders(
          sellerId, 
          currentPage, 
          activeTab === "All" ? undefined : activeTab,
          dateFilter.filterType === 'period' ? dateFilter.period || undefined : undefined,
          dateFilter.filterType === 'custom' ? dateFilter.dateFrom || undefined : undefined,
          dateFilter.filterType === 'custom' ? dateFilter.dateTo || undefined : undefined,
          debouncedSearch && debouncedSearch.trim() ? debouncedSearch.trim() : undefined
        ),
    placeholderData: (previousData) => previousData,
  });

  // Update order status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ storeOrderId, statusData }: { storeOrderId: string; statusData: any }) => 
      updateOrderStatus(storeOrderId, statusData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sellerOrders'] });
    },
    onError: (error) => {
      console.error('Failed to update order status:', error);
      alert('Failed to update order status. Please try again.');
    },
  });

  // Extract data - Different structures for admin vs seller orders
  const orders = isAdminOrdersPage 
    ? (ordersData as any)?.data?.orders || []  // Admin orders: data.orders (direct array)
    : (ordersData as any)?.data?.orders?.data || [];  // Seller orders: data.orders.data (nested array)
  
  const statistics = isAdminOrdersPage
    ? (ordersData as any)?.data?.statistics || {}  // Admin orders: data.statistics (direct values)
    : (ordersData as any)?.data?.statistics || {};  // Seller orders: data.statistics (nested objects with .value)
  
  const pagination = isAdminOrdersPage
    ? (ordersData as any)?.data?.pagination || {}  // Admin orders: data.pagination
    : (ordersData as any)?.data?.orders || {};  // Seller orders: data.orders (contains pagination)
  
  // Debug logging
  console.log('=== ORDERS DEBUG ===');
  console.log('API Type:', isAdminOrdersPage ? 'Admin Orders' : 'Seller Orders');
  console.log('URL Path:', location.pathname);
  console.log('Raw Orders Data:', ordersData);
  console.log('Extracted Orders:', orders);
  console.log('Extracted Statistics:', statistics);
  console.log('Extracted Pagination:', pagination);
  console.log('Total Orders Value:', isAdminOrdersPage ? statistics.total_orders : statistics.total_orders?.value);
  console.log('=== END DEBUG ===');

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
    console.log("Bulk action selected in Orders:", action);
  };

  const handleDateFilterChange = (filter: DateFilterState) => {
    setDateFilter(filter);
    setCurrentPage(1);
  };

  // Backend handles filtering, so use orders directly
  const filteredOrders = orders;

  // Transform orders for BulkActionDropdown export
  const ordersForExport = useMemo(() => {
    return filteredOrders.map((order: any) => ({
      id: order.store_order_id?.toString() || order.id?.toString() || '',
      order_no: order.order_number || order.order_no || '',
      store_name: order.store_name || '',
      storeName: order.store_name || '',
      seller_name: order.seller_name || order.store_name || '',
      buyer_name: order.customer_name || order.buyer_name || '',
      buyerName: order.customer_name || order.buyer_name || '',
      buyer_email: order.customer_email || order.buyer_email || '',
      buyer_phone: order.customer_phone || order.buyer_phone || '',
      product_name: order.product_name || order.product?.name || 'N/A',
      productName: order.product_name || order.product?.name || 'N/A',
      price: order.total_amount || order.price || '0',
      total_amount: order.total_amount || order.price || '0',
      quantity: order.quantity ?? order.items_count ?? null,
      payment_method: order.payment_method || order.payment_type || '',
      payment_status: order.payment_status || '',
      delivery_status: order.delivery_status || '',
      delivery_address: order.delivery_address || order.shipping_address || '',
      tracking_number: order.tracking_number || '',
      order_date: order.formatted_date || order.order_date || order.created_at || '',
      orderDate: order.formatted_date || order.order_date || order.created_at || '',
      created_at: order.created_at || '',
      updated_at: order.updated_at || '',
      status: order.status || '',
      notes: order.notes || order.admin_notes || '',
    }));
  }, [filteredOrders]);

  return (
    <>
      <PageHeader 
        title="Orders Management - Stores" 
        showDropdown={false}
      />
      <div className="p-3 sm:p-4 md:p-5">
        {/* Debug Panel - Remove this after testing */}
       
      
        <StatCardGrid columns={3}>
          <StatCard
            icon={images.cycle}
            title="Total Orders"
            value={isLoading ? "..." : (isAdminOrdersPage 
              ? statistics.total_orders || 0 
              : statistics.total_orders?.value || 0)}
            subtitle="Active orders across all stores"
          />
          <StatCard
            icon={images.cycle}
            title="Pending Orders"
            value={isLoading ? "..." : (isAdminOrdersPage 
              ? statistics.pending_orders || 0 
              : statistics.pending_orders?.value || 0)}
            subtitle="Orders awaiting processing"
          />
          <StatCard
            icon={images.cycle}
            title="Completed Orders"
            value={isLoading ? "..." : (isAdminOrdersPage 
              ? statistics.completed_orders || 0 
              : statistics.completed_orders?.value || 0)}
            subtitle="Successfully completed orders"
          />
        </StatCardGrid>
        <div className="mt-4 sm:mt-5 flex flex-col sm:flex-row gap-2 sm:gap-2">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-2">
            <div className="overflow-x-auto w-full sm:w-auto">
              <TabButtons />
            </div>
            <div className="relative date-dropdown-container">
              <div
                className="flex flex-row items-center gap-3 sm:gap-5 border border-[#989898] rounded-lg px-3 sm:px-4 py-2 sm:py-2 bg-white cursor-pointer text-xs sm:text-sm hover:bg-gray-50 transition-colors"
                onClick={handleDateDropdownToggle}
              >
                <div>{selectedPeriod}</div>
                <img 
                  className={`w-3 h-3 mt-1 transition-transform ${isDateDropdownOpen ? 'rotate-180' : ''}`} 
                  src={images.dropdown} 
                  alt="" 
                />
              </div>

              {isDateDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-[140px] bg-white border border-[#989898] rounded-lg shadow-lg z-10">
                  {datePeriodOptions.map((option) => (
                    <div
                      key={option}
                      className={`px-4 py-3 hover:bg-gray-100 cursor-pointer text-left text-sm first:rounded-t-lg last:rounded-b-lg transition-colors ${
                        selectedPeriod === option ? 'bg-gray-50 font-medium' : ''
                      }`}
                      onClick={() => handleDatePeriodSelect(option)}
                    >
                      {option}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <BulkActionDropdown 
                onActionSelect={handleBulkActionSelect}
                orders={ordersForExport}
                dataType="orders"
                exportConfig={{
                  dataType: "orders",
                  status: activeTab !== "All" ? activeTab : undefined,
                  period: selectedPeriod !== "All time" ? selectedPeriod : undefined,
                }}
              />
            </div>
          </div>
          <div className="relative w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch((e.target as any).value)}
              className="pl-12 pr-6 py-2.5 sm:py-3.5 border border-[#00000080] rounded-lg text-sm sm:text-[15px] w-full sm:w-[200px] md:w-[240px] focus:outline-none bg-white shadow-[0_2px_6px_rgba(0,0,0,0.05)] placeholder-[#00000080]"
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
            orders={filteredOrders}
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

export default OrdersMgt;
