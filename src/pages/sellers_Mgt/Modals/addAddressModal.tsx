import images from "../../../constants/images";
import { useState } from "react";

interface AddAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBack?: () => void;
}

const AddAddressModal: React.FC<AddAddressModalProps> = ({
  isOpen,
  onClose,
  onBack,
}) => {
  const [selectedstate, setSelectedstate] = useState("");
  const [selectedLGA, setSelectedLGA] = useState("");
  const [fullAddress, setFullAddress] = useState("");
  const [selectedFromTime, setSelectedFromTime] = useState("");

  const [dropdownStates, setDropdownStates] = useState({
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

  const [errors, setErrors] = useState({
    state: "",
    lga: "",
    fullAddress: "",
  });

  const state = ["Lagos", "Abuja", "Kano"];
  const lgaOptions = [
    "Ikeja",
    "Lagos Island",
    "Surulere",
    "Yaba",
    "Victoria Island",
  ];

  // Generate 24-hour time options
  const timeOptions = [];
  for (let hour = 1; hour <= 12; hour++) {
    timeOptions.push(`${hour}:00 AM`);
    if (hour !== 12) {
      timeOptions.push(`${hour}:30 AM`);
    }
  }
  for (let hour = 1; hour <= 12; hour++) {
    timeOptions.push(`${hour}:00 PM`);
    if (hour !== 12) {
      timeOptions.push(`${hour}:30 PM`);
    }
  }

  const toggleDropdown = (dropdownName: keyof typeof dropdownStates) => {
    setDropdownStates((prev) => ({
      ...prev,
      [dropdownName]: !prev[dropdownName],
    }));
  };

  const handlestateSelect = (state: string) => {
    setSelectedstate(state);
    setDropdownStates((prev) => ({ ...prev, state: false }));
    if (errors.state) {
      setErrors((prev) => ({ ...prev, state: "" }));
    }
  };

  const handleLGASelect = (lga: string) => {
    setSelectedLGA(lga);
    setDropdownStates((prev) => ({ ...prev, lga: false }));
    if (errors.lga) {
      setErrors((prev) => ({ ...prev, lga: "" }));
    }
  };

  const handleFromTimeSelect = (time: string) => {
    setSelectedFromTime(time);
    setDropdownStates((prev) => ({ ...prev, fromTime: false }));
  };

  const handleSave = () => {
    // Handle save logic here
    console.log("Saving address:", {
      state: selectedstate,
      lga: selectedLGA,
      fullAddress: fullAddress,
    });
    onClose();
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
                  className={selectedstate ? "text-black" : "text-[#00000080]"}
                >
                  {selectedstate || "Select State"}
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
                  {state.map((stateOption, index) => (
                    <div
                      key={index}
                      className="p-4 hover:bg-gray-50 cursor-pointer text-base border-b border-gray-100 last:border-b-0"
                      onClick={() => handlestateSelect(stateOption)}
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
                  className={selectedLGA ? "text-black" : "text-[#00000080]"}
                >
                  {selectedLGA || "Select LGA"}
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
                  {lgaOptions.map((lga, index) => (
                    <div
                      key={index}
                      className="p-4 hover:bg-gray-50 cursor-pointer text-base border-b border-gray-100 last:border-b-0"
                      onClick={() => handleLGASelect(lga)}
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
                          selectedFromTime ? "text-black" : "text-[#00000080]"
                        }
                      >
                        {selectedFromTime || "From"}
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
                            onClick={() => handleFromTimeSelect(time)}
                          >
                            {time}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-row gap-5">
                  {/* To Time Dropdown */}
                  <div className="relative">
                    <div
                      className="w-42 border border-[#989898] px-2 py-3 rounded-lg text-sm flex flex-row justify-between items-center cursor-pointer bg-white"
                      onClick={() => toggleDropdown("mondayTo")}
                    >
                      <div
                        className={
                          selectedFromTime ? "text-black" : "text-[#00000080]"
                        }
                      >
                        {selectedFromTime || "To"}
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
                            onClick={() => handleFromTimeSelect(time)}
                          >
                            {time}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-row justify-between mt-5">
                <div className="font-semibold flex items-center w-23">
                  Tuesday
                </div>
                <div className="flex flex-row gap-5">
                  {/* From Time Dropdown */}
                  <div className="relative">
                    <div
                      className="w-42 border border-[#989898] px-2 py-3 rounded-lg text-sm flex flex-row justify-between items-center cursor-pointer bg-white"
                      onClick={() => toggleDropdown("tuesdayFrom")}
                    >
                      <div
                        className={
                          selectedFromTime ? "text-black" : "text-[#00000080]"
                        }
                      >
                        {selectedFromTime || "From"}
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
                            onClick={() => handleFromTimeSelect(time)}
                          >
                            {time}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-row gap-5">
                  {/* To Time Dropdown */}
                  <div className="relative">
                    <div
                      className="w-42 border border-[#989898] px-2 py-3 rounded-lg text-sm flex flex-row justify-between items-center cursor-pointer bg-white"
                      onClick={() => toggleDropdown("tuesdayTo")}
                    >
                      <div
                        className={
                          selectedFromTime ? "text-black" : "text-[#00000080]"
                        }
                      >
                        {selectedFromTime || "To"}
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
                            onClick={() => handleFromTimeSelect(time)}
                          >
                            {time}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-row justify-between mt-5">
                <div className="font-semibold flex items-center w-23">
                  Wednesday
                </div>
                <div className="flex flex-row gap-5">
                  {/* From Time Dropdown */}
                  <div className="relative">
                    <div
                      className="w-42 border border-[#989898] px-2 py-3 rounded-lg text-sm flex flex-row justify-between items-center cursor-pointer bg-white"
                      onClick={() => toggleDropdown("wednesdayFrom")}
                    >
                      <div
                        className={
                          selectedFromTime ? "text-black" : "text-[#00000080]"
                        }
                      >
                        {selectedFromTime || "From"}
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
                            onClick={() => handleFromTimeSelect(time)}
                          >
                            {time}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-row gap-5">
                  {/* From Time Dropdown */}
                  <div className="relative">
                    <div
                      className="w-42 border border-[#989898] px-2 py-3 rounded-lg text-sm flex flex-row justify-between items-center cursor-pointer bg-white"
                      onClick={() => toggleDropdown("wednesdayTo")}
                    >
                      <div
                        className={
                          selectedFromTime ? "text-black" : "text-[#00000080]"
                        }
                      >
                        {selectedFromTime || "To"}
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
                            onClick={() => handleFromTimeSelect(time)}
                          >
                            {time}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-row justify-between mt-5">
                <div className="font-semibold flex items-center w-23">
                  Thursday
                </div>
                <div className="flex flex-row gap-5">
                  {/* From Time Dropdown */}
                  <div className="relative">
                    <div
                      className="w-42 border border-[#989898] px-2 py-3 rounded-lg text-sm flex flex-row justify-between items-center cursor-pointer bg-white"
                      onClick={() => toggleDropdown("thursdayFrom")}
                    >
                      <div
                        className={
                          selectedFromTime ? "text-black" : "text-[#00000080]"
                        }
                      >
                        {selectedFromTime || "From"}
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
                            onClick={() => handleFromTimeSelect(time)}
                          >
                            {time}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-row gap-5">
                  {/* From Time Dropdown */}
                  <div className="relative">
                    <div
                      className="w-42 border border-[#989898] px-2 py-3 rounded-lg text-sm flex flex-row justify-between items-center cursor-pointer bg-white"
                      onClick={() => toggleDropdown("thursdayTo")}
                    >
                      <div
                        className={
                          selectedFromTime ? "text-black" : "text-[#00000080]"
                        }
                      >
                        {selectedFromTime || "To"}
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
                            onClick={() => handleFromTimeSelect(time)}
                          >
                            {time}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-row justify-between mt-5 ">
                <div className="font-semibold flex items-center w-23">
                  Friday
                </div>
                <div className="flex flex-row gap-5">
                  {/* From Time Dropdown */}
                  <div className="relative">
                    <div
                      className="w-42 border border-[#989898] px-2 py-3 rounded-lg text-sm flex flex-row justify-between items-center cursor-pointer bg-white"
                      onClick={() => toggleDropdown("fridayFrom")}
                    >
                      <div
                        className={
                          selectedFromTime ? "text-black" : "text-[#00000080]"
                        }
                      >
                        {selectedFromTime || "From"}
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
                            onClick={() => handleFromTimeSelect(time)}
                          >
                            {time}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-row gap-5">
                  {/* From Time Dropdown */}
                  <div className="relative">
                    <div
                      className="w-42 border border-[#989898] px-2 py-3 rounded-lg text-sm flex flex-row justify-between items-center cursor-pointer bg-white"
                      onClick={() => toggleDropdown("fridayTo")}
                    >
                      <div
                        className={
                          selectedFromTime ? "text-black" : "text-[#00000080]"
                        }
                      >
                        {selectedFromTime || "To"}
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
                            onClick={() => handleFromTimeSelect(time)}
                          >
                            {time}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-row justify-between mt-5">
                <div className="font-semibold flex items-center w-23">
                  Saturday
                </div>
                <div className="flex flex-row gap-5">
                  {/* From Time Dropdown */}
                  <div className="relative">
                    <div
                      className="w-42 border border-[#989898] px-2 py-3 rounded-lg text-sm flex flex-row justify-between items-center cursor-pointer bg-white"
                      onClick={() => toggleDropdown("saturdayFrom")}
                    >
                      <div
                        className={
                          selectedFromTime ? "text-black" : "text-[#00000080]"
                        }
                      >
                        {selectedFromTime || "From"}
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
                            onClick={() => handleFromTimeSelect(time)}
                          >
                            {time}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-row gap-5">
                  {/* From Time Dropdown */}
                  <div className="relative">
                    <div
                      className="w-42 border border-[#989898] px-2 py-3 rounded-lg text-sm flex flex-row justify-between items-center cursor-pointer bg-white"
                      onClick={() => toggleDropdown("saturdayTo")}
                    >
                      <div
                        className={
                          selectedFromTime ? "text-black" : "text-[#00000080]"
                        }
                      >
                        {selectedFromTime || "To"}
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
                            onClick={() => handleFromTimeSelect(time)}
                          >
                            {time}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-row justify-between mt-5">
                <div className="font-semibold flex items-center w-23">
                  Sunday
                </div>
                <div className="flex flex-row gap-5">
                  {/* From Time Dropdown */}
                  <div className="relative">
                    <div
                      className="w-42 border border-[#989898] px-2 py-3 rounded-lg text-sm flex flex-row justify-between items-center cursor-pointer bg-white"
                      onClick={() => toggleDropdown("sundayFrom")}
                    >
                      <div
                        className={
                          selectedFromTime ? "text-black" : "text-[#00000080]"
                        }
                      >
                        {selectedFromTime || "From"}
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
                            onClick={() => handleFromTimeSelect(time)}
                          >
                            {time}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-row gap-5">
                  {/* From Time Dropdown */}
                  <div className="relative">
                    <div
                      className="w-42 border border-[#989898] px-2 py-3 rounded-lg text-sm flex flex-row justify-between items-center cursor-pointer bg-white"
                      onClick={() => toggleDropdown("sundayTo")}
                    >
                      <div
                        className={
                          selectedFromTime ? "text-black" : "text-[#00000080]"
                        }
                      >
                        {selectedFromTime || "To"}
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
                            onClick={() => handleFromTimeSelect(time)}
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
