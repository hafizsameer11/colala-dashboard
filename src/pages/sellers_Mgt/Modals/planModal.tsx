import images from "../../../constants/images";
import { useEffect, useState } from "react";
import Basic from "./basic";
import Standard from "./standard";
import Ultra from "./ultra";

interface PlansModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "Basic" | "Standard" | "Ultra";
}

const PlansModal: React.FC<PlansModalProps> = ({
  isOpen,
  onClose,
  initialTab = "Basic",
}) => {
  const [activeTab, setActiveTab] = useState<"Basic" | "Standard" | "Ultra">(
    initialTab
  );

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-100 bg-[#00000080] bg-opacity-50 flex justify-end">
        <div className="bg-white w-[500px] relative h-full overflow-y-auto">
          {" "}
          {/* Header */}
          <div className="border-b border-[#787878] px-3 py-3 sticky top-0 bg-white z-10">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Subscription Plans</h2>
              <div className="flex items-center">
                <button
                  onClick={onClose}
                  className="p-2 rounded-md  cursor-pointer"
                  aria-label="Close"
                >
                  <img className="w-7 h-7" src={images.close} alt="Close" />
                </button>
              </div>
            </div>
          </div>
          <div className="pl-5 pr-5">
            {/* Tabs */}
            <div className="flex p-1 gap-4 border border-[#989898] rounded-lg mt-5 w-81">
              <button
                onClick={() => setActiveTab("Basic")}
                className={`px-6 py-2 rounded-lg font-medium cursor-pointer ${
                  activeTab === "Basic"
                    ? "bg-[#E53E3E] text-white "
                    : "bg-transparent text-black"
                }`}
              >
                Basic
              </button>
              <button
                onClick={() => setActiveTab("Standard")}
                className={`px-6 py-2 rounded-lg font-medium cursor-pointer ${
                  activeTab === "Standard"
                    ? "bg-red-500 text-white"
                    : "bg-transparent text-black"
                }`}
              >
                Standard
              </button>
              <button
                onClick={() => setActiveTab("Ultra")}
                className={`px-6 py-2 rounded-lg font-medium cursor-pointer ${
                  activeTab === "Ultra"
                    ? "bg-red-500 text-white"
                    : "bg-transparent text-black"
                }`}
              >
                Ultra
              </button>
            </div>

            {/* Tab Content */}
            <div className="">
              {activeTab === "Basic" && <Basic />}
              {activeTab === "Standard" && <Standard />}
              {activeTab === "Ultra" && <Ultra />}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PlansModal;
