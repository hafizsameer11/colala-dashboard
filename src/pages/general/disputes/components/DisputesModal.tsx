import React, { useState, useEffect, useCallback, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import images from "../../../../constants/images";
import WarningModal from "./WarningModal";
import { getDisputeDetails, resolveDispute, closeDispute, getDisputeChat, sendDisputeMessage } from "../../../../utils/queries/disputes";
import { useToast } from "../../../../contexts/ToastContext";
import OrderDetails from "../../../sellers_Mgt/Modals/orderDetails";

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
  sender_type: 'buyer' | 'seller' | 'admin' | 'store';
  sender_id?: number;
  sender_name?: string;
  image?: string | null;
  is_read?: boolean;
  created_at: string;
}

interface Dispute {
  id: string | number;
  category?: string;
  details?: string;
  images?: string[];
  status: "open" | "pending" | "on_hold" | "resolved" | "closed";
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
  const [resolutionNotes, setResolutionNotes] = useState("");
  
  // Message state
  const [messageInput, setMessageInput] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Dispute details and loading states
  const [isResolving, setIsResolving] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const navigate = useNavigate();
  
  // Order details modal state
  const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | number | null>(null);

  // Fetch detailed dispute information
  const { data: disputeDetails, isLoading: isLoadingDetails, error: detailsError } = useQuery({
    queryKey: ['disputeDetails', disputeData?.id],
    queryFn: () => getDisputeDetails(disputeData?.id || 0),
    enabled: !!disputeData?.id && isOpen,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch dispute chat messages
  const { data: chatData, isLoading: isLoadingChat } = useQuery({
    queryKey: ['disputeChat', disputeData?.id],
    queryFn: () => getDisputeChat(disputeData?.id || 0),
    enabled: !!disputeData?.id && isOpen && hasJoinedChat,
    refetchInterval: 5000, // Refetch every 5 seconds when chat is open
    staleTime: 0, // Always fetch fresh data
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (data: { message?: string; image?: File }) => {
      if (!disputeData?.id) throw new Error('No dispute ID');
      
      const formData = new FormData();
      if (data.message) formData.append('message', data.message);
      if (data.image) formData.append('image', data.image);
      
      return sendDisputeMessage(disputeData.id, formData);
    },
    onSuccess: () => {
      setMessageInput("");
      setSelectedImage(null);
      setImagePreview(null);
      // Refetch chat messages
      queryClient.invalidateQueries({ queryKey: ['disputeChat', disputeData?.id] });
      queryClient.invalidateQueries({ queryKey: ['disputeDetails', disputeData?.id] });
      showToast('Message sent successfully', 'success');
      // Scroll to bottom after sending
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    },
    onError: (error: unknown) => {
      console.error('Error sending message:', error);
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to send message. Please try again.';
      showToast(errorMessage, 'error');
    },
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

  // Scroll to bottom when messages change
  useEffect(() => {
    if (hasJoinedChat && isOpen) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [chatData, hasJoinedChat, isOpen]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setHasJoinedChat(false);
      setWonBy("");
      setMessageInput("");
      setSelectedImage(null);
      setImagePreview(null);
      setWonByDropdownOpen(false);
      setResolutionNotes("");
    }
  }, [isOpen]);

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

  // Handle image selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        showToast('Image size must be less than 5MB', 'error');
        return;
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle send message
  const handleSendMessage = async () => {
    if (!hasJoinedChat) {
      showToast('Please join the chat first', 'error');
      return;
    }

    if (!messageInput.trim() && !selectedImage) {
      showToast('Please enter a message or select an image', 'error');
      return;
    }

    sendMessageMutation.mutate({
      message: messageInput.trim() || undefined,
      image: selectedImage || undefined,
    });
  };

  // Handle key press in message input
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Remove image preview
  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle resolve dispute
  const handleResolveDispute = async () => {
    if (!disputeData?.id || !wonBy) {
      showToast('Please select who won the dispute before resolving', 'error');
      return;
    }

    if (!resolutionNotes.trim()) {
      showToast('Please enter resolution notes before resolving', 'error');
      return;
    }

    try {
      setIsResolving(true);
      const wonByValue = wonBy === 'customer' ? 'buyer' : 'seller';
      const response = await resolveDispute(disputeData.id, { 
        won_by: wonByValue,
        resolution_notes: resolutionNotes.trim()
      });
      if (response.status === 'success') {
        const escrowInfo = response.data?.escrow_info;
        let successMessage = 'Dispute resolved successfully';
        if (escrowInfo) {
          if (wonByValue === 'seller') {
            successMessage += `. Escrow of ₦${escrowInfo.amount || '0'} has been released to the seller.`;
          } else {
            successMessage += `. Escrow of ₦${escrowInfo.amount || '0'} has been refunded to the buyer.`;
          }
        }
        showToast(successMessage, 'success');
        queryClient.invalidateQueries({ queryKey: ['disputesList'] });
        queryClient.invalidateQueries({ queryKey: ['disputeDetails', disputeData.id] });
        onDisputeUpdate?.();
        onClose();
      }
    } catch (error: unknown) {
      console.error('Error resolving dispute:', error);
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to resolve dispute. Please try again.';
      showToast(errorMessage, 'error');
    } finally {
      setIsResolving(false);
    }
  };

  // Handle close dispute
  const handleCloseDispute = async () => {
    if (!disputeData?.id) {
      showToast('No dispute selected', 'error');
      return;
    }

    try {
      setIsClosing(true);
      const response = await closeDispute(disputeData.id);
      if (response.status === 'success') {
        showToast('Dispute closed successfully', 'success');
        queryClient.invalidateQueries({ queryKey: ['disputesList'] });
        onDisputeUpdate?.();
        onClose();
      }
    } catch (error: unknown) {
      console.error('Error closing dispute:', error);
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to close dispute. Please try again.';
      showToast(errorMessage, 'error');
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
                <div className="flex flex-col gap-3">
                  {/* Resolution Notes Input */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-700">
                      Resolution Notes <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={resolutionNotes}
                      onChange={(e) => setResolutionNotes(e.target.value)}
                      placeholder="Enter detailed resolution notes explaining the decision..."
                      rows={4}
                      className="w-full px-3 py-2 border border-[#CDCDCD] rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#E53E3E] focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500">
                      {wonBy === 'customer' 
                        ? 'Note: Escrow will be refunded to the buyer if order is paid.'
                        : 'Note: Escrow will be released to the seller if order is paid.'}
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={handleResolveDispute}
                      disabled={isResolving || !resolutionNotes.trim()}
                      className={`px-4 py-2 cursor-pointer text-white bg-green-600 rounded-lg text-sm ${
                        isResolving || !resolutionNotes.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-700'
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
                </div>
              )}
              
              {/* <button className="px-3 py-3 cursor-pointer text-white bg-black rounded-lg">
                Switch to buyer
              </button> */}
            </div>
          </div>
          {/* Dispute Information */}
          <div className="border border-[#E53E3E] bg-[#FFE5E5] rounded-2xl p-3 mt-3">
            <div className="flex flex-col">
              <div className="flex flex-row justify-between items-center mb-3">
                <span className="font-semibold text-lg">Dispute Information</span>
                <span className={`font-semibold px-3 py-1 rounded-full text-xs ${
                  disputeDetails.data.dispute?.status === 'open' || disputeDetails.data.dispute?.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' 
                    : disputeDetails.data.dispute?.status === 'resolved'
                    ? 'bg-green-100 text-green-800 border border-green-300'
                    : disputeDetails.data.dispute?.status === 'closed'
                    ? 'bg-gray-100 text-gray-800 border border-gray-300'
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
                  <span className="text-sm text-gray-900 whitespace-pre-wrap">{disputeDetails.data.dispute?.details || 'No details provided'}</span>
                </div>
                {disputeDetails.data.dispute?.won_by && (
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-700">Won By</span>
                    <span className="text-sm text-gray-900 font-semibold capitalize">
                      {disputeDetails.data.dispute.won_by === 'buyer' ? 'Buyer' : disputeDetails.data.dispute.won_by === 'seller' ? 'Seller' : 'Admin'}
                    </span>
                  </div>
                )}
                {disputeDetails.data.dispute?.resolution_notes && (
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-700">Resolution Notes</span>
                    <span className="text-sm text-gray-900 whitespace-pre-wrap">{disputeDetails.data.dispute.resolution_notes}</span>
                  </div>
                )}
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-700">Created At</span>
                  <span className="text-sm text-gray-900">
                    {disputeDetails.data.dispute?.created_at 
                      ? new Date(disputeDetails.data.dispute.created_at).toLocaleString()
                      : 'N/A'}
                  </span>
                </div>
                {disputeDetails.data.dispute?.resolved_at && (
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-700">Resolved At</span>
                    <span className="text-sm text-gray-900">
                      {new Date(disputeDetails.data.dispute.resolved_at).toLocaleString()}
                    </span>
                  </div>
                )}
                {disputeDetails.data.dispute?.closed_at && (
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-700">Closed At</span>
                    <span className="text-sm text-gray-900">
                      {new Date(disputeDetails.data.dispute.closed_at).toLocaleString()}
                    </span>
                  </div>
                )}
                
                {/* Dispute Images */}
                {disputeDetails.data.dispute?.images && disputeDetails.data.dispute.images.length > 0 && (
                  <div className="flex flex-col mt-3">
                    <span className="text-sm font-medium text-gray-700 mb-2">Dispute Images</span>
                    <div className="grid grid-cols-2 gap-2">
                      {disputeDetails.data.dispute.images.map((image: string, index: number) => (
                        <div key={index} className="relative">
                          <img 
                            src={`hhttps://api.colalamall.com/storage/${image}`}
                            alt={`Dispute evidence ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => window.open(`hhttps://api.colalamall.com/storage/${image}`, '_blank')}
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
                <div className="flex flex-row justify-between items-center mb-3">
                  <span className="font-semibold text-lg">Order Information</span>
                  <div className="flex gap-2">
                    {disputeDetails.data.dispute.store_order.order_id && (
                      <button
                        onClick={() => {
                          setSelectedOrderId(disputeDetails.data.dispute.store_order.order_id);
                          setIsOrderDetailsOpen(true);
                        }}
                        className="px-3 py-1.5 bg-[#E53E3E] text-white text-xs rounded-lg hover:bg-red-600 transition-colors cursor-pointer"
                      >
                        View Order
                      </button>
                    )}
                    {disputeDetails.data.dispute.store_order.store?.id && (
                      <button
                        onClick={() => navigate(`/store-details/${disputeDetails.data.dispute.store_order.store.id}`)}
                        className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                      >
                        View Store
                      </button>
                    )}
                  </div>
                </div>
                <div className="mb-3">
                  <span className="text-[#E53E3E] font-semibold text-lg">
                    ₦{disputeDetails.data.dispute.store_order.subtotal_with_shipping || '0'}
                  </span>
                </div>
                <div className="mt-3 space-y-2">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-700">Order No</span>
                    <span className="text-sm text-gray-900">#{disputeDetails.data.dispute.store_order.order_id || 'N/A'}</span>
                  </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-700">Order Status</span>
                  <span className="text-sm text-gray-900">{disputeDetails.data.dispute.store_order.status || 'N/A'}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-700">Total Amount</span>
                  <span className="text-sm text-gray-900 font-semibold">₦{disputeDetails.data.dispute.store_order.subtotal_with_shipping || '0'}</span>
                </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-700">Payment Status</span>
                    <span className={`text-sm font-semibold ${
                      disputeDetails.data.dispute.store_order.order?.payment_status === 'paid' 
                        ? 'text-green-600' 
                        : 'text-gray-900'
                    }`}>
                      {disputeDetails.data.dispute.store_order.order?.payment_status?.toUpperCase() || 'N/A'}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-700">Store</span>
                    <span className="text-sm text-gray-900">{disputeDetails.data.dispute.store_order.store?.name || disputeDetails.data.dispute?.chat?.store_name || 'N/A'}</span>
                  </div>
                  
                  {/* Escrow Information Warning */}
                  {disputeDetails.data.dispute.store_order.order?.payment_status === 'paid' && (
                    <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <span className="text-yellow-600 text-sm">⚠️</span>
                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-yellow-800">
                            Escrow Payment Detected
                          </span>
                          <span className="text-xs text-yellow-700 mt-1">
                            {wonBy === 'customer' 
                              ? 'If resolved in favor of buyer, escrow will be refunded to buyer\'s wallet.'
                              : wonBy === 'store'
                              ? 'If resolved in favor of seller, escrow will be released to seller\'s wallet.'
                              : 'Upon resolution, escrow will be handled based on the winner selection.'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
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
          {hasJoinedChat && (
            <>
              {/* Show messages from chat API if available, otherwise show recent messages from dispute details */}
              {isLoadingChat ? (
                <div className="text-center text-gray-500 py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#E53E3E] mx-auto"></div>
                  <p className="text-sm mt-2">Loading messages...</p>
                </div>
              ) : (() => {
                // Get messages from the correct API response structure
                // Priority: chatData API > disputeDetails.dispute_chat.messages > disputeDetails.chat.recent_messages
                const messages = chatData?.data?.dispute_chat?.messages 
                  || chatData?.data?.messages 
                  || disputeDetails.data.dispute?.dispute_chat?.messages
                  || disputeDetails.data.dispute?.chat?.recent_messages
                  || [];
                
                if (messages.length > 0) {
                  return (
                    <>
                      {messages.map((message: ChatMessage, index: number) => {
                        const isAdmin = message.sender_type === 'admin';
                        const isBuyer = message.sender_type === 'buyer';
                        
                        // Helper function to get image URL
                        const getImageUrl = (imagePath: string | null | undefined) => {
                          if (!imagePath) return null;
                          // If it's already a full URL, return as is
                          if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
                            return imagePath;
                          }
                          // Otherwise, prepend storage path
                          return `hhttps://api.colalamall.com/storage/${imagePath}`;
                        };
                        
                        const imageUrl = getImageUrl(message.image);
                        
                        return (
                          <div key={message.id || index} className={`flex flex-row ${isBuyer ? 'justify-start' : isAdmin ? 'justify-end' : 'justify-end'} mb-3`}>
                            {isBuyer ? (
                              <div className="flex flex-col max-w-[75%]">
                                <div className="flex flex-col px-4 py-3 bg-[#E53E3E] rounded-t-3xl rounded-bl-3xl rounded-br-lg">
                                  {imageUrl && (
                                    <img 
                                      src={imageUrl}
                                      alt="Message attachment"
                                      className="w-full max-w-xs rounded-lg mb-2 cursor-pointer hover:opacity-90 transition-opacity"
                                      onClick={() => window.open(imageUrl, '_blank')}
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                      }}
                                    />
                                  )}
                                  {message.message && (
                                    <span className="text-white">
                                      {message.message}
                                    </span>
                                  )}
                                  <span className="text-[12px] text-[#FFFFFF80] flex justify-end mt-1">
                                    {new Date(message.created_at).toLocaleTimeString()}
                                  </span>
                                </div>
                              </div>
                            ) : isAdmin ? (
                              <div className="flex flex-col max-w-[75%]">
                                <div className="flex flex-col px-4 py-3 bg-[#E8D5FF] rounded-t-3xl rounded-br-3xl rounded-bl-lg">
                                  {imageUrl && (
                                    <img 
                                      src={imageUrl}
                                      alt="Message attachment"
                                      className="w-full max-w-xs rounded-lg mb-2 cursor-pointer hover:opacity-90 transition-opacity"
                                      onClick={() => window.open(imageUrl, '_blank')}
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                      }}
                                    />
                                  )}
                                  {message.message && (
                                    <span className="text-black">
                                      {message.message}
                                    </span>
                                  )}
                                  <div className="flex justify-between items-center mt-1">
                                    <span className="text-[#9333EA] text-[10px] font-medium">
                                      {message.sender_name || 'Admin'}
                                    </span>
                                    <span className="text-[12px] text-[#00000080]">
                                      {new Date(message.created_at).toLocaleTimeString()}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="flex flex-col max-w-[75%]">
                                <div className="flex flex-col px-4 py-3 bg-[#FFD8D8] rounded-t-3xl rounded-br-3xl rounded-bl-lg">
                                  {imageUrl && (
                                    <img 
                                      src={imageUrl}
                                      alt="Message attachment"
                                      className="w-full max-w-xs rounded-lg mb-2 cursor-pointer hover:opacity-90 transition-opacity"
                                      onClick={() => window.open(imageUrl, '_blank')}
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                      }}
                                    />
                                  )}
                                  {message.message && (
                                    <span className="text-black">
                                      {message.message}
                                    </span>
                                  )}
                                  <span className="text-[12px] text-[#00000080] flex justify-end mt-1">
                                    {new Date(message.created_at).toLocaleTimeString()}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </>
                  );
                } else if (disputeDetails.data.dispute?.dispute_chat?.messages && disputeDetails.data.dispute.dispute_chat.messages.length > 0) {
                  return (
                    <>
                      {disputeDetails.data.dispute.dispute_chat.messages.map((message: ChatMessage, index: number) => {
                        const isAdmin = message.sender_type === 'admin';
                        const isBuyer = message.sender_type === 'buyer';
                        
                        // Helper function to get image URL
                        const getImageUrl = (imagePath: string | null | undefined) => {
                          if (!imagePath) return null;
                          // If it's already a full URL, return as is
                          if (typeof imagePath === 'string' && (imagePath.startsWith('http://') || imagePath.startsWith('https://'))) {
                            return imagePath;
                          }
                          // Otherwise, prepend storage path
                          return `hhttps://api.colalamall.com/storage/${imagePath}`;
                        };
                        
                        const imageUrl = getImageUrl(message.image);
                        
                        return (
                          <div key={message.id || index} className={`flex flex-row ${isBuyer ? 'justify-start' : isAdmin ? 'justify-end' : 'justify-end'} mb-3`}>
                            {isBuyer ? (
                              <div className="flex flex-col px-4 py-3 bg-[#E53E3E] rounded-t-3xl rounded-bl-3xl rounded-br-lg max-w-[75%]">
                                {imageUrl && (
                                  <img 
                                    src={imageUrl}
                                    alt="Message attachment"
                                    className="w-full max-w-xs rounded-lg mb-2 cursor-pointer hover:opacity-90 transition-opacity"
                                    onClick={() => window.open(imageUrl, '_blank')}
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                  />
                                )}
                                {message.message && (
                                  <span className="text-white">{message.message}</span>
                                )}
                                <span className="text-[12px] text-[#FFFFFF80] flex justify-end mt-1">
                                  {new Date(message.created_at).toLocaleTimeString()}
                                </span>
                              </div>
                            ) : isAdmin ? (
                              <div className="flex flex-col px-4 py-3 bg-[#E8D5FF] rounded-t-3xl rounded-br-3xl rounded-bl-lg max-w-[75%]">
                                {imageUrl && (
                                  <img 
                                    src={imageUrl}
                                    alt="Message attachment"
                                    className="w-full max-w-xs rounded-lg mb-2 cursor-pointer hover:opacity-90 transition-opacity"
                                    onClick={() => window.open(imageUrl, '_blank')}
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                  />
                                )}
                                {message.message && (
                                  <span className="text-black">{message.message}</span>
                                )}
                                <div className="flex justify-between items-center mt-1">
                                  <span className="text-[#9333EA] text-[10px] font-medium">
                                    {message.sender_name || 'Admin'}
                                  </span>
                                  <span className="text-[12px] text-[#00000080]">
                                    {new Date(message.created_at).toLocaleTimeString()}
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <div className="flex flex-col px-4 py-3 bg-[#FFD8D8] rounded-t-3xl rounded-br-3xl rounded-bl-lg max-w-[75%]">
                                {imageUrl && (
                                  <img 
                                    src={imageUrl}
                                    alt="Message attachment"
                                    className="w-full max-w-xs rounded-lg mb-2 cursor-pointer hover:opacity-90 transition-opacity"
                                    onClick={() => window.open(imageUrl, '_blank')}
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                  />
                                )}
                                {message.message && (
                                  <span className="text-black">{message.message}</span>
                                )}
                                <span className="text-[12px] text-[#00000080] flex justify-end mt-1">
                                  {new Date(message.created_at).toLocaleTimeString()}
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </>
                  );
                } else {
                  return (
                    <div className="text-center text-gray-500 py-4">
                      <p className="text-sm">No messages in this chat yet</p>
                    </div>
                  );
                }
              })()}
              <div ref={messagesEndRef} />
            </>
          )}
          
          {/* Show recent messages when not joined - with admin message support */}
          {!hasJoinedChat && (
            <>
              {/* Try to show messages from chat API first, then fallback to recent_messages */}
              {(() => {
                // Get messages from the correct API response structure
                // Priority: chatData API > disputeDetails.dispute_chat.messages > disputeDetails.chat.recent_messages
                const messages = chatData?.data?.dispute_chat?.messages 
                  || chatData?.data?.messages 
                  || disputeDetails.data.dispute?.dispute_chat?.messages
                  || disputeDetails.data.dispute?.chat?.recent_messages
                  || [];
                
                if (messages.length > 0) {
                  return (
                    <>
                      {messages.map((message: ChatMessage, index: number) => {
                        const isAdmin = message.sender_type === 'admin';
                        const isBuyer = message.sender_type === 'buyer';
                        
                        // Helper function to get image URL
                        const getImageUrl = (imagePath: string | null | undefined) => {
                          if (!imagePath) return null;
                          // If it's already a full URL, return as is
                          if (typeof imagePath === 'string' && (imagePath.startsWith('http://') || imagePath.startsWith('https://'))) {
                            return imagePath;
                          }
                          // Otherwise, prepend storage path
                          return `hhttps://api.colalamall.com/storage/${imagePath}`;
                        };
                        
                        const imageUrl = getImageUrl(message.image);
                        
                        return (
                          <div key={message.id || index} className={`flex flex-row ${isBuyer ? 'justify-start' : isAdmin ? 'justify-end' : 'justify-end'} mb-3`}>
                            {isBuyer ? (
                              <div className="flex flex-col max-w-[75%]">
                                <div className="flex flex-col px-4 py-3 bg-[#E53E3E] rounded-t-3xl rounded-bl-3xl rounded-br-lg">
                                  {imageUrl && (
                                    <img 
                                      src={imageUrl}
                                      alt="Message attachment"
                                      className="w-full max-w-xs rounded-lg mb-2 cursor-pointer hover:opacity-90 transition-opacity"
                                      onClick={() => window.open(imageUrl, '_blank')}
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                      }}
                                    />
                                  )}
                                  {message.message && (
                                    <span className="text-white">
                                      {message.message}
                                    </span>
                                  )}
                                  <span className="text-[12px] text-[#FFFFFF80] flex justify-end mt-1">
                                    {new Date(message.created_at).toLocaleTimeString()}
                                  </span>
                                </div>
                              </div>
                            ) : isAdmin ? (
                              <div className="flex flex-col max-w-[75%]">
                                <div className="flex flex-col px-4 py-3 bg-[#E8D5FF] rounded-t-3xl rounded-br-3xl rounded-bl-lg">
                                  {imageUrl && (
                                    <img 
                                      src={imageUrl}
                                      alt="Message attachment"
                                      className="w-full max-w-xs rounded-lg mb-2 cursor-pointer hover:opacity-90 transition-opacity"
                                      onClick={() => window.open(imageUrl, '_blank')}
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                      }}
                                    />
                                  )}
                                  {message.message && (
                                    <span className="text-black">
                                      {message.message}
                                    </span>
                                  )}
                                  <div className="flex justify-between items-center mt-1">
                                    <span className="text-[#9333EA] text-[10px] font-medium">
                                      {message.sender_name || 'Admin'}
                                    </span>
                                    <span className="text-[12px] text-[#00000080]">
                                      {new Date(message.created_at).toLocaleTimeString()}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="flex flex-col max-w-[75%]">
                                <div className="flex flex-col px-4 py-3 bg-[#FFD8D8] rounded-t-3xl rounded-br-3xl rounded-bl-lg">
                                  {imageUrl && (
                                    <img 
                                      src={imageUrl}
                                      alt="Message attachment"
                                      className="w-full max-w-xs rounded-lg mb-2 cursor-pointer hover:opacity-90 transition-opacity"
                                      onClick={() => window.open(imageUrl, '_blank')}
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                      }}
                                    />
                                  )}
                                  {message.message && (
                                    <span className="text-black">
                                      {message.message}
                                    </span>
                                  )}
                                  <span className="text-[12px] text-[#00000080] flex justify-end mt-1">
                                    {new Date(message.created_at).toLocaleTimeString()}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </>
                  );
                } else if (disputeDetails.data.dispute?.dispute_chat?.messages && disputeDetails.data.dispute.dispute_chat.messages.length > 0) {
                  return (
                    <>
                      {disputeDetails.data.dispute.dispute_chat.messages.map((message: ChatMessage, index: number) => {
                        const isAdmin = message.sender_type === 'admin';
                        const isBuyer = message.sender_type === 'buyer';
                        
                        // Helper function to get image URL
                        const getImageUrl = (imagePath: string | null | undefined) => {
                          if (!imagePath) return null;
                          // If it's already a full URL, return as is
                          if (typeof imagePath === 'string' && (imagePath.startsWith('http://') || imagePath.startsWith('https://'))) {
                            return imagePath;
                          }
                          // Otherwise, prepend storage path
                          return `hhttps://api.colalamall.com/storage/${imagePath}`;
                        };
                        
                        const imageUrl = getImageUrl(message.image);
                        
                        return (
                          <div key={message.id || index} className={`flex flex-row ${isBuyer ? 'justify-start' : isAdmin ? 'justify-end' : 'justify-end'} mb-3`}>
                            {isBuyer ? (
                              <div className="flex flex-col px-4 py-3 bg-[#E53E3E] rounded-t-3xl rounded-bl-3xl rounded-br-lg max-w-[75%]">
                                {imageUrl && (
                                  <img 
                                    src={imageUrl}
                                    alt="Message attachment"
                                    className="w-full max-w-xs rounded-lg mb-2 cursor-pointer hover:opacity-90 transition-opacity"
                                    onClick={() => window.open(imageUrl, '_blank')}
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                  />
                                )}
                                {message.message && (
                                  <span className="text-white">{message.message}</span>
                                )}
                                <span className="text-[12px] text-[#FFFFFF80] flex justify-end mt-1">
                                  {new Date(message.created_at).toLocaleTimeString()}
                                </span>
                              </div>
                            ) : isAdmin ? (
                              <div className="flex flex-col px-4 py-3 bg-[#E8D5FF] rounded-t-3xl rounded-br-3xl rounded-bl-lg max-w-[75%]">
                                {imageUrl && (
                                  <img 
                                    src={imageUrl}
                                    alt="Message attachment"
                                    className="w-full max-w-xs rounded-lg mb-2 cursor-pointer hover:opacity-90 transition-opacity"
                                    onClick={() => window.open(imageUrl, '_blank')}
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                  />
                                )}
                                {message.message && (
                                  <span className="text-black">{message.message}</span>
                                )}
                                <div className="flex justify-between items-center mt-1">
                                  <span className="text-[#9333EA] text-[10px] font-medium">
                                    {message.sender_name || 'Admin'}
                                  </span>
                                  <span className="text-[12px] text-[#00000080]">
                                    {new Date(message.created_at).toLocaleTimeString()}
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <div className="flex flex-col px-4 py-3 bg-[#FFD8D8] rounded-t-3xl rounded-br-3xl rounded-bl-lg max-w-[75%]">
                                {imageUrl && (
                                  <img 
                                    src={imageUrl}
                                    alt="Message attachment"
                                    className="w-full max-w-xs rounded-lg mb-2 cursor-pointer hover:opacity-90 transition-opacity"
                                    onClick={() => window.open(imageUrl, '_blank')}
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                  />
                                )}
                                {message.message && (
                                  <span className="text-black">{message.message}</span>
                                )}
                                <span className="text-[12px] text-[#00000080] flex justify-end mt-1">
                                  {new Date(message.created_at).toLocaleTimeString()}
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </>
                  );
                } else {
                  return (
                    <div className="text-center text-gray-500 py-4">
                      <p className="text-sm">No messages in this chat yet</p>
                    </div>
                  );
                }
              })()}
            </>
          )}
          {/* You have joined chat notification */}
          {hasJoinedChat && (
            <div className="w-full mt-4 p-3 bg-[#FFE5E5] border border-[#E53E3E] rounded-2xl text-center">
              <span className="text-[#E53E3E] font-medium">
                You have joined this chat
              </span>
            </div>
          )}
          
          {/* Message Input - Only show when joined chat */}
          {hasJoinedChat && (
            <div className="sticky bottom-0 bg-white p-4 border-t border-gray-200">
              {/* Image Preview */}
              {imagePreview && (
                <div className="relative mb-2 inline-block">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                  <button
                    onClick={handleRemoveImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              )}
              
              <div className="relative">
                <input
                  type="text"
                  placeholder="Type a message"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={sendMessageMutation.isPending}
                  className="w-full pl-12 pr-16 py-3 border border-[#CDCDCD] rounded-2xl text-[14px] bg-[#FFFFFF] disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded-full cursor-pointer"
                  disabled={sendMessageMutation.isPending}
                >
                  <img src="/assets/layout/pin.svg" alt="Attachment" className="w-5 h-5" />
                </button>
                <button
                  onClick={handleSendMessage}
                  disabled={sendMessageMutation.isPending || (!messageInput.trim() && !selectedImage)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sendMessageMutation.isPending ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#E53E3E]"></div>
                  ) : (
                    <img src="/assets/layout/sendmessage.svg" alt="Send" className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
        ) : (
          <div className="text-center text-gray-500 p-4">
            <p className="text-sm">No dispute data available</p>
          </div>
        )}
      </div>
      {/* Warning Modal */}
      <WarningModal show={showWarningModal} onClose={closeWarning} />
      
      {/* Order Details Modal */}
      {selectedOrderId && (
        <OrderDetails
          isOpen={isOrderDetailsOpen}
          onClose={() => {
            setIsOrderDetailsOpen(false);
            setSelectedOrderId(null);
          }}
          orderId={selectedOrderId.toString()}
        />
      )}
    </div>
  );
};

export default DisputesModal;
