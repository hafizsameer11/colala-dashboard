import React from "react";
import images from "../../../constants/images";

interface SupportModelProps {
  isOpen: boolean;
  onClose: () => void;
}

const SupportModel: React.FC<SupportModelProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 bg-[#00000080] bg-opacity-50 flex justify-end">
      <div className="bg-white w-[530px] relative h-full overflow-y-auto">
        {/* Header */}
        <div className="border-b border-[#787878] px-3 py-3 sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Support</h2>
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
                <img className="w-14 h-14" src={images.sasha} alt="" />
              </div>
              <div className="flex flex-col gap-1 items-center justify-center">
                <span className="text-lg font-semibold">Cynthia Grace</span>
                <span className="text-[#00000080] text-[10px] mr-[10px]">
                  Last seen: 2 min ago
                </span>
              </div>
            </div>
            <div className="mt-5">
              <button className="px-3 py-2 cursor-pointer text-white bg-[#E53E3E] rounded-lg mr-2">
                Join Chat
              </button>
              <button className="px-3 py-2 cursor-pointer text-white bg-black rounded-lg">
                mark as resolved
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
              <span className="text-white">Okay i will be expecting.</span>

              <span className="text-[#FFFFFF80] text-[12px] flex justify-end-safe mr-4 ">
                07:22AM
              </span>
            </div>
          </div>
        </div>

        {/* Admin Join Message */}
        <div className="px-4 pb-2">
          <div className="bg-[#FF00001A] border border-[#FF0000]  rounded-2xl px-4 py-3 mx-4">
            <span className="text-[#FF0000] text-[12px] font-medium text-center block">
              You have joined this chat as an admin
            </span>
          </div>
        </div>

        {/* Message Input */}
        <div className="sticky bottom-0 bg-white  p-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Type a message"
              className="w-full pl-12 pr-16 py-3 border border-[#CDCDCD] rounded-2xl text-[14px]  bg-[#FFFFFF]"
            />
            {/* Attachment Icon */}
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
              <img src={images.link} alt="Attachment" />
            </div>
            {/* Send Button */}
            <button className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 hover:bg-gray-100 rounded-full">
              <img src={images.share2} alt="Send" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default SupportModel;
