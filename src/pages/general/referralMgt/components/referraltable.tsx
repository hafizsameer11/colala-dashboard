import React, { useEffect, useMemo, useState } from "react";
import ViewAllModal from "./viewallmodal";

interface Referral {
  id: string;
  full_name: string;
  email: string;
  user_code: string;
  referral_code: string | null;
  role: string | null;
  created_at: string;
  referral_balance: number;
  shopping_balance: number;
  reward_balance: number;
  loyalty_points: number;
  wallet: {
    id: number;
    user_id: number;
    shopping_balance: number;
    reward_balance: number;
    referral_balance: number;
    loyality_points: number;
    created_at: string;
    updated_at: string;
  };
}

interface ReferralTableProps {
  title?: string;
  onRowSelect?: (selectedIds: string[]) => void;
  referralsData?: any;
  isLoading?: boolean;
  error?: any;
  currentPage?: number;
  onPageChange?: (page: number) => void;
}

const ReferralTable: React.FC<ReferralTableProps> = ({
  title = "Referrals",
  onRowSelect,
  referralsData,
  isLoading = false,
  error,
  currentPage = 1,
  onPageChange,
}) => {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showViewAllModal, setShowViewAllModal] = useState(false);
  const [selectedReferrer, setSelectedReferrer] = useState<Referral | null>(
    null
  );

  // Transform API data to match component expectations
  const referrals: Referral[] = useMemo(() => {
    if (!referralsData?.data?.referrers?.data) return [];
    
    return referralsData.data.referrers.data.map((referrer: any) => ({
      id: referrer.id.toString(),
      full_name: referrer.full_name,
      email: referrer.email,
      user_code: referrer.user_code,
      referral_code: referrer.referral_code,
      role: referrer.role,
      created_at: referrer.created_at,
      referral_balance: referrer.referral_balance,
      shopping_balance: referrer.shopping_balance,
      reward_balance: referrer.reward_balance,
      loyalty_points: referrer.loyalty_points,
      wallet: referrer.wallet,
    }));
  }, [referralsData]);

  // Use all referrals without filtering
  const filteredReferrals = referrals;

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

  if (isLoading) {
    return (
      <div className="border border-[#989898] rounded-2xl w-full mt-4 mb-4">
        <div className="bg-white p-5 rounded-t-2xl font-semibold text-[16px] border-b border-[#989898]">
          {title}
        </div>
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E53E3E]"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border border-[#989898] rounded-2xl w-full mt-4 mb-4">
        <div className="bg-white p-5 rounded-t-2xl font-semibold text-[16px] border-b border-[#989898]">
          {title}
        </div>
        <div className="text-center text-red-500 py-4">
          <p>Error loading referrals</p>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-[#989898] rounded-2xl w-full mt-4 mb-4">
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
              <th className="text-left p-3 font-normal">Email</th>
              <th className="text-left p-3 font-normal">User Code</th>
              <th className="text-center p-3 font-normal">Referral Balance</th>
              <th className="text-center p-3 font-normal">Other</th>
            </tr>
          </thead>

          <tbody>
            {filteredReferrals.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-500">
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
                  <td className="p-4 text-black text-left">{referral.full_name}</td>
                  <td className="p-4 text-black text-left">{referral.email}</td>
                  <td className="p-4 text-black text-left">{referral.user_code}</td>
                  <td className="p-4 text-black text-center font-semibold">
                    ₦{referral.referral_balance.toLocaleString()}
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

      {/* Pagination */}
      {referralsData?.data?.pagination && (
        <div className="flex justify-between items-center p-4 bg-gray-50">
          <div className="text-sm text-gray-600">
            Showing {referralsData.data.pagination.from || 0} to {referralsData.data.pagination.to || 0} of {referralsData.data.pagination.total || 0} results
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => onPageChange?.(currentPage - 1)}
              disabled={currentPage <= 1}
              className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {referralsData.data.pagination.last_page > 1 && Array.from({ length: Math.min(5, referralsData.data.pagination.last_page || 1) }, (_, i) => {
              const pageNum = Math.max(1, Math.min((referralsData.data.pagination.last_page || 1) - 4, currentPage - 2)) + i;
              if (pageNum > (referralsData.data.pagination.last_page || 1)) return null;
              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange?.(pageNum)}
                  className={`px-3 py-1 text-sm border rounded ${
                    currentPage === pageNum
                      ? 'bg-[#E53E3E] text-white border-[#E53E3E]'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => onPageChange?.(currentPage + 1)}
              disabled={currentPage >= (referralsData.data.pagination.last_page || 1)}
              className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      <ViewAllModal
        isOpen={showViewAllModal}
        onClose={() => setShowViewAllModal(false)}
        referrerName={selectedReferrer?.full_name}
        referrerId={selectedReferrer?.id}
      />
    </div>
  );
};

export default ReferralTable;
