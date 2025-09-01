import images from "../../../constants/images";
import StateDropdown from "../../../components/stateDropdown";
import { useState, useEffect } from "react";

interface SavedAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBack?: () => void;
  onAddNewAddress?: () => void;
  onAddNewDeliveryPricing?: () => void;
}

interface SavedAddress {
  id: string;
  state: string;
  lga: string;
  fullAddress: string;
  discountCode?: string;
  openingHours: {
    monday: { from: string; to: string };
    tuesday: { from: string; to: string };
    wednesday: { from: string; to: string };
    thursday: { from: string; to: string };
    friday: { from: string; to: string };
    saturday: { from: string; to: string };
    sunday: { from: string; to: string };
  };
  createdAt: string;
}

const SavedAddressModal: React.FC<SavedAddressModalProps> = ({
  isOpen,
  onClose,
  onBack,
  onAddNewAddress,
  onAddNewDeliveryPricing,
}) => {
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedStateFilter, setSelectedStateFilter] = useState<string>("All");
  const [editingAddress, setEditingAddress] = useState<SavedAddress | null>(
    null
  );
  const [editForm, setEditForm] = useState({
    state: "",
    lga: "",
    fullAddress: "",
    discountCode: "",
    openingHours: {
      monday: { from: "", to: "" },
      tuesday: { from: "", to: "" },
      wednesday: { from: "", to: "" },
      thursday: { from: "", to: "" },
      friday: { from: "", to: "" },
      saturday: { from: "", to: "" },
      sunday: { from: "", to: "" },
    },
  });

  const [dropdownStates, setDropdownStates] = useState({
    mondayFrom: false,
    mondayTo: false,
    tuesdayFrom: false,
    tuesdayTo: false,
    wednesdayFrom: false,
    wednesdayTo: false,
    thursdayFrom: false,
    thursdayTo: false,
    fridayFrom: false,
    fridayTo: false,
    saturdayFrom: false,
    saturdayTo: false,
    sundayFrom: false,
    sundayTo: false,
  });

  const timeOptions = [
    "12:00 AM",
    "12:30 AM",
    "1:00 AM",
    "1:30 AM",
    "2:00 AM",
    "2:30 AM",
    "3:00 AM",
    "3:30 AM",
    "4:00 AM",
    "4:30 AM",
    "5:00 AM",
    "5:30 AM",
    "6:00 AM",
    "6:30 AM",
    "7:00 AM",
    "7:30 AM",
    "8:00 AM",
    "8:30 AM",
    "9:00 AM",
    "9:30 AM",
    "10:00 AM",
    "10:30 AM",
    "11:00 AM",
    "11:30 AM",
    "12:00 PM",
    "12:30 PM",
    "1:00 PM",
    "1:30 PM",
    "2:00 PM",
    "2:30 PM",
    "3:00 PM",
    "3:30 PM",
    "4:00 PM",
    "4:30 PM",
    "5:00 PM",
    "5:30 PM",
    "6:00 PM",
    "6:30 PM",
    "7:00 PM",
    "7:30 PM",
    "8:00 PM",
    "8:30 PM",
    "9:00 PM",
    "9:30 PM",
    "10:00 PM",
    "10:30 PM",
    "11:00 PM",
    "11:30 PM",
  ];

  // Load saved addresses from localStorage
  useEffect(() => {
    const loadSavedAddresses = () => {
      const addresses = JSON.parse(
        localStorage.getItem("savedAddresses") || "[]"
      );
      setSavedAddresses(addresses);
    };

    if (isOpen) {
      loadSavedAddresses();
    }
  }, [isOpen]);

  const handleStateActionSelect = (state: string) => {
    // Handle the state action selection from the StateDropdown
    console.log("State filter selected:", state);
    setSelectedStateFilter(state);
  };

  // Filter addresses based on selected state
  const filteredAddresses =
    selectedStateFilter === "All"
      ? savedAddresses
      : savedAddresses.filter(
          (address) => address.state === selectedStateFilter
        );

  // Debug logging
  useEffect(() => {
    console.log("Current filter:", selectedStateFilter);
    console.log("Total addresses:", savedAddresses.length);
    console.log("Filtered addresses:", filteredAddresses.length);
  }, [selectedStateFilter, savedAddresses, filteredAddresses]);

  const handleDeleteAddress = (addressId: string) => {
    if (window.confirm("Are you sure you want to delete this address?")) {
      const updatedAddresses = savedAddresses.filter(
        (addr) => addr.id !== addressId
      );
      setSavedAddresses(updatedAddresses);
      localStorage.setItem("savedAddresses", JSON.stringify(updatedAddresses));
    }
  };

  const formatOpeningHours = (hours: { from: string; to: string }) => {
    if (!hours.from || !hours.to) return "Closed";
    return `${hours.from} - ${hours.to}`;
  };

  const handleEditAddress = (address: SavedAddress) => {
    setEditingAddress(address);
    setEditForm({
      state: address.state,
      lga: address.lga,
      fullAddress: address.fullAddress,
      discountCode: address.discountCode || "",
      openingHours: { ...address.openingHours },
    });
  };

  const handleSaveEdit = () => {
    if (!editingAddress) return;

    const updatedAddresses = savedAddresses.map((addr) =>
      addr.id === editingAddress.id
        ? {
            ...addr,
            state: editForm.state,
            lga: editForm.lga,
            fullAddress: editForm.fullAddress,
            discountCode: editForm.discountCode,
            openingHours: editForm.openingHours,
          }
        : addr
    );

    setSavedAddresses(updatedAddresses);
    localStorage.setItem("savedAddresses", JSON.stringify(updatedAddresses));
    closeAllDropdowns();
    setEditingAddress(null);
  };

  const handleCancelEdit = () => {
    setEditingAddress(null);
    closeAllDropdowns();
    setEditForm({
      state: "",
      lga: "",
      fullAddress: "",
      discountCode: "",
      openingHours: {
        monday: { from: "", to: "" },
        tuesday: { from: "", to: "" },
        wednesday: { from: "", to: "" },
        thursday: { from: "", to: "" },
        friday: { from: "", to: "" },
        saturday: { from: "", to: "" },
        sunday: { from: "", to: "" },
      },
    });
  };

  const handleTimeChange = (
    day: string,
    timeType: "from" | "to",
    value: string
  ) => {
    setEditForm((prev) => ({
      ...prev,
      openingHours: {
        ...prev.openingHours,
        [day]: {
          ...prev.openingHours[day as keyof typeof prev.openingHours],
          [timeType]: value,
        },
      },
    }));
  };

  const toggleDropdown = (dropdownName: string) => {
    setDropdownStates((prev) => ({
      ...prev,
      [dropdownName]: !prev[dropdownName as keyof typeof prev],
    }));
  };

  const closeAllDropdowns = () => {
    setDropdownStates({
      mondayFrom: false,
      mondayTo: false,
      tuesdayFrom: false,
      tuesdayTo: false,
      wednesdayFrom: false,
      wednesdayTo: false,
      thursdayFrom: false,
      thursdayTo: false,
      fridayFrom: false,
      fridayTo: false,
      saturdayFrom: false,
      saturdayTo: false,
      sundayFrom: false,
      sundayTo: false,
    });
  };

  const handleTimeSelect = (period: string, time: string) => {
    const [day, timeType] = period.split(/(?=[A-Z])/);
    const formattedDay = day.toLowerCase();
    const formattedTimeType = timeType.toLowerCase() as "from" | "to";

    handleTimeChange(formattedDay, formattedTimeType, time);
    closeAllDropdowns();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 bg-[#00000080] bg-opacity-50 flex justify-end">
      <div className="bg-white w-[500px] relative h-full overflow-y-auto overflow-x-visible">
        {/* Header */}
        <div className="border-b border-[#787878] p-3 sticky top-0 bg-white z-10 flex items-center">
          <button
            onClick={onBack || onClose}
            className="mr-3 cursor-pointer mt-1"
          >
            <img src={images.rightarrow} alt="Back" className="rotate-180" />
          </button>
          <h2 className="text-xl font-semibold">Saved Address</h2>
          <button
            onClick={onClose}
            className="absolute flex items-center right-3 cursor-pointer"
          >
            <img src={images.close} alt="Close" />
          </button>
        </div>

        <div className="p-5 overflow-visible">
          {/* State Dropdown and Add New Address Button */}
          <div className="flex flex-row justify-between items-center mb-5 overflow-visible">
            <div className="overflow-visible">
              <StateDropdown onStateSelect={handleStateActionSelect} />
            </div>
            <button
              onClick={onAddNewAddress}
              className="bg-[#E53E3E] text-white px-5 py-3.5 rounded-lg font-semibold cursor-pointer"
            >
              Add New Address
            </button>
          </div>

          {/* Dynamic Address Cards */}
          {filteredAddresses.length === 0 ? (
            <div className="text-center py-8">
              {savedAddresses.length === 0 ? (
                <>
                  <p className="text-gray-500 text-lg">
                    No saved addresses yet
                  </p>
                  <p className="text-gray-400 text-sm">
                    Click "Add New Address" to get started
                  </p>
                </>
              ) : (
                <>
                  <p className="text-gray-500 text-lg">No addresses found</p>
                  <p className="text-gray-400 text-sm">
                    No addresses match the selected state filter
                  </p>
                </>
              )}
            </div>
          ) : (
            filteredAddresses.map((address) => {
              // Find the original index in the savedAddresses array
              const originalIndex = savedAddresses.findIndex(
                (addr) => addr.id === address.id
              );
              return (
                <div
                  key={address.id}
                  className="bg-white border border-gray-200 rounded-2xl overflow-hidden mb-4"
                >
                  {/* Address Header */}
                  <div className="bg-[#E53E3E] text-white p-3">
                    <h3 className="text-lg font-semibold">
                      Address {originalIndex + 1}
                    </h3>
                  </div>

                  {/* Address Details */}
                  {editingAddress?.id === address.id ? (
                    // Edit Mode
                    <div className="space-y-3">
                      <div className="flex border-b border-b-[#CDCDCD] p-3">
                        <span className="text-[#00000080] min-w-[140px] flex-shrink-0">
                          State
                        </span>
                        <input
                          type="text"
                          value={editForm.state}
                          onChange={(e) =>
                            setEditForm((prev) => ({
                              ...prev,
                              state: e.target.value,
                            }))
                          }
                          className="font-medium flex-1 border border-gray-300 rounded px-2 py-1"
                        />
                      </div>
                      <div className="flex border-b border-b-[#CDCDCD] p-3">
                        <span className="text-[#00000080] min-w-[140px] flex-shrink-0">
                          Local Government
                        </span>
                        <input
                          type="text"
                          value={editForm.lga}
                          onChange={(e) =>
                            setEditForm((prev) => ({
                              ...prev,
                              lga: e.target.value,
                            }))
                          }
                          className="font-medium flex-1 border border-gray-300 rounded px-2 py-1"
                        />
                      </div>
                      <div className="flex border-b border-b-[#CDCDCD] p-3">
                        <span className="text-[#00000080] min-w-[140px] flex-shrink-0">
                          Full address
                        </span>
                        <textarea
                          value={editForm.fullAddress}
                          onChange={(e) =>
                            setEditForm((prev) => ({
                              ...prev,
                              fullAddress: e.target.value,
                            }))
                          }
                          className="font-medium flex-1 break-words border border-gray-300 rounded px-2 py-1 resize-none"
                          rows={2}
                        />
                      </div>
                      <div className="flex border-b border-b-[#CDCDCD] p-3">
                        <span className="text-[#00000080] min-w-[140px] flex-shrink-0">
                          Discount Code
                        </span>
                        <input
                          type="text"
                          value={editForm.discountCode}
                          onChange={(e) =>
                            setEditForm((prev) => ({
                              ...prev,
                              discountCode: e.target.value,
                            }))
                          }
                          className="font-medium flex-1 border border-gray-300 rounded px-2 py-1"
                        />
                      </div>
                    </div>
                  ) : (
                    // Display Mode
                    <div className="space-y-3">
                      <div className="flex border-b border-b-[#CDCDCD] p-3">
                        <span className="text-[#00000080] min-w-[140px] flex-shrink-0">
                          State
                        </span>
                        <span className="font-medium flex-1">
                          {address.state}
                        </span>
                      </div>
                      <div className="flex border-b border-b-[#CDCDCD] p-3">
                        <span className="text-[#00000080] min-w-[140px] flex-shrink-0">
                          Local Government
                        </span>
                        <span className="font-medium flex-1">
                          {address.lga}
                        </span>
                      </div>
                      <div className="flex border-b border-b-[#CDCDCD] p-3">
                        <span className="text-[#00000080] min-w-[140px] flex-shrink-0">
                          Full address
                        </span>
                        <span className="font-medium flex-1 break-words">
                          {address.fullAddress}
                        </span>
                      </div>
                      <div className="flex border-b border-b-[#CDCDCD] p-3">
                        <span className="text-[#00000080] min-w-[140px] flex-shrink-0">
                          Discount Code
                        </span>
                        <span className="font-medium flex-1">
                          {address.discountCode || "N/A"}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Opening Hours */}
                  <div className="px-4 pb-4 mt-3">
                    <div className="bg-red-50 rounded-2xl p-4">
                      <div className="flex items-center mb-3">
                        <img
                          src={images.clock}
                          alt="Clock"
                          className="w-5 h-5 mr-2"
                        />
                        <span className="font-semibold">Opening Hours</span>
                      </div>

                      {editingAddress?.id === address.id ? (
                        // Edit Mode for Opening Hours
                        <div className="flex flex-col mt-3 space-y-3">
                          {/* Monday */}
                          <div className="flex flex-row justify-between">
                            <div className="font-semibold flex items-center min-w-[80px] text-sm">
                              Monday
                            </div>
                            <div className="flex flex-row gap-2">
                              <div className="relative">
                                <div
                                  className="w-24 border border-[#989898] px-2 py-2 rounded-lg text-xs flex flex-row justify-between items-center cursor-pointer bg-white"
                                  onClick={() => toggleDropdown("mondayFrom")}
                                >
                                  <div
                                    className={
                                      editForm.openingHours.monday.from
                                        ? "text-black"
                                        : "text-[#00000080]"
                                    }
                                  >
                                    {editForm.openingHours.monday.from ||
                                      "From"}
                                  </div>
                                  <div
                                    className={`transform transition-transform duration-200 ${
                                      dropdownStates.mondayFrom
                                        ? "rotate-90"
                                        : ""
                                    }`}
                                  >
                                    <img
                                      src={images?.rightarrow}
                                      alt="arrow"
                                      className="w-2 h-2"
                                    />
                                  </div>
                                </div>

                                {dropdownStates.mondayFrom && (
                                  <div className="absolute z-20 w-28 mt-1 bg-white border border-[#989898] rounded-lg shadow-lg max-h-40 overflow-y-auto">
                                    {timeOptions.map((time, index) => (
                                      <div
                                        key={index}
                                        className="p-1.5 hover:bg-gray-50 cursor-pointer text-xs border-b border-gray-100 last:border-b-0"
                                        onClick={() =>
                                          handleTimeSelect("mondayFrom", time)
                                        }
                                      >
                                        {time}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <div className="relative">
                                <div
                                  className="w-24 border border-[#989898] px-2 py-2 rounded-lg text-xs flex flex-row justify-between items-center cursor-pointer bg-white"
                                  onClick={() => toggleDropdown("mondayTo")}
                                >
                                  <div
                                    className={
                                      editForm.openingHours.monday.to
                                        ? "text-black"
                                        : "text-[#00000080]"
                                    }
                                  >
                                    {editForm.openingHours.monday.to || "To"}
                                  </div>
                                  <div
                                    className={`transform transition-transform duration-200 ${
                                      dropdownStates.mondayTo ? "rotate-90" : ""
                                    }`}
                                  >
                                    <img
                                      src={images?.rightarrow}
                                      alt="arrow"
                                      className="w-2 h-2"
                                    />
                                  </div>
                                </div>

                                {dropdownStates.mondayTo && (
                                  <div className="absolute z-20 w-28 mt-1 bg-white border border-[#989898] rounded-lg shadow-lg max-h-40 overflow-y-auto">
                                    {timeOptions.map((time, index) => (
                                      <div
                                        key={index}
                                        className="p-1.5 hover:bg-gray-50 cursor-pointer text-xs border-b border-gray-100 last:border-b-0"
                                        onClick={() =>
                                          handleTimeSelect("mondayTo", time)
                                        }
                                      >
                                        {time}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Tuesday */}
                          <div className="flex flex-row justify-between">
                            <div className="font-semibold flex items-center min-w-[80px] text-sm">
                              Tuesday
                            </div>
                            <div className="flex flex-row gap-2">
                              <div className="relative">
                                <div
                                  className="w-24 border border-[#989898] px-2 py-2 rounded-lg text-xs flex flex-row justify-between items-center cursor-pointer bg-white"
                                  onClick={() => toggleDropdown("tuesdayFrom")}
                                >
                                  <div
                                    className={
                                      editForm.openingHours.tuesday.from
                                        ? "text-black"
                                        : "text-[#00000080]"
                                    }
                                  >
                                    {editForm.openingHours.tuesday.from ||
                                      "From"}
                                  </div>
                                  <div
                                    className={`transform transition-transform duration-200 ${
                                      dropdownStates.tuesdayFrom
                                        ? "rotate-90"
                                        : ""
                                    }`}
                                  >
                                    <img
                                      src={images?.rightarrow}
                                      alt="arrow"
                                      className="w-2 h-2"
                                    />
                                  </div>
                                </div>

                                {dropdownStates.tuesdayFrom && (
                                  <div className="absolute z-20 w-28 mt-1 bg-white border border-[#989898] rounded-lg shadow-lg max-h-40 overflow-y-auto">
                                    {timeOptions.map((time, index) => (
                                      <div
                                        key={index}
                                        className="p-1.5 hover:bg-gray-50 cursor-pointer text-xs border-b border-gray-100 last:border-b-0"
                                        onClick={() =>
                                          handleTimeSelect("tuesdayFrom", time)
                                        }
                                      >
                                        {time}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <div className="relative">
                                <div
                                  className="w-24 border border-[#989898] px-2 py-2 rounded-lg text-xs flex flex-row justify-between items-center cursor-pointer bg-white"
                                  onClick={() => toggleDropdown("tuesdayTo")}
                                >
                                  <div
                                    className={
                                      editForm.openingHours.tuesday.to
                                        ? "text-black"
                                        : "text-[#00000080]"
                                    }
                                  >
                                    {editForm.openingHours.tuesday.to || "To"}
                                  </div>
                                  <div
                                    className={`transform transition-transform duration-200 ${
                                      dropdownStates.tuesdayTo
                                        ? "rotate-90"
                                        : ""
                                    }`}
                                  >
                                    <img
                                      src={images?.rightarrow}
                                      alt="arrow"
                                      className="w-2 h-2"
                                    />
                                  </div>
                                </div>

                                {dropdownStates.tuesdayTo && (
                                  <div className="absolute z-20 w-28 mt-1 bg-white border border-[#989898] rounded-lg shadow-lg max-h-40 overflow-y-auto">
                                    {timeOptions.map((time, index) => (
                                      <div
                                        key={index}
                                        className="p-1.5 hover:bg-gray-50 cursor-pointer text-xs border-b border-gray-100 last:border-b-0"
                                        onClick={() =>
                                          handleTimeSelect("tuesdayTo", time)
                                        }
                                      >
                                        {time}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Wednesday */}
                          <div className="flex flex-row justify-between">
                            <div className="font-semibold flex items-center min-w-[80px] text-sm">
                              Wednesday
                            </div>
                            <div className="flex flex-row gap-2">
                              <div className="relative">
                                <div
                                  className="w-24 border border-[#989898] px-2 py-2 rounded-lg text-xs flex flex-row justify-between items-center cursor-pointer bg-white"
                                  onClick={() =>
                                    toggleDropdown("wednesdayFrom")
                                  }
                                >
                                  <div
                                    className={
                                      editForm.openingHours.wednesday.from
                                        ? "text-black"
                                        : "text-[#00000080]"
                                    }
                                  >
                                    {editForm.openingHours.wednesday.from ||
                                      "From"}
                                  </div>
                                  <div
                                    className={`transform transition-transform duration-200 ${
                                      dropdownStates.wednesdayFrom
                                        ? "rotate-90"
                                        : ""
                                    }`}
                                  >
                                    <img
                                      src={images?.rightarrow}
                                      alt="arrow"
                                      className="w-2 h-2"
                                    />
                                  </div>
                                </div>

                                {dropdownStates.wednesdayFrom && (
                                  <div className="absolute z-20 w-28 mt-1 bg-white border border-[#989898] rounded-lg shadow-lg max-h-40 overflow-y-auto">
                                    {timeOptions.map((time, index) => (
                                      <div
                                        key={index}
                                        className="p-1.5 hover:bg-gray-50 cursor-pointer text-xs border-b border-gray-100 last:border-b-0"
                                        onClick={() =>
                                          handleTimeSelect(
                                            "wednesdayFrom",
                                            time
                                          )
                                        }
                                      >
                                        {time}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <div className="relative">
                                <div
                                  className="w-24 border border-[#989898] px-2 py-2 rounded-lg text-xs flex flex-row justify-between items-center cursor-pointer bg-white"
                                  onClick={() => toggleDropdown("wednesdayTo")}
                                >
                                  <div
                                    className={
                                      editForm.openingHours.wednesday.to
                                        ? "text-black"
                                        : "text-[#00000080]"
                                    }
                                  >
                                    {editForm.openingHours.wednesday.to || "To"}
                                  </div>
                                  <div
                                    className={`transform transition-transform duration-200 ${
                                      dropdownStates.wednesdayTo
                                        ? "rotate-90"
                                        : ""
                                    }`}
                                  >
                                    <img
                                      src={images?.rightarrow}
                                      alt="arrow"
                                      className="w-2 h-2"
                                    />
                                  </div>
                                </div>

                                {dropdownStates.wednesdayTo && (
                                  <div className="absolute z-20 w-28 mt-1 bg-white border border-[#989898] rounded-lg shadow-lg max-h-40 overflow-y-auto">
                                    {timeOptions.map((time, index) => (
                                      <div
                                        key={index}
                                        className="p-1.5 hover:bg-gray-50 cursor-pointer text-xs border-b border-gray-100 last:border-b-0"
                                        onClick={() =>
                                          handleTimeSelect("wednesdayTo", time)
                                        }
                                      >
                                        {time}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Thursday */}
                          <div className="flex flex-row justify-between">
                            <div className="font-semibold flex items-center min-w-[80px] text-sm">
                              Thursday
                            </div>
                            <div className="flex flex-row gap-2">
                              <div className="relative">
                                <div
                                  className="w-24 border border-[#989898] px-2 py-2 rounded-lg text-xs flex flex-row justify-between items-center cursor-pointer bg-white"
                                  onClick={() => toggleDropdown("thursdayFrom")}
                                >
                                  <div
                                    className={
                                      editForm.openingHours.thursday.from
                                        ? "text-black"
                                        : "text-[#00000080]"
                                    }
                                  >
                                    {editForm.openingHours.thursday.from ||
                                      "From"}
                                  </div>
                                  <div
                                    className={`transform transition-transform duration-200 ${
                                      dropdownStates.thursdayFrom
                                        ? "rotate-90"
                                        : ""
                                    }`}
                                  >
                                    <img
                                      src={images?.rightarrow}
                                      alt="arrow"
                                      className="w-2 h-2"
                                    />
                                  </div>
                                </div>

                                {dropdownStates.thursdayFrom && (
                                  <div className="absolute z-20 w-28 mt-1 bg-white border border-[#989898] rounded-lg shadow-lg max-h-40 overflow-y-auto">
                                    {timeOptions.map((time, index) => (
                                      <div
                                        key={index}
                                        className="p-1.5 hover:bg-gray-50 cursor-pointer text-xs border-b border-gray-100 last:border-b-0"
                                        onClick={() =>
                                          handleTimeSelect("thursdayFrom", time)
                                        }
                                      >
                                        {time}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <div className="relative">
                                <div
                                  className="w-24 border border-[#989898] px-2 py-2 rounded-lg text-xs flex flex-row justify-between items-center cursor-pointer bg-white"
                                  onClick={() => toggleDropdown("thursdayTo")}
                                >
                                  <div
                                    className={
                                      editForm.openingHours.thursday.to
                                        ? "text-black"
                                        : "text-[#00000080]"
                                    }
                                  >
                                    {editForm.openingHours.thursday.to || "To"}
                                  </div>
                                  <div
                                    className={`transform transition-transform duration-200 ${
                                      dropdownStates.thursdayTo
                                        ? "rotate-90"
                                        : ""
                                    }`}
                                  >
                                    <img
                                      src={images?.rightarrow}
                                      alt="arrow"
                                      className="w-2 h-2"
                                    />
                                  </div>
                                </div>

                                {dropdownStates.thursdayTo && (
                                  <div className="absolute z-20 w-28 mt-1 bg-white border border-[#989898] rounded-lg shadow-lg max-h-40 overflow-y-auto">
                                    {timeOptions.map((time, index) => (
                                      <div
                                        key={index}
                                        className="p-1.5 hover:bg-gray-50 cursor-pointer text-xs border-b border-gray-100 last:border-b-0"
                                        onClick={() =>
                                          handleTimeSelect("thursdayTo", time)
                                        }
                                      >
                                        {time}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Friday */}
                          <div className="flex flex-row justify-between">
                            <div className="font-semibold flex items-center min-w-[80px] text-sm">
                              Friday
                            </div>
                            <div className="flex flex-row gap-2">
                              <div className="relative">
                                <div
                                  className="w-24 border border-[#989898] px-2 py-2 rounded-lg text-xs flex flex-row justify-between items-center cursor-pointer bg-white"
                                  onClick={() => toggleDropdown("fridayFrom")}
                                >
                                  <div
                                    className={
                                      editForm.openingHours.friday.from
                                        ? "text-black"
                                        : "text-[#00000080]"
                                    }
                                  >
                                    {editForm.openingHours.friday.from ||
                                      "From"}
                                  </div>
                                  <div
                                    className={`transform transition-transform duration-200 ${
                                      dropdownStates.fridayFrom
                                        ? "rotate-90"
                                        : ""
                                    }`}
                                  >
                                    <img
                                      src={images?.rightarrow}
                                      alt="arrow"
                                      className="w-2 h-2"
                                    />
                                  </div>
                                </div>

                                {dropdownStates.fridayFrom && (
                                  <div className="absolute z-20 w-28 mt-1 bg-white border border-[#989898] rounded-lg shadow-lg max-h-40 overflow-y-auto">
                                    {timeOptions.map((time, index) => (
                                      <div
                                        key={index}
                                        className="p-1.5 hover:bg-gray-50 cursor-pointer text-xs border-b border-gray-100 last:border-b-0"
                                        onClick={() =>
                                          handleTimeSelect("fridayFrom", time)
                                        }
                                      >
                                        {time}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <div className="relative">
                                <div
                                  className="w-24 border border-[#989898] px-2 py-2 rounded-lg text-xs flex flex-row justify-between items-center cursor-pointer bg-white"
                                  onClick={() => toggleDropdown("fridayTo")}
                                >
                                  <div
                                    className={
                                      editForm.openingHours.friday.to
                                        ? "text-black"
                                        : "text-[#00000080]"
                                    }
                                  >
                                    {editForm.openingHours.friday.to || "To"}
                                  </div>
                                  <div
                                    className={`transform transition-transform duration-200 ${
                                      dropdownStates.fridayTo ? "rotate-90" : ""
                                    }`}
                                  >
                                    <img
                                      src={images?.rightarrow}
                                      alt="arrow"
                                      className="w-2 h-2"
                                    />
                                  </div>
                                </div>

                                {dropdownStates.fridayTo && (
                                  <div className="absolute z-20 w-28 mt-1 bg-white border border-[#989898] rounded-lg shadow-lg max-h-40 overflow-y-auto">
                                    {timeOptions.map((time, index) => (
                                      <div
                                        key={index}
                                        className="p-1.5 hover:bg-gray-50 cursor-pointer text-xs border-b border-gray-100 last:border-b-0"
                                        onClick={() =>
                                          handleTimeSelect("fridayTo", time)
                                        }
                                      >
                                        {time}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Saturday */}
                          <div className="flex flex-row justify-between">
                            <div className="font-semibold flex items-center min-w-[80px] text-sm">
                              Saturday
                            </div>
                            <div className="flex flex-row gap-2">
                              <div className="relative">
                                <div
                                  className="w-24 border border-[#989898] px-2 py-2 rounded-lg text-xs flex flex-row justify-between items-center cursor-pointer bg-white"
                                  onClick={() => toggleDropdown("saturdayFrom")}
                                >
                                  <div
                                    className={
                                      editForm.openingHours.saturday.from
                                        ? "text-black"
                                        : "text-[#00000080]"
                                    }
                                  >
                                    {editForm.openingHours.saturday.from ||
                                      "From"}
                                  </div>
                                  <div
                                    className={`transform transition-transform duration-200 ${
                                      dropdownStates.saturdayFrom
                                        ? "rotate-90"
                                        : ""
                                    }`}
                                  >
                                    <img
                                      src={images?.rightarrow}
                                      alt="arrow"
                                      className="w-2 h-2"
                                    />
                                  </div>
                                </div>

                                {dropdownStates.saturdayFrom && (
                                  <div className="absolute z-20 w-28 mt-1 bg-white border border-[#989898] rounded-lg shadow-lg max-h-40 overflow-y-auto">
                                    {timeOptions.map((time, index) => (
                                      <div
                                        key={index}
                                        className="p-1.5 hover:bg-gray-50 cursor-pointer text-xs border-b border-gray-100 last:border-b-0"
                                        onClick={() =>
                                          handleTimeSelect("saturdayFrom", time)
                                        }
                                      >
                                        {time}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <div className="relative">
                                <div
                                  className="w-24 border border-[#989898] px-2 py-2 rounded-lg text-xs flex flex-row justify-between items-center cursor-pointer bg-white"
                                  onClick={() => toggleDropdown("saturdayTo")}
                                >
                                  <div
                                    className={
                                      editForm.openingHours.saturday.to
                                        ? "text-black"
                                        : "text-[#00000080]"
                                    }
                                  >
                                    {editForm.openingHours.saturday.to || "To"}
                                  </div>
                                  <div
                                    className={`transform transition-transform duration-200 ${
                                      dropdownStates.saturdayTo
                                        ? "rotate-90"
                                        : ""
                                    }`}
                                  >
                                    <img
                                      src={images?.rightarrow}
                                      alt="arrow"
                                      className="w-2 h-2"
                                    />
                                  </div>
                                </div>

                                {dropdownStates.saturdayTo && (
                                  <div className="absolute z-20 w-28 mt-1 bg-white border border-[#989898] rounded-lg shadow-lg max-h-40 overflow-y-auto">
                                    {timeOptions.map((time, index) => (
                                      <div
                                        key={index}
                                        className="p-1.5 hover:bg-gray-50 cursor-pointer text-xs border-b border-gray-100 last:border-b-0"
                                        onClick={() =>
                                          handleTimeSelect("saturdayTo", time)
                                        }
                                      >
                                        {time}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Sunday */}
                          <div className="flex flex-row justify-between">
                            <div className="font-semibold flex items-center min-w-[80px] text-sm">
                              Sunday
                            </div>
                            <div className="flex flex-row gap-2">
                              <div className="relative">
                                <div
                                  className="w-24 border border-[#989898] px-2 py-2 rounded-lg text-xs flex flex-row justify-between items-center cursor-pointer bg-white"
                                  onClick={() => toggleDropdown("sundayFrom")}
                                >
                                  <div
                                    className={
                                      editForm.openingHours.sunday.from
                                        ? "text-black"
                                        : "text-[#00000080]"
                                    }
                                  >
                                    {editForm.openingHours.sunday.from ||
                                      "From"}
                                  </div>
                                  <div
                                    className={`transform transition-transform duration-200 ${
                                      dropdownStates.sundayFrom
                                        ? "rotate-90"
                                        : ""
                                    }`}
                                  >
                                    <img
                                      src={images?.rightarrow}
                                      alt="arrow"
                                      className="w-2 h-2"
                                    />
                                  </div>
                                </div>

                                {dropdownStates.sundayFrom && (
                                  <div className="absolute z-20 w-28 mt-1 bg-white border border-[#989898] rounded-lg shadow-lg max-h-40 overflow-y-auto">
                                    {timeOptions.map((time, index) => (
                                      <div
                                        key={index}
                                        className="p-1.5 hover:bg-gray-50 cursor-pointer text-xs border-b border-gray-100 last:border-b-0"
                                        onClick={() =>
                                          handleTimeSelect("sundayFrom", time)
                                        }
                                      >
                                        {time}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <div className="relative">
                                <div
                                  className="w-24 border border-[#989898] px-2 py-2 rounded-lg text-xs flex flex-row justify-between items-center cursor-pointer bg-white"
                                  onClick={() => toggleDropdown("sundayTo")}
                                >
                                  <div
                                    className={
                                      editForm.openingHours.sunday.to
                                        ? "text-black"
                                        : "text-[#00000080]"
                                    }
                                  >
                                    {editForm.openingHours.sunday.to || "To"}
                                  </div>
                                  <div
                                    className={`transform transition-transform duration-200 ${
                                      dropdownStates.sundayTo ? "rotate-90" : ""
                                    }`}
                                  >
                                    <img
                                      src={images?.rightarrow}
                                      alt="arrow"
                                      className="w-2 h-2"
                                    />
                                  </div>
                                </div>

                                {dropdownStates.sundayTo && (
                                  <div className="absolute z-20 w-28 mt-1 bg-white border border-[#989898] rounded-lg shadow-lg max-h-40 overflow-y-auto">
                                    {timeOptions.map((time, index) => (
                                      <div
                                        key={index}
                                        className="p-1.5 hover:bg-gray-50 cursor-pointer text-xs border-b border-gray-100 last:border-b-0"
                                        onClick={() =>
                                          handleTimeSelect("sundayTo", time)
                                        }
                                      >
                                        {time}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        // Display Mode for Opening Hours
                        <div className="space-y-2 text-sm">
                          <div className="flex">
                            <span className="text-[#00000080] min-w-[80px] flex-shrink-0">
                              Monday
                            </span>
                            <span className="flex-1">
                              {formatOpeningHours(address.openingHours.monday)}
                            </span>
                          </div>
                          <div className="flex">
                            <span className="text-[#00000080] min-w-[80px] flex-shrink-0">
                              Tuesday
                            </span>
                            <span className="flex-1">
                              {formatOpeningHours(address.openingHours.tuesday)}
                            </span>
                          </div>
                          <div className="flex">
                            <span className="text-[#00000080] min-w-[80px] flex-shrink-0">
                              Wednesday
                            </span>
                            <span className="flex-1">
                              {formatOpeningHours(
                                address.openingHours.wednesday
                              )}
                            </span>
                          </div>
                          <div className="flex">
                            <span className="text-[#00000080] min-w-[80px] flex-shrink-0">
                              Thursday
                            </span>
                            <span className="flex-1">
                              {formatOpeningHours(
                                address.openingHours.thursday
                              )}
                            </span>
                          </div>
                          <div className="flex">
                            <span className="text-[#00000080] min-w-[80px] flex-shrink-0">
                              Friday
                            </span>
                            <span className="flex-1">
                              {formatOpeningHours(address.openingHours.friday)}
                            </span>
                          </div>
                          <div className="flex">
                            <span className="text-[#00000080] min-w-[80px] flex-shrink-0">
                              Saturday
                            </span>
                            <span className="flex-1">
                              {formatOpeningHours(
                                address.openingHours.saturday
                              )}
                            </span>
                          </div>
                          <div className="flex">
                            <span className="text-[#00000080] min-w-[80px] flex-shrink-0">
                              Sunday
                            </span>
                            <span className="flex-1">
                              {formatOpeningHours(address.openingHours.sunday)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="p-5">
                    {editingAddress?.id === address.id ? (
                      // Edit Mode Buttons
                      <>
                        <div className="flex flex-row justify-between">
                          <div>
                            <button
                              onClick={handleSaveEdit}
                              className="bg-green-500 text-white px-19 py-3 rounded font-medium cursor-pointer"
                            >
                              Save
                            </button>
                          </div>
                          <div>
                            <button
                              onClick={handleCancelEdit}
                              className="bg-gray-500 text-white px-19 py-3 rounded font-medium cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </>
                    ) : (
                      // Normal Mode Buttons
                      <>
                        <button
                          className="p-2"
                          onClick={() => handleEditAddress(address)}
                        >
                          <img
                            src={images.edit1}
                            alt="Edit"
                            className="w-8 h-8 cursor-pointer"
                          />
                        </button>
                        <button
                          className="p-2"
                          onClick={() => handleDeleteAddress(address.id)}
                        >
                          <img
                            src={images.delete1}
                            alt="Delete"
                            className="w-7 h-7 cursor-pointer"
                          />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}

          <div className="">
            <button
              onClick={onAddNewDeliveryPricing}
              className="w-full py-4 bg-[#E53E3E] text-white rounded-lg cursor-pointer"
            >
              Add New
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SavedAddressModal;
