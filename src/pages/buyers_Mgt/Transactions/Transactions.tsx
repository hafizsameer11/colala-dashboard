import PageHeader from "../../../components/PageHeader";
import StatCard from "../../../components/StatCard";
import StatCardGrid from "../../../components/StatCardGrid";
import images from "../../../constants/images";
import { useState, useEffect, useMemo, useRef } from "react";
import BulkActionDropdown from "../../../components/BulkActionDropdown";
import DateFilter from "../../../components/DateFilter";
import type { DateFilterState } from "../../../components/DateFilter";
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

// Convert filter type to API-expected format (singular, lowercase)
function getTypeForAPI(typeFilter: "All" | "Deposit" | "Withdrawals" | "Payments"): string | undefined {
  if (typeFilter === "All") return undefined;
  if (typeFilter === "Deposit") return "deposit";
  if (typeFilter === "Withdrawals") return "withdrawal"; // API expects singular "withdrawal"
  if (typeFilter === "Payments") return "payment"; // API expects singular "payment"
  return undefined;
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

  // Date filter state - supports both period and custom date range
  const [dateFilter, setDateFilter] = useState<DateFilterState>({
    filterType: 'period',
    period: 'All time',
    dateFrom: null,
    dateTo: null,
  });

  // selected transactions for bulk actions
  const [selectedTransactions, setSelectedTransactions] = useState<Array<{
    id: string;
    reference: string;
    amount: string;
    type: string;
    date: string;
    status: string;
    userName: string;
    userEmail: string;
    statusColor: string;
  }>>([]);

  // API data fetching
  const { data: transactionsData, isLoading, error } = useQuery({
    queryKey: ['adminTransactions', activeTab, typeFilter, currentPage, dateFilter.period, dateFilter.dateFrom, dateFilter.dateTo, debouncedSearch],
    queryFn: () => getAdminTransactions(
      currentPage, 
      activeTab === "All" ? undefined : activeTab, 
      getTypeForAPI(typeFilter),
      dateFilter.filterType === 'period' ? dateFilter.period || undefined : undefined,
      dateFilter.filterType === 'custom' ? dateFilter.dateFrom || undefined : undefined,
      dateFilter.filterType === 'custom' ? dateFilter.dateTo || undefined : undefined,
      debouncedSearch && debouncedSearch.trim() ? debouncedSearch.trim() : undefined
    ),
  });

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, typeFilter, dateFilter, debouncedSearch]);

  // Extract data (backend handles filtering)
  const transactions = transactionsData?.data?.transactions || [];
  const pagination = transactionsData?.data?.pagination;

  // Calculate statistics from filtered transactions
  const statistics = useMemo(() => {
    const total = transactions.length;
    const pending = transactions.filter((tx: any) => {
      const status = String(tx.status || '').toLowerCase();
      return status.includes('pending') || status === 'pending';
    }).length;
    const successful = transactions.filter((tx: any) => {
      const status = String(tx.status || '').toLowerCase();
      return status.includes('success') || status.includes('completed') || status === 'success' || status === 'completed';
    }).length;
    
    return {
      total_transactions: total,
      pending_transactions: pending,
      successful_transactions: successful,
    };
  }, [transactions]);

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
            className={`py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg font-normal transition-all duration-200 cursor-pointer whitespace-nowrap ${isActive ? "px-4 sm:px-6 md:px-8 bg-[#E53E3E] text-white" : "px-2 sm:px-3 md:px-4 text-black"
              }`}
          >
            {tab}
          </button>
        );
      })}
    </div>
  );

  const handleBulkActionSelect = (action: string) => {
    console.log("Bulk action selected in Transactions:", action);
  };

  const handleSelectedTransactionsChange = (transactions: Array<{
    id: string;
    reference: string;
    amount: string;
    type: string;
    date: string;
    status: string;
    userName: string;
    userEmail: string;
    statusColor: string;
  }>) => {
    setSelectedTransactions(transactions);
  };

  // Make the deposit dropdown functional: set the type filter
  const handleDepositActionSelect = (action: string) => {
    const normalized = normalizeType(action);
    setTypeFilter(normalized);
    setCurrentPage(1); // Reset to first page when filter changes
    console.log("Deposit action selected:", action, "=> filter:", normalized);
  };

  const handleDateFilterChange = (filter: DateFilterState) => {
    setDateFilter(filter);
    setCurrentPage(1);
  };

  return (
    <>
      <PageHeader 
        title="Transactions" 
        showDropdown={false}
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

        <div className="mt-4 sm:mt-5 flex flex-col gap-3 sm:gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 flex-wrap">
            <div className="overflow-x-auto w-full sm:w-auto">
              <TabButtons />
            </div>
            <DateFilter
              defaultFilterType={dateFilter.filterType}
              defaultPeriod={dateFilter.period || 'All time'}
              defaultDateFrom={dateFilter.dateFrom}
              defaultDateTo={dateFilter.dateTo}
              onFilterChange={handleDateFilterChange}
            />
            <div>
              <DepositDropdown onActionSelect={handleDepositActionSelect} />
            </div>
            <div>
              <BulkActionDropdown 
                onActionSelect={handleBulkActionSelect}
                selectedOrders={selectedTransactions}
                orders={transactions}
                dataType="adminTransactions"
                exportConfig={{
                  dataType: "adminTransactions",
                  status: activeTab !== "All" ? activeTab : undefined,
                  typeFilter: typeFilter !== "All" ? typeFilter : undefined,
                  period: dateFilter.filterType === 'period' && dateFilter.period && dateFilter.period !== 'All time' ? dateFilter.period : undefined,
                  dateFrom: dateFilter.filterType === 'custom' ? dateFilter.dateFrom || undefined : undefined,
                  dateTo: dateFilter.filterType === 'custom' ? dateFilter.dateTo || undefined : undefined,
                  search: debouncedSearch && debouncedSearch.trim() ? debouncedSearch.trim() : undefined,
                }}
              />
            </div>
          </div>
          <div className="w-full sm:w-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                }}
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
            onSelectedTransactionsChange={handleSelectedTransactionsChange}
            isLoading={isLoading}
            error={error}
          />
        </div>
      </div>
    </>
  );
};

export default Transactions;
