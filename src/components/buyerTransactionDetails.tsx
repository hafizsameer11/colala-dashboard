import React, { useState, useEffect } from "react";
import images from "../constants/images";
import { useQuery } from "@tanstack/react-query";
import { getAdminTransactionDetails } from "../utils/queries/users";
import { formatCurrency } from "../utils/formatCurrency";

interface Transaction {
  id: string;
  reference: string;
  amount: string | number;
  type: string;
  date: string;
  status: string;
}

interface BuyerTransactionDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  transaction?: Transaction | null;
  transactionId?: string | number;
}

const BuyerTransactionDetails: React.FC<BuyerTransactionDetailsProps> = ({
  isOpen,
  onClose,
  transaction,
  transactionId,
}) => {
  // Fetch transaction details from API
  const { data: transactionDetails, isLoading, error } = useQuery({
    queryKey: ['adminTransactionDetails', transactionId],
    queryFn: () => getAdminTransactionDetails(transactionId!),
    enabled: !!transactionId && isOpen,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  if (!isOpen) return null;

  // Helper to format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      // Format: DD-MM-YYYY HH:mm PM/AM
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();

      let hours = date.getHours();
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'

      return `${day}-${month}-${year} ${hours}:${minutes} ${ampm}`;
    } catch (e) {
      return dateString;
    }
  };

  // Use API data if available, otherwise fallback to passed transaction or default
  const apiData = transactionDetails?.data;

  const txData = apiData ? {
    id: apiData.transaction_info?.id || transaction?.id || "N/A",
    reference: apiData.transaction_info?.tx_id || apiData.transaction_info?.reference || transaction?.reference || "N/A",
    amount: apiData.payment_details?.amount_formatted || apiData.transaction_info?.amount || transaction?.amount || "N/A",
    type: apiData.payment_details?.type_description || apiData.transaction_info?.type || transaction?.type || "Unknown",
    date: formatDate(apiData.transaction_info?.created_at) || transaction?.date || "N/A",
    status: apiData.transaction_info?.status || transaction?.status || "Unknown",
    statusColor: apiData.payment_details?.status_color || null,
    channel: apiData.payment_details?.channel || "N/A",
    description: apiData.transaction_info?.description || "N/A",
    buyer: apiData.user_info || null, // Updated mapping
    order: apiData.order_info || null,
    payment: apiData.payment_details || null,
    timeline: apiData.timeline || null,
  } : transaction ? {
    ...transaction,
    statusColor: (transaction as any).statusColor || null,
    buyer: null,
    payment: null
  } : {
    id: "",
    reference: "N/A",
    amount: "N/A",
    type: "Unknown",
    date: "N/A",
    status: "Unknown" as const,
    statusColor: null,
    buyer: null,
    payment: null
  };

  // Helper function to render status section
  const renderStatusSection = () => {
    // Determine color based on status_color from API or fallback to status
    let colorClass = "text-[#000]";
    let bgClass = "bg-gray-100";
    let icon = images.tick2; // Default

    const statusLower = String(txData.status).toLowerCase();
    const colorLower = String(txData.statusColor || "").toLowerCase();

    if (colorLower === "green" || statusLower === "successful" || statusLower === "success" || statusLower === "completed") {
      colorClass = "text-[#008000]";
      bgClass = "bg-[#00800033]";
      icon = images.tick2;
    } else if (colorLower === "yellow" || colorLower === "orange" || statusLower === "pending") {
      colorClass = "text-[#FFA500]";
      bgClass = "bg-[#FFA50033]";
      icon = images.error;
    } else if (colorLower === "red" || statusLower === "failed") {
      colorClass = "text-[#FF0000]";
      bgClass = "bg-[#FF000033]";
      icon = images.redx;
    } else if (colorLower === "blue") {
      colorClass = "text-[#1E90FF]";
      bgClass = "bg-[#1E90FF33]";
      icon = images.tick2; // Or another icon for blue
    }

    return (
      <div className="flex justify-center items-center mt-5">
        <div>
          <div className={`p-5 rounded-full ${bgClass} flex justify-center items-center`}>
            <img className="w-12 h-12" src={icon} alt={txData.status} />
          </div>
          <div className="flex justify-center items-center mt-2">
            <span className={`${colorClass} text-2xl font-bold`}>
              {formatCurrency(txData.amount)}
            </span>
          </div>
        </div>
      </div>
    );
  };

  // Helper function to get status color text class
  const getStatusColorClass = () => {
    const statusLower = String(txData.status).toLowerCase();
    const colorLower = String(txData.statusColor || "").toLowerCase();

    if (colorLower === "green" || statusLower === "successful" || statusLower === "success") return "text-[#008000]";
    if (colorLower === "yellow" || colorLower === "orange" || statusLower === "pending") return "text-[#FFA500]";
    if (colorLower === "red" || statusLower === "failed") return "text-[#FF0000]";
    if (colorLower === "blue") return "text-[#1E90FF]";

    return "text-[#000]";
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-100 bg-[#00000080] bg-opacity-50 flex justify-end">
        <div className="bg-white w-[500px] relative h-full overflow-y-auto flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E53E3E]"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 z-100 bg-[#00000080] bg-opacity-50 flex justify-end">
        <div className="bg-white w-[500px] relative h-full overflow-y-auto flex items-center justify-center">
          <div className="text-center text-red-500">
            <p className="text-sm">Error loading transaction details</p>
            <button
              onClick={onClose}
              className="mt-4 bg-[#E53E3E] text-white px-4 py-2 rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-100 bg-[#00000080] bg-opacity-50 flex justify-end">
      <div className="bg-white w-[500px] relative h-full overflow-y-auto">
        {/* Header */}
        <div className="border-b border-[#787878] px-3 py-3 sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Transaction Details</h2>
            <div className="flex flex-row items-center gap-3">
              <button
                onClick={onClose}
                className="p-2 rounded-md  cursor-pointer"
                aria-label="Close"
              >
                <img className="w-7 h-7" src={images.close} alt="Close" />
              </button>
            </div>
          </div>
        </div>

        {renderStatusSection()}

        <div className="flex flex-col gap-1.5 p-5">
          <div className="flex flex-row bg-[#EDEDED] justify-between p-4 rounded-t-2xl rounded-b-lg">
            <span className="text-[15px]">Amount</span>
            <span className="text-[15px] text-[#E53E3E] font-bold">
              {formatCurrency(txData.amount)}
            </span>
          </div>
          <div className="flex flex-row bg-[#EDEDED] justify-between p-4 rounded-lg ">
            <span className="text-[15px]">Transaction id</span>
            <span className="text-[15px] text-[#000] font-semibold">
              {txData.reference}
            </span>
          </div>
          <div className="flex flex-row bg-[#EDEDED] justify-between p-4 rounded-lg ">
            <span className="text-[15px]">Type</span>
            <span className="text-[15px] text-[#000] font-semibold">
              {txData.type}
            </span>
          </div>
          {/* Only show channel if it exists and isn't N/A */}
          {txData.channel && txData.channel !== "N/A" && (
            <div className="flex flex-row bg-[#EDEDED] justify-between p-4 rounded-lg ">
              <span className="text-[15px]">Channel</span>
              <span className="text-[15px] text-[#000] font-semibold">
                {txData.channel}
              </span>
            </div>
          )}
          <div className="flex flex-row bg-[#EDEDED] justify-between p-4 rounded-lg ">
            <span className="text-[15px]">Time</span>
            <span className="text-[15px] text-[#000] font-semibold">
              {txData.date}
            </span>
          </div>
          <div className="flex flex-row bg-[#EDEDED] justify-between p-4 rounded-b-2xl rounded-t-lg">
            <span className="text-[15px]">Status</span>
            <span
              className={`text-[15px] font-bold ${getStatusColorClass()}`}
            >
              {String(txData.status).toUpperCase()}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-1.5 p-5">
          <div className="flex flex-row bg-[#EDEDED] justify-between p-4 rounded-t-2xl rounded-b-lg">
            <span className="text-[15px]">User Name</span>
            <span className="text-[15px] font-semibold">
              {txData.buyer?.name || "N/A"}
            </span>
          </div>
          <div className="flex flex-row bg-[#EDEDED] justify-between p-4 rounded-lg ">
            <span className="text-[15px]">User Email</span>
            <span className="text-[15px] text-[#000] font-semibold">
              {txData.buyer?.email || "N/A"}
            </span>
          </div>
          {/* Show Bank Name only if available */}
          {txData.payment?.gateway && (
            <div className="flex flex-row bg-[#EDEDED] justify-between p-4 rounded-b-2xl rounded-t-lg">
              <span className="text-[15px]">Bank Name</span>
              <span className="text-[15px] text-[#000] font-semibold">
                {txData.payment.gateway}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BuyerTransactionDetails;
