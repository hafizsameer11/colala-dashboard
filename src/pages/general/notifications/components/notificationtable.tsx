import React, { useMemo, useState } from "react";
import images from "../../../../constants/images";

interface NotificationData {
  id: number;
  title: string;
  description: string;
  link: string;
  date: string;
}

interface NotificationTableProps {
  onRowSelect?: (selectedIds: number[]) => void;
  searchTerm?: string; // <- NEW
}

const NotificationTable: React.FC<NotificationTableProps> = ({
  onRowSelect,
  searchTerm = "",
}) => {
  const [selectedRows, setSelectedRows] = useState<number[]>([]);

  const notifications: NotificationData[] = [
    {
      id: 1,
      title: "Experience seamless shopping",
      description:
        "Discover top-notch ecommerce products from stores across the nation. Place your first order today and unlock exclusive rewards!",
      link: "https://www.colala.com",
      date: "21-08-2025 / 07:22 AM",
    },
    {
      id: 2,
      title: "Experience cheap shopping",
      description:
        "Discover top-notch ecommerce products from stores across the nation. Place your first order today and unlock exclusive rewards!",
      link: "https://www.colala.com",
      date: "21-08-2025 / 07:22 AM",
    },
    {
      id: 3,
      title: "Experience quality shopping",
      description:
        "Discover top-notch ecommerce products from stores across the nation. Place your first order today and unlock exclusive rewards!",
      link: "https://www.colala.com",
      date: "21-08-2025 / 07:22 AM",
    },
  ];

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return notifications;
    return notifications.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.description.toLowerCase().includes(q) ||
        n.link.toLowerCase().includes(q) ||
        n.date.toLowerCase().includes(q)
    );
  }, [searchTerm]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const allIds = filtered.map((n) => n.id); // <- select filtered only
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

  return (
    <div className="mt-5 bg-white border border-[#E5E7EB] rounded-lg">
      <div className="bg-[#F9FAFB] px-6 py-4 border-b border-[#E5E7EB] rounded-t-lg">
        <h3 className="text-base font-medium text-[#111827]">
          Latest Notifications
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#F9FAFB]">
            <tr className="border-b border-[#E5E7EB]">
              <th className="w-12 px-6 py-3 text-left">
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
                Notification
              </th>
              <th className="p-3 text-center font-normal text-[#000]">Link</th>
              <th className="p-3 text-left font-normal text-[#000]">Date</th>
              <th className="p-3 text-left font-normal text-[#000]">Action</th>
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
              filtered.map((notification, index) => (
                <tr
                  key={notification.id}
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
                      checked={selectedRows.includes(notification.id)}
                      onChange={() => handleRowSelect(notification.id)}
                    />
                  </td>
                  <td className="p-4">
                    <div className="max-w-sm">
                      <h4 className="text font-semibold text-[#000] mb-1">
                        {notification.title}
                      </h4>
                      <p className="text-sm text-[#000] leading-relaxed">
                        {notification.description}
                      </p>
                    </div>
                  </td>
                  <td className="p-4 text-left">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-[#D9D9D9] rounded-sm"></div>
                      <span className=" text-[#000]">{notification.link}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className=" text-[#000]">{notification.date}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button className="bg-[#E53E3E] text-white px-4 py-3 rounded-lg font-medium  transition-colors cursor-pointer">
                        Send New
                      </button>
                      <button className="border border-[#989898] rounded-xl p-2 ">
                        <img
                          src={images.PencilSimpleLine}
                          alt="Edit "
                          className="w-7 h-7 cursor-pointer"
                        />
                      </button>
                      <button className="border border-[#989898] rounded-xl p-2 ">
                        <img
                          src={images.TrashSimple}
                          className="w-7 h-7 cursor-pointer"
                        />
                      </button>
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

export default NotificationTable;
