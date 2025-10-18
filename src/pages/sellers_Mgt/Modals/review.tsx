import images from "../../../constants/images";

interface ReviewProps {
  reviews?: any[];
  statistics?: any;
}

const Reviews: React.FC<ReviewProps> = ({ reviews = [], statistics }) => {
  // If no reviews, show a proper message
  if (!reviews || reviews.length === 0) {
    return (
      <div className="mt-5">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Reviews Yet</h3>
          <p className="text-gray-500 text-center">This product doesn't have any reviews yet. Be the first to review it!</p>
        </div>
      </div>
    );
  }

  // Helper function to render star rating
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <img 
          key={i}
          className="w-6 h-6" 
          src={images.start1} 
          alt="Star" 
          onError={(e) => {
            e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTUuMDkgOC4wOUwyMiA5LjE4TDE3IDEzLjA5TDE4LjgyIDIyTDEyIDE4LjA5TDUuMTggMjJMNyAxMy4wOUwyIDkuMThMOS4wOSA4LjA5TDEyIDJaIiBmaWxsPSIjRkZEMDAwIi8+Cjwvc3ZnPg==';
          }}
        />
      );
    }
    
    if (hasHalfStar) {
      stars.push(
        <img 
          key="half"
          className="w-6 h-6" 
          src={images.star2} 
          alt="Half Star" 
          onError={(e) => {
            e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTUuMDkgOC4wOUwyMiA5LjE4TDE3IDEzLjA5TDE4LjgyIDIyTDEyIDE4LjA5TDUuMTggMjJMNyAxMy4wOUwyIDkuMThMOS4wOSA4LjA5TDEyIDJaIiBmaWxsPSIjRkZEMDAwIi8+Cjwvc3ZnPg==';
          }}
        />
      );
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <img 
          key={`empty-${i}`}
          className="w-6 h-6" 
          src={images.star2} 
          alt="Empty Star" 
          onError={(e) => {
            e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTUuMDkgOC4wOUwyMiA5LjE4TDE3IDEzLjA5TDE4LjgyIDIyTDEyIDE4LjA5TDUuMTggMjJMNyAxMy4wOUwyIDkuMThMOS4wOSA4LjA5TDEyIDJaIiBmaWxsPSIjRkZEMDAwIi8+Cjwvc3ZnPg==';
          }}
        />
      );
    }
    
    return stars;
  };

  return (
    <div className="mt-5">
      {/* Overall Rating Display */}
      <div className="flex flex-row items-center justify-center gap-2 mt-10 mb-10">
        {renderStars(statistics?.average_rating || 0)}
      </div>
      
      <div className="flex flex-row justify-between border-b border-[#00000080] pb-4">
        <span className="text-[#E53E3E] text-lg">{statistics?.average_rating || 0} Stars</span>
        <span className="text-[#E53E3E] text-lg">{statistics?.total_reviews || 0} Reviews</span>
      </div>

      {/* Individual Reviews */}
      <div className="mt-5 space-y-5">
        {reviews.map((review: any, index: number) => (
          <div key={index} className="border border-[#C3C3C3] rounded-2xl w-full p-3">
            <div className="flex flex-row justify-between">
              <div className="flex flex-row gap-2">
                <span>
                  <img 
                    className="w-10 h-10 rounded-full" 
                    src={review.user?.avatar || images.admin} 
                    alt="User Avatar" 
                    onError={(e) => {
                      e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiM2MzY2RjEiLz4KPHBhdGggZD0iTTIwIDEwQzE1LjU4IDEwIDEyIDEzLjU4IDEyIDE4UzE1LjU4IDI2IDIwIDI2UzI4IDIyLjQyIDI4IDE4UzI0LjQyIDEwIDIwIDEwWk0yMCAyNEMxNi42OSAyNCAxNCAyMS4zMSAxNCAxOFMxNi42OSAxMiAyMCAxMlMyNiAxNC42OSAyNiAxOFMyMy4zMSAyNCAyMCAyNFoiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPg==';
                    }}
                  />
                </span>
                <div className="flex flex-col">
                  <span className="font-medium text-md text-black">
                    {review.user?.name || review.user_name || 'Anonymous User'}
                  </span>
                  <div className="flex flex-row">
                    {renderStars(review.rating || 0)}
                  </div>
                </div>
              </div>
              <div>
                <span className="text-[#00000080] text-sm">
                  {review.created_at ? new Date(review.created_at).toLocaleDateString() : 'No date'}
                </span>
              </div>
            </div>
            
            {/* Review Images if any */}
            {review.images && review.images.length > 0 && (
              <div className="flex flex-row mt-3 gap-2">
                {review.images.map((image: any, imgIndex: number) => (
                  <span key={imgIndex}>
                    <img 
                      className="w-15 h-15 rounded-lg object-cover" 
                      src={image.path || image} 
                      alt={`Review image ${imgIndex + 1}`}
                      onError={(e) => {
                        e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0zMCAzMEw0MCA0MEwzMCA1MEwyMCA0MEwzMCAzMFoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+';
                      }}
                    />
                  </span>
                ))}
              </div>
            )}
            
            <div className="mt-3 mb-3">
              <span className="text-sm">
                {review.comment || review.review_text || 'No comment provided'}
              </span>
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
  );
};

export default Reviews;
