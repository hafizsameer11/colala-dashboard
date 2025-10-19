import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import images from "../../../constants/images";
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
  const userTrends = analyticsData?.data?.user_trends || [];
  const orderTrends = analyticsData?.data?.order_trends || [];
  const revenueTrends = analyticsData?.data?.revenue_trends || [];

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

  const handleExportSelect = (option: string) => {
    setIsExportDropdownOpen(false);
    // Handle export logic here
    console.log("Export option selected:", option);
  };

  const handleTimeSelect = (option: string) => {
    setSelectedPeriod(option);
    setIsTimeDropdownOpen(false);
  };

  // Chart data based on API data - Site Statistics
  const chartData = {
    labels: userTrends.slice(-12).map((trend: TrendData) => {
      const date = new Date(trend.date);
      return date.toLocaleDateString('en-US', { month: 'short' });
    }),
    datasets: [
      {
        label: "Orders",
        data: orderTrends.slice(-12).map((trend: TrendData) => trend.total_orders || 0),
        backgroundColor: "#E53E3E",
        borderRadius: 50,
        barThickness: 20,
        stack: "stack1",
      },
      {
        label: "Users",
        data: userTrends.slice(-12).map((trend: TrendData) => trend.total_users || 0),
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
        max: 1200,
        ticks: {
          stepSize: 200,
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

  // Revenue chart data for Subscription Revenue vs Promotions Revenue
  const revenueChartData = {
    labels: revenueTrends.slice(-11).map((trend: TrendData) => {
      const date = new Date(trend.date);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }),
    datasets: [
      {
        label: "Total Revenue",
        data: revenueTrends.slice(-11).map((trend: TrendData) => parseFloat(String(trend.total_revenue)) || 0),
        backgroundColor: "#E53E3E",
        borderRadius: 5,
        barThickness: 33,
        stack: "stack1",
      },
      {
        label: "Successful Revenue",
        data: revenueTrends.slice(-11).map((trend: TrendData) => parseFloat(String(trend.successful_revenue)) || 0),
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
        max: 1400,
        ticks: {
          stepSize: 200,
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
      <div className="pr-5 pl-5 bg-white border-t-1 border-b-1 border-[#787878]">
        <div className="flex flex-row justify-between pt-5 pb-5">
          <div className="flex items-center">
            <h1 className="font-semibold text-2xl">Analytics Dashboard</h1>
          </div>

          <div className="flex items-center gap-4">
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
            <div className="relative">
              <div
                className="flex flex-row border border-[#989898] rounded-lg p-3 cursor-pointer"
                onClick={handleTimeToggle}
              >
                <div className="flex items-center">
                  <button className="cursor-pointer">{selectedPeriod}</button>
                </div>
                <div className="flex items-center ml-5">
                  <img
                    src={images.dropdown}
                    alt="dropdown"
                    className="w-4 h-4"
                  />
                </div>
              </div>

              {isTimeDropdownOpen && (
                <div className="absolute top-full right-0 mt-1 w-[140px] bg-white border border-[#989898] rounded-lg shadow-lg z-10">
                  {timeOptions.map((option) => (
                    <div
                      key={option}
                      className="px-4 py-3 hover:bg-gray-200 rounded-lg cursor-pointer text-left"
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
      <div className="p-6 pb-0">
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
            <div className="flex flex-row gap-6">
              {/* Site Statistics Bar Chart */}
          <div
            className="border border-[#989898] rounded-2xl bg-white"
            style={{ width: "716px", height: "411px" }}
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
            className="border border-[#989898] rounded-2xl bg-white"
            style={{ width: "412px", height: "411px" }}
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
        <div className="flex flex-row gap-6 mt-6 mb-6">
          {/* Analytics Cards */}
          <div className="grid grid-cols-2 gap-6">
            {/* Total Users Card */}
            <div
              className="bg-white border border-gray-300 rounded-2xl"
              style={{ width: "272px", height: "265px" }}
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
              className="bg-white border border-gray-300 rounded-2xl"
              style={{ width: "272px", height: "265px" }}
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
              className="bg-white border border-gray-300 rounded-2xl z-100"
              style={{ width: "272px", height: "265px" }}
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
              className="bg-white border border-gray-300 rounded-2xl"
              style={{ width: "272px", height: "265px" }}
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

          <div>
            {/* Revenue Statistics Chart */}
            <div
              className="border border-[#989898] rounded-2xl bg-white"
              style={{ width: "568px", height: "420px" }}
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
            <div className="grid grid-cols-3 gap-4 mt-6">
              {/* Top Row */}
              <div
                className="bg-[#FF0000] text-white rounded-[15px] p-4 flex items-center gap-3 pl-2"
                style={{ width: "174px", height: "68px" }}
              >
                <div className="w-2 h-9 bg-white rounded"></div>
                <div>
                  <div className="text-xs">Total Users</div>
                  <div className="text-[20px] font-bold">200,000</div>
                </div>
              </div>

              <div
                className="bg-[#008000] text-white rounded-[15px] p-4 flex items-center gap-3 pl-2"
                style={{ width: "174px", height: "68px" }}
              >
                <div className="w-2 h-9 bg-white rounded"></div>
                <div>
                  <div className="text-xs">Active Orders</div>
                  <div className="text-[20px] font-bold">574</div>
                </div>
              </div>

              <div
                className="bg-[#0000FF] text-white rounded-[15px] p-4 flex items-center gap-3 pl-2"
                style={{ width: "174px", height: "68px" }}
              >
                <div className="w-2 h-9 bg-white rounded"></div>
                <div>
                  <div className="text-xs">Completed Orders</div>
                  <div className="text-[20px] font-bold">355</div>
                </div>
              </div>

              {/* Bottom Row */}
              <div
                className="bg-[#800080] text-white rounded-[15px] p-4 flex items-center gap-3 pl-2"
                style={{ width: "174px", height: "68px" }}
              >
                <div className="w-2 h-9 bg-white rounded"></div>
                <div>
                  <div className="text-xs">Products Listed</div>
                  <div className="text-[20px] font-bold">2,000</div>
                </div>
              </div>

              <div
                className="bg-[#FFA500] text-white rounded-[15px] p-4 flex items-center gap-3 pl-2"
                style={{ width: "174px", height: "68px" }}
              >
                <div className="w-2 h-9 bg-white rounded"></div>
                <div>
                  <div className="text-xs">Total Chats</div>
                  <div className="text-[20px] font-bold">124</div>
                </div>
              </div>

              <div
                className="bg-black text-white rounded-[15px] p-4 flex items-center gap-3 pl-2"
                style={{ width: "174px", height: "68px" }}
              >
                <div className="w-2 h-9 bg-white rounded"></div>
                <div>
                  <div className="text-xs">Total Posts</div>
                  <div className="text-[20px] font-bold">15</div>
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
