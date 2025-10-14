import React, { useState, useMemo } from "react";
import SocialFeedModel from "../../../Modals/socialFeedModal";

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
  posts?: any[];
  isLoading?: boolean;
  error?: any;
  pagination?: any;
  onPageChange?: (page: number) => void;
  userId?: string;
}

const SocialFeedTable: React.FC<SocialFeedTableProps> = ({
  title = "Latest Posts",
  onRowSelect,
  posts = [],
  isLoading = false,
  error,
  pagination,
  onPageChange,
  userId,
}) => {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedSocialFeed, setSelectedSocialFeed] =
    useState<SocialFeed | null>(null);

  // Normalize API data to match our interface
  const normalizedPosts: SocialFeed[] = useMemo(() => {
    return posts.map((post: any) => ({
      id: String(post.id),
      storeName: post.user?.name || 'N/A',
      type: "Post Like", // Default type since API doesn't provide interaction type
      post: post.content || 'N/A',
      date: post.created_at || 'N/A',
    }));
  }, [posts]);

  const handleShowDetails = (socialFeed: SocialFeed) => {
    setSelectedSocialFeed(socialFeed);
    setShowModal(true);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRows([]);
    } else {
      setSelectedRows(normalizedPosts.map((socialFeed) => socialFeed.id));
    }
    setSelectAll(!selectAll);

    if (onRowSelect) {
      onRowSelect(
        selectAll ? [] : normalizedPosts.map((socialFeed) => socialFeed.id)
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
    setSelectAll(newSelectedRows.length === normalizedPosts.length);

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
            {isLoading ? (
              <tr><td colSpan={6} className="p-6 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E53E3E] mx-auto"></div></td></tr>
            ) : error ? (
              <tr><td colSpan={6} className="p-6 text-center text-red-500">Failed to load posts</td></tr>
            ) : normalizedPosts.length === 0 ? (
              <tr><td colSpan={6} className="p-6 text-center text-gray-500">No posts</td></tr>
            ) : normalizedPosts.map((socialFeed, index) => (
              <tr
                key={socialFeed.id}
                className={`border-t border-[#E5E5E5] transition-colors ${
                  index === normalizedPosts.length - 1 ? "" : "border-b"
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
        userId={userId}
        postId={selectedSocialFeed?.id}
      />

      {pagination && pagination.last_page > 1 && (
        <div className="bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {((pagination.current_page - 1) * pagination.per_page) + 1} to {Math.min(pagination.current_page * pagination.per_page, pagination.total)} of {pagination.total} results
          </div>
          <div className="flex items-center space-x-2">
            <button onClick={() => onPageChange?.(pagination.current_page - 1)} disabled={pagination.current_page <= 1} className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Previous</button>
            {Array.from({ length: Math.min(5, pagination.last_page) }, (_, i) => {
              const pageNum = Math.max(1, Math.min(pagination.last_page - 4, pagination.current_page - 2)) + i;
              if (pageNum > pagination.last_page) return null;
              return (
                <button key={pageNum} onClick={() => onPageChange?.(pageNum)} className={`px-3 py-2 text-sm font-medium rounded-md ${pagination.current_page === pageNum ? 'bg-[#E53E3E] text-white' : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'}`}>{pageNum}</button>
              );
            })}
            <button onClick={() => onPageChange?.(pagination.current_page + 1)} disabled={pagination.current_page >= pagination.last_page} className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SocialFeedTable;
