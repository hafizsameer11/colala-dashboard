import React, { useState, useRef, useEffect } from "react";
import images from "../../../constants/images";
import BulkActionDropdown from "../../../components/BulkActionDropdown";
// import AddUserModal from "../../../components/addUserModel";

interface ActivityProps {
  userData: {
    id?: string;
    userName: string;
    email: string;
    phoneNumber: string;
    walletBalance: string;
  };
}

const Activity: React.FC<ActivityProps> = ({ userData }) => {
  // const [showModal, setShowModal] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleBulkActionSelect = (action: string) => {
    // Handle the bulk action selection from the parent component
    console.log("Bulk action selected in Activity:", action);
    // Add your custom logic here
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleDropdownAction = (action: string) => {
    console.log(`${action} action triggered for user:`, userData.userName);
    setIsDropdownOpen(false);
    // Add your action logic here
  };

  const DotsDropdown = () => (
    <div className="relative" ref={dropdownRef}>
      <div
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="cursor-pointer"
      >
        <img className="w-10 h-10 cursor-pointer" src={images.dot} alt="" />
      </div>

      {isDropdownOpen && (
        <div
          className="absolute right-0 top-12 bg-white rounded-lg border border-gray-200 py-2 w-48 z-50"
          style={{ boxShadow: "5px 5px 15px 0px rgba(0, 0, 0, 0.25)" }}
        >
          <div
            onClick={() => handleDropdownAction("Block User")}
            className="flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer"
          >
            <svg
              className="w-5 h-5 mr-3 text-gray-600"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM4 12c0-4.42 3.58-8 8-8 1.85 0 3.55.63 4.9 1.69L5.69 16.9C4.63 15.55 4 13.85 4 12zm8 8c-1.85 0-3.55-.63-4.9-1.69L18.31 7.1C19.37 8.45 20 10.15 20 12c0 4.42-3.58 8-8 8z"
                fill="currentColor"
              />
            </svg>
            <span className="text-gray-800 font-medium">Block User</span>
          </div>

          <div
            onClick={() => handleDropdownAction("Delete User")}
            className="flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer"
          >
            <svg
              className="w-5 h-5 mr-3 text-gray-600"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"
                fill="currentColor"
              />
            </svg>
            <span className="text-gray-800 font-medium">Delete User</span>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      <div className="">
        <div className="flex flex-row">
          <div className="flex flex-col ">
            <div className="bg-[#FF6B6B] w-[350px] text-white flex flex-col rounded-tl-2xl p-5 gap-6">
              <span className="text-xl font-normal">
                Shopping Wallet Balance
              </span>
              <span className="text-4xl font-semibold">
                {userData.walletBalance}
              </span>
              <div className="flex flex-row gap-5 ">
                <div>
                  <button className="bg-white rounded-2xl px-6 py-2 text-black">
                    Topup
                  </button>
                </div>
                <div>
                  <button className="bg-white rounded-2xl px-6 py-2 text-black">
                    Withdraw
                  </button>
                </div>
              </div>
            </div>
            <div className="bg-[#731313] text-white rounded-bl-2xl p-5 flex flex-col gap-5 w-[350px]">
              <span className="text-xl font-normal">Escrow Wallet Balance</span>
              <span className="text-4xl font-semibold">N25,000</span>
            </div>
          </div>
          <div
            className="bg-[#E53E3E] flex flex-row w-full rounded-r-2xl gap-5 "
            style={{ boxShadow: "0px 0px 2px 0px rgba(0, 0, 0, 0.25)" }}
          >
            <div className=" flex flex-col">
              <div>
                <img className="w-20 h-20 ml-5 mt-10" src={images.admin} alt="" />
              </div>
              <div className="flex flex-row rounded-full text-[#E53E3E] items-center p-2 gap-3 mt-2 ml-2.5 bg-white ">
                <div>Verified</div>
                <div>
                  <img src={images.verified} alt="" />
                </div>
              </div>
            </div>
            <div className=" flex flex-row p-5 gap-14">
              <div className="flex flex-col gap-5">
                <span className="text-[#FFFFFF80] text-[16px]">Name</span>
                <span className="text-white">{userData.userName}</span>
                <span className="text-[#FFFFFF80] text-[16px]">Email</span>
                <span className="text-white">{userData.email}</span>
                <span className="text-[#FFFFFF80] text-[16px]">
                  Phone Number
                </span>
                <span className="text-white">{userData.phoneNumber}</span>
              </div>
              <div className="flex flex-col gap-5">
                <span className="text-[#FFFFFF80] text-[16px]">Location</span>
                <span className="text-white">Lagos, Nigeria</span>
                <span className="text-[#FFFFFF80] text-[16px]">Last Login</span>
                <span className="text-white">23/02/25 - 11:22 AM</span>
                <span className="text-[#FFFFFF80] text-[16px]">
                  Account Creation
                </span>
                <span className="text-white">10/02/25 - 07:21 AM</span>
              </div>
              <div className="flex flex-col gap-5">
                <span className="text-[#FFFFFF80] text-[16px]">Username</span>
                <span className="text-white">Maleekfrenzy</span>
                {/* <span className="text-[#FFFFFF80] text-[16px]">
                  Loyalty Points
                </span>
                <div className="text-white flex flex-row gap-2">
                  <span className="font-bold">200</span>
                  <span
                    className="cursor-pointer underline"
                    onClick={() => setShowModal(true)}
                  >
                    View Details
                  </span>
                </div> */}
                <div className="flex flex-row mt-10 gap-2">
                  <div>
                    <img
                      className="w-10 h-10 cursor-pointer"
                      src={images.edit}
                      alt=""
                    />
                  </div>
                  <div>
                    <img
                      className="w-10 h-10 cursor-pointer"
                      src={images.bell}
                      alt=""
                    />
                  </div>
                  <div>
                    <DotsDropdown />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-row mt-5 gap-5">
          <div className="flex flex-row items-center gap-5 border border-[#989898] rounded-lg px-4 py-2 bg-white cursor-pointer">
            <div>Today</div>
            <div>
              <img className="w-3 h-3 mt-1" src={images.dropdown} alt="" />
            </div>
          </div>
          <div>
            <BulkActionDropdown onActionSelect={handleBulkActionSelect} />
          </div>
        </div>

        <div className="mt-5">
          <div className="bg-white rounded-2xl border border-[#989898]">
            <div className="p-5">
              <h3 className="text-lg font-semibold">User Activity</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                      />
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Activity
                    </th>
                    <th className="text-center py-3 px-4 font-medium text-gray-600">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr className="hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                      />
                    </td>
                    <td className="py-3 px-4 text-gray-800">
                      User Account created
                    </td>
                    <td className="py-3 px-4 text-center text-gray-600">
                      22/10/25 - 07:22 AM
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                      />
                    </td>
                    <td className="py-3 px-4 text-gray-800">User logged in</td>
                    <td className="py-3 px-4 text-center text-gray-600">
                      22/10/25 - 07:22 AM
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                      />
                    </td>
                    <td className="py-3 px-4 text-gray-800">
                      User ordered a product
                    </td>
                    <td className="py-3 px-4 text-center text-gray-600">
                      22/10/25 - 07:22 AM
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                      />
                    </td>
                    <td className="py-3 px-4 text-gray-800">
                      User funded wallet
                    </td>
                    <td className="py-3 px-4 text-center text-gray-600">
                      22/10/25 - 07:22 AM
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {/* <AddUserModal isOpen={showModal} onClose={() => setShowModal(false)} /> */}
    </>
  );
};

export default Activity;
