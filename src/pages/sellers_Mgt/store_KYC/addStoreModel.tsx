import images from "../../../constants/images";
import React, { useState, useEffect } from "react";
import Level1 from "./level1";
import Level2 from "./level2";
import Level3 from "./level3";

interface AddStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToSavedAddress?: () => void;
  initialTab?: "Level 1" | "Level 2" | "Level 3";
}

const AddStoreModal: React.FC<AddStoreModalProps> = ({
  isOpen,
  onClose,
  // onProceedToSavedAddress,
  initialTab = "Level 1",
}) => {
  const [activeTab, setActiveTab] = useState<"Level 1" | "Level 2" | "Level 3">(
    initialTab
  );

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 bg-[#00000080] bg-opacity-50 flex justify-end">
      <div className="bg-white w-[500px] relative h-full overflow-y-auto">
        {/* Header */}
        <div className="border-b border-[#787878] p-3 sticky top-0 bg-white z-10">
          <button
            onClick={onClose}
            className="absolute flex items-center right-3 cursor-pointer"
          >
            <img src={images.close} alt="Close" />
          </button>
          <h2 className="text-xl font-semibold">Add New User</h2>
        </div>

        <div className="p-5 pb-8">
          {/* Tabs */}
          <div className="flex p-1 gap-4 border border-[#989898] rounded-lg mt-5 w-83.5">
            <button
              onClick={() => setActiveTab("Level 1")}
              className={`px-6 py-2 rounded-lg font-medium cursor-pointer ${
                activeTab === "Level 1"
                  ? "bg-[#E53E3E] text-white "
                  : "bg-transparent text-black"
              }`}
            >
              Level 1
            </button>
            <button
              onClick={() => setActiveTab("Level 2")}
              className={`px-6 py-2 rounded-lg font-medium cursor-pointer ${
                activeTab === "Level 2"
                  ? "bg-red-500 text-white"
                  : "bg-transparent text-black"
              }`}
            >
              Level 2
            </button>
            <button
              onClick={() => setActiveTab("Level 3")}
              className={`px-6 py-2 rounded-lg font-medium cursor-pointer ${
                activeTab === "Level 3"
                  ? "bg-red-500 text-white"
                  : "bg-transparent text-black"
              }`}
            >
              Level 3
            </button>
          </div>

          {/* Tab Content */}
          <div className="">
            {activeTab === "Level 1" && (
              <Level1
                onSaveAndClose={onClose}
                onProceed={() => setActiveTab("Level 2")}
              />
            )}
            {activeTab === "Level 2" && (
              <Level2
                onSaveAndClose={onClose}
                onProceed={() => setActiveTab("Level 3")}
              />
            )}
            {activeTab === "Level 3" && (
              <Level3
                onSaveAndClose={onClose}
                onProceed={() => {
                  onClose();
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddStoreModal;
