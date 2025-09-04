import React, { useState } from "react";
import PromotionsModal from "../Modals/promotionsModal";

interface Submission {
  id: string;
  storeName: string;
  product: string;
  amount: string;
  duration: string;
  date: string;
  status: "Approved" | "Pending" | "Rejected";
  productImage?: string;
}

interface PromotionsTableProps {
  title?: string;
  onRowSelect?: (selectedIds: string[]) => void;
}

const PromotionsTable: React.FC<PromotionsTableProps> = ({
  title = "Latest Submissions",
  onRowSelect,
}) => {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Sample data based on the image
  const submissions: Submission[] = [
    {
      id: "1",
      storeName: "Gadget Hub",
      product: "Samsung Odyssey G9...",
      amount: "₦1,800,000",
      duration: "5 Days",
      date: "10-07-2025/11:00AM",
      status: "Approved",
      productImage: "/assets/layout/itable.png",
    },
    {
      id: "2",
      storeName: "Sasha Stores",
      product: "Anker Power Bank 737",
      amount: "₦95,000",
      duration: "2 Days",
      date: "05-07-2025/06:15PM",
      status: "Approved",
      productImage: "/assets/layout/itable.png",
    },
    {
      id: "3",
      storeName: "Game Zone",
      product: "Sony Playstation 5 Slim",
      amount: "₦850,000",
      duration: "30 Days",
      date: "08-07-2025/09:45AM",
      status: "Approved",
      productImage: "/assets/layout/itable.png",
    },
    {
      id: "4",
      storeName: "Home Theatre Kings",
      product: 'LG 65" OLED TV',
      amount: "₦2,750,000",
      duration: "60 Days",
      date: "01-07-2025/12:00PM",
      status: "Approved",
      productImage: "/assets/layout/itable.png",
    },
    {
      id: "5",
      storeName: "Emeka Electronics",
      product: "Macbook Pro 14 inch",
      amount: "₦3,500,000",
      duration: "15 Days",
      date: "12-07-2025/02:30PM",
      status: "Approved",
      productImage: "/assets/layout/itable.png",
    },
    {
      id: "6",
      storeName: "Emeka Electronics",
      product: "Google Pixel 9 Pro",
      amount: "₦1,950,000",
      duration: "22 Days",
      date: "28-06-2025/08:50AM",
      status: "Rejected",
      productImage: "/assets/layout/itable.png",
    },
    {
      id: "7",
      storeName: "Sasha Stores",
      product: "Iphone 16 pro max.....",
      amount: "₦2,000",
      duration: "20 Days",
      date: "14-07-2025/10:00AM",
      status: "Pending",
      productImage: "/assets/layout/itable.png",
    },
  ];

//   const handleShowDetails = (submission: Submission) => {
//     // Handle view details logic here
//     console.log("View details for:", submission);
//   };

  const handleModalOpen = () => {
    setIsModalOpen(true);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRows([]);
    } else {
      setSelectedRows(submissions.map((submission) => submission.id));
    }
    setSelectAll(!selectAll);

    if (onRowSelect) {
      onRowSelect(
        selectAll ? [] : submissions.map((submission) => submission.id)
      );
    }
  };

  const handleRowSelect = (submissionId: string) => {
    let newSelectedRows;
    if (selectedRows.includes(submissionId)) {
      newSelectedRows = selectedRows.filter((id) => id !== submissionId);
    } else {
      newSelectedRows = [...selectedRows, submissionId];
    }

    setSelectedRows(newSelectedRows);
    setSelectAll(newSelectedRows.length === submissions.length);

    if (onRowSelect) {
      onRowSelect(newSelectedRows);
    }
  };

  const getStatusStyle = (status: Submission["status"]) => {
    switch (status) {
      case "Approved":
        return "bg-[#0080001A] text-[#008000] border border-[#008000]";
      case "Pending":
        return "bg-[#AAAAAA1A] text-[#FFA500] border border-[#FFA500]";
      case "Rejected":
        return "bg-[#FF00001A] text-[#FF0000] border border-[#FF0000]";
      default:
        return "bg-gray-100 text-gray-600 border border-gray-300";
    }
  };

  return (
    <div className="border border-[#989898] rounded-2xl mt-5 overflow-x-auto">
      <div className="bg-white p-5 rounded-t-2xl font-semibold text-[16px] border-b border-[#989898]">
        {title}
      </div>
      <div className="bg-white rounded-b-2xl overflow-hidden">
        <table className="w-full min-w-[800px]">
          <thead className="bg-[#F2F2F2]">
            <tr>
              <th className="text-center p-3 font-normal text-[14px] w-12">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                  className="w-5 h-5 border border-gray-300 rounded cursor-pointer"
                />
              </th>
              <th className="text-left p-3 font-normal text-[14px]">
                Store Name
              </th>
              <th className="text-center p-3 font-normal text-[14px]">
                Product
              </th>
              <th className="text-center p-3 font-normal text-[14px]">
                Amount
              </th>
              <th className="text-center p-3 font-normal text-[14px]">
                Duration
              </th>
              <th className="text-center p-3 font-normal text-[14px]">Date</th>
              <th className="text-center p-3 font-normal text-[14px]">
                Status
              </th>
              <th className="text-center p-3 font-normal text-[14px]">Other</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((submission, index) => (
              <tr
                key={submission.id}
                className={`border-t border-[#E5E5E5] transition-colors hover:bg-gray-50 ${
                  index === submissions.length - 1 ? "" : "border-b"
                }`}
              >
                <td className="p-4 text-center">
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(submission.id)}
                    onChange={() => handleRowSelect(submission.id)}
                    className="w-5 h-5 border border-gray-300 rounded cursor-pointer mx-auto"
                  />
                </td>
                <td className="p-4 text-[14px] text-black text-left">
                  {submission.storeName}
                </td>
                <td className="p-4 text-[14px] text-black text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                      <img
                        src={submission.productImage}
                        alt={submission.product}
                        className="w-full h-full object-cover rounded-lg"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          e.currentTarget.parentElement!.classList.add(
                            "bg-gray-400"
                          );
                        }}
                      />
                    </div>
                    <span className="text-left">{submission.product}</span>
                  </div>
                </td>
                <td className="p-4 text-[14px] text-black font-semibold text-center">
                  {submission.amount}
                </td>
                <td className="p-4 text-[14px] text-black text-center">
                  {submission.duration}
                </td>
                <td className="p-4 text-[14px] font-semibold text-black text-center">
                  {submission.date}
                </td>
                <td className="p-4 text-center">
                  <span
                    className={`px-3 py-1 rounded-md text-[12px] font-medium ${getStatusStyle(
                      submission.status
                    )}`}
                  >
                    {submission.status}
                  </span>
                </td>
                <td className="p-4 text-center">
                  <button
                    onClick={handleModalOpen}
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
      <PromotionsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default PromotionsTable;
