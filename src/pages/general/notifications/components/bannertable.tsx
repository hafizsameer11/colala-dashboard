import React, { useMemo, useState } from "react";
import images from "../../../../constants/images";

interface BannerData {
  id: number;
  title: string;
  image_url: string;
  link?: string;
  audience_type: string;
  target_user_ids?: number[];
  position: string;
  is_active: boolean;
  start_date?: string;
  end_date?: string;
  created_by: {
    id: number;
    name: string;
    email: string;
  };
  total_views: number;
  total_clicks: number;
  click_through_rate: number;
  is_currently_active: boolean;
  created_at: string;
}

interface BannerTableProps {
  onRowSelect?: (selectedIds: number[]) => void;
  searchTerm?: string;
  bannersData?: any;
  isLoading?: boolean;
  error?: any;
  currentPage?: number;
  onPageChange?: (page: number) => void;
}

const BannerTable: React.FC<BannerTableProps> = ({
  onRowSelect,
  searchTerm = "",
  bannersData,
  isLoading = false,
  error,
  currentPage = 1,
  onPageChange,
}) => {
  const [selectedRows, setSelectedRows] = useState<number[]>([]);

  // Transform API data to match component expectations
  const banners: BannerData[] = useMemo(() => {
    if (!bannersData?.data?.banners) return [];
    
    return bannersData.data.banners.map((banner: any) => ({
      id: banner.id,
      title: banner.title,
      image_url: banner.image_url,
      link: banner.link,
      audience_type: banner.audience_type,
      target_user_ids: banner.target_user_ids,
      position: banner.position,
      is_active: banner.is_active,
      start_date: banner.start_date,
      end_date: banner.end_date,
      created_by: banner.created_by,
      total_views: banner.total_views,
      total_clicks: banner.total_clicks,
      click_through_rate: banner.click_through_rate,
      is_currently_active: banner.is_currently_active,
      created_at: banner.created_at,
    }));
  }, [bannersData]);

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return banners;
    return banners.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        (b.link && b.link.toLowerCase().includes(q)) ||
        b.position.toLowerCase().includes(q) ||
        b.audience_type.toLowerCase().includes(q) ||
        (b.is_active ? 'active' : 'inactive').includes(q)
    );
  }, [searchTerm, banners]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const allIds = filtered.map((b) => b.id); // <- select filtered only
      setSelectedRows(allIds);
      onRowSelect?.(allIds);
    } else {
      setSelectedRows([]);
      onRowSelect?.([]);
    }
  };

  const handleRowSelect = (id: number) => {
    const newSelected = selectedRows.includes(id)
      ? selectedRows.filter((rowId) => rowId !== id)
      : [...selectedRows, id];
    setSelectedRows(newSelected);
    onRowSelect?.(newSelected);
  };

  const handleEdit = (id: number) =>
    console.log("Edit clicked for banner:", id);
  const handleDelete = (id: number) =>
    console.log("Delete clicked for banner:", id);

  if (isLoading) {
    return (
      <div className="mt-5 bg-white border border-[#E5E7EB] rounded-lg">
        <div className="bg-[#F9FAFB] px-6 py-4 border-b border-[#E5E7EB] rounded-t-lg">
          <h3 className="text-base font-medium text-[#111827]">Latest Banners</h3>
        </div>
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E53E3E]"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-5 bg-white border border-[#E5E7EB] rounded-lg">
        <div className="bg-[#F9FAFB] px-6 py-4 border-b border-[#E5E7EB] rounded-t-lg">
          <h3 className="text-base font-medium text-[#111827]">Latest Banners</h3>
        </div>
        <div className="text-center text-red-500 py-4">
          <p>Error loading banners</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-5 bg-white border border-[#E5E7EB] rounded-lg">
      <div className="bg-[#F9FAFB] px-6 py-4 border-b border-[#E5E7EB] rounded-t-lg">
        <h3 className="text-base font-medium text-[#111827]">Latest Banners</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#F9FAFB]">
            <tr className="border-b border-[#E5E7EB]">
              <th className="w-12 p-3 text-left">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-[#D1D5DB] text-[#E53E3E] focus:ring-[#E53E3E]"
                  onChange={handleSelectAll}
                  checked={
                    filtered.length > 0 &&
                    selectedRows.length === filtered.length
                  }
                />
              </th>
              <th className="p-3 text-left font-normal text-[#000]">
                Banner Image
              </th>
              <th className="p-3 text-left font-normal text-[#000]">Date</th>
              <th className="p-3 text-left font-normal text-[#000]">Link</th>
              <th className="p-3 text-left font-normal text-[#000]">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-gray-500">
                  No results found.
                </td>
              </tr>
            ) : (
              filtered.map((banner, index) => (
                <tr
                  key={banner.id}
                  className={`hover:bg-[#F9FAFB] ${
                    index !== filtered.length - 1
                      ? "border-b border-[#E5E7EB]"
                      : ""
                  }`}
                >
                  <td className="p-4">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-[#D1D5DB] text-[#E53E3E] focus:ring-[#E53E3E]"
                      checked={selectedRows.includes(banner.id)}
                      onChange={() => handleRowSelect(banner.id)}
                    />
                  </td>
                  <td className="p-4">
                    <div className="w-[220px] h-[41px] rounded-md overflow-hidden shadow-sm border border-gray-200">
                      <img
                        src={banner.image_url}
                        alt="Banner"
                        className="w-[220px] h-[41px] object-cover"
                      />
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text text-[#000]">
                      {banner.created_at 
                        ? new Date(banner.created_at).toLocaleDateString()
                        : 'Unknown'
                      }
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="text text-[#000]">{banner.link || 'No link'}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div
                          className={`w-5 h-5 rounded-full ${
                            banner.is_active
                              ? "bg-[#008000]"
                              : "bg-red-500"
                          }`}
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleEdit(banner.id)}
                          className="border border-[#989898] rounded-xl p-2 "
                        >
                          <img
                            src={images.PencilSimpleLine}
                            alt="Edit"
                            className="w-8 h-8 cursor-pointer"
                          />
                        </button>
                        <button
                          onClick={() => handleDelete(banner.id)}
                          className="border border-[#989898] rounded-xl p-2 "
                        >
                          <img
                            src={images.TrashSimple}
                            alt="Delete"
                            className="w-8 h-8 cursor-pointer"
                          />
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {bannersData?.data?.pagination && (
        <div className="flex justify-between items-center p-4 bg-gray-50">
          <div className="text-sm text-gray-600">
            Showing {bannersData.data.pagination.from || 0} to {bannersData.data.pagination.to || 0} of {bannersData.data.pagination.total || 0} results
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => onPageChange?.(currentPage - 1)}
              disabled={currentPage <= 1}
              className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-3 py-1 text-sm">
              Page {currentPage} of {bannersData.data.pagination.last_page || 1}
            </span>
            <button
              onClick={() => onPageChange?.(currentPage + 1)}
              disabled={currentPage >= (bannersData.data.pagination.last_page || 1)}
              className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BannerTable;
