import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getStoreReviewDetails } from "../../../../utils/queries/users";
import images from "../../../../constants/images";

// Removed unused Review interface

interface ReviewData {
  id: string;
  type: "Store" | "Product";
  storeName: string;
  noOfReviews: number;
  averageRating: number;
  lastRating: string;
  other: string;
  user?: {
    id: number;
    full_name: string;
    email: string;
  };
  store?: {
    id: number;
    store_name: string;
  };
  comment?: string;
  images?: string[];
}


interface StoreRatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  reviewData?: ReviewData | null;
}

const StoreRatingModal: React.FC<StoreRatingModalProps> = ({
  isOpen,
  onClose,
  reviewData,
}) => {
  // Extract review ID from the reviewData
  const reviewId = reviewData?.id?.replace('store-', '') || '';

  // Fetch detailed review data
  const { data: reviewDetailsData, isLoading, error } = useQuery({
    queryKey: ['storeReviewDetails', reviewId],
    queryFn: () => getStoreReviewDetails(reviewId),
    enabled: isOpen && !!reviewId,
  });

  // Debug logging
  console.log('Store Review Details Debug:', reviewDetailsData);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <span key={i}>
          <img
            className="w-4 h-4"
            src={i < rating ? images.start1 : images.star2}
            alt=""
          />
        </span>
      );
    }
    return stars;
  };

  const renderMainStars = (rating: number) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <span key={i}>
          <svg
            className={`w-8 h-8 ${
              i < rating ? "text-[#E53E3E]" : "text-gray-300"
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </span>
      );
    }
    return stars;
  };

  return (
    <div
      className="fixed inset-0 backdrop-brightness-50 bg-opacity-50 flex items-start justify-end"
      onClick={handleOverlayClick}
      style={{ zIndex: 10000 }}
    >
      <div
        className="bg-white overflow-hidden h-[700px] w-[560px] shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-black">
              {isLoading ? 'Loading...' : reviewDetailsData?.data?.store?.store_name || 'Store'} Review Details
            </h2>
          </div>

          <div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full cursor-pointer transition-colors"
            >
              <img src={images.close} alt="Close" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="h-[600px] -mt-6 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-lg">Loading review details...</div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-lg text-red-600">Error loading review details. Please try again.</div>
            </div>
          ) : reviewDetailsData?.data ? (
            <>
              {/* Store Cover Section */}
              <div className="relative h-30 mt-10 ml-5 mb-14">
                {/* Background Cover Image */}
                <div
                  className="w-[512px] h-full bg-cover bg-center bg-no-repeat rounded-2xl"
                  style={{
                    backgroundImage: `url(${
                      reviewDetailsData?.data?.store?.banner_image 
                        ? `https://colala.hmstech.xyz/storage/${reviewDetailsData.data.store.banner_image}`
                        : images.cover
                    })`,
                  }}
                >
                  {/* Overlay for better text readability */}
                  <div className="absolute inset-0 bg-opacity-30 rounded-t-lg"></div>
                </div>

                {/* Profile Section - Overlaid on cover */}
                <div className="absolute -bottom-12 left-6 flex flex-row gap-4 items-end">
                  <div className="relative">
                    <img
                      className="w-18 h-18 rounded-full object-cover shadow-lg"
                      src={reviewDetailsData?.data?.store?.profile_image ? `https://colala.hmstech.xyz/storage/${reviewDetailsData.data.store.profile_image}` : images.sasha}
                      alt="Store"
                      onError={(e) => {
                        e.currentTarget.src = images.sasha;
                      }}
                    />
                  </div>
                  <div className="flex flex-col justify-end pb-3">
                    <h3 className="text-[18px] font-semibold text-black mb-1 drop-shadow-lg">
                      {reviewDetailsData?.data?.store?.store_name || 'Unknown Store'}
                    </h3>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-lg">No review data available</div>
            </div>
          )}

          {reviewDetailsData?.data && (
            <>
              {/* Content with padding */}
              <div className="px-6 mt-4">
                {/* Star Rating Section */}
                <div className="flex flex-row items-center justify-center gap-5 mb-6">
                  {renderMainStars(reviewDetailsData?.data?.rating || 0)}
                </div>

                {/* Rating Stats */}
                <div className="flex flex-row justify-between border-b border-[#00000080] pb-4 mb-6">
                  <span className="text-[#E53E3E] text-[14px]">
                    {reviewDetailsData?.data?.rating || 0} Stars
                  </span>
                  <span className="text-[#E53E3E] text-[14px]">
                    Review ID: {reviewDetailsData?.data?.id || 'N/A'}
                  </span>
                </div>

                {/* Review Details */}
                <div className="space-y-5">
                  <div className="border border-[#C3C3C3] rounded-2xl w-full p-3">
                    <div className="flex flex-row justify-between mb-3">
                      <div className="flex flex-row gap-2">
                        <span>
                          <img 
                            className="w-10 h-10 rounded-full object-cover" 
                            src={reviewDetailsData?.data?.user?.profile_picture ? `https://colala.hmstech.xyz/storage/${reviewDetailsData.data.user.profile_picture}` : images.admin} 
                            alt="User"
                            onError={(e) => {
                              e.currentTarget.src = images.admin;
                            }}
                          />
                        </span>
                        <div className="flex flex-col">
                          <span className="font-medium text-md text-black">
                            {reviewDetailsData?.data?.user?.full_name || 'Unknown User'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {reviewDetailsData?.data?.user?.email || 'No email'}
                          </span>
                          <div className="flex flex-row">
                            {renderStars(reviewDetailsData?.data?.rating || 0)}
                          </div>
                        </div>
                      </div>
                      <div>
                        <span className="text-[#00000080] text-sm">
                          {reviewDetailsData?.data?.formatted_date || reviewDetailsData?.data?.created_at || 'Unknown date'}
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 mb-3">
                      <span className="text-sm">{reviewDetailsData?.data?.comment || 'No comment provided'}</span>
                    </div>
                    {reviewDetailsData?.data?.images && reviewDetailsData.data.images.length > 0 && (
                      <div className="mb-3">
                        <div className="flex flex-row gap-2">
                          {reviewDetailsData.data.images.map((image: string, index: number) => (
                            <img
                              key={index}
                              className="w-16 h-16 rounded-lg object-cover cursor-pointer hover:opacity-80 transition-opacity"
                              src={`https://colala.hmstech.xyz/storage/${image}`}
                              alt={`Review Image ${index + 1}`}
                              onClick={() => window.open(`https://colala.hmstech.xyz/storage/${image}`, '_blank')}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                    <div>
                      <button className="bg-[#E53E3E] text-white rounded-full cursor-pointer px-6 py-1">
                        Delete Review
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default StoreRatingModal;
