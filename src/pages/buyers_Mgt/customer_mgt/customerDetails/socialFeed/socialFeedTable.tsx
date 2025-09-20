import React, { useEffect, useMemo, useState } from "react";
import SocialFeedModel from "../../../../../components/socialFeedModal";

export type FeedType = "Post Like" | "Post Comment" | "Post Saved";

interface SocialFeed {
  id: string;
  storeName: string;
  type: FeedType;
  post: string;
  date: string;
}

interface SocialFeedTableProps {
  title?: string;
  onRowSelect?: (selectedIds: string[]) => void;
  activeTab?: "All" | "Liked Posts" | "Comments" | "Saved";
  searchQuery?: string;
}

const tabToFeedType = (
  tab: Exclude<SocialFeedTableProps["activeTab"], undefined | "All">
): FeedType => {
  switch (tab) {
    case "Liked Posts":
      return "Post Like";
    case "Comments":
      return "Post Comment";
    case "Saved":
      return "Post Saved";
  }
  // Type safety guard—won't reach here because we covered all cases.
  return "Post Like";
};

const SocialFeedTable: React.FC<SocialFeedTableProps> = ({
  title = "Latest Posts",
  onRowSelect,
  activeTab = "All",
  searchQuery = "",
}) => {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedSocialFeed, setSelectedSocialFeed] =
    useState<SocialFeed | null>(null);

  // Sample data
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

  // -------- FILTERING (by tab + debounced search) --------
  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    const byTab =
      activeTab === "All"
        ? socialFeeds
        : socialFeeds.filter((f) => f.type === tabToFeedType(activeTab));

    if (!q) return byTab;

    return byTab.filter((f) => {
      const hay = `${f.storeName} ${f.type} ${f.post} ${f.date}`.toLowerCase();
      return hay.includes(q);
    });
  }, [socialFeeds, activeTab, searchQuery]);

  // Reset selection when filters/search change
  useEffect(() => {
    setSelectedRows([]);
    setSelectAll(false);
    onRowSelect?.([]);
  }, [activeTab, searchQuery]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleShowDetails = (socialFeed: SocialFeed) => {
    setSelectedSocialFeed(socialFeed);
    setShowModal(true);
  };

  const handleSelectAll = () => {
    const willSelectAll = !selectAll;
    setSelectAll(willSelectAll);

    const newSelected = willSelectAll ? filtered.map((f) => f.id) : [];
    setSelectedRows(newSelected);
    onRowSelect?.(newSelected);
  };

  const handleRowSelect = (socialFeedId: string) => {
    let next: string[];
    if (selectedRows.includes(socialFeedId)) {
      next = selectedRows.filter((id) => id !== socialFeedId);
    } else {
      next = [...selectedRows, socialFeedId];
    }
    setSelectedRows(next);
    setSelectAll(next.length === filtered.length && filtered.length > 0);
    onRowSelect?.(next);
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
                  checked={selectAll && filtered.length > 0}
                  onChange={handleSelectAll}
                  className="w-5 h-5 border border-gray-300 rounded cursor-pointer"
                  aria-label="Select all filtered rows"
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
            {filtered.map((socialFeed, index) => (
              <tr
                key={socialFeed.id}
                className={`border-t border-[#E5E5E5] transition-colors ${
                  index === filtered.length - 1 ? "" : "border-b"
                }`}
              >
                <td className="p-4 text-center">
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(socialFeed.id)}
                    onChange={() => handleRowSelect(socialFeed.id)}
                    className="w-5 h-5 border border-gray-300 rounded cursor-pointer"
                    aria-label={`Select feed ${socialFeed.id}`}
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
                <td className="p-4 text-[14px] text-black text-center">
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

            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="p-6 text-center text-sm text-gray-500"
                >
                  No posts match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <SocialFeedModel isOpen={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
};

export default SocialFeedTable;
