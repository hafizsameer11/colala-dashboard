import { useState, useEffect, useRef, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import images from "../../../constants/images";
import { filterByPeriod } from "../../../utils/periodFilter";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import { getAnalyticsDashboard } from "../../../utils/queries/users";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Analytics = () => {
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);
  const [isSubRevenueDropdownOpen, setIsSubRevenueDropdownOpen] =
    useState(false);
  const [isPromRevenueDropdownOpen, setIsPromRevenueDropdownOpen] =
    useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("This Week");
  const [selectedSubRevenue, setSelectedSubRevenue] = useState("Sub Revenue");
  const [selectedPromRevenue, setSelectedPromRevenue] =
    useState("Prom Revenue");
  const timeDropdownRef = useRef<HTMLDivElement>(null);

  // Fetch analytics data
  const { data: analyticsData, isLoading, error } = useQuery({
    queryKey: ['analyticsDashboard'],
    queryFn: getAnalyticsDashboard,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Debug logging
  console.log('Analytics Debug - API data:', analyticsData);

  // Extract data from API response
  const siteStats = analyticsData?.data?.site_statistics || {};
  const allUserTrends = analyticsData?.data?.user_trends || [];
  const allOrderTrends = analyticsData?.data?.order_trends || [];
  const allRevenueTrends = analyticsData?.data?.revenue_trends || [];
  const allTopStores = analyticsData?.data?.top_stores || [];
  const allCategoryBreakdown = analyticsData?.data?.category_breakdown || [];
  const chatAnalytics = analyticsData?.data?.chat_analytics || {};
  const socialAnalytics = analyticsData?.data?.social_analytics || {};
  
  // Filter trends data by selected period
  const userTrends = useMemo(() => {
    return filterByPeriod(allUserTrends, selectedPeriod, ['date', 'created_at', 'formatted_date']);
  }, [allUserTrends, selectedPeriod]);
  
  const orderTrends = useMemo(() => {
    return filterByPeriod(allOrderTrends, selectedPeriod, ['date', 'created_at', 'formatted_date']);
  }, [allOrderTrends, selectedPeriod]);
  
  const revenueTrends = useMemo(() => {
    return filterByPeriod(allRevenueTrends, selectedPeriod, ['date', 'created_at', 'formatted_date']);
  }, [allRevenueTrends, selectedPeriod]);
  
  const topStores = useMemo(() => {
    return filterByPeriod(allTopStores, selectedPeriod, ['date', 'created_at', 'formatted_date']);
  }, [allTopStores, selectedPeriod]);
  
  const categoryBreakdown = useMemo(() => {
    return filterByPeriod(allCategoryBreakdown, selectedPeriod, ['date', 'created_at', 'formatted_date']);
  }, [allCategoryBreakdown, selectedPeriod]);

  // Type definitions for API data
  interface TrendData {
    date: string;
    total_users?: number;
    buyers?: string | number;
    sellers?: string | number;
    total_orders?: number;
    total_revenue?: string | number;
    successful_revenue?: string | number;
  }

  const exportOptions = [
    "All Analytics Data",
    "All User data",
    "All Revenue Data",
    "All Buyer app data",
    "All Seller data",
  ];
  const timeOptions = [
    "This Week",
    "Last Month",
    "Last 6 Months",
    "Last Year",
    "All time",
  ];

  const subRevenueOptions = [
    "Subscription revenue",
    "Promotion revenue",
    "Buyers",
    "Sellers",
    "New Customers",
    "Returning Customers",
    "Completed Orders",
    "Uncompleted Orders",
    "Disputed Orders",
  ];

  const handleExportToggle = () => {
    setIsExportDropdownOpen(!isExportDropdownOpen);
  };

  const handleTimeToggle = () => {
    setIsTimeDropdownOpen(!isTimeDropdownOpen);
  };
  
  const handleTimeSelect = (option: string) => {
    setSelectedPeriod(option);
    setIsTimeDropdownOpen(false);
  };
  
  // Close time dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (timeDropdownRef.current && !timeDropdownRef.current.contains(event.target as Node)) {
        setIsTimeDropdownOpen(false);
      }
    };

    if (isTimeDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isTimeDropdownOpen]);

  const handleSubRevenueToggle = () => {
    setIsSubRevenueDropdownOpen(!isSubRevenueDropdownOpen);
  };

  const handleSubRevenueSelect = (option: string) => {
    setSelectedSubRevenue(option);
    setIsSubRevenueDropdownOpen(false);
  };

  const handlePromRevenueToggle = () => {
    setIsPromRevenueDropdownOpen(!isPromRevenueDropdownOpen);
  };

  const handlePromRevenueSelect = (option: string) => {
    setSelectedPromRevenue(option);
    setIsPromRevenueDropdownOpen(false);
  };

  // Helper function to convert data to CSV format
  const convertToCSV = (data: any[], headers: string[]): string => {
    if (!data || data.length === 0) {
      return headers.join(',') + '\n';
    }

    // Create a mapping function to get value from row based on header
    const getValue = (row: any, header: string): string => {
      // Try multiple key formats: exact match, lowercase, snake_case, camelCase
      const headerLower = header.toLowerCase();
      const headerSnake = headerLower.replace(/\s+/g, '_');
      const headerCamel = headerLower.replace(/\s+(.)/g, (_, c) => c.toUpperCase());
      
      const value = row[header] || row[headerLower] || row[headerSnake] || row[headerCamel] || '';
      return String(value);
    };

    // Create CSV rows
    const rows = data.map((row) => {
      return headers.map((header) => {
        const value = getValue(row, header);
        
        // Escape commas, quotes, and newlines in values
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  };

  // Helper function to download CSV file
  const downloadCSV = (csvContent: string, filename: string) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportSelect = (option: string) => {
    setIsExportDropdownOpen(false);
    
    if (!analyticsData?.data) {
      alert('No data available to export');
      return;
    }

    try {
      let csvContent = '';
      let filename = '';

      switch (option) {
        case 'All Analytics Data':
          // Export comprehensive analytics data
          const comprehensiveData: any[] = [];

          // Site Statistics Summary
          comprehensiveData.push({
            'Section': 'Site Statistics',
            'Metric': 'Total Users',
            'Value': siteStats.total_users || 0,
            'Date': '',
            'Details': '',
          });
          comprehensiveData.push({
            'Section': 'Site Statistics',
            'Metric': 'Total Buyers',
            'Value': siteStats.total_buyers || 0,
            'Date': '',
            'Details': '',
          });
          comprehensiveData.push({
            'Section': 'Site Statistics',
            'Metric': 'Total Sellers',
            'Value': siteStats.total_sellers || 0,
            'Date': '',
            'Details': '',
          });
          comprehensiveData.push({
            'Section': 'Site Statistics',
            'Metric': 'Total Orders',
            'Value': siteStats.total_orders || 0,
            'Date': '',
            'Details': '',
          });
          comprehensiveData.push({
            'Section': 'Site Statistics',
            'Metric': 'Active Orders',
            'Value': siteStats.active_orders || 0,
            'Date': '',
            'Details': '',
          });
          comprehensiveData.push({
            'Section': 'Site Statistics',
            'Metric': 'Completed Orders',
            'Value': siteStats.completed_orders || 0,
            'Date': '',
            'Details': '',
          });
          comprehensiveData.push({
            'Section': 'Site Statistics',
            'Metric': 'Total Revenue',
            'Value': siteStats.total_revenue || 0,
            'Date': '',
            'Details': '',
          });
          comprehensiveData.push({
            'Section': 'Site Statistics',
            'Metric': 'Total Products',
            'Value': siteStats.total_products || 0,
            'Date': '',
            'Details': '',
          });
          comprehensiveData.push({
            'Section': 'Site Statistics',
            'Metric': 'Total Chats',
            'Value': siteStats.total_chats || 0,
            'Date': '',
            'Details': '',
          });
          comprehensiveData.push({
            'Section': 'Site Statistics',
            'Metric': 'Total Posts',
            'Value': siteStats.total_posts || 0,
            'Date': '',
            'Details': '',
          });

          // User Trends
          userTrends.forEach((trend: TrendData) => {
            comprehensiveData.push({
              'Section': 'User Trends',
              'Date': trend.date || '',
              'Metric': 'Total Users',
              'Value': trend.total_users || 0,
              'Details': `Buyers: ${trend.buyers || 0}, Sellers: ${trend.sellers || 0}`,
            });
          });

          // Order Trends
          orderTrends.forEach((trend: TrendData) => {
            comprehensiveData.push({
              'Section': 'Order Trends',
              'Date': trend.date || '',
              'Metric': 'Total Orders',
              'Value': trend.total_orders || 0,
              'Details': '',
            });
          });

          // Revenue Trends
          revenueTrends.forEach((trend: TrendData) => {
            comprehensiveData.push({
              'Section': 'Revenue Trends',
              'Date': trend.date || '',
              'Metric': 'Total Revenue',
              'Value': typeof trend.total_revenue === 'string'
                ? trend.total_revenue.replace(/[₦,]/g, '')
                : trend.total_revenue || 0,
              'Details': `Successful: ${typeof trend.successful_revenue === 'string'
                ? trend.successful_revenue.replace(/[₦,]/g, '')
                : trend.successful_revenue || 0}`,
            });
          });

          // Top Stores
          topStores.forEach((store: any, index: number) => {
            comprehensiveData.push({
              'Section': 'Top Stores',
              'Date': '',
              'Metric': `Store #${index + 1}`,
              'Value': typeof store.total_revenue === 'string'
                ? store.total_revenue.replace(/[₦,]/g, '')
                : store.total_revenue || 0,
              'Details': `${store.store_name || store.name || 'N/A'} | Orders: ${store.total_orders || 0} | Products: ${store.total_products || 0} | Rating: ${store.average_rating || 0}`,
            });
          });

          // Category Breakdown
          categoryBreakdown.forEach((category: any) => {
            comprehensiveData.push({
              'Section': 'Category Breakdown',
              'Date': '',
              'Metric': category.category_name || category.name || 'N/A',
              'Value': typeof category.total_revenue === 'string'
                ? category.total_revenue.replace(/[₦,]/g, '')
                : category.total_revenue || 0,
              'Details': `Products: ${category.total_products || 0}`,
            });
          });

          // Chat Analytics
          if (chatAnalytics && Object.keys(chatAnalytics).length > 0) {
            Object.entries(chatAnalytics).forEach(([key, value]) => {
              comprehensiveData.push({
                'Section': 'Chat Analytics',
                'Date': '',
                'Metric': key.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
                'Value': value || 0,
                'Details': '',
              });
            });
          }

          // Social Analytics
          if (socialAnalytics && Object.keys(socialAnalytics).length > 0) {
            Object.entries(socialAnalytics).forEach(([key, value]) => {
              comprehensiveData.push({
                'Section': 'Social Analytics',
                'Date': '',
                'Metric': key.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
                'Value': value || 0,
                'Details': '',
              });
            });
          }

          const comprehensiveHeaders = ['Section', 'Date', 'Metric', 'Value', 'Details'];
          csvContent = convertToCSV(comprehensiveData, comprehensiveHeaders);
          filename = `analytics_comprehensive_${new Date().toISOString().split('T')[0]}.csv`;
          break;

        case 'All User data':
          // Export user trends data
          const userHeaders = ['Date', 'Total Users', 'Buyers', 'Sellers'];
          const userData = userTrends.map((trend: TrendData) => ({
            'Date': trend.date || '',
            'Total Users': trend.total_users || 0,
            'Buyers': trend.buyers || 0,
            'Sellers': trend.sellers || 0,
          }));
          csvContent = convertToCSV(userData, userHeaders);
          filename = `analytics_user_data_${new Date().toISOString().split('T')[0]}.csv`;
          break;

        case 'All Revenue Data':
          // Export revenue trends data
          const revenueHeaders = ['Date', 'Total Revenue', 'Successful Revenue'];
          const revenueData = revenueTrends.map((trend: TrendData) => ({
            'Date': trend.date || '',
            'Total Revenue': typeof trend.total_revenue === 'string' 
              ? trend.total_revenue.replace(/[₦,]/g, '') 
              : trend.total_revenue || 0,
            'Successful Revenue': typeof trend.successful_revenue === 'string'
              ? trend.successful_revenue.replace(/[₦,]/g, '')
              : trend.successful_revenue || 0,
          }));
          csvContent = convertToCSV(revenueData, revenueHeaders);
          filename = `analytics_revenue_data_${new Date().toISOString().split('T')[0]}.csv`;
          break;

        case 'All Buyer app data':
          // Export buyer-related data: user trends (buyers), order trends, site stats
          const buyerData: any[] = [];
          
          // Add site statistics summary first
          buyerData.push({
            'category': 'Site Statistics',
            'date': '',
            'metric': 'Total Buyers',
            'buyers': siteStats.total_buyers || 0,
            'total_users': '',
            'total_orders': '',
            'value': '',
          });
          buyerData.push({
            'category': 'Site Statistics',
            'date': '',
            'metric': 'Total Orders',
            'buyers': '',
            'total_users': '',
            'total_orders': siteStats.total_orders || 0,
            'value': '',
          });
          buyerData.push({
            'category': 'Site Statistics',
            'date': '',
            'metric': 'Active Orders',
            'buyers': '',
            'total_users': '',
            'total_orders': siteStats.active_orders || 0,
            'value': '',
          });
          buyerData.push({
            'category': 'Site Statistics',
            'date': '',
            'metric': 'Completed Orders',
            'buyers': '',
            'total_users': '',
            'total_orders': siteStats.completed_orders || 0,
            'value': '',
          });

          // Add user trends with buyer focus
          userTrends.forEach((trend: TrendData) => {
            buyerData.push({
              'category': 'User Trend',
              'date': trend.date || '',
              'metric': 'Buyer Count',
              'buyers': trend.buyers || 0,
              'total_users': trend.total_users || 0,
              'total_orders': '',
              'value': '',
            });
          });

          // Add order trends
          orderTrends.forEach((trend: TrendData) => {
            buyerData.push({
              'category': 'Order Trend',
              'date': trend.date || '',
              'metric': 'Total Orders',
              'buyers': '',
              'total_users': '',
              'total_orders': trend.total_orders || 0,
              'value': '',
            });
          });

          const buyerHeaders = ['Category', 'Date', 'Metric', 'Buyers', 'Total Users', 'Total Orders', 'Value'];
          csvContent = convertToCSV(buyerData, buyerHeaders);
          filename = `analytics_buyer_data_${new Date().toISOString().split('T')[0]}.csv`;
          break;

        case 'All Seller data':
          // Export seller-related data: top stores, seller trends, site stats
          const sellerData: any[] = [];

          // Add site statistics summary first
          sellerData.push({
            'category': 'Site Statistics',
            'date': '',
            'metric': 'Total Sellers',
            'store_name': '',
            'store_id': '',
            'sellers': siteStats.total_sellers || 0,
            'total_users': '',
            'total_revenue': '',
            'total_orders': '',
            'total_products': '',
            'rating': '',
            'value': '',
          });
          sellerData.push({
            'category': 'Site Statistics',
            'date': '',
            'metric': 'Total Products',
            'store_name': '',
            'store_id': '',
            'sellers': '',
            'total_users': '',
            'total_revenue': '',
            'total_orders': '',
            'total_products': siteStats.total_products || 0,
            'rating': '',
            'value': '',
          });

          // Add top stores
          topStores.forEach((store: any) => {
            sellerData.push({
              'category': 'Top Store',
              'date': '',
              'metric': 'Store Performance',
              'store_name': store.store_name || store.name || '',
              'store_id': store.store_id || store.id || '',
              'sellers': '',
              'total_users': '',
              'total_revenue': typeof store.total_revenue === 'string'
                ? store.total_revenue.replace(/[₦,]/g, '')
                : store.total_revenue || 0,
              'total_orders': store.total_orders || 0,
              'total_products': store.total_products || 0,
              'rating': store.average_rating || 0,
              'value': '',
            });
          });

          // Add user trends with seller focus
          userTrends.forEach((trend: TrendData) => {
            sellerData.push({
              'category': 'User Trend',
              'date': trend.date || '',
              'metric': 'Seller Count',
              'store_name': '',
              'store_id': '',
              'sellers': trend.sellers || 0,
              'total_users': trend.total_users || 0,
              'total_revenue': '',
              'total_orders': '',
              'total_products': '',
              'rating': '',
              'value': '',
            });
          });

          const sellerHeaders = ['Category', 'Date', 'Metric', 'Store Name', 'Store ID', 'Sellers', 'Total Users', 'Total Revenue', 'Total Orders', 'Total Products', 'Rating', 'Value'];
          csvContent = convertToCSV(sellerData, sellerHeaders);
          filename = `analytics_seller_data_${new Date().toISOString().split('T')[0]}.csv`;
          break;

        default:
          // Export all analytics data
          const allData: any[] = [];

          // Site Statistics
          allData.push({
            'Category': 'Site Statistics',
            'Metric': 'Total Users',
            'Value': siteStats.total_users || 0,
          });
          allData.push({
            'Category': 'Site Statistics',
            'Metric': 'Total Buyers',
            'Value': siteStats.total_buyers || 0,
          });
          allData.push({
            'Category': 'Site Statistics',
            'Metric': 'Total Sellers',
            'Value': siteStats.total_sellers || 0,
          });
          allData.push({
            'Category': 'Site Statistics',
            'Metric': 'Total Orders',
            'Value': siteStats.total_orders || 0,
          });
          allData.push({
            'Category': 'Site Statistics',
            'Metric': 'Active Orders',
            'Value': siteStats.active_orders || 0,
          });
          allData.push({
            'Category': 'Site Statistics',
            'Metric': 'Completed Orders',
            'Value': siteStats.completed_orders || 0,
          });
          allData.push({
            'Category': 'Site Statistics',
            'Metric': 'Total Revenue',
            'Value': siteStats.total_revenue || 0,
          });
          allData.push({
            'Category': 'Site Statistics',
            'Metric': 'Total Products',
            'Value': siteStats.total_products || 0,
          });
          allData.push({
            'Category': 'Site Statistics',
            'Metric': 'Total Chats',
            'Value': siteStats.total_chats || 0,
          });
          allData.push({
            'Category': 'Site Statistics',
            'Metric': 'Total Posts',
            'Value': siteStats.total_posts || 0,
          });

          // User Trends
          userTrends.forEach((trend: TrendData) => {
            allData.push({
              'Category': 'User Trends',
              'Date': trend.date || '',
              'Total Users': trend.total_users || 0,
              'Buyers': trend.buyers || 0,
              'Sellers': trend.sellers || 0,
            });
          });

          // Order Trends
          orderTrends.forEach((trend: TrendData) => {
            allData.push({
              'Category': 'Order Trends',
              'Date': trend.date || '',
              'Total Orders': trend.total_orders || 0,
            });
          });

          // Revenue Trends
          revenueTrends.forEach((trend: TrendData) => {
            allData.push({
              'Category': 'Revenue Trends',
              'Date': trend.date || '',
              'Total Revenue': typeof trend.total_revenue === 'string'
                ? trend.total_revenue.replace(/[₦,]/g, '')
                : trend.total_revenue || 0,
              'Successful Revenue': typeof trend.successful_revenue === 'string'
                ? trend.successful_revenue.replace(/[₦,]/g, '')
                : trend.successful_revenue || 0,
            });
          });

          // Top Stores
          topStores.forEach((store: any) => {
            allData.push({
              'Category': 'Top Stores',
              'Store Name': store.store_name || store.name || '',
              'Store ID': store.store_id || store.id || '',
              'Total Revenue': typeof store.total_revenue === 'string'
                ? store.total_revenue.replace(/[₦,]/g, '')
                : store.total_revenue || 0,
              'Total Orders': store.total_orders || 0,
              'Total Products': store.total_products || 0,
              'Rating': store.average_rating || 0,
            });
          });

          // Category Breakdown
          categoryBreakdown.forEach((category: any) => {
            allData.push({
              'Category': 'Category Breakdown',
              'Category Name': category.category_name || category.name || '',
              'Category ID': category.category_id || category.id || '',
              'Total Products': category.total_products || 0,
              'Total Revenue': typeof category.total_revenue === 'string'
                ? category.total_revenue.replace(/[₦,]/g, '')
                : category.total_revenue || 0,
            });
          });

          // Chat Analytics
          if (chatAnalytics && Object.keys(chatAnalytics).length > 0) {
            Object.entries(chatAnalytics).forEach(([key, value]) => {
              allData.push({
                'Category': 'Chat Analytics',
                'Metric': key.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
                'Value': value || 0,
              });
            });
          }

          // Social Analytics
          if (socialAnalytics && Object.keys(socialAnalytics).length > 0) {
            Object.entries(socialAnalytics).forEach(([key, value]) => {
              allData.push({
                'Category': 'Social Analytics',
                'Metric': key.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
                'Value': value || 0,
              });
            });
          }

          const allHeaders = ['Category', 'Date', 'Metric', 'Value', 'Total Users', 'Buyers', 'Sellers', 'Total Orders', 'Total Revenue', 'Successful Revenue', 'Store Name', 'Store ID', 'Total Products', 'Rating', 'Category Name', 'Category ID'];
          csvContent = convertToCSV(allData, allHeaders);
          filename = `analytics_all_data_${new Date().toISOString().split('T')[0]}.csv`;
          break;
      }

      if (csvContent) {
        downloadCSV(csvContent, filename);
      } else {
        alert('No data available to export for this option');
      }
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Failed to export data. Please try again.');
    }
  };

  // Helper function to calculate max value for chart with padding
  const calculateMaxValue = (values: number[], paddingPercent: number = 20): number => {
    if (!values || values.length === 0) return 100;
    const maxValue = Math.max(...values);
    if (maxValue === 0) return 100;
    const paddedMax = maxValue * (1 + paddingPercent / 100);
    // Round up to nearest nice number (10, 50, 100, 500, 1000, etc.)
    const magnitude = Math.pow(10, Math.floor(Math.log10(paddedMax)));
    const normalized = paddedMax / magnitude;
    let rounded;
    if (normalized <= 1) rounded = 1;
    else if (normalized <= 2) rounded = 2;
    else if (normalized <= 5) rounded = 5;
    else rounded = 10;
    return rounded * magnitude;
  };

  // Calculate max values for charts
  const ordersData = orderTrends.slice(-12).map((trend: TrendData) => trend.total_orders || 0);
  const usersData = userTrends.slice(-12).map((trend: TrendData) => trend.total_users || 0);
  const combinedData = [...ordersData, ...usersData];
  const chartMaxValue = calculateMaxValue(combinedData, 20);
  const chartStepSize = chartMaxValue <= 100 ? 20 : chartMaxValue <= 500 ? 50 : chartMaxValue <= 1000 ? 100 : 200;

  // Chart data based on API data - Site Statistics
  const chartData = {
    labels: orderTrends.slice(-12).map((trend: TrendData) => {
      const date = new Date(trend.date);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }),
    datasets: [
      {
        label: "Orders",
        data: ordersData,
        backgroundColor: "#E53E3E",
        borderRadius: 50,
        barThickness: 20,
        stack: "stack1",
      },
      {
        label: "Users",
        data: usersData,
        backgroundColor: "#008000",
        borderRadius: 50,
        barThickness: 20,
        stack: "stack2",
      },
    ],
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "#000000",
        titleColor: "#ffffff",
        bodyColor: "#ffffff",
        borderColor: "#ffffff",
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          label: function (context: any) {
            const label = context.dataset.label || "";
            const value = context.parsed.y;
            return `${label}: ${value.toLocaleString()}`;
          },
        },
      },
    },
    scales: {
      x: {
        stacked: false,
        grid: {
          display: false,
        },
        border: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        max: chartMaxValue,
        ticks: {
          stepSize: chartStepSize,
        },
        grid: {
          display: false,
        },
        border: {
          display: false,
        },
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

  // Pie chart data for Users vs Orders
  const pieChartData = {
    labels: ["Users", "Orders"],
    datasets: [
      {
        data: [
          siteStats.total_users || 0,
          siteStats.total_orders || 0
        ],
        backgroundColor: ["#E53E3E", "#000000"],
        borderWidth: 0,
        cutout: "55%", // Creates the doughnut hole
      },
    ],
  };

  // Calculate max value for revenue chart
  const totalRevenueData = revenueTrends.slice(-11).map((trend: TrendData) => {
    const value = String(trend.total_revenue || 0).replace(/[₦,]/g, '');
    return parseFloat(value) || 0;
  });
  const successfulRevenueData = revenueTrends.slice(-11).map((trend: TrendData) => {
    const value = String(trend.successful_revenue || 0).replace(/[₦,]/g, '');
    return parseFloat(value) || 0;
  });
  const revenueCombinedData = [...totalRevenueData, ...successfulRevenueData];
  const revenueMaxValue = calculateMaxValue(revenueCombinedData, 20);
  const revenueStepSize = revenueMaxValue <= 100 ? 20 : revenueMaxValue <= 500 ? 50 : revenueMaxValue <= 1000 ? 100 : revenueMaxValue <= 5000 ? 500 : 1000;

  // Revenue chart data for Subscription Revenue vs Promotions Revenue
  const revenueChartData = {
    labels: revenueTrends.slice(-11).map((trend: TrendData) => {
      const date = new Date(trend.date);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }),
    datasets: [
      {
        label: "Total Revenue",
        data: totalRevenueData,
        backgroundColor: "#E53E3E",
        borderRadius: 5,
        barThickness: 33,
        stack: "stack1",
      },
      {
        label: "Successful Revenue",
        data: successfulRevenueData,
        backgroundColor: "#000",
        borderRadius: 5,
        barThickness: 33,
        stack: "stack1",
      },
    ],
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const revenueChartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "#000000",
        titleColor: "#ffffff",
        bodyColor: "#ffffff",
        borderColor: "#ffffff",
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          label: function (context: any) {
            const label = context.dataset.label || "";
            const value = context.parsed.y;
            return `${label}: ${value.toLocaleString()}`;
          },
        },
      },
    },
    scales: {
      x: {
        stacked: true,
        grid: {
          display: false,
        },
        border: {
          display: false,
        },
        ticks: {
          color: "#666666",
        },
      },
      y: {
        stacked: true,
        beginAtZero: true,
        max: revenueMaxValue,
        ticks: {
          stepSize: revenueStepSize,
          color: "#666666",
        },
        grid: {
          display: false,
        },
        border: {
          display: false,
        },
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pieChartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "#000000",
        titleColor: "#ffffff",
        bodyColor: "#ffffff",
        borderColor: "#ffffff",
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          label: function (context: any) {
            return `${context.label}: ${context.parsed}%`;
          },
        },
      },
    },
  };

  return (
    <div>
      {/* Analytics Header */}
      <div className="pr-3 sm:pr-4 md:pr-5 pl-3 sm:pl-4 md:pl-5 bg-white border-t-1 border-b-1 border-[#787878]">
        <div className="flex flex-col sm:flex-row justify-between pt-3 sm:pt-4 md:pt-5 pb-3 sm:pb-4 md:pb-5 gap-3 sm:gap-4">
          <div className="flex items-center">
            <h1 className="font-semibold text-lg sm:text-xl md:text-2xl">Analytics Dashboard</h1>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
            {/* Export Dropdown */}
            <div className="relative">
              <div
                className="flex flex-row bg-red-500 text-white rounded-lg px-4 py-3 cursor-pointer hover:bg-red-600 transition-colors"
                onClick={handleExportToggle}
              >
                <div className="flex items-center">
                  <button className="cursor-pointer font-medium">
                    Export CSV
                  </button>
                </div>
                <div className="flex items-center ml-3">
                  <img
                    src={images.dropdown}
                    alt="dropdown"
                    className="filter invert w-4 h-4"
                  />
                </div>
              </div>

              {isExportDropdownOpen && (
                <div className="absolute top-full right-0 mt-2 w-[170px] bg-white border border-[#989898] rounded-lg shadow-lg z-10">
                  {exportOptions.map((option) => (
                    <div
                      key={option}
                      className="px-4 py-3 hover:bg-gray-200 cursor-pointer rounded-lg text-left text-black"
                      onClick={() => handleExportSelect(option)}
                    >
                      {option}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Time Period Dropdown */}
            <div className="relative" ref={timeDropdownRef}>
              <div
                className="flex flex-row border border-[#989898] rounded-lg p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={handleTimeToggle}
              >
                <div className="flex items-center">
                  <button className="cursor-pointer">{selectedPeriod}</button>
                </div>
                <div className="flex items-center ml-5">
                  <img
                    src={images.dropdown}
                    alt="dropdown"
                    className={`w-4 h-4 transition-transform ${isTimeDropdownOpen ? 'rotate-180' : ''}`}
                  />
                </div>
              </div>

              {isTimeDropdownOpen && (
                <div className="absolute top-full right-0 mt-1 w-[140px] bg-white border border-[#989898] rounded-lg shadow-lg z-10">
                  {timeOptions.map((option) => (
                    <div
                      key={option}
                      className={`px-4 py-3 hover:bg-gray-200 rounded-lg cursor-pointer text-left transition-colors ${
                        selectedPeriod === option ? "bg-gray-100 font-semibold" : ""
                      }`}
                      onClick={() => handleTimeSelect(option)}
                    >
                      {option}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Content */}
      <div className="p-3 sm:p-4 md:p-6 pb-0">
        {isLoading && (
          <div className="flex justify-center items-center h-64">
            <div className="text-lg">Loading analytics data...</div>
          </div>
        )}
        
        {error && (
          <div className="flex justify-center items-center h-64">
            <div className="text-lg text-red-600">Error loading analytics data. Please try again.</div>
          </div>
        )}
        
        {!isLoading && !error && (
          <>
            <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
              {/* Site Statistics Bar Chart */}
          <div
            className="border border-[#989898] rounded-2xl bg-white w-full lg:w-auto lg:flex-1"
            style={{ minWidth: "300px", height: "411px" }}
          >
            <div className="flex flex-row justify-between bg-[#F2F2F2] rounded-t-2xl p-5">
              <div className="flex flex-row items-center gap-2">
                <span>
                  <img
                    className="w-5 h-5"
                    src={images.analyticsIcon}
                    alt="analytics"
                  />
                </span>
                <span className="font-semibold text-[16px]">
                  Site Statistics
                </span>
              </div>
              <div className="flex flex-row items-center gap-4">
                <div className="flex flex-row items-center gap-1">
                  <div className="bg-[#008000] w-3 h-3 rounded-sm"></div>
                  <span className="text-sm">Users</span>
                </div>
                <div className="flex flex-row items-center gap-1">
                  <div className="bg-[#E53E3E] w-3 h-3 rounded-sm"></div>
                  <span className="text-sm">Orders</span>
                </div>
              </div>
            </div>
            <div className="p-5">
              <div style={{ height: "310px" }}>
                <Bar data={chartData} options={chartOptions} />
              </div>
            </div>
          </div>

          {/* Site Statistics Pie Chart */}
          <div
            className="border border-[#989898] rounded-2xl bg-white w-full lg:w-auto lg:flex-1"
            style={{ minWidth: "300px", height: "411px" }}
          >
            <div className="flex flex-row justify-between bg-[#F2F2F2] rounded-t-2xl p-5">
              <div className="flex flex-row items-center gap-2">
                <span>
                  <img
                    className="w-5 h-5"
                    src={images.analyticsIcon}
                    alt="analytics"
                  />
                </span>
                <span className="font-semibold text-[16px]">
                  Site Statistics
                </span>
              </div>
              <div className="flex flex-row items-center gap-4">
                <div className="flex flex-row items-center gap-1">
                  <div className="bg-[#E53E3E] w-3 h-3 rounded-sm"></div>
                  <span className="text-sm">Users</span>
                </div>
                <div className="flex flex-row items-center gap-1">
                  <div className="bg-[#000000] w-3 h-3 rounded-sm"></div>
                  <span className="text-sm">Orders</span>
                </div>
              </div>
            </div>
            <div className="p-5 relative">
              <div style={{ height: "270px" }}>
                <Doughnut data={pieChartData} options={pieChartOptions} />
              </div>
              {/* Percentage Labels */}
              <div className="absolute bottom-0 left-8 flex items-center gap-1">
                <div className="w-2 h-7 bg-[#E53E3E] rounded"></div>
                <span className="text-3xl font-bold text-[#E53E3E]">
                  {isLoading ? '...' : siteStats.total_users ? Math.round((siteStats.total_users / (siteStats.total_users + siteStats.total_orders)) * 100) : 0}%
                </span>
              </div>
              <div className="absolute bottom-0 right-8 flex items-center gap-1">
                <span className="text-3xl font-bold text-[#000000]">
                  {isLoading ? '...' : siteStats.total_orders ? Math.round((siteStats.total_orders / (siteStats.total_users + siteStats.total_orders)) * 100) : 0}%
                </span>
                <div className="w-2 h-7 bg-[#000000] rounded"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Cards and Revenue Chart Section */}
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 mt-4 sm:mt-6 mb-4 sm:mb-6">
          {/* Analytics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 w-full lg:w-auto">
            {/* Total Users Card */}
            <div
              className="bg-white border border-gray-300 rounded-2xl w-full"
              style={{ maxWidth: "272px", height: "265px", margin: "0 auto" }}
            >
              <div className="p-6 flex flex-col h-full">
                <h3 className="text-lg font-semibold text-center mb-6">
                  Total Users
                </h3>

                {/* Progress Semicircle */}
                <div className="flex justify-center  relative z-10">
                  <svg width="190" height="120" className="">
                    {/* Background semicircle */}
                    <path
                      d="M 15 95 A 80 80 0 0 1 175 95"
                      stroke="#E5E7EB"
                      strokeWidth="12"
                      fill="none"
                      strokeLinecap="round"
                    />
                    {/* Progress semicircle (75% of semicircle) */}
                    <path
                      d="M 15 95 A 80 80 0 0 1 175 95"
                      stroke="#008000"
                      strokeWidth="14"
                      fill="none"
                      strokeDasharray={`${Math.PI * 80}`}
                      strokeDashoffset={`${Math.PI * 80 * (1 - 0.75)}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  {/* Center icon */}
                  <div className="absolute top-14 left-1/2 transform -translate-x-1/2">
                    <div className="bg-green-100 rounded-lg p-3">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        className="text-green-600"
                      >
                        <path
                          d="M7 14L12 9L17 14"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="text-center mt-auto">
                  <div className="text-3xl font-bold text-black mb-2">
                    {isLoading ? '...' : (siteStats.total_users || 0).toLocaleString()}
                  </div>
                  <div className="text-[10px]  text-gray-600">
                    <span className="text-green-600 font-semibold">
                      {isLoading ? '...' : (siteStats.total_buyers || 0)}
                    </span>{" "}
                    buyers
                  </div>
                </div>
              </div>
            </div>

            {/* Total Sellers Card */}
            <div
              className="bg-white border border-gray-300 rounded-2xl w-full"
              style={{ maxWidth: "272px", height: "265px", margin: "0 auto" }}
            >
              <div className="p-6 flex flex-col h-full">
                <h3 className="text-lg font-semibold text-center mb-6">
                  Total Sellers
                </h3>

                {/* Progress Semicircle */}
                <div className="flex justify-center relative z-10">
                  <svg width="190" height="120" className="">
                    {/* Background semicircle */}
                    <path
                      d="M 15 95 A 80 80 0 0 1 175 95"
                      stroke="#E5E7EB"
                      strokeWidth="12"
                      fill="none"
                      strokeLinecap="round"
                    />
                    {/* Progress semicircle (25% of semicircle) */}
                    <path
                      d="M 15 95 A 80 80 0 0 1 175 95"
                      stroke="#EF4444"
                      strokeWidth="14"
                      fill="none"
                      strokeDasharray={`${Math.PI * 80}`}
                      strokeDashoffset={`${Math.PI * 80 * (1 - 0.25)}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  {/* Center icon */}
                  <div className="absolute top-14 left-1/2 transform -translate-x-1/2">
                    <div className="bg-red-100 rounded-lg p-3">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        className="text-red-600"
                      >
                        <path
                          d="M17 10L12 15L7 10"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="text-center mt-auto">
                  <div className="text-3xl font-bold text-black mb-2">
                    {isLoading ? '...' : (siteStats.total_sellers || 0).toLocaleString()}
                  </div>
                  <div className="text-[10px] text-gray-600">
                    <span className="text-green-600 font-semibold">
                      {isLoading ? '...' : (siteStats.total_products || 0)}
                    </span>{" "}
                    products
                  </div>
                </div>
              </div>
            </div>

            {/* Total Buyers Card */}
            <div
              className="bg-white border border-gray-300 rounded-2xl z-100 w-full"
              style={{ maxWidth: "272px", height: "265px", margin: "0 auto" }}
            >
              <div className="p-6 flex flex-col h-full">
                <h3 className="text-lg font-semibold text-center mb-6">
                  Total Buyers
                </h3>

                {/* Progress Semicircle */}
                <div className="flex justify-center relative z-10">
                  <svg width="190" height="120" className="">
                    {/* Background semicircle */}
                    <path
                      d="M 15 95 A 80 80 0 0 1 175 95"
                      stroke="#E5E7EB"
                      strokeWidth="12"
                      fill="none"
                      strokeLinecap="round"
                    />
                    {/* Progress semicircle (75% of semicircle) */}
                    <path
                      d="M 15 95 A 80 80 0 0 1 175 95"
                      stroke="#008000"
                      strokeWidth="14"
                      fill="none"
                      strokeDasharray={`${Math.PI * 80}`}
                      strokeDashoffset={`${Math.PI * 80 * (1 - 0.75)}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  {/* Center icon */}
                  <div className="absolute top-14 left-1/2 transform -translate-x-1/2">
                    <div className="bg-green-100 rounded-lg p-3">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        className="text-green-600"
                      >
                        <path
                          d="M7 14L12 9L17 14"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="text-center mt-auto">
                  <div className="text-3xl font-bold text-black mb-2">
                    {isLoading ? '...' : (siteStats.total_buyers || 0).toLocaleString()}
                  </div>
                  <div className="text-[10px] text-gray-600">
                    <span className="text-green-600 font-semibold">
                      {isLoading ? '...' : (siteStats.total_orders || 0)}
                    </span>{" "}
                    orders
                  </div>
                </div>
              </div>
            </div>

            {/* Revenue Generated Card */}
            <div
              className="bg-white border border-gray-300 rounded-2xl w-full"
              style={{ maxWidth: "272px", height: "265px", margin: "0 auto" }}
            >
              <div className="p-6 flex flex-col h-full">
                <h3 className="text-lg font-semibold text-center mb-6">
                  Revenue Generated
                </h3>

                {/* Progress Semicircle */}
                <div className="flex justify-center relative z-10">
                  <svg width="190" height="120" className="">
                    {/* Background semicircle */}
                    <path
                      d="M 15 95 A 80 80 0 0 1 175 95"
                      stroke="#E5E7EB"
                      strokeWidth="12"
                      fill="none"
                      strokeLinecap="round"
                    />
                    {/* Progress semicircle (85% of semicircle) */}
                    <path
                      d="M 15 95 A 80 80 0 0 1 175 95"
                      stroke="#008000"
                      strokeWidth="14"
                      fill="none"
                      strokeDasharray={`${Math.PI * 80}`}
                      strokeDashoffset={`${Math.PI * 80 * (1 - 0.85)}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  {/* Center icon */}
                  <div className="absolute top-14 left-1/2 transform -translate-x-1/2">
                    <div className="bg-green-100 rounded-lg p-3">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        className="text-green-600"
                      >
                        <path
                          d="M7 14L12 9L17 14"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="text-center mt-auto">
                  <div className="text-3xl font-bold text-black mb-2">
                    {isLoading ? '...' : `₦${(siteStats.total_revenue || 0).toLocaleString()}`}
                  </div>
                  <div className="text-[10px] text-gray-600">
                    <span className="text-green-600 font-semibold">
                      {isLoading ? '...' : (siteStats.total_chats || 0)}
                    </span>{" "}
                    chats
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-auto lg:flex-1">
            {/* Revenue Statistics Chart */}
            <div
              className="border border-[#989898] rounded-2xl bg-white w-full"
              style={{ minWidth: "300px", height: "420px" }}
            >
              <div className="flex flex-row justify-between bg-[#F2F2F2] rounded-t-2xl p-5">
                <div className="flex flex-row items-center gap-2">
                  <span>
                    <img
                      className="w-5 h-5"
                      src={images.analyticsIcon}
                      alt="analytics"
                    />
                  </span>
                  <span className="font-semibold text-[16px]">
                    Site Statistics
                  </span>
                </div>
                <div className="flex flex-row items-center gap-1.5">
                  <div className="bg-[#E53E3E] rounded-full w-2 h-8 mt-1"></div>
                  <div className="relative">
                    <div
                      className="flex flex-row items-center gap-2 bg-white border border-gray-300 rounded-xl px-3 py-2 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={handleSubRevenueToggle}
                    >
                      <span className="text-md">{selectedSubRevenue}</span>
                      <img
                        src={images.dropdown}
                        alt="dropdown"
                        className={`w-4 h-4 items-center transition-transform ${
                          isSubRevenueDropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                    </div>

                    {isSubRevenueDropdownOpen && (
                      <div className="absolute top-full right-0 mt-2 w-[200px] bg-white border border-gray-300 rounded-xl shadow-lg z-20">
                        {subRevenueOptions.map((option, index) => (
                          <div
                            key={index}
                            className="px-4 py-3 hover:bg-gray-100 cursor-pointer text-left text-black first:rounded-t-xl last:rounded-b-xl transition-colors"
                            onClick={() => handleSubRevenueSelect(option)}
                          >
                            {option}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="bg-[#000000] rounded-full w-2 h-8 mt-1"></div>
                  <div className="relative">
                    <div
                      className="flex flex-row items-center gap-2 bg-white border border-gray-300 rounded-xl px-3 py-2 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={handlePromRevenueToggle}
                    >
                      <span className="text-md">{selectedPromRevenue}</span>
                      <img
                        src={images.dropdown}
                        alt="dropdown"
                        className={`w-4 h-4 items-center transition-transform ${
                          isPromRevenueDropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                    </div>

                    {isPromRevenueDropdownOpen && (
                      <div className="absolute top-full right-0 mt-2 w-[200px] bg-white border border-gray-300 rounded-xl shadow-lg z-20">
                        {subRevenueOptions.map((option, index) => (
                          <div
                            key={index}
                            className="px-4 py-3 hover:bg-gray-100 cursor-pointer text-left text-gray-700 first:rounded-t-xl last:rounded-b-xl transition-colors"
                            onClick={() => handlePromRevenueSelect(option)}
                          >
                            {option}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="p-5 ">
                <div style={{ height: "270px" }}>
                  <Bar data={revenueChartData} options={revenueChartOptions} />
                </div>
                {/* Legend */}
                <div className="flex flex-row justify-center gap-8 mt-4">
                  <div className="flex flex-row items-center gap-2">
                    <div className="bg-[#E53E3E] w-4 h-4 rounded-sm"></div>
                    <span className="text-sm font-medium">
                      Subscription Revenue
                    </span>
                  </div>
                  <div className="flex flex-row items-center gap-2">
                    <div className="bg-[#000000] w-4 h-4 rounded-sm"></div>
                    <span className="text-sm font-medium">
                      Promotions Revenue
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mt-4 sm:mt-6">
              {/* Top Row */}
              <div
                className="bg-[#FF0000] text-white rounded-[15px] p-3 sm:p-4 flex items-center gap-2 sm:gap-3 pl-2 w-full"
                style={{ maxWidth: "174px", height: "68px", margin: "0 auto" }}
              >
                <div className="w-2 h-9 bg-white rounded"></div>
                <div>
                  <div className="text-xs">Active Orders</div>
                  <div className="text-[20px] font-bold">
                    {isLoading ? '...' : (siteStats.active_orders || 0).toLocaleString()}
                  </div>
                </div>
              </div>

              <div
                className="bg-[#008000] text-white rounded-[15px] p-3 sm:p-4 flex items-center gap-2 sm:gap-3 pl-2 w-full"
                style={{ maxWidth: "174px", height: "68px", margin: "0 auto" }}
              >
                <div className="w-2 h-9 bg-white rounded"></div>
                <div>
                  <div className="text-xs">Completed Orders</div>
                  <div className="text-[20px] font-bold">
                    {isLoading ? '...' : (siteStats.completed_orders || 0).toLocaleString()}
                  </div>
                </div>
              </div>

              <div
                className="bg-[#0000FF] text-white rounded-[15px] p-3 sm:p-4 flex items-center gap-2 sm:gap-3 pl-2 w-full"
                style={{ maxWidth: "174px", height: "68px", margin: "0 auto" }}
              >
                <div className="w-2 h-9 bg-white rounded"></div>
                <div>
                  <div className="text-xs">Total Products</div>
                  <div className="text-[20px] font-bold">
                    {isLoading ? '...' : (siteStats.total_products || 0).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Bottom Row */}
              <div
                className="bg-[#800080] text-white rounded-[15px] p-3 sm:p-4 flex items-center gap-2 sm:gap-3 pl-2 w-full"
                style={{ maxWidth: "174px", height: "68px", margin: "0 auto" }}
              >
                <div className="w-2 h-9 bg-white rounded"></div>
                <div>
                  <div className="text-xs">Total Chats</div>
                  <div className="text-[20px] font-bold">
                    {isLoading ? '...' : (siteStats.total_chats || 0).toLocaleString()}
                  </div>
                </div>
              </div>

              <div
                className="bg-[#FFA500] text-white rounded-[15px] p-3 sm:p-4 flex items-center gap-2 sm:gap-3 pl-2 w-full"
                style={{ maxWidth: "174px", height: "68px", margin: "0 auto" }}
              >
                <div className="w-2 h-9 bg-white rounded"></div>
                <div>
                  <div className="text-xs">Total Posts</div>
                  <div className="text-[20px] font-bold">
                    {isLoading ? '...' : (siteStats.total_posts || 0).toLocaleString()}
                  </div>
                </div>
              </div>

              <div
                className="bg-black text-white rounded-[15px] p-3 sm:p-4 flex items-center gap-2 sm:gap-3 pl-2 w-full"
                style={{ maxWidth: "174px", height: "68px", margin: "0 auto" }}
              >
                <div className="w-2 h-9 bg-white rounded"></div>
                <div>
                  <div className="text-xs">Total Revenue</div>
                  <div className="text-[20px] font-bold">
                    {isLoading ? '...' : `₦${(siteStats.total_revenue || 0).toLocaleString()}`}
                  </div>
                </div>
              </div>
            </div>
          </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Analytics;
