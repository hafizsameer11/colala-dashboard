import React from "react";
import images from "../../../constants/images";

interface Review {
  id: string;
  reviewer: string;
  rating: number;
  date: string;
  comment: string;
  hasImages?: boolean;
}

interface StoreRatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeName: string;
  storeImage?: string;
  rating: number;
  totalReviews: number;
}

const StoreRatingModal: React.FC<StoreRatingModalProps> = ({
  isOpen,
  onClose,
  storeName,
  storeImage,
  rating,
  totalReviews,
}) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Sample reviews data
  const reviews: Review[] = [
    {
      id: "1",
      reviewer: "Adam Sandler",
      rating: 4,
      date: "07-16-25/05:33AM",
      comment: "Really great product, i enjoyed using it for a long time",
    },
    {
      id: "2",
      reviewer: "Adam Sandler",
      rating: 4,
      date: "07-16-25/05:33AM",
      comment: "Really great product, i enjoyed using it for a long time",
    },
    {
      id: "3",
      reviewer: "Adam Sandler",
      rating: 4,
      date: "07-16-25/05:33AM",
      comment: "Really great product, i enjoyed using it for a long time",
    },
    {
      id: "4",
      reviewer: "Adam Sandler",
      rating: 4,
      date: "07-16-25/05:33AM",
      comment: "Really great product, i enjoyed using it for a long time",
    },
  ];

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
              {storeName} Store Rating
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
          {/* Store Cover Section */}
          <div className="relative h-30 mt-10 ml-5 mb-14">
            {/* Background Cover Image */}
            <div
              className="w-[512px] h-full  bg-cover bg-center bg-no-repeat rounded-2xl"
              style={{
                backgroundImage: `url(${images.cover1})`,
              }}
            >
              {/* Overlay for better text readability */}
              <div className="absolute inset-0 bg-opacity-30 rounded-t-lg"></div>
            </div>

            {/* Profile Section - Overlaid on cover */}
            <div className="absolute -bottom-12 left-6 flex flex-row gap-4 items-end">
              <div className="relative">
                <img
                  className="w-18 h-18 rounded-full object-cover  shadow-lg"
                  src={storeImage || images.sasha}
                  alt="Store"
                />
              </div>
              <div className="flex flex-col justify-end pb-3">
                <h3 className="text-[18px] font-semibold text-black mb-1 drop-shadow-lg">
                  {storeName}
                </h3>
              </div>
            </div>
          </div>

          {/* Content with padding */}
          <div className="px-6 mt-4">
            {/* Star Rating Section */}
            <div className="flex flex-row items-center justify-center gap-5 mb-6">
              {renderMainStars(rating)}
            </div>

            {/* Rating Stats */}
            <div className="flex flex-row justify-between border-b border-[#00000080] pb-4 mb-6">
              <span className="text-[#E53E3E] text-[14px]">
                {rating}.5 Stars
              </span>
              <span className="text-[#E53E3E] text-[14px]">
                {totalReviews} Reviews
              </span>
            </div>

            {/* Reviews */}
            <div className="space-y-5">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="border border-[#C3C3C3] rounded-2xl w-full p-3"
                >
                  <div className="flex flex-row justify-between mb-3">
                    <div className="flex flex-row gap-2">
                      <span>
                        <img className="w-10 h-10" src={images.admin} alt="" />
                      </span>
                      <div className="flex flex-col">
                        <span className="font-medium text-md text-black">
                          {review.reviewer}
                        </span>
                        <div className="flex flex-row">
                          {renderStars(review.rating)}
                        </div>
                      </div>
                    </div>
                    <div>
                      <span className="text-[#00000080] text-sm">
                        {review.date}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 mb-3">
                    <span className="text-sm">{review.comment}</span>
                  </div>
                  <div>
                    <button className="bg-[#E53E3E] text-white rounded-full cursor-pointer px-6 py-1">
                      Delete Review
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreRatingModal;
