import images from "../../../constants/images";
import { useState } from "react";

interface PromotionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PromotionsModal: React.FC<PromotionsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const [dropdownStates, setDropdownStates] = useState({
    approvalStatus: false,
  });
  const [selectedapprovalStatus, setSelectedapprovalStatus] = useState("");
  const approvalStatusOptions = ["Approved", "Pending", "Rejected"];

  const toggleDropdown = (dropdownName: keyof typeof dropdownStates) => {
    setDropdownStates((prev) => ({
      ...prev,
      [dropdownName]: !prev[dropdownName],
    }));
  };

  const handleapprovalStatusSelect = (status: string) => {
    setSelectedapprovalStatus(status);
    setDropdownStates((prev) => ({ ...prev, approvalStatus: false }));
  };

  return (
    <>
      <div className="fixed inset-0 z-100 bg-[#00000080] bg-opacity-50 flex justify-end">
        <div className="bg-white w-[500px] relative h-full overflow-y-auto">
          {/* Header */}
          <div className="border-b border-[#787878] px-3 py-3 sticky top-0 bg-white z-10">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Promotion Details</h2>
              <div className="flex items-center">
                <button
                  onClick={onClose}
                  className="p-2 rounded-md cursor-pointer"
                  aria-label="Close"
                >
                  <img className="w-7 h-7" src={images.close} alt="Close" />
                </button>
              </div>
            </div>
          </div>
          <div className="p-5">
            <div
              className="flex flex-col rounded-2xl"
              style={{ boxShadow: "0px 0px 4px 0px rgba(0, 0, 0, 0.25)" }}
            >
              <div>
                <img
                  className="rounded-t-2xl w-full"
                  src={images.laptop}
                  alt="Laptop"
                />
              </div>
              <div className="flex flex-row justify-between bg-[#F2F2F2] p-3">
                <div className="flex items-center gap-2">
                  <div>
                    <img
                      className="w-7 h-7"
                      src={images.sasha}
                      alt="Sasha Stores"
                    />
                  </div>
                  <div className="text-[#B91919]">Sasha Stores</div>
                </div>
                <div className="flex items-center">
                  <div>
                    <img className="w-4 h-4" src={images.start1} alt="Rating" />
                  </div>
                  <div className="text-[#00000080]">4.5</div>
                </div>
              </div>
              <div className="flex flex-col p-5 gap-5">
                <div className="text-xl font-medium">Dell Inspiron Laptop</div>
                <div className="flex flex-row gap-2">
                  <div className="text-[#E53E3E] font-bold text-xl">
                    N2,000,000
                  </div>
                  <div className="text-[#00000080] line-through text-xl">
                    N3,000,000
                  </div>
                </div>
                <div className="flex flex-row gap-2">
                  <div className="flex items-center bg-[#FFA500] text-white rounded-md">
                    <div className="relative w-15 h-10 bg-[#FF3300] overflow-hidden rounded-md flex items-center px-3">
                      {/* Right-side tilted shape */}
                      <div className="absolute top-0 right-0 w-1/3 h-full bg-[#FFA500] [clip-path:polygon(50%_0,100%_0,100%_100%,0_100%)]"></div>
                      {/* Cart Icon */}
                      <img className="w-5 h-5" src={images.cart1} alt="Cart" />
                    </div>
                    <span className="text-sm font-medium pr-3">
                      Free delivery
                    </span>
                  </div>
                  <div className="flex items-center bg-[#FFA500] text-white rounded-md">
                    <div className="relative w-15 h-10 bg-[#FF3300] overflow-hidden rounded-md flex items-center px-3">
                      {/* Right-side tilted shape */}
                      <div className="absolute top-0 right-0 w-1/3 h-full bg-[#FFA500] [clip-path:polygon(50%_0,100%_0,100%_100%,0_100%)]"></div>
                      {/* Cart Icon */}
                      <img className="w-5 h-5" src={images.cart1} alt="Cart" />
                    </div>
                    <span className="text-sm font-medium pr-3">
                      20% Off in bulk
                    </span>
                  </div>
                </div>
                <div className="flex flex-row items-center">
                  <div>
                    <img
                      className="w-6 h-6"
                      src={images.location}
                      alt="Location"
                    />
                  </div>
                  <div className="text-[#00000080] text-lg">Lagos, Nigeria</div>
                </div>
              </div>
            </div>
            <div className="mt-5 flex flex-col gap-1">
              <div className="flex flex-row justify-between p-4 bg-[#EDEDED] border border-[#CACACA] rounded-t-2xl rounded-b-lg">
                <div className="text-[#00000080] text-xl">Reach</div>
                <div className="text-xl font-semibold">2,000</div>
              </div>
              <div className="flex flex-row justify-between p-4 bg-[#EDEDED] border border-[#CACACA] rounded-t-lg rounded-b-lg">
                <div className="text-[#00000080] text-xl">Impressions</div>
                <div className="text-xl font-semibold">2,000</div>
              </div>
              <div className="flex flex-row justify-between p-4 bg-[#EDEDED] border border-[#CACACA] rounded-t-lg rounded-b-lg">
                <div className="text-[#00000080] text-xl">Cost/Click</div>
                <div className="text-xl font-semibold">N10</div>
              </div>
              <div className="flex flex-row justify-between p-4 bg-[#EDEDED] border border-[#CACACA] rounded-t-lg rounded-b-lg">
                <div className="text-[#00000080] text-xl">Amount Spent</div>
                <div className="text-xl font-semibold">N5,000</div>
              </div>
              <div className="flex flex-row justify-between p-4 bg-[#EDEDED] border border-[#CACACA] rounded-t-lg rounded-b-lg">
                <div className="text-[#00000080] text-xl">Date Created</div>
                <div className="text-xl font-semibold">07/22/25 - 08:22 AM</div>
              </div>
              <div className="flex flex-row justify-between p-4 bg-[#EDEDED] border border-[#CACACA] rounded-t-lg rounded-b-lg">
                <div className="text-[#00000080] text-xl">End Date</div>
                <div className="text-xl font-semibold">07/22/25 - 08:22 AM</div>
              </div>
              <div className="flex flex-row justify-between p-4 bg-[#EDEDED] border border-[#CACACA] rounded-t-lg rounded-b-lg">
                <div className="text-[#00000080] text-xl">Days Remaining</div>
                <div className="text-xl font-semibold">7 Days</div>
              </div>
              <div className="flex flex-row justify-between p-4 bg-[#EDEDED] border border-[#CACACA] rounded-b-2xl rounded-t-lg">
                <div className="text-[#00000080] text-xl">Status</div>
                <div className="text-xl font-semibold text-[#008000]">
                  Active
                </div>
              </div>
            </div>
            <div className="mt-5 flex flex-row gap-3">
              <div className="border border-[#B8B8B8] rounded-xl p-4">
                <img className="cursor-pointer" src={images.edit1} alt="Edit" />
              </div>
              <div className="border border-[#B8B8B8] rounded-xl p-4">
                <img
                  className="cursor-pointer w-6 h-6"
                  src={images.stop}
                  alt="Stop"
                />
              </div>
              <div className="border border-[#B8B8B8] rounded-xl p-4">
                <img
                  className="cursor-pointer"
                  src={images.delete1}
                  alt="Delete"
                />
              </div>
              <div>
                <button className="bg-[#E53E3E] text-white cursor-pointer px-6 py-4 rounded-xl">
                  Extend Promotion
                </button>
              </div>
            </div>
            <div className="mt-5">
              <label htmlFor="store" className="text-lg font-semibold">
                Approval Status
              </label>
              <div className="relative">
                <div
                  className="w-full border border-[#989898] p-5 rounded-2xl text-lg flex flex-row justify-between items-center mt-3 cursor-pointer"
                  onClick={() => toggleDropdown("approvalStatus")}
                >
                  <div
                    className={
                      selectedapprovalStatus ? "text-black" : "text-[#00000080]"
                    }
                  >
                    {selectedapprovalStatus || "Change Approval Status"}
                  </div>
                  <div
                    className={`transform transition-transform duration-200 ${
                      dropdownStates.approvalStatus ? "rotate-90" : ""
                    }`}
                  >
                    <img
                      src={images.rightarrow}
                      alt="arrow"
                      className="w-5 h-5"
                    />
                  </div>
                </div>

                {dropdownStates.approvalStatus && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-[#989898] rounded-2xl shadow-lg max-h-60 overflow-y-auto">
                    {approvalStatusOptions.map((status, index) => (
                      <div
                        key={index}
                        className="p-4 hover:bg-gray-50 cursor-pointer text-lg border-b border-gray-100 last:border-b-0"
                        onClick={() => handleapprovalStatusSelect(status)}
                      >
                        {status}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="mt-5 mb-5" ><button className="bg-[#E53E3E] text-white w-full py-3.5 cursor-pointer rounded-xl" >Save</button></div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PromotionsModal;
