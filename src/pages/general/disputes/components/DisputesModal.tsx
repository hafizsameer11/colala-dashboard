import React, { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import images from "../../../../constants/images";
import WarningModal from "./WarningModal";
import { getDisputeDetails, resolveDispute, closeDispute } from "../../../../utils/queries/disputes";

interface OrderItem {
  id: number;
  name: string;
  sku?: string | null;
  unit_price: string;
  qty: number;
  line_total: string;
}

interface ChatMessage {
  id: number;
  message: string;
  sender_type: 'buyer' | 'store';
  created_at: string;
}

interface Dispute {
  id: string | number;
  category?: string;
  details?: string;
  images?: string[];
  status: "open" | "resolved" | "closed";
  won_by?: string | null;
  resolution_notes?: string | null;
  created_at?: string;
  updated_at?: string;
  resolved_at?: string | null;
  closed_at?: string | null;
  user?: {
    id: number;
    name: string;
    email: string;
    phone: string;
  };
  chat?: {
    id: number;
    store_name: string;
    user_name: string;
    last_message: string;
    created_at: string;
    store?: {
      id: number;
      name: string;
      logo?: string;
    };
    user?: {
      id: number;
      name: string;
      email: string;
    };
    recent_messages?: Array<{
      id: number;
      message: string;
      sender_type: 'buyer' | 'store';
      created_at: string;
    }>;
  };
  store_order?: {
    id: number;
    order_id: number;
    status: string;
    items_subtotal: string;
    shipping_fee: string;
    subtotal_with_shipping: string;
    created_at: string;
    order?: {
      id: number;
      order_no: string;
      status: string;
      grand_total: string;
      payment_status: string;
    };
    store?: {
      id: number;
      name: string;
      logo?: string;
    };
    items?: Array<{
      id: number;
      name: string;
      sku?: string | null;
      unit_price: string;
      qty: number;
      line_total: string;
    }>;
  };
  // Legacy fields for backward compatibility
  store_name?: string;
  user_name?: string;
  last_message?: string;
  chat_date?: string;
  wonBy?: string;
  storeName?: string;
  userName?: string;
  lastMessage?: string;
  chatDate?: string;
}

interface DisputesModalProps {
  isOpen: boolean;
  onClose: () => void;
  disputeData?: Dispute | null;
  onDisputeUpdate?: () => void;
}

const DisputesModal: React.FC<DisputesModalProps> = ({
  isOpen,
  onClose,
  disputeData,
  onDisputeUpdate,
}) => {
  // ✅ Hooks must always run in the same order
  const [hasJoinedChat, setHasJoinedChat] = useState(false);
  const [wonBy, setWonBy] = useState<"" | "customer" | "store">("");
  const [wonByDropdownOpen, setWonByDropdownOpen] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  
  // Dispute details and loading states
  const [isResolving, setIsResolving] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // Fetch detailed dispute information
  const { data: disputeDetails, isLoading: isLoadingDetails, error: detailsError } = useQuery({
    queryKey: ['disputeDetails', disputeData?.id],
    queryFn: () => getDisputeDetails(disputeData?.id || 0),
    enabled: !!disputeData?.id && isOpen,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const openWarning = useCallback(() => setShowWarningModal(true), []);
  const closeWarning = useCallback(() => setShowWarningModal(false), []);

  const safeCloseParent = useCallback(() => {
    if (hasJoinedChat && !wonBy) openWarning();
    else onClose();
  }, [hasJoinedChat, wonBy, onClose, openWarning]);

  // Fetch dispute details when modal opens

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        safeCloseParent();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [safeCloseParent]);

  // ✅ After all hooks: choose what to render
  if (!isOpen) return null;

  const handleJoinChat = () => setHasJoinedChat(true);
  const handleLeaveChat = () => {
    if (!wonBy) openWarning();
    else {
      setHasJoinedChat(false);
      onClose();
    }
  };
  const handleClose = () => safeCloseParent();
  const handleWonByChange = (value: "customer" | "store") => {
    setWonBy(value);
    setWonByDropdownOpen(false);
  };

  // Handle resolve dispute
  const handleResolveDispute = async () => {
    if (!disputeData?.id || !wonBy) {
      console.error('Please select who won the dispute before resolving');
      return;
    }

    try {
      setIsResolving(true);
      const response = await resolveDispute(disputeData.id, { won_by: wonBy });
      if (response.status === 'success') {
        console.log('Dispute resolved successfully');
        onDisputeUpdate?.();
        onClose();
      }
    } catch (error: unknown) {
      console.error('Error resolving dispute:', error);
      console.error('Failed to resolve dispute');
    } finally {
      setIsResolving(false);
    }
  };

  // Handle close dispute
  const handleCloseDispute = async () => {
    if (!disputeData?.id) {
      console.error('No dispute selected');
      return;
    }

    try {
      setIsClosing(true);
      const response = await closeDispute(disputeData.id);
      if (response.status === 'success') {
        console.log('Dispute closed successfully');
        onDisputeUpdate?.();
        onClose();
      }
    } catch (error: unknown) {
      console.error('Error closing dispute:', error);
      console.error('Failed to close dispute');
    } finally {
      setIsClosing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-100 bg-[#00000080] bg-opacity-50 flex justify-end">
      <div className="bg-white w-[530px] relative h-full overflow-y-auto">
        {/* Header */}
        <div className="border-b border-[#787878] px-3 py-3 sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Chat</h2>
            <div className="flex flex-row items-center gap-3">
              <div className="relative flex items-center gap-2">
                <button
                  type="button"
                  className={`border border-[#BDBDBD] cursor-pointer rounded-2xl px-5 py-2 text-base flex items-center justify-between min-w-[150px] bg-white focus:outline-none shadow-sm transition-all ${
                    wonByDropdownOpen ? "ring-2 ring-[#E53E3E]" : ""
                  }`}
                  onClick={() => setWonByDropdownOpen((open) => !open)}
                  tabIndex={0}
                  style={{ fontWeight: 400 }}
                >
                  <span className={wonBy ? "text-black" : "text-[#222]"}>
                    {wonBy
                      ? wonBy === "customer"
                        ? "Customer"
                        : "Store"
                      : "Won by"}
                  </span>
                  <svg
                    className={`ml-2 w-5 h-5 transition-transform ${
                      wonByDropdownOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="#222"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {wonByDropdownOpen && (
                  <div
                    className="absolute left-0 top-full w-full bg-white border border-[#BDBDBD] rounded-2xl shadow-lg z-50 flex flex-col"
                    style={{ marginTop: 8, padding: 0 }}
                  >
                    <button
                      className="block w-full text-left px-6 py-4 text-lg text-black hover:bg-gray-100 rounded-t-2xl cursor-pointer"
                      style={{ fontWeight: 400, background: "white" }}
                      onClick={() => handleWonByChange("customer")}
                    >
                      Customer
                    </button>
                    <button
                      className="block w-full text-left px-6 py-4 text-lg text-black hover:bg-gray-100 rounded-b-2xl cursor-pointer"
                      style={{ fontWeight: 400, background: "white" }}
                      onClick={() => handleWonByChange("store")}
                    >
                      Store
                    </button>
                  </div>
                )}
              </div>
              {/* <div className="rounded-full p-2 border border-[#CDCDCD]">
                <img
                  className="cursor-pointer"
                  src={images.shoppingcart}
                  alt=""
                />
              </div> */}
              <button
                onClick={handleClose}
                className="p-2 rounded-md cursor-pointer"
                aria-label="Close"
              >
                <img className="w-7 h-7" src={images.close} alt="Close" />
              </button>
            </div>
          </div>
        </div>
        {/* Content */}
        {isLoadingDetails ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E53E3E]"></div>
          </div>
        ) : detailsError ? (
          <div className="text-center text-red-500 p-4">
            <p className="text-sm">Error loading dispute details</p>
          </div>
        ) : disputeDetails?.data ? (
          <div className="pr-5 pl-5 mt-3">
            <div className="flex flex-row justify-between">
              <div className="flex gap-2">
                <div>
                  <img 
                    className="w-14 h-14 rounded-full object-cover" 
                    src={disputeDetails.data.dispute?.user?.profile_picture} 
                    alt="User" 
                  />
                </div>
                <div className="flex flex-col gap-1 items-center justify-center">
                  <span className="text-[16px] mr-9">
                    {disputeDetails.data.dispute?.user?.name || disputeDetails.data.dispute?.chat?.user?.name || "Unknown User"}
                  </span>
                  <span className="text-[#00000080] text-[14px] ml-[12px]">
                    {disputeDetails.data.dispute?.user?.email || disputeDetails.data.dispute?.chat?.user?.email || "No email"}
                  </span>
                </div>
              </div>

            <div className="mt-5 flex flex-col gap-2">
              {!hasJoinedChat ? (
                <button
                  onClick={handleJoinChat}
                  className="px-5 py-3 cursor-pointer text-white bg-[#E53E3E] rounded-lg"
                >
                  Join Chat
                </button>
              ) : (
                <button
                  onClick={handleLeaveChat}
                  className="px-5 py-3 cursor-pointer text-white bg-[#E53E3E] rounded-lg"
                >
                  Leave Chat
                </button>
              )}
              
              {hasJoinedChat && wonBy && (
                <div className="flex gap-2">
                  <button
                    onClick={handleResolveDispute}
                    disabled={isResolving}
                    className={`px-4 py-2 cursor-pointer text-white bg-green-600 rounded-lg text-sm ${
                      isResolving ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-700'
                    }`}
                  >
                    {isResolving ? 'Resolving...' : 'Resolve Dispute'}
                  </button>
                  <button
                    onClick={handleCloseDispute}
                    disabled={isClosing}
                    className={`px-4 py-2 cursor-pointer text-white bg-gray-600 rounded-lg text-sm ${
                      isClosing ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-700'
                    }`}
                  >
                    {isClosing ? 'Closing...' : 'Close Dispute'}
                  </button>
                </div>
              )}
              
              <button className="px-3 py-3 cursor-pointer text-white bg-black rounded-lg">
                Switch to buyer
              </button>
            </div>
          </div>
          {/* Dispute Information */}
          <div className="border border-[#E53E3E] bg-[#FFE5E5] rounded-2xl p-3 mt-3">
            <div className="flex flex-col">
              <div className="flex flex-row justify-between items-center mb-3">
                <span className="font-semibold text-lg">Dispute Information</span>
                <span className={`font-semibold px-3 py-1 rounded-full text-xs ${
                  disputeDetails.data.dispute?.status === 'open' 
                    ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' 
                    : disputeDetails.data.dispute?.status === 'resolved'
                    ? 'bg-green-100 text-green-800 border border-green-300'
                    : 'bg-red-100 text-red-800 border border-red-300'
                }`}>
                  {disputeDetails.data.dispute?.status?.toUpperCase() || 'UNKNOWN'}
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-700">Dispute ID</span>
                  <span className="text-sm text-gray-900">#{disputeDetails.data.dispute?.id || 'N/A'}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-700">Category</span>
                  <span className="text-sm text-gray-900">{disputeDetails.data.dispute?.category || 'N/A'}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-700">Details</span>
                  <span className="text-sm text-gray-900">{disputeDetails.data.dispute?.details || 'No details provided'}</span>
                </div>
                
                {/* Dispute Images */}
                {disputeDetails.data.dispute?.images && disputeDetails.data.dispute.images.length > 0 && (
                  <div className="flex flex-col mt-3">
                    <span className="text-sm font-medium text-gray-700 mb-2">Dispute Images</span>
                    <div className="grid grid-cols-2 gap-2">
                      {disputeDetails.data.dispute.images.map((image: string, index: number) => (
                        <div key={index} className="relative">
                          <img 
                            src={`https://colala.hmstech.xyz/storage/${image}`}
                            alt={`Dispute evidence ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => window.open(`https://colala.hmstech.xyz/storage/${image}`, '_blank')}
                          />
                          <div className="absolute top-1 right-1 bg-black bg-opacity-50 text-white text-xs px-1 py-0.5 rounded">
                            {index + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Order Information */}
          {disputeDetails.data.dispute?.store_order && (
            <div className="border border-[#E53E3E] bg-[#FFE5E5] rounded-2xl p-3 mt-3">
              <div className="flex flex-col">
                <div className="flex flex-row justify-between">
                  <span className="font-semibold">Order Information</span>
                  <span className="text-[#E53E3E] font-semibold">
                    ₦{disputeDetails.data.dispute.store_order.subtotal_with_shipping || '0'}
                  </span>
                </div>
                <div className="mt-3 space-y-2">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-700">Order No</span>
                    <span className="text-sm text-gray-900">#{disputeDetails.data.dispute.store_order.order_id || 'N/A'}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-700">Status</span>
                    <span className="text-sm text-gray-900">{disputeDetails.data.dispute.store_order.status || 'N/A'}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-700">Store</span>
                    <span className="text-sm text-gray-900">{disputeDetails.data.dispute.store_order.store?.name || disputeDetails.data.dispute?.chat?.store_name || 'N/A'}</span>
                  </div>
                </div>
                
                {/* Order Items */}
                {disputeDetails.data.dispute.store_order.items && disputeDetails.data.dispute.store_order.items.length > 0 && (
                  <div className="mt-3">
                    <span className="text-sm font-medium text-gray-700">Items ({disputeDetails.data.dispute.store_order.items.length})</span>
                    <div className="mt-2 space-y-2">
                      {disputeDetails.data.dispute.store_order.items.map((item: OrderItem, index: number) => (
                        <div key={index} className="flex flex-row justify-between items-center p-2 bg-[#F9F9F9] rounded-lg">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">{item.name || 'Unknown Product'}</span>
                            <span className="text-xs text-gray-500">Qty: {item.qty || 1}</span>
                            {item.sku && <span className="text-xs text-gray-400">SKU: {item.sku}</span>}
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-sm font-semibold text-[#E53E3E]">₦{item.unit_price || '0'}</span>
                            <span className="text-xs text-gray-500">Total: ₦{item.line_total || '0'}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          {/* Chat Messages Section */}
          {disputeDetails.data.dispute?.chat?.recent_messages && disputeDetails.data.dispute.chat.recent_messages.length > 0 ? (
            disputeDetails.data.dispute.chat.recent_messages.map((message: ChatMessage, index: number) => (
              <div key={message.id || index} className="flex flex-row justify-between">
                {message.sender_type === 'buyer' ? (
                  <div></div>
                ) : null}
                <div className={`flex flex-col px-4 py-3 w-75 mt-3 rounded-t-3xl ${
                  message.sender_type === 'buyer' 
                    ? 'bg-[#E53E3E] rounded-bl-3xl rounded-br-lg' 
                    : 'bg-[#FFD8D8] rounded-br-3xl rounded-bl-lg'
                }`}>
                  <span className={message.sender_type === 'buyer' ? 'text-white' : 'text-black'}>
                    {message.message}
                  </span>
                  <span className={`text-[12px] flex justify-end-safe mr-4 mt-1 ${
                    message.sender_type === 'buyer' ? 'text-[#FFFFFF80]' : 'text-[#00000080]'
                  }`}>
                    {new Date(message.created_at).toLocaleTimeString()}
                  </span>
                </div>
                {message.sender_type === 'store' ? (
                  <div></div>
                ) : null}
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 py-4">
              <p className="text-sm">No messages in this chat yet</p>
            </div>
          )}
          {/* Additional messages shown after joining chat */}
          {hasJoinedChat && (
            <>
              {/* Dispute Category Section */}
              <div className="mt-4 p-4 bg-[#FFE5E5] border border-[#E53E3E] rounded-2xl">
                <div className="text-[#E53E3E] text-sm font-semibold mb-2">
                  Category
                </div>
                <div className="text-black font-semibold text-lg mb-3">
                  Order Dispute
                </div>
                <div className="text-[#E53E3E] text-sm font-semibold mb-2">
                  Details
                </div>
                <div className="text-black">
                  The store is not responding to me
                </div>
              </div>
              {/* You have joined chat notification */}
              <div className="w-full mt-4 p-3 bg-[#FFE5E5] border border-[#E53E3E] rounded-2xl text-center">
                <span className="text-[#E53E3E] font-medium">
                  You have joined this chat
                </span>
              </div>
              {/* Customer Agent Message */}
              <div className="flex flex-row justify-between mt-4 mb-10">
                <div className="bg-[#E8D5FF] flex flex-col px-4 py-3 w-80 rounded-t-3xl rounded-bl-lg rounded-br-3xl">
                  <span className="text-black">
                    We will find a way to resolve it
                  </span>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-[#9333EA] text-[10px] font-medium">
                      Customer Agent
                    </span>
                    <span className="text-[#00000080] text-[12px]">
                      07:22AM
                    </span>
                  </div>
                </div>
                <div></div>
              </div>
            </>
          )}
          
          {/* Message Input */}
          <div className="sticky bottom-0 bg-white p-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Type a message"
                className="w-full pl-12 pr-16 py-3 border border-[#CDCDCD] rounded-2xl text-[14px] bg-[#FFFFFF]"
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <img src="/assets/layout/pin.svg" alt="Attachment" />
              </div>
              <button className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded-full">
                <img src="/assets/layout/sendmessage.svg" alt="Send" />
              </button>
            </div>
          </div>
        </div>
        ) : (
          <div className="text-center text-gray-500 p-4">
            <p className="text-sm">No dispute data available</p>
          </div>
        )}
      </div>
      {/* Warning Modal */}

      <WarningModal show={showWarningModal} onClose={closeWarning} />
    </div>
  );
};

export default DisputesModal;
