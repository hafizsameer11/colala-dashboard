import React from "react";
import images from "../../../../constants/images";

interface ViewAllModalProps {
  isOpen: boolean;
  onClose: () => void;
  referrerName?: string;
}

const ViewAllModal: React.FC<ViewAllModalProps> = ({
  isOpen,
  onClose,
  referrerName = "Sasha Stores",
}) => {
  // Sample data for users referred by the selected referrer
  const referredUsers = [
    { id: 1, name: "Ade Stores", date: "20 Jan 2025 08:45" },
    { id: 2, name: "Ade Stores", date: "20 Jan 2025 08:45" },
    { id: 3, name: "Ade Stores", date: "20 Jan 2025 08:45" },
    { id: 4, name: "Ade Stores", date: "20 Jan 2025 08:45" },
    { id: 5, name: "Ade Stores", date: "20 Jan 2025 08:45" },
    { id: 6, name: "Ade Stores", date: "20 Jan 2025 08:45" },
  ];

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 backdrop-brightness-50 bg-opacity-50 flex items-start justify-end -mt-3 z-[9999]" 
      onClick={handleOverlayClick}
      style={{ zIndex: 9999 }}
    >
      <div 
        className="bg-white  w-[560px] h-[530px] overflow-hidden shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 mt-2 border-b  border-[#DDDDDD]">
          <h2 className="text-[16px] font-semibold text-black">
            User Referred by {referrerName} (340)
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full transition-colors"
          >
           <img className="w-7 h-7 cursor-pointer" src={images.close} alt="Close" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 max-h-[500px] overflow-y-auto">
          <div className="space-y-1">
            {referredUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between py-3 rounded-2xl border border-[#DDDDDD]"
              >
                <div className="flex items-center space-x-3 ml-4">
                  <div className="w-10 h-10  rounded-full flex items-center justify-center">
                    <img
                      src={images.sasha}
                      alt="User Avatar"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  </div>
                  <span className="text-[14px] font-medium text-black">
                    {user.name}
                  </span>
                </div>
                <span className="text-[10px] mr-4 text-gray-500">{user.date}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewAllModal;
