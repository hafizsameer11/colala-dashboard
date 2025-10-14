import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import images from "../../constants/images";
import BulkActionDropdown from "../../components/BulkActionDropdown";
import OrdersTable from "./OrdersTable";
import PageHeader from "../../components/PageHeader";
import { getDashboardData } from "../../utils/queries/dashboard";
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const tabs = [
  "All",
  "Order Placed",
  "Out for delivery",
  "Delivered",
  "Completed",
  "Disputed",
];

type Tab = (typeof tabs)[number];

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState<Tab>("All");

  // search with debounce
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchInput.trim()), 500);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Fetch dashboard data
  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboardData,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handleBulkActionSelect = (action: string) => {
    console.log("Bulk action selected in Dashboard:", action);
  };

  const handleOrderSelection = (selectedIds: string[]) => {
    console.log("Selected order IDs:", selectedIds);
  };

  const handlePeriodChange = (period: string) => {
    console.log("Period changed to:", period);
  };

  const TabButtons = () => {
    return (
      <div className="flex items-center space-x-0.5 border border-[#989898] rounded-lg p-2 w-fit bg-white">
        {tabs.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 text-sm rounded-lg font-normal transition-all duration-200 cursor-pointer ${
                isActive ? "px-8 bg-[#E53E3E] text-white" : "px-4 text-black"
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>
    );
  };

  // Chart data from API
  const chartData = {
    labels: dashboardData?.data?.site_stats?.chart_data?.map((item: any) => item.month) || [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ],
    datasets: [
      {
        label: "Users",
        data: dashboardData?.data?.site_stats?.chart_data?.map((item: any) => item.users) || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        backgroundColor: "#E53E3E",
        borderRadius: 50,
        barThickness: 20,
        stack: "stack1",
      },
      {
        label: "Orders",
        data: dashboardData?.data?.site_stats?.chart_data?.map((item: any) => item.orders) || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        backgroundColor: "#008000",
        borderRadius: 50,
        barThickness: 20,
        stack: "stack2",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
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

  // Loading component
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

  // Error component
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

  return (
    <>
      <PageHeader title="Dashboard" onPeriodChange={handlePeriodChange} />

      <div className="bg-[#F5F5F5] p-5">
        <div className="flex flex-row gap-6 ">
          {/* Buyer App Statistics */}
          <div className="border border-[#989898] rounded-2xl">
            <div className="flex flex-row items-center gap-2 bg-[#F2F2F2] rounded-t-2xl p-5">
              <span>
                <img className="w-5 h-5" src={images.analyticsIcon} alt="" />
              </span>
              <span className="font-semibold text-[16px]">
                Buyer App Statistics
              </span>
            </div>

            <div className="flex flex-col bg-white p-5 rounded-b-2xl gap-3">
              <div className="flex flex-row gap-3">
                {/* Total Users */}
                <div
                  className="flex flex-row rounded-2xl"
                  style={{ boxShadow: "0px 0px 2px 0px rgba(0, 0, 0, 0.25)" }}
                >
                  <div className="bg-[#470434] rounded-l-2xl p-5 flex justify-center items-center ">
                    <img className="w-7 h-7" src={images.Users} alt="" />
                  </div>
                  <div className="flex flex-col bg-[#FFF1F1] rounded-r-2xl p-3 pr-11 gap-1">
                    <span className="font-semibold text-[15px]">
                      Total Users
                    </span>
                    <span className="font-semibold text-2xl">
                      {dashboardData?.data?.buyer_stats?.total_users?.value || 0}
                    </span>
                    <span className="text-[#00000080] text-[10px] ">
                      <span className="text-[#1DB61D]">
                        +{dashboardData?.data?.buyer_stats?.total_users?.increase || 0}%
                      </span> increase from last month
                    </span>
                  </div>
                </div>

                {/* Total Orders */}
                <div
                  className="flex flex-row rounded-2xl"
                  style={{ boxShadow: "0px 0px 2px 0px rgba(0, 0, 0, 0.25)" }}
                >
                  <div className="bg-[#042A47] rounded-l-2xl p-5 flex justify-center items-center ">
                    <img className="w-7 h-7" src={images.orders} alt="" />
                  </div>
                  <div className="flex flex-col bg-[#FFF1F1] rounded-r-2xl p-3 pr-11 gap-1">
                    <span className="font-semibold text-[15px]">
                      Total Orders
                    </span>
                    <span className="font-semibold text-2xl">
                      {dashboardData?.data?.buyer_stats?.total_orders?.value || 0}
                    </span>
                    <span className="text-[#00000080] text-[10px] ">
                      <span className="text-[#1DB61D]">
                        +{dashboardData?.data?.buyer_stats?.total_orders?.increase || 0}%
                      </span> increase from last month
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-row gap-3">
                {/* Completed Orders */}
                <div
                  className="flex flex-row rounded-2xl "
                  style={{ boxShadow: "0px 0px 2px 0px rgba(0, 0, 0, 0.25)" }}
                >
                  <div className="bg-[#471204] rounded-l-2xl p-5 flex justify-center items-center ">
                    <img className="w-7 h-7" src={images.orders} alt="" />
                  </div>
                  <div className="flex flex-col bg-[#FFF1F1] rounded-r-2xl p-3 pr-11 gap-1">
                    <span className="font-semibold text-[15px]">
                      Completed Orders
                    </span>
                    <span className="font-semibold text-2xl">
                      {dashboardData?.data?.buyer_stats?.completed_orders?.value || 0}
                    </span>
                    <span className="text-[#00000080] text-[10px] ">
                      <span className="text-[#1DB61D]">
                        +{dashboardData?.data?.buyer_stats?.completed_orders?.increase || 0}%
                      </span> increase from last month
                    </span>
                  </div>
                </div>

                {/* Total Transactions */}
                <div
                  className="flex flex-row rounded-2xl"
                  style={{ boxShadow: "0px 0px 2px 0px rgba(0, 0, 0, 0.25)" }}
                >
                  <div className="bg-[#044713] rounded-l-2xl p-5 flex justify-center items-center ">
                    <img className="w-7 h-7" src={images.money} alt="" />
                  </div>
                  <div className="flex flex-col bg-[#FFF1F1] rounded-r-2xl p-3 pr-11 gap-1">
                    <span className="font-semibold text-[15px]">
                      Total Transactions
                    </span>
                    <span className="font-semibold text-2xl">
                      {dashboardData?.data?.buyer_stats?.total_transactions?.value || 0}
                    </span>
                    <span className="text-[#00000080] text-[10px] ">
                      <span className="text-[#1DB61D]">
                        +{dashboardData?.data?.buyer_stats?.total_transactions?.increase || 0}%
                      </span> increase from last month
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Seller App Statistics */}
          <div className="border border-[#989898] rounded-2xl">
            <div className="flex flex-row items-center gap-2 bg-[#F2F2F2] rounded-t-2xl p-5">
              <span>
                <img className="w-5 h-5" src={images.analyticsIcon} alt="" />
              </span>
              <span className="font-semibold text-[16px]">
                Seller App Statistics
              </span>
            </div>

            <div className="flex flex-col bg-white p-5 rounded-b-2xl gap-3">
              <div className="flex flex-row gap-3">
                {/* Total Users */}
                <div
                  className="flex flex-row rounded-2xl"
                  style={{ boxShadow: "0px 0px 2px 0px rgba(0, 0, 0, 0.25)" }}
                >
                  <div className="bg-[#470434] rounded-l-2xl p-5 flex justify-center items-center ">
                    <img className="w-7 h-7" src={images.Users} alt="" />
                  </div>
                  <div className="flex flex-col bg-[#FFF1F1] rounded-r-2xl p-3 pr-11 gap-1">
                    <span className="font-semibold text-[15px]">
                      Total Users
                    </span>
                    <span className="font-semibold text-2xl">
                      {dashboardData?.data?.seller_stats?.total_users?.value || 0}
                    </span>
                    <span className="text-[#00000080] text-[10px] ">
                      <span className="text-[#1DB61D]">
                        +{dashboardData?.data?.seller_stats?.total_users?.increase || 0}%
                      </span> increase from last month
                    </span>
                  </div>
                </div>

                {/* Total Orders */}
                <div
                  className="flex flex-row rounded-2xl"
                  style={{ boxShadow: "0px 0px 2px 0px rgba(0, 0, 0, 0.25)" }}
                >
                  <div className="bg-[#042A47] rounded-l-2xl p-5 flex justify-center items-center ">
                    <img className="w-7 h-7" src={images.orders} alt="" />
                  </div>
                  <div className="flex flex-col bg-[#FFF1F1] rounded-r-2xl p-3 pr-11 gap-1">
                    <span className="font-semibold text-[15px]">
                      Total Orders
                    </span>
                    <span className="font-semibold text-2xl">
                      {dashboardData?.data?.seller_stats?.total_orders?.value || 0}
                    </span>
                    <span className="text-[#00000080] text-[10px] ">
                      <span className="text-[#1DB61D]">
                        +{dashboardData?.data?.seller_stats?.total_orders?.increase || 0}%
                      </span> increase from last month
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-row gap-3">
                {/* Completed Orders */}
                <div
                  className="flex flex-row rounded-2xl "
                  style={{ boxShadow: "0px 0px 2px 0px rgba(0, 0, 0, 0.25)" }}
                >
                  <div className="bg-[#471204] rounded-l-2xl p-5 flex justify-center items-center ">
                    <img className="w-7 h-7" src={images.orders} alt="" />
                  </div>
                  <div className="flex flex-col bg-[#FFF1F1] rounded-r-2xl p-3 pr-11 gap-1">
                    <span className="font-semibold text-[15px]">
                      Completed Orders
                    </span>
                    <span className="font-semibold text-2xl">
                      {dashboardData?.data?.seller_stats?.completed_orders?.value || 0}
                    </span>
                    <span className="text-[#00000080] text-[10px] ">
                      <span className="text-[#1DB61D]">
                        +{dashboardData?.data?.seller_stats?.completed_orders?.increase || 0}%
                      </span> increase from last month
                    </span>
                  </div>
                </div>

                {/* Total Transactions */}
                <div
                  className="flex flex-row rounded-2xl"
                  style={{ boxShadow: "0px 0px 2px 0px rgba(0, 0, 0, 0.25)" }}
                >
                  <div className="bg-[#044713] rounded-l-2xl p-5 flex justify-center items-center ">
                    <img className="w-7 h-7" src={images.money} alt="" />
                  </div>
                  <div className="flex flex-col bg-[#FFF1F1] rounded-r-2xl p-3 pr-11 gap-1">
                    <span className="font-semibold text-[15px]">
                      Total Transactions
                    </span>
                    <span className="font-semibold text-2xl">
                      {dashboardData?.data?.seller_stats?.total_transactions?.value || 0}
                    </span>
                    <span className="text-[#00000080] text-[10px] ">
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

        {/* Chart Section */}
        <div className="mt-6 border border-[#989898] rounded-2xl">
          <div className="flex flex-row items-center gap-2 bg-[#F2F2F2] rounded-t-2xl p-5">
            <span>
              <img className="w-5 h-5" src={images.analyticsIcon} alt="" />
            </span>
            <span className="font-semibold text-[16px]">Site Statistics</span>
          </div>
          <div className="bg-white p-5 rounded-b-2xl">
            <div className="h-80">
              <Bar data={chartData} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* Latest Chats */}
        <div className="mt-6 border border-[#989898] rounded-2xl">
          <div className="flex flex-row items-center gap-2 bg-[#F2F2F2] rounded-t-2xl p-5">
            <span>
              <img className="w-5 h-5" src={images.chat} alt="" />
            </span>
            <span className="font-semibold text-[16px]">Latest Chats</span>
          </div>
          <div className="bg-white p-5 rounded-b-2xl">
            {dashboardData?.data?.latest_chats?.length > 0 ? (
              <div className="space-y-3">
                {dashboardData.data.latest_chats.map((chat: any) => (
                  <div key={chat.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <img 
                          src={chat.store?.profile_image || images.Users} 
                          alt="Store" 
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-semibold">{chat.store?.name || 'Unknown Store'}</p>
                        <p className="text-sm text-gray-500">{chat.customer?.name || 'Unknown Customer'}</p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(chat.last_message_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No recent chats</p>
            )}
          </div>
        </div>

        {/* Latest Orders */}
        <div className="mt-6 border border-[#989898] rounded-2xl">
          <div className="flex flex-row items-center gap-2 bg-[#F2F2F2] rounded-t-2xl p-5">
            <span>
              <img className="w-5 h-5" src={images.orders} alt="" />
            </span>
            <span className="font-semibold text-[16px]">Latest Orders</span>
          </div>
          <div className="bg-white p-5 rounded-b-2xl">
            {dashboardData?.data?.latest_orders?.length > 0 ? (
              <div className="space-y-3">
                {dashboardData.data.latest_orders.map((order: any) => (
                  <div key={order.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-semibold">Order #{order.id}</p>
                      <p className="text-sm text-gray-500">{order.status}</p>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No recent orders</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
