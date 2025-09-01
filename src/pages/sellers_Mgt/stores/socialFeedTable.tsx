import React, { useState } from "react";
import SocialFeedModel from "../Modals/socialFeedModal";

interface SocialFeed {
  id: string;
  storeName: string;
  type: "Post Like" | "Post Comment" | "Post Saved";
  post: string;
  date: string;
}

interface SocialFeedTableProps {
  title?: string;
  onRowSelect?: (selectedIds: string[]) => void;
}

const SocialFeedTable: React.FC<SocialFeedTableProps> = ({
  title = "Latest Posts",
  onRowSelect,
}) => {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedSocialFeed, setSelectedSocialFeed] =
    useState<SocialFeed | null>(null);

  // Sample data based on the image
  const socialFeeds: SocialFeed[] = [
    {
      id: "1",
      storeName: "Sasha Stores",
      type: "Post Like",
      post: "This is nice......",
      date: "18-07-2025/11:30AM",
    },
    {
      id: "2",
      storeName: "Sasha Stores",
      type: "Post Comment",
      post: "This is nice......",
      date: "18-07-2025/11:30AM",
    },
    {
      id: "3",
      storeName: "Sasha Stores",
      type: "Post Saved",
      post: "This is nice......",
      date: "18-07-2025/11:30AM",
    },
    {
      id: "4",
      storeName: "Sasha Stores",
      type: "Post Like",
      post: "This is nice......",
      date: "18-07-2025/11:30AM",
    },
    {
      id: "5",
      storeName: "Sasha Stores",
      type: "Post Like",
      post: "This is nice......",
      date: "18-07-2025/11:30AM",
    },
    {
      id: "6",
      storeName: "Sasha Stores",
      type: "Post Like",
      post: "This is nice......",
      date: "18-07-2025/11:30AM",
    },
    {
      id: "7",
      storeName: "Sasha Stores",
      type: "Post Like",
      post: "This is nice......",
      date: "18-07-2025/11:30AM",
    },
  ];

  const handleShowDetails = (socialFeed: SocialFeed) => {
    setSelectedSocialFeed(socialFeed);
    setShowModal(true);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRows([]);
    } else {
      setSelectedRows(socialFeeds.map((socialFeed) => socialFeed.id));
    }
    setSelectAll(!selectAll);

    if (onRowSelect) {
      onRowSelect(
        selectAll ? [] : socialFeeds.map((socialFeed) => socialFeed.id)
      );
    }
  };

  const handleRowSelect = (socialFeedId: string) => {
    let newSelectedRows;
    if (selectedRows.includes(socialFeedId)) {
      newSelectedRows = selectedRows.filter((id) => id !== socialFeedId);
    } else {
      newSelectedRows = [...selectedRows, socialFeedId];
    }

    setSelectedRows(newSelectedRows);
    setSelectAll(newSelectedRows.length === socialFeeds.length);

    if (onRowSelect) {
      onRowSelect(newSelectedRows);
    }
  };

  return (
    <div className="border border-[#989898] rounded-2xl mt-5">
      <div className="bg-white p-5 rounded-t-2xl font-semibold text-[16px] border-b border-[#989898]">
        {title}
      </div>
      <div className="bg-white rounded-b-2xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#F2F2F2]">
            <tr>
              <th className="text-center p-3 font-semibold text-[14px] w-12">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                  className="w-5 h-5 border border-gray-300 rounded cursor-pointer"
                />
              </th>
              <th className="text-left p-3 font-semibold text-[14px]">
                Store Name
              </th>
              <th className="text-left p-3 font-semibold text-[14px]">Type</th>
              <th className="text-left p-3 font-semibold text-[14px]">Post</th>
              <th className="text-center p-3 font-semibold text-[14px]">
                Date
              </th>
              <th className="text-center p-3 font-semibold text-[14px]">
                Other
              </th>
            </tr>
          </thead>
          <tbody>
            {socialFeeds.map((socialFeed, index) => (
              <tr
                key={socialFeed.id}
                className={`border-t border-[#E5E5E5] transition-colors ${
                  index === socialFeeds.length - 1 ? "" : "border-b"
                }`}
              >
                <td className="p-4">
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(socialFeed.id)}
                    onChange={() => handleRowSelect(socialFeed.id)}
                    className="w-5 h-5 border border-gray-300 rounded cursor-pointer text-center"
                  />
                </td>
                <td className="p-4 text-[14px] text-black text-left">
                  {socialFeed.storeName}
                </td>
                <td className="p-4 text-[14px] text-black text-left">
                  {socialFeed.type}
                </td>
                <td className="p-4 text-[14px] text-black text-left">
                  {socialFeed.post}
                </td>
                <td className="p-4 text-[14px]  text-black text-center">
                  {socialFeed.date}
                </td>
                <td className="p-4 text-center">
                  <button
                    onClick={() => handleShowDetails(socialFeed)}
                    className="bg-[#E53E3E] text-white px-6 py-2.5 rounded-lg text-[15px] font-medium hover:bg-[#D32F2F] transition-colors cursor-pointer"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <SocialFeedModel
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </div>
  );
};

export default SocialFeedTable;
