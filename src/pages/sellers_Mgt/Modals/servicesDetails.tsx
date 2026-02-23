import images from "../../../constants/images";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAdminServiceDetails, approveService, updateServiceStatus, deleteService } from "../../../utils/queries/users";
import { useToast } from "../../../contexts/ToastContext";
import ServiceModal from "./serviceModal";

interface ServiceData {
  id: number;
  name: string;
  short_description: string;
  price_from: string;
  price_to: string;
  discount_price: string | null;
  store_name: string;
  seller_name: string;
  status: string;
  is_sold: number;
  is_unavailable: number;
  sub_services_count: number;
  media_count: number;
  created_at: string;
  formatted_date: string;
  primary_media: string;
}

interface ServicesDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  serviceData?: ServiceData | null;
}

const ServicesDetails: React.FC<ServicesDetailsProps> = ({
  isOpen,
  onClose,
  serviceData,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<
    "Service Details" | "Service Stats"
  >("Service Details");
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);

  const queryClient = useQueryClient();
  const { showToast } = useToast();

  // Fetch service details from API
  const { data: serviceDetails, isLoading, error } = useQuery({
    queryKey: ['adminServiceDetails', serviceData?.id],
    queryFn: () => getAdminServiceDetails(serviceData!.id),
    enabled: !!serviceData?.id,
    staleTime: 5 * 60 * 1000,
  });

  // Transform API response to match expected format
  const realServiceData = serviceDetails?.data ? {
    service_info: serviceDetails.data.service_info,
    store_info: serviceDetails.data.store_info,
    media: serviceDetails.data.media?.map((img: any) => ({
      id: img.id,
      type: img.type,
      url: img.url,
      path: img.url, // For compatibility
    })) || [],
    sub_services: serviceDetails.data.sub_services || [],
    statistics: serviceDetails.data.statistics || {},
  } : null;

  const tabs = ["Service Details", "Service Stats"];

  // Approve service mutation
  const approveServiceMutation = useMutation({
    mutationFn: () => approveService(serviceData!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminServiceDetails', serviceData?.id] });
      queryClient.invalidateQueries({ queryKey: ['adminServices'] });
      showToast('Service approved successfully', 'success');
    },
    onError: (error: unknown) => {
      console.error('Approve service error:', error);
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to approve service. Please try again.';
      showToast(errorMessage, 'error');
    },
  });

  // Update service status mutation
  const updateStatusMutation = useMutation({
    mutationFn: (statusData: { status: string; rejection_reason?: string; is_sold?: boolean; is_unavailable?: boolean }) =>
      updateServiceStatus(serviceData!.id, statusData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminServiceDetails', serviceData?.id] });
      queryClient.invalidateQueries({ queryKey: ['adminServices'] });
      showToast('Service status updated successfully', 'success');
      setShowRejectionModal(false);
      setRejectionReason("");
    },
    onError: (error: unknown) => {
      console.error('Update service status error:', error);
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to update service status. Please try again.';
      showToast(errorMessage, 'error');
    },
  });

  // Delete service mutation
  const deleteServiceMutation = useMutation({
    mutationFn: () => deleteService(serviceData!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminServices'] });
      showToast('Service deleted successfully', 'success');
      setShowDeleteConfirm(false);
      onClose();
    },
    onError: (error: unknown) => {
      console.error('Delete service error:', error);
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to delete service. Please try again.';
      showToast(errorMessage, 'error');
    },
  });

  const handleApprove = () => {
    approveServiceMutation.mutate();
  };

  const handleReject = () => {
    setShowRejectionModal(true);
    setRejectionReason("");
  };

  const handleRejectionSubmit = () => {
    if (!rejectionReason.trim()) {
      showToast('Please provide a rejection reason', 'error');
      return;
    }
    updateStatusMutation.mutate({
      status: 'inactive',
      rejection_reason: rejectionReason.trim(),
    });
  };

  const handleDelete = () => {
    deleteServiceMutation.mutate();
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "Service Details":
        if (isLoading) {
          return (
            <div className="flex flex-col justify-center items-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E53E3E] mb-4"></div>
              <p className="text-gray-600 text-sm">Loading service details...</p>
            </div>
          );
        }

        if (error || !realServiceData) {
          return (
            <div className="flex flex-col justify-center items-center py-16">
              <div className="text-red-500 text-center">
                <p className="text-lg font-semibold mb-2">Error loading service details</p>
                <p className="text-sm text-gray-600">Please try again later</p>
              </div>
            </div>
          );
        }

        return (
          <div className="">
            {/* Video Section */}
            {realServiceData.service_info.video && (
              <div className="relative rounded-2xl overflow-hidden">
                <video
                  src={realServiceData.service_info.video.startsWith('http')
                    ? realServiceData.service_info.video
                    : `https://api.colalamall.com/storage/${realServiceData.service_info.video}`}
                  controls
                  className="w-full h-auto object-cover"
                  preload="metadata"
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            )}

            {/* Service Images */}
            {realServiceData.media && realServiceData.media.length > 0 && (
              <div className="flex flex-row mt-5 gap-3">
                {realServiceData.media.slice(0, 3).map((img: any, index: number) => (
                  <div key={index}>
                    <img
                      src={img.url || img.path}
                      alt={`Service image ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="mt-5">
              <div className="flex flex-row justify-between border-b border-b-[#00000080] p-1 pb-5">
                <div className="flex flex-col gap-2">
                  <div className="text-xl font-medium">
                    {realServiceData.service_info.name}
                  </div>
                  <div className="text-xl font-bold text-[#E53E3E]">
                    ₦{realServiceData.service_info.price_from} - ₦{realServiceData.service_info.price_to}
                    {realServiceData.service_info.discount_price && (
                      <span className="text-sm text-gray-500 ml-2">
                        (Discounted: ₦{realServiceData.service_info.discount_price})
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-row items-center">
                  <div>
                    <img className="w-8 h-8" src={images.start1} alt="" />
                  </div>
                  <div className="text-[#00000080] text-2xl">
                    {realServiceData.statistics.average_rating || '0.0'}
                  </div>
                </div>
              </div>
              <div className="border-b border-b-[#00000080] p-1 pb-5 flex flex-col mt-5">
                <div className="text-[#00000080] text-lg font-semibold">
                  Description
                </div>
                <div className="font-semibold text-xl">
                  {realServiceData.service_info.short_description}
                </div>
                {realServiceData.service_info.full_description && (
                  <div className="mt-2 text-gray-700 whitespace-pre-line">
                    {realServiceData.service_info.full_description}
                  </div>
                )}
              </div>
            </div>
            <div className="mt-5 flex flex-col border-[0.3px] border-[#CDCDCD] rounded-2xl">
              <div className="bg-[#E53E3E] text-white font-bold text-xl p-4 rounded-t-2xl">
                Price Breakdown
              </div>
              {realServiceData.sub_services && realServiceData.sub_services.length > 0 ? (
                realServiceData.sub_services.map((subService: any, index: number) => (
                  <div key={subService.id} className={`flex flex-row p-4 ${index < realServiceData.sub_services.length - 1 ? 'border-b-[0.3px] border-b-[#CDCDCD]' : ''}`}>
                    <div className="text-[#00000080] text-lg w-40">{subService.name}</div>
                    <div className="text-lg">₦{subService.price_from} - ₦{subService.price_to}</div>
                  </div>
                ))
              ) : (
                <div className="flex flex-row p-4">
                  <div className="text-[#00000080] text-lg w-40">Base Service</div>
                  <div className="text-lg">₦{realServiceData.service_info.price_from} - ₦{realServiceData.service_info.price_to}</div>
                </div>
              )}
            </div>
            {/* Status Management */}
            {realServiceData && (
              <div className="mt-5 flex flex-col gap-3">
                {realServiceData.service_info.status === 'pending' || realServiceData.service_info.status === 'draft' ? (
                  <div className="flex gap-3">
                    <button
                      onClick={handleApprove}
                      disabled={approveServiceMutation.isPending}
                      className="flex-1 bg-green-600 text-white rounded-2xl py-4 px-6 font-medium cursor-pointer hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {approveServiceMutation.isPending ? 'Approving...' : 'Approve Service'}
                    </button>
                    <button
                      onClick={handleReject}
                      disabled={approveServiceMutation.isPending}
                      className="flex-1 bg-red-600 text-white rounded-2xl py-4 px-6 font-medium cursor-pointer hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Reject Service
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    {realServiceData.service_info.status === 'inactive' && (
                      <button
                        onClick={handleApprove}
                        disabled={approveServiceMutation.isPending}
                        className="flex-1 bg-green-600 text-white rounded-2xl py-4 px-6 font-medium cursor-pointer hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {approveServiceMutation.isPending ? 'Approving...' : 'Approve Service'}
                      </button>
                    )}
                    {realServiceData.service_info.status === 'active' && (
                      <button
                        onClick={handleReject}
                        disabled={updateStatusMutation.isPending}
                        className="flex-1 bg-red-600 text-white rounded-2xl py-4 px-6 font-medium cursor-pointer hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Reject Service
                      </button>
                    )}
                  </div>
                )}
                <div className="flex gap-3">
                  {/* Delete Button */}
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={deleteServiceMutation.isPending}
                    className="w-16 h-16 bg-white border border-gray-200 rounded-2xl flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Delete Service"
                  >
                    <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>

                  {/* Edit Service Button */}
                  <button
                    type="button"
                    onClick={() => {
                      if (realServiceData?.service_info) {
                        setShowEditModal(true);
                      }
                    }}
                    className="flex-1 bg-[#E53E3E] text-white rounded-2xl py-4 px-6 font-medium cursor-pointer hover:bg-red-600 transition-colors"
                  >
                    Edit Service
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      case "Service Stats":
        if (isLoading) {
          return (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E53E3E]"></div>
              <span className="ml-3 text-gray-600">Loading service statistics...</span>
            </div>
          );
        }

        if (error || !realServiceData) {
          return (
            <div className="flex justify-center items-center py-8">
              <div className="text-center text-red-500">
                <p className="text-sm">Error loading service statistics</p>
              </div>
            </div>
          );
        }

        return (
          <div>
            <div className="flex flex-col gap-3">
              <div className="flex flex-row justify-between gap-3">
                <div className="flex flex-col border border-[#989898] rounded-xl items-center justify-center gap-2 py-3 px-4 flex-1 min-h-[80px]">
                  <div className="text-[#000000B2] text-sm">Views</div>
                  <div className="font-bold text-lg">{realServiceData.statistics.views || 0}</div>
                </div>
                <div className="flex flex-col border border-[#989898] rounded-xl items-center justify-center gap-2 py-3 px-4 flex-1 min-h-[80px]">
                  <div className="text-[#000000B2] text-sm">Impressions</div>
                  <div className="font-bold text-lg">{realServiceData.statistics.impressions || 0}</div>
                </div>
                <div className="flex flex-col border border-[#989898] rounded-xl items-center justify-center gap-2 py-3 px-4 flex-1 min-h-[80px]">
                  <div className="text-[#000000B2] text-sm">Clicks</div>
                  <div className="font-bold text-lg">{realServiceData.statistics.clicks || 0}</div>
                </div>
              </div>
              <div className="flex flex-row justify-between gap-3">
                <div className="flex flex-col border border-[#989898] rounded-xl items-center justify-center gap-2 py-3 px-4 flex-1 min-h-[80px]">
                  <div className="text-[#000000B2] text-sm">Chats</div>
                  <div className="font-bold text-lg">{realServiceData.statistics.chats || 0}</div>
                </div>
                <div className="flex flex-col border border-[#989898] rounded-xl items-center justify-center gap-2 py-3 px-4 flex-1 min-h-[80px]">
                  <div className="text-[#000000B2] text-sm">Phone Views</div>
                  <div className="font-bold text-lg">{realServiceData.statistics.phone_views || 0}</div>
                </div>
                <div className="flex flex-col border border-[#989898] rounded-xl items-center justify-center gap-2 py-3 px-4 flex-1 min-h-[80px]">
                  <div className="text-[#000000B2] text-sm">Total Engagement</div>
                  <div className="font-bold text-lg">{realServiceData.statistics.total_engagement || 0}</div>
                </div>
              </div>
              <div className="flex flex-row justify-between gap-3 mt-2">
                <div className="flex flex-col border border-[#989898] rounded-xl items-center justify-center gap-2 py-3 px-4 flex-1 min-h-[80px]">
                  <div className="text-[#000000B2] text-sm">Sub Services</div>
                  <div className="font-bold text-lg">{realServiceData.statistics.sub_services_count || 0}</div>
                </div>
                <div className="flex flex-col border border-[#989898] rounded-xl items-center justify-center gap-2 py-3 px-4 flex-1 min-h-[80px]">
                  <div className="text-[#000000B2] text-sm">Media Count</div>
                  <div className="font-bold text-lg">{realServiceData.statistics.media_count || 0}</div>
                </div>
                <div className="flex flex-col border border-[#989898] rounded-xl items-center justify-center gap-2 py-3 px-4 flex-1 min-h-[80px]">
                  <div className="text-[#000000B2] text-sm">Status</div>
                  <div className="font-bold text-lg capitalize">{realServiceData.service_info.status || 'N/A'}</div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-100 bg-[#00000080] bg-opacity-50 flex justify-end">
      <div className="bg-white w-[500px] relative h-full overflow-y-auto">
        {" "}
        {/* Header */}
        <div className="border-b border-[#787878] px-3 py-3 sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Service Details</h2>
            <div className="flex items-center">
              <button
                onClick={onClose}
                className="p-2 rounded-md cursor-pointer"
                aria-label="Close"
              >
                <img className="w-7 h-7" src={images.close} alt="Close" />
              </button>
            </div>
          </div>
        </div>
        <div className="p-5">
          {" "}
          {/* Tab Buttons */}
          <div className="flex bg-white rounded-xl p-1 mb-6 w-fit border border-[#989898]">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() =>
                  setActiveTab(tab as "Service Details" | "Service Stats")
                }
                className={`px-6 py-3 rounded-xl cursor-pointer font-medium transition-colors text-sm ${activeTab === tab
                    ? "bg-[#E53E3E] text-white shadow-sm"
                    : "text-[#000000] "
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>
          {/* Tab Content */}
          {renderTabContent()}
        </div>
      </div>

      {/* Rejection Reason Modal */}
      {showRejectionModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Reject Service</h3>
                <button
                  onClick={() => {
                    setShowRejectionModal(false);
                    setRejectionReason("");
                  }}
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
                  placeholder="Enter reason for rejecting this service (e.g., Service description is incomplete)"
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
                  onClick={() => {
                    setShowRejectionModal(false);
                    setRejectionReason("");
                  }}
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
                  {updateStatusMutation.isPending ? 'Rejecting...' : 'Confirm Rejection'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Delete Service</h3>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                  aria-label="Close"
                >
                  <img src={images.close} alt="Close" className="w-6 h-6" />
                </button>
              </div>

              <p className="text-gray-700 mb-6">
                Are you sure you want to delete this service? This action cannot be undone.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleteServiceMutation.isPending}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleteServiceMutation.isPending}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {deleteServiceMutation.isPending ? 'Deleting...' : 'Delete Service'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Service Modal */}
      {showEditModal && realServiceData?.service_info && (
        <ServiceModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            // Refetch service details after edit
            queryClient.invalidateQueries({ queryKey: ['adminServiceDetails', serviceData?.id] });
          }}
          editingService={{
            id: realServiceData.service_info.id,
            name: realServiceData.service_info.name,
            short_description: realServiceData.service_info.short_description || '',
            full_description: realServiceData.service_info.full_description || '',
            price_from: realServiceData.service_info.price_from || '',
            price_to: realServiceData.service_info.price_to || null,
            discount_price: realServiceData.service_info.discount_price || null,
            category_id: serviceDetails?.data?.category_info?.id,
            status: realServiceData.service_info.status,
          }}
        />
      )}
    </div>
  );
};

export default ServicesDetails;

