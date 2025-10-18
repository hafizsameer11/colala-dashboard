import React, { useMemo, useState, useEffect } from "react";
import ServicesDetails from "../../Modals/servicesDetails";

interface ApiService {
  id: number;
  name: string;
  short_description: string;
  price_from: string;
  price_to: string;
  discount_price: string | null;
  store_name: string;
  seller_name: string;
  category_name: string | null;
  status: string;
  is_sold: number;
  is_unavailable: number;
  sub_services_count: number;
  media_count: number;
  created_at: string;
  formatted_date: string;
  primary_media: string;
}


interface ServicesTableProps {
  title?: string;
  onRowSelect?: (selectedIds: string[]) => void;
  /** debounced search string from parent */
  searchTerm?: string;
  services?: ApiService[];
  pagination?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  currentPage?: number;
  onPageChange?: (page: number) => void;
  isLoading?: boolean;
  error?: Error | null;
}

const ServicesTable: React.FC<ServicesTableProps> = ({
  title = "All Services",
  onRowSelect,
  searchTerm = "",
  services = [],
  pagination,
  currentPage = 1,
  onPageChange,
  isLoading = false,
  error,
}) => {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedService, setSelectedService] = useState<ApiService | null>(null);

  // Transform API data to match expected format
  const transformedServices = useMemo(() => {
    return services.map((service) => ({
      id: String(service.id),
      storeName: service.store_name || service.seller_name || 'N/A',
      serviceName: service.name || 'N/A',
      price: service.discount_price 
        ? `₦${service.discount_price} - ₦${service.price_to}`
        : `₦${service.price_from} - ₦${service.price_to}`,
      date: service.formatted_date || service.created_at || 'N/A',
      productImage: service.primary_media || '/assets/layout/service.png',
    }));
  }, [services]);

  const visibleServices = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return transformedServices;
    return transformedServices.filter((s) =>
      [s.storeName, s.serviceName, s.price, s.date]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [transformedServices, searchTerm]);

  useEffect(() => {
    const visIds = new Set(visibleServices.map((s) => s.id));
    const visibleSelected = selectedRows.filter((id) => visIds.has(id));
    setSelectAll(
      visibleServices.length > 0 &&
        visibleSelected.length === visibleServices.length
    );
  }, [visibleServices, selectedRows]);

  const handleSelectAll = () => {
    const visIds = visibleServices.map((s) => s.id);
    if (selectAll) {
      const remaining = selectedRows.filter((id) => !visIds.includes(id));
      setSelectedRows(remaining);
      onRowSelect?.(remaining);
      setSelectAll(false);
    } else {
      const union = Array.from(new Set([...selectedRows, ...visIds]));
      setSelectedRows(union);
      onRowSelect?.(union);
      setSelectAll(true);
    }
  };

  const handleRowSelect = (id: string) => {
    setSelectedRows((prev) => {
      const next = prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id];
      onRowSelect?.(next);
      return next;
    });
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="border border-[#00000040] rounded-2xl mt-5">
        <div className="bg-white p-5 rounded-t-2xl font-semibold text-lg border-b border-[#00000040]">
          {title}
        </div>
        <div className="bg-white rounded-b-2xl p-8">
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E53E3E]"></div>
            <span className="ml-3 text-gray-600">Loading services...</span>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="border border-[#00000040] rounded-2xl mt-5">
        <div className="bg-white p-5 rounded-t-2xl font-semibold text-lg border-b border-[#00000040]">
          {title}
        </div>
        <div className="bg-white rounded-b-2xl p-8">
          <div className="flex justify-center items-center">
            <div className="text-center text-red-500">
              <p className="text-sm">Error loading services</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-[#00000040] rounded-2xl mt-5">
      <div className="bg-white p-5 rounded-t-2xl font-semibold text-lg border-b border-[#00000040]">
        {title}
      </div>
      <div className="bg-white rounded-b-2xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#F2F2F2]">
            <tr className="text-left">
              <th className="p-4 font-normal">
                <input
                  type="checkbox"
                  checked={selectAll && visibleServices.length > 0}
                  onChange={handleSelectAll}
                  className="w-5 h-5"
                />
              </th>
              <th className="p-4 text-left font-normal">Store Name</th>
              <th className="p-4 text-left font-normal">Service Name</th>
              <th className="p-4 text-left font-normal">Price</th>
              <th className="p-4 text-left font-normal">Date</th>
              <th className="p-4 text-center font-normal">Other</th>
            </tr>
          </thead>
          <tbody>
            {visibleServices.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-500">
                  No results found.
                </td>
              </tr>
            ) : (
              visibleServices.map((service) => (
                <tr key={service.id} className="border-t border-[#00000040] ">
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(service.id)}
                      onChange={() => handleRowSelect(service.id)}
                      className="w-5 h-5"
                    />
                  </td>
                  <td className="p-4 text-left">
                    <span className="font-medium">{service.storeName}</span>
                  </td>
                  <td className="p-4 text-left">
                    <div className="flex items-center gap-3">
                      <img
                        src={service.productImage}
                        alt={service.serviceName}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <span className="font-medium">{service.serviceName}</span>
                    </div>
                  </td>
                  <td className="p-4 text-left">
                    <span className="font-semibold">{service.price}</span>
                  </td>
                  <td className="p-4 text-left">
                    <span className="text-gray-600">{service.date}</span>
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => {
                        const originalService = services.find(s => String(s.id) === service.id);
                        setSelectedService(originalService || null);
                        setShowModal(true);
                      }}
                      className="bg-[#E53E3E] hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.last_page > 1 && (
        <div className="bg-white p-4 border-t border-[#00000040]">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Showing {((currentPage - 1) * (pagination.per_page || 20)) + 1} to {Math.min(currentPage * (pagination.per_page || 20), pagination.total)} of {pagination.total} services
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => onPageChange?.(currentPage - 1)}
                disabled={currentPage <= 1}
                className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-3 py-1 bg-[#E53E3E] text-white rounded">
                {currentPage}
              </span>
              <button
                onClick={() => onPageChange?.(currentPage + 1)}
                disabled={currentPage >= pagination.last_page}
                className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      <ServicesDetails 
        isOpen={showModal} 
        onClose={() => {
          setShowModal(false);
          setSelectedService(null);
        }} 
        serviceData={selectedService}
      />
    </div>
  );
};

export default ServicesTable;
