import { useState, useEffect, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import images from "../../constants/images";
import StatCard from "../../components/StatCard";
import StatCardGrid from "../../components/StatCardGrid";
import BulkActionDropdown from "../../components/BulkActionDropdown";
import OrdersTable from "./OrdersTable";
import PageHeader from "../../components/PageHeader";
import { getDashboardData } from "../../utils/queries/dashboard";
import ChatsModel from "../general/chats/components/chatmodel";
import OrderDetails from "../sellers_Mgt/Modals/orderDetails";
import { filterByPeriod } from "../../utils/periodFilter";
import { useAuth } from "../../contexts/AuthContext";
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
  // AUTHENTICATION & AUTHORIZATION
  // ============================================================================
  const { roles } = useAuth();
  
  // Check if user is an account officer
  const roleSlugs = roles.map(r => r.slug);
  const isAccountOfficer = roleSlugs.includes('account_officer');
  
  // Block account officers from accessing dashboard
  if (isAccountOfficer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600">
            Account officers cannot access the dashboard.
          </p>
        </div>
      </div>
    );
  }

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

  // Period filter state - MUST be declared before useMemo hooks that use it
  const [selectedPeriod, setSelectedPeriod] = useState<string>("All time");

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

  // Order details modal state
  const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | number | undefined>(undefined);

  // ============================================================================
  // API DATA FETCHING
  // ============================================================================

  /**
   * Fetch dashboard data using React Query
   * Includes buyer stats, seller stats, site stats, latest chats, and latest orders
   * Note: Period filter can be applied server-side or client-side
   * For now, we'll try server-side first, fallback to client-side if API doesn't support it
   */
  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ['dashboard', selectedPeriod],
    queryFn: () => getDashboardData(selectedPeriod),
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes (shorter for better updates)
    enabled: true,
  });

  // Helper function to parse order_date format: "29-12-2025\/21:12PM" or "26-12-2025/20:10PM"
  const parseOrderDate = (dateString: string): Date | null => {
    if (!dateString) return null;
    
    try {
      // Handle escaped backslash format: "29-12-2025\/21:12PM"
      // Replace escaped backslash with regular forward slash
      const normalizedDate = dateString.replace(/\\\//g, '/').replace(/\\/g, '/');
      
      // Handle format: "26-12-2025/20:10PM" or "29-12-2025/21:12PM"
      const parts = normalizedDate.split('/');
      if (parts.length === 2) {
        const datePart = parts[0].trim(); // "26-12-2025" or "29-12-2025"
        const timePart = parts[1].trim(); // "20:10PM" or "21:12PM"
        
        // Parse date part: DD-MM-YYYY
        const dateComponents = datePart.split('-');
        if (dateComponents.length === 3) {
          const day = parseInt(dateComponents[0], 10);
          const month = parseInt(dateComponents[1], 10) - 1; // Month is 0-indexed
          const year = parseInt(dateComponents[2], 10);
          
          // Validate parsed values
          if (isNaN(day) || isNaN(month) || isNaN(year)) {
            console.warn('Invalid date components:', { day, month, year, dateString });
            return null;
          }
          
          // Parse time part: HH:MMAM/PM
          let hours = 0;
          let minutes = 0;
          if (timePart) {
            const isPM = timePart.toUpperCase().includes('PM');
            const timeOnly = timePart.replace(/[AP]M/i, '').trim();
            const timeComponents = timeOnly.split(':');
            if (timeComponents.length >= 2) {
              hours = parseInt(timeComponents[0], 10);
              minutes = parseInt(timeComponents[1], 10);
              if (isNaN(hours) || isNaN(minutes)) {
                console.warn('Invalid time components:', { hours, minutes, timePart, dateString });
                return null;
              }
              if (isPM && hours !== 12) hours += 12;
              if (!isPM && hours === 12) hours = 0;
            }
          }
          
          const parsedDate = new Date(year, month, day, hours, minutes);
          
          // Validate the parsed date
          if (isNaN(parsedDate.getTime())) {
            console.warn('Invalid parsed date:', { year, month, day, hours, minutes, dateString });
            return null;
          }
          
          return parsedDate;
        }
      }
      
      // Fallback to standard Date parsing
      const parsed = new Date(normalizedDate);
      if (!isNaN(parsed.getTime())) {
        return parsed;
      }
    } catch (error) {
      console.warn('Error parsing order date:', dateString, error);
    }
    
    return null;
  };

  // Memoize filtered data to prevent unnecessary recalculations
  // These filters update when selectedPeriod changes, causing the page to re-render with filtered data
  const filteredOrders = useMemo(() => {
    const orders = dashboardData?.data?.latest_orders || [];
    let filtered = [...orders];
    
    // Apply period filter
    if (selectedPeriod && selectedPeriod !== "All time") {
      const now = new Date();
      let startDate: Date;
      
      switch (selectedPeriod.trim()) {
        case "This Week":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "Last Month":
          startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
          break;
        case "Last 6 Months":
          startDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
          break;
        case "Last Year":
          startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
          break;
        default:
          startDate = new Date(0); // Include all dates
      }
      
      filtered = filtered.filter((o: any) => {
        const orderDate = o.order_date || o.created_at || o.date;
        if (!orderDate) {
          // Exclude items without dates when filtering by period
          return false;
        }
        
        const parsedDate = parseOrderDate(String(orderDate));
        if (!parsedDate) {
          // Exclude items with unparseable dates when filtering by period
          console.warn('Could not parse order date:', orderDate, 'for order:', o.id);
          return false;
        }
        
        // Check if order date is within the selected period
        const isInPeriod = parsedDate >= startDate && parsedDate <= now;
        
        // Debug logging for development
        if (process.env.NODE_ENV === 'development' && !isInPeriod) {
          console.log('Order filtered out by period:', {
            orderId: o.id,
            orderDate: orderDate,
            parsedDate: parsedDate.toISOString(),
            startDate: startDate.toISOString(),
            now: now.toISOString(),
            period: selectedPeriod
          });
        }
        
        return isInPeriod;
      });
    }
    
    // Apply status filter
    if (activeTab === "All") {
      // Exclude completed orders from "All" tab - they should only show in "Completed" tab
      filtered = filtered.filter((o: any) => {
        if (!o.status) return true; // Include orders without status
        const orderStatus = String(o.status).toLowerCase().trim();
        return !orderStatus.includes('completed');
      });
    } else {
      const filterStatusLower = activeTab.toLowerCase().trim();
      filtered = filtered.filter((o: any) => {
        if (!o.status) return false;
        const orderStatus = String(o.status).toLowerCase().trim();
        
        // Direct exact match
        if (orderStatus === filterStatusLower) return true;
        
        // Handle status variations
        const orderStatusNormalized = orderStatus.replace(/_/g, " ").replace(/\s+/g, " ").trim();
        const filterStatusNormalized = filterStatusLower.replace(/_/g, " ").replace(/\s+/g, " ").trim();
        if (orderStatusNormalized === filterStatusNormalized) return true;
        
        // Handle specific status patterns
        if (filterStatusLower === "pending_acceptance" || filterStatusLower === "pending acceptance") {
          return (orderStatus.includes("pending") && orderStatus.includes("acceptance")) ||
                 orderStatusNormalized.includes("pending acceptance");
        }
        if (filterStatusLower === "out_for_delivery" || filterStatusLower === "out for delivery") {
          return (orderStatus.includes("out") && orderStatus.includes("delivery")) ||
                 orderStatusNormalized.includes("out for delivery");
        }
        if (filterStatusLower === "paid") {
          return orderStatus === "paid" || orderStatus.startsWith("paid") || orderStatus.endsWith("paid");
        }
        if (filterStatusLower === "accepted") {
          return orderStatus === "accepted" || orderStatus.includes("accepted");
        }
        if (filterStatusLower === "delivered") {
          return orderStatus === "delivered" || orderStatus.includes("delivered");
        }
        if (filterStatusLower === "completed") {
          return orderStatus === "completed" || orderStatus.includes("completed");
        }
        if (filterStatusLower === "disputed") {
          return orderStatus === "disputed" || orderStatus.includes("disputed");
        }
        
        return false;
      });
    }
    
    // Debug logging
    if (process.env.NODE_ENV === 'development') {
      console.log('Dashboard - Filtered Orders:', {
        period: selectedPeriod,
        statusFilter: activeTab,
        totalOrders: orders.length,
        filteredCount: filtered.length,
        sampleOrder: orders[0] ? {
          id: orders[0].id,
          order_date: orders[0].order_date,
          status: orders[0].status,
        } : null,
      });
    }
    
    return filtered;
  }, [dashboardData?.data?.latest_orders, selectedPeriod, activeTab]);

  const filteredChats = useMemo(() => {
    const chats = dashboardData?.data?.latest_chats || [];
    const filtered = filterByPeriod(chats, selectedPeriod, ['last_message_at', 'created_at', 'chat_date']);
    
    // Debug logging
    if (process.env.NODE_ENV === 'development') {
      console.log('Dashboard - Filtered Chats:', {
        period: selectedPeriod,
        totalChats: chats.length,
        filteredCount: filtered.length,
      });
    }
    
    return filtered;
  }, [dashboardData?.data?.latest_chats, selectedPeriod]);

  // Calculate statistics from filtered orders based on API response structure
  const calculatedStats = useMemo(() => {
    const orders = filteredOrders;
    
    // Calculate statistics from filtered orders
    const totalOrders = orders.length;
    const completedOrders = orders.filter((o: any) => {
      const status = String(o.status || '').toLowerCase().trim();
      return status === 'completed' || status.includes('completed');
    }).length;
    
    // Calculate total transaction value from filtered orders
    // Price format: "1,040.00" or "378,800.00" - need to remove commas and parse
    const totalTransactionValue = orders.reduce((sum: number, o: any) => {
      try {
        const priceStr = String(o.price || '0').replace(/,/g, '').trim();
        const price = parseFloat(priceStr) || 0;
        return sum + price;
      } catch (error) {
        console.warn('Error parsing price for order:', o.id, o.price, error);
        return sum;
      }
    }, 0);
    
    // Use API stats when "All time" is selected, otherwise use filtered data
    const useApiStats = selectedPeriod === "All time" && activeTab === "All";
    
    // Get base stats from API
    const buyerStats = dashboardData?.data?.buyer_stats || {};
    const sellerStats = dashboardData?.data?.seller_stats || {};
    
    // For "All time", use API values; otherwise, calculate from filtered orders
    // Users can't be calculated from orders, so always use API value
    const buyerTotalUsers = buyerStats.total_users?.value || 0;
    const sellerTotalUsers = sellerStats.total_users?.value || 0;
    
    // Transactions: use calculated value from filtered orders when filtering
    const buyerTotalTransactions = useApiStats
      ? (buyerStats.total_transactions?.value || 0)
      : Math.round(totalTransactionValue);
    
    const sellerTotalTransactions = useApiStats
      ? (sellerStats.total_transactions?.value || 0)
      : Math.round(totalTransactionValue);
    
    // Debug logging
    if (process.env.NODE_ENV === 'development') {
      console.log('Dashboard Statistics Calculation:', {
        period: selectedPeriod,
        activeTab,
        totalOrders,
        completedOrders,
        totalTransactionValue,
        buyerTotalTransactions,
        sellerTotalTransactions,
        useApiStats,
        filteredOrdersCount: orders.length,
        sampleOrders: orders.slice(0, 3).map((o: any) => ({
          id: o.id,
          price: o.price,
          order_date: o.order_date,
          status: o.status
        }))
      });
    }
    
    return {
      buyer: {
        total_users: {
          value: buyerTotalUsers,
          increase: useApiStats ? (buyerStats.total_users?.increase || 0) : 0,
        },
        total_orders: {
          value: totalOrders,
          increase: useApiStats ? (buyerStats.total_orders?.increase || 0) : 0,
        },
        completed_orders: {
          value: useApiStats ? (buyerStats.completed_orders?.value || 0) : completedOrders,
          increase: useApiStats ? (buyerStats.completed_orders?.increase || 0) : 0,
        },
        total_transactions: {
          value: buyerTotalTransactions,
          increase: useApiStats ? (buyerStats.total_transactions?.increase || 0) : 0,
        },
      },
      seller: {
        total_users: {
          value: sellerTotalUsers,
          increase: useApiStats ? (sellerStats.total_users?.increase || 0) : 0,
        },
        total_orders: {
          value: totalOrders,
          increase: useApiStats ? (sellerStats.total_orders?.increase || 0) : 0,
        },
        completed_orders: {
          value: useApiStats ? (sellerStats.completed_orders?.value || 0) : completedOrders,
          increase: useApiStats ? (sellerStats.completed_orders?.increase || 0) : 0,
        },
        total_transactions: {
          value: sellerTotalTransactions,
          increase: useApiStats ? (sellerStats.total_transactions?.increase || 0) : 0,
        },
      },
    };
  }, [filteredOrders, selectedPeriod, activeTab, dashboardData]);

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
   * This updates the period filter which affects orders and chats display
   * Triggers a refetch of dashboard data with the new period
   */
  const handlePeriodChange = (period: string) => {
    console.log("Period changed to:", period);
    setSelectedPeriod(period);
    // Reset selected orders when period changes
    setSelectedOrders([]);
    // Refetch data with new period (React Query will handle this via queryKey change)
    // The queryKey includes selectedPeriod, so it will automatically refetch
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

  /**
   * Open order details modal
   */
  const handleViewOrderDetails = (orderId: string | number) => {
    setSelectedOrderId(String(orderId));
    setIsOrderDetailsOpen(true);
  };

  /**
   * Close order details modal
   */
  const closeOrderDetailsModal = () => {
    setIsOrderDetailsOpen(false);
    setSelectedOrderId(undefined);
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
   * Chart data updates when period filter changes
   */
  const chartData = useMemo(() => {
    const chartDataFromApi = dashboardData?.data?.site_stats?.chart_data || [];
    
    // If period is "All time", show all data
    // Otherwise, filter chart data by period (client-side filtering)
    let filteredChartData = chartDataFromApi;
    
    if (selectedPeriod && selectedPeriod !== "All time" && chartDataFromApi.length > 0) {
      const now = new Date();
      let startDate: Date;
      
      switch (selectedPeriod.trim()) {
        case "This Week":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "Last Month":
          startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
          break;
        case "Last 6 Months":
          startDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
          break;
        case "Last Year":
          startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
          break;
        default:
          startDate = new Date(0);
      }
      
      // Filter chart data by month
      filteredChartData = chartDataFromApi.filter((item: any) => {
        if (!item.month) return true;
        // Parse month name to date (e.g., "Jan" -> January of current year)
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthIndex = monthNames.findIndex(m => m.toLowerCase() === item.month.toLowerCase().substring(0, 3));
        if (monthIndex === -1) return true;
        
        const itemDate = new Date(now.getFullYear(), monthIndex, 1);
        return itemDate >= startDate && itemDate <= now;
      });
    }
    
    const usersData = filteredChartData.map((item: { users: number }) => item.users || 0);
    const ordersData = filteredChartData.map((item: { orders: number }) => item.orders || 0);
    const labels = filteredChartData.map((item: { month: string }) => item.month) || [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    
    // If no data, fill with zeros for all 12 months
    if (usersData.length === 0 && ordersData.length === 0) {
      return {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        datasets: [
          {
            label: "Users",
            data: new Array(12).fill(0),
            backgroundColor: "#E53E3E",
            borderRadius: 50,
            barThickness: 20,
            stack: "stack1",
          },
          {
            label: "Orders",
            data: new Array(12).fill(0),
            backgroundColor: "#008000",
            borderRadius: 50,
            barThickness: 20,
            stack: "stack2",
          },
        ],
      };
    }
    
    return {
      labels,
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
  }, [dashboardData?.data?.site_stats?.chart_data, selectedPeriod]);

  /**
   * Calculate dynamic max value and step size based on actual data
   */
  const calculateChartMax = () => {
    // Find the maximum value across both datasets from chartData
    const allValues = [
      ...(chartData.datasets[0]?.data || []),
      ...(chartData.datasets[1]?.data || [])
    ];
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
      <div className="flex items-center space-x-0.5 border border-[#989898] rounded-lg p-1.5 sm:p-2 w-fit bg-white overflow-x-auto">
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
              className={`py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg font-normal transition-all duration-200 cursor-pointer select-none whitespace-nowrap ${isActive
                  ? "px-4 sm:px-6 md:px-8 bg-[#E53E3E] text-white"
                  : isTabChanging
                    ? "px-2 sm:px-3 md:px-4 text-gray-400 cursor-not-allowed"
                    : "px-2 sm:px-3 md:px-4 text-black hover:bg-gray-100 active:bg-gray-200"
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

      <div className="bg-[#F5F5F5] p-3 sm:p-4 md:p-5">
        {/* ========================================================================
            STATISTICS CARDS SECTION
        ======================================================================== */}
        <div className="flex flex-col lg:flex-row gap-4 md:gap-6">

          {/* Buyer App Statistics */}
          <div className="border border-[#989898] rounded-2xl flex-1 w-full">
            <div className="flex flex-row items-center gap-2 bg-[#F2F2F2] rounded-t-2xl p-3 sm:p-4 md:p-5">
              <span>
                <img className="w-4 h-4 sm:w-5 sm:h-5" src={images.analyticsIcon} alt="" />
              </span>
              <span className="font-semibold text-sm sm:text-base md:text-[16px]">Buyer App Statistics</span>
            </div>

            <div className="flex flex-col bg-white p-5 rounded-b-2xl gap-3">
              {/* First Row: Total Users & Total Orders */}
              <StatCardGrid columns={2}>
                <StatCard
                  icon={images.Users}
                  title="Total Users"
                  value={calculatedStats.buyer.total_users.value}
                  subtitle={
                    <>
                      <span className="text-[#1DB61D]">
                        +{calculatedStats.buyer.total_users.increase}%
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
                  value={calculatedStats.buyer.completed_orders.value}
                  subtitle={
                    <>
                      <span className="text-[#1DB61D]">
                        +{calculatedStats.buyer.completed_orders.increase}%
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
          <div className="border border-[#989898] rounded-2xl flex-1 w-full">
            <div className="flex flex-row items-center gap-2 bg-[#F2F2F2] rounded-t-2xl p-3 sm:p-4 md:p-5">
              <span>
                <img className="w-4 h-4 sm:w-5 sm:h-5" src={images.analyticsIcon} alt="" />
              </span>
              <span className="font-semibold text-sm sm:text-base md:text-[16px]">Seller App Statistics</span>
            </div>

            <div className="flex flex-col bg-white p-3 sm:p-4 md:p-5 rounded-b-2xl gap-3">
              {/* First Row: Total Users & Total Orders */}
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Total Users Card */}
                <div className="flex flex-row rounded-2xl flex-1" style={{ boxShadow: "0px 0px 2px 0px rgba(0, 0, 0, 0.25)" }}>
                  <div className="bg-[#470434] rounded-l-2xl p-3 sm:p-4 md:p-5 flex justify-center items-center">
                    <img className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" src={images.Users} alt="" />
                  </div>
                  <div className="flex flex-col bg-[#FFF1F1] rounded-r-2xl p-2 sm:p-3 pr-4 sm:pr-6 md:pr-11 gap-1 flex-1 min-w-0">
                    <span className="font-semibold text-xs sm:text-sm md:text-[15px]">Total Users</span>
                    <span className="font-semibold text-lg sm:text-xl md:text-2xl">
                      {calculatedStats.seller.total_users.value}
                    </span>
                    <span className="text-[#00000080] text-[9px] sm:text-[10px]">
                      <span className="text-[#1DB61D]">
                        +{calculatedStats.seller.total_users.increase}%
                      </span> increase from last month
                    </span>
                  </div>
                </div>

                {/* Total Orders Card */}
                <div className="flex flex-row rounded-2xl flex-1" style={{ boxShadow: "0px 0px 2px 0px rgba(0, 0, 0, 0.25)" }}>
                  <div className="bg-[#042A47] rounded-l-2xl p-3 sm:p-4 md:p-5 flex justify-center items-center">
                    <img className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" src={images.orders} alt="" />
                  </div>
                  <div className="flex flex-col bg-[#FFF1F1] rounded-r-2xl p-2 sm:p-3 pr-4 sm:pr-6 md:pr-11 gap-1 flex-1 min-w-0">
                    <span className="font-semibold text-xs sm:text-sm md:text-[15px]">Total Orders</span>
                    <span className="font-semibold text-lg sm:text-xl md:text-2xl">
                      {dashboardData?.data?.seller_stats?.total_orders?.value || 0}
                    </span>
                    <span className="text-[#00000080] text-[9px] sm:text-[10px]">
                      <span className="text-[#1DB61D]">
                        +{calculatedStats.seller.total_orders.increase}%
                      </span> increase from last month
                    </span>
                  </div>
                </div>
              </div>

              {/* Second Row: Completed Orders & Total Transactions */}
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Completed Orders Card */}
                <div className="flex flex-row rounded-2xl flex-1" style={{ boxShadow: "0px 0px 2px 0px rgba(0, 0, 0, 0.25)" }}>
                  <div className="bg-[#471204] rounded-l-2xl p-3 sm:p-4 md:p-5 flex justify-center items-center">
                    <img className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" src={images.orders} alt="" />
                  </div>
                  <div className="flex flex-col bg-[#FFF1F1] rounded-r-2xl p-2 sm:p-3 pr-4 sm:pr-6 md:pr-11 gap-1 flex-1 min-w-0">
                    <span className="font-semibold text-xs sm:text-sm md:text-[15px]">Completed Orders</span>
                    <span className="font-semibold text-lg sm:text-xl md:text-2xl">
                      {calculatedStats.seller.completed_orders.value}
                    </span>
                    <span className="text-[#00000080] text-[9px] sm:text-[10px]">
                      <span className="text-[#1DB61D]">
                        +{calculatedStats.seller.completed_orders.increase}%
                      </span> increase from last month
                    </span>
                  </div>
                </div>

                {/* Total Transactions Card */}
                <div className="flex flex-row rounded-2xl flex-1" style={{ boxShadow: "0px 0px 2px 0px rgba(0, 0, 0, 0.25)" }}>
                  <div className="bg-[#044713] rounded-l-2xl p-3 sm:p-4 md:p-5 flex justify-center items-center">
                    <img className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" src={images.money} alt="" />
                  </div>
                  <div className="flex flex-col bg-[#FFF1F1] rounded-r-2xl p-2 sm:p-3 pr-4 sm:pr-6 md:pr-11 gap-1 flex-1 min-w-0">
                    <span className="font-semibold text-xs sm:text-sm md:text-[15px]">Total Transactions</span>
                    <span className="font-semibold text-lg sm:text-xl md:text-2xl">
                      {dashboardData?.data?.seller_stats?.total_transactions?.value || 0}
                    </span>
                    <span className="text-[#00000080] text-[9px] sm:text-[10px]">
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
        <div className="flex flex-col lg:flex-row gap-4 md:gap-5 mt-4 md:mt-5">

          {/* Site Statistics Chart */}
          <div className="w-full lg:w-auto lg:flex-1">
            <div className="border border-[#989898] rounded-2xl bg-white w-full">
              <div className="flex flex-col sm:flex-row justify-between bg-[#F2F2F2] rounded-t-2xl p-3 sm:p-4 md:p-5 gap-2 sm:gap-0">
                <div className="flex flex-row items-center gap-2">
                  <span>
                    <img className="w-5 h-5" src={images.analyticsIcon} alt="" />
                  </span>
                  <span className="font-semibold text-sm sm:text-[16px]">Site Statistics</span>
                </div>
                <div className="flex flex-row items-center gap-2 sm:gap-2">
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
              <div className="p-3 sm:p-4 md:p-5">
                <div className="w-full overflow-x-auto">
                  <div className="w-full min-w-[300px]" style={{ height: "250px", minHeight: "250px" }}>
                    <Bar data={chartData} options={chartOptions} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Latest Chats */}
          <div className="w-full lg:w-auto lg:flex-1">
            <div className="border border-[#989898] rounded-2xl">
              <div className="flex flex-row items-center bg-[#F2F2F2] rounded-t-2xl p-3 sm:p-4 md:p-5 gap-2">
                <span>
                  <img className="w-5 h-5" src={images.analyticsIcon} alt="" />
                </span>
                <span className="font-semibold text-sm sm:text-[16px]">Latest Chats</span>
              </div>
              <div>
                <div className="flex flex-col bg-white rounded-b-2xl">
                  <div className="flex flex-row p-3 sm:p-4 md:p-5 gap-4 sm:gap-8 md:gap-16 lg:gap-32 justify-between">
                    <div className="text-sm sm:text-base">Store</div>
                    <div className="text-sm sm:text-base">Customer</div>
                  </div>
                  {(() => {
                    return filteredChats.length > 0 ? (
                      filteredChats.map((chat: { 
                        id?: number | string; 
                        chat_id?: number | string; 
                        store?: { name?: string; profile_image?: string }; 
                        customer?: { id?: number | string; user_id?: number | string; name?: string; profile_image?: string }; 
                        customer_id?: number | string;
                        last_message?: string;
                        created_at?: string;
                        last_message_at?: string;
                        type?: string;
                        other?: string;
                        is_unread?: boolean;
                      }) => (
                      <div key={chat.id} className="flex flex-col sm:flex-row justify-between pr-3 sm:pr-4 md:pr-5 pl-3 sm:pl-4 md:pl-5 pt-3 sm:pt-4 pb-3 sm:pb-4 gap-3 sm:gap-4 border-t-1 border-[#989898]">
                        <div className="flex flex-row items-center gap-2 min-w-0 flex-1">
                          <img
                            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover flex-shrink-0"
                            src={chat.store?.profile_image ? `hhttps://api.colalamall.com/storage/${chat.store.profile_image}` : images.Users}
                            alt={chat.store?.name || 'Store'}
                          />
                          <span className="text-xs sm:text-sm truncate">{chat.store?.name || 'Unknown Store'}</span>
                        </div>
                        <div className="flex flex-row items-center gap-2 min-w-0 flex-1 sm:justify-end">
                          <img
                            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover flex-shrink-0"
                            src={chat.customer?.profile_image ? `hhttps://api.colalamall.com/storage/${chat.customer.profile_image}` : images.Users}
                            alt={chat.customer?.name || 'Customer'}
                          />
                          <span className="text-xs sm:text-sm truncate">{chat.customer?.name || 'Unknown Customer'}</span>
                          <span className="ml-2 sm:ml-5 flex-shrink-0">
                            <img
                              className="w-8 h-8 sm:w-10 sm:h-10 cursor-pointer"
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
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================
            ORDERS TABLE SECTION
        ======================================================================== */}
        <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 md:gap-5 mt-4 md:mt-5">
          <div className="w-full sm:w-auto overflow-x-auto">
            <TabButtons />
          </div>
          <div className="w-full sm:w-auto">
            <BulkActionDropdown
              onActionSelect={handleBulkActionSelect}
              orders={dashboardData?.data?.latest_orders || []}
              selectedOrders={selectedOrders}
            />
          </div>
          <div className="w-full sm:flex-1 sm:max-w-md">
            <div className="relative">
              <input
                type="text"
                placeholder="Search"
                value={searchInput}
                onChange={handleSearchInputChange}
                className="pl-12 pr-6 py-2.5 sm:py-3.5 border border-[#00000080] rounded-lg text-sm sm:text-[15px] w-full max-w-full sm:max-w-[363px] focus:outline-none bg-white shadow-[0_2px_6px_rgba(0,0,0,0.05)] placeholder-[#00000080]"
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
            filterStatus="All"
            searchTerm={debouncedSearch}
            orders={filteredOrders}
            onViewDetails={handleViewOrderDetails}
          />
        </div>
      </div>
      {/* Chats Modal */}
      <ChatsModel
        isOpen={isChatOpen}
        onClose={closeChatModal}
        chatData={selectedChat || undefined}
      />
      {/* Order Details Modal */}
      <OrderDetails
        isOpen={isOrderDetailsOpen}
        onClose={closeOrderDetailsModal}
        orderId={selectedOrderId?.toString()}
      />
    </>
  );
};

export default Dashboard;