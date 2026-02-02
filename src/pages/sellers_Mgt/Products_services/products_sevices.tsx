import { useState, useEffect, useRef } from "react";
import images from "../../../constants/images";
import BulkActionDropdown from "../../../components/BulkActionDropdown";
import ProductsTable from "./components/productsTable";
import AddNewProduct from "../Modals/addNewProduct";
import ServiceModal from "../Modals/serviceModal";
import ServicesTable from "./components/servicesTable";
import PageHeader from "../../../components/PageHeader";
import StoreSelectionModal from "../Modals/storeSelectionModal";
import { useQuery } from "@tanstack/react-query";
import { getAdminProducts, getAdminServices } from "../../../utils/queries/users";
import { apiCall } from "../../../utils/customApiCall";
import { API_ENDPOINTS } from "../../../config/apiConfig";
import Cookies from "js-cookie";
import { filterByPeriod } from "../../../utils/periodFilter";

function useDebouncedValue<T>(value: T, delay = 450) {
  const [debounced, setDebounced] = useState<T>(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

const Products_Services = () => {
  const [activeTab, setActiveTab] = useState<"All" | "General" | "Sponsored">(
    "All"
  );
  const tabs: Array<"All" | "General" | "Sponsored"> = [
    "All",
    "General",
    "Sponsored",
  ];

  const [showModal, setShowModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showStoreSelectionModal, setShowStoreSelectionModal] = useState(false);
  const [selectedStore, setSelectedStore] = useState<{id: number; store_name: string; profile_image: string | null; banner_image: string | null; owner_name: string | null; owner_email: string | null} | null>(null);
  const [pendingAction, setPendingAction] = useState<'product' | 'service' | null>(null);
  const [selectedProductType, setSelectedProductType] = useState<
    "Products" | "Services"
  >("Products");

  // search
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 450);
  const [currentPage, setCurrentPage] = useState(1);

  // Date filter - synchronized with PageHeader
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>("All time");
  const [isDateFilterOpen, setIsDateFilterOpen] = useState(false);
  const dateFilterRef = useRef<HTMLDivElement>(null);
  
  // Date period options matching PageHeader
  const datePeriodOptions = [
    "Today",
    "This Week",
    "Last Month",
    "Last 6 Months",
    "Last Year",
    "All time",
  ];

  // Category filter
  const [selectedCategory, setSelectedCategory] = useState<string>("All Categories");
  const [isCategoryFilterOpen, setIsCategoryFilterOpen] = useState(false);
  const categoryFilterRef = useRef<HTMLDivElement>(null);

  // Fetch categories - API returns nested structure with children
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const token = Cookies.get('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }
      const response = await apiCall(API_ENDPOINTS.CATEGORIES.List, 'GET', undefined, token);
      return response;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Flatten nested categories to show all categories (parent + children) in dropdown
  const flattenCategories = (categories: any[]): any[] => {
    const flattened: any[] = [];
    categories.forEach((category) => {
      // Add parent category
      flattened.push({
        id: category.id,
        title: category.title,
        parent_id: category.parent_id,
      });
      // Add children if they exist
      if (category.children && category.children.length > 0) {
        category.children.forEach((child: any) => {
          flattened.push({
            id: child.id,
            title: child.title,
            parent_id: child.parent_id,
          });
          // Add grandchildren if they exist
          if (child.children && child.children.length > 0) {
            child.children.forEach((grandchild: any) => {
              flattened.push({
                id: grandchild.id,
                title: grandchild.title,
                parent_id: grandchild.parent_id,
              });
            });
          }
        });
      }
    });
    return flattened;
  };

  // Extract and flatten categories from API response
  const allCategories = categoriesData?.data || [];
  const categories = flattenCategories(allCategories);

  // API data fetching for products
  const { data: productsData, isLoading: productsLoading, error: productsError } = useQuery({
    queryKey: ['adminProducts', activeTab, currentPage, selectedCategory, debouncedSearch],
    queryFn: () => getAdminProducts(
      currentPage, 
      activeTab === "All" ? undefined : activeTab.toLowerCase(), 
      debouncedSearch && debouncedSearch.trim() ? debouncedSearch.trim() : undefined
    ),
    placeholderData: (previousData) => previousData,
    enabled: selectedProductType === "Products",
  });

  // API data fetching for services
  const { data: servicesData, isLoading: servicesLoading, error: servicesError } = useQuery({
    queryKey: ['adminServices', activeTab, currentPage, selectedCategory, debouncedSearch],
    queryFn: () => getAdminServices(
      currentPage, 
      activeTab === "All" ? undefined : activeTab.toLowerCase(), 
      debouncedSearch && debouncedSearch.trim() ? debouncedSearch.trim() : undefined
    ),
    placeholderData: (previousData) => previousData,
    enabled: selectedProductType === "Services",
  });

  // Extract data with null checks
  const products = productsData?.data?.products || [];
  const productsStatistics = productsData?.data?.statistics || {};
  const productsPagination = productsData?.data?.pagination;

  const services = servicesData?.data?.services || [];
  const servicesStatistics = servicesData?.data?.statistics || {};
  const servicesPagination = servicesData?.data?.pagination;

  // Debug: Log product structure to understand category fields (development only)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && products.length > 0) {
      console.log("Products Data Structure:", {
        totalProducts: products.length,
        sampleProduct: products[0],
        allProductKeys: products[0] ? Object.keys(products[0]) : [],
        productsWithCategory: products.filter(p => p.category || p.category_id || p.category_name).length,
      });
    }
  }, [products]);

  // Use current data based on selected type
  const currentData = selectedProductType === "Products" ? products : services;
  const currentStatistics = selectedProductType === "Products" ? productsStatistics : servicesStatistics;
  const currentPagination = selectedProductType === "Products" ? productsPagination : servicesPagination;
  const isLoading = selectedProductType === "Products" ? productsLoading : servicesLoading;
  const error = selectedProductType === "Products" ? productsError : servicesError;

  // Handler functions
  const handlePageChange = (page: number) => {
    if (page !== currentPage) setCurrentPage(page);
  };

  // Reset to page 1 when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  const handleBulkActionSelect = (action: string) => {
    console.log("Bulk action selected:", action);
  };

  // Store selection handlers
  const handleAddProductClick = () => {
    setPendingAction('product');
    setShowStoreSelectionModal(true);
  };

  const handleAddServiceClick = () => {
    setPendingAction('service');
    setShowStoreSelectionModal(true);
  };

  const handleStoreSelect = (store: {id: number; store_name: string; profile_image: string | null; banner_image: string | null; owner_name: string | null; owner_email: string | null}) => {
    setSelectedStore(store);
    if (pendingAction === 'product') {
      setShowModal(true);
    } else if (pendingAction === 'service') {
      setShowServiceModal(true);
    }
    setPendingAction(null);
  };

  const handleCloseStoreSelection = () => {
    setShowStoreSelectionModal(false);
    setPendingAction(null);
  };

  interface ProductsDropdownProps {
    onProductSelect?: (product: "Products" | "Services") => void;
  }

  const ProductsDropdown: React.FC<ProductsDropdownProps> = ({
    onProductSelect,
  }) => {
    const [isProductsDropdownOpen, setIsProductsDropdownOpen] = useState(false);
    const products: Array<"Products" | "Services"> = ["Products", "Services"];

    return (
      <div className="relative inline-block text-left">
        <div
          className="flex flex-row justify-center items-center px-2.5 py-3.5 border border-[#989898] text-black bg-white rounded-lg cursor-pointer"
          onClick={() => setIsProductsDropdownOpen((s) => !s)}
        >
          <span className="cursor-pointer">{selectedProductType}</span>
          <img className="w-4 h-4 ml-5" src={images.dropdown} alt="" />
        </div>

        {isProductsDropdownOpen && (
          <div className="absolute z-10 mt-2 w-35 bg-white border border-gray-200 font-semibold rounded-2xl shadow-lg">
            {products.map((product) => (
              <button
                key={product}
                onClick={() => {
                  setSelectedProductType(product);
                  setIsProductsDropdownOpen(false);
                  onProductSelect?.(product);
                }}
                className={`block w-full text-left px-4 py-2 text-sm ${
                  product === selectedProductType
                    ? "text-[#E53E3E] bg-gray-50"
                    : "text-black"
                } cursor-pointer hover:bg-gray-50`}
              >
                {product}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  const handleProductSelect = (product: "Products" | "Services") => {
    setSelectedProductType(product);
    setCurrentPage(1); // Reset page when switching product type
    // Reset category filter when switching to Services
    if (product === "Services") {
      setSelectedCategory("All Categories");
      setIsCategoryFilterOpen(false);
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dateFilterRef.current && !dateFilterRef.current.contains(event.target as Node)) {
        setIsDateFilterOpen(false);
      }
      if (categoryFilterRef.current && !categoryFilterRef.current.contains(event.target as Node)) {
        setIsCategoryFilterOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handler for PageHeader period change
  const handlePageHeaderPeriodChange = (period: string) => {
    setSelectedDateFilter(period);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  // Helper function to filter by category
  const filterByCategory = (items: any[], categoryFilter: string) => {
    if (categoryFilter === "All Categories") return items;
    
    // Find the selected category from our flattened categories list
    const selectedCategoryObj = categories.find(cat => cat.title === categoryFilter);
    if (!selectedCategoryObj) {
      console.warn("Selected category not found:", categoryFilter);
      return items; // If category not found, return all items
    }
    
    // Collect all related category IDs (selected category + its children + its parent)
    const relatedCategoryIds = new Set<number>([selectedCategoryObj.id]);
    
    // Add all children of selected category (including nested children)
    const addChildren = (parentId: number) => {
      categories.forEach(cat => {
        if (cat.parent_id === parentId) {
          relatedCategoryIds.add(cat.id);
          addChildren(cat.id); // Recursively add grandchildren
        }
      });
    };
    addChildren(selectedCategoryObj.id);
    
    // Add parent if selected is a child
    if (selectedCategoryObj.parent_id) {
      relatedCategoryIds.add(selectedCategoryObj.parent_id);
    }
    
    // Debug: Log filtering info (only in development)
    if (process.env.NODE_ENV === 'development' && items.length > 0) {
      console.log("Category Filter Debug:", {
        selectedCategory: categoryFilter,
        selectedCategoryId: selectedCategoryObj.id,
        relatedCategoryIds: Array.from(relatedCategoryIds),
        sampleItems: items.slice(0, 3).map(item => ({
          id: item.id,
          name: item.name,
          hasCategory: !!item.category,
          hasCategoryId: !!item.category_id,
          hasCategoryName: !!item.category_name,
          category: item.category,
          category_id: item.category_id,
          category_name: item.category_name,
        })),
        totalItems: items.length,
      });
    }
    
    const filtered = items.filter((item) => {
      let matches = false;
      
      // For products - check if category object exists with title
      if (item.category) {
        const categoryTitle = (item.category.title || item.category.name || "").toLowerCase().trim();
        const filterTitle = categoryFilter.toLowerCase().trim();
        
        // Match by exact title (case-insensitive)
        if (categoryTitle === filterTitle) {
          matches = true;
        }
        // Match by category ID
        else if (item.category.id && relatedCategoryIds.has(item.category.id)) {
          matches = true;
        }
        // Match parent/child relationships
        else if (item.category.parent_id && relatedCategoryIds.has(item.category.parent_id)) {
          matches = true;
        }
        else if (selectedCategoryObj.parent_id && item.category.id === selectedCategoryObj.parent_id) {
          matches = true;
        }
      }
      
      // For products - check category_id field (direct ID) - this is the most common case
      if (!matches && item.category_id !== undefined && item.category_id !== null) {
        const categoryId = typeof item.category_id === 'number' 
          ? item.category_id 
          : parseInt(String(item.category_id));
        if (!isNaN(categoryId)) {
          // First check direct match with selected category
          if (categoryId === selectedCategoryObj.id) {
            matches = true;
          }
          // Then check if it's in related category IDs (children, parent)
          else if (relatedCategoryIds.has(categoryId)) {
            matches = true;
          } 
          // Check if it's a parent/child relationship
          else {
            const itemCategory = categories.find(cat => cat.id === categoryId);
            if (itemCategory) {
              // Check if item's category is a child of selected category
              if (itemCategory.parent_id === selectedCategoryObj.id) {
                matches = true;
              } 
              // Check if selected category is a child of item's category
              else if (selectedCategoryObj.parent_id === itemCategory.id) {
                matches = true;
              }
              // Check if item's category parent matches selected category's parent (siblings)
              else if (itemCategory.parent_id && selectedCategoryObj.parent_id && 
                       itemCategory.parent_id === selectedCategoryObj.parent_id) {
                matches = true;
              }
            }
          }
        }
      }
      
      // For products/services - check if category_name field exists
      if (!matches && item.category_name) {
        const itemCategoryName = String(item.category_name).toLowerCase().trim();
        const filterCategoryName = categoryFilter.toLowerCase().trim();
        
        // Match by exact title (case-insensitive)
        if (itemCategoryName === filterCategoryName) {
          matches = true;
        } 
        // Try partial match (handles singular/plural variations like "Tablet" vs "Tablets")
        else if (itemCategoryName.includes(filterCategoryName) || filterCategoryName.includes(itemCategoryName)) {
          // Verify it's a real match by checking if it's in our categories list
          const matchingCategory = categories.find(cat => {
            const catTitle = cat.title.toLowerCase().trim();
            return catTitle === itemCategoryName || catTitle === filterCategoryName ||
                   catTitle.includes(itemCategoryName) || itemCategoryName.includes(catTitle);
          });
          if (matchingCategory && (matchingCategory.id === selectedCategoryObj.id || relatedCategoryIds.has(matchingCategory.id))) {
            matches = true;
          }
        }
        else {
          // Also try to find the category by name and match by ID
          const itemCategoryByName = categories.find(cat => {
            const catTitle = cat.title.toLowerCase().trim();
            return catTitle === itemCategoryName || 
                   catTitle.includes(itemCategoryName) || 
                   itemCategoryName.includes(catTitle);
          });
          if (itemCategoryByName) {
            // Direct match
            if (itemCategoryByName.id === selectedCategoryObj.id) {
              matches = true;
            }
            // Check if item's category is related to selected category
            else if (relatedCategoryIds.has(itemCategoryByName.id)) {
              matches = true;
            } 
            // Check parent/child relationships
            else if (itemCategoryByName.parent_id && relatedCategoryIds.has(itemCategoryByName.parent_id)) {
              matches = true;
            } 
            else if (selectedCategoryObj.parent_id && itemCategoryByName.id === selectedCategoryObj.parent_id) {
              matches = true;
            }
          }
        }
      }
      
      // Debug: Log items that don't match to understand why (development only)
      if (process.env.NODE_ENV === 'development' && !matches && items.length <= 10) {
        console.log("Item not matched:", {
          itemId: item.id,
          itemName: item.name,
          category: item.category,
          category_id: item.category_id,
          category_name: item.category_name,
          selectedCategory: categoryFilter,
          selectedCategoryId: selectedCategoryObj.id,
        });
      }
      
      return matches;
    });
    
    // Debug: Log filtering results (only in development)
    if (process.env.NODE_ENV === 'development') {
      console.log(`Category filter "${categoryFilter}": ${filtered.length} of ${items.length} items matched`);
      if (filtered.length === 0 && items.length > 0) {
        console.warn("No items matched! Check if products have category information.");
        console.log("First few items:", items.slice(0, 2).map(item => ({
          id: item.id,
          name: item.name,
          category: item.category,
          category_id: item.category_id,
          category_name: item.category_name,
        })));
      }
    }
    
    return filtered;
  };

  // Apply filters to current data
  // Only apply category filter for Products, not for Services
  const dateFilteredData = filterByPeriod(
    currentData, 
    selectedDateFilter, 
    ['formatted_date', 'created_at', 'date']
  );
  const filteredData = selectedProductType === "Products" 
    ? filterByCategory(dateFilteredData, selectedCategory)
    : dateFilteredData; // Services don't use category filter


  const TabButtons = () => (
    <div className="flex items-center space-x-0.5 border border-[#989898] rounded-lg p-1.5 sm:p-2 w-fit bg-white overflow-x-auto">
      {tabs.map((tab) => {
        const isActive = activeTab === tab;
        return (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg font-normal transition-all duration-200 cursor-pointer whitespace-nowrap ${
              isActive ? "px-4 sm:px-6 md:px-8 bg-[#E53E3E] text-white" : "px-2 sm:px-3 md:px-4 text-black"
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
        <PageHeader 
          title="Products / Services" 
          defaultPeriod={selectedDateFilter}
          timeOptions={datePeriodOptions}
          onPeriodChange={handlePageHeaderPeriodChange}
        />
        <div className="p-3 sm:p-4 md:p-5">
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-4">
            {/* Card 1 */}
            <div
              className="flex flex-row rounded-2xl flex-1 min-w-0"
              style={{ boxShadow: "0px 0px 2px 0px rgba(0, 0, 0, 0.25)" }}
            >
              <div className="bg-[#E53E3E] rounded-l-2xl p-4 sm:p-5 md:p-7 flex justify-center items-center">
                <img className="w-6 h-6 sm:w-7 sm:h-7 md:w-9 md:h-9" src={images.transaction1} alt="" />
              </div>
              <div className="flex flex-col bg-[#FFF1F1] rounded-r-2xl p-2 sm:p-3 pr-4 sm:pr-6 md:pr-11 gap-1 flex-1 min-w-0">
                <span className="font-semibold text-xs sm:text-sm md:text-[15px]">All {selectedProductType}</span>
                <span className="font-semibold text-lg sm:text-xl md:text-2xl">
                  {selectedProductType === "Products" 
                    ? (currentStatistics.total_products || 0)
                    : (currentStatistics.total_services || 0)
                  }
                </span>
                <span className="text-[#00000080] text-[10px] sm:text-xs md:text-[13px]">
                  <span className="text-[#1DB61D]">Total</span> {selectedProductType.toLowerCase()}
                </span>
              </div>
            </div>

            {/* Card 2 */}

            <div
              className="flex flex-row rounded-2xl flex-1 min-w-0"
              style={{ boxShadow: "0px 0px 2px 0px rgba(0, 0, 0, 0.25)" }}
            >
              <div className="bg-[#E53E3E] rounded-l-2xl p-4 sm:p-5 md:p-7 flex justify-center items-center">
                <img className="w-6 h-6 sm:w-7 sm:h-7 md:w-9 md:h-9" src={images.transaction1} alt="" />
              </div>
              <div className="flex flex-col bg-[#FFF1F1] rounded-r-2xl p-2 sm:p-3 pr-4 sm:pr-6 md:pr-11 gap-1 flex-1 min-w-0">
                <span className="font-semibold text-xs sm:text-sm md:text-[15px]">
                  {selectedProductType === "Products" ? "General Products" : "Active Services"}
                </span>
                <span className="font-semibold text-lg sm:text-xl md:text-2xl">
                  {selectedProductType === "Products" 
                    ? (currentStatistics.general_products || 0)
                    : (currentStatistics.active_services || 0)
                  }
                </span>
                <span className="text-[#00000080] text-[10px] sm:text-xs md:text-[13px]">
                  <span className="text-[#1DB61D]">
                    {selectedProductType === "Products" ? "General" : "Active"}
                  </span> {selectedProductType.toLowerCase()}
                </span>
              </div>
            </div>

            {/* Card 3 */}

            <div
              className="flex flex-row rounded-2xl flex-1 min-w-0"
              style={{ boxShadow: "0px 0px 2px 0px rgba(0, 0, 0, 0.25)" }}
            >
              <div className="bg-[#E53E3E] rounded-l-2xl p-4 sm:p-5 md:p-7 flex justify-center items-center">
                <img className="w-6 h-6 sm:w-7 sm:h-7 md:w-9 md:h-9" src={images.transaction1} alt="" />
              </div>
              <div className="flex flex-col bg-[#FFF1F1] rounded-r-2xl p-2 sm:p-3 pr-4 sm:pr-6 md:pr-11 gap-1 flex-1 min-w-0">
                <span className="font-semibold text-xs sm:text-sm md:text-[15px]">
                  {selectedProductType === "Products" ? "Sponsored Products" : "Inactive Services"}
                </span>
                <span className="font-semibold text-lg sm:text-xl md:text-2xl">
                  {selectedProductType === "Products" 
                    ? (currentStatistics.sponsored_products || 0)
                    : (currentStatistics.inactive_services || 0)
                  }
                </span>
                <span className="text-[#00000080] text-[10px] sm:text-xs md:text-[13px]">
                  <span className="text-[#1DB61D]">
                    {selectedProductType === "Products" ? "Sponsored" : "Inactive"}
                  </span> {selectedProductType.toLowerCase()}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 sm:mt-5 flex flex-col sm:flex-row justify-between gap-3 sm:gap-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-2 flex-wrap">
              <div className="overflow-x-auto w-full sm:w-auto">
                <TabButtons />
              </div>
              <ProductsDropdown onProductSelect={handleProductSelect} />

              <div className="relative" ref={dateFilterRef}>
                <div 
                  className="flex flex-row items-center gap-3 sm:gap-5 border border-[#989898] rounded-lg px-3 sm:px-4 py-2.5 sm:py-3.5 bg-white cursor-pointer text-xs sm:text-sm hover:bg-gray-50 transition-colors"
                  onClick={() => setIsDateFilterOpen(!isDateFilterOpen)}
                >
                  <div>{selectedDateFilter}</div>
                  <img 
                    className={`w-3 h-3 mt-1 transition-transform ${isDateFilterOpen ? 'rotate-180' : ''}`} 
                    src={images.dropdown} 
                    alt="" 
                  />
                </div>
                {isDateFilterOpen && (
                  <div className="absolute top-full left-0 mt-1 bg-white rounded-lg border border-[#989898] py-2 w-44 z-50 shadow-lg">
                    {datePeriodOptions.map((option) => (
                      <div
                        key={option}
                        onClick={() => {
                          setSelectedDateFilter(option);
                          setIsDateFilterOpen(false);
                          setCurrentPage(1);
                        }}
                        className={`px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer transition-colors ${
                          selectedDateFilter === option ? "bg-gray-100 font-semibold" : ""
                        }`}
                      >
                        {option}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Category Filter - Only show for Products */}
              {selectedProductType === "Products" && (
                <div className="relative" ref={categoryFilterRef}>
                  <div 
                    className="flex flex-row items-center gap-3 sm:gap-5 border border-[#989898] rounded-lg px-3 sm:px-4 py-2.5 sm:py-3.5 bg-white cursor-pointer text-xs sm:text-sm hover:bg-gray-50 transition-colors"
                    onClick={() => setIsCategoryFilterOpen(!isCategoryFilterOpen)}
                  >
                    <div>{selectedCategory}</div>
                    <img className="w-3 h-3 mt-1" src={images.dropdown} alt="" />
                  </div>
                  {isCategoryFilterOpen && (
                    <div className="absolute top-full left-0 mt-1 bg-white rounded-lg border border-[#989898] py-2 w-64 max-h-80 overflow-y-auto z-50 shadow-lg">
                      <div
                        onClick={() => {
                          setSelectedCategory("All Categories");
                          setIsCategoryFilterOpen(false);
                          setCurrentPage(1);
                        }}
                        className={`px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer transition-colors ${
                          selectedCategory === "All Categories" ? "bg-gray-100 font-semibold" : ""
                        }`}
                      >
                        All Categories
                      </div>
                      {categories.length > 0 ? (
                        categories.map((category: any) => (
                          <div
                            key={category.id}
                            onClick={() => {
                              setSelectedCategory(category.title);
                              setIsCategoryFilterOpen(false);
                              setCurrentPage(1);
                            }}
                            className={`px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer transition-colors ${
                              selectedCategory === category.title ? "bg-gray-100 font-semibold" : ""
                            } ${category.parent_id ? "pl-6 text-gray-700" : "font-medium"}`}
                            title={category.title}
                          >
                            {category.title}
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-2 text-sm text-gray-500">Loading categories...</div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <BulkActionDropdown 
                onActionSelect={handleBulkActionSelect}
                orders={filteredData}
                dataType={selectedProductType === "Products" ? "products" : "services"}
                exportConfig={{
                  dataType: selectedProductType === "Products" ? "products" : "services",
                  status: activeTab === "All" ? undefined : activeTab.toLowerCase(),
                  search: debouncedSearch && debouncedSearch.trim() ? debouncedSearch.trim() : undefined,
                  category: selectedCategory !== "All Categories" ? selectedCategory : undefined,
                }}
              />
            </div>

            <div className="flex gap-2">
              <button
                className="bg-[#E53E3E] px-3 sm:px-3.5 py-2.5 sm:py-3.5 cursor-pointer text-white rounded-xl text-sm sm:text-base w-full sm:w-auto whitespace-nowrap"
                onClick={() =>
                  selectedProductType === "Services"
                    ? handleAddServiceClick()
                    : handleAddProductClick()
                }
              >
                {selectedProductType === "Services"
                  ? "Add new Service"
                  : "Add new product"}
              </button>

              {/* search with debounce */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search"
                  value={search}
                  onChange={(e) => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const target = e.target as any;
                    setSearch(target.value);
                  }}
                  className="pl-12 pr-6 py-2.5 sm:py-3.5 border border-[#00000080] rounded-lg text-sm sm:text-[15px] w-full sm:w-[150px] md:w-[180px] focus:outline-none bg-white shadow-[0_2px_6px_rgba(0,0,0,0.05)] placeholder-[#00000080]"
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

          {/* Conditional Table Rendering */}
          {selectedProductType === "Products" ? (
            <div className="mt-5">
              <ProductsTable
                activeTab={activeTab}
                searchTerm={debouncedSearch}
                products={filteredData}
                pagination={currentPagination}
                currentPage={currentPage}
                onPageChange={handlePageChange}
                isLoading={isLoading}
                error={error}
              />
            </div>
          ) : (
            <div className="mt-5">
              {/* Services ignore Sponsored/General (no such flag). We still pass the tab in case you add one later. */}
              <ServicesTable
                searchTerm={debouncedSearch}
                services={filteredData}
                pagination={currentPagination}
                currentPage={currentPage}
                onPageChange={handlePageChange}
                isLoading={isLoading}
                error={error}
              />
            </div>
          )}

          <StoreSelectionModal
            isOpen={showStoreSelectionModal}
            onClose={handleCloseStoreSelection}
            onStoreSelect={handleStoreSelect}
            title={pendingAction === 'service' ? 'Select Store for Service' : 'Select Store for Product'}
          />
          <AddNewProduct
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            selectedStore={selectedStore}
          />
          <ServiceModal
            isOpen={showServiceModal}
            onClose={() => setShowServiceModal(false)}
            selectedStore={selectedStore}
          />
        </div>
      </div>
    </>
  );
};

export default Products_Services;
