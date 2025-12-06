import React, { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCategories, createCategory, updateCategory, deleteCategory } from "../../../../utils/queries/users";
import CategoryModal from "./categoryModal";
interface Category {
  id: number;
  parent_id: number | null;
  title: string;
  image: string;
  color: string;
  products_count: number;
  image_url: string;
  children: Category[];
  created_at: string;
  updated_at: string;
}

interface CategoriesProps {
  onBack?: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isThisWeekDropdownOpen: boolean;
  setIsThisWeekDropdownOpen: (open: boolean) => void;
}

const Categories: React.FC<CategoriesProps> = ({
  activeTab,
  setActiveTab,
  isThisWeekDropdownOpen,
  setIsThisWeekDropdownOpen
}) => {
  const [expandedCategories, setExpandedCategories] = useState<number[]>([]);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 15;

  const queryClient = useQueryClient();

  // Fetch categories with pagination
  const { data: categoriesData, isLoading, error } = useQuery({
    queryKey: ['categories', currentPage],
    queryFn: () => getCategories(currentPage, perPage),
    staleTime: 5 * 60 * 1000, // 5 minutes
    keepPreviousData: true,
  });

  // Create category mutation
  const createCategoryMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setIsCategoryModalOpen(false);
      // Reset to first page after creating
      setCurrentPage(1);
    },
    onError: (error) => {
      console.error('Error creating category:', error);
      alert('Failed to create category. Please try again.');
    },
  });

  // Update category mutation
  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: FormData }) => updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setIsCategoryModalOpen(false);
      setEditingCategory(null);
    },
    onError: (error) => {
      console.error('Error updating category:', error);
      alert('Failed to update category. Please try again.');
    },
  });

  // Delete category mutation
  const deleteCategoryMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      // If current page becomes empty, go to previous page
      if (filteredCategories.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    },
    onError: (error) => {
      console.error('Error deleting category:', error);
      alert('Failed to delete category. Please try again.');
    },
  });

  // Extract categories and pagination from API response
  // Handle both paginated and non-paginated responses
  const categories: Category[] = categoriesData?.data?.data || categoriesData?.data?.categories || categoriesData?.data || [];
  const pagination = categoriesData?.data?.pagination || {
    current_page: currentPage,
    last_page: 1,
    per_page: perPage,
    total: categories.length,
  };

  const toggleCategory = (categoryId: number) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };


  const handleAddNewCategory = () => {
    setEditingCategory(null);
    setIsCategoryModalOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setIsCategoryModalOpen(true);
  };

  const handleDeleteCategory = async (category: Category) => {
    if (window.confirm(`Are you sure you want to delete "${category.title}"?`)) {
      deleteCategoryMutation.mutate(category.id);
    }
  };

  const handleSaveCategory = (categoryData: {
    title: string;
    image?: File | null;
    color: string;
    parent_id?: number | null;
  }) => {
    const formData = new FormData();
    formData.append('title', categoryData.title);
    formData.append('color', categoryData.color);
    if (categoryData.parent_id) {
      formData.append('parent_id', categoryData.parent_id.toString());
    }
    if (categoryData.image) {
      formData.append('image', categoryData.image);
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setSearchTerm((e.target as any).value);
  };

  // Filter categories based on search term
  const filteredCategories = useMemo(() => {
    return categories.filter(category =>
      !searchTerm.trim() ||
      category.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [categories, searchTerm]);

  // Client-side pagination for filtered results (if API doesn't support search)
  // If API supports search, we can remove this and use server-side pagination
  const paginatedCategories = useMemo(() => {
    // If we have server-side pagination, use filteredCategories directly
    // Otherwise, paginate client-side
    const startIndex = (currentPage - 1) * perPage;
    const endIndex = startIndex + perPage;
    return filteredCategories.slice(startIndex, endIndex);
  }, [filteredCategories, currentPage, perPage]);

  // Calculate pagination info
  const totalPages = Math.ceil(filteredCategories.length / perPage);
  const displayPagination = {
    current_page: currentPage,
    last_page: totalPages,
    per_page: perPage,
    total: filteredCategories.length,
  };

  // Reset to page 1 when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const CustomHeader = () => (
    <div className="flex items-center justify-between p-6 bg-white border-b border-t border-[#787878]">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

      <div className="flex items-center gap-3">
        {/* Main Tabs Group */}
        <div className="flex items-center bg-white border border-gray-300 rounded-lg p-2 overflow-x-auto">
          {["General", "Admin Management", "Categories", "Brands", "FAQs", "Knowledge Base", "Terms"].map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer whitespace-nowrap ${isActive
                    ? "bg-[#E53E3E] text-white"
                    : "text-gray-700 hover:text-gray-900"
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
              <span className="cursor-pointer" >This Week</span>
              <svg
                className={`w-4 h-4 ml-2 transition-transform duration-200 ${isThisWeekDropdownOpen ? "rotate-180" : ""
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
        </div
        >
      </div>
    </div>
  );

  return (
    <>
      <CustomHeader />
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto space-y-4">

          {/* General Tab Content */}
          {activeTab === "General" && (
            <div className="mt-8 bg-white border border-gray-300 rounded-2xl p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">General Settings</h2>
              <p className="text-gray-600">General settings will be implemented here.</p>
            </div>
          )}

          {/* Admin Management Tab Content */}
          {activeTab === "Admin Management" && (
            <div className="mt-8 bg-white border border-gray-300 rounded-2xl p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Admin Management</h2>
              <p className="text-gray-600">Admin management will be implemented here.</p>
            </div>
          )}

          {/* Categories Tab Content */}
          {activeTab === "Categories" && (
            <>
              {/* Top Section: Search and Add Button */}
              <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                {/* Search Bar */}
                <div className="relative w-full sm:w-auto">
                  <input
                    type="text"
                    placeholder="Search categories..."
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
                
                {/* Add New Category Button */}
                <button
                  onClick={handleAddNewCategory}
                  className="px-6 py-3.5 bg-[#E53E3E] text-white font-medium rounded-lg hover:bg-[#D32F2F] cursor-pointer transition-colors whitespace-nowrap w-full sm:w-auto"
                >
                  Add New Category
                </button>
              </div>

              {isLoading ? (
                <div className="text-center py-8">
                  <div className="text-lg">Loading categories...</div>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <div className="text-lg text-red-600">Error loading categories. Please try again.</div>
                </div>
              ) : (
                paginatedCategories.map((category) => (
                  <div key={category.id} className="space-y-0">
                    {/* Main Category */}
                    <div className="bg-white rounded-2xl border border-gray-200 px-6 py-4 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-4">
                        {/* Category Image */}
                        <div className="w-[60px] h-[60px] rounded-2xl overflow-hidden bg-gray-100 flex items-center justify-center border border-gray-200 flex-shrink-0">
                          <img
                            src={category.image_url}
                            alt={category.title}
                            className="w-full h-full object-cover cursor-pointer"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/assets/layout/icon.png";
                            }}
                          />
                        </div>

                        {/* Category Name Display */}
                        <div className="flex-1 max-w-[400px]">
                          <div className="px-4 py-3 border border-gray-300 rounded-lg text-[16px] font-medium text-gray-900 bg-white">
                            {category.title}
                          </div>
                        </div>

                        {/* Action Buttons Section */}
                        <div className="flex items-center gap-3 ml-auto">
                          {/* Edit Button */}
                          <button
                            onClick={() => handleEditCategory(category)}
                            className="p-2 cursor-pointer text-gray-400 hover:text-blue-500 rounded-lg transition-colors"
                            title="Edit Category"
                          >
                            <img src="/public/assets/layout/edit1.svg" alt="Edit" className="w-6 h-6" />
                          </button>



                          {/* Add Subcategory Button */}
                          <button
                            onClick={() => {
                              setEditingCategory({ ...category, parent_id: category.id } as Category);
                              setIsCategoryModalOpen(true);
                            }}
                            className="px-4 py-3 cursor-pointer bg-[#E53E3E] text-white text-sm font-medium rounded-lg hover:bg-[#D32F2F] transition-colors"
                          >
                            Add Subcategory
                          </button>

                          {/* Expand/Collapse Button */}
                          {category.children && category.children.length > 0 && (
                            <button
                              onClick={() => toggleCategory(category.id)}
                              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors cursor-pointer"
                              title="Toggle Subcategories"
                            >
                              <svg
                                className={`w-5 h-5 transition-transform duration-200 ${expandedCategories.includes(category.id) ? "rotate-180" : ""
                                  }`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Subcategories - Expanded View */}
                    {expandedCategories.includes(category.id) && category.children && category.children.length > 0 && (
                      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm mt-4 p-6">
                        <div className="space-y-6">
                          {category.children.map((subcategory) => (
                            <div key={subcategory.id} className="space-y-4">
                              {/* Subcategory Header */}
                              <div className="bg-white rounded-2xl border border-[#ADADAD] px-6 py-4">
                                <div className="flex items-center gap-4">
                                  {/* Subcategory Image */}
                                  <div className="w-[50px] h-[50px] rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center border border-gray-200 flex-shrink-0">
                                    <img
                                      src={subcategory.image_url}
                                      alt={subcategory.title}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).src = "/assets/layout/icon.png";
                                      }}
                                    />
                                  </div>

                                  {/* Subcategory Name */}
                                  <div className="flex-1">
                                    <span className="text-base font-medium text-gray-900">{subcategory.title}</span>
                                    <div className="text-sm text-gray-500">Products: {subcategory.products_count}</div>
                                  </div>

                                  {/* Subcategory Actions */}
                                  <div className="flex items-center gap-3">
                                    {/* Edit Button */}
                                    <button
                                      onClick={() => handleEditCategory(subcategory)}
                                      className="p-2 text-gray-400 hover:text-blue-500 cursor-pointer rounded-lg transition-colors"
                                      title="Edit Subcategory"
                                    >
                                      <img src="/public/assets/layout/edit1.svg" alt="Edit" className="w-5 h-5" />
                                    </button>


                                    {/* Add Sub-subcategory Button */}
                                    <button
                                      onClick={() => {
                                        setEditingCategory({ ...subcategory, parent_id: subcategory.id } as Category);
                                        setIsCategoryModalOpen(true);
                                      }}
                                      className="px-3 py-2 bg-[#E53E3E] cursor-pointer text-white text-xs font-medium rounded-lg hover:bg-[#D32F2F] transition-colors"
                                    >
                                      Add Sub-subcategory
                                    </button>
                                  </div>
                                </div>
                              </div>

                              {/* Sub-subcategories */}
                              {subcategory.children && subcategory.children.length > 0 && (
                                <div className="space-y-3 ml-12">
                                  {subcategory.children.map((subSubcategory) => (
                                    <div key={subSubcategory.id} className="bg-white rounded-xl px-4 py-3 border border-gray-200">
                                      <div className="flex items-center gap-4">
                                        {/* Sub-subcategory Image */}
                                        <div className="w-[40px] h-[40px] rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center border border-gray-200 flex-shrink-0">
                                          <img
                                            src={subSubcategory.image_url}
                                            alt={subSubcategory.title}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                              (e.target as HTMLImageElement).src = "/assets/layout/icon.png";
                                            }}
                                          />
                                        </div>

                                        {/* Sub-subcategory Name */}
                                        <div className="flex-1">
                                          <span className="text-sm font-medium text-gray-900">{subSubcategory.title}</span>
                                          <div className="text-xs text-gray-500">Products: {subSubcategory.products_count}</div>
                                        </div>

                                        {/* Actions for sub-subcategory */}
                                        <div className="flex items-center gap-2">
                                          <button
                                            onClick={() => handleEditCategory(subSubcategory)}
                                            className="p-1 text-gray-400 hover:text-blue-500 cursor-pointer rounded transition-colors"
                                            title="Edit"
                                          >
                                            <img src="/public/assets/layout/edit1.svg" alt="Edit" className="w-4 h-4" />
                                          </button>
                                          <button
                                            onClick={() => handleDeleteCategory(subSubcategory)}
                                            className="p-1 text-gray-400 hover:text-red-500 cursor-pointer rounded transition-colors"
                                            title="Delete"
                                          >
                                            <img src="/public/assets/layout/trash2.svg" alt="Delete" className="w-4 h-4" />
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}

              {/* Pagination */}
              {displayPagination && displayPagination.last_page > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-gray-200">
                  <div className="text-sm text-gray-700 text-center sm:text-left">
                    Showing {((displayPagination.current_page - 1) * displayPagination.per_page) + 1} to{' '}
                    {Math.min(displayPagination.current_page * displayPagination.per_page, displayPagination.total)} of{' '}
                    {displayPagination.total} results
                  </div>
                  <div className="flex items-center space-x-1 sm:space-x-2 flex-wrap justify-center">
                    <button
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage <= 1}
                      className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <span className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm">
                      Page {displayPagination.current_page} of {displayPagination.last_page}
                    </span>
                    <button
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage >= displayPagination.last_page}
                      className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* FAQs Tab Content */}
          {activeTab === "FAQs" && (
            <div className="mt-8 bg-white border border-gray-300 rounded-2xl p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">FAQs</h2>
              <p className="text-gray-600">FAQ content will be implemented here.</p>
            </div>
          )}
        </div>
      </div>

      {/* Category Modal */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveCategory}
        editingCategory={editingCategory}
        parentCategories={categories.filter(cat => !cat.parent_id)} // Only top-level categories can be parents
      />
    </>
  );
};

export default Categories;
