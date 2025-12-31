import React, { useState } from "react";
import images from "../../../../constants/images";
import RejectFieldModal from "../../../../components/RejectFieldModal";
import type { OnboardingFieldKey } from "../../../../constants/onboardingFields";

interface ViewLevel2Props {
  storeDetails?: any;
  onStatusUpdate: (status: string, notes?: string, sendNotification?: boolean) => void;
  onLevelUpdate: (level: number, notes?: string) => void;
  isLoading?: boolean;
  storeId?: number | string;
}

const ViewLevel2: React.FC<ViewLevel2Props> = ({
  storeDetails,
  onStatusUpdate,
  onLevelUpdate,
  isLoading = false,
  storeId,
}) => {
  const [showStatusUpdate, setShowStatusUpdate] = useState(false);
  const [showLevelUpdate, setShowLevelUpdate] = useState(false);
  const [status, setStatus] = useState(storeDetails?.onboarding_progress?.status || "pending");
  const [level, setLevel] = useState(storeDetails?.onboarding_progress?.onboarding_level || 2);
  const [notes, setNotes] = useState("");
  const [sendNotification, setSendNotification] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedFieldKey, setSelectedFieldKey] = useState<OnboardingFieldKey | null>(null);

  const storeInfo = storeDetails?.store_info;
  const level2Data = storeDetails?.level_2_data;
  const progressFields = storeDetails?.onboarding_progress?.fields || [];

  // Helper function to get storage URL
  const getStorageUrl = (path: string | null | undefined): string => {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    return `https://colala.hmstech.xyz/storage/${path}`;
  };

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

      {/* Level 2 Data */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Level 2 Data</h3>
        
        {/* Business Information */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-600">Business Details</h4>
            {storeId && (
              <button
                onClick={() => handleRejectClick('level2.business_details')}
                className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Reject
              </button>
            )}
          </div>
          {getFieldRejectionStatus('level2.business_details').isRejected && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800">This field has been rejected</p>
                  <p className="text-sm text-red-700 mt-1">{getFieldRejectionStatus('level2.business_details').reason}</p>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-sm font-medium text-gray-600">Business Name</label>
            <p className="text-sm text-gray-900">{level2Data?.business_name || "N/A"}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Business Type</label>
            <p className="text-sm text-gray-900">{level2Data?.business_type || "N/A"}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">NIN Number</label>
            <p className="text-sm text-gray-900">{level2Data?.nin_number || "N/A"}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">BN Number</label>
            <p className="text-sm text-gray-900">{level2Data?.bn_number || "N/A"}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">CAC Number</label>
            <p className="text-sm text-gray-900">{level2Data?.cac_number || "N/A"}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Has Physical Store</label>
            <p className="text-sm text-gray-900">{level2Data?.has_physical_store ? "Yes" : "No"}</p>
          </div>
        </div>

        {/* Documents */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-900">Documents</h4>
            {storeId && (
              <button
                onClick={() => handleRejectClick('level2.documents')}
                className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Reject
              </button>
            )}
          </div>
          {getFieldRejectionStatus('level2.documents').isRejected && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800">This field has been rejected</p>
                  <p className="text-sm text-red-700 mt-1">{getFieldRejectionStatus('level2.documents').reason}</p>
                </div>
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg border">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">NIN Document</label>
                    {level2Data?.nin_document ? (
                      <p className="text-sm text-gray-500 mt-1">Document available</p>
                    ) : (
                      <p className="text-sm text-gray-400 mt-1">No document uploaded</p>
                    )}
                  </div>
                  {level2Data?.nin_document && (
                    <a 
                      href={getStorageUrl(level2Data.nin_document)} 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2 cursor-pointer"
                    >
                      <img 
                        src={images.DownloadSimple} 
                        alt="Download" 
                        className="w-4 h-4"
                        onError={(e) => {
                          e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTggMkM4LjU1IDIgOSAyLjQ1IDkgM1Y5LjU5TDEwLjMgOC4yOUwxMSAxMEw4IDEzTDQgMTBMMTQuNyA4LjI5TDE1IDlWMTBIMTNWMTJDMTMgMTIuNTUgMTIuNTUgMTMgMTIgMTNINEMzLjQ1IDEzIDMgMTIuNTUgMyAxMlY5SDNWN0gxVjRIMFYySDhWNFYzQzggMi40NSA4IDIgOCAyWiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+';
                        }}
                      />
                      View/Download
                    </a>
                  )}
                </div>
                {level2Data?.nin_document && (level2Data.nin_document.includes('.jpg') || level2Data.nin_document.includes('.jpeg') || level2Data.nin_document.includes('.png')) && (
                  <div className="mt-2">
                    <img 
                      src={getStorageUrl(level2Data.nin_document)} 
                      alt="NIN Document" 
                      className="w-full max-w-md h-auto rounded-lg border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => window.open(getStorageUrl(level2Data.nin_document), '_blank')}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg border">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">CAC Document</label>
                    {level2Data?.cac_document ? (
                      <p className="text-sm text-gray-500 mt-1">Document available</p>
                    ) : (
                      <p className="text-sm text-gray-400 mt-1">No document uploaded</p>
                    )}
                  </div>
                  {level2Data?.cac_document && (
                    <a 
                      href={getStorageUrl(level2Data.cac_document)} 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2 cursor-pointer"
                    >
                      <img 
                        src={images.DownloadSimple} 
                        alt="Download" 
                        className="w-4 h-4"
                        onError={(e) => {
                          e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTggMkM4LjU1IDIgOSAyLjQ1IDkgM1Y5LjU5TDEwLjMgOC4yOUwxMSAxMEw4IDEzTDQgMTBMMTQuNyA4LjI5TDE1IDlWMTBIMTNWMTJDMTMgMTIuNTUgMTIuNTUgMTMgMTIgMTNINEMzLjQ1IDEzIDMgMTIuNTUgMyAxMlY5SDNWN0gxVjRIMFYySDhWNFYzQzggMi40NSA4IDIgOCAyWiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+';
                        }}
                      />
                      View/Download
                    </a>
                  )}
                </div>
                {level2Data?.cac_document && (level2Data.cac_document.includes('.jpg') || level2Data.cac_document.includes('.jpeg') || level2Data.cac_document.includes('.png')) && (
                  <div className="mt-2">
                    <img 
                      src={getStorageUrl(level2Data.cac_document)} 
                      alt="CAC Document" 
                      className="w-full max-w-md h-auto rounded-lg border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => window.open(getStorageUrl(level2Data.cac_document), '_blank')}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg border">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Utility Bill</label>
                    {level2Data?.utility_bill ? (
                      <p className="text-sm text-gray-500 mt-1">Document available</p>
                    ) : (
                      <p className="text-sm text-gray-400 mt-1">No document uploaded</p>
                    )}
                  </div>
                  {level2Data?.utility_bill && (
                    <a 
                      href={getStorageUrl(level2Data.utility_bill)} 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2 cursor-pointer"
                    >
                      <img 
                        src={images.DownloadSimple} 
                        alt="Download" 
                        className="w-4 h-4"
                        onError={(e) => {
                          e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTggMkM4LjU1IDIgOSAyLjQ1IDkgM1Y5LjU5TDEwLjMgOC4yOUwxMSAxMEw4IDEzTDQgMTBMMTQuNyA4LjI5TDE1IDlWMTBIMTNWMTJDMTMgMTIuNTUgMTIuNTUgMTMgMTIgMTNINEMzLjQ1IDEzIDMgMTIuNTUgMyAxMlY5SDNWN0gxVjRIMFYySDhWNFYzQzggMi40NSA4IDIgOCAyWiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+';
                        }}
                      />
                      View/Download
                    </a>
                  )}
                </div>
                {level2Data?.utility_bill && (level2Data.utility_bill.includes('.jpg') || level2Data.utility_bill.includes('.jpeg') || level2Data.utility_bill.includes('.png')) && (
                  <div className="mt-2">
                    <img 
                      src={getStorageUrl(level2Data.utility_bill)} 
                      alt="Utility Bill" 
                      className="w-full max-w-md h-auto rounded-lg border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => window.open(getStorageUrl(level2Data.utility_bill), '_blank')}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Store Video */}
        <div>
          <label className="text-sm font-medium text-gray-600">Store Video</label>
          {level2Data?.store_video ? (
            <div className="mt-1">
              <video 
                src={getStorageUrl(level2Data.store_video)} 
                controls 
                className="w-full max-w-2xl h-auto rounded-lg shadow-md"
                preload="metadata"
              >
                Your browser does not support the video tag.
              </video>
            </div>
          ) : (
            <p className="text-sm text-gray-400 mt-1">No video uploaded</p>
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
          level={2}
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

export default ViewLevel2;
