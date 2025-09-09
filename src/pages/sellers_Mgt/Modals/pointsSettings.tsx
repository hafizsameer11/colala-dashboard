import images from "../../../constants/images";
import { useState } from "react";

interface PointsSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const PointsSettings: React.FC<PointsSettingsProps> = ({ isOpen, onClose }) => {
  const [completedOrderPoints, setCompletedOrderPoints] = useState(true);
  const [referralPoints, setReferralPoints] = useState(true);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-100 bg-[#00000080] bg-opacity-50 flex justify-end">
        <div className="bg-white w-[500px] relative h-150 overflow-y-auto">
          {/* Header */}
          <div className="border-b border-[#787878] px-3 py-3 sticky top-0 bg-white z-10">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Points Settings</h2>
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
          <div className="p-3">
            <form action="#">
              <div className="flex flex-col gap-3">
                <label htmlFor="pointsPerOrder" className="text-xl font-medium">
                  Number of points/completed order
                </label>
                <input
                  type="text"
                  name="pointsPerOrder"
                  id="pointsPerOrder"
                  placeholder="Number of points/completed order"
                  className="w-full rounded-2xl border border-[#989898] p-5"
                />
              </div>
              <div className="flex flex-col gap-3 mt-5">
                <label
                  htmlFor="pointsPerReferral"
                  className="text-xl font-medium"
                >
                  Number of points/referral
                </label>
                <input
                  type="text"
                  name="pointsPerReferral"
                  id="pointsPerReferral"
                  placeholder="Number of points/referral"
                  className="w-full rounded-2xl border border-[#989898] p-5"
                />
              </div>

              {/* Completed order points toggle */}
              <div className="mt-5">
                <div
                  className="flex items-center justify-between p-5 border border-[#989898] rounded-2xl bg-[#FFF] cursor-pointer"
                  onClick={() => setCompletedOrderPoints(!completedOrderPoints)}
                >
                  <span className="text-lg font-medium text-black">
                    Completed order points
                  </span>
                  <div className="relative">
                    <div
                      className={`w-14 h-8 rounded-full transition-colors duration-300 ${
                        completedOrderPoints ? "bg-[#E53E3E]" : "bg-gray-300"
                      }`}
                    >
                      <div
                        className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ${
                          completedOrderPoints
                            ? "translate-x-7"
                            : "translate-x-1"
                        }`}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Referral points toggle */}
              <div className="mt-5">
                <div
                  className="flex items-center justify-between p-5 border border-[#989898] rounded-2xl bg-[#FFF] cursor-pointer"
                  onClick={() => setReferralPoints(!referralPoints)}
                >
                  <span className="text-lg font-medium text-black">
                    Referral points
                  </span>
                  <div className="relative">
                    <div
                      className={`w-14 h-8 rounded-full transition-colors duration-300 ${
                        referralPoints ? "bg-[#E53E3E]" : "bg-gray-300"
                      }`}
                    >
                      <div
                        className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ${
                          referralPoints ? "translate-x-7" : "translate-x-1"
                        }`}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-5">
                <button className="bg-[#E53E3E] text-white cursor-pointer py-4 w-full rounded-2xl">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default PointsSettings;
