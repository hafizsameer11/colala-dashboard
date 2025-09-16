import React, { useState } from "react";
import images from "../../../../constants/images";
import StoreRatingModal from "./storerating";

interface ProductRatingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProductRatingModal: React.FC<ProductRatingModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [showStoreModal, setShowStoreModal] = useState(false);
  const [selectedReviewData, setSelectedReviewData] = useState({
    storeName: "Sasha Stores",
    reviewer: "Adam Sandler",
    rating: 4,
    totalReviews: 20
  });

  if (!isOpen) return null;

  const handleReviewClick = (reviewData: any) => {
    setSelectedReviewData(reviewData);
    setShowStoreModal(true);
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 backdrop-brightness-50 bg-opacity-50 -mt-4   flex items-start justify-end " 
      onClick={handleOverlayClick}
      style={{ zIndex: 9999 }}
    >
      <div 
        className="bg-white   overflow-hidden h-[700px] w-[560px] shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-[16px] font-semibold text-black">
            Product Rating
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full cursor-pointer transition-colors"
          >
           <img src={images.close} alt="Close" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 h-[650px] -mt-6 overflow-y-auto">
          {/* Product Section */}
          <div className="flex flex-row gap-4 mb-6 mt-1 bg-gray-50 p-1 rounded-lg">
            <img 
              className="w-20 h-20 rounded-lg object-cover" 
              src={images.iphone} 
              alt="Product" 
            />
            <div className="flex flex-col justify-center">
              <h3 className="text-[12px] font-semibold text-black mb-1">
                Iphone 16 pro max - Black
              </h3>
              <p className="text-[#E53E3E] font-semibold text-[12px]">
                N2,500,000
              </p>
              <span className="bg-[#E53E3E] text-white text-[10px] px-2 py-1 rounded-full w-fit mt-1">
                View Product
              </span>
            </div>
          </div>

          <div className="mt-5">
            <div className="flex flex-row items-center justify-center gap-4 mt-5 mb-6">
              <span>
                <img className="w-10 h-10" src={images.start1} alt="" />
              </span>
              <span>
                <img className="w-10 h-10" src={images.start1} alt="" />
              </span>
              <span>
                <img className="w-10 h-10" src={images.start1} alt="" />
              </span>
              <span>
                <img className="w-10 h-10" src={images.start1} alt="" />
              </span>
              <span>
                <img className="w-10 h-10" src={images.start1} alt="" />
              </span>
              
            </div>
            <div className="flex flex-row justify-between border-b border-[#00000080] pb-4">
              <span className="text-[#E53E3E] text-[14px] ">4.5 Stars</span>
              <span className="text-[#E53E3E] text-[14px] ">20 Reviews</span>
            </div>
            
            {/* Review 1 - Adam Sandler */}
            <div 
              className="mt-5 border border-[#C3C3C3] rounded-2xl w-full p-3 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => handleReviewClick({
                storeName: "Sasha Stores",
                reviewer: "Adam Sandler", 
                rating: 4,
                totalReviews: 20
              })}
            >
              <div className="flex flex-row justify-between">
                <div className="flex flex-row gap-2">
                  <span>
                    <img className="w-10 h-10" src={images.admin} alt="" />
                  </span>
                  <div className="flex flex-col">
                    <span className="font-medium text-md text-black">
                      Adam Sandler
                    </span>
                    <div className="flex flex-row">
                      <span>
                        <img className="w-4 h-4" src={images.start1} alt="" />
                      </span>
                      <span>
                        <img className="w-4 h-4" src={images.start1} alt="" />
                      </span>
                      <span>
                        <img className="w-4 h-4" src={images.start1} alt="" />
                      </span>
                      <span>
                        <img className="w-4 h-4" src={images.start1} alt="" />
                      </span>
                      <span>
                        <img className="w-4 h-4" src={images.start1} alt="" />
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <span className="text-[#00000080] text-sm">07-16-25/05:33AM</span>
                </div>
              </div>
              <div className="mt-3 mb-3">
                <span className="text-sm">
                  Really great product, i enjoyed using it for a long time
                </span>
              </div>
              <div>
                <button className="bg-[#E53E3E] text-white rounded-full cursor-pointer px-6 py-1">
                  View Review
                </button>
              </div>
            </div>

            {/* Review 2 - Chris Pine with images */}
            <div 
              className="mt-5 border border-[#C3C3C3] rounded-2xl w-full p-3 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => handleReviewClick({
                storeName: "Sasha Stores",
                reviewer: "Chris Pine", 
                rating: 5,
                totalReviews: 20
              })}
            >
              <div className="flex flex-row justify-between mb-3">
                <div className="flex flex-row gap-2">
                  <span>
                    <img className="w-10 h-10" src={images.admin} alt="" />
                  </span>
                  <div className="flex flex-col">
                    <span className="font-medium text-md text-black">Chris Pine</span>
                    <div className="flex flex-row">
                      <span>
                        <img className="w-4 h-4" src={images.start1} alt="" />
                      </span>
                      <span>
                        <img className="w-4 h-4" src={images.start1} alt="" />
                      </span>
                      <span>
                        <img className="w-4 h-4" src={images.start1} alt="" />
                      </span>
                      <span>
                        <img className="w-4 h-4" src={images.start1} alt="" />
                      </span>
                      <span>
                        <img className="w-4 h-4" src={images.start1} alt="" />
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <span className="text-[#00000080] text-sm">07-16-25/05:33AM</span>
                </div>
              </div>
              <div className="flex flex-row mt-3 gap-2">
                <span>
                  <img className="w-15 h-15 rounded-lg" src={images.ivideo} alt="" />
                </span>
                <span>
                  <img className="w-15 h-15 rounded-lg" src={images.i10} alt="" />
                </span>
                <span>
                  <img className="w-15 h-15 rounded-lg" src={images.i1} alt="" />
                </span>
              </div>
              <div className="mt-3 mb-3">
                <span className="text-sm">
                  Really great product, i enjoyed using it for a long time
                </span>
              </div>
              <div>
                <button className="bg-[#E53E3E] text-white rounded-full cursor-pointer px-6 py-1">
                  View Review
                </button>
              </div>
            </div>

            {/* Review 3 - Adam Sandler */}
            <div 
              className="mt-5 border border-[#C3C3C3] rounded-2xl w-full p-3 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => handleReviewClick({
                storeName: "Sasha Stores",
                reviewer: "Adam Sandler", 
                rating: 4,
                totalReviews: 20
              })}
            >
              <div className="flex flex-row justify-between">
                <div className="flex flex-row gap-2">
                  <span>
                    <img className="w-10 h-10" src={images.admin} alt="" />
                  </span>
                  <div className="flex flex-col">
                    <span className="font-medium text-md text-black">
                      Adam Sandler
                    </span>
                    <div className="flex flex-row">
                      <span>
                        <img className="w-4 h-4" src={images.start1} alt="" />
                      </span>
                      <span>
                        <img className="w-4 h-4" src={images.start1} alt="" />
                      </span>
                      <span>
                        <img className="w-4 h-4" src={images.start1} alt="" />
                      </span>
                      <span>
                        <img className="w-4 h-4" src={images.start1} alt="" />
                      </span>
                      <span>
                        <img className="w-4 h-4" src={images.start1} alt="" />
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <span className="text-[#00000080] text-sm">07-16-25/05:33AM</span>
                </div>
              </div>
              <div className="mt-3 mb-3">
                <span className="text-sm">
                  Really great product, i enjoyed using it for a long time
                </span>
              </div>
              <div>
                <button className="bg-[#E53E3E] text-white rounded-full cursor-pointer px-6 py-1">
                  View Review
                </button>
              </div>
            </div>

            {/* Review 4 - Chris Pine with images */}
            <div 
              className="mt-5 border border-[#C3C3C3] rounded-2xl w-full p-3 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => handleReviewClick({
                storeName: "Sasha Stores",
                reviewer: "Chris Pine", 
                rating: 5,
                totalReviews: 20
              })}
            >
              <div className="flex flex-row justify-between mb-3">
                <div className="flex flex-row gap-2">
                  <span>
                    <img className="w-10 h-10" src={images.admin} alt="" />
                  </span>
                  <div className="flex flex-col">
                    <span className="font-medium text-md text-black">Chris Pine</span>
                    <div className="flex flex-row">
                      <span>
                        <img className="w-4 h-4" src={images.start1} alt="" />
                      </span>
                      <span>
                        <img className="w-4 h-4" src={images.start1} alt="" />
                      </span>
                      <span>
                        <img className="w-4 h-4" src={images.start1} alt="" />
                      </span>
                      <span>
                        <img className="w-4 h-4" src={images.start1} alt="" />
                      </span>
                      <span>
                        <img className="w-4 h-4" src={images.start1} alt="" />
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <span className="text-[#00000080] text-sm">07-16-25/05:33AM</span>
                </div>
              </div>
              <div className="flex flex-row mt-3 gap-2">
                <span>
                  <img className="w-15 h-15 rounded-lg" src={images.ivideo} alt="" />
                </span>
                <span>
                  <img className="w-15 h-15 rounded-lg" src={images.i10} alt="" />
                </span>
                <span>
                  <img className="w-15 h-15 rounded-lg" src={images.i1} alt="" />
                </span>
              </div>
              <div className="mt-3 mb-3">
                <span className="text-sm">
                  Really great product, i enjoyed using it for a long time
                </span>
              </div>
              <div>
                <button className="bg-[#E53E3E] text-white rounded-full cursor-pointer px-6 py-1">
                  View Review
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Store Rating Modal */}
      <StoreRatingModal 
        isOpen={showStoreModal}
        onClose={() => setShowStoreModal(false)}
        storeName={selectedReviewData.storeName}
        rating={selectedReviewData.rating}
        totalReviews={selectedReviewData.totalReviews}
      />
    </div>
  );
};

export default ProductRatingModal;
