import React, { useState } from "react";
import images from "../../../../constants/images";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [registrationBonus, setRegistrationBonus] = useState("");
  const [percentageBonus, setPercentageBonus] = useState("");

  const handleSave = () => {
    // Handle save logic here
    console.log("Registration Bonus:", registrationBonus);
    console.log("Percentage Bonus:", percentageBonus);
    onClose();
  };

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 backdrop-brightness-50 bg-opacity-50 -mt-3 flex items-start justify-end z-[9999]"
      onClick={handleOverlayClick}
      style={{ zIndex: 9999 }}
    >
      <div
        className="bg-white  w-[500px] h-[411px] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-[16px] font-semibold text-black">
            Referral Bonus Settings
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full cursor-pointer transition-colors"
          >
            <img className="w-7 h-7" src={images.close} alt="Close" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Registration Bonus */}
          <div>
            <label className="block text-[16px] font-medium text-black mb-2">
              Registration Bonus
            </label>
            <input
              type="text"
              value={registrationBonus}
              onChange={(e) => setRegistrationBonus(e.target.value)}
              placeholder="Type amount in Naira"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53E3E] focus:border-transparent text-[14px] placeholder-gray-400"
            />
          </div>

          {/* Percentage Bonus */}
          <div>
            <label className="block text-[16px] font-medium text-black mb-2">
              Percentage Bonus
            </label>
            <div className="relative">
              <input
                type="text"
                value={percentageBonus}
                onChange={(e) => setPercentageBonus(e.target.value)}
                placeholder="Percentage user earns on referrals orders"
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53E3E] focus:border-transparent text-[14px] placeholder-gray-400"
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <span className="text-[16px] font-medium text-gray-400">%</span>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            className="w-full py-4 mt-3 bg-[#E53E3E] text-white rounded-xl font-medium cursor-pointer transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
