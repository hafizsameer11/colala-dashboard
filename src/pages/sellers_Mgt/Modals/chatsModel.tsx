import images from "../../../constants/images";

interface ChatsModelProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChatsModel: React.FC<ChatsModelProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

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
          <div className="flex flex-row justify-between">
            <div className="flex gap-2">
              <div>
                <img className="w-20 h-20" src={images.sasha} alt="" />
              </div>
              <div className="flex flex-col gap-1 items-center justify-center">
                <span className="text-[20px]">Sasha Stores</span>
                <span className="text-[#00000080] text-[10px] ml-[-18px]">
                  Last seen: 2 min ago
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
          <div className="border border-[#E53E3E] bg-[#FFE5E5] rounded-2xl p-3 mt-3">
            <div className="flex flex-col">
              <div className="flex flex-row justify-between">
                <span className="font-semibold">Items in cart (2)</span>
                <span className="text-[#E53E3E] font-semibold">N5,000,000</span>
              </div>
              <div className="flex flex-row mt-3">
                <div>
                  <img className="rounded-l-lg" src={images.iphone} alt="" />
                </div>
                <div className="flex flex-col p-1 pr-3 pl-3 bg-[#F9F9F9] w-full rounded-r-lg justify-between">
                  <div className="text-[18px]">Iphone 16 pro max - Black</div>
                  <div className="flex flex-row justify-between">
                    <span className="text-[#E53E3E] font-semibold">
                      N2,500,000
                    </span>
                    <span>Qty :1</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-row mt-3">
                <div>
                  <img className="rounded-l-lg" src={images.iphone} alt="" />
                </div>
                <div className="flex flex-col p-1 pr-3 pl-3 bg-[#F9F9F9] w-full rounded-r-lg justify-between">
                  <div className="text-[18px]">Iphone 16 pro max - Black</div>
                  <div className="flex flex-row justify-between">
                    <span className="text-[#E53E3E] font-semibold">
                      N2,500,000
                    </span>
                    <span>Qty :1</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-row justify-between">
            <div></div>
            <div className="bg-[#E53E3E] flex flex-col px-4 py-3 w-75 mt-3 rounded-t-3xl rounded-bl-3xl rounded-br-lg">
              <span className="text-white">
                How will i get the product delivered
              </span>

              <span className="text-[#FFFFFF80] text-[12px] flex justify-end-safe mr-4 ">
                07:22AM
              </span>
            </div>
          </div>
          <div className="flex flex-row justify-between">
            <div className="bg-[#FFD8D8] flex flex-col px-4 py-3 w-70 mt-3 rounded-t-3xl rounded-bl-lg rounded-br-3xl">
              <span className="text-black">
                Thank you for purchasing from us
              </span>

              <span className="text-[#00000080] text-[12px] flex justify-end-safe mr-3 ">
                07:22AM
              </span>
            </div>
            <div></div>
          </div>
          <div className="flex flex-row justify-between">
            <div className="bg-[#FFD8D8] flex flex-col px-4 py-3 w-80 mt-2 rounded-tl-lg rounded-tr-3xl rounded-b-3xl">
              <span className="text-black">
                I will arrange a dispatch rider soon and i will contact you
              </span>

              <span className="text-[#00000080] text-[12px] flex justify-end-safe mr-3 ">
                07:22AM
              </span>
            </div>
            <div></div>
          </div>
           <div className="flex flex-row justify-between">
            <div></div>
            <div className="bg-[#E53E3E] flex flex-col px-3 py-3 w-53 mt-3 rounded-t-3xl rounded-bl-3xl rounded-br-lg mb-10">
              <span className="text-white">
                Okay i will be expecting.
              </span>

              <span className="text-[#FFFFFF80] text-[12px] flex justify-end-safe mr-4 ">
                07:22AM
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ChatsModel;
