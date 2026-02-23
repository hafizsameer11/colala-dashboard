import React, { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getSellerServices } from "../../../../../utils/queries/users";
import ServicesDetails from "../../../Modals/servicesDetails";
import { formatCurrency } from "../../../../../utils/formatCurrency";

interface Service {
  id: string | number;
  storeName: string;
  serviceName: string;
  price: string;
  date: string;
  productImage: string;
}

interface ServicesTableProps {
  title?: string;
  onRowSelect?: (selectedIds: string[]) => void;
}

const ServicesTable: React.FC<ServicesTableProps> = ({
  title = "All Services",
  onRowSelect,
}) => {
  const { storeId } = useParams<{ storeId: string }>();
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const { data: servicesData, isLoading, error } = useQuery({
    queryKey: ["sellerServices", storeId, currentPage],
    queryFn: () => getSellerServices(storeId!, currentPage),
    enabled: !!storeId,
  });

  const services: Service[] = useMemo(() => {
    const raw = servicesData?.data?.services?.data || servicesData?.data?.services || servicesData?.data?.data || servicesData?.data || [];
    if (!Array.isArray(raw)) return [];
    return raw.map((s: any) => ({
      id: s.id?.toString() || '',
      storeName: s.store_name || s.store?.name || s.seller_name || 'N/A',
      serviceName: s.name || s.service_name || 'N/A',
      price: s.price ? formatCurrency(s.price) : (s.price_range || 'N/A'),
      date: s.formatted_date || s.created_at || 'N/A',
      productImage: s.image || s.primary_image || s.images?.[0]?.url || '/assets/layout/service.png',
    }));
  }, [servicesData]);

  const pagination = servicesData?.data?.services || servicesData?.data?.pagination;

  const handleSelectAll = () => {
    const allIds = services.map((service) => service.id.toString());
    const newSelection = selectAll ? [] : allIds;
    setSelectedRows(newSelection);
    setSelectAll(!selectAll);
    onRowSelect?.(newSelection);
  };

  const handleRowSelect = (id: string) => {
    const isSelected = selectedRows.includes(id);
    const newSelection = isSelected
      ? selectedRows.filter((rowId) => rowId !== id)
      : [...selectedRows, id];

    setSelectedRows(newSelection);
    setSelectAll(newSelection.length === services.length);
    onRowSelect?.(newSelection);
  };

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
                  checked={selectAll && services.length > 0}
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
            {isLoading ? (
              <tr>
                <td colSpan={6} className="p-6 text-center">
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E53E3E]"></div>
                    <span className="ml-3 text-gray-600">Loading services...</span>
                  </div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-red-500">
                  Error loading services
                </td>
              </tr>
            ) : services.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-500">
                  No services found for this store.
                </td>
              </tr>
            ) : (
              services.map((service) => (
                <tr key={service.id} className="border-t border-[#00000040]">
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(service.id.toString())}
                      onChange={() => handleRowSelect(service.id.toString())}
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
                        onError={(e) => { (e.target as HTMLImageElement).src = '/assets/layout/service.png'; }}
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
                      onClick={() => setShowModal(true)}
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

      {pagination && pagination.last_page > 1 && (
        <div className="bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Page {pagination.current_page} of {pagination.last_page}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(pagination.last_page, p + 1))}
              disabled={currentPage >= pagination.last_page}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      <ServicesDetails isOpen={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
};

export default ServicesTable;
