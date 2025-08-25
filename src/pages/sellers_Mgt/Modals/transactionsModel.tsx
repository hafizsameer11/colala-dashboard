import React from "react";
import images from "../../../constants/images";

interface Transaction {
  id: string;
  reference: string;
  amount: string;
  type: string;
  date: string;
  status: "Successful" | "Pending" | "Failed";
}

interface TransactionsModelProps {
  isOpen: boolean;
  onClose: () => void;
  transaction?: Transaction | null;
}

const TransactionsModel: React.FC<TransactionsModelProps> = ({
  isOpen,
  onClose,
  transaction,
}) => {
  if (!isOpen) return null;

  // Default values if no transaction is provided
  const txData = transaction || {
    id: "",
    reference: "12dj4w0ickwkdcskd",
    amount: "₦20,000",
    type: "Withdrawal",
    date: "18-07-2025/11:30AM",
    status: "Successful" as const,
  };

  // Helper function to render status section
  const renderStatusSection = () => {
    const amount = txData.amount.replace("₦", "").replace(",", "");
    const displayAmount = `${
      txData.status === "Successful" ? "+" : "-"
    }${amount}`;

    switch (txData.status) {
      case "Successful":
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
        return "text-[#008000]";
      case "Pending":
        return "text-[#FFA500]";
      case "Failed":
        return "text-[#FF0000]";
      default:
        return "text-[#000]";
    }
  };

  return (
    <div className="fixed inset-0 z-100 bg-[#00000080] bg-opacity-50 flex justify-end">
      <div className="bg-white w-[500px] relative h-full overflow-y-auto">
        {/* Header */}
        <div className="border-b border-[#787878] px-3 py-3 sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Transaction Details</h2>
            <div className="flex flex-row items-center gap-3">
              <div className="rounded-full p-2 border border-[#CDCDCD]">
                <img
                  className="cursor-pointer"
                  src={images.shoppingcart}
                  alt=""
                />
              </div>
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
              {txData.amount}
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
              Flutterwave
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
              Flutterwave
            </span>
          </div>
          <div className="flex flex-row bg-[#EDEDED] justify-between p-4 rounded-b-2xl rounded-t-lg">
            <span className="text-[15px]">Bank Name</span>
            <span className="text-[15px] text-[#000] font-semibold">
              Access Bank
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
export default TransactionsModel;
