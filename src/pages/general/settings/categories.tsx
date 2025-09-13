import React, { useState, useEffect } from "react";
interface SubSubcategory {
  id: string;
  name: string;
  image: string;
}

interface Subcategory {
  id: string;
  name: string;
  image: string;
  items?: SubSubcategory[];
}

interface Category {
  id: string;
  name: string;
  image: string;
  subcategoriesCount: number;
  brandsCount: number;
  subcategories?: Subcategory[];
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
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [openDropdowns, setOpenDropdowns] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([
    {
      id: "1",
      name: "Mobile Phone & Tablet",
      image: "/assets/layout/iphone.png",
      subcategoriesCount: 5,
      brandsCount: 10,
      subcategories: [
        {
          id: "1-1",
          name: "Mobile Phones",
          image: "/assets/layout/iphone.png",
          items: [
            { id: "1-1-1", name: "Smartphones", image: "/assets/layout/iphone.png" },
            { id: "1-1-2", name: "Feature phones", image: "/assets/layout/iphone.png" },
            { id: "1-1-3", name: "Faxes", image: "/assets/layout/iphone.png" }
          ]
        },
        {
          id: "1-2",
          name: "Tablets",
          image: "/assets/layout/itable.png",
          items: [
            { id: "1-2-1", name: "Kids tablets", image: "/assets/layout/itable.png" },
            { id: "1-2-2", name: "iPad", image: "/assets/layout/itable.png" }
          ]
        }
      ]
    },
    {
      id: "2",
      name: "Electronics",
      image: "/assets/layout/elec.svg",
      subcategoriesCount: 8,
      brandsCount: 15,
      subcategories: []
    },
    {
      id: "3",
      name: "Fashion",
      image: "/assets/layout/fashion.svg",
      subcategoriesCount: 12,
      brandsCount: 25,
      subcategories: []
    },
    {
      id: "4",
      name: "Sport",
      image: "/assets/layout/sports.svg",
      subcategoriesCount: 6,
      brandsCount: 12,
      subcategories: []
    },
    {
      id: "5",
      name: "Health & Beauty",
      image: "/assets/layout/health.svg",
      subcategoriesCount: 9,
      brandsCount: 18,
      subcategories: []
    },
  ]);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const toggleDropdown = (itemId: string) => {
    setOpenDropdowns(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setOpenDropdowns([]);
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleCategoryNameChange = (categoryId: string, newName: string) => {
    setCategories(prev => 
      prev.map(cat => 
        cat.id === categoryId ? { ...cat, name: newName } : cat
      )
    );
  };

  const handleDeleteCategory = (categoryId: string) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      setCategories(prev => prev.filter(cat => cat.id !== categoryId));
    }
  };

  const handleAddNewCategory = () => {
    console.log("Add New Category clicked");
    // Add your add new category logic here
  };

  const handleSaveChanges = () => {
    console.log("Save Changes clicked");
    // Add your save changes logic here
  };

  const CustomHeader = () => (
    <div className="flex items-center justify-between p-6 bg-white border-b border-t border-[#787878]">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
      
      <div className="flex items-center gap-3">
        {/* Main Tabs Group */}
        <div className="flex items-center bg-white border border-gray-300 rounded-lg p-2">
          {["General", "Admin Management", "Categories", "FAQs"].map((tab) => {
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
          {categories.map((category) => (
            <div key={category.id} className="space-y-0">
              {/* Main Category */}
              <div className="bg-white rounded-2xl border border-gray-200 px-6 py-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  {/* Category Image */}
                  <div className="w-[60px] h-[60px] rounded-2xl overflow-hidden bg-gray-100 flex items-center justify-center border border-gray-200 flex-shrink-0">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover cursor-pointer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/assets/layout/icon.png";
                      }}
                    />
                  </div>
                  
                  {/* Category Name Input Field */}
                  <div className="flex-1 max-w-[400px]">
                    <input
                      type="text"
                      value={category.name}
                      onChange={(e) => handleCategoryNameChange(category.id, e.target.value)}
                      className="w-full px-4 py-3 border cursor-pointer border-gray-300 rounded-lg text-[16px] font-medium text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#E53E3E] focus:border-transparent"
                    />
                  </div>

                  {/* Action Buttons Section */}
                  <div className="flex items-center gap-3 ml-auto">
                    {/* Delete Button */}
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="p-2 cursor-pointer text-gray-400 hover:text-red-500  rounded-lg transition-colors"
                    >
                     <img src="/public/assets/layout/trash2.svg" alt="Delete" className="w-10 h-10 " />
                    </button>

                    {/* Add Subcategory Button */}
                    <button
                      onClick={() => toggleCategory(category.id)}
                      className="px-4 py-3 cursor-pointer bg-[#E53E3E] text-white text-sm font-medium rounded-lg hover:bg-[#D32F2F] transition-colors"
                    >
                      Add Subcategory
                    </button>

                    {/* Add Brand Dropdown */}
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleDropdown(category.id);
                        }}
                        className="px-4 py-3 cursor-pointer bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
                      >
                        Add Brand
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      
                      {openDropdowns.includes(category.id) && (
                        <div className="absolute right-0 top-full mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                          <div className="py-1">
                            <button className="w-full cursor-pointer px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                              Brand Option 1
                            </button>
                            <button className="w-full cursor-pointer px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                              Brand Option 2
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Expand/Collapse Dropdown */}
                    <div className="relative">
                      <button 
                        onClick={() => toggleCategory(category.id)}
                        className="p-2 text-gray-400 hover:text-gray-600  rounded-lg transition-colors cursor-pointer"
                      >
                        <svg 
                          className={`w-5 h-5 transition-transform duration-200 ${
                            expandedCategories.includes(category.id) ? "rotate-180" : ""
                          }`} 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Subcategories - Expanded View */}
              {expandedCategories.includes(category.id) && category.subcategories && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm mt-4 p-6">
                  <div className="space-y-6">
                    {category.subcategories.map((subcategory) => (
                      <div key={subcategory.id} className="space-y-4">
                        {/* Subcategory Header */}
                        <div className="bg-white rounded-2xl border border-[#ADADAD] px-6 py-4">
                          <div className="flex items-center gap-4">
                            {/* Subcategory Name */}
                            <div className="flex-1">
                              <span className="text-base font-medium text-gray-900">{subcategory.name}</span>
                            </div>

                            {/* Subcategory Actions */}
                            <div className="flex items-center gap-3">
                              {/* Delete Button */}
                              <button className="p-2 text-gray-400 hover:text-red-500 cursor-pointer rounded-lg transition-colors">
                               <img src="/public/assets/layout/trash2.svg" alt="Delete" className="w-10 h-10 " />
                              </button>

                              {/* Add Brand Dropdown for Subcategory */}
                              <div className="relative">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleDropdown(`sub-${subcategory.id}`);
                                  }}
                                  className="px-4 py-3 bg-black cursor-pointer text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
                                >
                                  Add Brand
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                </button>
                                
                                {openDropdowns.includes(`sub-${subcategory.id}`) && (
                                  <div className="absolute right-0 top-full mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                                    <div className="py-1">
                                      <button className="w-full px-4 py-2 cursor-pointer text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                                        Brand Option 1
                                      </button>
                                      <button className="w-full px-4 py-2 cursor-pointer text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                                        Brand Option 2
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Sub-subcategories */}
                        {subcategory.items && (
                          <div className="space-y-3  w-[1050px]  ml-12">
                            {subcategory.items.map((item) => (
                              <div key={item.id} className="bg-white rounded-xl  px-4 py-3">
                                <div className="flex items-center gap-4">
                                  {/* Sub-subcategory Image */}
                                  <div className="w-[50px] h-[50px] rounded-lg overflow-hidden bg-white flex items-center justify-center border border-gray-200 flex-shrink-0">
                                    <img
                                      src="/public/assets/layout/phone.svg"
                                      alt={item.name}
                                      className="w-full h-full object-cover cursor-pointer"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).src = "/assets/layout/icon.png";
                                      }}
                                    />
                                  </div>
                                  
                                  {/* Sub-subcategory Name Input Field */}
                                  <div className="flex-1">
                                    <input
                                      type="text"
                                      defaultValue={item.name}
                                      className="w-[466px]  px-4 py-3 border border-gray-300 rounded-lg text-base font-medium text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                  </div>
                                  
                                  {/* Delete button for sub-subcategory */}
                                  <div className="flex items-center  gap-3">
                                    <button className="p-2 text-gray-400 hover:text-red-500 cursor-pointer rounded-lg transition-colors">
                                     <img src="/public/assets/layout/trash2.svg" alt="Delete" className="w-10 h-10" />
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
          ))}

          {/* Bottom Action Buttons */}
          <div className="flex items-center justify-between pt-6">
            <button
              onClick={handleAddNewCategory}
              className="px-6 py-3.5 bg-[#E53E3E] text-white font-medium rounded-lg hover:bg-[#D32F2F] cursor-pointer transition-colors"
            >
              Add New Category
            </button>

            <button
              onClick={handleSaveChanges}
              className="px-6 py-3.5 bg-black text-white font-medium rounded-lg hover:bg-gray-800 cursor-pointer transition-colors"
            >
              Save Changes
            </button>
          </div>
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
    </>
  );
};

export default Categories;
