import images from "../../../constants/images";
import { useState } from "react";
import NewCoupon from "../Modals/newCoupon";
import PointsSettings from "../Modals/pointsSettings";
import NewUser from "../Modals/newUser";

const Others = () => {
  const [activeTab, setActiveTab] = useState("Coupons");
  const tabs = ["Coupons", "Points"];
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [showPointsModal, setShowPointsModal] = useState(false);
  const [showNewUserModal, setShowNewUserModal] = useState(false);

  const TabButtons = () => (
    <div className="flex items-center space-x-0.5 border border-[#989898] rounded-lg p-2 w-fit bg-white">
      {tabs.map((tab) => {
        const isActive = activeTab === tab;
        return (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-2 text-sm rounded-lg font-normal transition-all duration-200 cursor-pointer ${
              isActive ? "px-8 bg-[#E53E3E] text-white" : "px-8 text-black"
            }`}
          >
            {tab}
          </button>
        );
      })}
    </div>
  );

  return (
    <>
      <div>
        <div className="flex flex-row justify-between items-center">
          {/* Card 1 */}
          <div
            className="flex flex-row rounded-2xl  w-95"
            style={{ boxShadow: "0px 0px 2px 0px rgba(0, 0, 0, 0.25)" }}
          >
            <div className="bg-[#E53E3E] rounded-l-2xl p-7 flex justify-center items-center ">
              <img className="w-9 h-9" src={images.transaction1} alt="" />
            </div>
            <div className="flex flex-col bg-[#FFF1F1] rounded-r-2xl p-3 pr-11 gap-1">
              <span className="font-semibold text-[15px]">Total Coupons</span>
              <span className="font-semibold text-2xl">10</span>
              <span className="text-[#00000080] text-[13px] ">
                <span className="text-[#1DB61D]">+5%</span> increase from last
                month
              </span>
            </div>
          </div>

          {/* Card 2 */}
          <div
            className="flex flex-row rounded-2xl w-95"
            style={{ boxShadow: "0px 0px 2px 0px rgba(0, 0, 0, 0.25)" }}
          >
            <div className="bg-[#E53E3E] rounded-l-2xl p-7 flex justify-center items-center ">
              <img className="w-9 h-9" src={images.transaction1} alt="" />
            </div>
            <div className="flex flex-col bg-[#FFF1F1] rounded-r-2xl p-3 pr-11 gap-1">
              <span className="font-semibold text-[15px]">
                Points earned by users
              </span>
              <span className="font-semibold text-2xl">5,000</span>
              <span className="text-[#00000080] text-[13px] ">
                <span className="text-[#1DB61D]">+5%</span> increase from last
                month
              </span>
            </div>
          </div>

          {/* Card 3 */}
          <div
            className="flex flex-row rounded-2xl w-95"
            style={{ boxShadow: "0px 0px 2px 0px rgba(0, 0, 0, 0.25)" }}
          >
            <div className="bg-[#E53E3E] rounded-l-2xl p-7 flex justify-center items-center ">
              <img className="w-9 h-9" src={images.transaction1} alt="" />
            </div>
            <div className="flex flex-col bg-[#FFF1F1] rounded-r-2xl p-3  gap-1">
              <span className="font-semibold text-[15px]">
                Ratings & Reviews
              </span>
              <div className="flex flex-row items-center gap-1">
                <div className="font-semibold text-2xl">4.5</div>
                <div>
                  <img className="w-5 h-5" src={images.start1} alt="" />
                </div>
              </div>
              <div className="text-[#00000080] text-[13px] flex flex-row items-center gap-2.5">
                <div>
                  <span className="text-[#1DB61D]">+5%</span> increase from last
                  month
                </div>
                <div>
                  <button className="bg-[#E53E3E] text-white px-4 py-2 rounded-xl cursor-pointer">
                    View All
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-row justify-between mt-5 gap-5">
          <div
            className="flex flex-col border border-[#989898] rounded-2xl w-full"
            style={{ boxShadow: "0px 0px 2px 0px rgba(0, 0, 0, 0.25)" }}
          >
            <div className="bg-[#F2F2F2] text-xl font-medium p-5 rounded-t-2xl">
              Coupon & Points
            </div>
            <div className="p-5 flex flex-col bg-white rounded-b-2xl gap-5">
              <div className="flex flex-row justify-between">
                <div>
                  <TabButtons />
                </div>
                <div>
                  {activeTab === "Coupons" ? (
                    <button
                      className="bg-[#E53E3E] text-white cursor-pointer px-6 py-3.5 rounded-2xl"
                      onClick={() => setShowCouponModal(true)}
                    >
                      Add New Code
                    </button>
                  ) : (
                    <button
                      className="bg-[#E53E3E] text-white cursor-pointer px-6 py-3.5 rounded-2xl"
                      onClick={() => setShowPointsModal(true)}
                    >
                      Points Settings
                    </button>
                  )}
                </div>
              </div>

              {activeTab === "Coupons" ? (
                // Coupons Section
                <>
                  <div
                    className="rounded-2xl flex flex-col p-3"
                    style={{ boxShadow: "0px 0px 4px 0px rgba(0, 0, 0, 0.25)" }}
                  >
                    <div className="border border-[#00000080] rounded-lg p-5 flex items-center justify-center text-xl font-semibold">
                      NEW123
                    </div>
                    <div className="flex flex-row justify-between mt-3">
                      <div className="text-[#00000080] text-md ">
                        Date Created
                      </div>
                      <div className="font-semibold">07-16-25/05:33AM</div>
                    </div>
                    <div className="flex flex-row justify-between mt-3">
                      <div className="text-[#00000080] text-md ">
                        No of times used
                      </div>
                      <div className="font-semibold">25</div>
                    </div>
                    <div className="flex flex-row justify-between mt-3">
                      <div className="text-[#00000080] text-md ">
                        Maximum Usage
                      </div>
                      <div className="font-semibold">50</div>
                    </div>
                    <div className="flex flex-row gap-4 mt-3">
                      <div className="border border-[#B8B8B8] rounded-xl p-3">
                        <img src={images.edit1} alt="" />
                      </div>
                      <div className="border border-[#B8B8B8] rounded-xl p-3">
                        <img src={images.delete1} alt="" />
                      </div>
                    </div>
                  </div>
                  <div
                    className="rounded-2xl flex flex-col p-3"
                    style={{ boxShadow: "0px 0px 4px 0px rgba(0, 0, 0, 0.25)" }}
                  >
                    <div className="border border-[#00000080] rounded-lg p-5 flex items-center justify-center  text-xl font-semibold">
                      NEW123
                    </div>
                    <div className="flex flex-row justify-between mt-3">
                      <div className="text-[#00000080] text-md ">
                        Date Created
                      </div>
                      <div className="font-semibold">07-16-25/05:33AM</div>
                    </div>
                    <div className="flex flex-row justify-between mt-3">
                      <div className="text-[#00000080] text-md ">
                        No of times used
                      </div>
                      <div className="font-semibold">25</div>
                    </div>
                    <div className="flex flex-row justify-between mt-3">
                      <div className="text-[#00000080] text-md ">
                        Maximum Usage
                      </div>
                      <div className="font-semibold">50</div>
                    </div>
                    <div className="flex flex-row gap-4 mt-3">
                      <div className="border border-[#B8B8B8] rounded-xl p-3">
                        <img src={images.edit1} alt="" />
                      </div>
                      <div className="border border-[#B8B8B8] rounded-xl p-3">
                        <img src={images.delete1} alt="" />
                      </div>
                    </div>
                  </div>
                  <div
                    className="rounded-2xl flex flex-col p-3"
                    style={{ boxShadow: "0px 0px 4px 0px rgba(0, 0, 0, 0.25)" }}
                  >
                    <div className="border border-[#00000080] rounded-lg p-5 flex items-center justify-center  text-xl font-semibold">
                      NEW123
                    </div>
                    <div className="flex flex-row justify-between mt-3">
                      <div className="text-[#00000080] text-md ">
                        Date Created
                      </div>
                      <div className="font-semibold">07-16-25/05:33AM</div>
                    </div>
                    <div className="flex flex-row justify-between mt-3">
                      <div className="text-[#00000080] text-md ">
                        No of times used
                      </div>
                      <div className="font-semibold">25</div>
                    </div>
                    <div className="flex flex-row justify-between mt-3">
                      <div className="text-[#00000080] text-md ">
                        Maximum Usage
                      </div>
                      <div className="font-semibold">50</div>
                    </div>
                    <div className="flex flex-row gap-4 mt-3">
                      <div className="border border-[#B8B8B8] rounded-xl p-3">
                        <img src={images.edit1} alt="" />
                      </div>
                      <div className="border border-[#B8B8B8] rounded-xl p-3">
                        <img src={images.delete1} alt="" />
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                // Points Section
                <>
                  <div
                    className="flex flex-col p-4 gap-2 rounded-2xl"
                    style={{
                      background:
                        "linear-gradient(92.04deg, #F90909 1.72%, #920C5F 98.14%)",
                    }}
                  >
                    <div className="text-white text-lg">
                      Total Points Balance
                    </div>
                    <div className="text-white font-bold text-2xl">5,000</div>
                  </div>

                  <div className="text-xl font-medium">Customers Points</div>

                  <div
                    className="flex flex-row justify-between p-2 rounded-2xl"
                    style={{ boxShadow: "0px 0px 4px 0px rgba(0, 0, 0, 0.25)" }}
                  >
                    <div className="flex flex-row gap-2 items-center">
                      <div>
                        <img className="w-12 h-12" src={images.sasha} alt="" />
                      </div>
                      <div className="flex items-center font-medium">
                        Adewale Faizah
                      </div>
                    </div>
                    <div className="flex items-center font-bold text-xl text-[#E53E3E]">
                      200
                    </div>
                  </div>
                  <div
                    className="flex flex-row justify-between p-2 rounded-2xl"
                    style={{ boxShadow: "0px 0px 4px 0px rgba(0, 0, 0, 0.25)" }}
                  >
                    <div className="flex flex-row gap-2 items-center">
                      <div>
                        <img className="w-12 h-12" src={images.sasha} alt="" />
                      </div>
                      <div className="flex items-center font-medium">
                        Adewale Faizah
                      </div>
                    </div>
                    <div className="flex items-center font-bold text-xl text-[#E53E3E]">
                      200
                    </div>
                  </div>
                  <div
                    className="flex flex-row justify-between p-2 rounded-2xl"
                    style={{ boxShadow: "0px 0px 4px 0px rgba(0, 0, 0, 0.25)" }}
                  >
                    <div className="flex flex-row gap-2 items-center">
                      <div>
                        <img className="w-12 h-12" src={images.sasha} alt="" />
                      </div>
                      <div className="flex items-center font-medium">
                        Liam Chen
                      </div>
                    </div>
                    <div className="flex items-center font-bold text-xl text-[#E53E3E]">
                      150
                    </div>
                  </div>
                  <div
                    className="flex flex-row justify-between p-2 rounded-2xl"
                    style={{ boxShadow: "0px 0px 4px 0px rgba(0, 0, 0, 0.25)" }}
                  >
                    <div className="flex flex-row gap-2 items-center">
                      <div>
                        <img className="w-12 h-12" src={images.sasha} alt="" />
                      </div>
                      <div className="flex items-center font-medium">
                        Sophia Martinez
                      </div>
                    </div>
                    <div className="flex items-center font-bold text-xl text-[#E53E3E]">
                      220
                    </div>
                  </div>
                  <div
                    className="flex flex-row justify-between p-2 rounded-2xl"
                    style={{ boxShadow: "0px 0px 4px 0px rgba(0, 0, 0, 0.25)" }}
                  >
                    <div className="flex flex-row gap-2 items-center">
                      <div>
                        <img className="w-12 h-12" src={images.sasha} alt="" />
                      </div>
                      <div className="flex items-center font-medium">
                        Omar Patel
                      </div>
                    </div>
                    <div className="flex items-center font-bold text-xl text-[#E53E3E]">
                      180
                    </div>
                  </div>
                  <div
                    className="flex flex-row justify-between p-2 rounded-2xl"
                    style={{ boxShadow: "0px 0px 4px 0px rgba(0, 0, 0, 0.25)" }}
                  >
                    <div className="flex flex-row gap-2 items-center">
                      <div>
                        <img className="w-12 h-12" src={images.sasha} alt="" />
                      </div>
                      <div className="flex items-center font-medium">
                        Isabella Johnson
                      </div>
                    </div>
                    <div className="flex items-center font-bold text-xl text-[#E53E3E]">
                      170
                    </div>
                  </div>
                  <div
                    className="flex flex-row justify-between p-2 rounded-2xl"
                    style={{ boxShadow: "0px 0px 4px 0px rgba(0, 0, 0, 0.25)" }}
                  >
                    <div className="flex flex-row gap-2 items-center">
                      <div>
                        <img className="w-12 h-12" src={images.sasha} alt="" />
                      </div>
                      <div className="flex items-center font-medium">
                        Mia Robinson
                      </div>
                    </div>
                    <div className="flex items-center font-bold text-xl text-[#E53E3E]">
                      210
                    </div>
                  </div>
                  <div
                    className="flex flex-row justify-between p-2 rounded-2xl"
                    style={{ boxShadow: "0px 0px 4px 0px rgba(0, 0, 0, 0.25)" }}
                  >
                    <div className="flex flex-row gap-2 items-center">
                      <div>
                        <img className="w-12 h-12" src={images.sasha} alt="" />
                      </div>
                      <div className="flex items-center font-medium">
                        Noah Thompson
                      </div>
                    </div>
                    <div className="flex items-center font-bold text-xl text-[#E53E3E]">
                      190
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div
            className="flex flex-col border border-[#989898] rounded-2xl w-full h-fit"
            style={{ boxShadow: "0px 0px 2px 0px rgba(0, 0, 0, 0.25)" }}
          >
            <div className="bg-[#F2F2F2]  p-4 rounded-t-2xl flex flex-row justify-between items-center">
              <div className="text-xl font-medium">Users With Access</div>
              <div>
                <button
                  className="bg-[#E53E3E] text-white rounded-xl px-6 py-2 cursor-pointer "
                  onClick={() => setShowNewUserModal(true)}
                >
                  Add New User
                </button>
              </div>
            </div>
            <div className="bg-white p-5 flex flex-col gap-5 rounded-b-2xl">
              <div className="text-[#00000080] w-110 tex-md">
                Grant users access to manage parts of your account input the
                user's email and you can add a unique password for each use
              </div>
              <div className="text-xl font-medium">Users</div>
              <div
                className="flex flex-row justify-between p-2 rounded-2xl"
                style={{ boxShadow: "0px 0px 4px 0px rgba(0, 0, 0, 0.25)" }}
              >
                <div className="flex flex-row gap-2 items-center">
                  <div>
                    <img className="w-12 h-12" src={images.sasha} alt="" />
                  </div>
                  <div className="flex flex-col justify-center">
                    <div className="font-medium">abcdef@gmail.com</div>
                    <div className="font-bold text-[#E53E3E]">Admin</div>
                  </div>
                </div>
                <div className="flex flex-row gap-4">
                  <div className="border border-[#B8B8B8] rounded-xl p-3">
                    <img src={images.edit1} alt="" />
                  </div>
                  <div className="border border-[#B8B8B8] rounded-xl p-3">
                    <img src={images.delete1} alt="" />
                  </div>
                </div>
              </div>
              <div
                className="flex flex-row justify-between p-2 rounded-2xl"
                style={{ boxShadow: "0px 0px 4px 0px rgba(0, 0, 0, 0.25)" }}
              >
                <div className="flex flex-row gap-2 items-center">
                  <div>
                    <img className="w-12 h-12" src={images.sasha} alt="" />
                  </div>
                  <div className="flex flex-col justify-center">
                    <div className="font-medium">abcdef@gmail.com</div>
                    <div className="font-bold text-[#E53E3E]">Admin</div>
                  </div>
                </div>
                <div className="flex flex-row gap-4">
                  <div className="border border-[#B8B8B8] rounded-xl p-3">
                    <img src={images.edit1} alt="" />
                  </div>
                  <div className="border border-[#B8B8B8] rounded-xl p-3">
                    <img src={images.delete1} alt="" />
                  </div>
                </div>
              </div>
              <div
                className="flex flex-row justify-between p-2 rounded-2xl"
                style={{ boxShadow: "0px 0px 4px 0px rgba(0, 0, 0, 0.25)" }}
              >
                <div className="flex flex-row gap-2 items-center">
                  <div>
                    <img className="w-12 h-12" src={images.sasha} alt="" />
                  </div>
                  <div className="flex flex-col justify-center">
                    <div className="font-medium">abcdef@gmail.com</div>
                    <div className="font-bold text-[#E53E3E]">Admin</div>
                  </div>
                </div>
                <div className="flex flex-row gap-4">
                  <div className="border border-[#B8B8B8] rounded-xl p-3">
                    <img src={images.edit1} alt="" />
                  </div>
                  <div className="border border-[#B8B8B8] rounded-xl p-3">
                    <img src={images.delete1} alt="" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <NewCoupon
          isOpen={showCouponModal}
          onClose={() => setShowCouponModal(false)}
        />

        <PointsSettings
          isOpen={showPointsModal}
          onClose={() => setShowPointsModal(false)}
        />

        <NewUser
          isOpen={showNewUserModal}
          onClose={() => setShowNewUserModal(false)}
        />
      </div>
    </>
  );
};

export default Others;
