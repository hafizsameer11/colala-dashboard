import { useState, useEffect } from "react";
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

  // API data fetching for products
  const { data: productsData, isLoading: productsLoading, error: productsError } = useQuery({
    queryKey: ['adminProducts', activeTab, currentPage],
    queryFn: () => getAdminProducts(currentPage, activeTab === "All" ? undefined : activeTab.toLowerCase()),
    placeholderData: (previousData) => previousData,
    enabled: selectedProductType === "Products",
  });

  // API data fetching for services
  const { data: servicesData, isLoading: servicesLoading, error: servicesError } = useQuery({
    queryKey: ['adminServices', activeTab, currentPage],
    queryFn: () => getAdminServices(currentPage, activeTab === "All" ? undefined : activeTab.toLowerCase()),
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
  };


  const TabButtons = () => (
    <div className="flex items-center space-x-0.5 border border-[#989898] rounded-lg p-2 w-fit bg-white">
      {tabs.map((tab) => {
        const isActive = activeTab === tab;
        return (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-2 text-sm rounded-lg font-normal transition-all duration-200 cursor-pointer ${
              isActive ? "px-8 bg-[#E53E3E] text-white" : "px-4 text-black"
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
        <PageHeader title="Products / Services" />
        <div className="p-5">
          <div className="flex flex-row justify-between items-center">
            {/* Card 1 */}
            <div
              className="flex flex-row rounded-2xl  w-90"
              style={{ boxShadow: "0px 0px 2px 0px rgba(0, 0, 0, 0.25)" }}
            >
              <div className="bg-[#E53E3E] rounded-l-2xl p-7 flex justify-center items-center ">
                <img className="w-9 h-9" src={images.transaction1} alt="" />
              </div>
              <div className="flex flex-col bg-[#FFF1F1] rounded-r-2xl p-3 pr-11 gap-1">
                <span className="font-semibold text-[15px]">All {selectedProductType}</span>
                <span className="font-semibold text-2xl">
                  {selectedProductType === "Products" 
                    ? (currentStatistics.total_products || 0)
                    : (currentStatistics.total_services || 0)
                  }
                </span>
                <span className="text-[#00000080] text-[13px] ">
                  <span className="text-[#1DB61D]">Total</span> {selectedProductType.toLowerCase()}
                </span>
              </div>
            </div>

            {/* Card 2 */}

            <div
              className="flex flex-row rounded-2xl w-90"
              style={{ boxShadow: "0px 0px 2px 0px rgba(0, 0, 0, 0.25)" }}
            >
              <div className="bg-[#E53E3E] rounded-l-2xl p-7 flex justify-center items-center ">
                <img className="w-9 h-9" src={images.transaction1} alt="" />
              </div>
              <div className="flex flex-col bg-[#FFF1F1] rounded-r-2xl p-3 pr-11 gap-1">
                <span className="font-semibold text-[15px]">
                  {selectedProductType === "Products" ? "General Products" : "Active Services"}
                </span>
                <span className="font-semibold text-2xl">
                  {selectedProductType === "Products" 
                    ? (currentStatistics.general_products || 0)
                    : (currentStatistics.active_services || 0)
                  }
                </span>
                <span className="text-[#00000080] text-[13px] ">
                  <span className="text-[#1DB61D]">
                    {selectedProductType === "Products" ? "General" : "Active"}
                  </span> {selectedProductType.toLowerCase()}
                </span>
              </div>
            </div>

            {/* Card 3 */}

            <div
              className="flex flex-row rounded-2xl w-90"
              style={{ boxShadow: "0px 0px 2px 0px rgba(0, 0, 0, 0.25)" }}
            >
              <div className="bg-[#E53E3E] rounded-l-2xl p-7 flex justify-center items-center ">
                <img className="w-9 h-9" src={images.transaction1} alt="" />
              </div>
              <div className="flex flex-col bg-[#FFF1F1] rounded-r-2xl p-3 pr-11 gap-1">
                <span className="font-semibold text-[15px]">
                  {selectedProductType === "Products" ? "Sponsored Products" : "Inactive Services"}
                </span>
                <span className="font-semibold text-2xl">
                  {selectedProductType === "Products" 
                    ? (currentStatistics.sponsored_products || 0)
                    : (currentStatistics.inactive_services || 0)
                  }
                </span>
                <span className="text-[#00000080] text-[13px] ">
                  <span className="text-[#1DB61D]">
                    {selectedProductType === "Products" ? "Sponsored" : "Inactive"}
                  </span> {selectedProductType.toLowerCase()}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-row justify-between">
            <div className="flex flex-row items-center gap-2">
              <TabButtons />
              <ProductsDropdown onProductSelect={handleProductSelect} />

              <div className="flex flex-row items-center gap-5 border border-[#989898] rounded-lg px-4 py-3.5 bg-white cursor-pointer">
                <div>Today</div>
                <img className="w-3 h-3 mt-1" src={images.dropdown} alt="" />
              </div>

              <div className="flex flex-row items-center gap-5 border border-[#989898] rounded-lg px-4 py-3.5 bg-white cursor-pointer">
                <div>Category</div>
                <img className="w-3 h-3 mt-1" src={images.dropdown} alt="" />
              </div>

              <BulkActionDropdown onActionSelect={handleBulkActionSelect} />
            </div>

            <div className="flex gap-2">
              <button
                className="bg-[#E53E3E] px-3.5 py-3.5 cursor-pointer text-white rounded-xl"
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
                  className="pl-12 pr-6 py-3.5 border border-[#00000080] rounded-lg text-[15px] w-[180px] focus:outline-none bg-white shadow-[0_2px_6px_rgba(0,0,0,0.05)] placeholder-[#00000080]"
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
                products={currentData}
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
                services={currentData}
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
