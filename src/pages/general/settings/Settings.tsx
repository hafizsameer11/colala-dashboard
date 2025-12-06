import images from "../../../constants/images";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import ManagementSettingTable from "./components/managementsettingtable";
import AddNewAdmin from "./components/addnewadmin";
import AdminDetail from "./components/admindetail";
import Categories from "./components/categories";
import BrandsManagement from "./components/brandsManagement";
import KnowledgeBase from "./components/knowledgeBase";
import QuestionModal from "./components/questionmodal";
import useDebouncedValue from "../../../hooks/useDebouncedValue";
import { getUserDetails, getAdminUsers } from "../../../utils/queries/users";
import { 
  getFaqStatistics, 
  getFaqCategories, 
  getFaqsByCategory, 
  updateFaq, 
  deleteFaq
} from "../../../utils/queries/faq";
import { getTerms, updateTerms } from "../../../utils/queries/terms";

interface FaqItem {
  id: number;
  question: string;
  answer: string;
  is_active: number;
  category: {
    id: number;
    title: string;
    video?: string;
    is_active?: number;
  };
  created_at: string;
  updated_at: string;
}

interface FaqCategory {
  id: number;
  title: string;
  video?: string;
  is_active: number;
}

interface FaqStatistics {
  total_faqs: number;
  active_faqs: number;
  inactive_faqs: number;
  categories_stats: Array<{
    category: string;
    total_faqs: number;
    active_faqs: number;
    inactive_faqs: number;
  }>;
}

interface Admin {
  id: number;
  full_name: string;
  user_name?: string;
  email: string;
  phone: string;
  profile_picture: string | null;
  role: "admin" | "moderator" | "super_admin";
  is_active: boolean;
  wallet_balance: string;
  created_at: string;
}

interface UserDetails {
  user_info: {
    id: number;
    full_name: string;
    email: string;
    phone: string;
    user_name: string;
    country: string;
    state: string;
    role: "buyer" | "seller";
    status: "active" | "inactive";
    profile_picture: string | null;
    user_code: string;
    created_at: string;
    updated_at: string;
  };
  wallet_info: {
    id: number;
    balance: string | null;
    escrow_balance: string | null;
    points_balance: string | null;
    created_at: string;
  };
  store_info: any | null;
  statistics: {
    total_orders: number;
    total_transactions: number;
    total_loyalty_points: number;
    total_spent: number;
    average_order_value: number;
  };
  recent_orders: any[];
  activities: Array<{
    id: number;
    activity: string;
    created_at: string;
  }>;
  recent_transactions: any[];
}

interface Question {
  id: string;
  question: string;
  answer: string;
}

interface TermsData {
  buyer_privacy_policy?: string;
  buyer_terms_and_condition?: string;
  buyer_return_policy?: string;
  seller_onboarding_policy?: string;
  seller_privacy_policy?: string;
  seller_terms_and_condition?: string;
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
  const [selectedUserDetails, setSelectedUserDetails] = useState<UserDetails | null>(null);
  const [newAdminData, setNewAdminData] = useState<{
    name: string;
    email: string;
    password: string;
    role: string;
  } | null>(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search);

  // API Queries
  const { 
    data: usersData, 
    isLoading: usersLoading, 
    error: usersError,
    refetch: refetchUsers 
  } = useQuery({
    queryKey: ['adminUsers', currentPage, debouncedSearch],
    queryFn: () => getAdminUsers({
      search: debouncedSearch,
      page: currentPage
    }),
    enabled: activeTab === "Admin Management"
  });

  const { 
    data: userDetailsData, 
    isLoading: userDetailsLoading, 
    error: userDetailsError 
  } = useQuery({
    queryKey: ['userDetails', selectedAdmin?.id],
    queryFn: () => getUserDetails(selectedAdmin!.id),
    enabled: !!selectedAdmin?.id
  });

  // Update selectedUserDetails when userDetailsData changes
  useEffect(() => {
    if (userDetailsData?.data) {
      setSelectedUserDetails(userDetailsData.data);
    }
  }, [userDetailsData]);

  // FAQ State
  const [faqItems, setFaqItems] = useState<FaqItem[]>([]);
  const [faqCategories, setFaqCategories] = useState<FaqCategory[]>([]);
  const [, setFaqStatistics] = useState<FaqStatistics | null>(null);
  const [isLoadingFaqs, setIsLoadingFaqs] = useState(false);
  const [currentFaqPage] = useState(1);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Terms State
  const [termsData, setTermsData] = useState<TermsData>({
    buyer_privacy_policy: "",
    buyer_terms_and_condition: "",
    buyer_return_policy: "",
    seller_onboarding_policy: "",
    seller_privacy_policy: "",
    seller_terms_and_condition: "",
  });
  const [isLoadingTerms, setIsLoadingTerms] = useState(false);
  const [isSavingTerms, setIsSavingTerms] = useState(false);

  // Filter FAQ data based on active tab
  const getFilteredFaqData = () => {
    if (faqActiveTab === "All") {
      return faqItems;
    }
    // Map tab names to category titles
    const categoryMap: Record<string, string> = {
      "Buyers": "buyer",
      "Sellers": "seller"
    };
    const targetCategory = categoryMap[faqActiveTab];
    return faqItems.filter((faq) => faq.category.title === targetCategory);
  };

  const filteredFaqData = getFilteredFaqData();

  const [editingFaq, setEditingFaq] = useState<FaqItem | null>(null);
  const [editFaqForm, setEditFaqForm] = useState<{
    question: string;
    answer: string;
    faq_category_id: string;
    is_active: number;
  }>({ question: "", answer: "", faq_category_id: "1", is_active: 1 });

  const openEditFaq = (faq: FaqItem) => {
    setEditingFaq(faq);
    setEditFaqForm({
      question: faq.question,
      answer: faq.answer,
      faq_category_id: faq.category.id.toString(),
      is_active: faq.is_active,
    });
  };

  const cancelEditFaq = () => setEditingFaq(null);

  const saveEditFaq = async () => {
    if (!editingFaq) return;
    try {
      const response = await updateFaq(editingFaq.id, editFaqForm);
      if (response.status === 'success') {
        // Refresh FAQ data by triggering useEffect
        // The useEffect will handle the data fetching
        setEditingFaq(null);
        // Trigger a refresh by updating the refresh trigger
        setRefreshTrigger(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error updating FAQ:', error);
    }
  };

  const handleDeleteFaq = async (faq: FaqItem) => {
    if (!window.confirm(`Delete "${faq.question}"?`)) return;
    try {
      const response = await deleteFaq(faq.id);
      if (response.status === 'success') {
        // Trigger a refresh by updating the refresh trigger
        setRefreshTrigger(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error deleting FAQ:', error);
    }
  };

  // FAQ API Functions are now called directly in useEffect to prevent infinite loops

  // handleCreateFaq function is available for future use
  // const handleCreateFaq = async (faqData: {
  //   faq_category_id: string;
  //   question: string;
  //   answer: string;
  //   is_active: number;
  // }) => {
  //   try {
  //     const response = await createFaq(faqData);
  //     if (response.status === 'success') {
  //       // Refresh FAQ data
  //       fetchFaqStatistics();
  //       if (faqActiveTab !== "All") {
  //         const categoryMap: Record<string, string> = {
  //           "Buyers": "buyer",
  //           "Sellers": "seller"
  //         };
  //         fetchFaqsByCategory(categoryMap[faqActiveTab] || "general");
  //       } else {
  //         fetchFaqsByCategory("general");
  //       }
  //     }
  //   } catch (error) {
  //     console.error('Error creating FAQ:', error);
  //   }
  // };

  // Fetch FAQ data when component mounts or FAQ tab is active
  useEffect(() => {
    if (activeTab === "FAQs") {
      // Only fetch data once when FAQs tab is opened
      const loadFaqData = async () => {
        try {
          // Fetch statistics and categories first
          const statsResponse = await getFaqStatistics();
          if (statsResponse.status === 'success') {
            setFaqStatistics(statsResponse.data);
          }

          const categoriesResponse = await getFaqCategories();
          if (categoriesResponse.status === 'success') {
            setFaqCategories(categoriesResponse.data);
          }
          
          // Then fetch FAQs based on active tab
          setIsLoadingFaqs(true);
          let categoryToFetch = "general";
          if (faqActiveTab !== "All") {
            const categoryMap: Record<string, string> = {
              "Buyers": "buyer",
              "Sellers": "seller"
            };
            categoryToFetch = categoryMap[faqActiveTab] || "general";
          }
          
          const faqsResponse = await getFaqsByCategory(categoryToFetch, currentFaqPage);
          if (faqsResponse.status === 'success') {
            setFaqItems(faqsResponse.data.faqs.data || []);
          }
        } catch (error) {
          console.error('Error loading FAQ data:', error);
        } finally {
          setIsLoadingFaqs(false);
        }
      };
      
      loadFaqData();
    }
  }, [activeTab, faqActiveTab, currentFaqPage, refreshTrigger]); // Only depend on tab changes

  // Fetch Terms data when Terms tab is active
  useEffect(() => {
    if (activeTab === "Terms") {
      const loadTermsData = async () => {
        setIsLoadingTerms(true);
        try {
          const response = await getTerms();
          if (response.status === 'success' && response.data?.terms) {
            setTermsData({
              buyer_privacy_policy: response.data.terms.buyer_privacy_policy || "",
              buyer_terms_and_condition: response.data.terms.buyer_terms_and_condition || "",
              buyer_return_policy: response.data.terms.buyer_return_policy || "",
              seller_onboarding_policy: response.data.terms.seller_onboarding_policy || "",
              seller_privacy_policy: response.data.terms.seller_privacy_policy || "",
              seller_terms_and_condition: response.data.terms.seller_terms_and_condition || "",
            });
          }
        } catch (error) {
          console.error('Error loading terms data:', error);
        } finally {
          setIsLoadingTerms(false);
        }
      };
      
      loadTermsData();
    }
  }, [activeTab]);

  const handleSaveTerms = async () => {
    setIsSavingTerms(true);
    try {
      const response = await updateTerms(termsData);
      if (response.status === 'success') {
        alert('Terms and policies updated successfully!');
      }
    } catch (error) {
      console.error('Error updating terms:', error);
      alert('Failed to update terms. Please try again.');
    } finally {
      setIsSavingTerms(false);
    }
  };

  const dropdownOptions = ["Online", "All", "Active", "Inactive"];

  const handleAddNewAdmin = (adminData: {
    full_name: string;
    user_name: string;
    email: string;
    phone: string;
    password: string;
    country: string;
    state: string;
    role: string;
    referral_code?: string;
    profile_picture?: File | null;
  }) => {
    // Refetch users data after adding new admin
    refetchUsers();
    setNewAdminData({
      name: adminData.full_name,
      email: adminData.email,
      password: adminData.password,
      role: adminData.role
    });
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

  const handleBackFromDetails = () => {
    setSelectedAdmin(null);
    setSelectedUserDetails(null);
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
        <AdminDetail 
          admin={selectedAdmin} 
          userDetails={selectedUserDetails}
          onBack={handleBackFromDetails}
          loading={userDetailsLoading}
          error={userDetailsError}
        />
      ) : activeTab === "Categories" ? (
        <Categories
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isThisWeekDropdownOpen={isThisWeekDropdownOpen}
          setIsThisWeekDropdownOpen={setIsThisWeekDropdownOpen}
        />
      ) : activeTab === "Brands" ? (
        <BrandsManagement
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isThisWeekDropdownOpen={isThisWeekDropdownOpen}
          setIsThisWeekDropdownOpen={setIsThisWeekDropdownOpen}
        />
      ) : activeTab === "Knowledge Base" ? (
        <KnowledgeBase
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isThisWeekDropdownOpen={isThisWeekDropdownOpen}
          setIsThisWeekDropdownOpen={setIsThisWeekDropdownOpen}
        />
      ) : activeTab === "Admin Management" ? (
        <>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-5 md:p-6 bg-white border-b border-t border-[#787878] gap-3 sm:gap-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Settings</h1>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
        {/* Main Tabs Group */}
        <div className="flex items-center bg-white border border-[#989898] rounded-lg p-1.5 sm:p-2 overflow-x-auto w-full sm:w-auto">
          {["General", "Admin Management", "Categories", "Brands", "FAQs", "Knowledge Base", "Terms"].map(
            (tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer whitespace-nowrap ${
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
          <div className="p-3 sm:p-4 md:p-6 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto space-y-4">
              {/* Admin Management Content */}
              {activeTab === "Admin Management" && (
                <>
                  <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-4">
                    {/* Card 1 - Total Users */}
                    <div
                      className="flex flex-row rounded-2xl flex-1 min-w-0"
                      style={{
                        boxShadow: "0px 0px 2px 0px rgba(0, 0, 0, 0.25)",
                      }}
                    >
                      <div className="bg-[#E53E3E] rounded-l-2xl p-4 sm:p-5 md:p-7 flex justify-center items-center">
                        <img className="w-6 h-6 sm:w-7 sm:h-7 md:w-9 md:h-9" src={images.Users} alt="" />
                      </div>
                      <div className="flex flex-col bg-[#FFF1F1] rounded-r-2xl p-2 sm:p-3 pr-4 sm:pr-6 md:pr-11 gap-1 flex-1 min-w-0">
                        <span className="font-semibold text-xs sm:text-sm md:text-[15px]">
                          Total Users
                        </span>
                        <span className="font-semibold text-lg sm:text-xl md:text-2xl">
                          {usersLoading ? "..." : usersData?.data?.statistics?.total_users || 0}
                        </span>
                        <span className="text-[#00000080] text-[10px] sm:text-xs md:text-[13px]">
                          <span className="text-[#1DB61D]">+5%</span> increase
                          from last month
                        </span>
                      </div>
                    </div>

                    {/* Card 2 - Active Users */}
                    <div
                      className="flex flex-row rounded-2xl flex-1 min-w-0"
                      style={{
                        boxShadow: "0px 0px 2px 0px rgba(0, 0, 0, 0.25)",
                      }}
                    >
                      <div className="bg-[#E53E3E] rounded-l-2xl p-4 sm:p-5 md:p-7 flex justify-center items-center">
                        <img className="w-6 h-6 sm:w-7 sm:h-7 md:w-9 md:h-9" src={images.Users} alt="" />
                      </div>
                      <div className="flex flex-col bg-[#FFF1F1] rounded-r-2xl p-2 sm:p-3 pr-4 sm:pr-6 md:pr-11 gap-1 flex-1 min-w-0">
                        <span className="font-semibold text-xs sm:text-sm md:text-[15px]">
                          Active Users
                        </span>
                        <span className="font-semibold text-lg sm:text-xl md:text-2xl">
                          {usersLoading ? "..." : usersData?.data?.statistics?.active_users || 0}
                        </span>
                        <span className="text-[#00000080] text-[10px] sm:text-xs md:text-[13px]">
                          <span className="text-[#1DB61D]">+5%</span> increase
                          from last month
                        </span>
                      </div>
                    </div>

                    {/* Card 3 - Buyers */}
                    <div
                      className="flex flex-row rounded-2xl flex-1 min-w-0"
                      style={{
                        boxShadow: "0px 0px 2px 0px rgba(0, 0, 0, 0.25)",
                      }}
                    >
                      <div className="bg-[#E53E3E] rounded-l-2xl p-4 sm:p-5 md:p-7 flex justify-center items-center">
                        <img className="w-6 h-6 sm:w-7 sm:h-7 md:w-9 md:h-9" src={images.Users} alt="" />
                      </div>
                      <div className="flex flex-col bg-[#FFF1F1] rounded-r-2xl p-2 sm:p-3 pr-4 sm:pr-6 md:pr-11 gap-1 flex-1 min-w-0">
                        <span className="font-semibold text-xs sm:text-sm md:text-[15px]">
                          Buyers
                        </span>
                        <span className="font-semibold text-lg sm:text-xl md:text-2xl">
                          {usersLoading ? "..." : usersData?.data?.statistics?.buyer_users || 0}
                        </span>
                        <span className="text-[#00000080] text-[10px] sm:text-xs md:text-[13px]">
                          <span className="text-[#1DB61D]">+5%</span> increase
                          from last month
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 sm:mt-5 flex flex-col sm:flex-row justify-between gap-3 sm:gap-0">
                    <div className="flex gap-2">
                      <div>
                        <DropdownComponent />
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div>
                        <button
                          onClick={handleOpenModal}
                          className="bg-[#E53E3E] text-white cursor-pointer px-4 sm:px-6 py-2.5 sm:py-3.5 rounded-xl text-sm sm:text-base w-full sm:w-auto"
                        >
                          Add New
                        </button>
                      </div>
                      <div className="relative w-full sm:w-auto">
                        <input
                          type="text"
                          placeholder="Search"
                          value={search} // <- NEW
                          onChange={(e) => setSearch(e.target.value)} // <- NEW
                          className="pl-12 pr-6 py-2.5 sm:py-3 border border-[#00000080] rounded-lg text-sm sm:text-[15px] w-full sm:w-[220px] md:w-[267px] focus:outline-none bg-white shadow-[0_2px_6px_rgba(0,0,0,0.05)] placeholder-[#00000080]"
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
                  {usersLoading ? (
                    <div className="flex justify-center items-center py-8">
                      <div className="text-lg text-gray-600">Loading users...</div>
                    </div>
                  ) : usersError ? (
                    <div className="flex justify-center items-center py-8">
                      <div className="text-lg text-red-600">Error loading users. Please try again.</div>
                    </div>
                  ) : (
                    <ManagementSettingTable
                      users={usersData?.data?.data || []}
                      newAdmin={newAdminData}
                      onAdminDetails={handleAdminDetails}
                      searchTerm={debouncedSearch}
                      pagination={{
                        currentPage: usersData?.data?.current_page || 1,
                        totalPages: usersData?.data?.last_page || 1,
                        total: usersData?.data?.total || 0,
                        perPage: usersData?.data?.per_page || 15,
                        onPageChange: setCurrentPage
                      }}
                    />
                  )}
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
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-5 md:p-6 bg-white border-b border-t border-[#787878] gap-3 sm:gap-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Settings</h1>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
              {/* Main Tabs Group */}
              <div className="flex items-center bg-white border border-gray-300 rounded-lg p-1.5 sm:p-2 overflow-x-auto w-full sm:w-auto">
                {["General", "Admin Management", "Categories", "Brands", "FAQs", "Knowledge Base", "Terms"].map(
                  (tab) => {
                    const isActive = activeTab === tab;
                    return (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer whitespace-nowrap ${
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
          <div className="p-3 sm:p-4 md:p-6 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
              <div className="mt-4 sm:mt-6 md:mt-8 bg-white border border-gray-300 rounded-2xl p-4 sm:p-5 md:p-6">
                <h2 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">
                  General Settings
                </h2>
                <p className="text-sm sm:text-base text-gray-600">
                  General settings will be implemented here.
                </p>
              </div>
            </div>
          </div>
        </>
      ) : activeTab === "FAQs" ? (
        <>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-5 md:p-6 bg-white border-b border-t border-[#787878] gap-3 sm:gap-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Settings</h1>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
              {/* Main Tabs Group */}
              <div className="flex items-center bg-white border border-gray-300 rounded-lg p-1.5 sm:p-2 overflow-x-auto w-full sm:w-auto">
                {["General", "Admin Management", "Categories", "Brands", "FAQs", "Knowledge Base", "Terms"].map(
                  (tab) => {
                    const isActive = activeTab === tab;
                    return (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer whitespace-nowrap ${
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
          <div className="p-3 sm:p-4 md:p-6 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto space-y-4">
              {/* FAQ Content */}
              {activeTab === "FAQs" && (
                <div className="space-y-4 sm:space-y-6">
                  {/* FAQ Tabs - Styled like the image */}
                  <div className="flex items-center bg-white border border-gray-300 rounded-lg p-1.5 sm:p-2 overflow-x-auto w-fit">
                    {["All", "Buyers", "Sellers"].map((tab) => {
                      const isActive = faqActiveTab === tab;
                      return (
                        <button
                          key={tab}
                          onClick={() => setFaqActiveTab(tab)}
                          className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer whitespace-nowrap ${
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
                              Category
                            </th>
                            <th className="px-6 py-4 text-left font-medium text-gray-700">
                              Users
                            </th>
                            <th className="px-6 py-4 text-center font-medium text-gray-700">
                              Status
                            </th>
                            <th className="px-6 py-4 text-center font-medium text-gray-700">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {isLoadingFaqs ? (
                            <tr>
                              <td colSpan={5} className="px-6 py-8 text-center">
                                <div className="flex justify-center items-center">
                                  <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin mr-2"></div>
                                  Loading FAQs...
                                </div>
                              </td>
                            </tr>
                          ) : (
                            filteredFaqData.map((faq) => (
                              <tr key={faq.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                  <input
                                    type="checkbox"
                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                  />
                                </td>
                                <td className="px-6 py-4">
                                  <span className="font-medium text-gray-900">
                                    {faq.category.title}
                                  </span>
                                </td>
                                <td className="px-6 py-4">
                                  <span className="text-gray-600">
                                    {faq.category.title === 'general' ? 'All' : 
                                     faq.category.title === 'buyer' ? 'Buyers' : 'Sellers'}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                  <span className="text-gray-600">
                                    {faq.is_active ? 'Active' : 'Inactive'}
                                  </span>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center justify-end gap-3">
                                    <button
                                      onClick={handleOpenQuestionModal}
                                      className="px-4 py-3 cursor-pointer bg-[#E53E3E] text-white font-medium rounded-lg hover:bg-[#D32F2F] transition-colors"
                                    >
                                      Add Question
                                    </button>

                                    {/* EDIT (now functional) */}
                                    <button
                                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors cursor-pointer"
                                      onClick={() => openEditFaq(faq)}
                                      title="Edit"
                                    >
                                      <img
                                        src="/public/assets/layout/edit1.svg"
                                        alt="Edit"
                                      />
                                    </button>

                                    {/* DELETE (now functional) */}
                                    <button
                                      className="p-2 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                                      onClick={() => handleDeleteFaq(faq)}
                                      title="Delete"
                                    >
                                    <img
                                      src="/public/assets/layout/delete1.svg"
                                      alt="Delete"
                                    />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                          )}

                          {filteredFaqData.length === 0 && !isLoadingFaqs && (
                            <tr>
                              <td
                                colSpan={5}
                                className="px-6 py-8 text-center text-gray-500"
                              >
                                No FAQs found for this tab.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* ---- Edit FAQ Modal ---- */}
                  {editingFaq && (
                    <div
                      className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center"
                      onClick={cancelEditFaq}
                    >
                      <div
                        className="bg-white w-full max-w-lg rounded-xl shadow-xl p-6"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold">Edit FAQ</h3>
                          <button
                            onClick={cancelEditFaq}
                            className="p-1 rounded-full cursor-pointer border"
                          >
                            <svg
                              width="22"
                              height="22"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium mb-1">
                              Question
                            </label>
                            <input
                              value={editFaqForm.question}
                              onChange={(e) =>
                                setEditFaqForm((f) => ({
                                  ...f,
                                  question: e.target.value,
                                }))
                              }
                              className="w-full border rounded-lg px-3 py-2"
                              placeholder="Enter the question"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-1">
                              Answer
                            </label>
                            <textarea
                              value={editFaqForm.answer}
                              onChange={(e) =>
                                setEditFaqForm((f) => ({
                                  ...f,
                                  answer: e.target.value,
                                }))
                              }
                              className="w-full border rounded-lg px-3 py-2"
                              placeholder="Enter the answer"
                              rows={4}
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-sm font-medium mb-1">
                                Category
                              </label>
                              <select
                                value={editFaqForm.faq_category_id}
                                onChange={(e) =>
                                  setEditFaqForm((f) => ({
                                    ...f,
                                    faq_category_id: e.target.value,
                                  }))
                                }
                                className="w-full border rounded-lg px-3 py-2 bg-white"
                              >
                                {faqCategories.map((category) => (
                                  <option key={category.id} value={category.id.toString()}>
                                    {category.title}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="block text-sm font-medium mb-1">
                                Status
                              </label>
                              <select
                                value={editFaqForm.is_active}
                                onChange={(e) =>
                                  setEditFaqForm((f) => ({
                                    ...f,
                                    is_active: parseInt(e.target.value),
                                  }))
                                }
                                className="w-full border rounded-lg px-3 py-2 bg-white"
                              >
                                <option value={1}>Active</option>
                                <option value={0}>Inactive</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                          <button
                            onClick={cancelEditFaq}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={saveEditFaq}
                            className="px-4 py-2 bg-[#E53E3E] text-white rounded-lg hover:bg-[#D32F2F] transition-colors cursor-pointer"
                          >
                            Save Changes
                          </button>
                        </div>

                        <div className="mt-6 flex justify-end gap-2">
                          <button
                            onClick={cancelEditFaq}
                            className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={saveEditFaq}
                            className="px-4 py-2 rounded-lg bg-[#E53E3E] text-white hover:bg-[#D32F2F] cursor-pointer"
                          >
                            Save Changes
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      ) : activeTab === "Terms" ? (
        <>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-5 md:p-6 bg-white border-b border-t border-[#787878] gap-3 sm:gap-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Settings</h1>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
              {/* Main Tabs Group */}
              <div className="flex items-center bg-white border border-gray-300 rounded-lg p-1.5 sm:p-2 overflow-x-auto w-full sm:w-auto">
                {["General", "Admin Management", "Categories", "Brands", "FAQs", "Knowledge Base", "Terms"].map(
                  (tab) => {
                    const isActive = activeTab === tab;
                    return (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer whitespace-nowrap ${
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
          <div className="p-3 sm:p-4 md:p-6 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
              {/* Terms Content */}
              {activeTab === "Terms" && (
                <div className="space-y-4 sm:space-y-6">
                  <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                    <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
                      <h2 className="text-base sm:text-lg font-medium text-gray-900">
                        Terms & Policies
                      </h2>
                    </div>

                    {isLoadingTerms ? (
                      <div className="flex justify-center items-center py-8 sm:py-12">
                        <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin mr-2"></div>
                        <span className="text-sm sm:text-base text-gray-600">Loading terms...</span>
                      </div>
                    ) : (
                      <div className="p-4 sm:p-5 md:p-6 space-y-4 sm:space-y-6">
                        {/* Buyer Section */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                            Buyer Policies
                          </h3>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Buyer Privacy Policy
                            </label>
                            <textarea
                              value={termsData.buyer_privacy_policy || ""}
                              onChange={(e) =>
                                setTermsData({
                                  ...termsData,
                                  buyer_privacy_policy: e.target.value,
                                })
                              }
                              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#E53E3E] focus:border-transparent"
                              placeholder="Enter buyer privacy policy..."
                              rows={6}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Buyer Terms and Conditions
                            </label>
                            <textarea
                              value={termsData.buyer_terms_and_condition || ""}
                              onChange={(e) =>
                                setTermsData({
                                  ...termsData,
                                  buyer_terms_and_condition: e.target.value,
                                })
                              }
                              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#E53E3E] focus:border-transparent"
                              placeholder="Enter buyer terms and conditions..."
                              rows={6}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Buyer Return Policy
                            </label>
                            <textarea
                              value={termsData.buyer_return_policy || ""}
                              onChange={(e) =>
                                setTermsData({
                                  ...termsData,
                                  buyer_return_policy: e.target.value,
                                })
                              }
                              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#E53E3E] focus:border-transparent"
                              placeholder="Enter buyer return policy..."
                              rows={6}
                            />
                          </div>
                        </div>

                        {/* Seller Section */}
                        <div className="space-y-4 pt-6 border-t border-gray-200">
                          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                            Seller Policies
                          </h3>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Seller Onboarding Policy
                            </label>
                            <textarea
                              value={termsData.seller_onboarding_policy || ""}
                              onChange={(e) =>
                                setTermsData({
                                  ...termsData,
                                  seller_onboarding_policy: e.target.value,
                                })
                              }
                              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#E53E3E] focus:border-transparent"
                              placeholder="Enter seller onboarding policy..."
                              rows={6}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Seller Privacy Policy
                            </label>
                            <textarea
                              value={termsData.seller_privacy_policy || ""}
                              onChange={(e) =>
                                setTermsData({
                                  ...termsData,
                                  seller_privacy_policy: e.target.value,
                                })
                              }
                              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#E53E3E] focus:border-transparent"
                              placeholder="Enter seller privacy policy..."
                              rows={6}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Seller Terms and Conditions
                            </label>
                            <textarea
                              value={termsData.seller_terms_and_condition || ""}
                              onChange={(e) =>
                                setTermsData({
                                  ...termsData,
                                  seller_terms_and_condition: e.target.value,
                                })
                              }
                              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#E53E3E] focus:border-transparent"
                              placeholder="Enter seller terms and conditions..."
                              rows={6}
                            />
                          </div>
                        </div>

                        {/* Save Button */}
                        <div className="flex justify-end pt-6 border-t border-gray-200">
                          <button
                            onClick={handleSaveTerms}
                            disabled={isSavingTerms}
                            className="px-6 py-3 bg-[#E53E3E] text-white font-medium rounded-lg hover:bg-[#D32F2F] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isSavingTerms ? (
                              <span className="flex items-center">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                Saving...
                              </span>
                            ) : (
                              "Save Changes"
                            )}
                          </button>
                        </div>
                      </div>
                    )}
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
