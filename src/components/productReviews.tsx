import React from "react";
import images from "../constants/images";

interface ProductReviewsProps {
  productData?: any;
}

const ProductReviews: React.FC<ProductReviewsProps> = ({ productData }) => {
  return (
    <div className="mt-5">
      <div className="flex flex-row items-center justify-center gap-2 mt-10 mb-10">
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
          <img className="w-10 h-10" src={images.star2} alt="" />
        </span>
      </div>
      <div className="flex flex-row justify-between border-b border-[#00000080] pb-4">
        <span className="text-[#E53E3E] text-lg ">
          {productData?.compelete?.product?.average_rating || '0.0'} Stars
        </span>
        <span className="text-[#E53E3E] text-lg ">
          {productData?.compelete?.reviews?.length || 0} Reviews
        </span>
      </div>
      {/* Reviews List */}
      {productData?.compelete?.reviews && productData.compelete.reviews.length > 0 ? (
        productData.compelete.reviews.map((review: any, index: number) => (
          <div key={index} className="mt-5 border border-[#C3C3C3] rounded-2xl w-full p-3">
            <div className="flex flex-row justify-between">
              <div className="flex flex-row gap-2">
                <span>
                  <img className="w-10 h-10" src={images.admin} alt="" />
                </span>
                <div className="flex-flex-col">
                  <span className="font-medium text-md text-black">
                    {review.user_name || 'Anonymous'}
                  </span>
                  <div className="flex flex-row">
                    {[...Array(5)].map((_, starIndex) => (
                      <span key={starIndex}>
                        <img 
                          src={starIndex < (review.rating || 0) ? images.start1 : images.star2} 
                          alt="" 
                        />
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <span className="text-[#00000080] text-sm">
                  {review.created_at || 'N/A'}
                </span>
              </div>
            </div>
            <div className="mt-3 mb-3">
              <span className="text-sm">
                {review.comment || 'No comment provided'}
              </span>
            </div>
            <div>
              <button className="bg-[#E53E3E] text-white rounded-full cursor-pointer px-6 py-1">
                Delete Review
              </button>
            </div>
          </div>
        ))
      ) : (
        <div className="mt-5 border border-[#C3C3C3] rounded-2xl w-full p-3 text-center">
          <span className="text-[#00000080] text-sm">No reviews available for this product</span>
        </div>
      )}
    </div>
  );
};

export default ProductReviews;
