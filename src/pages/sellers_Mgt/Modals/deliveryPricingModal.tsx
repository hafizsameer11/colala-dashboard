import React, { useState } from "react";
import images from "../../../constants/images";

interface DeliveryPricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (pricingData: DeliveryPricingData) => void;
}

interface DeliveryPricingData {
  state: string;
  lga: string;
  deliveryFee: string;
  isFreeDelivery: boolean;
}

const DeliveryPricingModal: React.FC<DeliveryPricingModalProps> = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState<DeliveryPricingData>({
    state: "",
    lga: "",
    deliveryFee: "",
    isFreeDelivery: false,
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const states = [
    "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue",
    "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu",
    "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi",
    "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun",
    "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara"
  ];

  const lgas = [
    "Aba North", "Aba South", "Arochukwu", "Bende", "Ikwuano", "Isiala Ngwa North",
    "Isiala Ngwa South", "Isuikwuato", "Obi Ngwa", "Ohafia", "Osisioma", "Ugwunagbo",
    "Ukwa East", "Ukwa West", "Umuahia North", "Umuahia South", "Umu Nneochi"
  ];

  const [showStateDropdown, setShowStateDropdown] = useState(false);
  const [showLGADropdown, setShowLGADropdown] = useState(false);

  const handleInputChange = (field: keyof DeliveryPricingData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  const handleSave = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.state) newErrors.state = "State is required";
    if (!formData.lga) newErrors.lga = "LGA is required";
    if (!formData.isFreeDelivery && !formData.deliveryFee.trim()) {
      newErrors.deliveryFee = "Delivery fee is required when not free";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 bg-[#00000080] bg-opacity-50 flex justify-end">
      <div className="bg-white w-[500px] relative h-full overflow-y-auto overflow-x-visible">
        {/* Header */}
        <div className="border-b border-[#787878] p-3 sticky top-0 bg-white z-10 flex items-center">
          <button
            onClick={onClose}
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

        <div className="p-5 overflow-visible">
          {/* State Section */}
          <div className="mb-6">
            <label className="block text-base font-medium text-black mb-3">
              State
            </label>
            <div className="relative">
              <div
                className={`w-full border p-4 rounded-lg text-base flex flex-row justify-between items-center cursor-pointer ${errors.state ? "border-red-500" : "border-[#989898]"
                  }`}
                onClick={() => setShowStateDropdown(!showStateDropdown)}
              >
                <div
                  className={formData.state ? "text-black" : "text-[#00000080]"}
                >
                  {formData.state || "Select State"}
                </div>
                <div
                  className={`transform transition-transform duration-200 ${showStateDropdown ? "rotate-90" : ""
                    }`}
                >
                  <img src={images?.rightarrow} alt="arrow" />
                </div>
              </div>

              {showStateDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-[#989898] rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {states.map((state, index) => (
                    <div
                      key={index}
                      className="p-4 hover:bg-gray-50 cursor-pointer text-base border-b border-gray-100 last:border-b-0"
                      onClick={() => {
                        handleInputChange("state", state);
                        setShowStateDropdown(false);
                      }}
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

          {/* LGA Section */}
          <div className="mb-6">
            <label className="block text-base font-medium text-black mb-3">
              LGA
            </label>
            <div className="relative">
              <div
                className={`w-full border p-4 rounded-lg text-base flex flex-row justify-between items-center cursor-pointer ${errors.lga ? "border-red-500" : "border-[#989898]"
                  }`}
                onClick={() => setShowLGADropdown(!showLGADropdown)}
              >
                <div
                  className={formData.lga ? "text-black" : "text-[#00000080]"}
                >
                  {formData.lga || "Select LGA"}
                </div>
                <div
                  className={`transform transition-transform duration-200 ${showLGADropdown ? "rotate-90" : ""
                    }`}
                >
                  <img src={images?.rightarrow} alt="arrow" />
                </div>
              </div>

              {showLGADropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-[#989898] rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {lgas.map((lga, index) => (
                    <div
                      key={index}
                      className="p-4 hover:bg-gray-50 cursor-pointer text-base border-b border-gray-100 last:border-b-0"
                      onClick={() => {
                        handleInputChange("lga", lga);
                        setShowLGADropdown(false);
                      }}
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

          {/* Delivery Fee Section */}
          <div className="mb-6">
            <label className="block text-base font-medium text-black mb-3">
              Delivery Fee
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.deliveryFee}
                onChange={(e) => handleInputChange("deliveryFee", e.target.value)}
                placeholder="Enter delivery fee"
                disabled={formData.isFreeDelivery}
                className={`w-full border p-4 rounded-lg pr-10 text-base ${errors.deliveryFee ? "border-red-500" : "border-[#989898]"
                  } ${formData.isFreeDelivery ? "bg-gray-100" : ""}`}
              />
              <img
                src={images.rightarrow}
                alt="arrow"
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              />
            </div>
            {errors.deliveryFee && (
              <p className="text-red-500 text-sm mt-1">{errors.deliveryFee}</p>
            )}
          </div>

          {/* Mark for Free Delivery */}
          <div
            className={`mt-5 flex flex-row gap-3 items-center p-2 rounded ${formData.isFreeDelivery ? "bg-[#E53E3E]" : "bg-transparent"
              }`}
          >
            <input
              type="checkbox"
              name="freeDelivery"
              id="freeDelivery"
              checked={formData.isFreeDelivery}
              onChange={() => {
                handleInputChange("isFreeDelivery", !formData.isFreeDelivery);
                if (!formData.isFreeDelivery) {
                  handleInputChange("deliveryFee", "");
                }
              }}
              className="w-5 h-5 accent-[#E53E3E]"
            />
            <span className="font-semibold text-md">Mark for free delivery</span>
          </div>

          {/* Save Button */}
          <div className="mt-5">
            <button
              onClick={handleSave}
              className="bg-[#E53E3E] w-full text-white px-8 py-3 rounded-lg font-semibold cursor-pointer hover:bg-red-600 transition-colors"
            >
              Save Delivery Price
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryPricingModal;
