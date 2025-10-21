import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import images from "../../../../constants/images";
import { getChatDetails, sendChatMessage, updateChatStatus } from "../../../../utils/queries/chats";
import { useToast } from "../../../../contexts/ToastContext";

interface ChatsModelProps {
  isOpen: boolean;
  onClose: () => void;
  chatData?: {
    id: string | number;
    storeName?: string;
    userName?: string;
    lastMessage?: string;
    chatDate?: string;
    type?: string;
    other?: string;
    isUnread?: boolean;
  };
  buyerPart?: boolean;
}

const ChatsModel: React.FC<ChatsModelProps> = ({ isOpen, onClose, chatData, buyerPart }) => {
  const [input, setInput] = useState("");
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<'open' | 'closed' | 'resolved'>('open');
  
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  // Fetch chat details
  const { data: chatDetails, isLoading, error } = useQuery({
    queryKey: ['chatDetails', chatData?.id],
    queryFn: () => {
      if (!chatData?.id) throw new Error('No chat ID provided');
      return getChatDetails(chatData.id);
    },
    enabled: !!chatData?.id && isOpen,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: (messageData: { message: string; sender_type: 'buyer' | 'store' }) => 
      sendChatMessage(chatData!.id, messageData),
    onSuccess: () => {
      // Invalidate and refetch chat details to get updated messages
      queryClient.invalidateQueries({ queryKey: ['chatDetails', chatData?.id] });
      setInput("");
      showToast('Message sent successfully', 'success');
    },
    onError: (error: unknown) => {
      console.error('Send message error:', error);
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to send message';
      showToast(errorMessage, 'error');
    },
  });

  // Update chat status mutation
  const updateStatusMutation = useMutation({
    mutationFn: (statusData: { status: 'open' | 'closed' | 'resolved'; type?: 'general' | 'support' | 'dispute' }) => 
      updateChatStatus(chatData!.id, statusData),
    onSuccess: () => {
      // Invalidate and refetch chat details to get updated status
      queryClient.invalidateQueries({ queryKey: ['chatDetails', chatData?.id] });
      setShowStatusDropdown(false);
      showToast('Chat status updated successfully', 'success');
    },
    onError: (error: unknown) => {
      console.error('Update status error:', error);
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to update chat status';
      showToast(errorMessage, 'error');
    },
  });

  // Update selected status when chat details load
  useEffect(() => {
    if (chatDetails?.data?.chat_info?.status) {
      setSelectedStatus(chatDetails.data.chat_info.status as 'open' | 'closed' | 'resolved');
    }
  }, [chatDetails]);

  // Close status dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showStatusDropdown && !target.closest('.status-dropdown')) {
        setShowStatusDropdown(false);
      }
    };

    if (showStatusDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showStatusDropdown]);

  if (!isOpen) return null;

  const handleSend = () => {
    if (input.trim() === "" || sendMessageMutation.isPending) return;
    
    sendMessageMutation.mutate({
      message: input.trim(),
      sender_type: 'store' // Admin sending as store
    });
  };

  const handleStatusUpdate = (status: 'open' | 'closed' | 'resolved') => {
    setSelectedStatus(status);
    updateStatusMutation.mutate({
      status,
      type: chatDetails?.data?.chat_info?.type || 'general'
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setInput((e.target as any).value);
  };

  return (
    <div className="fixed inset-0 z-100 bg-[#00000080] bg-opacity-50 flex justify-end">
      <div className="bg-white w-[530px] relative h-full overflow-y-auto">
        {/* Header */}
        <div className="border-b border-[#787878] px-3 py-3 sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Chat</h2>
            <div className="flex flex-row items-center gap-3">
              {/* Status Dropdown */}
              <div className="relative status-dropdown">
                <button
                  onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                  disabled={updateStatusMutation.isPending}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    selectedStatus === 'open' 
                      ? 'bg-green-100 text-green-800' 
                      : selectedStatus === 'closed' 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-blue-100 text-blue-800'
                  } ${updateStatusMutation.isPending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:opacity-80'}`}
                >
                  {updateStatusMutation.isPending ? 'Updating...' : selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1)}
                </button>
                
                {showStatusDropdown && (
                  <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                    <div className="py-1">
                      <button
                        onClick={() => handleStatusUpdate('open')}
                        className="block w-full text-left px-4 py-2 text-sm text-green-800 hover:bg-green-50"
                      >
                        Open
                      </button>
                      <button
                        onClick={() => handleStatusUpdate('closed')}
                        className="block w-full text-left px-4 py-2 text-sm text-red-800 hover:bg-red-50"
                      >
                        Closed
                      </button>
                      <button
                        onClick={() => handleStatusUpdate('resolved')}
                        className="block w-full text-left px-4 py-2 text-sm text-blue-800 hover:bg-blue-50"
                      >
                        Resolved
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              <button
                onClick={onClose}
                className="p-2 rounded-md cursor-pointer"
                aria-label="Close"
              >
                <img className="w-7 h-7" src={images.close} alt="Close" />
              </button>
            </div>
          </div>
        </div>

        {/* Chat Info */}
        {chatDetails?.data && (
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                <img
                  src={chatDetails.data.customer_info?.customer_profile_image || images.admin}
                  alt="Customer"
                  className="w-12 h-12 rounded-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = images.admin;
                  }}
                />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {chatDetails.data.customer_info?.customer_name || "Unknown Customer"}
                </h3>
                <p className="text-sm text-gray-600">
                  {chatDetails.data.store_info?.store_name || "Unknown Store"}
                </p>
                <p className="text-xs text-gray-500">
                  {chatDetails.data.chat_info?.type || "general"} • {chatDetails.data.chat_info?.status || "active"}
                </p>
              </div>
            </div>
          </div>
        )}
        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E53E3E]"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 p-4">
            <p className="text-sm">Error loading chat details</p>
          </div>
        ) : chatDetails?.data ? (
          <div className="pr-5 pl-5 mt-3">
            <div className="flex flex-row justify-between">
              <div className="flex gap-2">
                <div>
                  <img 
                    className="w-20 h-20 rounded-full object-cover" 
                    src={chatDetails.data.store_info?.store_profile_image || images.admin} 
                    alt="Store" 
                    onError={(e) => {
                      e.currentTarget.src = images.admin;
                    }}
                  />
                </div>
                <div className="flex flex-col gap-1 items-center justify-center">
                  <span className="text-[20px]">{chatDetails.data.store_info?.store_name || "Unknown Store"}</span>
                  <span className="text-[#00000080] text-[10px] ml-[-18px]">
                    {chatDetails.data.store_info?.store_location || "Unknown Location"}
                  </span>
                </div>
              </div>
              <div className="mt-5">
                <button className="px-5 py-2 cursor-pointer text-white bg-[#F29F9F] rounded-lg mr-2">
                  Join Chat
                </button>
                <button className="px-3 py-2 cursor-pointer text-white bg-black rounded-lg">
                  Switch to Store
                </button>
              </div>
            </div>
          {/* Order Information */}
          {chatDetails.data.order_info && (
            <div className="border border-[#E53E3E] bg-[#FFE5E5] rounded-2xl p-3 mt-3">
              <div className="flex flex-col">
                <div className="flex flex-row justify-between">
                  <span className="font-semibold">Order Information</span>
                  <span className="text-[#E53E3E] font-semibold">₦{chatDetails.data.order_info.grand_total || '0'}</span>
                </div>
                <div className="mt-2">
                  <div className="text-sm text-gray-600">
                    <strong>Order No:</strong> {chatDetails.data.order_info.order_no || 'N/A'}
                  </div>
                  <div className="text-sm text-gray-600">
                    <strong>Payment Status:</strong> 
                    <span className={`ml-1 px-2 py-1 rounded text-xs ${
                      chatDetails.data.order_info.payment_status === 'paid' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {chatDetails.data.order_info.payment_status || 'Unknown'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* Messages from API */}
          {chatDetails.data.messages && chatDetails.data.messages.length > 0 ? (
            chatDetails.data.messages.map((message: {
              sender: string;
              message?: string;
              text?: string;
              created_at?: string;
            }, index: number) => (
              <div key={index} className="flex flex-row justify-between">
                {message.sender === 'buyer' ? (
                  <div></div>
                ) : null}
                <div className={`flex flex-col px-4 py-3 w-75 mt-3 rounded-t-3xl ${
                  message.sender === 'buyer' 
                    ? 'bg-[#E53E3E] rounded-bl-3xl rounded-br-lg' 
                    : 'bg-[#FFD8D8] rounded-br-3xl rounded-bl-lg'
                }`}>
                  <span className={message.sender === 'buyer' ? 'text-white' : 'text-black'}>
                    {message.message || message.text || 'No message content'}
                  </span>
                  <span className={`text-[12px] flex justify-end-safe mr-4 ${
                    message.sender === 'buyer' ? 'text-[#FFFFFF80]' : 'text-[#00000080]'
                  }`}>
                    {message.created_at ? new Date(message.created_at).toLocaleTimeString() : 'Unknown time'}
                  </span>
                </div>
                {message.sender === 'store' ? (
                  <div></div>
                ) : null}
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 py-4">
              <p className="text-sm">No messages in this chat yet</p>
            </div>
          )}
          </div>
        ) : (
          <div className="text-center text-gray-500 p-4">
            <p className="text-sm">No chat data available</p>
          </div>
        )}

        {/* Message Input - Only show if not buyerPart */}
        {!buyerPart && (
          <div className="sticky bottom-0 bg-white  p-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Type a message"
                className="w-full pl-12 pr-16 py-5 border border-[#CDCDCD] rounded-2xl  bg-[#FFFFFF]"
                value={input}
                onChange={handleInputChange}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSend();
                }}
              />
              {/* Attachment Icon */}
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                <img
                  className="cursor-pointer"
                  src={images.link1}
                  alt="Attachment"
                />
              </div>
              {/* Send Button */}
              <button
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-2 ${
                  sendMessageMutation.isPending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                }`}
                onClick={handleSend}
                disabled={sendMessageMutation.isPending || input.trim() === ""}
              >
                {sendMessageMutation.isPending ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#E53E3E]"></div>
                ) : (
                  <img className="cursor-pointer" src={images.share3} alt="Send" />
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default ChatsModel;
