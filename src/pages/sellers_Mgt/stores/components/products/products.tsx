import images from "../../../../../constants/images";
import { useMemo, useState } from "react";
import BulkActionDropdown from "../../../../../components/BulkActionDropdown";
import ProductsTable from "./productsTable";
import AddNewProduct from "../../../Modals/addNewProduct";
import ServiceModal from "../../../Modals/serviceModal";
import ServicesTable from "./servicesTable";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getSellerProducts, getSellerDetails } from "../../../../../utils/queries/users";

const Products = () => {
  const [activeTab, setActiveTab] = useState("All");
  const tabs = ["All", "General", "Sponsored"];
  const [showModal, setShowModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [selectedProductType, setSelectedProductType] = useState("Products");
  const { storeId } = useParams<{ storeId: string }>();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPeriod, setSelectedPeriod] = useState<string>("All time");

  const { data: productsResp, isLoading, error } = useQuery({
    queryKey: ["sellerProducts", storeId, currentPage, selectedPeriod],
    queryFn: () => getSellerProducts(storeId!, currentPage, selectedPeriod),
    enabled: !!storeId,
    keepPreviousData: true,
  });

  // Fetch seller details to get store information
  const { data: sellerDetails } = useQuery({
    queryKey: ['sellerDetails', storeId],
    queryFn: () => getSellerDetails(storeId!),
    enabled: !!storeId,
    staleTime: 5 * 60 * 1000,
  });

  const summaryStats = productsResp?.data?.summary_stats;
  const products = productsResp?.data?.products?.data ?? [];
  const pagination = productsResp?.data?.products;

  // Extract store info from seller details
  const storeInfo = sellerDetails?.data?.store_info;

  const handlePageChange = (page: number) => {
    if (page !== currentPage) setCurrentPage(page);
  };

  interface ProductsDropdownProps {
    onProductSelect?: (product: string) => void;
  }

  const ProductsDropdown: React.FC<ProductsDropdownProps> = ({
    onProductSelect,
  }) => {
    const [isProductsDropdownOpen, setIsProductsDropdownOpen] = useState(false);

    const products = ["Products", "Services"];

    const handleProductsDropdownToggle = () => {
      setIsProductsDropdownOpen(!isProductsDropdownOpen);
    };

    const handleProductOptionSelect = (product: string) => {
      setSelectedProductType(product);
      setIsProductsDropdownOpen(false);

      if (onProductSelect) {
        onProductSelect(product);
      }

      console.log("Selected product type:", product);
    };

    return (
      <div className="relative inline-block text-left">
        <div
          className="flex flex-row justify-center items-center px-2.5 py-3.5 border border-[#989898] text-black bg-white rounded-lg cursor-pointer"
          onClick={handleProductsDropdownToggle}
        >
          <span className="cursor-pointer">{selectedProductType}</span>
          <div>
            <img className="w-4 h-4 ml-5" src={images.dropdown} alt="" />
          </div>
        </div>

        {isProductsDropdownOpen && (
          <div className="absolute z-10 mt-2 w-35 bg-white border border-gray-200 font-semibold rounded-2xl shadow-lg">
            {products.map((product) => (
              <button
                key={product}
                onClick={() => handleProductOptionSelect(product)}
                className={`block w-full text-left px-4 py-2 text-sm ${product === selectedProductType
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

  const handleProductSelect = (product: string) => {
    setSelectedProductType(product);
    console.log("Selected product:", product);
  };

  const handleBulkActionSelect = (action: string) => {
    // Handle the bulk action selection from the parent component
    console.log("Bulk action selected in Orders:", action);
    // Add your custom logic here
  };

  const TabButtons = () => (
    <div className="flex items-center space-x-0.5 border border-[#989898] rounded-lg p-1.5 sm:p-2 w-fit bg-white overflow-x-auto">
      {tabs.map((tab) => {
        const isActive = activeTab === tab;
        return (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg font-normal transition-all duration-200 cursor-pointer whitespace-nowrap ${isActive ? "px-4 sm:px-6 md:px-8 bg-[#E53E3E] text-white" : "px-2 sm:px-3 md:px-4 text-black"
              }`}
          >
            {tab}
          </button>
        );
      })}
    </div>
  );

  return (
    <div>
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
            <span className="font-semibold text-xs sm:text-sm md:text-[15px]">All Products</span>
            <span className="font-semibold text-lg sm:text-xl md:text-2xl">{summaryStats?.all_products?.count ?? 0}</span>
            <span className="text-[#00000080] text-[10px] sm:text-xs md:text-[13px]">
              <span className="text-[#1DB61D]">+{summaryStats?.all_products?.increase ?? 0}%</span> increase
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
            <span className="font-semibold text-xs sm:text-sm md:text-[15px]">General Products</span>
            <span className="font-semibold text-lg sm:text-xl md:text-2xl">{summaryStats?.general_products?.count ?? 0}</span>
            <span className="text-[#00000080] text-[10px] sm:text-xs md:text-[13px]">
              <span className="text-[#1DB61D]">+{summaryStats?.general_products?.increase ?? 0}%</span> increase
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
              Sponsored Products
            </span>
            <span className="font-semibold text-lg sm:text-xl md:text-2xl">{summaryStats?.sponsored_products?.count ?? 0}</span>
            <span className="text-[#00000080] text-[10px] sm:text-xs md:text-[13px]">
              <span className="text-[#1DB61D]">+{summaryStats?.sponsored_products?.increase ?? 0}%</span> increase
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 sm:mt-5 flex flex-col sm:flex-row justify-between gap-3 sm:gap-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-2 flex-wrap">
          <div className="overflow-x-auto w-full sm:w-auto">
            <TabButtons />
          </div>
          <div>
            <ProductsDropdown onProductSelect={handleProductSelect} />
          </div>
          <div className="flex flex-row items-center gap-3 sm:gap-5 border border-[#989898] rounded-lg px-3 sm:px-4 py-2.5 sm:py-3.5 bg-white cursor-pointer text-xs sm:text-sm">
            <div>Today</div>
            <div>
              <img className="w-3 h-3 mt-1" src={images.dropdown} alt="" />
            </div>
          </div>
          <div className="flex flex-row items-center gap-3 sm:gap-5 border border-[#989898] rounded-lg px-3 sm:px-4 py-2.5 sm:py-3.5 bg-white cursor-pointer text-xs sm:text-sm">
            <div>Category</div>
            <div>
              <img className="w-3 h-3 mt-1" src={images.dropdown} alt="" />
            </div>
          </div>
          <div>
            <BulkActionDropdown onActionSelect={handleBulkActionSelect} />
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <div>
            <button
              className="bg-[#E53E3E] px-3 sm:px-3.5 py-2.5 sm:py-3.5 cursor-pointer text-white rounded-xl text-sm sm:text-base w-full sm:w-auto whitespace-nowrap"
              onClick={() => {
                if (selectedProductType === "Services") {
                  setShowServiceModal(true);
                } else {
                  setShowModal(true);
                }
              }}
            >
              {selectedProductType === "Services"
                ? "Add new Service"
                : "Add new product"}
            </button>
          </div>
          <div className="relative w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search"
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
      {selectedProductType === "Products" && (
        <div className="mt-5">
          <ProductsTable
            title={`${activeTab} Products`}
            products={products}
            isLoading={isLoading}
            error={error as any}
            pagination={pagination}
            currentPage={currentPage}
            onPageChange={handlePageChange}
            activeTab={activeTab}
            userId={storeId}
          />
        </div>
      )}

      {selectedProductType === "Services" && (
        <div className="mt-5">
          <ServicesTable />
        </div>
      )}

      <AddNewProduct isOpen={showModal} onClose={() => setShowModal(false)} selectedStore={storeInfo} />
      <ServiceModal
        isOpen={showServiceModal}
        onClose={() => setShowServiceModal(false)}
      />
    </div>
  );
};

export default Products;
