import React, { useMemo, useState } from "react";
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
  searchTerm?: string; // <- NEW
}

const BannerTable: React.FC<BannerTableProps> = ({
  onRowSelect,
  searchTerm = "",
}) => {
  const [selectedRows, setSelectedRows] = useState<number[]>([]);

  const banners: BannerData[] = [
    {
      id: 1,
      image: images.banner,
      date: "21-08-2025 / 07:22 AM",
      link: "Lagos, Nigeria",
      status: "active",
    },
    {
      id: 2,
      image: images.banner,
      date: "21-08-2025 / 07:22 AM",
      link: "Lagos, Cambodia",
      status: "active",
    },
    {
      id: 3,
      image: images.banner,
      date: "21-08-2025 / 07:22 AM",
      link: "Milan, Italy",
      status: "active",
    },
    {
      id: 4,
      image: images.banner,
      date: "21-08-2025 / 07:22 AM",
      link: "Lagos, Nigeria",
      status: "active",
    },
    {
      id: 5,
      image: images.banner,
      date: "21-08-2025 / 07:22 AM",
      link: "Lagos, Nigeria",
      status: "active",
    },
    {
      id: 6,
      image: images.banner,
      date: "21-08-2025 / 07:22 AM",
      link: "Frankfurt, Germany",
      status: "active",
    },
  ];

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return banners;
    return banners.filter(
      (b) =>
        b.link.toLowerCase().includes(q) ||
        b.date.toLowerCase().includes(q) ||
        b.status.toLowerCase().includes(q)
    );
  }, [searchTerm]);

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
                        src={banner.image}
                        alt="Banner"
                        className="w-[220px] h-[41px] object-cover"
                      />
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
                      <div className="flex items-center">
                        <div
                          className={`w-5 h-5 rounded-full ${
                            banner.status === "active"
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
    </div>
  );
};

export default BannerTable;
