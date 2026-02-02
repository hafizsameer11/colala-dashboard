import React, { useMemo, useState, useEffect, useRef } from "react";
import ServicesDetails from "../../Modals/servicesDetails";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateServiceStatus } from "../../../../utils/queries/users";
import { useToast } from "../../../../contexts/ToastContext";
import images from "../../../../constants/images";

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
  const [statusDropdownOpen, setStatusDropdownOpen] = useState<{ [key: string]: boolean }>({});
  const statusDropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState<{ serviceId: string; status: string } | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const queryClient = useQueryClient();
  const { showToast } = useToast();

  // Status update mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ serviceId, statusData }: { serviceId: number | string; statusData: { status: string; rejection_reason?: string; is_sold?: boolean; is_unavailable?: boolean } }) =>
      updateServiceStatus(serviceId, statusData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminServices'] });
      showToast('Service status updated successfully', 'success');
      setShowRejectionModal(false);
      setRejectionReason("");
      setPendingStatusChange(null);
    },
    onError: (error: unknown) => {
      console.error('Update service status error:', error);
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to update service status. Please try again.';
      showToast(errorMessage, 'error');
    },
  });

  // Transform API data to match expected format
  const transformedServices = useMemo(() => {
    return services.map((service) => ({
      id: String(service.id),
      storeName: service.store_name || service.seller_name || 'N/A',
      serviceName: service.name || 'N/A',
      price: service.discount_price 
        ? `₦${service.discount_price} - ₦${service.price_to || ''}`
        : `₦${service.price_from || ''} - ₦${service.price_to || ''}`,
      date: service.formatted_date || service.created_at || 'N/A',
      productImage: service.primary_media || '/assets/layout/service.png',
      status: service.status || 'draft',
      is_sold: service.is_sold,
      is_unavailable: service.is_unavailable,
    }));
  }, [services]);

  // Search is now handled by backend - use transformed services directly
  const visibleServices = transformedServices;

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

  const handleStatusToggle = (serviceId: string) => {
    setStatusDropdownOpen(prev => ({
      ...prev,
      [serviceId]: !prev[serviceId]
    }));
  };

  const handleStatusChange = (serviceId: string, newStatus: string) => {
    // Close dropdown
    setStatusDropdownOpen(prev => ({
      ...prev,
      [serviceId]: false
    }));

    // If status is inactive, show rejection reason modal
    if (newStatus === 'inactive') {
      setPendingStatusChange({ serviceId, status: newStatus });
      setShowRejectionModal(true);
      setRejectionReason("");
    } else {
      // For other statuses, update directly
      confirmStatusChange(serviceId, newStatus);
    }
  };

  const confirmStatusChange = (serviceId: string, newStatus: string, rejectionReason?: string) => {
    const service = services.find(s => String(s.id) === serviceId);
    if (!service) return;
    
    const statusData: { status: string; rejection_reason?: string; is_sold?: boolean; is_unavailable?: boolean } = {
      status: newStatus,
    };
    
    // Add rejection reason if provided
    if (rejectionReason && rejectionReason.trim()) {
      statusData.rejection_reason = rejectionReason.trim();
    }
    
    // Include is_sold and is_unavailable if they exist
    if (service.is_sold !== undefined) {
      statusData.is_sold = Boolean(service.is_sold);
    }
    if (service.is_unavailable !== undefined) {
      statusData.is_unavailable = Boolean(service.is_unavailable);
    }
    
    updateStatusMutation.mutate({ serviceId, statusData });
  };

  const handleRejectionSubmit = () => {
    if (pendingStatusChange) {
      confirmStatusChange(pendingStatusChange.serviceId, pendingStatusChange.status, rejectionReason);
    }
  };

  const handleRejectionCancel = () => {
    setShowRejectionModal(false);
    setRejectionReason("");
    setPendingStatusChange(null);
  };

  const getStatusDisplay = (status: string) => {
    const statusMap: { [key: string]: { label: string; color: string } } = {
      'active': { label: 'Active', color: 'bg-green-500' },
      'inactive': { label: 'Inactive', color: 'bg-red-500' },
      'draft': { label: 'Draft', color: 'bg-gray-500' },
    };
    return statusMap[status] || { label: status.charAt(0).toUpperCase() + status.slice(1), color: 'bg-gray-500' };
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      Object.keys(statusDropdownRefs.current).forEach((serviceId) => {
        if (statusDropdownRefs.current[serviceId] && !statusDropdownRefs.current[serviceId]?.contains(event.target as Node)) {
          setStatusDropdownOpen(prev => ({
            ...prev,
            [serviceId]: false
          }));
        }
      });
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
              <th className="p-4 text-center font-normal">Status</th>
              <th className="p-4 text-center font-normal">Other</th>
            </tr>
          </thead>
          <tbody>
            {visibleServices.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-gray-500">
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
                    <div className="relative inline-block" ref={(el) => { statusDropdownRefs.current[service.id] = el; }}>
                      <button
                        onClick={() => handleStatusToggle(service.id)}
                        disabled={updateStatusMutation.isPending}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          service.status === 'active' 
                            ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                            : service.status === 'inactive'
                            ? 'bg-red-100 text-red-800 hover:bg-red-200'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        } ${updateStatusMutation.isPending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        <span className={`w-2 h-2 rounded-full ${getStatusDisplay(service.status).color}`}></span>
                        {getStatusDisplay(service.status).label}
                        <img 
                          src={images.dropdown} 
                          alt="" 
                          className={`w-3 h-3 transition-transform ${statusDropdownOpen[service.id] ? 'rotate-180' : ''}`}
                        />
                      </button>
                      {statusDropdownOpen[service.id] && (
                        <div className="absolute z-10 mt-1 right-0 bg-white border border-gray-200 rounded-lg shadow-lg min-w-[120px]">
                          <button
                            onClick={() => handleStatusChange(service.id, 'active')}
                            className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors first:rounded-t-lg ${
                              service.status === 'active' ? 'bg-green-50 font-semibold' : ''
                            }`}
                          >
                            Active
                          </button>
                          <button
                            onClick={() => handleStatusChange(service.id, 'inactive')}
                            className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                              service.status === 'inactive' ? 'bg-red-50 font-semibold' : ''
                            }`}
                          >
                            Inactive
                          </button>
                          <button
                            onClick={() => handleStatusChange(service.id, 'draft')}
                            className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors last:rounded-b-lg ${
                              service.status === 'draft' ? 'bg-gray-50 font-semibold' : ''
                            }`}
                          >
                            Draft
                          </button>
                        </div>
                      )}
                    </div>
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

      {/* Rejection Reason Modal */}
      {showRejectionModal && pendingStatusChange && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Set Service to Inactive</h3>
                <button
                  onClick={handleRejectionCancel}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                  aria-label="Close"
                >
                  <img src={images.close} alt="Close" className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rejection Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Enter reason for making this service inactive (e.g., Service description is incomplete)"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53E3E] focus:border-[#E53E3E] resize-none"
                  maxLength={500}
                />
                <div className="mt-1 text-xs text-gray-500 text-right">
                  {rejectionReason.length}/500 characters
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleRejectionCancel}
                  disabled={updateStatusMutation.isPending}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRejectionSubmit}
                  disabled={updateStatusMutation.isPending || !rejectionReason.trim()}
                  className="flex-1 px-4 py-2 bg-[#E53E3E] text-white rounded-lg hover:bg-[#D32F2F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {updateStatusMutation.isPending ? 'Updating...' : 'Confirm Inactive'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicesTable;
