import React, { useState, useEffect } from "react";
import images from "../constants/images";
import { useQuery } from "@tanstack/react-query";
import { getAdminTransactionDetails } from "../utils/queries/users";

interface Transaction {
  id: string;
  reference: string;
  amount: string | number;
  type: string;
  date: string;
  status: "Successful" | "Pending" | "Failed";
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

  // Use API data if available, otherwise fallback to passed transaction or default
  const apiData = transactionDetails?.data;
  const txData = apiData ? {
    id: apiData.transaction_info?.id || transaction?.id || "N/A",
    reference: apiData.transaction_info?.tx_id || apiData.transaction_info?.reference || transaction?.reference || "N/A",
    amount: apiData.transaction_info?.amount?.formatted || apiData.transaction_info?.amount || transaction?.amount || "N/A",
    type: apiData.transaction_info?.type || transaction?.type || "Unknown",
    date: apiData.transaction_info?.created_at || transaction?.date || "N/A",
    status: apiData.transaction_info?.status || transaction?.status || "Unknown",
    channel: apiData.payment_details?.channel || "N/A",
    description: apiData.transaction_info?.description || "N/A",
    buyer: apiData.buyer_info || null,
    order: apiData.order_info || null,
    payment: apiData.payment_details || null,
    timeline: apiData.timeline || null,
  } : transaction || {
    id: "",
    reference: "N/A",
    amount: "N/A",
    type: "Unknown",
    date: "N/A",
    status: "Unknown" as const,
  };

  // Helper function to render status section
  const renderStatusSection = () => {
    // Ensure amount is a string and handle different formats
    const amountStr = typeof txData.amount === 'string' ? txData.amount : String(txData.amount || '0');
    const amount = amountStr.replace("₦", "").replace(",", "");
    const displayAmount = `${
      txData.status === "Successful" || txData.status === "Completed" ? "+" : "-"
    }${amount}`;

    switch (txData.status) {
      case "Successful":
      case "Completed":
        return (
          <div className="flex justify-center items-center mt-5">
            <div>
              <div className="p-5 rounded-full bg-[#00800033] flex justify-center items-center">
                <img className="w-12 h-12" src={images.tick2} alt="Success" />
              </div>
              <div className="flex justify-center items-center mt-2">
                <span className="text-[#008000] text-2xl font-bold">
                  {displayAmount}
                </span>
              </div>
            </div>
          </div>
        );
      case "Pending":
        return (
          <div className="flex justify-center items-center mt-5">
            <div>
              <div className="p-5 rounded-full bg-[#FFA50033] flex justify-center items-center">
                <img className="w-12 h-12" src={images.error} alt="Pending" />
              </div>
              <div className="flex justify-center items-center mt-2">
                <span className="text-[#FFA500] text-2xl font-bold">
                  {displayAmount}
                </span>
              </div>
            </div>
          </div>
        );
      case "Failed":
        return (
          <div className="flex justify-center items-center mt-5">
            <div>
              <div className="p-5 rounded-full bg-[#FF000033] flex justify-center items-center">
                <img className="w-12 h-12" src={images.redx} alt="Failed" />
              </div>
              <div className="flex justify-center items-center mt-2">
                <span className="text-[#FF0000] text-2xl font-bold">
                  {displayAmount}
                </span>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  // Helper function to get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Successful":
      case "Completed":
        return "text-[#008000]";
      case "Pending":
        return "text-[#FFA500]";
      case "Failed":
        return "text-[#FF0000]";
      default:
        return "text-[#000]";
    }
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
              {/* <div className="rounded-full p-2 border border-[#CDCDCD]">
                <img
                  className="cursor-pointer"
                  src={images.shoppingcart}
                  alt=""
                />
              </div> */}
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
              {typeof txData.amount === 'string' ? txData.amount : `₦${txData.amount || '0'}`}
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
          <div className="flex flex-row bg-[#EDEDED] justify-between p-4 rounded-lg ">
            <span className="text-[15px]">Channel</span>
            <span className="text-[15px] text-[#000] font-semibold">
              {txData.channel}
            </span>
          </div>
          <div className="flex flex-row bg-[#EDEDED] justify-between p-4 rounded-lg ">
            <span className="text-[15px]">Time</span>
            <span className="text-[15px] text-[#000] font-semibold">
              {txData.date}
            </span>
          </div>
          <div className="flex flex-row bg-[#EDEDED] justify-between p-4 rounded-b-2xl rounded-t-lg">
            <span className="text-[15px]">Status</span>
            <span
              className={`text-[15px] font-bold ${getStatusColor(
                txData.status
              )}`}
            >
              {txData.status}
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-1.5 p-5">
          <div className="flex flex-row bg-[#EDEDED] justify-between p-4 rounded-t-2xl rounded-b-lg">
            <span className="text-[15px]">Account Number</span>
            <span className="text-[15px] font-semibold">
              {txData.reference}
            </span>
          </div>
          <div className="flex flex-row bg-[#EDEDED] justify-between p-4 rounded-lg ">
            <span className="text-[15px]">Account Name</span>
            <span className="text-[15px] text-[#000] font-semibold">
              {txData.buyer?.name || "N/A"}
            </span>
          </div>
          <div className="flex flex-row bg-[#EDEDED] justify-between p-4 rounded-b-2xl rounded-t-lg">
            <span className="text-[15px]">Bank Name</span>
            <span className="text-[15px] text-[#000] font-semibold">
              {txData.payment?.gateway || "N/A"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyerTransactionDetails;
