import React, { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getServiceCategories,
  createServiceCategory,
  updateServiceCategory,
  deleteServiceCategory,
  type ServiceCategory,
} from "../../../../utils/queries/serviceCategories";
import ServiceCategoryModal from "./serviceCategoryModal";

interface ServiceCategoriesProps {
  onBack?: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isThisWeekDropdownOpen: boolean;
  setIsThisWeekDropdownOpen: (open: boolean) => void;
}

const ServiceCategories: React.FC<ServiceCategoriesProps> = ({
  activeTab,
  setActiveTab,
  isThisWeekDropdownOpen,
  setIsThisWeekDropdownOpen,
}) => {
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ServiceCategory | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isActiveFilter, setIsActiveFilter] = useState<boolean | undefined>(undefined);
  const perPage = 15;

  const queryClient = useQueryClient();

  // Fetch service categories with pagination
  const { data: categoriesData, isLoading, error } = useQuery({
    queryKey: ['serviceCategories', currentPage, isActiveFilter],
    queryFn: () => getServiceCategories(currentPage, perPage, isActiveFilter),
    staleTime: 5 * 60 * 1000, // 5 minutes
    keepPreviousData: true,
  });

  // Create category mutation
  const createCategoryMutation = useMutation({
    mutationFn: createServiceCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serviceCategories'] });
      setIsCategoryModalOpen(false);
      setCurrentPage(1);
    },
    onError: (error: any) => {
      console.error('Error creating service category:', error);
      alert(error?.response?.data?.message || 'Failed to create service category. Please try again.');
    },
  });

  // Update category mutation
  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: FormData }) => updateServiceCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serviceCategories'] });
      setIsCategoryModalOpen(false);
      setEditingCategory(null);
    },
    onError: (error: any) => {
      console.error('Error updating service category:', error);
      alert(error?.response?.data?.message || 'Failed to update service category. Please try again.');
    },
  });

  // Delete category mutation
  const deleteCategoryMutation = useMutation({
    mutationFn: deleteServiceCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serviceCategories'] });
      // If current page becomes empty, go to previous page
      if (filteredCategories.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    },
    onError: (error: any) => {
      console.error('Error deleting service category:', error);
      alert(error?.response?.data?.message || 'Failed to delete service category. Please try again.');
    },
  });

  // Extract categories and pagination from API response
  const categories: ServiceCategory[] = categoriesData?.data?.data || [];
  const pagination = categoriesData?.data || {
    current_page: currentPage,
    last_page: 1,
    per_page: perPage,
    total: categories.length,
  };

  const handleAddNewCategory = () => {
    setEditingCategory(null);
    setIsCategoryModalOpen(true);
  };

  const handleEditCategory = (category: ServiceCategory) => {
    setEditingCategory(category);
    setIsCategoryModalOpen(true);
  };

  const handleDeleteCategory = async (category: ServiceCategory) => {
    if (window.confirm(`Are you sure you want to delete "${category.title}"?`)) {
      deleteCategoryMutation.mutate(category.id);
    }
  };

  const handleSaveCategory = (categoryData: { title: string; image?: File | null; is_active?: boolean }) => {
    // Validate title
    const trimmedTitle = categoryData.title?.trim() || '';
    if (!trimmedTitle) {
      alert('Please enter a category title');
      return;
    }

    const formData = new FormData();
    
    // Always append title (required field) - ensure it's a non-empty string
    formData.append('title', trimmedTitle);
    
    // Append image only if a new file is selected
    if (categoryData.image) {
      formData.append('image', categoryData.image);
    }
    
    // Always append is_active status
    const isActive = categoryData.is_active !== undefined ? categoryData.is_active : true;
    formData.append('is_active', isActive.toString());

    // Debug: Log FormData contents
    console.log('FormData contents:');
    console.log('Title:', trimmedTitle);
    console.log('Image:', categoryData.image ? `File: ${categoryData.image.name}` : 'No new image');
    console.log('Is Active:', isActive);
    console.log('Is Editing:', !!editingCategory);
    if (editingCategory) {
      console.log('Editing Category ID:', editingCategory.id);
    }

    // Verify FormData has title before sending
    if (!formData.has('title') || !formData.get('title')) {
      console.error('ERROR: Title is missing from FormData!');
      alert('Error: Title field is missing. Please try again.');
      return;
    }

    if (editingCategory) {
      updateCategoryMutation.mutate({ id: editingCategory.id, data: formData });
    } else {
      createCategoryMutation.mutate(formData);
    }
  };

  const handleCloseModal = () => {
    setIsCategoryModalOpen(false);
    setEditingCategory(null);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Filter categories based on search term
  const filteredCategories = useMemo(() => {
    return categories.filter(
      (category) =>
        !searchTerm.trim() || category.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [categories, searchTerm]);

  // Reset to page 1 when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, isActiveFilter]);

  const CustomHeader = () => (
    <div className="flex items-center justify-between p-6 bg-white border-b border-t border-[#787878]">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

      <div className="flex items-center gap-3">
        {/* Main Tabs Group */}
        <div className="flex items-center bg-white border border-gray-300 rounded-lg p-2 overflow-x-auto">
          {["General", "Admin Management", "Categories", "Service Categories", "Brands", "FAQs", "Knowledge Base", "Terms"].map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer whitespace-nowrap ${
                  isActive ? "bg-[#E53E3E] text-white" : "text-gray-700 hover:text-gray-900"
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* This Week Dropdown - Separate */}
        <div className="relative">
          <div className="bg-white border border-gray-300 rounded-lg">
            <button
              onClick={() => setIsThisWeekDropdownOpen(!isThisWeekDropdownOpen)}
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
              {["This Week", "Last Week", "This Month", "Last Month"].map((option) => (
                <button
                  key={option}
                  onClick={() => {
                    setIsThisWeekDropdownOpen(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg"
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <CustomHeader />
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto space-y-4">
          {/* Service Categories Tab Content */}
          {activeTab === "Service Categories" && (
            <>
              {/* Top Section: Search, Filter, and Add Button */}
              <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                {/* Search Bar */}
                <div className="relative w-full sm:w-auto">
                  <input
                    type="text"
                    placeholder="Search service categories..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="pl-12 pr-6 py-3 border border-gray-300 rounded-lg text-sm w-full sm:w-[300px] focus:outline-none bg-white shadow-sm placeholder-gray-400"
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

                <div className="flex items-center gap-3">
                  {/* Active Status Filter */}
                  <select
                    value={isActiveFilter === undefined ? "all" : isActiveFilter ? "active" : "inactive"}
                    onChange={(e) => {
                      const value = e.target.value;
                      setIsActiveFilter(value === "all" ? undefined : value === "active");
                    }}
                    className="px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none bg-white shadow-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>

                  {/* Add New Category Button */}
                  <button
                    onClick={handleAddNewCategory}
                    className="px-6 py-3.5 bg-[#E53E3E] text-white font-medium rounded-lg hover:bg-[#D32F2F] cursor-pointer transition-colors whitespace-nowrap"
                  >
                    Add New Service Category
                  </button>
                </div>
              </div>

              {isLoading ? (
                <div className="text-center py-8">
                  <div className="text-lg">Loading service categories...</div>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <div className="text-lg text-red-600">Error loading service categories. Please try again.</div>
                </div>
              ) : filteredCategories.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-lg text-gray-500">No service categories found.</div>
                </div>
              ) : (
                <>
                  {filteredCategories.map((category) => (
                    <div
                      key={category.id}
                      className="bg-white rounded-2xl border border-gray-200 px-6 py-4 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-4">
                        {/* Category Image */}
                        <div className="w-[60px] h-[60px] rounded-2xl overflow-hidden bg-gray-100 flex items-center justify-center border border-gray-200 flex-shrink-0">
                          {category.image_url ? (
                            <img
                              src={category.image_url}
                              alt={category.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "/assets/layout/icon.png";
                              }}
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                              <svg
                                className="w-8 h-8 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                            </div>
                          )}
                        </div>

                        {/* Category Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-lg font-semibold text-gray-900 truncate">{category.title}</h3>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                category.is_active
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {category.is_active ? "Active" : "Inactive"}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            {category.services_count !== undefined && (
                              <span>{category.services_count} services</span>
                            )}
                            <span>Created: {new Date(category.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditCategory(category)}
                            className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(category)}
                            className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                            disabled={deleteCategoryMutation.isPending}
                          >
                            {deleteCategoryMutation.isPending ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Pagination */}
                  {pagination.last_page > 1 && (
                    <div className="flex items-center justify-between mt-6 bg-white px-6 py-4 rounded-lg border border-gray-200">
                      <div className="text-sm text-gray-700">
                        Showing {pagination.from || 0} to {pagination.to || 0} of {pagination.total} results
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setCurrentPage(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Previous
                        </button>
                        <span className="px-4 py-2 text-sm font-medium text-gray-700">
                          Page {pagination.current_page} of {pagination.last_page}
                        </span>
                        <button
                          onClick={() => setCurrentPage(currentPage + 1)}
                          disabled={currentPage === pagination.last_page}
                          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Service Category Modal */}
      <ServiceCategoryModal
        isOpen={isCategoryModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveCategory}
        editingCategory={editingCategory}
        isSaving={createCategoryMutation.isPending || updateCategoryMutation.isPending}
      />
    </>
  );
};

export default ServiceCategories;

