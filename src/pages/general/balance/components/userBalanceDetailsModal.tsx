import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getUserBalanceDetails } from "../../../../utils/queries/users";
import images from "../../../../constants/images";

interface UserBalanceDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number | string | null;
}

interface UserInfo {
  id: number;
  full_name: string;
  email: string;
  phone: string | null;
  role: string;
}

interface WalletInfo {
  id: number;
  shopping_balance: number;
  reward_balance: number;
  referral_balance: number;
  loyalty_points: number;
  escrow_balance: number;
  created_at: string;
  updated_at: string;
}

interface Transaction {
  id: number;
  tx_id: string;
  amount: number;
  status: string;
  type: string;
  created_at: string;
  formatted_date: string;
}

interface BalanceStatistics {
  total_transactions: number;
  total_deposits: number;
  total_withdrawals: number;
  successful_transactions: number;
  failed_transactions: number;
}

interface BalanceDetailsData {
  user_info: UserInfo;
  wallet_info: WalletInfo;
  recent_transactions: Transaction[];
  balance_statistics: BalanceStatistics;
}

const UserBalanceDetailsModal: React.FC<UserBalanceDetailsModalProps> = ({
  isOpen,
  onClose,
  userId,
}) => {
  const [activeTab, setActiveTab] = useState<"overview" | "transactions">("overview");

  // Fetch user balance details
  const { data: balanceDetails, isLoading, error } = useQuery({
    queryKey: ['userBalanceDetails', userId],
    queryFn: () => getUserBalanceDetails(userId!),
    enabled: isOpen && !!userId,
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes
  });

  const balanceData: BalanceDetailsData | null = balanceDetails?.data || null;

  // Close modal when clicking outside
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#E53E3E] to-[#2C0182] p-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">User Balance Details</h2>
              {balanceData && (
                <p className="text-white/80 mt-1">
                  {balanceData.user_info.full_name} ({balanceData.user_info.role})
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-2xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex space-x-0">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-6 py-3 font-medium text-sm ${
                activeTab === "overview"
                  ? "text-[#E53E3E] border-b-2 border-[#E53E3E]"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("transactions")}
              className={`px-6 py-3 font-medium text-sm ${
                activeTab === "transactions"
                  ? "text-[#E53E3E] border-b-2 border-[#E53E3E]"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Recent Transactions
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E53E3E]"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              <p>Error loading balance details</p>
            </div>
          ) : balanceData ? (
            <>
              {activeTab === "overview" && (
                <div className="space-y-6">
                  {/* User Information */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-3">User Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-gray-600">Full Name</label>
                        <p className="font-medium">{balanceData.user_info.full_name}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Email</label>
                        <p className="font-medium">{balanceData.user_info.email}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Phone</label>
                        <p className="font-medium">{balanceData.user_info.phone || "N/A"}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Role</label>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          balanceData.user_info.role === 'buyer' 
                            ? 'bg-blue-100 text-blue-800' 
                            : balanceData.user_info.role === 'seller' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {balanceData.user_info.role}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Wallet Balances */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-3">Wallet Balances</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="bg-white rounded-lg p-3 border">
                        <label className="text-sm text-gray-600">Shopping Balance</label>
                        <p className="text-xl font-bold text-[#E53E3E]">
                          {formatCurrency(balanceData.wallet_info.shopping_balance)}
                        </p>
                      </div>
                      <div className="bg-white rounded-lg p-3 border">
                        <label className="text-sm text-gray-600">Reward Balance</label>
                        <p className="text-xl font-bold text-green-600">
                          {formatCurrency(balanceData.wallet_info.reward_balance)}
                        </p>
                      </div>
                      <div className="bg-white rounded-lg p-3 border">
                        <label className="text-sm text-gray-600">Referral Balance</label>
                        <p className="text-xl font-bold text-blue-600">
                          {formatCurrency(balanceData.wallet_info.referral_balance)}
                        </p>
                      </div>
                      <div className="bg-white rounded-lg p-3 border">
                        <label className="text-sm text-gray-600">Loyalty Points</label>
                        <p className="text-xl font-bold text-purple-600">
                          {balanceData.wallet_info.loyalty_points.toLocaleString()}
                        </p>
                      </div>
                      <div className="bg-white rounded-lg p-3 border">
                        <label className="text-sm text-gray-600">Escrow Balance</label>
                        <p className="text-xl font-bold text-orange-600">
                          {formatCurrency(balanceData.wallet_info.escrow_balance)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Balance Statistics */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-3">Transaction Statistics</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="bg-white rounded-lg p-3 border">
                        <label className="text-sm text-gray-600">Total Transactions</label>
                        <p className="text-xl font-bold">{balanceData.balance_statistics.total_transactions}</p>
                      </div>
                      <div className="bg-white rounded-lg p-3 border">
                        <label className="text-sm text-gray-600">Total Deposits</label>
                        <p className="text-xl font-bold text-green-600">
                          {formatCurrency(balanceData.balance_statistics.total_deposits)}
                        </p>
                      </div>
                      <div className="bg-white rounded-lg p-3 border">
                        <label className="text-sm text-gray-600">Total Withdrawals</label>
                        <p className="text-xl font-bold text-red-600">
                          {formatCurrency(balanceData.balance_statistics.total_withdrawals)}
                        </p>
                      </div>
                      <div className="bg-white rounded-lg p-3 border">
                        <label className="text-sm text-gray-600">Successful Transactions</label>
                        <p className="text-xl font-bold text-green-600">
                          {balanceData.balance_statistics.successful_transactions}
                        </p>
                      </div>
                      <div className="bg-white rounded-lg p-3 border">
                        <label className="text-sm text-gray-600">Failed Transactions</label>
                        <p className="text-xl font-bold text-red-600">
                          {balanceData.balance_statistics.failed_transactions}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "transactions" && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
                  {balanceData.recent_transactions.length > 0 ? (
                    <div className="space-y-3">
                      {balanceData.recent_transactions.map((transaction) => (
                        <div key={transaction.id} className="bg-white border rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  transaction.type === 'deposit' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {transaction.type}
                                </span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  transaction.status === 'successful' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {transaction.status}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600">Transaction ID: {transaction.tx_id}</p>
                              <p className="text-sm text-gray-500">{transaction.formatted_date}</p>
                            </div>
                            <div className="text-right">
                              <p className={`text-lg font-bold ${
                                transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {transaction.type === 'deposit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>No recent transactions found</p>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No balance data available</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserBalanceDetailsModal;
