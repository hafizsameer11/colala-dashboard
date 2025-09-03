import React, { useState } from "react";
import images from "../../../constants/images";

interface Announcement {
  id: string;
  storeName: string;
  announcementTitle: string;
  type: string;
  date: string;
  status: boolean;
  hasImage: boolean;
}

interface AnnouncementsTableProps {
  title?: string;
  onRowSelect?: (selectedIds: string[]) => void;
}

const AnnouncementsTable: React.FC<AnnouncementsTableProps> = ({
  title = "All Products",
  onRowSelect,
}) => {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  //   const [showModal, setShowModal] = useState(false);

  // Sample announcements data
  const announcements: Announcement[] = [
    {
      id: "1",
      storeName: "",
      announcementTitle: "https://www.abcd.com",
      type: "Banner",
      date: "18-07-2025/11:30AM",
      status: true,
      hasImage: true,
    },
    {
      id: "2",
      storeName: "Get the best deals from our store.....",
      announcementTitle: "https://www.abcd.com",
      type: "Text",
      date: "18-07-2025/11:30AM",
      status: true,
      hasImage: false,
    },
    {
      id: "3",
      storeName: "Get the best deals from our store.....",
      announcementTitle: "https://www.abcd.com",
      type: "Text",
      date: "18-07-2025/11:30AM",
      status: true,
      hasImage: false,
    },
    {
      id: "4",
      storeName: "",
      announcementTitle: "https://www.abcd.com",
      type: "Banner",
      date: "18-07-2025/11:30AM",
      status: true,
      hasImage: true,
    },
  ];

  const handleSelectAll = () => {
    const allIds = announcements.map((announcement) => announcement.id);
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
    setSelectAll(newSelection.length === announcements.length);

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
                Store Name
              </th>
              <th className="p-4 text-left font-normal text-lg">
                Product name
              </th>
              <th className="p-4 text-left font-normal text-lg">
                Price
              </th>
              <th className="p-4 text-left font-normal text-lg">
                Date
              </th>
              <th className="p-4 text-center font-normal text-lg">
                Status
              </th>
              <th className="p-4 text-center font-normal text-lg">
                Other
              </th>
            </tr>
          </thead>
          <tbody>
            {announcements.map((announcement) => (
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
                  {announcement.hasImage ? (
                    <div className="flex items-center">
                      <div className="w-40 h-10 bg-gray-200 rounded flex items-center justify-center overflow-hidden">
                        <img
                          src={images.ivideo}
                          alt="Store"
                          className=" object-cover"
                        />
                      </div>
                    </div>
                  ) : (
                    <span className="text-md text-black">
                      {announcement.storeName}
                    </span>
                  )}
                </td>
                <td className="p-4 text-left">
                  <span className="text-md text-black">
                    {announcement.announcementTitle}
                  </span>
                </td>
                <td className="p-4 text-left">
                  <span className="text-sm text-gray-900">
                    {announcement.type}
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
                    <button className="text-gray-400 hover:text-gray-600">
                      <img src={images.edit1} alt="Edit" className="w-6 h-6 cursor-pointer" />
                    </button>
                    <button className="text-red-400 hover:text-red-600">
                      <img
                        src={images.delete1}
                        alt="Delete"
                        className="w-6 h-6 cursor-pointer"
                      />
                    </button>
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

export default AnnouncementsTable;
