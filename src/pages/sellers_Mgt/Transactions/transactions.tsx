import PageHeader from "../../../components/PageHeader";
import images from "../../../constants/images";
import { useState, useEffect } from "react";
import BulkActionDropdown from "../../../components/BulkActionDropdown";
import DepositDropdown from "../../../components/DepositsDropdown";
import TransactionTable from "./transactionTable";

// tiny debounce hook
function useDebouncedValue<T>(value: T, delay = 450) {
  const [debounced, setDebounced] = useState<T>(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

// normalize the deposit dropdown labels into our type filter
function normalizeType(
  action: string
): "All" | "Deposit" | "Withdrawals" | "Payments" {
  const a = action.trim().toLowerCase();
  if (a.includes("withdraw")) return "Withdrawals";
  if (a.includes("payment")) return "Payments";
  if (a.includes("deposit")) return "Deposit";
  return "All";
}

const Transactions = () => {
  const [activeTab, setActiveTab] = useState<
    "All" | "Pending" | "Successful" | "Failed"
  >("All");
  const tabs: Array<"All" | "Pending" | "Successful" | "Failed"> = [
    "All",
    "Pending",
    "Successful",
    "Failed",
  ];

  // search
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 450);

  // deposit/type filter
  const [typeFilter, setTypeFilter] = useState<
    "All" | "Deposit" | "Withdrawals" | "Payments"
  >("All");

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
    console.log("Bulk action selected in Orders:", action);
  };

  // Make the deposit dropdown functional: set the type filter
  const handleDepositActionSelect = (action: string) => {
    const normalized = normalizeType(action);
    setTypeFilter(normalized);
    console.log("Deposit action selected:", action, "=> filter:", normalized);
  };

  return (
    <>
      <PageHeader title="Transactions - Stores" />
      <div className="p-5">
        <div className="flex flex-row justify-between items-center">
          {/* ... cards unchanged ... */}
          <div
            className="flex flex-row rounded-2xl  w-90"
            style={{ boxShadow: "0px 0px 2px 0px rgba(0, 0, 0, 0.25)" }}
          >
            <div className="bg-[#E53E3E] rounded-l-2xl p-7 flex justify-center items-center ">
              <img className="w-9 h-9" src={images.transaction1} alt="" />
            </div>
            <div className="flex flex-col bg-[#FFF1F1] rounded-r-2xl p-3 pr-11 gap-1">
              <span className="font-semibold text-[15px]">
                All Transactions
              </span>
              <span className="font-semibold text-2xl">10</span>
              <span className="text-[#00000080] text-[13px] ">
                <span className="text-[#1DB61D]">+5%</span> increase from last
                month
              </span>
            </div>
          </div>

          <div
            className="flex flex-row rounded-2xl w-90"
            style={{ boxShadow: "0px 0px 2px 0px rgba(0, 0, 0, 0.25)" }}
          >
            <div className="bg-[#E53E3E] rounded-l-2xl p-7 flex justify-center items-center ">
              <img className="w-9 h-9" src={images.transaction1} alt="" />
            </div>
            <div className="flex flex-col bg-[#FFF1F1] rounded-r-2xl p-3 pr-11 gap-1">
              <span className="font-semibold text-[15px]">
                Pending Transactions
              </span>
              <span className="font-semibold text-2xl">2</span>
              <span className="text-[#00000080] text-[13px] ">
                <span className="text-[#1DB61D]">+5%</span> increase from last
                month
              </span>
            </div>
          </div>

          <div
            className="flex flex-row rounded-2xl w-90"
            style={{ boxShadow: "0px 0px 2px 0px rgba(0, 0, 0, 0.25)" }}
          >
            <div className="bg-[#E53E3E] rounded-l-2xl p-7 flex justify-center items-center ">
              <img className="w-9 h-9" src={images.transaction1} alt="" />
            </div>
            <div className="flex flex-col bg-[#FFF1F1] rounded-r-2xl p-3 pr-11 gap-1">
              <span className="font-semibold text-[15px]">
                Successful Transactions
              </span>
              <span className="font-semibold text-2xl">0</span>
              <span className="text-[#00000080] text-[13px] ">
                <span className="text-[#1DB61D]">+5%</span> increase from last
                month
              </span>
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-row justify-between">
          <div className="flex flex-row items-center gap-2">
            <TabButtons />

            <div className="flex flex-row items-center gap-5 border border-[#989898] rounded-lg px-4 py-3.5 bg-white cursor-pointer">
              <div>Today</div>
              <img className="w-3 h-3 mt-1" src={images.dropdown} alt="" />
            </div>

            {/* TYPE FILTER (DepositDropdown) */}
            <DepositDropdown onActionSelect={handleDepositActionSelect} />

            <BulkActionDropdown onActionSelect={handleBulkActionSelect} />
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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

        {/* Table with filters */}
        <TransactionTable
          statusFilter={activeTab}
          typeFilter={typeFilter}
          searchTerm={debouncedSearch}
        />
      </div>
    </>
  );
};

export default Transactions;
