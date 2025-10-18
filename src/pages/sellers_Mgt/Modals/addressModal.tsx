import React, { useState } from "react";
import images from "../../../constants/images";

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (addressData: AddressData) => void;
}

interface AddressData {
  state: string;
  lga: string;
  fullAddress: string;
  openingHours: {
    [key: string]: {
      from: string;
      to: string;
    };
  };
  isMainStore: boolean;
}

const AddressModal: React.FC<AddressModalProps> = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState<AddressData>({
    state: "",
    lga: "",
    fullAddress: "",
    openingHours: {
      Monday: { from: "", to: "" },
      Tuesday: { from: "", to: "" },
      Wednesday: { from: "", to: "" },
      Thursday: { from: "", to: "" },
      Friday: { from: "", to: "" },
      Saturday: { from: "", to: "" },
      Sunday: { from: "", to: "" },
    },
    isMainStore: false,
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const states = [
    "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", 
    "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", 
    "FCT", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", 
    "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", 
    "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara"
  ];

  const lgas = [
    "Aba North", "Aba South", "Arochukwu", "Bende", "Ikwuano", "Isiala Ngwa North",
    "Isiala Ngwa South", "Isuikwuato", "Obi Ngwa", "Ohafia", "Osisioma", "Ugwunagbo",
    "Ukwa East", "Ukwa West", "Umuahia North", "Umuahia South", "Umu Nneochi"
  ];

  const timeSlots = [
    "12:00 AM", "12:30 AM", "1:00 AM", "1:30 AM", "2:00 AM", "2:30 AM", "3:00 AM", "3:30 AM",
    "4:00 AM", "4:30 AM", "5:00 AM", "5:30 AM", "6:00 AM", "6:30 AM", "7:00 AM", "7:30 AM",
    "8:00 AM", "8:30 AM", "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
    "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM",
    "4:00 PM", "4:30 PM", "5:00 PM", "5:30 PM", "6:00 PM", "6:30 PM", "7:00 PM", "7:30 PM",
    "8:00 PM", "8:30 PM", "9:00 PM", "9:30 PM", "10:00 PM", "10:30 PM", "11:00 PM", "11:30 PM"
  ];

  const [showStateDropdown, setShowStateDropdown] = useState(false);
  const [showLGADropdown, setShowLGADropdown] = useState(false);
  const [showTimeDropdowns, setShowTimeDropdowns] = useState<{ [key: string]: boolean }>({});

  const handleInputChange = (field: keyof AddressData, value: string | boolean) => {
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

  const handleOpeningHoursChange = (day: string, field: 'from' | 'to', value: string) => {
    setFormData(prev => ({
      ...prev,
      openingHours: {
        ...prev.openingHours,
        [day]: {
          ...prev.openingHours[day],
          [field]: value
        }
      }
    }));
  };

  const toggleTimeDropdown = (day: string, field: 'from' | 'to') => {
    const key = `${day}-${field}`;
    setShowTimeDropdowns(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.state) newErrors.state = "State is required";
    if (!formData.lga) newErrors.lga = "LGA is required";
    if (!formData.fullAddress.trim()) newErrors.fullAddress = "Full address is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 bg-[#00000080] bg-opacity-50 flex justify-center items-center">
      <div className="bg-white w-[400px] max-h-[90vh] overflow-y-auto rounded-2xl">
        {/* Header */}
        <div className="bg-gray-800 p-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center">
            <button onClick={onClose} className="mr-3">
              <img src={images.rightarrow} alt="Back" className="w-6 h-6 rotate-180" />
            </button>
            <h2 className="text-white text-lg font-semibold">Add New Address</h2>
          </div>
          <button onClick={onClose} className="text-white">
            <img src={images.close} alt="Close" className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* State */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
            <div className="relative">
              <div
                className={`w-full border p-3 rounded-lg cursor-pointer flex justify-between items-center ${
                  errors.state ? "border-red-500" : "border-gray-300"
                }`}
                onClick={() => setShowStateDropdown(!showStateDropdown)}
              >
                <span className={formData.state ? "text-black" : "text-gray-500"}>
                  {formData.state || "Select State"}
                </span>
                <img src={images.rightarrow} alt="arrow" className="w-4 h-4" />
              </div>
              {showStateDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                  {states.map((state) => (
                    <div
                      key={state}
                      className="p-3 hover:bg-gray-50 cursor-pointer text-sm border-b border-gray-100 last:border-b-0"
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
            {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
          </div>

          {/* LGA */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">LGA</label>
            <div className="relative">
              <div
                className={`w-full border p-3 rounded-lg cursor-pointer flex justify-between items-center ${
                  errors.lga ? "border-red-500" : "border-gray-300"
                }`}
                onClick={() => setShowLGADropdown(!showLGADropdown)}
              >
                <span className={formData.lga ? "text-black" : "text-gray-500"}>
                  {formData.lga || "Select LGA"}
                </span>
                <img src={images.rightarrow} alt="arrow" className="w-4 h-4" />
              </div>
              {showLGADropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                  {lgas.map((lga) => (
                    <div
                      key={lga}
                      className="p-3 hover:bg-gray-50 cursor-pointer text-sm border-b border-gray-100 last:border-b-0"
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
            {errors.lga && <p className="text-red-500 text-xs mt-1">{errors.lga}</p>}
          </div>

          {/* Full Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Address</label>
            <textarea
              value={formData.fullAddress}
              onChange={(e) => handleInputChange("fullAddress", e.target.value)}
              placeholder="Enter full address"
              className={`w-full border p-3 rounded-lg resize-none h-20 ${
                errors.fullAddress ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.fullAddress && <p className="text-red-500 text-xs mt-1">{errors.fullAddress}</p>}
          </div>

          {/* Opening Hours */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Opening Hours</label>
            <div className="space-y-3">
              {Object.entries(formData.openingHours).map(([day, hours]) => (
                <div key={day} className="flex items-center space-x-2">
                  <div className="w-20 text-sm font-medium text-gray-700">{day}</div>
                  <div className="flex-1 flex space-x-2">
                    {/* From Time */}
                    <div className="relative flex-1">
                      <div
                        className="w-full border p-2 rounded cursor-pointer flex justify-between items-center text-sm"
                        onClick={() => toggleTimeDropdown(day, 'from')}
                      >
                        <span className={hours.from ? "text-black" : "text-gray-500"}>
                          {hours.from || "From"}
                        </span>
                        <img src={images.dropdown} alt="dropdown" className="w-3 h-3" />
                      </div>
                      {showTimeDropdowns[`${day}-from`] && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-32 overflow-y-auto">
                          {timeSlots.map((time) => (
                            <div
                              key={time}
                              className="p-2 hover:bg-gray-50 cursor-pointer text-xs"
                              onClick={() => {
                                handleOpeningHoursChange(day, 'from', time);
                                setShowTimeDropdowns(prev => ({ ...prev, [`${day}-from`]: false }));
                              }}
                            >
                              {time}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    {/* To Time */}
                    <div className="relative flex-1">
                      <div
                        className="w-full border p-2 rounded cursor-pointer flex justify-between items-center text-sm"
                        onClick={() => toggleTimeDropdown(day, 'to')}
                      >
                        <span className={hours.to ? "text-black" : "text-gray-500"}>
                          {hours.to || "To"}
                        </span>
                        <img src={images.dropdown} alt="dropdown" className="w-3 h-3" />
                      </div>
                      {showTimeDropdowns[`${day}-to`] && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-32 overflow-y-auto">
                          {timeSlots.map((time) => (
                            <div
                              key={time}
                              className="p-2 hover:bg-gray-50 cursor-pointer text-xs"
                              onClick={() => {
                                handleOpeningHoursChange(day, 'to', time);
                                setShowTimeDropdowns(prev => ({ ...prev, [`${day}-to`]: false }));
                              }}
                            >
                              {time}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mark as Main Store */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => handleInputChange("isMainStore", !formData.isMainStore)}
              className={`w-4 h-4 border-2 rounded ${
                formData.isMainStore 
                  ? "bg-red-500 border-red-500" 
                  : "border-gray-300"
              }`}
            >
              {formData.isMainStore && (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              )}
            </button>
            <span className="text-sm text-gray-700">Mark as Main Store</span>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            className="w-full bg-red-500 text-white py-3 rounded-lg font-medium hover:bg-red-600 transition-colors"
          >
            Save Address
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddressModal;
