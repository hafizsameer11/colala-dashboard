import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import images from "../../constants/images";
import StatCard from "../../components/StatCard";
import StatCardGrid from "../../components/StatCardGrid";
import BulkActionDropdown from "../../components/BulkActionDropdown";
import OrdersTable from "./OrdersTable";
import PageHeader from "../../components/PageHeader";
import { getDashboardData } from "../../utils/queries/dashboard";
import ChatsModel from "../general/chats/components/chatmodel";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// ============================================================================
// CONSTANTS & TYPES
// ============================================================================

/**
 * Available filter tabs for orders
 * These match the status values from the API
 */
const ORDER_FILTER_TABS = [
  "All",
  "paid",
  "pending_acceptance",
  "accepted",
  "out_for_delivery",
  "delivered",
  "completed",
  "disputed",
] as const;

type OrderFilterTab = (typeof ORDER_FILTER_TABS)[number];

interface Order {
  id: string | number;
  order_no?: string | number;
  store_name?: string;
  buyer_name?: string;
  product_name?: string;
  price?: string;
  order_date?: string;
  status?: string;
}

// ============================================================================
// MAIN DASHBOARD COMPONENT
// ============================================================================

const Dashboard = () => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  // Filter and search state
  const [activeTab, setActiveTab] = useState<OrderFilterTab>("All");
  const [isTabChanging, setIsTabChanging] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Selected orders for bulk actions
  const [selectedOrders, setSelectedOrders] = useState<Order[]>([]);

  // Chats modal state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedChat, setSelectedChat] = useState<{
    id: string | number;
    storeName?: string;
    userName?: string;
    lastMessage?: string;
    chatDate?: string;
    type?: string;
    other?: string;
    isUnread?: boolean;
  } | null>(null);

  // ============================================================================
  // API DATA FETCHING
  // ============================================================================

  /**
   * Fetch dashboard data using React Query
   * Includes buyer stats, seller stats, site stats, latest chats, and latest orders
   */
  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboardData,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // ============================================================================
  // SEARCH DEBOUNCING
  // ============================================================================

  /**
   * Debounce search input to avoid excessive API calls
   * Updates debouncedSearch 500ms after user stops typing
   */
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  /**
   * Handle tab filter changes with debouncing to prevent rapid clicks
   */
  const handleTabClick = useCallback((tab: OrderFilterTab) => {
    // Prevent clicks during transitions or if already active
    if (isTabChanging || tab === activeTab) return;

    console.log('Filter tab clicked:', tab);
    setIsTabChanging(true);
    setActiveTab(tab);

    // Reset transition state after animation completes
    setTimeout(() => {
      setIsTabChanging(false);
    }, 100);
  }, [activeTab, isTabChanging]);

  /**
   * Handle bulk action selection (export CSV/PDF, delete)
   */
  const handleBulkActionSelect = (action: string) => {
    console.log("Bulk action selected:", action);
  };

  /**
   * Handle order selection for bulk actions
   */
  const handleOrderSelection = (selectedIds: string[]) => {
    console.log("Selected order IDs:", selectedIds);
  };

  /**
   * Handle selected orders change for bulk actions
   */
  const handleSelectedOrdersChange = (orders: Order[]) => {
    setSelectedOrders(orders);
  };

  /**
   * Handle period change for dashboard data
   */
  const handlePeriodChange = (period: string) => {
    console.log("Period changed to:", period);
  };

  /**
   * Open chat modal with the provided chat data
   */
  const openChatModal = (chat: {
    id: string | number;
    storeName?: string;
    userName?: string;
    lastMessage?: string;
    chatDate?: string;
    type?: string;
    other?: string;
    isUnread?: boolean;
  }) => {
    if (!chat || !chat.id) return;
    setSelectedChat(chat);
    setIsChatOpen(true);
  };

  /**
   * Close chat modal and clear selection
   */
  const closeChatModal = () => {
    setIsChatOpen(false);
    setSelectedChat(null);
  };

  // Search input change handler (typed to avoid DOM lib dependency issues)
  const handleSearchInputChange = (event: unknown) => {
    const target = (event as { target?: { value?: string } })?.target;
    setSearchInput(target?.value ?? "");
  };

  // ============================================================================
  // CHART DATA PREPARATION
  // ============================================================================

  /**
   * Prepare chart data from API response
   * Maps site statistics to Chart.js format
   */
  const usersData = dashboardData?.data?.site_stats?.chart_data?.map((item: { users: number }) => item.users) ||
    new Array(12).fill(0);
  const ordersData = dashboardData?.data?.site_stats?.chart_data?.map((item: { orders: number }) => item.orders) ||
    new Array(12).fill(0);

  const chartData = {
    labels: dashboardData?.data?.site_stats?.chart_data?.map((item: { month: string }) => item.month) || [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ],
    datasets: [
      {
        label: "Users",
        data: usersData,
        backgroundColor: "#E53E3E",
        borderRadius: 50,
        barThickness: 20,
        stack: "stack1",
      },
      {
        label: "Orders",
        data: ordersData,
        backgroundColor: "#008000",
        borderRadius: 50,
        barThickness: 20,
        stack: "stack2",
      },
    ],
  };

  /**
   * Calculate dynamic max value and step size based on actual data
   */
  const calculateChartMax = () => {
    // Find the maximum value across both datasets
    const allValues = [...usersData, ...ordersData];
    const dataMax = Math.max(...allValues, 0); // Ensure at least 0

    // If no data, return a default small value
    if (dataMax === 0) {
      return { max: 100, stepSize: 20 };
    }

    // Add 20% padding above the max value for better visualization
    const paddedMax = dataMax * 1.2;

    // Round up to the nearest "nice" number
    // This creates cleaner scale divisions
    const magnitude = Math.pow(10, Math.floor(Math.log10(paddedMax)));
    const normalized = paddedMax / magnitude;
    
    let roundedMax;
    if (normalized <= 1) {
      roundedMax = magnitude;
    } else if (normalized <= 2) {
      roundedMax = 2 * magnitude;
    } else if (normalized <= 5) {
      roundedMax = 5 * magnitude;
    } else {
      roundedMax = 10 * magnitude;
    }

    // Calculate appropriate step size (aim for 5-10 divisions)
    const stepSize = roundedMax / 5;

    // Round step size to a nice number
    const stepMagnitude = Math.pow(10, Math.floor(Math.log10(stepSize)));
    const normalizedStep = stepSize / stepMagnitude;
    
    let roundedStep;
    if (normalizedStep <= 1) {
      roundedStep = stepMagnitude;
    } else if (normalizedStep <= 2) {
      roundedStep = 2 * stepMagnitude;
    } else if (normalizedStep <= 5) {
      roundedStep = 5 * stepMagnitude;
    } else {
      roundedStep = 10 * stepMagnitude;
    }

    return { max: roundedMax, stepSize: roundedStep };
  };

  const { max: dynamicMax, stepSize: dynamicStepSize } = calculateChartMax();

  /**
   * Chart configuration options
   */
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // We have custom legend in the UI
      },
    },
    scales: {
      x: {
        stacked: false,
        grid: { display: false },
        border: { display: false },
      },
      y: {
        beginAtZero: true,
        max: dynamicMax,
        ticks: { stepSize: dynamicStepSize },
        grid: { display: false },
        border: { display: false },
      },
    },
    layout: {
      padding: {
        top: 20,
        bottom: 20,
        left: 10,
        right: 10,
      },
    },
  };

  // ============================================================================
  // COMPONENT RENDERERS
  // ============================================================================

  /**
   * Format tab label for display (convert "pending_acceptance" to "Pending Acceptance")
   */
  const formatTabLabel = (tab: string): string => {
    if (tab === "All") return "All";
    return tab
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  /**
   * Render filter tab buttons with smooth transitions
   */
  const TabButtons = useCallback(() => {
    return (
      <div className="flex items-center space-x-0.5 border border-[#989898] rounded-lg p-2 w-fit bg-white">
        {ORDER_FILTER_TABS.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!isTabChanging) {
                  handleTabClick(tab);
                }
              }}
              disabled={isTabChanging}
              className={`py-2 text-sm rounded-lg font-normal transition-all duration-200 cursor-pointer select-none ${isActive
                  ? "px-8 bg-[#E53E3E] text-white"
                  : isTabChanging
                    ? "px-4 text-gray-400 cursor-not-allowed"
                    : "px-4 text-black hover:bg-gray-100 active:bg-gray-200"
                }`}
              style={{
                pointerEvents: 'auto',
                userSelect: 'none'
              }}
            >
              {formatTabLabel(tab)}
            </button>
          );
        })}
      </div>
    );
  }, [activeTab, handleTabClick, isTabChanging]);

  // ============================================================================
  // LOADING & ERROR STATES
  // ============================================================================

  if (isLoading) {
    return (
      <>
        <PageHeader title="Dashboard" onPeriodChange={handlePeriodChange} />
        <div className="bg-[#F5F5F5] p-5">
          <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E53E3E]"></div>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <PageHeader title="Dashboard" onPeriodChange={handlePeriodChange} />
        <div className="bg-[#F5F5F5] p-5">
          <div className="flex justify-center items-center h-96">
            <div className="text-red-500 text-center">
              <p className="text-lg font-semibold">Error loading dashboard data</p>
              <p className="text-sm">Please try refreshing the page</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <>
      <PageHeader title="Dashboard" onPeriodChange={handlePeriodChange} />

      <div className="bg-[#F5F5F5] p-5">
        {/* ========================================================================
            STATISTICS CARDS SECTION
        ======================================================================== */}
        <div className="flex flex-row gap-6">

          {/* Buyer App Statistics */}
          <div className="border border-[#989898] rounded-2xl flex-1">
            <div className="flex flex-row items-center gap-2 bg-[#F2F2F2] rounded-t-2xl p-5">
              <span>
                <img className="w-5 h-5" src={images.analyticsIcon} alt="" />
              </span>
              <span className="font-semibold text-[16px]">Buyer App Statistics</span>
            </div>

            <div className="flex flex-col bg-white p-5 rounded-b-2xl gap-3">
              {/* First Row: Total Users & Total Orders */}
              <StatCardGrid columns={2}>
                <StatCard
                  icon={images.Users}
                  title="Total Users"
                  value={dashboardData?.data?.buyer_stats?.total_users?.value || 0}
                  subtitle={
                    <>
                      <span className="text-[#1DB61D]">
                        +{dashboardData?.data?.buyer_stats?.total_users?.increase || 0}%
                      </span>{" "}
                      increase from last month
                    </>
                  }
                  iconBgColor="#470434"
                />
                <StatCard
                  icon={images.orders}
                  title="Total Orders"
                  value={dashboardData?.data?.buyer_stats?.total_orders?.value || 0}
                  subtitle={
                    <>
                      <span className="text-[#1DB61D]">
                        +{dashboardData?.data?.buyer_stats?.total_orders?.increase || 0}%
                      </span>{" "}
                      increase from last month
                    </>
                  }
                  iconBgColor="#042A47"
                />
              </StatCardGrid>

              {/* Second Row: Completed Orders & Total Transactions */}
              <StatCardGrid columns={2}>
                <StatCard
                  icon={images.orders}
                  title="Completed Orders"
                  value={dashboardData?.data?.buyer_stats?.completed_orders?.value || 0}
                  subtitle={
                    <>
                      <span className="text-[#1DB61D]">
                        +{dashboardData?.data?.buyer_stats?.completed_orders?.increase || 0}%
                      </span>{" "}
                      increase from last month
                    </>
                  }
                  iconBgColor="#471204"
                />
                <StatCard
                  icon={images.money}
                  title="Total Transactions"
                  value={dashboardData?.data?.buyer_stats?.total_transactions?.value || 0}
                  subtitle={
                    <>
                      <span className="text-[#1DB61D]">
                        +{dashboardData?.data?.buyer_stats?.total_transactions?.increase || 0}%
                      </span>{" "}
                      increase from last month
                    </>
                  }
                  iconBgColor="#044713"
                />
              </StatCardGrid>
            </div>
          </div>

          {/* Seller App Statistics */}
          <div className="border border-[#989898] rounded-2xl flex-1">
            <div className="flex flex-row items-center gap-2 bg-[#F2F2F2] rounded-t-2xl p-5">
              <span>
                <img className="w-5 h-5" src={images.analyticsIcon} alt="" />
              </span>
              <span className="font-semibold text-[16px]">Seller App Statistics</span>
            </div>

            <div className="flex flex-col bg-white p-5 rounded-b-2xl gap-3">
              {/* First Row: Total Users & Total Orders */}
              <div className="flex flex-row gap-3">
                {/* Total Users Card */}
                <div className="flex flex-row rounded-2xl" style={{ boxShadow: "0px 0px 2px 0px rgba(0, 0, 0, 0.25)" }}>
                  <div className="bg-[#470434] rounded-l-2xl p-5 flex justify-center items-center">
                    <img className="w-7 h-7" src={images.Users} alt="" />
                  </div>
                  <div className="flex flex-col bg-[#FFF1F1] rounded-r-2xl p-3 pr-11 gap-1">
                    <span className="font-semibold text-[15px]">Total Users</span>
                    <span className="font-semibold text-2xl">
                      {dashboardData?.data?.seller_stats?.total_users?.value || 0}
                    </span>
                    <span className="text-[#00000080] text-[10px]">
                      <span className="text-[#1DB61D]">
                        +{dashboardData?.data?.seller_stats?.total_users?.increase || 0}%
                      </span> increase from last month
                    </span>
                  </div>
                </div>

                {/* Total Orders Card */}
                <div className="flex flex-row rounded-2xl" style={{ boxShadow: "0px 0px 2px 0px rgba(0, 0, 0, 0.25)" }}>
                  <div className="bg-[#042A47] rounded-l-2xl p-5 flex justify-center items-center">
                    <img className="w-7 h-7" src={images.orders} alt="" />
                  </div>
                  <div className="flex flex-col bg-[#FFF1F1] rounded-r-2xl p-3 pr-11 gap-1">
                    <span className="font-semibold text-[15px]">Total Orders</span>
                    <span className="font-semibold text-2xl">
                      {dashboardData?.data?.seller_stats?.total_orders?.value || 0}
                    </span>
                    <span className="text-[#00000080] text-[10px]">
                      <span className="text-[#1DB61D]">
                        +{dashboardData?.data?.seller_stats?.total_orders?.increase || 0}%
                      </span> increase from last month
                    </span>
                  </div>
                </div>
              </div>

              {/* Second Row: Completed Orders & Total Transactions */}
              <div className="flex flex-row gap-3">
                {/* Completed Orders Card */}
                <div className="flex flex-row rounded-2xl" style={{ boxShadow: "0px 0px 2px 0px rgba(0, 0, 0, 0.25)" }}>
                  <div className="bg-[#471204] rounded-l-2xl p-5 flex justify-center items-center">
                    <img className="w-7 h-7" src={images.orders} alt="" />
                  </div>
                  <div className="flex flex-col bg-[#FFF1F1] rounded-r-2xl p-3 pr-11 gap-1">
                    <span className="font-semibold text-[15px]">Completed Orders</span>
                    <span className="font-semibold text-2xl">
                      {dashboardData?.data?.seller_stats?.completed_orders?.value || 0}
                    </span>
                    <span className="text-[#00000080] text-[10px]">
                      <span className="text-[#1DB61D]">
                        +{dashboardData?.data?.seller_stats?.completed_orders?.increase || 0}%
                      </span> increase from last month
                    </span>
                  </div>
                </div>

                {/* Total Transactions Card */}
                <div className="flex flex-row rounded-2xl" style={{ boxShadow: "0px 0px 2px 0px rgba(0, 0, 0, 0.25)" }}>
                  <div className="bg-[#044713] rounded-l-2xl p-5 flex justify-center items-center">
                    <img className="w-7 h-7" src={images.money} alt="" />
                  </div>
                  <div className="flex flex-col bg-[#FFF1F1] rounded-r-2xl p-3 pr-11 gap-1">
                    <span className="font-semibold text-[15px]">Total Transactions</span>
                    <span className="font-semibold text-2xl">
                      {dashboardData?.data?.seller_stats?.total_transactions?.value || 0}
                    </span>
                    <span className="text-[#00000080] text-[10px]">
                      <span className="text-[#1DB61D]">
                        +{dashboardData?.data?.seller_stats?.total_transactions?.increase || 0}%
                      </span> increase from last month
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================
            CHARTS & LATEST DATA SECTION
        ======================================================================== */}
        <div className="flex flex-row gap-5 mt-5">

          {/* Site Statistics Chart */}
          <div className="">
            <div className="border border-[#989898] rounded-2xl bg-white w-180">
              <div className="flex flex-row justify-between bg-[#F2F2F2] rounded-t-2xl p-5">
                <div className="flex flex-row items-center gap-2">
                  <span>
                    <img className="w-5 h-5" src={images.analyticsIcon} alt="" />
                  </span>
                  <span className="font-semibold text-[16px]">Site Statistics</span>
                </div>
                <div className="flex flex-row items-center gap-2">
                  <div className="flex flex-row items-center gap-1">
                    <div className="bg-[#008000] w-5 h-5 rounded-lg"></div>
                    <span>Users</span>
                  </div>
                  <div className="flex flex-row items-center gap-1">
                    <div className="bg-[#E53E3E] w-5 h-5 rounded-lg"></div>
                    <span>Orders</span>
                  </div>
                </div>
              </div>
              <div className="p-5">
                <div style={{ height: "371px" }}>
                  <Bar data={chartData} options={chartOptions} />
                </div>
              </div>
            </div>
          </div>

          {/* Latest Chats */}
          <div className="">
            <div className="border border-[#989898] rounded-2xl">
              <div className="flex flex-row items-center bg-[#F2F2F2] rounded-t-2xl p-5 gap-2">
                <span>
                  <img className="w-5 h-5" src={images.analyticsIcon} alt="" />
                </span>
                <span className="font-semibold text-[16px]">Latest Chats</span>
              </div>
              <div>
                <div className="flex flex-col bg-white rounded-b-2xl">
                  <div className="flex flex-row p-5 gap-32">
                    <div>Store</div>
                    <div>Customer</div>
                  </div>
                  {dashboardData?.data?.latest_chats?.length > 0 ? (
                    dashboardData.data.latest_chats.map((chat: { 
                      id?: number | string; 
                      chat_id?: number | string; 
                      store?: { name?: string; profile_image?: string }; 
                      customer?: { id?: number | string; user_id?: number | string; name?: string; profile_image?: string }; 
                      customer_id?: number | string;
                      last_message?: string;
                      created_at?: string;
                      type?: string;
                      other?: string;
                      is_unread?: boolean;
                    }) => (
                      <div key={chat.id} className="flex flex-row justify-between pr-5 pl-5 pt-4 pb-4 gap-6.5 border-t-1 border-[#989898]">
                        <div className="flex flex-row items-center gap-2">
                          <img
                            className="w-10 h-10 rounded-full object-cover"
                            src={chat.store?.profile_image ? `https://colala.hmstech.xyz/storage/${chat.store.profile_image}` : images.Users}
                            alt={chat.store?.name || 'Store'}
                          />
                          <span>{chat.store?.name || 'Unknown Store'}</span>
                        </div>
                        <div className="flex flex-row items-center gap-2">
                          <img
                            className="w-10 h-10 rounded-full object-cover"
                            src={chat.customer?.profile_image ? `https://colala.hmstech.xyz/storage/${chat.customer.profile_image}` : images.Users}
                            alt={chat.customer?.name || 'Customer'}
                          />
                          <span>{chat.customer?.name || 'Unknown Customer'}</span>
                          <span className="ml-5">
                            <img
                              className="w-10 h-10 cursor-pointer"
                              src={images.eye}
                              alt="View chat"
                              onClick={() => {
                                const chatId = chat.id ?? chat.chat_id;
                                if (!chatId) return;
                                openChatModal({
                                  id: chatId,
                                  storeName: chat.store?.name,
                                  userName: chat.customer?.name,
                                  lastMessage: chat.last_message,
                                  chatDate: chat.created_at,
                                  type: chat.type,
                                  other: chat.other,
                                  isUnread: chat.is_unread
                                });
                              }}
                            />
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-row justify-center p-8">
                      <span className="text-gray-500">No recent chats</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================
            ORDERS TABLE SECTION
        ======================================================================== */}
        <div className="flex flex-row mt-5">
          <div className="">
            <TabButtons />
          </div>
          <div className="ml-5">
            <BulkActionDropdown
              onActionSelect={handleBulkActionSelect}
              orders={dashboardData?.data?.latest_orders || []}
              selectedOrders={selectedOrders}
            />
          </div>
          <div className="ml-5">
            <div className="relative">
              <input
                type="text"
                placeholder="Search"
                value={searchInput}
                onChange={handleSearchInputChange}
                className="pl-12 pr-6 py-3.5 border border-[#00000080] rounded-lg text-[15px] w-[363px] focus:outline-none bg-white shadow-[0_2px_6px_rgba(0,0,0,0.05)] placeholder-[#00000080]"
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
        </div>

        {/* Orders Table */}
        <div>
          <OrdersTable
            title="Latest Orders"
            onRowSelect={handleOrderSelection}
            onSelectedOrdersChange={handleSelectedOrdersChange}
            filterStatus={activeTab}
            searchTerm={debouncedSearch}
            orders={dashboardData?.data?.latest_orders || []}
          />
        </div>
      </div>
      {/* Chats Modal */}
      <ChatsModel
        isOpen={isChatOpen}
        onClose={closeChatModal}
        chatData={selectedChat || undefined}
      />
    </>
  );
};

export default Dashboard;