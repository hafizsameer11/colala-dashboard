import images from "../../../constants/images";
import { useState } from "react";
import ManagementSettingTable from "./managementsettingtable";
import AddNewAdmin from "./addnewadmin";
import AdminDetail from "./admindetail";
import Categories from "./categories";
import QuestionModal from "./questionmodal";

interface Admin {
  id: string;
  name: string;
  avatar: string;
  role: string;
  dateJoined: string;
  status: "active" | "inactive";
  email?: string;
  location?: string;
  lastLogin?: string;
}

interface Question {
  id: string;
  question: string;
  answer: string;
}

const AllUsers = () => {
  const [selectedOption, setSelectedOption] = useState("Online");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Admin Management");
  const [faqActiveTab, setFaqActiveTab] = useState("All");
  const [isThisWeekDropdownOpen, setIsThisWeekDropdownOpen] = useState(false);
  const [isAddAdminModalOpen, setIsAddAdminModalOpen] = useState(false);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [newAdminData, setNewAdminData] = useState<{
    name: string;
    email: string;
    password: string;
    role: string;
  } | null>(null);

  // FAQ Data
  const faqData = [
    {
      id: "1",
      type: "General FAQ",
      users: "All",
      questions: 3,
      userType: "All",
    },
    {
      id: "2",
      type: "Promotions Section",
      users: "Sellers",
      questions: 3,
      userType: "Sellers",
    },
    {
      id: "3",
      type: "Leaderboard Section",
      users: "All",
      questions: 3,
      userType: "All",
    },
  ];

  const filteredFaqData =
    faqActiveTab === "All"
      ? faqData
      : faqData.filter((faq) => faq.userType === faqActiveTab);

  const dropdownOptions = ["Online", "All", "Active", "Inactive"];

  const handleAddNewAdmin = (adminData: {
    name: string;
    email: string;
    password: string;
    role: string;
  }) => {
    setNewAdminData(adminData);
    setTimeout(() => {
      setNewAdminData(null);
    }, 100);
  };

  const handleOpenModal = () => {
    setIsDropdownOpen(false);
    setIsThisWeekDropdownOpen(false);
    setIsAddAdminModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddAdminModalOpen(false);
  };

  const handleAdminDetails = (admin: Admin) => {
    setSelectedAdmin(admin);
  };

  const handleOpenQuestionModal = () => {
    setIsQuestionModalOpen(true);
  };

  const handleCloseQuestionModal = () => {
    setIsQuestionModalOpen(false);
  };

  const handleSaveQuestions = (questions: Question[]) => {
    console.log("Saved questions:", questions);
    // Here you can add logic to save the questions to your backend or state
  };

  const DropdownComponent = () => (
    <div className="relative">
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center gap-2 px-4 py-3.5 border border-gray-300 rounded-lg font-medium text-gray-700 bg-white cursor-pointer"
      >
        {selectedOption}
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {isDropdownOpen && (
        <div className="absolute left-0 mt-2 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          {dropdownOptions.map((option) => (
            <button
              key={option}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => {
                setSelectedOption(option);
                setIsDropdownOpen(false);
              }}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <>
      {selectedAdmin ? (
        <AdminDetail admin={selectedAdmin} />
      ) : activeTab === "Categories" ? (
        <Categories
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isThisWeekDropdownOpen={isThisWeekDropdownOpen}
          setIsThisWeekDropdownOpen={setIsThisWeekDropdownOpen}
        />
      ) : activeTab === "Admin Management" ? (
        <>
          <div className="flex items-center justify-between p-6 bg-white border-b border-t border-[#787878]">
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

            <div className="flex items-center gap-3">
              {/* Main Tabs Group */}
              <div className="flex items-center bg-white border border-[#989898] rounded-lg p-2 ">
                {["General", "Admin Management", "Categories", "FAQs"].map(
                  (tab) => {
                    const isActive = activeTab === tab;
                    return (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer ${
                          isActive
                            ? "bg-[#E53E3E] text-white"
                            : "text-gray-700 hover:text-gray-900"
                        }`}
                      >
                        {tab}
                      </button>
                    );
                  }
                )}
              </div>

              {/* This Week Dropdown - Separate */}
              <div className="relative">
                <div className="bg-white border border-[#989898] rounded-lg cursor-pointer">
                  <button
                    onClick={() =>
                      setIsThisWeekDropdownOpen(!isThisWeekDropdownOpen)
                    }
                    className="flex items-center p-4 text-sm font-medium text-gray-700 hover:text-gray-900 rounded-xl transition-all duration-200 cursor-pointer"
                  >
                    <span className="cursor-pointer">This Week</span>
                    <svg
                      className={`w-4 h-4 ml-2 transition-transform duration-200 ${
                        isThisWeekDropdownOpen ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                </div>

                {isThisWeekDropdownOpen && (
                  <div className="absolute top-full right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                    {["This Week", "Last Week", "This Month", "Last Month"].map(
                      (option) => (
                        <button
                          key={option}
                          onClick={() => {
                            setIsThisWeekDropdownOpen(false);
                          }}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg"
                        >
                          {option}
                        </button>
                      )
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto space-y-4">
              {/* Admin Management Content */}
              {activeTab === "Admin Management" && (
                <>
                  <div className="flex flex-row justify-between items-center">
                    {/* Card 1 */}
                    <div
                      className="flex flex-row rounded-2xl  "
                      style={{
                        boxShadow: "0px 0px 2px 0px rgba(0, 0, 0, 0.25)",
                      }}
                    >
                      <div className="bg-[#E53E3E] rounded-l-2xl p-7 flex justify-center items-center ">
                        <img className="w-9 h-9" src={images.Users} alt="" />
                      </div>
                      <div className="flex flex-col bg-[#FFF1F1] rounded-r-2xl p-3 pr-11 gap-1">
                        <span className="font-semibold text-[15px]">
                          Total Admins
                        </span>
                        <span className="font-semibold text-2xl">50</span>
                        <span className="text-[#00000080] text-[13px] ">
                          <span className="text-[#1DB61D]">+5%</span> increase
                          from last month
                        </span>
                      </div>
                    </div>

                    {/* Card 2 */}

                    <div
                      className="flex flex-row rounded-2xl"
                      style={{
                        boxShadow: "0px 0px 2px 0px rgba(0, 0, 0, 0.25)",
                      }}
                    >
                      <div className="bg-[#E53E3E] rounded-l-2xl p-7 flex justify-center items-center ">
                        <img className="w-9 h-9" src={images.Users} alt="" />
                      </div>
                      <div className="flex flex-col bg-[#FFF1F1] rounded-r-2xl p-3 pr-11 gap-1">
                        <span className="font-semibold text-[15px]">
                          Online Admins
                        </span>
                        <span className="font-semibold text-2xl">20</span>
                        <span className="text-[#00000080] text-[13px] ">
                          <span className="text-[#1DB61D]">+5%</span> increase
                          from last month
                        </span>
                      </div>
                    </div>

                    {/* Card 3 */}

                    <div
                      className="flex flex-row rounded-2xl"
                      style={{
                        boxShadow: "0px 0px 2px 0px rgba(0, 0, 0, 0.25)",
                      }}
                    >
                      <div className="bg-[#E53E3E] rounded-l-2xl p-7 flex justify-center items-center ">
                        <img className="w-9 h-9" src={images.Users} alt="" />
                      </div>
                      <div className="flex flex-col bg-[#FFF1F1] rounded-r-2xl p-3 pr-11 gap-1">
                        <span className="font-semibold text-[15px]">
                          Active Admins
                        </span>
                        <span className="font-semibold text-2xl">40</span>
                        <span className="text-[#00000080] text-[13px] ">
                          <span className="text-[#1DB61D]">+5%</span> increase
                          from last month
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 flex flex-row justify-between">
                    <div className="flex gap-2">
                      <div>
                        <DropdownComponent />
                      </div>
                    </div>
                    <div className="flex flex-row gap-2">
                      <div>
                        <button
                          onClick={handleOpenModal}
                          className="bg-[#E53E3E] text-white cursor-pointer px-6 py-3.5 rounded-xl"
                        >
                          Add New
                        </button>
                      </div>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search"
                          className="pl-12 pr-6 py-3 border border-[#00000080] rounded-lg text-[15px] w-[267px] focus:outline-none bg-white shadow-[0_2px_6px_rgba(0,0,0,0.05)] placeholder-[#00000080]"
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
                  <ManagementSettingTable
                    newAdmin={newAdminData}
                    onAdminDetails={handleAdminDetails}
                  />
                  <AddNewAdmin
                    isOpen={isAddAdminModalOpen}
                    onClose={handleCloseModal}
                    onAddAdmin={handleAddNewAdmin}
                  />
                </>
              )}
            </div>
          </div>
        </>
      ) : activeTab === "General" ? (
        <>
          <div className="flex items-center justify-between p-6 bg-white border-b border-t border-[#787878]">
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

            <div className="flex items-center gap-3">
              {/* Main Tabs Group */}
              <div className="flex items-center bg-white border border-gray-300 rounded-lg p-2 ">
                {["General", "Admin Management", "Categories", "FAQs"].map(
                  (tab) => {
                    const isActive = activeTab === tab;
                    return (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer ${
                          isActive
                            ? "bg-[#E53E3E] text-white"
                            : "text-gray-700 hover:text-gray-900"
                        }`}
                      >
                        {tab}
                      </button>
                    );
                  }
                )}
              </div>

              {/* This Week Dropdown - Separate */}
              <div className="relative">
                <div className="bg-white border border-gray-300 rounded-lg">
                  <button
                    onClick={() =>
                      setIsThisWeekDropdownOpen(!isThisWeekDropdownOpen)
                    }
                    className="flex items-center p-4 cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900 rounded-lg transition-all duration-200"
                  >
                    <span className="cursor-pointer">This Week</span>
                    <svg
                      className={`w-4 h-4 ml-2 transition-transform duration-200 ${
                        isThisWeekDropdownOpen ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                </div>

                {isThisWeekDropdownOpen && (
                  <div className="absolute top-full right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                    {["This Week", "Last Week", "This Month", "Last Month"].map(
                      (option) => (
                        <button
                          key={option}
                          onClick={() => {
                            setIsThisWeekDropdownOpen(false);
                          }}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg"
                        >
                          {option}
                        </button>
                      )
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
              <div className="mt-8 bg-white border border-gray-300 rounded-2xl p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  General Settings
                </h2>
                <p className="text-gray-600">
                  General settings will be implemented here.
                </p>
              </div>
            </div>
          </div>
        </>
      ) : activeTab === "FAQs" ? (
        <>
          <div className="flex items-center justify-between p-6 bg-white border-b border-t border-[#787878]">
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

            <div className="flex items-center gap-3">
              {/* Main Tabs Group */}
              <div className="flex items-center bg-white border border-gray-300 rounded-lg p-2">
                {["General", "Admin Management", "Categories", "FAQs"].map(
                  (tab) => {
                    const isActive = activeTab === tab;
                    return (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer ${
                          isActive
                            ? "bg-[#E53E3E] text-white"
                            : "text-gray-700 hover:text-gray-900"
                        }`}
                      >
                        {tab}
                      </button>
                    );
                  }
                )}
              </div>

              {/* This Week Dropdown - Separate */}
              <div className="relative">
                <div className="bg-white border border-gray-300 rounded-lg">
                  <button
                    onClick={() =>
                      setIsThisWeekDropdownOpen(!isThisWeekDropdownOpen)
                    }
                    className="flex items-center p-4 cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900 rounded-full transition-all duration-200"
                  >
                    <span className="cursor-pointer">This Week</span>
                    <svg
                      className={`w-4 h-4 ml-2 transition-transform duration-200 ${
                        isThisWeekDropdownOpen ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                </div>

                {isThisWeekDropdownOpen && (
                  <div className="absolute top-full right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                    {["This Week", "Last Week", "This Month", "Last Month"].map(
                      (option) => (
                        <button
                          key={option}
                          onClick={() => {
                            setIsThisWeekDropdownOpen(false);
                          }}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg"
                        >
                          {option}
                        </button>
                      )
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto space-y-4">
              {/* FAQ Content */}
              {activeTab === "FAQs" && (
                <div className="space-y-6">
                  {/* FAQ Tabs - Styled like the image */}
                  <div className="flex items-center bg-white border border-gray-300 rounded-lg p-2 w-57">
                    {["All", "Buyers", "Sellers"].map((tab) => {
                      const isActive = faqActiveTab === tab;
                      return (
                        <button
                          key={tab}
                          onClick={() => setFaqActiveTab(tab)}
                          className={`px-4 py-2 font-medium rounded-lg transition-all duration-200 cursor-pointer ${
                            isActive
                              ? "bg-[#E53E3E] text-white"
                              : "text-gray-700 hover:text-gray-900 bg-transparent"
                          }`}
                        >
                          {tab}
                        </button>
                      );
                    })}
                  </div>

                  {/* FAQ Card */}
                  <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                    {/* FAQ Header */}
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h2 className="text-lg font-medium text-gray-900">
                        FAQs
                      </h2>
                    </div>

                    {/* FAQ Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-6 py-4 text-left">
                              <input
                                type="checkbox"
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                              />
                            </th>
                            <th className="px-6 py-4 text-left font-medium text-gray-700">
                              Type
                            </th>
                            <th className="px-6 py-4 text-left font-medium text-gray-700">
                              Users
                            </th>
                            <th className="px-6 py-4 text-center font-medium text-gray-700">
                              No of questions
                            </th>
                            <th className="px-6 py-4 text-center font-medium text-gray-700">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {filteredFaqData.map((faq) => (
                            <tr key={faq.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4">
                                <input
                                  type="checkbox"
                                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                />
                              </td>
                              <td className="px-6 py-4">
                                <span className=" font-medium text-gray-900">
                                  {faq.type}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span className=" text-gray-600">
                                  {faq.users}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <span className=" text-gray-600">
                                  {faq.questions}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center justify-end gap-3">
                                  <button
                                    onClick={handleOpenQuestionModal}
                                    className="px-4 py-3 cursor-pointer bg-[#E53E3E] text-white  font-medium rounded-lg hover:bg-[#D32F2F] transition-colors"
                                  >
                                    Add Question
                                  </button>
                                  <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                                    <img
                                      src="/public/assets/layout/edit1.svg"
                                      alt="Edit"
                                    />
                                  </button>
                                  <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                                    <img
                                      src="/public/assets/layout/delete1.svg"
                                      alt="Delete"
                                    />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      ) : null}

      {/* Question Modal */}
      <QuestionModal
        isOpen={isQuestionModalOpen}
        onClose={handleCloseQuestionModal}
        onSave={handleSaveQuestions}
      />
    </>
  );
};

export default AllUsers;
