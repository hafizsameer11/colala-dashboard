import React, { useState, useMemo } from "react";
import images from "../../../../../constants/images";

interface ApiAnnouncement {
  id: number;
  message: string;
  impressions: number;
  created_at: string;
}

interface Announcement {
  id: string;
  storeName: string;
  announcementTitle: string;
  type: string;
  date: string;
  status: boolean;
  hasImage: boolean;
}

interface ApiBanner {
  id: number;
  image_url: string;
  link: string;
  impressions: number;
  created_at: string;
}

interface Banner {
  id: string;
  image: string;
  link: string;
  impressions: number;
  date: string;
  status: boolean;
}

interface AnnouncementsTableProps {
  title?: string;
  onRowSelect?: (selectedIds: string[]) => void;
  announcements: ApiAnnouncement[];
  isLoading?: boolean;
  error?: any;
  pagination?: { current_page: number; last_page: number; total: number; per_page: number };
  currentPage?: number;
  onPageChange?: (page: number) => void;
  activeTab?: string;
  onEditAnnouncement?: (announcement: any) => void;
  onEditBanner?: (banner: any) => void;
  onDeleteBanner?: (bannerId: string) => void;
}

const AnnouncementsTable: React.FC<AnnouncementsTableProps> = ({
  title = "All Announcements",
  onRowSelect,
  announcements = [],
  isLoading,
  error,
  pagination,
  currentPage = 1,
  onPageChange,
  activeTab = 'All',
  onEditAnnouncement,
  onEditBanner,
  onDeleteBanner,
}) => {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  //   const [showModal, setShowModal] = useState(false);

  // Debug logging

  // Normalize API data to UI format
  const normalizedAnnouncements = useMemo(() => {
    // Ensure announcements is an array
    if (!Array.isArray(announcements)) {
      return [];
    }
    
    // Process all items and determine their type based on their properties
    return announcements.map((item: any) => {
      // Determine if this is a banner or announcement based on item properties
      const isBanner = item.image_url || item.image || item.imageUrl || item.link;
      
      if (isBanner) {
        // Handle banners
        return {
          id: String(item.id || item.banner_id || Math.random().toString()),
          storeName: item.link || item.url || 'N/A',
          announcementTitle: item.title || item.name || item.link || 'N/A',
          type: "Banner",
          date: item.created_at || item.createdAt || item.date || new Date().toISOString(),
          status: true,
          hasImage: true,
          impressions: item.impressions || 0,
          image: item.image_url || item.image || item.imageUrl || '',
          link: item.link || item.url || '',
        };
      } else {
        // Handle announcements
        const message = item.message || item.content || item.description || item.title || '';
        const truncatedMessage = message.length > 50 ? message.substring(0, 50) + '...' : message;
        
        return {
          id: String(item.id || item.announcement_id || Math.random().toString()),
          storeName: truncatedMessage,
          announcementTitle: message,
          type: "Text",
          date: item.created_at || item.createdAt || item.date || new Date().toISOString(),
          status: true,
          hasImage: false,
          impressions: item.impressions || 0,
        };
      }
    });
  }, [announcements, activeTab]);

  const handleSelectAll = () => {
    const allIds = normalizedAnnouncements.map((announcement) => announcement.id);
    const newSelection = selectAll ? [] : allIds;
    setSelectedRows(newSelection);
    setSelectAll(!selectAll);

    if (onRowSelect) {
      onRowSelect(newSelection);
    }
  };

  const handleRowSelect = (id: string) => {
    const isSelected = selectedRows.includes(id);
    const newSelection = isSelected
      ? selectedRows.filter((rowId) => rowId !== id)
      : [...selectedRows, id];

    setSelectedRows(newSelection);
    setSelectAll(newSelection.length === normalizedAnnouncements.length);

    if (onRowSelect) {
      onRowSelect(newSelection);
    }
  };

  return (
    <div
      className="rounded-2xl mt-5 bg-white overflow-hidden"
      style={{ boxShadow: "0px 0px 2px 0px rgba(0, 0, 0, 0.25)" }}
    >
      <div className="bg-white p-5 font-semibold text-lg border-b border-gray-200">
        {title}
      </div>
      <div className="bg-white overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#F2F2F2] border-y border-gray-200">
            <tr className="text-left">
              <th className="p-4 font-medium text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                  className="w-4 h-4 rounded border-gray-300"
                />
              </th>
              <th className="p-4 text-left font-normal text-lg">
                {activeTab === "Banner" ? "Link" : "Message"}
              </th>
              <th className="p-4 text-left font-normal text-lg">
                Type
              </th>
              <th className="p-4 text-left font-normal text-lg">
                Impressions
              </th>
              <th className="p-4 text-left font-normal text-lg">
                Date
              </th>
              <th className="p-4 text-center font-normal text-lg">
                Status
              </th>
              <th className="p-4 text-center font-normal text-lg">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-gray-500">Loading announcements...</td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-red-500">Failed to load announcements</td>
              </tr>
            ) : !normalizedAnnouncements || normalizedAnnouncements.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-gray-500">No announcements found</td>
              </tr>
            ) : (
              normalizedAnnouncements.map((announcement, index) => {
                // Additional safety check for each announcement
                if (!announcement || !announcement.id) {
                  return null;
                }
                
                return (
              <tr key={announcement.id} className="border-b border-gray-100">
                <td className="p-4">
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(announcement.id)}
                    onChange={() => handleRowSelect(announcement.id)}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                </td>
                  <td className="p-4 text-left">
                    {activeTab === "Banner" ? (
                      <div className="flex items-center space-x-3">
                        {announcement.image && (
                          <img 
                            src={announcement.image} 
                            alt="Banner" 
                            className="w-16 h-12 object-cover rounded-lg border border-gray-200"
                          />
                        )}
                        <div className="flex flex-col">
                          <a 
                            href={announcement.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline text-sm"
                          >
                            {announcement.link}
                          </a>
                          <span className="text-xs text-gray-500 mt-1">
                            Click to open link
                          </span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-md text-black">
                        {announcement.announcementTitle}
                      </span>
                    )}
                  </td>
                <td className="p-4 text-left">
                  <span className="text-sm text-gray-900">
                    {announcement.type}
                  </span>
                </td>
                  <td className="p-4 text-left">
                    <span className="text-sm text-gray-600">
                      {announcement.impressions}
                    </span>
                  </td>
                <td className="p-4 text-left">
                  <span className="text-sm text-gray-500">
                    {announcement.date}
                  </span>
                </td>
                <td className="p-4 flex items-center justify-center">
                  <div className="w-5 h-5 bg-[#008000] rounded-full"></div>
                </td>
                <td className="p-4 text-left">
                  <div className="flex items-center space-x-5">
                      <button 
                        className="text-gray-400 hover:text-gray-600"
                        onClick={() => {
                          if (announcement.type === "Banner" && onEditBanner) {
                            onEditBanner(announcement);
                          } else if (announcement.type === "Text" && onEditAnnouncement) {
                            onEditAnnouncement(announcement);
                          }
                        }}
                      >
                      <img src={images.edit1} alt="Edit" className="w-6 h-6 cursor-pointer" />
                    </button>
                      <button 
                        className="text-red-400 hover:text-red-600"
                        onClick={() => {
                          if (announcement.type === "Banner" && onDeleteBanner) {
                            onDeleteBanner(announcement.id);
                          }
                        }}
                      >
                      <img
                        src={images.delete1}
                        alt="Delete"
                        className="w-6 h-6 cursor-pointer"
                      />
                    </button>
                  </div>
                </td>
              </tr>
                );
              }).filter(Boolean) // Remove any null entries
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {pagination && pagination.last_page > 1 && (
        <div className="flex justify-between items-center p-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            Page {currentPage} of {pagination.last_page} • Total {pagination.total}
          </div>
          <div className="flex gap-2">
            <button
              disabled={currentPage <= 1}
              onClick={() => onPageChange && onPageChange(currentPage - 1)}
              className="px-3 py-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <button
              disabled={currentPage >= pagination.last_page}
              onClick={() => onPageChange && onPageChange(currentPage + 1)}
              className="px-3 py-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnnouncementsTable;
