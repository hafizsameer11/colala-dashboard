import PageHeader from "../../../components/PageHeader";
import images from "../../../constants/images";
import { useState, useEffect } from "react";
import BulkActionDropdown from "../../../components/BulkActionDropdown";
import DepositDropdown from "../../../components/DepositsDropdown";
import TransactionTable from "../customer_mgt/customerDetails/transaction/transactionTable";
import { useQuery } from "@tanstack/react-query";
import { getAdminTransactions } from "../../../utils/queries/users";

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
    "All" | "pending" | "success" | "completed" | "failed"
  >("All");
  const tabs: Array<"All" | "pending" | "success" | "completed" | "failed"> = [
    "All",
    "pending",
    "success", 
    "completed",
    "failed",
  ];

  // search
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 450);

  // deposit/type filter
  const [typeFilter, setTypeFilter] = useState<
    "All" | "Deposit" | "Withdrawals" | "Payments"
  >("All");

  // pagination
  const [currentPage, setCurrentPage] = useState(1);

  // API data fetching
  const { data: transactionsData, isLoading, error } = useQuery({
    queryKey: ['adminTransactions', activeTab, typeFilter, currentPage],
    queryFn: () => getAdminTransactions(currentPage, activeTab === "All" ? undefined : activeTab, typeFilter === "All" ? undefined : typeFilter.toLowerCase()),
    keepPreviousData: true,
  });

  // Extract data
  const transactions = transactionsData?.data?.transactions || [];
  const statistics = transactionsData?.data?.statistics || {};
  const pagination = transactionsData?.data?.pagination;

  const handlePageChange = (page: number) => {
    if (page !== currentPage) setCurrentPage(page);
  };

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
      <PageHeader title="Transactions" />

      <div className="p-5">
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E53E3E]"></div>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-32">
            <div className="text-center text-red-500">
              <p className="text-sm">Error loading transaction statistics</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-row justify-between items-center">
            {/* Card 1 - All Transactions */}
            <div
              className="flex flex-row rounded-2xl w-90"
              style={{ boxShadow: "0px 0px 2px 0px rgba(0, 0, 0, 0.25)" }}
            >
              <div className="bg-[#E53E3E] rounded-l-2xl p-7 flex justify-center items-center">
                <img className="w-9 h-9" src={images.transaction1} alt="" />
              </div>
              <div className="flex flex-col bg-[#FFF1F1] rounded-r-2xl p-3 pr-11 gap-1">
                <span className="font-semibold text-[15px]">
                  All Transactions
                </span>
                <span className="font-semibold text-2xl">
                  {statistics.total_transactions || 0}
                </span>
                <span className="text-[#00000080] text-[13px]">
                  <span className="text-[#1DB61D]">Total</span> transactions processed
                </span>
              </div>
            </div>

            {/* Card 2 - Pending Transactions */}
            <div
              className="flex flex-row rounded-2xl w-90"
              style={{ boxShadow: "0px 0px 2px 0px rgba(0, 0, 0, 0.25)" }}
            >
              <div className="bg-[#E53E3E] rounded-l-2xl p-7 flex justify-center items-center">
                <img className="w-9 h-9" src={images.transaction1} alt="" />
              </div>
              <div className="flex flex-col bg-[#FFF1F1] rounded-r-2xl p-3 pr-11 gap-1">
                <span className="font-semibold text-[15px]">
                  Pending Transactions
                </span>
                <span className="font-semibold text-2xl">
                  {statistics.pending_transactions || 0}
                </span>
                <span className="text-[#00000080] text-[13px]">
                  <span className="text-[#1DB61D]">Pending</span> transactions
                </span>
              </div>
            </div>

            {/* Card 3 - Successful Transactions */}
            <div
              className="flex flex-row rounded-2xl w-90"
              style={{ boxShadow: "0px 0px 2px 0px rgba(0, 0, 0, 0.25)" }}
            >
              <div className="bg-[#E53E3E] rounded-l-2xl p-7 flex justify-center items-center">
                <img className="w-9 h-9" src={images.transaction1} alt="" />
              </div>
              <div className="flex flex-col bg-[#FFF1F1] rounded-r-2xl p-3 pr-11 gap-1">
                <span className="font-semibold text-[15px]">
                  Successful Transactions
                </span>
                <span className="font-semibold text-2xl">
                  {statistics.successful_transactions || 0}
                </span>
                <span className="text-[#00000080] text-[13px]">
                  <span className="text-[#1DB61D]">Successful</span> transactions
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="mt-5 flex flex-row justify-between">
          <div className="flex flex-row items-center gap-2">
            <div>
              <TabButtons />
            </div>
            <div className="flex flex-row items-center gap-5 border border-[#989898] rounded-lg px-4 py-3.5 bg-white cursor-pointer">
              <div>Today</div>
              <div>
                <img className="w-3 h-3 mt-1" src={images.dropdown} alt="" />
              </div>
            </div>
            <div>
              <DepositDropdown onActionSelect={handleDepositActionSelect} />
            </div>
            <div>
              <BulkActionDropdown onActionSelect={handleBulkActionSelect} />
            </div>
          </div>
          <div>
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
        </div>
        <div>
          <TransactionTable
            statusFilter={activeTab}
            typeFilter={typeFilter}
            searchTerm={debouncedSearch}
            transactions={transactions}
            pagination={pagination}
            currentPage={currentPage}
            onPageChange={handlePageChange}
            isLoading={isLoading}
            error={error}
          />
        </div>
      </div>
    </>
  );
};

export default Transactions;
