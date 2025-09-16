import React, { useState } from "react";
import ViewAllModal from "./viewallmodal";

interface Referral {
  id: string;
  name: string;
  noOfReferrals: number;
  amountEarned: string;
  other: string;
}

interface ReferralTableProps {
  title?: string;
  onRowSelect?: (selectedIds: string[]) => void;
}

const ReferralTable: React.FC<ReferralTableProps> = ({
  onRowSelect,
}) => {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showViewAllModal, setShowViewAllModal] = useState(false);
  const [selectedReferrer, setSelectedReferrer] = useState<Referral | null>(null);

  // Sample data based on the image
  const referrals: Referral[] = [
    {
      id: "1",
      name: "QuickMove Logistics",
      noOfReferrals: 340,
      amountEarned: "N89,000",
      other: "View All",
    },
    {
      id: "2",
      name: "Sasha Stores",
      noOfReferrals: 340,
      amountEarned: "N89,000",
      other: "View All",
    },
    {
      id: "3",
      name: "Adewale Faizah",
      noOfReferrals: 340,
      amountEarned: "N89,000",
      other: "View All",
    },
    {
      id: "4",
      name: "Malik Qamar",
      noOfReferrals: 340,
      amountEarned: "N89,000",
      other: "View All",
    },
    {
      id: "5",
      name: "Don Stores",
      noOfReferrals: 340,
      amountEarned: "N89,000",
      other: "View All",
    },
    {
      id: "6",
      name: "QuickMove Logistics",
      noOfReferrals: 340,
      amountEarned: "N89,000",
      other: "View All",
    },
    {
      id: "7",
      name: "QuickMove Logistics",
      noOfReferrals: 340,
      amountEarned: "N89,000",
      other: "View All",
    },
  ];

  const handleViewAll = (referral: Referral) => {
    setSelectedReferrer(referral);
    setShowViewAllModal(true);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRows([]);
    } else {
      setSelectedRows(referrals.map((referral) => referral.id));
    }
    setSelectAll(!selectAll);

    if (onRowSelect) {
      onRowSelect(selectAll ? [] : referrals.map((referral) => referral.id));
    }
  };

  const handleRowSelect = (referralId: string) => {
    let newSelectedRows;
    if (selectedRows.includes(referralId)) {
      newSelectedRows = selectedRows.filter((id) => id !== referralId);
    } else {
      newSelectedRows = [...selectedRows, referralId];
    }

    setSelectedRows(newSelectedRows);
    setSelectAll(newSelectedRows.length === referrals.length);

    if (onRowSelect) {
      onRowSelect(newSelectedRows);
    }
  };

  return (
    <div className="border border-[#989898] rounded-2xl w-[1160px] ml-1 mt-4 mb-4">
      <div className="bg-white p-5 rounded-t-2xl font-semibold text-[16px] border-b border-[#989898]">
        Reviews & Ratings
      </div>
      <div className="bg-white rounded-b-2xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#F2F2F2]">
            <tr>
              <th className="text-center p-3 font-normal w-12">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                  className="w-5 h-5 border border-gray-300 rounded cursor-pointer"
                />
              </th>
              <th className="text-left p-3 font-normal">
                Names
              </th>
              <th className="text-left p-3 font-normal">
                No of referrals
              </th>
              <th className="text-center p-3 font-normal">
                Amount Earned
              </th>
              <th className="text-center p-3 font-normal">
                Other
              </th>
            </tr>
          </thead>
          <tbody>
            {referrals.map((referral, index) => (
              <tr
                key={referral.id}
                className={`border-t border-[#E5E5E5] transition-colors ${
                  index === referrals.length - 1 ? "" : "border-b"
                }`}
              >
                <td className="p-4">
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(referral.id)}
                    onChange={() => handleRowSelect(referral.id)}
                    className="w-5 h-5 border border-gray-300 rounded cursor-pointer text-center"
                  />
                </td>
                <td className="p-4 text-black text-left">
                  {referral.name}
                </td>
                <td className="p-4 text-black text-left">
                  {referral.noOfReferrals}
                </td>
                <td className="p-4 text-black text-center font-semibold">
                  {referral.amountEarned}
                </td>
                <td className="p-4 text-center">
                  <button
                    onClick={() => handleViewAll(referral)}
                    className="px-10 py-2 rounded-lg  font-medium transition-colors cursor-pointer bg-[#E53E3E] text-white hover:bg-[#D32F2F]"
                  >
                    View All
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* ViewAll Modal */}
      <ViewAllModal 
        isOpen={showViewAllModal} 
        onClose={() => setShowViewAllModal(false)}
        referrerName={selectedReferrer?.name}
      />
    </div>
  );
};

export default ReferralTable;
