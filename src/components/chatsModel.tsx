import images from "../constants/images";
import { useQuery } from "@tanstack/react-query";
import { getChatDetails } from "../utils/queries/users";

interface ChatsModelProps {
  isOpen: boolean;
  onClose: () => void;
  chatId?: string | number;
  userId?: string | number;
}

const ChatsModel: React.FC<ChatsModelProps> = ({ isOpen, onClose, chatId, userId }) => {
  // Fetch chat details from API
  const { data: chatData, isLoading, error } = useQuery({
    queryKey: ['chatDetails', userId, chatId],
    queryFn: () => getChatDetails(userId!, chatId!),
    enabled: !!userId && !!chatId && isOpen,
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes
  });

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
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E53E3E]"></div>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center h-32">
              <div className="text-red-500 text-center">
                <p className="text-sm">Error loading chat details</p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-row justify-between">
                <div className="flex gap-2">
                  <div>
                    <img 
                      className="w-20 h-20 rounded-full object-cover" 
                      src={chatData?.data?.store?.profile_image || images.sasha} 
                      alt="Store Profile"
                      onError={(e) => {
                        e.currentTarget.src = images.sasha;
                      }}
                    />
                  </div>
                  <div className="flex flex-col gap-1 items-center justify-center">
                    <span className="text-[20px]">
                      {chatData?.data?.store?.name || 'Store Name'}
                    </span>
                    <span className="text-[#00000080] text-[10px] ml-[-18px]">
                      Last seen: 2 min ago
                    </span>
                  </div>
                </div>
                <div className="mt-5">
                  <button className="px-5 py-2 cursor-pointer text-white bg-[#F29F9F] rounded-lg mr-2">
                    Join Chat
                  </button>
                  {/* <button className="px-3 py-2 cursor-pointer text-white bg-black rounded-lg">
                    Switch to Store
                  </button> */}
                </div>
              </div>
              
              {/* Order Items */}
              {chatData?.data?.order && (
                <div className="border border-[#E53E3E] bg-[#FFE5E5] rounded-2xl p-3 mt-3">
                  <div className="flex flex-col">
                    <div className="flex flex-row justify-between">
                      <span className="font-semibold">
                        Items in cart ({chatData.data.order.items?.length || 0})
                      </span>
                      <span className="text-[#E53E3E] font-semibold">
                        ₦{chatData.data.order.total_amount || '0.00'}
                      </span>
                    </div>
                    {chatData.data.order.items?.map((item: any, index: number) => (
                      <div key={index} className="flex flex-row mt-3">
                        <div>
                          <img 
                            className="rounded-l-lg w-16 h-16 object-cover" 
                            src={item.product_image || images.iphone} 
                            alt="Product"
                            onError={(e) => {
                              e.currentTarget.src = images.iphone;
                            }}
                          />
                        </div>
                        <div className="flex flex-col p-1 pr-3 pl-3 bg-[#F9F9F9] w-full rounded-r-lg justify-between">
                          <div className="text-[18px]">{item.product_name || 'Product Name'}</div>
                          <div className="flex flex-row justify-between">
                            <span className="text-[#E53E3E] font-semibold">
                              ₦{item.price || '0.00'}
                            </span>
                            <span>Qty: {item.quantity || 1}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Messages */}
              {chatData?.data?.messages && chatData.data.messages.length > 0 ? (
                chatData.data.messages.map((message: any, index: number) => (
                  <div key={index} className="flex flex-row justify-between">
                    {message.sender_type === 'buyer' ? (
                      <div className="bg-[#FFD8D8] flex flex-col px-4 py-3 w-70 mt-3 rounded-t-3xl rounded-bl-lg rounded-br-3xl">
                        <span className="text-black">{message.message}</span>
                        <span className="text-[#00000080] text-[12px] flex justify-end-safe mr-3">
                          {message.created_at}
                        </span>
                      </div>
                    ) : (
                      <div></div>
                    )}
                    {message.sender_type === 'store' ? (
                      <div className="bg-[#E53E3E] flex flex-col px-4 py-3 w-75 mt-3 rounded-t-3xl rounded-bl-3xl rounded-br-lg">
                        <span className="text-white">{message.message}</span>
                        <span className="text-[#FFFFFF80] text-[12px] flex justify-end-safe mr-4">
                          {message.created_at}
                        </span>
                      </div>
                    ) : (
                      <div></div>
                    )}
                  </div>
                ))
              ) : (
                <div className="flex justify-center items-center h-32 text-gray-500">
                  <p className="text-sm">No messages available</p>
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
