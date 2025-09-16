import React, { useState } from "react";
import ProductRatingModal from "./productrating";

interface RatingReview {
  id: string;
  storeName: string;
  noOfReviews: number;
  averageRating: number;
  lastRating: string;
  other: string;
}

interface RatingAndReviewTableProps {
  title?: string;
  onRowSelect?: (selectedIds: string[]) => void;
}

const RatingAndReviewTable: React.FC<RatingAndReviewTableProps> = ({
  onRowSelect,
}) => {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showProductRatingModal, setShowProductRatingModal] = useState(false);

  // Sample data based on the image
  const ratingReviews: RatingReview[] = [
    {
      id: "1",
      storeName: "Benny's Bakery",
      noOfReviews: 56,
      averageRating: 5,
      lastRating: "18-07-2025/06:22AM",
      other: "View Reviews",
    },
    {
      id: "2",
      storeName: "Gadget Galaxy",
      noOfReviews: 86,
      averageRating: 3,
      lastRating: "05-06-2025/09:00AM",
      other: "View Reviews",
    },
    {
      id: "3",
      storeName: "The Corner Shop",
      noOfReviews: 340,
      averageRating: 5,
      lastRating: "20-07-2025/05:45PM",
      other: "View Reviews",
    },
    {
      id: "4",
      storeName: "Sasha Stores",
      noOfReviews: 25,
      averageRating: 4,
      lastRating: "20-07-2025/07:58PM",
      other: "View Reviews",
    },
    {
      id: "5",
      storeName: "Mia's Boutique",
      noOfReviews: 15,
      averageRating: 4,
      lastRating: "15-07-2025/11:30AM",
      other: "View Reviews",
    },
    {
      id: "6",
      storeName: "J.P. Haberdashery",
      noOfReviews: 9,
      averageRating: 4,
      lastRating: "19-07-2025/10:11PM",
      other: "View Reviews",
    },
    {
      id: "7",
      storeName: "Leo's Emporium",
      noOfReviews: 112,
      averageRating: 5,
      lastRating: "19-07-2025/02:15PM",
      other: "View Reviews",
    },
  ];

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center justify-center gap-1">
        <span className=" text-black font-semibold">{rating}</span>
        <span className="text-[#E53E3E] ">★</span>
      </div>
    );
  };

  const handleViewReviews = () => {
    setShowProductRatingModal(true);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRows([]);
    } else {
      setSelectedRows(ratingReviews.map((ratingReview) => ratingReview.id));
    }
    setSelectAll(!selectAll);

    if (onRowSelect) {
      onRowSelect(
        selectAll ? [] : ratingReviews.map((ratingReview) => ratingReview.id)
      );
    }
  };

  const handleRowSelect = (ratingReviewId: string) => {
    let newSelectedRows;
    if (selectedRows.includes(ratingReviewId)) {
      newSelectedRows = selectedRows.filter((id) => id !== ratingReviewId);
    } else {
      newSelectedRows = [...selectedRows, ratingReviewId];
    }

    setSelectedRows(newSelectedRows);
    setSelectAll(newSelectedRows.length === ratingReviews.length);

    if (onRowSelect) {
      onRowSelect(newSelectedRows);
    }
  };

  return (
    <div className="border border-[#989898] rounded-2xl w-[1160px] ml-1 mt-4 mb-4">
      <div className="bg-white p-5 rounded-t-2xl font-semibold text-[16px] border-b border-[#989898]">
        Reviews & Ratings
      </div>
      <div className="bg-white rounded-b-2xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#F2F2F2]">
            <tr>
              <th className="text-center p-3 font-normal w-12">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                  className="w-5 h-5 border border-gray-300 rounded cursor-pointer"
                />
              </th>
              <th className="text-left p-3 font-normal">Store Name</th>
              <th className="text-left p-3 font-normal">No of reviews</th>
              <th className="text-center p-3 font-normal">Average rating</th>
              <th className="text-center p-3 font-normal">Last Rating</th>
              <th className="text-center p-3 font-normal">Other</th>
            </tr>
          </thead>
          <tbody>
            {ratingReviews.map((ratingReview, index) => (
              <tr
                key={ratingReview.id}
                className={`border-t border-[#E5E5E5] transition-colors ${
                  index === ratingReviews.length - 1 ? "" : "border-b"
                }`}
              >
                <td className="p-4">
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(ratingReview.id)}
                    onChange={() => handleRowSelect(ratingReview.id)}
                    className="w-5 h-5 border border-gray-300 rounded cursor-pointer text-center"
                  />
                </td>
                <td className="p-4 text-black text-left">
                  {ratingReview.storeName}
                </td>
                <td className="p-4 text-black text-left">
                  {ratingReview.noOfReviews}
                </td>
                <td className="p-4 text-center">
                  {renderStars(ratingReview.averageRating)}
                </td>
                <td className="p-4 text-black text-center">
                  {ratingReview.lastRating}
                </td>
                <td className="p-4 text-center">
                  <button
                    onClick={() => handleViewReviews()}
                    className="px-6 py-2 rounded-lg font-medium transition-colors cursor-pointer bg-[#E53E3E] text-white hover:bg-[#D32F2F]"
                  >
                    View Reviews
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Product Rating Modal */}
      <ProductRatingModal
        isOpen={showProductRatingModal}
        onClose={() => setShowProductRatingModal(false)}
      />
    </div>
  );
};

export default RatingAndReviewTable;
