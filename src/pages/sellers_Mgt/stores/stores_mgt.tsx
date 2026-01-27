import PageHeader from "../../../components/PageHeader";
import images from "../../../constants/images";
import BulkActionDropdown from "../../../components/BulkActionDropdown";
import StoresTable from "./storeTable";
import AddStoreModal from "../Modals/addStoreModel";
import SavedAddressModal from "../Modals/savedAddressModal";
import AddAddressModal from "../Modals/addAddressModal";
import DeliveryPricing from "../Modals/deliveryPricing";
import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getSellerUsers } from "../../../utils/queries/users";
import AddNewDeliveryPricing from "../Modals/addNewDeliveryPricing";
import type { DeliveryPricingEntry } from "../Modals/addNewDeliveryPricing";

function useDebouncedValue<T>(value: T, delay = 450) {
  const [debounced, setDebounced] = useState<T>(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

const stores_mgt = () => {
  const [showModal, setShowModal] = useState(false);
  const [showSavedAddressModal, setShowSavedAddressModal] = useState(false);
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [showAddNewDeliveryPricingModal, setShowAddNewDeliveryPricingModal] =
    useState(false);
  const [showDeliveryPricingModal, setShowDeliveryPricingModal] =
    useState(false);
  const [modalInitialTab, setModalInitialTab] = useState<
    "Level 1" | "Level 2" | "Level 3"
  >("Level 1");

  // NEW: filters
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 450);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
  
  // Date period filter - synchronized with PageHeader
  const [selectedPeriod, setSelectedPeriod] = useState<string>("All time");
  const datePeriodOptions = [
    "Today",
    "This Week",
    "Last Month",
    "Last 6 Months",
    "Last Year",
    "All time",
  ];

  // Fetch seller users
  const { data: sellerData, isLoading, error } = useQuery({
    queryKey: ['sellerUsers', currentPage, debouncedSearch, selectedPeriod],
    queryFn: () => getSellerUsers(currentPage, undefined, debouncedSearch, selectedPeriod),
    staleTime: 2 * 60 * 1000,
  });

  const summary = sellerData?.data?.summary_stats;
  const usersPage = sellerData?.data?.users;
  const allUsers = usersPage?.data || [];
  
  // Users are already filtered by backend based on selectedPeriod
  const users = allUsers;

  // Delivery pricing entries (unchanged)
  const [deliveryPricingEntries, setDeliveryPricingEntries] = useState<
    DeliveryPricingEntry[]
  >([
    {
      id: "1",
      state: "Lagos",
      lga: "Ikeja",
      price: "N2,999",
      isFreeDelivery: false,
    },
  ]);

  const handleAddDeliveryPricing = (newEntry: DeliveryPricingEntry) => {
    setDeliveryPricingEntries((prev) => [...prev, newEntry]);
  };

  const handleEditDeliveryPricing = (
    id: string,
    updatedEntry: DeliveryPricingEntry
  ) => {
    setDeliveryPricingEntries((prev) =>
      prev.map((entry) => (entry.id === id ? updatedEntry : entry))
    );
  };

  const handleDeleteDeliveryPricing = (id: string) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this delivery pricing?"
    );
    if (confirmDelete)
      setDeliveryPricingEntries((prev) =>
        prev.filter((entry) => entry.id !== id)
      );
  };

  const handleUserSelection = (selectedIds: string[]) => {
    console.log("Selected user IDs:", selectedIds);
  };

  const handleBulkActionSelect = (action: string) => {
    console.log("Bulk action selected in Dashboard:", action);
  };
  
  // Handler for PageHeader period change
  const handlePageHeaderPeriodChange = (period: string) => {
    setSelectedPeriod(period);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  return (
    <>
      <PageHeader 
        title="User Management - Stores" 
        defaultPeriod={selectedPeriod}
        timeOptions={datePeriodOptions}
        onPeriodChange={handlePageHeaderPeriodChange}
      />
      <div className="bg-[#F5F5F5]">
        <div className="p-3 sm:p-4 md:p-5">
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-4">
            {/* Card 1 */}
            <div
              className="flex flex-row rounded-2xl flex-1 min-w-0"
              style={{ boxShadow: "0px 0px 2px 0px rgba(0, 0, 0, 0.25)" }}
            >
              <div className="bg-[#E53E3E] rounded-l-2xl p-4 sm:p-5 md:p-7 flex justify-center items-center">
                <img className="w-6 h-6 sm:w-7 sm:h-7 md:w-9 md:h-9" src={images.Users} alt="" />
              </div>
              <div className="flex flex-col bg-[#FFF1F1] rounded-r-2xl p-2 sm:p-3 pr-4 sm:pr-6 md:pr-11 gap-1 flex-1 min-w-0">
                <span className="font-semibold text-xs sm:text-sm md:text-[15px]">Total Stores</span>
                <span className="font-semibold text-lg sm:text-xl md:text-2xl">{summary?.total_stores?.count ?? 0}</span>
                <span className="text-[#00000080] text-[10px] sm:text-xs md:text-[13px]">
                  <span className="text-[#1DB61D]">+{summary?.total_stores?.increase ?? 0}%</span> increase from last
                  month
                </span>
              </div>
            </div>

            {/* Card 2 */}

            <div
              className="flex flex-row rounded-2xl flex-1 min-w-0"
              style={{ boxShadow: "0px 0px 2px 0px rgba(0, 0, 0, 0.25)" }}
            >
              <div className="bg-[#E53E3E] rounded-l-2xl p-4 sm:p-5 md:p-7 flex justify-center items-center">
                <img className="w-6 h-6 sm:w-7 sm:h-7 md:w-9 md:h-9" src={images.Users} alt="" />
              </div>
              <div className="flex flex-col bg-[#FFF1F1] rounded-r-2xl p-2 sm:p-3 pr-4 sm:pr-6 md:pr-11 gap-1 flex-1 min-w-0">
                <span className="font-semibold text-xs sm:text-sm md:text-[15px]">Active Stores</span>
                <span className="font-semibold text-lg sm:text-xl md:text-2xl">{summary?.active_stores?.count ?? 0}</span>
                <span className="text-[#00000080] text-[10px] sm:text-xs md:text-[13px]">
                  <span className="text-[#1DB61D]">+{summary?.active_stores?.increase ?? 0}%</span> increase from last
                  month
                </span>
              </div>
            </div>

            {/* Card 3 */}

            <div
              className="flex flex-row rounded-2xl flex-1 min-w-0"
              style={{ boxShadow: "0px 0px 2px 0px rgba(0, 0, 0, 0.25)" }}
            >
              <div className="bg-[#E53E3E] rounded-l-2xl p-4 sm:p-5 md:p-7 flex justify-center items-center">
                <img className="w-6 h-6 sm:w-7 sm:h-7 md:w-9 md:h-9" src={images.Users} alt="" />
              </div>
              <div className="flex flex-col bg-[#FFF1F1] rounded-r-2xl p-2 sm:p-3 pr-4 sm:pr-6 md:pr-11 gap-1 flex-1 min-w-0">
                <span className="font-semibold text-xs sm:text-sm md:text-[15px]">New Stores</span>
                <span className="font-semibold text-lg sm:text-xl md:text-2xl">{summary?.new_stores?.count ?? 0}</span>
                <span className="text-[#00000080] text-[10px] sm:text-xs md:text-[13px]">
                  <span className="text-[#1DB61D]">+{summary?.new_stores?.increase ?? 0}%</span> increase from last
                  month
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 sm:mt-5">
            <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0">
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <div>
                  <BulkActionDropdown 
                    onActionSelect={handleBulkActionSelect}
                    dataType="users"
                    orders={users}
                    selectedOrders={selectedUsers}
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:gap-5">
                <div>
                  <button
                    onClick={() => setShowModal(true)}
                    className="bg-[#E53E3E] text-white px-4 sm:px-5 py-2.5 sm:py-3.5 rounded-lg cursor-pointer text-center text-sm sm:text-base w-full sm:w-auto whitespace-nowrap"
                  >
                    Add new Store
                  </button>
                </div>
                <div className="w-full sm:w-auto">
                  <div className="relative">
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
              </div>
            </div>
          </div>

          <div className="mt-5">
            <StoresTable
              title="Stores"
              onRowSelect={handleUserSelection}
              onSelectedUsersChange={setSelectedUsers}
              searchTerm={debouncedSearch}
              users={users}
              pagination={usersPage}
              currentPage={usersPage?.current_page || currentPage}
              onPageChange={(page) => {
                if (page !== currentPage) setCurrentPage(page);
              }}
              isLoading={isLoading}
              error={error}
            />
          </div>
        </div>
      </div>

      {/* Add Store Modal */}
      <AddStoreModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        initialTab={modalInitialTab}
        onProceedToSavedAddress={() => {
          setShowModal(false);
          setShowSavedAddressModal(true);
        }}
      />

      {/* Saved Address Modal */}
      <SavedAddressModal
        isOpen={showSavedAddressModal}
        onClose={() => setShowSavedAddressModal(false)}
        onBack={() => {
          setShowSavedAddressModal(false);
          setModalInitialTab("Level 3");
          setShowModal(true);
        }}
        onAddNewAddress={() => {
          setShowSavedAddressModal(false);
          setShowAddAddressModal(true);
        }}
        onAddNewDeliveryPricing={() => {
          setShowSavedAddressModal(false);
          setShowDeliveryPricingModal(true);
        }}
      />

      {/* Add Address Modal */}
      <AddAddressModal
        isOpen={showAddAddressModal}
        onClose={() => setShowAddAddressModal(false)}
        onBack={() => {
          setShowAddAddressModal(false);
          setShowSavedAddressModal(true);
        }}
      />

      {/* Delivery Pricing Modal */}
      <DeliveryPricing
        isOpen={showDeliveryPricingModal}
        onClose={() => setShowDeliveryPricingModal(false)}
        onBack={() => {
          setShowDeliveryPricingModal(false);
          setShowSavedAddressModal(true);
        }}
        onAddNewDeliveryPricing={() => {
          setShowDeliveryPricingModal(false);
          setShowAddNewDeliveryPricingModal(true);
        }}
        deliveryPricingEntries={deliveryPricingEntries}
        onEditDeliveryPricing={handleEditDeliveryPricing}
        onDeleteDeliveryPricing={handleDeleteDeliveryPricing}
      />

      {/* Add new Delivery Pricing Modal */}
      <AddNewDeliveryPricing
        isOpen={showAddNewDeliveryPricingModal}
        onClose={() => setShowAddNewDeliveryPricingModal(false)}
        onBack={() => {
          setShowAddNewDeliveryPricingModal(false);
          setShowDeliveryPricingModal(true);
        }}
        onSave={handleAddDeliveryPricing}
      />
    </>
  );
};

export default stores_mgt;
