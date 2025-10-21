import images from "../../../constants/images";
import { useQuery } from "@tanstack/react-query";
import { getSellerChatDetails } from "../../../utils/queries/users";
import { useState, useRef, useEffect, useMemo } from "react";

// Utility function to format date safely
const formatMessageTime = (dateString: string): string => {
  try {
    // Try parsing the date directly first
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    }
    
    // If direct parsing fails, try parsing the format "14-10-2025 07:31:13"
    const parts = dateString.split(' ');
    if (parts.length === 2) {
      const [datePart, timePart] = parts;
      const [day, month, year] = datePart.split('-');
      const [hour, minute, second] = timePart.split(':');
      const validDate = new Date(
        parseInt(year), 
        parseInt(month) - 1, 
        parseInt(day), 
        parseInt(hour), 
        parseInt(minute), 
        parseInt(second)
      );
      
      if (!isNaN(validDate.getTime())) {
        return validDate.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        });
      }
    }
    
    return 'Invalid time';
  } catch {
    return 'Invalid time';
  }
};

interface Message {
  id: number;
  message: string;
  image?: {
    path: string;
    url: string;
  } | null;
  sender_type: 'buyer' | 'store';
  sender_name: string;
  sender_avatar: string;
  is_read: number;
  created_at: string;
  updated_at: string;
}

interface OrderItem {
  product?: {
    name?: string;
    images?: Array<{ url: string }>;
  };
  total?: string;
  quantity?: number;
}

interface OrderInfo {
  order_no?: string;
  pricing?: {
    subtotal_with_shipping?: string;
  };
  items?: OrderItem[];
}

interface ChatsModelProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
  chatId?: string;
}

const ChatsModel: React.FC<ChatsModelProps> = ({ isOpen, onClose, userId, chatId }) => {
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setNewMessage((e.target as any).value);
  };

  const { data: chatDetails, isLoading, error } = useQuery({
    queryKey: ['sellerChatDetails', userId, chatId],
    queryFn: () => getSellerChatDetails(userId!, chatId!),
    enabled: !!userId && !!chatId,
    staleTime: 2 * 60 * 1000,
  });

  const chatData = chatDetails?.data;
  const customerInfo = chatData?.customer_info;
  const orderInfo: OrderInfo | undefined = chatData?.order_info;
  const messages = useMemo(() => chatData?.messages || [], [chatData?.messages]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 bg-[#00000080] bg-opacity-50 flex justify-end">
      <div className="bg-white w-[530px] relative h-full overflow-y-auto">
        {/* Header */}
        <div className="border-b border-[#787878] px-3 py-3 sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Chat</h2>
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
        {/* Content */}
        <div className="pr-5 pl-5 mt-3">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E53E3E]"></div>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center h-64 text-red-500">
              Failed to load chat details
            </div>
          ) : (
            <>
              <div className="flex flex-row justify-between">
                <div className="flex gap-2">
                  <div>
                    <img 
                      className="w-20 h-20 rounded-full object-cover" 
                      src={customerInfo?.avatar || images.sasha} 
                      alt="" 
                    />
                  </div>
                  <div className="flex flex-col gap-1 items-center justify-center">
                    <span className="text-[20px]">{customerInfo?.name || 'N/A'}</span>
                    <span className="text-[#00000080] text-[10px] ml-[-18px]">
                      {customerInfo?.is_verified ? 'Verified' : 'Unverified'}
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
              {orderInfo && (
                <div className="border border-[#E53E3E] bg-[#FFE5E5] rounded-2xl p-3 mt-3">
                  <div className="flex flex-col">
                    <div className="flex flex-row justify-between">
                      <span className="font-semibold">Order #{orderInfo.order_no}</span>
                      <span className="text-[#E53E3E] font-semibold">N{orderInfo.pricing?.subtotal_with_shipping || '0.00'}</span>
                    </div>
                    {orderInfo.items?.map((item: OrderItem, index: number) => (
                      <div key={index} className="flex flex-row mt-3">
                        <div>
                          <img 
                            className="rounded-l-lg w-16 h-16 object-cover" 
                            src={item.product?.images?.[0]?.url || images.iphone} 
                            alt="" 
                          />
                        </div>
                        <div className="flex flex-col p-1 pr-3 pl-3 bg-[#F9F9F9] w-full rounded-r-lg justify-between">
                          <div className="text-[18px]">{item.product?.name || 'N/A'}</div>
                          <div className="flex flex-row justify-between">
                            <span className="text-[#E53E3E] font-semibold">
                              N{item.total || '0.00'}
                            </span>
                            <span>Qty: {item.quantity}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Messages */}
              <div className="flex flex-col space-y-2 mb-4">
                {messages.map((message: Message) => (
                  <div key={message.id} className={`flex ${message.sender_type === 'buyer' ? 'justify-start' : 'justify-end'}`}>
                    <div className={`flex flex-col max-w-xs ${
                      message.sender_type === 'buyer' ? 'items-start' : 'items-end'
                    }`}>
                      {/* Message Content */}
                      <div className={`px-4 py-3 mt-3 ${
                        message.sender_type === 'buyer' 
                          ? 'bg-[#E53E3E] text-white rounded-t-3xl rounded-bl-3xl rounded-br-lg' 
                          : 'bg-[#FFD8D8] text-black rounded-t-3xl rounded-bl-lg rounded-br-3xl'
                      }`}>
                        {/* Message Text */}
                        {message.message && (
                          <span className={message.sender_type === 'buyer' ? 'text-white' : 'text-black'}>
                            {message.message}
                          </span>
                        )}
                        
                        {/* Message Image */}
                        {message.image && message.image.url && (
                          <div className="mt-2">
                            <img 
                              src={message.image.url} 
                              alt="Chat image" 
                              className="max-w-full h-auto rounded-lg cursor-pointer"
                              onClick={() => window.open(message.image!.url, '_blank')}
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                      </div>
                      
                      {/* Timestamp */}
                      <span className={`text-[12px] mt-1 px-2 ${
                        message.sender_type === 'buyer' ? 'text-[#00000080]' : 'text-[#00000080]'
                      }`}>
                        {formatMessageTime(message.created_at)}
                      </span>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              
              {messages.length === 0 && (
                <div className="flex justify-center items-center h-32 text-gray-500">
                  No messages yet
                </div>
              )}

              {/* Message Input Area */}
             
            </>
          )}
        </div>
      </div>
    </div>
  );
};
export default ChatsModel;
