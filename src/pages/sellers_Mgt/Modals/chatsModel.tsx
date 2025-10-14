import images from "../../../constants/images";
import { useQuery } from "@tanstack/react-query";
import { getSellerChatDetails } from "../../../utils/queries/users";

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
  } catch (error) {
    return 'Invalid time';
  }
};

interface ChatsModelProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
  chatId?: string;
}

const ChatsModel: React.FC<ChatsModelProps> = ({ isOpen, onClose, userId, chatId }) => {
  if (!isOpen) return null;

  const { data: chatDetails, isLoading, error } = useQuery({
    queryKey: ['sellerChatDetails', userId, chatId],
    queryFn: () => getSellerChatDetails(userId!, chatId!),
    enabled: !!userId && !!chatId,
    staleTime: 2 * 60 * 1000,
  });

  const chatData = chatDetails?.data;
  const customerInfo = chatData?.customer_info;
  const orderInfo = chatData?.order_info;
  const messages = chatData?.messages || [];

  return (
    <div className="fixed inset-0 z-100 bg-[#00000080] bg-opacity-50 flex justify-end">
      <div className="bg-white w-[530px] relative h-full overflow-y-auto">
        {/* Header */}
        <div className="border-b border-[#787878] px-3 py-3 sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Chat</h2>
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
                    {orderInfo.items?.map((item: any, index: number) => (
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
              {messages.map((message: any) => (
                <div key={message.id} className="flex flex-row justify-between">
                  {message.sender_type === 'buyer' ? (
                    <div></div>
                  ) : null}
                  <div className={`flex flex-col px-4 py-3 mt-3 ${
                    message.sender_type === 'buyer' 
                      ? 'bg-[#E53E3E] text-white rounded-t-3xl rounded-bl-3xl rounded-br-lg' 
                      : 'bg-[#FFD8D8] text-black rounded-t-3xl rounded-bl-lg rounded-br-3xl'
                  }`}>
                    <span className={message.sender_type === 'buyer' ? 'text-white' : 'text-black'}>
                      {message.message}
                    </span>
                    <span className={`text-[12px] flex justify-end-safe mr-4 ${
                      message.sender_type === 'buyer' ? 'text-[#FFFFFF80]' : 'text-[#00000080]'
                    }`}>
                      {formatMessageTime(message.created_at)}
                    </span>
                  </div>
                  {message.sender_type === 'store' ? (
                    <div></div>
                  ) : null}
                </div>
              ))}
              
              {messages.length === 0 && (
                <div className="flex justify-center items-center h-32 text-gray-500">
                  No messages yet
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
export default ChatsModel;
