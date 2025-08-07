import PageHeader from "../../../components/PageHeader";
import images from "../../../constants/images";
import BulkActionDropdown from "../../../components/BulkActionDropdown";
import UsersTable from "./usersTable";
import AddUserModal from "../../../components/addUserModel";
import { useState } from "react";

const customer_mgt = () => {
  const [showModal, setShowModal] = useState(false);

  const handleUserSelection = (selectedIds: string[]) => {
    // Handle selected user IDs
    console.log("Selected user IDs:", selectedIds);
    // You can use this to enable/disable bulk actions or perform other operations
  };

  const handlePeriodChange = (period: string) => {
    // Handle period change from PageHeader
    console.log("Period changed to:", period);
    // Add your logic here to filter data based on selected period
  };

  const handleBulkActionSelect = (action: string) => {
    // Handle the bulk action selection from the parent component
    console.log("Bulk action selected in Dashboard:", action);
    // Add your custom logic here
  };

  return (
    <>
      <PageHeader title="User Management" onPeriodChange={handlePeriodChange} />

      <div className="bg-[#F5F5F5]">
        <div className="p-5">
          <div className="flex flex-row justify-between items-center">
            {/* Card 1 */}
            <div
              className="flex flex-row rounded-2xl  w-90"
              style={{ boxShadow: "0px 0px 2px 0px rgba(0, 0, 0, 0.25)" }}
            >
              <div className="bg-[#E53E3E] rounded-l-2xl p-7 flex justify-center items-center ">
                <img className="w-9 h-9" src={images.Users} alt="" />
              </div>
              <div className="flex flex-col bg-[#FFF1F1] rounded-r-2xl p-3 pr-11 gap-1">
                <span className="font-semibold text-[15px]">Total Users</span>
                <span className="font-semibold text-2xl">1,500</span>
                <span className="text-[#00000080] text-[13px] ">
                  <span className="text-[#1DB61D]">+5%</span> increase from last
                  month
                </span>
              </div>
            </div>

            {/* Card 2 */}

            <div
              className="flex flex-row rounded-2xl w-90"
              style={{ boxShadow: "0px 0px 2px 0px rgba(0, 0, 0, 0.25)" }}
            >
              <div className="bg-[#E53E3E] rounded-l-2xl p-7 flex justify-center items-center ">
                <img className="w-9 h-9" src={images.Users} alt="" />
              </div>
              <div className="flex flex-col bg-[#FFF1F1] rounded-r-2xl p-3 pr-11 gap-1">
                <span className="font-semibold text-[15px]">Total Users</span>
                <span className="font-semibold text-2xl">1,500</span>
                <span className="text-[#00000080] text-[13px] ">
                  <span className="text-[#1DB61D]">+5%</span> increase from last
                  month
                </span>
              </div>
            </div>

            {/* Card 3 */}

            <div
              className="flex flex-row rounded-2xl w-90"
              style={{ boxShadow: "0px 0px 2px 0px rgba(0, 0, 0, 0.25)" }}
            >
              <div className="bg-[#E53E3E] rounded-l-2xl p-7 flex justify-center items-center ">
                <img className="w-9 h-9" src={images.Users} alt="" />
              </div>
              <div className="flex flex-col bg-[#FFF1F1] rounded-r-2xl p-3 pr-11 gap-1">
                <span className="font-semibold text-[15px]">Total Users</span>
                <span className="font-semibold text-2xl">1,500</span>
                <span className="text-[#00000080] text-[13px] ">
                  <span className="text-[#1DB61D]">+5%</span> increase from last
                  month
                </span>
              </div>
            </div>
          </div>

          <div className="mt-5">
            <div className="flex flex-row justify-between">
              <div>
                <BulkActionDropdown onActionSelect={handleBulkActionSelect} />
              </div>
              <div className="flex flex-row gap-5">
                <div>
                  <button
                    onClick={() => setShowModal(true)}
                    className="bg-[#E53E3E] text-white px-5 py-3.5 rounded-lg cursor-pointer text-center"
                  >
                    Add new user
                  </button>
                </div>
                <div>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search"
                      className="pl-12 pr-6 py-3.5 border border-[#00000080] rounded-lg text-[15px] w-[363px] focus:outline-none bg-white shadow-[0_2px_6px_rgba(0,0,0,0.05)] placeholder-[#00000080]"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        className="h-5 w-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5">
            <UsersTable title="Users" onRowSelect={handleUserSelection} />
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      <AddUserModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  );
};

export default customer_mgt;
