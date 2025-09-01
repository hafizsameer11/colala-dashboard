import PageHeader from "../../../components/PageHeader";
import images from "../../../constants/images";
import BulkActionDropdown from "../../../components/BulkActionDropdown";
import StoresTable from "./storeTable";
import AddStoreModal from "../Modals/addStoreModel";
import SavedAddressModal from "../Modals/savedAddressModal";
import AddAddressModal from "../Modals/addAddressModal";
import DeliveryPricing from "../Modals/deliveryPricing";
import { useState } from "react";
import LevelDropdown from "../../../components/levelDropdown";
import AddNewDeliveryPricing from "../Modals/addNewDeliveryPricing";
import type { DeliveryPricingEntry } from "../Modals/addNewDeliveryPricing";

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

  // State for delivery pricing entries
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

  // Function to add new delivery pricing entry
  const handleAddDeliveryPricing = (newEntry: DeliveryPricingEntry) => {
    setDeliveryPricingEntries((prev) => [...prev, newEntry]);
  };

  // Function to edit delivery pricing entry
  const handleEditDeliveryPricing = (
    id: string,
    updatedEntry: DeliveryPricingEntry
  ) => {
    setDeliveryPricingEntries((prev) =>
      prev.map((entry) => (entry.id === id ? updatedEntry : entry))
    );
  };

  // Function to delete delivery pricing entry
  const handleDeleteDeliveryPricing = (id: string) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this delivery pricing?"
    );
    if (confirmDelete) {
      setDeliveryPricingEntries((prev) =>
        prev.filter((entry) => entry.id !== id)
      );
    }
  };

  const handleUserSelection = (selectedIds: string[]) => {
    // Handle selected user IDs
    console.log("Selected user IDs:", selectedIds);
    // You can use this to enable/disable bulk actions or perform other operations
  };

  const handleBulkActionSelect = (action: string) => {
    // Handle the bulk action selection from the parent component
    console.log("Bulk action selected in Dashboard:", action);
    // Add your custom logic here
  };

  const handleLevelActionSelect = (level: string) => {
    // Handle the level action selection from the LevelDropdown
    console.log("Level action selected in Dashboard:", level);
    // Add your custom logic here
  };

  return (
    <>
      <PageHeader title="User Management - Stores" />
      <div className="bg-[#F5F5F5]">
        <div className="p-5">
          <div className="flex flex-row justify-between items-center">
            {/* Card 1 */}
            <div
              className="flex flex-row rounded-2xl  w-90"
              style={{ boxShadow: "0px 0px 2px 0px rgba(0, 0, 0, 0.25)" }}
            >
              <div className="bg-[#E53E3E] rounded-l-2xl p-7 flex justify-center items-center ">
                <img className="w-9 h-9" src={images.Users} alt="" />
              </div>
              <div className="flex flex-col bg-[#FFF1F1] rounded-r-2xl p-3 pr-11 gap-1">
                <span className="font-semibold text-[15px]">Total Users</span>
                <span className="font-semibold text-2xl">1,500</span>
                <span className="text-[#00000080] text-[13px] ">
                  <span className="text-[#1DB61D]">+5%</span> increase from last
                  month
                </span>
              </div>
            </div>

            {/* Card 2 */}

            <div
              className="flex flex-row rounded-2xl w-90"
              style={{ boxShadow: "0px 0px 2px 0px rgba(0, 0, 0, 0.25)" }}
            >
              <div className="bg-[#E53E3E] rounded-l-2xl p-7 flex justify-center items-center ">
                <img className="w-9 h-9" src={images.Users} alt="" />
              </div>
              <div className="flex flex-col bg-[#FFF1F1] rounded-r-2xl p-3 pr-11 gap-1">
                <span className="font-semibold text-[15px]">Total Users</span>
                <span className="font-semibold text-2xl">1,500</span>
                <span className="text-[#00000080] text-[13px] ">
                  <span className="text-[#1DB61D]">+5%</span> increase from last
                  month
                </span>
              </div>
            </div>

            {/* Card 3 */}

            <div
              className="flex flex-row rounded-2xl w-90"
              style={{ boxShadow: "0px 0px 2px 0px rgba(0, 0, 0, 0.25)" }}
            >
              <div className="bg-[#E53E3E] rounded-l-2xl p-7 flex justify-center items-center ">
                <img className="w-9 h-9" src={images.Users} alt="" />
              </div>
              <div className="flex flex-col bg-[#FFF1F1] rounded-r-2xl p-3 pr-11 gap-1">
                <span className="font-semibold text-[15px]">Total Users</span>
                <span className="font-semibold text-2xl">1,500</span>
                <span className="text-[#00000080] text-[13px] ">
                  <span className="text-[#1DB61D]">+5%</span> increase from last
                  month
                </span>
              </div>
            </div>
          </div>

          <div className="mt-5">
            <div className="flex flex-row justify-between">
              <div className="flex flex-row gap-3">
                <div>
                  <BulkActionDropdown onActionSelect={handleBulkActionSelect} />
                </div>
                <div>
                  <LevelDropdown onLevelSelect={handleLevelActionSelect} />
                </div>
              </div>
              <div className="flex flex-row gap-5">
                <div>
                  <button
                    onClick={() => setShowModal(true)}
                    className="bg-[#E53E3E] text-white px-5 py-3.5 rounded-lg cursor-pointer text-center"
                  >
                    Add new Store
                  </button>
                </div>
                <div>
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
            </div>
          </div>

          <div className="mt-5">
            <StoresTable title="Stores" onRowSelect={handleUserSelection} />
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
