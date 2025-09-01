import React, { useState } from "react";
import images from "../../../constants/images";
interface Reply {
  id: string;
  text: string;
  author: string;
  replyTo: string;
  timestamp: string;
}

interface SocialFeedModelProps {
  isOpen: boolean;
  onClose: () => void;
}

const SocialFeedModel: React.FC<SocialFeedModelProps> = ({
  isOpen,
  onClose,
}) => {
  // State to track which reply inputs are open
  const [openReplies, setOpenReplies] = useState<Set<string>>(new Set());
  const [replyTexts, setReplyTexts] = useState<{ [key: string]: string }>({});

  // State to store actual replies for each comment
  const [replies, setReplies] = useState<{ [commentId: string]: Reply[] }>({
    comment1: [
      {
        id: "reply1",
        text: "We do deliver nationwide.",
        author: "Sasha Stores",
        replyTo: "Adam Chris",
        timestamp: "1 min",
      },
    ],
    comment2: [],
    comment3: [],
  });

  if (!isOpen) return null;

  // Toggle reply input visibility
  const toggleReply = (commentId: string) => {
    setOpenReplies((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  // Handle reply text change
  const handleReplyTextChange = (commentId: string, text: string) => {
    setReplyTexts((prev) => ({
      ...prev,
      [commentId]: text,
    }));
  };

  // Handle reply submission
  const handleReplySubmit = (commentId: string) => {
    const replyText = replyTexts[commentId];
    if (!replyText || replyText.trim() === "") return;

    // Create new reply
    const newReply: Reply = {
      id: `reply_${Date.now()}`,
      text: replyText.trim(),
      author: "Sasha Stores",
      replyTo: "Adam Chris",
      timestamp: "now",
    };

    // Add reply to the comment
    setReplies((prev) => ({
      ...prev,
      [commentId]: [...(prev[commentId] || []), newReply],
    }));

    // Clear the reply text and close the reply input
    setReplyTexts((prev) => ({
      ...prev,
      [commentId]: "",
    }));
    setOpenReplies((prev) => {
      const newSet = new Set(prev);
      newSet.delete(commentId);
      return newSet;
    });
  };

  // Handle reply deletion
  const handleReplyDelete = (commentId: string, replyId: string) => {
    setReplies((prev) => ({
      ...prev,
      [commentId]: prev[commentId].filter((reply) => reply.id !== replyId),
    }));
  };

  return (
    <div className="fixed inset-0 z-100 bg-[#00000080] bg-opacity-50 flex justify-end">
      <div className="bg-white w-[500px] relative h-full overflow-y-auto">
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
              <div className="flex flex-col gap-2 items-center justify-center">
                <span className="text-[20px]">Sasha Stores</span>
                <span className="text-[#00000080] text-[10px]">
                  Lagos, Nigeria 20 min ago
                </span>
              </div>
            </div>
            <div className="mt-5">
              <button className="font-bold text-[#FF0000] text-lg cursor-pointer">
                Delete Post
              </button>
            </div>
          </div>
          <div className="mt-4">
            <img src={images.iphone14} alt="" />
          </div>
          <div className="w-full bg-[#F0F0F0] rounded-lg p-3 mt-4">
            Get this phone at a cheap price for a limited period of time, get
            the best product with us
          </div>
          <div className="flex flex-row gap-3 mt-4">
            <div className="flex items-center gap-1">
              <div>
                <img className="cursor-pointer" src={images.heart} alt="" />
              </div>
              <div>500</div>
            </div>
            <div className="flex items-center gap-1">
              <div>
                <img className="cursor-pointer" src={images.comment} alt="" />
              </div>
              <div>26</div>
            </div>
            <div className="flex items-center gap-1">
              <div>
                <img className="cursor-pointer" src={images.share} alt="" />
              </div>
              <div>26</div>
            </div>
          </div>
          <div className="flex flex-col mt-4 gap-4 mb-10">
            {/* Comment 1 */}
            <div className="flex flex-row gap-3">
              <div>
                <img className="w-15 h-15" src={images.adam} alt="" />
              </div>
              <div className="flex flex-col w-full">
                <div className="flex flex-row gap-1">
                  <span className="text-[#E53E3E] font-semibold text-md">
                    Adam Chris
                  </span>
                  <span className="text-[#00000080]">1 min</span>
                </div>
                <div>
                  <span className="text-[14px] font-semibold">
                    This product looks really nice, do you deliver nationwide?
                  </span>
                </div>
                <div className="flex flex-row mt-3 justify-between items-center">
                  <div className="flex gap-2">
                    <span
                      className="text-[#00000080] cursor-pointer"
                      onClick={() => toggleReply("comment1")}
                    >
                      Reply
                    </span>
                    <img
                      className="cursor-pointer"
                      src={images.comment}
                      alt=""
                    />
                    <span>{replies.comment1?.length || 0}</span>
                  </div>
                  <div className="text-[#FF0000] font-bold cursor-pointer">
                    Delete
                  </div>
                </div>

                {/* Reply Input */}
                {openReplies.has("comment1") && (
                  <div className="mt-3 flex flex-row gap-2 items-center">
                    <img className="w-8 h-8" src={images.sasha} alt="" />
                    <div className="flex-1 flex gap-2">
                      <input
                        type="text"
                        placeholder="Write a reply..."
                        value={replyTexts["comment1"] || ""}
                        onChange={(e) =>
                          handleReplyTextChange("comment1", e.target.value)
                        }
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            handleReplySubmit("comment1");
                          }
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#E53E3E]"
                      />
                      <button
                        onClick={() => handleReplySubmit("comment1")}
                        className="px-4 py-2 bg-[#E53E3E] text-white rounded-lg hover:bg-[#D32F2F] transition-colors"
                      >
                        Reply
                      </button>
                    </div>
                  </div>
                )}

                {/* Display Replies */}
                {replies.comment1?.map((reply) => (
                  <div key={reply.id} className="flex flex-row gap-3  mt-3">
                    <div>
                      <img className="w-10 h-10" src={images.sasha} alt="" />
                    </div>
                    <div className="flex flex-col w-full">
                      <div className="flex flex-row gap-1">
                        <span className="text-[#E53E3E] font-semibold text-sm">
                          {reply.author}
                        </span>
                        <span className="text-[#00000080] text-sm">
                          {reply.timestamp}
                        </span>
                      </div>
                      <div className="flex flex-row justify-between items-center w-full">
                        <div className="text-[14px] font-semibold">
                          <span className="text-[#FF0000]">
                            @{reply.replyTo}
                          </span>{" "}
                          {reply.text}
                        </div>
                        <div
                          className="text-[#FF0000] font-bold cursor-pointer"
                          onClick={() =>
                            handleReplyDelete("comment1", reply.id)
                          }
                        >
                          Delete
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Comment 2 */}
            <div className="flex flex-row gap-3">
              <div>
                <img className="w-15 h-15" src={images.adam} alt="" />
              </div>
              <div className="flex flex-col w-full">
                <div className="flex flex-row gap-1">
                  <span className="text-[#E53E3E] font-semibold text-md">
                    Adam Chris
                  </span>
                  <span className="text-[#00000080]">1 min</span>
                </div>
                <div>
                  <span className="text-[14px] font-semibold">
                    This product looks really nice, do you deliver nationwide?
                  </span>
                </div>
                <div className="flex flex-row mt-3 justify-between items-center">
                  <div className="flex gap-2">
                    <span
                      className="text-[#00000080] cursor-pointer"
                      onClick={() => toggleReply("comment2")}
                    >
                      Reply
                    </span>
                    <img
                      className="cursor-pointer"
                      src={images.comment}
                      alt=""
                    />
                    <span>{replies.comment2?.length || 0}</span>
                  </div>
                  <div className="text-[#FF0000] font-bold cursor-pointer">
                    Delete
                  </div>
                </div>

                {/* Reply Input */}
                {openReplies.has("comment2") && (
                  <div className="mt-3 flex flex-row gap-2 items-center">
                    <img className="w-8 h-8" src={images.sasha} alt="" />
                    <div className="flex-1 flex gap-2">
                      <input
                        type="text"
                        placeholder="Write a reply..."
                        value={replyTexts["comment2"] || ""}
                        onChange={(e) =>
                          handleReplyTextChange("comment2", e.target.value)
                        }
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            handleReplySubmit("comment2");
                          }
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#E53E3E]"
                      />
                      <button
                        onClick={() => handleReplySubmit("comment2")}
                        className="px-4 py-2 bg-[#E53E3E] text-white rounded-lg hover:bg-[#D32F2F] transition-colors"
                      >
                        Reply
                      </button>
                    </div>
                  </div>
                )}

                {/* Display Replies */}
                {replies.comment2?.map((reply) => (
                  <div key={reply.id} className="flex flex-row gap-3 mt-3">
                    <div>
                      <img className="w-10 h-10" src={images.sasha} alt="" />
                    </div>
                    <div className="flex flex-col w-full">
                      <div className="flex flex-row gap-1">
                        <span className="text-[#E53E3E] font-semibold text-sm">
                          {reply.author}
                        </span>
                        <span className="text-[#00000080] text-sm">
                          {reply.timestamp}
                        </span>
                      </div>
                      <div className="flex flex-row justify-between items-center w-full">
                        <div className="text-[14px] font-semibold">
                          <span className="text-[#FF0000]">
                            @{reply.replyTo}
                          </span>{" "}
                          {reply.text}
                        </div>
                        <div
                          className="text-[#FF0000] font-bold cursor-pointer"
                          onClick={() =>
                            handleReplyDelete("comment2", reply.id)
                          }
                        >
                          Delete
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Comment 3 */}
            <div className="flex flex-row gap-3">
              <div>
                <img className="w-15 h-15" src={images.adam} alt="" />
              </div>
              <div className="flex flex-col w-full">
                <div className="flex flex-row gap-1">
                  <span className="text-[#E53E3E] font-semibold text-md">
                    Adam Chris
                  </span>
                  <span className="text-[#00000080]">1 min</span>
                </div>
                <div>
                  <span className="text-[14px] font-semibold">
                    This product looks really nice, do you deliver nationwide?
                  </span>
                </div>
                <div className="flex flex-row mt-3 justify-between items-center">
                  <div className="flex gap-2">
                    <span
                      className="text-[#00000080] cursor-pointer"
                      onClick={() => toggleReply("comment3")}
                    >
                      Reply
                    </span>
                    <img
                      className="cursor-pointer"
                      src={images.comment}
                      alt=""
                    />
                    <span>{replies.comment3?.length || 0}</span>
                  </div>
                  <div className="text-[#FF0000] font-bold cursor-pointer">
                    Delete
                  </div>
                </div>

                {/* Reply Input */}
                {openReplies.has("comment3") && (
                  <div className="mt-3 flex flex-row gap-2 items-center">
                    <img className="w-8 h-8" src={images.sasha} alt="" />
                    <div className="flex-1 flex gap-2">
                      <input
                        type="text"
                        placeholder="Write a reply..."
                        value={replyTexts["comment3"] || ""}
                        onChange={(e) =>
                          handleReplyTextChange("comment3", e.target.value)
                        }
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            handleReplySubmit("comment3");
                          }
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#E53E3E]"
                      />
                      <button
                        onClick={() => handleReplySubmit("comment3")}
                        className="px-4 py-2 bg-[#E53E3E] text-white rounded-lg hover:bg-[#D32F2F] transition-colors"
                      >
                        Reply
                      </button>
                    </div>
                  </div>
                )}

                {/* Display Replies */}
                {replies.comment3?.map((reply) => (
                  <div key={reply.id} className="flex flex-row gap-3 mt-3">
                    <div>
                      <img className="w-10 h-10" src={images.sasha} alt="" />
                    </div>
                    <div className="flex flex-col w-full">
                      <div className="flex flex-row gap-1">
                        <span className="text-[#E53E3E] font-semibold text-sm">
                          {reply.author}
                        </span>
                        <span className="text-[#00000080] text-sm">
                          {reply.timestamp}
                        </span>
                      </div>
                      <div className="flex flex-row justify-between items-center w-full">
                        <div className="text-[14px] font-semibold">
                          <span className="text-[#FF0000]">
                            @{reply.replyTo}
                          </span>{" "}
                          {reply.text}
                        </div>
                        <div
                          className="text-[#FF0000] font-bold cursor-pointer"
                          onClick={() =>
                            handleReplyDelete("comment3", reply.id)
                          }
                        >
                          Delete
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default SocialFeedModel;
