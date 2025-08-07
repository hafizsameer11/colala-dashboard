import React, { useState } from "react";
import images from "../../constants/images";
import BulkActionDropdown from "../../components/BulkActionDropdown";
import OrdersTable from "./OrdersTable";
import PageHeader from "../../components/PageHeader";
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

const Dashboard = () => {
  const handleBulkActionSelect = (action: string) => {
    // Handle the bulk action selection from the parent component
    console.log("Bulk action selected in Dashboard:", action);
    // Add your custom logic here
  };

  const handleOrderSelection = (selectedIds: string[]) => {
    // Handle selected order IDs
    console.log("Selected order IDs:", selectedIds);
    // You can use this to enable/disable bulk actions or perform other operations
  };

  const handlePeriodChange = (period: string) => {
    // Handle period change from PageHeader
    console.log("Period changed to:", period);
    // Add your logic here to filter data based on selected period
  };

  const tabs = [
    "All",
    "Order Placed",
    "Out for delivery",
    "Delivered",
    "Completed",
    "Disputed",
  ];

  const TabButtons = () => {
    const [activeTab, setActiveTab] = useState("All");

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

  // Chart data based on the image
  const chartData = {
    labels: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
    datasets: [
      {
        label: "Users",
        data: [690, 140, 350, 100, 520, 680, 100, 350, 1150, 220, 140, 100],
        backgroundColor: "#E53E3E",
        borderRadius: 50,
        barThickness: 20,
        stack: "stack1", // important to make separate stacks
      },
      {
        label: "Orders",
        data: [300, 1170, 650, 650, 650, 950, 650, 220, 550, 350, 500, 980],
        backgroundColor: "#008000",
        borderRadius: 50,
        barThickness: 20,
        stack: "stack2", // different stack creates spacing
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // This removes the internal chart legend
      },
    },
    scales: {
      x: {
        stacked: false, // important to allow stacks to render side-by-side
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

  return (
    <>
      <PageHeader title="Dashboard" onPeriodChange={handlePeriodChange} />

      <div className="bg-[#F5F5F5] p-5">
        <div className="flex flex-row gap-6 ">
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
                {/* Card 1 */}
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
                    <span className="font-semibold text-2xl">1,500</span>
                    <span className="text-[#00000080] text-[10px] ">
                      <span className="text-[#1DB61D]">+5%</span> increase from
                      last month
                    </span>
                  </div>
                </div>

                {/* Card 2 */}
                <div
                  className="flex flex-row rounded-2xl"
                  style={{ boxShadow: "0px 0px 2px 0px rgba(0, 0, 0, 0.25)" }}
                >
                  <div className="bg-[#042A47] rounded-l-2xl p-5 flex justify-center items-center ">
                    <img className="w-7 h-7" src={images.orders} alt="" />
                  </div>
                  <div className="flex flex-col bg-[#FFF1F1] rounded-r-2xl p-3 pr-11 gap-1">
                    <span className="font-semibold text-[15px]">
                      Total Users
                    </span>
                    <span className="font-semibold text-2xl">1,500</span>
                    <span className="text-[#00000080] text-[10px] ">
                      <span className="text-[#1DB61D]  ">+5%</span> increase
                      from last month
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-row gap-3">
                {/* Card 1 */}
                <div
                  className="flex flex-row rounded-2xl "
                  style={{ boxShadow: "0px 0px 2px 0px rgba(0, 0, 0, 0.25)" }}
                >
                  <div className="bg-[#471204] rounded-l-2xl p-5 flex justify-center items-center ">
                    <img className="w-7 h-7" src={images.orders} alt="" />
                  </div>
                  <div className="flex flex-col bg-[#FFF1F1] rounded-r-2xl p-3 pr-11 gap-1">
                    <span className="font-semibold text-[15px]">
                      Total Users
                    </span>
                    <span className="font-semibold text-2xl">1,500</span>
                    <span className="text-[#00000080] text-[10px] ">
                      <span className="text-[#1DB61D]">+5%</span> increase from
                      last month
                    </span>
                  </div>
                </div>

                {/* Card 2 */}
                <div
                  className="flex flex-row rounded-2xl"
                  style={{ boxShadow: "0px 0px 2px 0px rgba(0, 0, 0, 0.25)" }}
                >
                  <div className="bg-[#044713] rounded-l-2xl p-5 flex justify-center items-center ">
                    <img className="w-7 h-7" src={images.money} alt="" />
                  </div>
                  <div className="flex flex-col bg-[#FFF1F1] rounded-r-2xl p-3 pr-11 gap-1">
                    <span className="font-semibold text-[15px]">
                      Total Users
                    </span>
                    <span className="font-semibold text-2xl">1,500</span>
                    <span className="text-[#00000080] text-[10px] ">
                      <span className="text-[#1DB61D]  ">+5%</span> increase
                      from last month
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

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
                {/* Card 1 */}
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
                    <span className="font-semibold text-2xl">1,500</span>
                    <span className="text-[#00000080] text-[10px] ">
                      <span className="text-[#1DB61D]">+5%</span> increase from
                      last month
                    </span>
                  </div>
                </div>

                {/* Card 2 */}
                <div
                  className="flex flex-row rounded-2xl"
                  style={{ boxShadow: "0px 0px 2px 0px rgba(0, 0, 0, 0.25)" }}
                >
                  <div className="bg-[#042A47] rounded-l-2xl p-5 flex justify-center items-center ">
                    <img className="w-7 h-7" src={images.orders} alt="" />
                  </div>
                  <div className="flex flex-col bg-[#FFF1F1] rounded-r-2xl p-3 pr-11 gap-1">
                    <span className="font-semibold text-[15px]">
                      Total Users
                    </span>
                    <span className="font-semibold text-2xl">1,500</span>
                    <span className="text-[#00000080] text-[10px] ">
                      <span className="text-[#1DB61D]  ">+5%</span> increase
                      from last month
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-row gap-3">
                {/* Card 1 */}
                <div
                  className="flex flex-row rounded-2xl"
                  style={{ boxShadow: "0px 0px 2px 0px rgba(0, 0, 0, 0.25)" }}
                >
                  <div className="bg-[#471204] rounded-l-2xl p-5 flex justify-center items-center ">
                    <img className="w-7 h-7" src={images.orders} alt="" />
                  </div>
                  <div className="flex flex-col bg-[#FFF1F1] rounded-r-2xl p-3 pr-11 gap-1">
                    <span className="font-semibold text-[15px]">
                      Total Users
                    </span>
                    <span className="font-semibold text-2xl">1,500</span>
                    <span className="text-[#00000080] text-[10px] ">
                      <span className="text-[#1DB61D]">+5%</span> increase from
                      last month
                    </span>
                  </div>
                </div>

                {/* Card 2 */}
                <div
                  className="flex flex-row rounded-2xl"
                  style={{ boxShadow: "0px 0px 2px 0px rgba(0, 0, 0, 0.25)" }}
                >
                  <div className="bg-[#044713] rounded-l-2xl p-5 flex justify-center items-center ">
                    <img className="w-7 h-7" src={images.money} alt="" />
                  </div>
                  <div className="flex flex-col bg-[#FFF1F1] rounded-r-2xl p-3 pr-11 gap-1">
                    <span className="font-semibold text-[15px]">
                      Total Users
                    </span>
                    <span className="font-semibold text-2xl">1,500</span>
                    <span className="text-[#00000080] text-[10px] ">
                      <span className="text-[#1DB61D]  ">+5%</span> increase
                      from last month
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-row gap-5 mt-5">
          {/* Site Statistics Chart */}
          <div className="">
            <div className="border border-[#989898] rounded-2xl bg-white w-180">
              <div className="flex flex-row justify-between bg-[#F2F2F2] rounded-t-2xl p-5">
                <div className="flex flex-row items-center gap-2">
                  <span>
                    <img
                      className="w-5 h-5"
                      src={images.analyticsIcon}
                      alt=""
                    />
                  </span>
                  <span className="font-semibold text-[16px]">
                    Site Statistics
                  </span>
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
                  <div className="flex flex-row p-5 gap-32 ">
                    <div>Store</div>
                    <div>Customer</div>
                  </div>
                  <div className="flex flex-row justify-between pr-5 pl-5 pt-4 pb-4 gap-6.5 border-t-1 border-[#989898]">
                    <div className="flex flex-row items-center gap-2">
                      <img className="w-10 h-10" src={images.sasha} alt="" />
                      <span>Sasha Stores</span>
                    </div>
                    <div className="flex flex-row items-center gap-2">
                      <img className="w-10 h-10" src={images.admin} alt="" />
                      <span>Adam Sandler</span>
                      <span className="ml-5">
                        <img
                          className="w-10 h-10 cursor-pointer"
                          src={images.eye}
                          alt=""
                        />
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-row justify-between pr-5 pl-5 pt-4 pb-4 gap-6.5 border-t-1 border-[#989898]">
                    <div className="flex flex-row items-center gap-2">
                      <img className="w-10 h-10" src={images.bella} alt="" />
                      <span>Sasha Stores</span>
                    </div>
                    <div className="flex flex-row items-center gap-2">
                      <img className="w-10 h-10" src={images.jennifer} alt="" />
                      <span>Adam Sandler</span>
                      <span className="ml-5">
                        <img
                          className="w-10 h-10 cursor-pointer"
                          src={images.eye}
                          alt=""
                        />
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-row justify-between pr-5 pl-5 pt-4 pb-4 gap-6.5 border-t-1 border-[#989898]">
                    <div className="flex flex-row items-center gap-2">
                      <img className="w-10 h-10" src={images.carter} alt="" />
                      <span>Sasha Stores</span>
                    </div>
                    <div className="flex flex-row items-center gap-2">
                      <img className="w-10 h-10" src={images.chris} alt="" />
                      <span>Adam Sandler</span>
                      <span className="ml-5">
                        <img
                          className="w-10 h-10 cursor-pointer"
                          src={images.eye}
                          alt=""
                        />
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-row justify-between pr-5 pl-5 pt-4 pb-4 gap-6.5 border-t-1 border-[#989898]">
                    <div className="flex flex-row items-center gap-2">
                      <img className="w-10 h-10" src={images.daisy} alt="" />
                      <span>Sasha Stores</span>
                    </div>
                    <div className="flex flex-row items-center gap-2">
                      <img className="w-10 h-10" src={images.emma} alt="" />
                      <span>Adam Sandler</span>
                      <span className="ml-5">
                        <img
                          className="w-10 h-10 cursor-pointer"
                          src={images.eye}
                          alt=""
                        />
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-row justify-between pr-5 pl-5 pt-2 pb-2 gap-6.5 border-t-1 border-[#989898]">
                    <div className="flex flex-row items-center gap-2">
                      <img className="w-10 h-10" src={images.ethens} alt="" />
                      <span>Sasha Stores</span>
                    </div>
                    <div className="flex flex-row items-center gap-2">
                      <img className="w-10 h-10" src={images.tom} alt="" />
                      <span>Adam Sandler</span>
                      <span className="ml-5">
                        <img
                          className="w-10 h-10 cursor-pointer"
                          src={images.eye}
                          alt=""
                        />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-row mt-5">
          <div className="">
            <TabButtons />
          </div>
          <div className=" ml-5">
            <BulkActionDropdown onActionSelect={handleBulkActionSelect} />
          </div>
          <div className="ml-5">
            <div className="relative">
              <input
                type="text"
                placeholder="Search"
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

        <div>
          <OrdersTable
            title="Latest Orders"
            onRowSelect={handleOrderSelection}
          />
        </div>
      </div>
    </>
  );
};

export default Dashboard;
