import React, { useState } from "react";
import images from "../../../../constants/images";
import RejectFieldModal from "../../../../components/RejectFieldModal";
import type { OnboardingFieldKey } from "../../../../constants/onboardingFields";

interface ViewLevel3Props {
  storeDetails?: any;
  onStatusUpdate: (status: string, notes?: string, sendNotification?: boolean) => void;
  onLevelUpdate: (level: number, notes?: string) => void;
  isLoading?: boolean;
  storeId?: number | string;
}

const ViewLevel3: React.FC<ViewLevel3Props> = ({
  storeDetails,
  onStatusUpdate,
  onLevelUpdate,
  isLoading = false,
  storeId,
}) => {
  const [showStatusUpdate, setShowStatusUpdate] = useState(false);
  const [showLevelUpdate, setShowLevelUpdate] = useState(false);
  const [status, setStatus] = useState(storeDetails?.onboarding_progress?.status || "pending");
  const [level, setLevel] = useState(storeDetails?.onboarding_progress?.onboarding_level || 3);
  const [notes, setNotes] = useState("");
  const [sendNotification, setSendNotification] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedFieldKey, setSelectedFieldKey] = useState<OnboardingFieldKey | null>(null);

  const storeInfo = storeDetails?.store_info;
  const level3Data = storeDetails?.level_3_data;
  const progressFields = storeDetails?.onboarding_progress?.fields || [];

  // Helper function to get field rejection status
  const getFieldRejectionStatus = (fieldKey: OnboardingFieldKey) => {
    const field = progressFields.find((f: any) => f.key === fieldKey);
    if (field && (field.status === 'rejected' || field.is_rejected)) {
      return {
        isRejected: true,
        reason: field.rejection_reason || 'No reason provided',
      };
    }
    return { isRejected: false, reason: null };
  };

  const handleRejectClick = (fieldKey: OnboardingFieldKey) => {
    setSelectedFieldKey(fieldKey);
    setShowRejectModal(true);
  };

  const handleRejectSuccess = () => {
    setToastMessage('Field rejected successfully!');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleStatusSubmit = () => {
    onStatusUpdate(status, notes, sendNotification);
    setShowStatusUpdate(false);
    setNotes("");
    
    // Show success toast
    setToastMessage(`Store status updated to ${status} successfully!`);
    setShowToast(true);
    
    // Auto hide toast after 3 seconds
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  const handleLevelSubmit = () => {
    onLevelUpdate(level, notes);
    setShowLevelUpdate(false);
    setNotes("");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "rejected": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Store Information */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Store Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-600">Store Name</label>
            <p className="text-sm text-gray-900">{storeInfo?.name || "N/A"}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Status</label>
            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(storeInfo?.status)}`}>
              {storeInfo?.status || "N/A"}
            </span>
          </div>
        </div>
      </div>

      {/* Level 3 Data */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Level 3 Data</h3>
        
        {/* Physical Store Information */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-600">Physical Store Information</h4>
            {storeId && (
              <button
                onClick={() => handleRejectClick('level3.physical_store')}
                className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Reject
              </button>
            )}
          </div>
          {getFieldRejectionStatus('level3.physical_store').isRejected && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800">This field has been rejected</p>
                  <p className="text-sm text-red-700 mt-1">{getFieldRejectionStatus('level3.physical_store').reason}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Store Contact & Location */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-sm font-medium text-gray-600">Store Phone</label>
            <p className="text-sm text-gray-900">{level3Data?.store_phone || "N/A"}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Store Location</label>
            <p className="text-sm text-gray-900">{level3Data?.store_location || "N/A"}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Theme Color</label>
            <div className="flex items-center gap-2 mt-1">
              <div 
                className="w-6 h-6 rounded border border-gray-300"
                style={{ backgroundColor: level3Data?.theme_color || "#000000" }}
              ></div>
              <span className="text-sm text-gray-900">{level3Data?.theme_color || "N/A"}</span>
            </div>
          </div>
        </div>

        {/* Theme Color */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-600">Theme Color</h4>
            {storeId && (
              <button
                onClick={() => handleRejectClick('level3.theme')}
                className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Reject
              </button>
            )}
          </div>
          {getFieldRejectionStatus('level3.theme').isRejected && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800">This field has been rejected</p>
                  <p className="text-sm text-red-700 mt-1">{getFieldRejectionStatus('level3.theme').reason}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Addresses */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-md font-medium text-gray-700">Store Addresses</h4>
            {storeId && (
              <button
                onClick={() => handleRejectClick('level3.addresses')}
                className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Reject
              </button>
            )}
          </div>
          {getFieldRejectionStatus('level3.addresses').isRejected && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800">This field has been rejected</p>
                  <p className="text-sm text-red-700 mt-1">{getFieldRejectionStatus('level3.addresses').reason}</p>
                </div>
              </div>
            </div>
          )}
          {level3Data?.addresses?.length > 0 ? (
            <div className="space-y-3">
              {level3Data.addresses.map((address: any, index: number) => (
                <div key={index} className="bg-white p-3 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Address {index + 1}
                      {address.is_main && (
                        <span className="ml-2 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                          Main
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">State:</span>
                      <span className="ml-1 text-gray-900">{address.state || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">LGA:</span>
                      <span className="ml-1 text-gray-900">{address.local_government || "N/A"}</span>
                    </div>
                    {address.full_address && (
                      <div className="col-span-2">
                        <span className="text-gray-600">Full Address:</span>
                        <span className="ml-1 text-gray-900">{address.full_address}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No addresses found</p>
          )}
        </div>

        {/* Utility Bill */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-md font-medium text-gray-700">Utility Bill</h4>
            {storeId && (
              <button
                onClick={() => handleRejectClick('level3.utility_bill')}
                className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Reject
              </button>
            )}
          </div>
          {getFieldRejectionStatus('level3.utility_bill').isRejected && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800">This field has been rejected</p>
                  <p className="text-sm text-red-700 mt-1">{getFieldRejectionStatus('level3.utility_bill').reason}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Delivery Pricing */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-md font-medium text-gray-700">Delivery Pricing</h4>
            {storeId && (
              <button
                onClick={() => handleRejectClick('level3.delivery_pricing')}
                className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Reject
              </button>
            )}
          </div>
          {getFieldRejectionStatus('level3.delivery_pricing').isRejected && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800">This field has been rejected</p>
                  <p className="text-sm text-red-700 mt-1">{getFieldRejectionStatus('level3.delivery_pricing').reason}</p>
                </div>
              </div>
            </div>
          )}
          {level3Data?.delivery_pricing?.length > 0 ? (
            <div className="space-y-3">
              {level3Data.delivery_pricing.map((pricing: any, index: number) => (
                <div key={index} className="bg-white p-3 rounded-lg border">
                  <div className="text-sm font-medium text-gray-700 mb-2">
                    Pricing {index + 1}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">State:</span>
                      <span className="ml-1 text-gray-900">{pricing.state || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">LGA:</span>
                      <span className="ml-1 text-gray-900">{pricing.local_government || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Variant:</span>
                      <span className="ml-1 text-gray-900 capitalize">{pricing.variant || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Price:</span>
                      <span className="ml-1 text-gray-900">
                        {pricing.is_free ? "Free" : `₦${parseFloat(pricing.price || 0).toLocaleString()}`}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No delivery pricing found</p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center">
        <button
          onClick={() => setShowStatusUpdate(true)}
          className="bg-[#E53E3E] text-white px-8 py-3 rounded-lg hover:bg-red-600 transition-colors font-medium"
          disabled={isLoading}
        >
          Update Status
        </button>
      </div>

      {/* Status Update Modal */}
      {showStatusUpdate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-lg font-semibold mb-4">Update Store Status</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  rows={3}
                  placeholder="Add notes about this status change..."
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="sendNotification"
                  checked={sendNotification}
                  onChange={(e) => setSendNotification(e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="sendNotification" className="text-sm text-gray-700">
                  Send notification to store owner
                </label>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowStatusUpdate(false)}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleStatusSubmit}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                disabled={isLoading}
              >
                {isLoading ? "Updating..." : "Update Status"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Field Modal */}
      {showRejectModal && storeId && (
        <RejectFieldModal
          isOpen={showRejectModal}
          onClose={() => {
            setShowRejectModal(false);
            setSelectedFieldKey(null);
          }}
          storeId={storeId}
          level={3}
          onSuccess={handleRejectSuccess}
          preselectedField={selectedFieldKey || undefined}
        />
      )}

      {/* Success Toast Notification */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div className="bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px]">
            <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">Success!</p>
              <p className="text-sm opacity-90">{toastMessage}</p>
            </div>
            <button
              onClick={() => setShowToast(false)}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default ViewLevel3;
