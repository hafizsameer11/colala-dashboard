import React, { useEffect, useMemo, useState } from "react";
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
  searchTerm?: string; // <- NEW
}

const ReferralTable: React.FC<ReferralTableProps> = ({
  title = "Reviews & Ratings",
  onRowSelect,
  searchTerm = "",
}) => {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showViewAllModal, setShowViewAllModal] = useState(false);
  const [selectedReferrer, setSelectedReferrer] = useState<Referral | null>(
    null
  );

  // Sample/static data (replace with API data when ready)
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
      noOfReferrals: 210,
      amountEarned: "N42,500",
      other: "View All",
    },
    {
      id: "3",
      name: "Adewale Faizah",
      noOfReferrals: 118,
      amountEarned: "N23,800",
      other: "View All",
    },
    {
      id: "4",
      name: "Malik Qamar",
      noOfReferrals: 90,
      amountEarned: "N18,000",
      other: "View All",
    },
    {
      id: "5",
      name: "Don Stores",
      noOfReferrals: 67,
      amountEarned: "N13,400",
      other: "View All",
    },
    {
      id: "6",
      name: "QuickMove Logistics",
      noOfReferrals: 51,
      amountEarned: "N10,200",
      other: "View All",
    },
    {
      id: "7",
      name: "QuickMove Logistics",
      noOfReferrals: 35,
      amountEarned: "N7,000",
      other: "View All",
    },
  ];

  // --- Filtering (case-insensitive; matches name, amount, count)
  const filteredReferrals = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return referrals;

    return referrals.filter((r) => {
      const nameMatch = r.name.toLowerCase().includes(q);
      const amountMatch = r.amountEarned.toLowerCase().includes(q);
      const countMatch = String(r.noOfReferrals).includes(q);
      return nameMatch || amountMatch || countMatch;
    });
  }, [searchTerm]);

  // Keep "Select All" checkbox in sync with visible selection
  useEffect(() => {
    const visibleIds = new Set(filteredReferrals.map((r) => r.id));
    const visibleSelected = selectedRows.filter((id) => visibleIds.has(id));
    setSelectAll(
      filteredReferrals.length > 0 &&
        visibleSelected.length === filteredReferrals.length
    );
  }, [filteredReferrals, selectedRows]);

  // Emit selection upward whenever it changes
  useEffect(() => {
    onRowSelect?.(selectedRows);
  }, [selectedRows, onRowSelect]);

  const handleViewAll = (referral: Referral) => {
    setSelectedReferrer(referral);
    setShowViewAllModal(true);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      // Unselect only the currently visible rows
      const visibleIds = new Set(filteredReferrals.map((r) => r.id));
      const remaining = selectedRows.filter((id) => !visibleIds.has(id));
      setSelectedRows(remaining);
      setSelectAll(false);
    } else {
      // Select all currently visible + keep previously selected hidden rows
      const visible = filteredReferrals.map((r) => r.id);
      const set = new Set([...selectedRows, ...visible]);
      setSelectedRows(Array.from(set));
      setSelectAll(true);
    }
  };

  const handleRowSelect = (referralId: string) => {
    setSelectedRows((prev) =>
      prev.includes(referralId)
        ? prev.filter((id) => id !== referralId)
        : [...prev, referralId]
    );
  };

  const isRowSelected = (id: string) => selectedRows.includes(id);

  return (
    <div className="border border-[#989898] rounded-2xl w-[1160px] ml-1 mt-4 mb-4">
      <div className="bg-white p-5 rounded-t-2xl font-semibold text-[16px] border-b border-[#989898]">
        {title}
      </div>

      <div className="bg-white rounded-b-2xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#F2F2F2]">
            <tr>
              <th className="text-center p-3 font-normal w-12">
                <input
                  type="checkbox"
                  checked={selectAll && filteredReferrals.length > 0}
                  onChange={handleSelectAll}
                  className="w-5 h-5 border border-gray-300 rounded cursor-pointer"
                />
              </th>
              <th className="text-left p-3 font-normal">Names</th>
              <th className="text-left p-3 font-normal">No of referrals</th>
              <th className="text-center p-3 font-normal">Amount Earned</th>
              <th className="text-center p-3 font-normal">Other</th>
            </tr>
          </thead>

          <tbody>
            {filteredReferrals.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-gray-500">
                  No results found.
                </td>
              </tr>
            ) : (
              filteredReferrals.map((referral, index) => (
                <tr
                  key={referral.id}
                  className={`border-t border-[#E5E5E5] transition-colors ${
                    index === filteredReferrals.length - 1 ? "" : "border-b"
                  }`}
                >
                  <td className="p-4 text-center">
                    <input
                      type="checkbox"
                      checked={isRowSelected(referral.id)}
                      onChange={() => handleRowSelect(referral.id)}
                      className="w-5 h-5 border border-gray-300 rounded cursor-pointer"
                    />
                  </td>
                  <td className="p-4 text-black text-left">{referral.name}</td>
                  <td className="p-4 text-black text-left">
                    {referral.noOfReferrals}
                  </td>
                  <td className="p-4 text-black text-center font-semibold">
                    {referral.amountEarned}
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => handleViewAll(referral)}
                      className="px-10 py-2 rounded-lg font-medium transition-colors cursor-pointer bg-[#E53E3E] text-white hover:bg-[#D32F2F]"
                    >
                      View All
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ViewAllModal
        isOpen={showViewAllModal}
        onClose={() => setShowViewAllModal(false)}
        referrerName={selectedReferrer?.name}
      />
    </div>
  );
};

export default ReferralTable;
