import React from "react";
import images from "../constants/images";

interface LoyaltyPointsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userData?: any;
}

const LoyaltyPointsModal: React.FC<LoyaltyPointsModalProps> = ({ isOpen, onClose, userData }) => {
  if (!isOpen) return null;

  // Debug logging
  console.log('LoyaltyPointsModal Debug - userData:', userData);

  return (
    <div className="fixed inset-0 z-100 bg-[#00000080] bg-opacity-50 flex justify-center items-center">
      <div className="bg-white w-[600px] max-h-[80vh] overflow-y-auto rounded-lg shadow-xl">
        {/* Header */}
        <div className="border-b border-[#787878] px-6 py-4 sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Loyalty Points Details</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-md cursor-pointer hover:bg-gray-100 transition-colors"
              aria-label="Close"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* User Info Section */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold mb-3">User Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600">Name</label>
                <p className="font-medium">{userData?.user_info?.full_name || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Email</label>
                <p className="font-medium">{userData?.user_info?.email || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Role</label>
                <p className="font-medium capitalize">{userData?.user_info?.role || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Status</label>
                <p className="font-medium capitalize">{userData?.user_info?.status || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Wallet Information */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Wallet Information</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  ₦{userData?.wallet_info?.balance || '0'}
                </div>
                <div className="text-sm text-gray-600">Shopping Balance</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  ₦{userData?.wallet_info?.escrow_balance || '0'}
                </div>
                <div className="text-sm text-gray-600">Escrow Balance</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {userData?.wallet_info?.points_balance || '0'}
                </div>
                <div className="text-sm text-gray-600">Points Balance</div>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">User Statistics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600">
                    {userData?.statistics?.total_loyalty_points || '0'}
                  </div>
                  <div className="text-sm text-gray-600">Total Loyalty Points</div>
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {userData?.statistics?.total_orders || '0'}
                  </div>
                  <div className="text-sm text-gray-600">Total Orders</div>
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {userData?.statistics?.total_transactions || '0'}
                  </div>
                  <div className="text-sm text-gray-600">Total Transactions</div>
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">
                    ₦{userData?.statistics?.total_spent || '0'}
                  </div>
                  <div className="text-sm text-gray-600">Total Spent</div>
                </div>
              </div>
            </div>
          </div>

          {/* Store Information (if user is a seller) */}
          {userData?.store_info && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Store Information</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600">Store Name</label>
                    <p className="font-medium">{userData.store_info.store_name || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Store Email</label>
                    <p className="font-medium">{userData.store_info.store_email || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Store Phone</label>
                    <p className="font-medium">{userData.store_info.store_phone || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Store Location</label>
                    <p className="font-medium">{userData.store_info.store_location || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Store Status</label>
                    <p className="font-medium capitalize">{userData.store_info.status || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Created At</label>
                    <p className="font-medium">
                      {userData.store_info.created_at 
                        ? new Date(userData.store_info.created_at).toLocaleDateString() 
                        : 'N/A'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Recent Transactions */}
          {userData?.recent_transactions && userData.recent_transactions.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Recent Transactions</h3>
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Transaction ID</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Amount</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Type</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Status</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {userData.recent_transactions.map((transaction: any) => (
                        <tr key={transaction.id}>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            {transaction.tx_id}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            ₦{transaction.amount}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                              {transaction.type?.replace(/_/g, ' ') || 'N/A'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              transaction.status === 'completed' 
                                ? 'bg-green-100 text-green-800' 
                                : transaction.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {transaction.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {transaction.formatted_date || new Date(transaction.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Recent Activities */}
          {userData?.activities && userData.activities.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Recent Activities</h3>
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Activity</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {userData.activities.slice(0, 10).map((activity: any) => (
                        <tr key={activity.id}>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {activity.activity}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {new Date(activity.created_at).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoyaltyPointsModal;
