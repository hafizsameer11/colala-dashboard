import React, { useState } from "react";
import images from "../../../../constants/images";

interface ViewLevel1Props {
  storeDetails?: any;
  onStatusUpdate: (status: string, notes?: string, sendNotification?: boolean) => void;
  onLevelUpdate: (level: number, notes?: string) => void;
  isLoading?: boolean;
}

const ViewLevel1: React.FC<ViewLevel1Props> = ({
  storeDetails,
  onStatusUpdate,
  onLevelUpdate,
  isLoading = false,
}) => {
  const [showStatusUpdate, setShowStatusUpdate] = useState(false);
  const [showLevelUpdate, setShowLevelUpdate] = useState(false);
  const [status, setStatus] = useState(storeDetails?.onboarding_progress?.status || "pending");
  const [level, setLevel] = useState(storeDetails?.onboarding_progress?.onboarding_level || 1);
  const [notes, setNotes] = useState("");
  const [sendNotification, setSendNotification] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const storeInfo = storeDetails?.store_info;
  const ownerInfo = storeDetails?.owner_info;
  const level1Data = storeDetails?.level_1_data;

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
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-[#E53E3E] rounded-lg flex items-center justify-center">
            <img 
              src={images.store} 
              alt="Store" 
              className="w-6 h-6"
              onError={(e) => {
                e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTMgM1YyMUgyMVYzSDNaTTUgNUgxOVYxOUg1VjVaIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4=';
              }}
            />
          </div>
          <h3 className="text-xl font-semibold text-gray-900">Store Information</h3>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Store Name</label>
            <p className="text-lg font-semibold text-gray-900">{storeInfo?.name || "N/A"}</p>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Store Email</label>
            <p className="text-lg text-gray-900">{storeInfo?.email || "N/A"}</p>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Store Phone</label>
            <p className="text-lg text-gray-900">{storeInfo?.phone || "N/A"}</p>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Location</label>
            <p className="text-lg text-gray-900">{storeInfo?.location || "N/A"}</p>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Status</label>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(storeInfo?.status)}`}>
              {storeInfo?.status || "N/A"}
            </span>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Onboarding Level</label>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#E53E3E] rounded-full flex items-center justify-center text-white font-bold text-sm">
                {storeInfo?.onboarding_level || "N/A"}
              </div>
              <span className="text-lg font-semibold text-gray-900">Level {storeInfo?.onboarding_level || "N/A"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Owner Information */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <img 
              src={images.admin} 
              alt="Owner" 
              className="w-6 h-6"
              onError={(e) => {
                e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiIHN0cm9rZT0iIzYzNjZGIiBzdHJva2Utd2lkdGg9IjIiLz4KPHBhdGggZD0iTTEyIDEwQzE1LjU4IDEwIDEyIDEzLjU4IDEyIDE4UzE1LjU4IDI2IDEyIDI2UzI4IDIyLjQyIDI4IDE4UzI0LjQyIDEwIDEyIDEwWk0xMiAyNEMxNi42OSAyNCAxNCAyMS4zMSAxNCAxOFMxNi42OSAxMiAxMiAxMlMyNiAxNC42OSAyNiAxOFMyMy4zMSAyNCAxMiAyNFoiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPg==';
              }}
            />
          </div>
          <h3 className="text-xl font-semibold text-gray-900">Owner Information</h3>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Owner Name</label>
            <p className="text-lg font-semibold text-gray-900">{ownerInfo?.name || "N/A"}</p>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Owner Email</label>
            <p className="text-lg text-gray-900">{ownerInfo?.email || "N/A"}</p>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Owner Phone</label>
            <p className="text-lg text-gray-900">{ownerInfo?.phone || "N/A"}</p>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Role</label>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              {ownerInfo?.role || "N/A"}
            </span>
          </div>
        </div>
      </div>

      {/* Level 1 Data */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
            <img 
              src={images.analyticsIcon} 
              alt="Level 1" 
              className="w-6 h-6"
              onError={(e) => {
                e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTMgM1YyMUgyMVYzSDNaTTUgNUgxOVYxOUg1VjVaIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8cGF0aCBkPSJNNyAxM0wxMCAxMEwxMyAxM0wxNyA5IiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4=';
              }}
            />
          </div>
          <h3 className="text-xl font-semibold text-gray-900">Level 1 Data</h3>
        </div>
        
        {/* Profile & Banner Images */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Profile Image</label>
            {level1Data?.profile_image ? (
              <div className="relative">
                <img 
                  src={level1Data.profile_image} 
                  alt="Profile" 
                  className="w-24 h-24 object-cover rounded-xl border-2 border-gray-200"
                  onError={(e) => {
                    e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOTYiIGhlaWdodD0iOTYiIHZpZXdCb3g9IjAgMCA5NiA5NiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iNDgiIGN5PSI0OCIgcj0iNDgiIGZpbGw9IiNGM0Y0RjYiLz4KPHBhdGggZD0iTTQ4IDI0QzUzLjUyMjggMjQgNTggMjguNDc3MiA1OCAzNFM1My41MjI4IDQ0IDQ4IDQ0UzM4IDM5LjUyMjggMzggMzRTNDIuNDc3MiAyNCA0OCAyNFoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+';
                  }}
                />
              </div>
            ) : (
              <div className="w-24 h-24 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-8 h-8 bg-gray-300 rounded-full mx-auto mb-2"></div>
                  <span className="text-gray-400 text-xs">No Image</span>
                </div>
              </div>
            )}
          </div>
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Banner Image</label>
            {level1Data?.banner_image ? (
              <div className="relative">
                <img 
                  src={level1Data.banner_image} 
                  alt="Banner" 
                  className="w-24 h-24 object-cover rounded-xl border-2 border-gray-200"
                  onError={(e) => {
                    e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOTYiIGhlaWdodD0iOTYiIHZpZXdCb3g9IjAgMCA5NiA5NiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9Ijk2IiBoZWlnaHQ9Ijk2IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik00OCA0OEw2MCA2MEw0OCA3MkwzNiA2MEw0OCA0OFoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+';
                  }}
                />
              </div>
            ) : (
              <div className="w-24 h-24 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-8 h-8 bg-gray-300 rounded-full mx-auto mb-2"></div>
                  <span className="text-gray-400 text-xs">No Image</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Categories */}
        <div className="mb-6">
          <label className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3 block">Categories</label>
          <div className="flex flex-wrap gap-2">
            {level1Data?.categories?.length > 0 ? (
              level1Data.categories.map((category: any, index: number) => (
                <span key={index} className="bg-[#E53E3E] text-white px-3 py-1 rounded-full text-sm font-medium">
                  {category.name}
                </span>
              ))
            ) : (
              <span className="text-gray-400 text-sm italic">No categories available</span>
            )}
          </div>
        </div>

        {/* Social Links */}
        <div>
          <label className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3 block">Social Links</label>
          <div className="space-y-2">
            {level1Data?.social_links?.length > 0 ? (
              level1Data.social_links.map((link: any, index: number) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-sm capitalize">{link.type.charAt(0)}</span>
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-700 capitalize">{link.type}</span>
                    <div className="text-sm text-gray-500 truncate">{link.url}</div>
                  </div>
                  <a 
                    href={link.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Visit →
                  </a>
                </div>
              ))
            ) : (
              <span className="text-gray-400 text-sm italic">No social links available</span>
            )}
          </div>
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

export default ViewLevel1;
