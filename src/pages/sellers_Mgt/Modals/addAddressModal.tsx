import images from "../../../constants/images";
import { useState } from "react";

interface AddAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBack?: () => void;
  onAddressSaved?: () => void;
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

const AddAddressModal: React.FC<AddAddressModalProps> = ({
  isOpen,
  onClose,
  onBack,
  onAddressSaved,
}) => {
  const [selectedState, setSelectedState] = useState("");
  const [selectedLga, setSelectedLga] = useState("");
  const [fullAddress, setFullAddress] = useState("");
  const [checked] = useState(false);

  // Error state (for future validation if needed)
  const [errors] = useState({
    state: "",
    lga: "",
  });

  const [timeSelections, setTimeSelections] = useState({
    mondayFrom: "",
    mondayTo: "",
    tuesdayFrom: "",
    tuesdayTo: "",
    wednesdayFrom: "",
    wednesdayTo: "",
    thursdayFrom: "",
    thursdayTo: "",
    fridayFrom: "",
    fridayTo: "",
    saturdayFrom: "",
    saturdayTo: "",
    sundayFrom: "",
    sundayTo: "",
  });

  const [dropdownStates, setDropdownStates] = useState({
    country: false,
    state: false,
    lga: false,
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

  // Sample data
  const states = ["Lagos", "Abuja", "Rivers", "Kano"];
  const lgas = ["Ikeja", "Lekki", "Victoria Island", "Surulere"];
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

  const toggleDropdown = (dropdownName: string) => {
    setDropdownStates((prev) => ({
      ...prev,
      [dropdownName]: !prev[dropdownName as keyof typeof prev],
    }));
  };

  const closeAllDropdowns = () => {
    setDropdownStates({
      country: false,
      state: false,
      lga: false,
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

  // Generic time selection handler
  const handleTimeSelect = (period: string, time: string) => {
    setTimeSelections((prev) => ({
      ...prev,
      [period]: time,
    }));
    closeAllDropdowns();
  };

  // Generic selection handlers
  const handleStateSelect = (state: string) => {
    setSelectedState(state);
    closeAllDropdowns();
  };

  const handleLgaSelect = (lga: string) => {
    setSelectedLga(lga);
    closeAllDropdowns();
  };

  const handleSave = () => {
    // Validation
    if (!selectedState || !selectedLga || !fullAddress) {
      alert("Please fill in all required fields");
      return;
    }

    // Create new address object
    const newAddress: SavedAddress = {
      id: Date.now().toString(),
      state: selectedState,
      lga: selectedLga,
      fullAddress: fullAddress,
      discountCode: "NEW123", // Default discount code
      openingHours: {
        monday: {
          from: timeSelections.mondayFrom || "08:00 AM",
          to: timeSelections.mondayTo || "07:00 PM",
        },
        tuesday: {
          from: timeSelections.tuesdayFrom || "08:00 AM",
          to: timeSelections.tuesdayTo || "07:00 PM",
        },
        wednesday: {
          from: timeSelections.wednesdayFrom || "08:00 AM",
          to: timeSelections.wednesdayTo || "07:00 PM",
        },
        thursday: {
          from: timeSelections.thursdayFrom || "08:00 AM",
          to: timeSelections.thursdayTo || "07:00 PM",
        },
        friday: {
          from: timeSelections.fridayFrom || "08:00 AM",
          to: timeSelections.fridayTo || "07:00 PM",
        },
        saturday: {
          from: timeSelections.saturdayFrom || "08:00 AM",
          to: timeSelections.saturdayTo || "07:00 PM",
        },
        sunday: {
          from: timeSelections.sundayFrom || "08:00 AM",
          to: timeSelections.sundayTo || "07:00 PM",
        },
      },
      createdAt: new Date().toISOString(),
    };

    // Get existing addresses from localStorage
    const existingAddresses = JSON.parse(
      localStorage.getItem("savedAddresses") || "[]"
    );

    // Add new address
    existingAddresses.push(newAddress);

    // Save back to localStorage
    localStorage.setItem("savedAddresses", JSON.stringify(existingAddresses));

    console.log("Address saved:", newAddress);

    // Callback to parent to refresh saved addresses
    if (onAddressSaved) {
      onAddressSaved();
    }

    // Reset form fields after saving
    setSelectedState("");
    setSelectedLga("");
    setFullAddress("");
    setTimeSelections({
      mondayFrom: "",
      mondayTo: "",
      tuesdayFrom: "",
      tuesdayTo: "",
      wednesdayFrom: "",
      wednesdayTo: "",
      thursdayFrom: "",
      thursdayTo: "",
      fridayFrom: "",
      fridayTo: "",
      saturdayFrom: "",
      saturdayTo: "",
      sundayFrom: "",
      sundayTo: "",
    });
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
          <h2 className="text-xl font-semibold">Add New Address</h2>
          <button
            onClick={onClose}
            className="absolute flex items-center right-3 cursor-pointer"
          >
            <img src={images.close} alt="Close" />
          </button>
        </div>

        <div className="p-5 overflow-visible">
          {/* State Section */}
          <div className="mb-6">
            <label className="block text-base font-medium text-black mb-3">
              State
            </label>
            <div className="relative">
              <div
                className={`w-full border p-4 rounded-lg text-base flex flex-row justify-between items-center cursor-pointer ${
                  errors.state ? "border-red-500" : "border-[#989898]"
                }`}
                onClick={() => toggleDropdown("state")}
              >
                <div
                  className={selectedState ? "text-black" : "text-[#00000080]"}
                >
                  {selectedState || "Select State"}
                </div>
                <div
                  className={`transform transition-transform duration-200 ${
                    dropdownStates.state ? "rotate-90" : ""
                  }`}
                >
                  <img src={images?.rightarrow} alt="arrow" />
                </div>
              </div>

              {dropdownStates.state && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-[#989898] rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {states.map((stateOption, index) => (
                    <div
                      key={index}
                      className="p-4 hover:bg-gray-50 cursor-pointer text-base border-b border-gray-100 last:border-b-0"
                      onClick={() => handleStateSelect(stateOption)}
                    >
                      {stateOption}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {errors.state && (
              <p className="text-red-500 text-sm mt-1">{errors.state}</p>
            )}
          </div>

          {/* LGA Section */}
          <div className="mb-6">
            <label className="block text-base font-medium text-black mb-3">
              LGA
            </label>
            <div className="relative">
              <div
                className={`w-full border p-4 rounded-lg text-base flex flex-row justify-between items-center cursor-pointer ${
                  errors.lga ? "border-red-500" : "border-[#989898]"
                }`}
                onClick={() => toggleDropdown("lga")}
              >
                <div
                  className={selectedLga ? "text-black" : "text-[#00000080]"}
                >
                  {selectedLga || "Select LGA"}
                </div>
                <div
                  className={`transform transition-transform duration-200 ${
                    dropdownStates.lga ? "rotate-90" : ""
                  }`}
                >
                  <img src={images?.rightarrow} alt="arrow" />
                </div>
              </div>

              {dropdownStates.lga && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-[#989898] rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {lgas.map((lga, index) => (
                    <div
                      key={index}
                      className="p-4 hover:bg-gray-50 cursor-pointer text-base border-b border-gray-100 last:border-b-0"
                      onClick={() => handleLgaSelect(lga)}
                    >
                      {lga}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {errors.lga && (
              <p className="text-red-500 text-sm mt-1">{errors.lga}</p>
            )}
          </div>

          {/* Full Address Section */}
          <div className="mb-8">
            <label className="block text-base font-medium text-black mb-3">
              Full Address
            </label>
            <textarea
              value={fullAddress}
              onChange={(e) => setFullAddress(e.target.value)}
              placeholder="Enter full address"
              rows={6}
              className="w-full px-4 py-3 border border-[#989898] rounded-lg "
            />
          </div>

          <div className="mt-5">
            <span className="font-semibold text-lg">Opening Hours</span>
            <div className="flex flex-col mt-5">
              {/* Monday */}
              <div className="flex flex-row justify-between">
                <div className="font-semibold flex items-center w-23">
                  Monday
                </div>
                <div className="flex flex-row gap-5">
                  {/* From Time Dropdown */}
                  <div className="relative">
                    <div
                      className="w-42 border border-[#989898] px-2 py-3 rounded-lg text-sm flex flex-row justify-between items-center cursor-pointer bg-white"
                      onClick={() => toggleDropdown("mondayFrom")}
                    >
                      <div
                        className={
                          timeSelections.mondayFrom
                            ? "text-black"
                            : "text-[#00000080]"
                        }
                      >
                        {timeSelections.mondayFrom || "From"}
                      </div>
                      <div
                        className={`transform transition-transform duration-200 ${
                          dropdownStates.mondayFrom ? "rotate-90" : ""
                        }`}
                      >
                        <img
                          src={images?.rightarrow}
                          alt="arrow"
                          className="w-3 h-3"
                        />
                      </div>
                    </div>

                    {dropdownStates.mondayFrom && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-[#989898] rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {timeOptions.map((time, index) => (
                          <div
                            key={index}
                            className="p-2 hover:bg-gray-50 cursor-pointer text-sm border-b border-gray-100 last:border-b-0"
                            onClick={() => handleTimeSelect("mondayFrom", time)}
                          >
                            {time}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {/* To Time Dropdown */}
                  <div className="relative">
                    <div
                      className="w-42 border border-[#989898] px-2 py-3 rounded-lg text-sm flex flex-row justify-between items-center cursor-pointer bg-white"
                      onClick={() => toggleDropdown("mondayTo")}
                    >
                      <div
                        className={
                          timeSelections.mondayTo
                            ? "text-black"
                            : "text-[#00000080]"
                        }
                      >
                        {timeSelections.mondayTo || "To"}
                      </div>
                      <div
                        className={`transform transition-transform duration-200 ${
                          dropdownStates.mondayTo ? "rotate-90" : ""
                        }`}
                      >
                        <img
                          src={images?.rightarrow}
                          alt="arrow"
                          className="w-3 h-3"
                        />
                      </div>
                    </div>

                    {dropdownStates.mondayTo && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-[#989898] rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {timeOptions.map((time, index) => (
                          <div
                            key={index}
                            className="p-2 hover:bg-gray-50 cursor-pointer text-sm border-b border-gray-100 last:border-b-0"
                            onClick={() => handleTimeSelect("mondayTo", time)}
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
              <div className="flex flex-row justify-between mt-5">
                <div className="font-semibold flex items-center w-23">
                  Tuesday
                </div>
                <div className="flex flex-row gap-5">
                  <div className="relative">
                    <div
                      className="w-42 border border-[#989898] px-2 py-3 rounded-lg text-sm flex flex-row justify-between items-center cursor-pointer bg-white"
                      onClick={() => toggleDropdown("tuesdayFrom")}
                    >
                      <div
                        className={
                          timeSelections.tuesdayFrom
                            ? "text-black"
                            : "text-[#00000080]"
                        }
                      >
                        {timeSelections.tuesdayFrom || "From"}
                      </div>
                      <div
                        className={`transform transition-transform duration-200 ${
                          dropdownStates.tuesdayFrom ? "rotate-90" : ""
                        }`}
                      >
                        <img
                          src={images?.rightarrow}
                          alt="arrow"
                          className="w-3 h-3"
                        />
                      </div>
                    </div>

                    {dropdownStates.tuesdayFrom && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-[#989898] rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {timeOptions.map((time, index) => (
                          <div
                            key={index}
                            className="p-2 hover:bg-gray-50 cursor-pointer text-sm border-b border-gray-100 last:border-b-0"
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
                      className="w-42 border border-[#989898] px-2 py-3 rounded-lg text-sm flex flex-row justify-between items-center cursor-pointer bg-white"
                      onClick={() => toggleDropdown("tuesdayTo")}
                    >
                      <div
                        className={
                          timeSelections.tuesdayTo
                            ? "text-black"
                            : "text-[#00000080]"
                        }
                      >
                        {timeSelections.tuesdayTo || "To"}
                      </div>
                      <div
                        className={`transform transition-transform duration-200 ${
                          dropdownStates.tuesdayTo ? "rotate-90" : ""
                        }`}
                      >
                        <img
                          src={images?.rightarrow}
                          alt="arrow"
                          className="w-3 h-3"
                        />
                      </div>
                    </div>

                    {dropdownStates.tuesdayTo && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-[#989898] rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {timeOptions.map((time, index) => (
                          <div
                            key={index}
                            className="p-2 hover:bg-gray-50 cursor-pointer text-sm border-b border-gray-100 last:border-b-0"
                            onClick={() => handleTimeSelect("tuesdayTo", time)}
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
              <div className="flex flex-row justify-between mt-5">
                <div className="font-semibold flex items-center w-23">
                  Wednesday
                </div>
                <div className="flex flex-row gap-5">
                  <div className="relative">
                    <div
                      className="w-42 border border-[#989898] px-2 py-3 rounded-lg text-sm flex flex-row justify-between items-center cursor-pointer bg-white"
                      onClick={() => toggleDropdown("wednesdayFrom")}
                    >
                      <div
                        className={
                          timeSelections.wednesdayFrom
                            ? "text-black"
                            : "text-[#00000080]"
                        }
                      >
                        {timeSelections.wednesdayFrom || "From"}
                      </div>
                      <div
                        className={`transform transition-transform duration-200 ${
                          dropdownStates.wednesdayFrom ? "rotate-90" : ""
                        }`}
                      >
                        <img
                          src={images?.rightarrow}
                          alt="arrow"
                          className="w-3 h-3"
                        />
                      </div>
                    </div>

                    {dropdownStates.wednesdayFrom && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-[#989898] rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {timeOptions.map((time, index) => (
                          <div
                            key={index}
                            className="p-2 hover:bg-gray-50 cursor-pointer text-sm border-b border-gray-100 last:border-b-0"
                            onClick={() =>
                              handleTimeSelect("wednesdayFrom", time)
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
                      className="w-42 border border-[#989898] px-2 py-3 rounded-lg text-sm flex flex-row justify-between items-center cursor-pointer bg-white"
                      onClick={() => toggleDropdown("wednesdayTo")}
                    >
                      <div
                        className={
                          timeSelections.wednesdayTo
                            ? "text-black"
                            : "text-[#00000080]"
                        }
                      >
                        {timeSelections.wednesdayTo || "To"}
                      </div>
                      <div
                        className={`transform transition-transform duration-200 ${
                          dropdownStates.wednesdayTo ? "rotate-90" : ""
                        }`}
                      >
                        <img
                          src={images?.rightarrow}
                          alt="arrow"
                          className="w-3 h-3"
                        />
                      </div>
                    </div>

                    {dropdownStates.wednesdayTo && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-[#989898] rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {timeOptions.map((time, index) => (
                          <div
                            key={index}
                            className="p-2 hover:bg-gray-50 cursor-pointer text-sm border-b border-gray-100 last:border-b-0"
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
              <div className="flex flex-row justify-between mt-5">
                <div className="font-semibold flex items-center w-23">
                  Thursday
                </div>
                <div className="flex flex-row gap-5">
                  <div className="relative">
                    <div
                      className="w-42 border border-[#989898] px-2 py-3 rounded-lg text-sm flex flex-row justify-between items-center cursor-pointer bg-white"
                      onClick={() => toggleDropdown("thursdayFrom")}
                    >
                      <div
                        className={
                          timeSelections.thursdayFrom
                            ? "text-black"
                            : "text-[#00000080]"
                        }
                      >
                        {timeSelections.thursdayFrom || "From"}
                      </div>
                      <div
                        className={`transform transition-transform duration-200 ${
                          dropdownStates.thursdayFrom ? "rotate-90" : ""
                        }`}
                      >
                        <img
                          src={images?.rightarrow}
                          alt="arrow"
                          className="w-3 h-3"
                        />
                      </div>
                    </div>

                    {dropdownStates.thursdayFrom && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-[#989898] rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {timeOptions.map((time, index) => (
                          <div
                            key={index}
                            className="p-2 hover:bg-gray-50 cursor-pointer text-sm border-b border-gray-100 last:border-b-0"
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
                      className="w-42 border border-[#989898] px-2 py-3 rounded-lg text-sm flex flex-row justify-between items-center cursor-pointer bg-white"
                      onClick={() => toggleDropdown("thursdayTo")}
                    >
                      <div
                        className={
                          timeSelections.thursdayTo
                            ? "text-black"
                            : "text-[#00000080]"
                        }
                      >
                        {timeSelections.thursdayTo || "To"}
                      </div>
                      <div
                        className={`transform transition-transform duration-200 ${
                          dropdownStates.thursdayTo ? "rotate-90" : ""
                        }`}
                      >
                        <img
                          src={images?.rightarrow}
                          alt="arrow"
                          className="w-3 h-3"
                        />
                      </div>
                    </div>

                    {dropdownStates.thursdayTo && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-[#989898] rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {timeOptions.map((time, index) => (
                          <div
                            key={index}
                            className="p-2 hover:bg-gray-50 cursor-pointer text-sm border-b border-gray-100 last:border-b-0"
                            onClick={() => handleTimeSelect("thursdayTo", time)}
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
              <div className="flex flex-row justify-between mt-5">
                <div className="font-semibold flex items-center w-23">
                  Friday
                </div>
                <div className="flex flex-row gap-5">
                  <div className="relative">
                    <div
                      className="w-42 border border-[#989898] px-2 py-3 rounded-lg text-sm flex flex-row justify-between items-center cursor-pointer bg-white"
                      onClick={() => toggleDropdown("fridayFrom")}
                    >
                      <div
                        className={
                          timeSelections.fridayFrom
                            ? "text-black"
                            : "text-[#00000080]"
                        }
                      >
                        {timeSelections.fridayFrom || "From"}
                      </div>
                      <div
                        className={`transform transition-transform duration-200 ${
                          dropdownStates.fridayFrom ? "rotate-90" : ""
                        }`}
                      >
                        <img
                          src={images?.rightarrow}
                          alt="arrow"
                          className="w-3 h-3"
                        />
                      </div>
                    </div>

                    {dropdownStates.fridayFrom && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-[#989898] rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {timeOptions.map((time, index) => (
                          <div
                            key={index}
                            className="p-2 hover:bg-gray-50 cursor-pointer text-sm border-b border-gray-100 last:border-b-0"
                            onClick={() => handleTimeSelect("fridayFrom", time)}
                          >
                            {time}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="relative">
                    <div
                      className="w-42 border border-[#989898] px-2 py-3 rounded-lg text-sm flex flex-row justify-between items-center cursor-pointer bg-white"
                      onClick={() => toggleDropdown("fridayTo")}
                    >
                      <div
                        className={
                          timeSelections.fridayTo
                            ? "text-black"
                            : "text-[#00000080]"
                        }
                      >
                        {timeSelections.fridayTo || "To"}
                      </div>
                      <div
                        className={`transform transition-transform duration-200 ${
                          dropdownStates.fridayTo ? "rotate-90" : ""
                        }`}
                      >
                        <img
                          src={images?.rightarrow}
                          alt="arrow"
                          className="w-3 h-3"
                        />
                      </div>
                    </div>

                    {dropdownStates.fridayTo && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-[#989898] rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {timeOptions.map((time, index) => (
                          <div
                            key={index}
                            className="p-2 hover:bg-gray-50 cursor-pointer text-sm border-b border-gray-100 last:border-b-0"
                            onClick={() => handleTimeSelect("fridayTo", time)}
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
              <div className="flex flex-row justify-between mt-5">
                <div className="font-semibold flex items-center w-23">
                  Saturday
                </div>
                <div className="flex flex-row gap-5">
                  <div className="relative">
                    <div
                      className="w-42 border border-[#989898] px-2 py-3 rounded-lg text-sm flex flex-row justify-between items-center cursor-pointer bg-white"
                      onClick={() => toggleDropdown("saturdayFrom")}
                    >
                      <div
                        className={
                          timeSelections.saturdayFrom
                            ? "text-black"
                            : "text-[#00000080]"
                        }
                      >
                        {timeSelections.saturdayFrom || "From"}
                      </div>
                      <div
                        className={`transform transition-transform duration-200 ${
                          dropdownStates.saturdayFrom ? "rotate-90" : ""
                        }`}
                      >
                        <img
                          src={images?.rightarrow}
                          alt="arrow"
                          className="w-3 h-3"
                        />
                      </div>
                    </div>

                    {dropdownStates.saturdayFrom && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-[#989898] rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {timeOptions.map((time, index) => (
                          <div
                            key={index}
                            className="p-2 hover:bg-gray-50 cursor-pointer text-sm border-b border-gray-100 last:border-b-0"
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
                      className="w-42 border border-[#989898] px-2 py-3 rounded-lg text-sm flex flex-row justify-between items-center cursor-pointer bg-white"
                      onClick={() => toggleDropdown("saturdayTo")}
                    >
                      <div
                        className={
                          timeSelections.saturdayTo
                            ? "text-black"
                            : "text-[#00000080]"
                        }
                      >
                        {timeSelections.saturdayTo || "To"}
                      </div>
                      <div
                        className={`transform transition-transform duration-200 ${
                          dropdownStates.saturdayTo ? "rotate-90" : ""
                        }`}
                      >
                        <img
                          src={images?.rightarrow}
                          alt="arrow"
                          className="w-3 h-3"
                        />
                      </div>
                    </div>

                    {dropdownStates.saturdayTo && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-[#989898] rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {timeOptions.map((time, index) => (
                          <div
                            key={index}
                            className="p-2 hover:bg-gray-50 cursor-pointer text-sm border-b border-gray-100 last:border-b-0"
                            onClick={() => handleTimeSelect("saturdayTo", time)}
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
              <div className="flex flex-row justify-between mt-5">
                <div className="font-semibold flex items-center w-23">
                  Sunday
                </div>
                <div className="flex flex-row gap-5">
                  <div className="relative">
                    <div
                      className="w-42 border border-[#989898] px-2 py-3 rounded-lg text-sm flex flex-row justify-between items-center cursor-pointer bg-white"
                      onClick={() => toggleDropdown("sundayFrom")}
                    >
                      <div
                        className={
                          timeSelections.sundayFrom
                            ? "text-black"
                            : "text-[#00000080]"
                        }
                      >
                        {timeSelections.sundayFrom || "From"}
                      </div>
                      <div
                        className={`transform transition-transform duration-200 ${
                          dropdownStates.sundayFrom ? "rotate-90" : ""
                        }`}
                      >
                        <img
                          src={images?.rightarrow}
                          alt="arrow"
                          className="w-3 h-3"
                        />
                      </div>
                    </div>

                    {dropdownStates.sundayFrom && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-[#989898] rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {timeOptions.map((time, index) => (
                          <div
                            key={index}
                            className="p-2 hover:bg-gray-50 cursor-pointer text-sm border-b border-gray-100 last:border-b-0"
                            onClick={() => handleTimeSelect("sundayFrom", time)}
                          >
                            {time}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="relative">
                    <div
                      className="w-42 border border-[#989898] px-2 py-3 rounded-lg text-sm flex flex-row justify-between items-center cursor-pointer bg-white"
                      onClick={() => toggleDropdown("sundayTo")}
                    >
                      <div
                        className={
                          timeSelections.sundayTo
                            ? "text-black"
                            : "text-[#00000080]"
                        }
                      >
                        {timeSelections.sundayTo || "To"}
                      </div>
                      <div
                        className={`transform transition-transform duration-200 ${
                          dropdownStates.sundayTo ? "rotate-90" : ""
                        }`}
                      >
                        <img
                          src={images?.rightarrow}
                          alt="arrow"
                          className="w-3 h-3"
                        />
                      </div>
                    </div>

                    {dropdownStates.sundayTo && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-[#989898] rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {timeOptions.map((time, index) => (
                          <div
                            key={index}
                            className="p-2 hover:bg-gray-50 cursor-pointer text-sm border-b border-gray-100 last:border-b-0"
                            onClick={() => handleTimeSelect("sundayTo", time)}
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
          </div>

          <div
            className={`mt-5 flex flex-row gap-3 items-center p-2 rounded ${
              checked ? "bg-[#E53E3E]" : "bg-transparent"
            }`}
          >
            <input
              type="checkbox"
              name="mainStore"
              id="mainStore"
              className="w-5 h-5 accent-[#E53E3E]"
            />
            <span className="font-semibold text-md">Mark as Main Store</span>
          </div>

          {/* Save Button */}
          <div className="mt-5">
            <button
              onClick={handleSave}
              className="bg-[#E53E3E] w-full text-white px-8 py-3 rounded-lg font-semibold cursor-pointer hover:bg-red-600 transition-colors"
            >
              Save Address
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddAddressModal;
