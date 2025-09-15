import React, { useState } from "react";
import images from "../../../../constants/images";

interface BannerData {
  id: number;
  image: string;
  date: string;
  link: string;
  status: "active" | "inactive";
}

interface BannerTableProps {
  onRowSelect?: (selectedIds: number[]) => void;
}

const BannerTable: React.FC<BannerTableProps> = ({ onRowSelect }) => {
  const [selectedRows, setSelectedRows] = useState<number[]>([]);

  // Debug: Log the banner image path
  console.log("Banner image path:", images.banner);

  // Sample banner data - replace the image paths with your own photo paths
  const banners: BannerData[] = [
    {
      id: 1,
      image: images.banner, // Using banner image
      date: "21-08-2025 / 07:22 AM",
      link: "Lagos, Nigeria",
      status: "active",
    },
    {
      id: 2,
      image: images.banner, // Using images constant
      date: "21-08-2025 / 07:22 AM",
      link: "Lagos, Nigeria",
      status: "active",
    },
    {
      id: 3,
      image: images.banner, // Using images constant
      date: "21-08-2025 / 07:22 AM",
      link: "Lagos, Nigeria",
      status: "active",
    },
    {
      id: 4,
      image: images.banner, // Using images constant
      date: "21-08-2025 / 07:22 AM",
      link: "Lagos, Nigeria",
      status: "active",
    },
    {
      id: 5,
      image: images.banner, // Using images constant
      date: "21-08-2025 / 07:22 AM",
      link: "Lagos, Nigeria",
      status: "active",
    },
    {
      id: 6,
      image: images.banner, // Using images constant
      date: "21-08-2025 / 07:22 AM",
      link: "Lagos, Nigeria",
      status: "active",
    },
  ];

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const allIds = banners.map((banner) => banner.id);
      setSelectedRows(allIds);
      onRowSelect?.(allIds);
    } else {
      setSelectedRows([]);
      onRowSelect?.([]);
    }
  };

  const handleRowSelect = (id: number) => {
    const newSelectedRows = selectedRows.includes(id)
      ? selectedRows.filter((rowId) => rowId !== id)
      : [...selectedRows, id];

    setSelectedRows(newSelectedRows);
    onRowSelect?.(newSelectedRows);
  };

  const handleEdit = (id: number) => {
    console.log("Edit clicked for banner:", id);
  };

  const handleDelete = (id: number) => {
    console.log("Delete clicked for banner:", id);
  };

  return (
    <div className="mt-5 bg-white border border-[#E5E7EB] rounded-lg">
      {/* Table Header */}
      <div className="bg-[#F9FAFB] px-6 py-4 border-b border-[#E5E7EB] rounded-t-lg">
        <h3 className="text-base font-medium text-[#111827]">Latest Banners</h3>
      </div>

      {/* Table */}
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
                    selectedRows.length === banners.length && banners.length > 0
                  }
                />
              </th>
              <th className="p-3 text-left font-normal text-[#000]">
                Banner Image
              </th>
              <th className="p-3 text-left font-normal text-[#000]">
                Date
              </th>
              <th className="p-3 text-left font-normal text-[#000]">
                Link
              </th>
              <th className="p-3 text-left font-normal text-[#000]">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {banners.map((banner, index) => (
              <tr
                key={banner.id}
                className={`hover:bg-[#F9FAFB] ${
                  index !== banners.length - 1
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
                  <div className="flex items-center">
                    {/* Banner Image Preview */}
                    <div className="w-[220px] h-[41px] rounded-md overflow-hidden shadow-sm border border-gray-200">
                      <img
                        src={banner.image}
                        alt="Banner"
                        className="w-[220px] h-[41px] object-cover"
                        onLoad={() =>
                          console.log(
                            "Image loaded successfully:",
                            banner.image
                          )
                        }
                        onError={(e) => {
                          console.error("Failed to load image:", banner.image);
                          // Fallback to gradient background if image fails to load
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                          target.parentElement!.className +=
                            " bg-gradient-to-r from-amber-600 via-orange-500 to-blue-600 flex items-center justify-center";
                          target.parentElement!.innerHTML =
                            '<span class="text-white text-xs font-medium">BANNER</span>';
                        }}
                      />
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <span className="text text-[#000]">{banner.date}</span>
                </td>
                <td className="p-4">
                  <span className="text text-[#000]">{banner.link}</span>
                </td>
                <td className="p-4">
                  <div className="flex items-center justify-between">
                    {/* Status Indicator */}
                    <div className="flex items-center">
                      <div
                        className={`w-5 h-5 rounded-full ${
                          banner.status === "active"
                            ? "bg-[#008000]"
                            : "bg-red-500"
                        }`}
                      ></div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3">
                      {/* Edit Button */}
                      <button
                        onClick={() => handleEdit(banner.id)}
                        className="border border-[#989898] rounded-xl p-2 "
                        title="Edit"
                      >
                        <img
                          src={images.PencilSimpleLine}
                          alt="Edit"
                          className="w-8 h-8 cursor-pointer"
                        />
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDelete(banner.id)}
                        className="border border-[#989898] rounded-xl p-2 "
                        title="Delete"
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BannerTable;
