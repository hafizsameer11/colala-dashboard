import React from "react";
import images from "../../../../constants/images";
import { useQuery } from "@tanstack/react-query";
import { getReferralDetails } from "../../../../utils/queries/referrals";

interface ViewAllModalProps {
  isOpen: boolean;
  onClose: () => void;
  referrerName?: string;
  referrerId?: string;
}

const ViewAllModal: React.FC<ViewAllModalProps> = ({
  isOpen,
  onClose,
  referrerName = "Unknown",
  referrerId,
}) => {
  // Fetch referral details when modal is open and referrerId is provided
  const { data: referralDetails, isLoading, error } = useQuery({
    queryKey: ['referralDetails', referrerId],
    queryFn: () => getReferralDetails(referrerId!),
    enabled: isOpen && !!referrerId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const referredUsers = referralDetails?.data?.referred_users?.data || [];
  const referrerStats = referralDetails?.data?.referrer_stats;

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 backdrop-brightness-50 bg-opacity-50 flex items-start justify-end -mt-3 z-[9999]" 
      onClick={handleOverlayClick}
      style={{ zIndex: 9999 }}
    >
      <div 
        className="bg-white  w-[560px] h-[530px] overflow-hidden shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 mt-2 border-b  border-[#DDDDDD]">
          <h2 className="text-[16px] font-semibold text-black">
            Users Referred by {referrerName} ({referrerStats?.total_referred || 0})
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full transition-colors"
          >
           <img className="w-7 h-7 cursor-pointer" src={images.close} alt="Close" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 max-h-[500px] overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E53E3E]"></div>
            </div>
          ) : error ? (
            <div className="text-center text-red-500 py-4">
              <p>Error loading referral details</p>
            </div>
          ) : referredUsers.length === 0 ? (
            <div className="text-center text-gray-500 py-4">
              <p>No referred users found</p>
            </div>
          ) : (
            <div className="space-y-1">
              {referredUsers.map((user: any) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between py-3 rounded-2xl border border-[#DDDDDD]"
                >
                  <div className="flex items-center space-x-3 ml-4">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-200">
                      <span className="text-sm font-medium text-gray-600">
                        {user.full_name?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[14px] font-medium text-black">
                        {user.full_name}
                      </span>
                      <span className="text-[12px] text-gray-500">
                        {user.email}
                      </span>
                      <span className="text-[12px] text-blue-600">
                        {user.role || 'Unknown Role'}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] mr-4 text-gray-500">
                    {new Date(user.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewAllModal;
