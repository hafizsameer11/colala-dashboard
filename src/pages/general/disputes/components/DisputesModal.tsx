import React, { useState, useEffect, useCallback } from "react";
import images from "../../../../constants/images";
import WarningModal from "./WarningModal";

interface Dispute {
  id: string;
  storeName: string;
  userName: string;
  lastMessage: string;
  chatDate: string;
  wonBy: string;
  status: "pending" | "resolved" | "onhold";
}

interface DisputesModalProps {
  isOpen: boolean;
  onClose: () => void;
  disputeData?: Dispute | null;
}

const DisputesModal: React.FC<DisputesModalProps> = ({
  isOpen,
  onClose,
  disputeData,
}) => {
  // ✅ Hooks must always run in the same order
  const [hasJoinedChat, setHasJoinedChat] = useState(false);
  const [wonBy, setWonBy] = useState<"" | "customer" | "store">("");
  const [wonByDropdownOpen, setWonByDropdownOpen] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);

  const openWarning = useCallback(() => setShowWarningModal(true), []);
  const closeWarning = useCallback(() => setShowWarningModal(false), []);

  const safeCloseParent = useCallback(() => {
    if (hasJoinedChat && !wonBy) openWarning();
    else onClose();
  }, [hasJoinedChat, wonBy, onClose, openWarning]);

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
              <div className="rounded-full p-2 border border-[#CDCDCD]">
                <img
                  className="cursor-pointer"
                  src={images.shoppingcart}
                  alt=""
                />
              </div>
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
        <div className="pr-5 pl-5 mt-3">
          <div className="flex flex-row justify-between">
            <div className="flex gap-2">
              <div>
                <img className="w-14 h-14" src={images.sasha} alt="" />
              </div>
              <div className="flex flex-col gap-1 items-center justify-center">
                <span className="text-[16px] mr-9">
                  {disputeData?.userName || "Cynthia Grace"}
                </span>
                <span className="text-[#00000080] text-[14px] ml-[12px]">
                  Last seen: 2 min ago
                </span>
              </div>
            </div>

            <div className="mt-5">
              {!hasJoinedChat ? (
                <button
                  onClick={handleJoinChat}
                  className="px-5 py-3 cursor-pointer text-white bg-[#E53E3E] rounded-lg mr-2"
                >
                  Join Chat
                </button>
              ) : (
                <button
                  onClick={handleLeaveChat}
                  className="px-5 py-3 cursor-pointer text-white bg-[#E53E3E] rounded-lg mr-2"
                >
                  Leave Chat
                </button>
              )}
              <button className="px-3 py-3 cursor-pointer text-white bg-black rounded-lg">
                Switch to buyer
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
                    <span>Qty: 1</span>
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
                    <span>Qty: 1</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Messages Section */}
          {/* Original messages - always visible */}
          <div className="flex flex-row justify-between">
            <div></div>
            <div className="bg-[#E53E3E] flex flex-col px-4 py-3 w-75 mt-3 rounded-t-3xl rounded-bl-3xl rounded-br-lg">
              <span className="text-white">
                How will i get the product delivered
              </span>
              <span className="text-[#FFFFFF80] text-[12px] flex justify-end-safe mr-4">
                07:22AM
              </span>
            </div>
          </div>
          <div className="flex flex-row justify-between">
            <div className="bg-[#FFD8D8] flex flex-col px-4 py-3 w-70 mt-3 rounded-t-3xl rounded-bl-lg rounded-br-3xl">
              <span className="text-black">
                Thank you for purchasing from us
              </span>
              <span className="text-[#00000080] text-[12px] flex justify-end-safe mr-3">
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
              <span className="text-[#00000080] text-[12px] flex justify-end-safe mr-3">
                07:22AM
              </span>
            </div>
            <div></div>
          </div>
          <div className="flex flex-row justify-between">
            <div></div>
            <div className="bg-[#E53E3E] flex flex-col px-3 py-3 w-53 mt-3 rounded-t-3xl rounded-bl-3xl rounded-br-lg">
              <span className="text-white">Okay i will be expecting.</span>
              <span className="text-[#FFFFFF80] text-[12px] flex justify-end-safe mr-4">
                07:22AM
              </span>
            </div>
          </div>
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
        </div>
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
      {/* Warning Modal */}

      <WarningModal show={showWarningModal} onClose={closeWarning} />
    </div>
  );
};

export default DisputesModal;
