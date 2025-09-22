import React from "react";

interface WarningModalProps {
  show: boolean;
  onClose: () => void;
}

const WarningModal: React.FC<WarningModalProps> = ({ show, onClose }) => {
  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-[100] backdrop-brightness-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="warning-title"
      aria-describedby="warning-desc"
    >
      <div className="bg-white rounded-2xl p-6 max-w-sm mx-4 text-center shadow-xl">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-[#FFE5E5] rounded-full flex items-center justify-center">
            <img src="/assets/layout/Warning.svg" alt="" />
          </div>
        </div>

        <p
          id="warning-desc"
          className="text-gray-800 mb-6 text-sm leading-relaxed"
        >
          You cannot leave or close this chat until you select who won
        </p>

        <button
          onClick={onClose}
          className="w-full py-2 px-4 border border-gray-200 text-gray-700 rounded-xl transition-colors cursor-pointer"
        >
          Go Back
        </button>
      </div>
    </div>
  );
};

export default WarningModal;
