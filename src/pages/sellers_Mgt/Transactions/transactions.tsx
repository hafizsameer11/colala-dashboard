import PageHeader from "../../../components/PageHeader";
import StatCard from "../../../components/StatCard";
import StatCardGrid from "../../../components/StatCardGrid";
import images from "../../../constants/images";
import { useState, useEffect } from "react";
import BulkActionDropdown from "../../../components/BulkActionDropdown";
import DepositDropdown from "../../../components/DepositsDropdown";
import TransactionTable from "./transactionTable";
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

  // period/date filter
  const [selectedPeriod, setSelectedPeriod] = useState<string>("All time");

  // Helper function to filter transactions by period
  const filterTransactionsByPeriod = (transactions: any[], period: string) => {
    if (period === "All time") return transactions;
    
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
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
        return transactions;
    }
    
    return transactions.filter((tx) => {
      const txDate = tx.created_at || tx.date || tx.formatted_date;
      if (!txDate) return false;
      const date = new Date(txDate);
      return date >= startDate && date <= now;
    });
  };

  // API data fetching
  const { data: transactionsData, isLoading, error } = useQuery({
    queryKey: ['adminTransactions', activeTab, typeFilter, currentPage],
    queryFn: () => getAdminTransactions(currentPage, activeTab === "All" ? undefined : activeTab, typeFilter === "All" ? undefined : typeFilter.toLowerCase()),
    placeholderData: (previousData) => previousData,
  });

  // Extract data
  const allTransactions = transactionsData?.data?.transactions || [];
  const statistics = transactionsData?.data?.statistics || {};
  const pagination = transactionsData?.data?.pagination;

  // Filter transactions by selected period
  const transactions = filterTransactionsByPeriod(allTransactions, selectedPeriod);

  const handlePageChange = (page: number) => {
    if (page !== currentPage) setCurrentPage(page);
  };

  const TabButtons = () => (
    <div className="flex items-center space-x-0.5 border border-[#989898] rounded-lg p-1.5 sm:p-2 w-fit bg-white overflow-x-auto">
      {tabs.map((tab) => {
        const isActive = activeTab === tab;
        return (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg font-normal transition-all duration-200 cursor-pointer whitespace-nowrap ${
              isActive ? "px-4 sm:px-6 md:px-8 bg-[#E53E3E] text-white" : "px-2 sm:px-3 md:px-4 text-black"
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

  // Handle period change from PageHeader
  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
    setCurrentPage(1); // Reset to first page when period changes
  };

  return (
    <>
      <PageHeader 
        title="Transactions - Stores" 
        onPeriodChange={handlePeriodChange}
        defaultPeriod="All time"
      />

      <div className="p-3 sm:p-4 md:p-5">
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
          <StatCardGrid columns={3}>
            <StatCard
              icon={images.transaction1}
              title="All Transactions"
              value={statistics.total_transactions || 0}
              subtitle="Total transactions processed"
            />
            <StatCard
              icon={images.transaction1}
              title="Pending Transactions"
              value={statistics.pending_transactions || 0}
              subtitle="Pending transactions"
            />
            <StatCard
              icon={images.transaction1}
              title="Successful Transactions"
              value={statistics.successful_transactions || 0}
              subtitle="Successful transactions"
            />
          </StatCardGrid>
        )}

        <div className="mt-4 sm:mt-5 flex flex-col sm:flex-row justify-between gap-3 sm:gap-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-2 flex-wrap">
            <div className="overflow-x-auto w-full sm:w-auto">
              <TabButtons />
            </div>

            <div className="flex flex-row items-center gap-3 sm:gap-5 border border-[#989898] rounded-lg px-3 sm:px-4 py-2.5 sm:py-3.5 bg-white cursor-pointer text-xs sm:text-sm">
              <div>Today</div>
              <img className="w-3 h-3 mt-1" src={images.dropdown} alt="" />
            </div>

            {/* TYPE FILTER (DepositDropdown) */}
            <DepositDropdown onActionSelect={handleDepositActionSelect} />

            <BulkActionDropdown onActionSelect={handleBulkActionSelect} />
          </div>

          <div className="relative w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 pr-6 py-2.5 sm:py-3.5 border border-[#00000080] rounded-lg text-sm sm:text-[15px] w-full sm:w-[280px] md:w-[363px] focus:outline-none bg-white shadow-[0_2px_6px_rgba(0,0,0,0.05)] placeholder-[#00000080]"
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
          transactions={transactions}
          statusFilter={activeTab}
          typeFilter={typeFilter}
          searchTerm={debouncedSearch}
          pagination={pagination}
          onPageChange={handlePageChange}
          isLoading={isLoading}
        />
      </div>
    </>
  );
};

export default Transactions;
