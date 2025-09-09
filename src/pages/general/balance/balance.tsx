import PageHeader from "../../../components/PageHeader";
import images from "../../../constants/images";
import { useState } from "react";
import BulkActionDropdown from "../../../components/BulkActionDropdown";
import AllUsersTable from "./allUsersTable";

const Balance = () => {
  const [activeTab, setActiveTab] = useState("All");
  const tabs = ["All", "Buyers", "Sellers"];

  const TabButtons = () => (
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

  const handleBulkActionSelect = (action: string) => {
    // Handle the bulk action selection from the parent component
    console.log("Bulk action selected in Orders:", action);
    // Add your custom logic here
  };

  const handleUserSelection = (selectedIds: string[]) => {
    // Handle selected user IDs
    console.log("Selected user IDs:", selectedIds);
    // You can use this to enable/disable bulk actions or perform other operations
  };

  return (
    <>
      <PageHeader title="Balance" />
      <div className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Total Shopping wallet balance */}
          <div
            className="flex flex-col rounded-2xl p-6 min-w-[350px]"
            style={{
              boxShadow: "0px 0px 2px 0px rgba(0, 0, 0, 0.25)",
              background:
                "linear-gradient(115.92deg, #FF0000 2.93%, #2C0182 100.86%)",
            }}
          >
            <div className="flex flex-row items-start ">
              <div className="mr-4">
                <img src={images.balance1} alt="" className="w-12 h-12" />
              </div>
              <div className="flex flex-col gap-2 flex-1">
                <div className="text-white font-semibold text-lg">
                  Total Shopping wallet balance
                </div>
                <div className="text-white font-bold text-3xl">N20,000,000</div>
              </div>
            </div>
            <div className="flex flex-row justify-between mt-6 pt-4 ">
              <div className="flex flex-col gap-1">
                <div className="text-lg text-[#FFFFFF80]">
                  Buyer App Balance
                </div>
                <div className="text-2xl text-white font-bold">N10,000,000</div>
              </div>
              <div className="flex flex-col gap-1">
                <div className="text-lg text-[#FFFFFF80]">
                  Seller App Balance
                </div>
                <div className="text-2xl text-white font-bold">N10,000,000</div>
              </div>
            </div>
          </div>

          {/* Total Escrow wallet balance */}
          <div
            className="flex flex-col rounded-2xl p-6 min-w-[350px]"
            style={{
              boxShadow: "0px 0px 2px 0px rgba(0, 0, 0, 0.25)",
              background:
                "linear-gradient(115.92deg, #FF0000 2.93%, #2C0182 100.86%)",
            }}
          >
            <div className="flex flex-row items-start">
              <div className="mr-4">
                <img src={images.balance1} alt="" className="w-12 h-12" />
              </div>
              <div className="flex flex-col gap-2 flex-1">
                <div className="text-white font-semibold text-lg">
                  Total Escrow wallet balance
                </div>
                <div className="text-white font-bold text-3xl">N10,000,000</div>
              </div>
            </div>
            <div className="flex flex-row justify-between mt-6 pt-4 ">
              <div className="flex flex-col gap-1">
                <div className="text-lg text-[#FFFFFF80]">
                  Buyer App Balance
                </div>
                <div className="text-2xl text-white font-bold">N5,000,000</div>
              </div>
              <div className="flex flex-col gap-1">
                <div className="text-lg text-[#FFFFFF80]">
                  Seller App Balance
                </div>
                <div className="text-2xl text-white font-bold">N5,000,000</div>
              </div>
            </div>
          </div>

          {/* Total points balance */}
          <div
            className="flex flex-col rounded-2xl p-6 min-w-[350px]"
            style={{
              boxShadow: "0px 0px 2px 0px rgba(0, 0, 0, 0.25)",
              background:
                "linear-gradient(115.92deg, #FF0000 2.93%, #2C0182 100.86%)",
            }}
          >
            <div className="flex flex-row items-start">
              <div className="mr-4">
                <img src={images.balance1} alt="" className="w-12 h-12" />
              </div>
              <div className="flex flex-col gap-2 flex-1">
                <div className="text-white font-semibold text-lg">
                  Total points balance
                </div>
                <div className="text-white font-bold text-3xl">100,000</div>
              </div>
            </div>
            <div className="flex flex-row justify-between mt-6 pt-4 ">
              <div className="flex flex-col gap-1">
                <div className="text-lg text-[#FFFFFF80]">
                  Buyer App Balance
                </div>
                <div className="text-2xl text-white font-bold">50,000</div>
              </div>
              <div className="flex flex-col gap-1">
                <div className="text-lg text-[#FFFFFF80]">
                  Seller App Balance
                </div>
                <div className="text-2xl text-white font-bold">50,000</div>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-5 flex flex-row justify-between">
          <div className="flex gap-2">
            <div>
              <TabButtons />
            </div>
            <div>
              <BulkActionDropdown onActionSelect={handleBulkActionSelect} />
            </div>
          </div>
          <div className="">
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
        <div className="mt-5">
          <AllUsersTable onRowSelect={handleUserSelection} />
        </div>
      </div>
    </>
  );
};

export default Balance;
