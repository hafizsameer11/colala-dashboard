import images from "../../../constants/images";
import { useState } from "react";

export interface DeliveryPricingEntry {
  id: string;
  state: string;
  lga: string;
  price: string;
  isFreeDelivery: boolean;
}

interface AddNewDeliveryPricingProps {
  isOpen: boolean;
  onClose: () => void;
  onBack?: () => void;
  onSave?: (newEntry: DeliveryPricingEntry) => void;
}

const AddNewDeliveryPricing: React.FC<AddNewDeliveryPricingProps> = ({
  isOpen,
  onClose,
  onBack,
  onSave,
}) => {
  const [selectedState, setSelectedState] = useState("");
  const [selectedLga, setSelectedLga] = useState("");
  const [deliveryFee, setDeliveryFee] = useState("");
  const [isFreeDelivery, setIsFreeDelivery] = useState(false);

  const [dropdownStates, setDropdownStates] = useState({
    state: false,
    lga: false,
  });

  // Error state for validation
  const [errors] = useState({
    state: "",
    lga: "",
    deliveryFee: "",
  });

  // Sample data - you can replace with your actual data
  const states = ["Lagos", "Abuja", "Rivers", "Kano"];
  const lgas = ["Ikeja", "Lekki", "Victoria Island", "Surulere"];

  const toggleDropdown = (dropdownName: string) => {
    setDropdownStates((prev) => ({
      ...prev,
      [dropdownName]: !prev[dropdownName as keyof typeof prev],
    }));
  };

  const closeAllDropdowns = () => {
    setDropdownStates({
      state: false,
      lga: false,
    });
  };

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
    if (!selectedState || !selectedLga) {
      alert("Please select State and LGA");
      return;
    }

    if (!isFreeDelivery && !deliveryFee) {
      alert("Please enter delivery fee or mark as free delivery");
      return;
    }

    // Create new delivery pricing entry
    const newEntry: DeliveryPricingEntry = {
      id: Date.now().toString(),
      state: selectedState,
      lga: selectedLga,
      price: isFreeDelivery ? "Free" : `N${deliveryFee}`,
      isFreeDelivery: isFreeDelivery,
    };

    // Call the save callback if provided
    if (onSave) {
      onSave(newEntry);
    }

    // Reset form but keep modal open
    setSelectedState("");
    setSelectedLga("");
    setDeliveryFee("");
    setIsFreeDelivery(false);

    // Show success message
    alert("Delivery pricing added successfully!");
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
          <h2 className="text-xl font-semibold">Add New Delivery Pricing</h2>
          <button
            onClick={onClose}
            className="absolute flex items-center right-3 cursor-pointer"
          >
            <img src={images.close} alt="Close" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5">
          {/* State Dropdown */}
          <div className="mb-8">
            <label className="block text-base font-medium text-black mb-3">
              State
            </label>
            <div className="relative">
              <div
                className={`flex items-center justify-between w-full p-4 border rounded-lg cursor-pointer transition-colors ${
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
                  {states.map((state, index) => (
                    <div
                      key={index}
                      className="p-4 hover:bg-gray-50 cursor-pointer text-base border-b border-gray-100 last:border-b-0"
                      onClick={() => handleStateSelect(state)}
                    >
                      {state}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {errors.state && (
              <p className="text-red-500 text-sm mt-1">{errors.state}</p>
            )}
          </div>

          {/* LGA Dropdown */}
          <div className="mb-8">
            <label className="block text-base font-medium text-black mb-3">
              LGA
            </label>
            <div className="relative">
              <div
                className={`flex items-center justify-between w-full p-4 border rounded-lg cursor-pointer transition-colors ${
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

          {/* Delivery Fee Input */}
          <div className="mb-8">
            <label className="block text-base font-medium text-black mb-3">
              Delivery Fee
            </label>
            <input
              type="text"
              value={deliveryFee}
              onChange={(e) => setDeliveryFee(e.target.value)}
              placeholder="Enter delivery fee"
              className={`w-full p-4 border rounded-lg transition-colors ${
                errors.deliveryFee ? "border-red-500" : "border-[#989898]"
              }`}
            />
            {errors.deliveryFee && (
              <p className="text-red-500 text-sm mt-1">{errors.deliveryFee}</p>
            )}
          </div>

          <div className="flex flex-row items-center gap-3">
            <div>
              <div
                className={`w-5 h-5 mt-1.5 border-2 rounded cursor-pointer transition-colors ${
                  isFreeDelivery
                    ? "bg-[#E53E3E] border-[#E53E3E]"
                    : "bg-white border-gray-400 hover:border-gray-500"
                }`}
                onClick={() => setIsFreeDelivery(!isFreeDelivery)}
              ></div>
            </div>
            <div className="text-xl font-semibold">Mark for free delivery</div>
          </div>

          {/* Save Button */}
          <div className="mt-8">
            <button
              onClick={handleSave}
              className="w-full bg-[#E53E3E] text-white py-4 rounded-xl font-medium cursor-pointer "
            >
              Save Delivery Price
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddNewDeliveryPricing;
