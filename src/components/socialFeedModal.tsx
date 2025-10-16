import React, { useState } from "react";
import images from "../constants/images";
import { useQuery } from "@tanstack/react-query";
import { getAdminSocialFeedDetails } from "../utils/queries/users";

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
  postId?: number | null;
}

const SocialFeedModel: React.FC<SocialFeedModelProps> = ({
  isOpen,
  onClose,
  postId,
}) => {
  // State to track which reply inputs are open
  const [openReplies, setOpenReplies] = useState<Set<string>>(new Set());
  const [replyTexts, setReplyTexts] = useState<{ [key: string]: string }>({});

  // Fetch post details
  const { data: postDetails, isLoading, error } = useQuery({
    queryKey: ['adminSocialFeedDetails', postId],
    queryFn: () => getAdminSocialFeedDetails(postId!),
    enabled: !!postId && isOpen,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // State to store actual replies for each comment
  const [replies, setReplies] = useState<{ [commentId: string]: Reply[] }>({});

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
          {isLoading ? (
            <div className="text-center py-10">
              <div className="text-gray-500">Loading post details...</div>
            </div>
          ) : error ? (
            <div className="text-center py-10">
              <div className="text-red-500">Error loading post details</div>
            </div>
          ) : postDetails?.data ? (
            <>
              <div className="flex flex-row justify-between">
                <div className="flex gap-2">
                  <div>
                    <img 
                      className="w-20 h-20 rounded-full object-cover" 
                      src={postDetails.data.user_info?.store_name ? 
                        (postDetails.data.user_info.store_name === "Awesome store" ? images.sasha : images.sasha) : 
                        images.sasha
                      } 
                      alt=""
                      onError={(e) => {
                        e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iNDAiIGN5PSI0MCIgcj0iNDAiIGZpbGw9IiNGM0Y0RjYiLz4KPHBhdGggZD0iTTQwIDMwQzQ0LjQxODMgMzAgNDggMzMuNTgxNyA0OCAzOEM0OCA0Mi40MTgzIDQ0LjQxODMgNDYgNDAgNDZTNDAgNDIuNDE4MyAzNiA0Mi40MTgzIDM2IDM4QzM2IDMzLjU4MTcgMzkuNTgxNyAzMCA0MCAzMFoiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTQwIDUwQzQ0LjQxODMgNTAgNDggNDcuNDE4MyA0OCA0M0M0OCAzOC41ODE3IDQ0LjQxODMgMzUgNDAgMzVDMzUuNTgxNyAzNSAzMiAzOC41ODE3IDMyIDQzQzMyIDQ3LjQxODMgMzUuNTgxNyA1MCA0MCA1MFoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+';
                      }}
                    />
                  </div>
                  <div className="flex flex-col gap-2 items-center justify-center">
                    <span className="text-[20px]">{postDetails.data.user_info?.name || "Unknown User"}</span>
                    <span className="text-[#00000080] text-[10px]">
                      {postDetails.data.user_info?.location || "Unknown Location"} {postDetails.data.post_info?.created_at ? 
                        new Date(postDetails.data.post_info.created_at).toLocaleDateString() : "Unknown time"}
                    </span>
                  </div>
                </div>
                <div className="mt-5">
                  <button className="font-bold text-[#FF0000] text-lg cursor-pointer">
                    Delete Post
                  </button>
                </div>
              </div>
              
              {/* Media */}
              {postDetails.data.media && postDetails.data.media.length > 0 && (
                <div className="mt-4">
                  <img 
                    className="w-full rounded-lg" 
                    src={postDetails.data.media[0].url} 
                    alt=""
                    onError={(e) => {
                      e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDQwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMDAgMTAwTDIyMCAxMjBMMjAwIDE0MEwxODAgMTIwTDIwMCAxMDBaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPg==';
                    }}
                  />
                </div>
              )}
              
              {/* Post content */}
              <div className="w-full bg-[#F0F0F0] rounded-lg p-3 mt-4">
                {postDetails.data.post_info?.body || "No content available"}
              </div>
              
              {/* Engagement stats */}
              <div className="flex flex-row gap-3 mt-4">
                <div className="flex items-center gap-1">
                  <div>
                    <img className="cursor-pointer" src={images.heart} alt="" />
                  </div>
                  <div>{postDetails.data.engagement?.likes_count || 0}</div>
                </div>
                <div className="flex items-center gap-1">
                  <div>
                    <img className="cursor-pointer" src={images.comment} alt="" />
                  </div>
                  <div>{postDetails.data.engagement?.comments_count || 0}</div>
                </div>
                <div className="flex items-center gap-1">
                  <div>
                    <img className="cursor-pointer" src={images.share} alt="" />
                  </div>
                  <div>{postDetails.data.engagement?.shares_count || 0}</div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-10">
              <div className="text-gray-500">No post data available</div>
            </div>
          )}
          
          {/* Comments Section */}
          {postDetails?.data?.recent_comments && postDetails.data.recent_comments.length > 0 && (
            <div className="flex flex-col mt-4 gap-4 mb-10">
              {postDetails.data.recent_comments.map((comment: any, index: number) => (
                <div key={comment.id || index} className="flex flex-row gap-3">
                  <div>
                    <img 
                      className="w-15 h-15 rounded-full object-cover" 
                      src={images.adam} 
                      alt=""
                      onError={(e) => {
                        e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMzAiIGZpbGw9IiNGM0Y0RjYiLz4KPHBhdGggZD0iTTMwIDI1QzMyLjc2MTQgMjUgMzUgMjcuMjM4NiAzNSAzMEMzNSAzMi43NjE0IDMyLjc2MTQgMzUgMzAgMzVDMjcuMjM4NiAzNSAyNSAzMi43NjE0IDI1IDMwQzI1IDI3LjIzODYgMjcuMjM4NiAyNSAzMCAyNVoiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTMwIDM1QzMyLjc2MTQgMzUgMzUgMzIuNzYxNCAzNSAzMEMzNSAyNy4yMzg2IDMyLjc2MTQgMjUgMzAgMjVDMjcuMjM4NiAyNSAyNSAyNy4yMzg2IDI1IDMwQzI1IDMyLjc2MTQgMjcuMjM4NiAzNSAzMCAzNVoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+';
                      }}
                    />
                  </div>
                  <div className="flex flex-col w-full">
                    <div className="flex flex-row gap-1">
                      <span className="text-[#E53E3E] font-semibold text-md">
                        {comment.user_name || "Unknown User"}
                      </span>
                      <span className="text-[#00000080]">{comment.formatted_date || "Unknown time"}</span>
                    </div>
                    <div>
                      <span className="text-[14px] font-semibold">
                        {comment.body || comment.comment || "No comment text"}
                      </span>
                    </div>
                    <div className="flex flex-row mt-3 justify-between items-center">
                      <div className="flex gap-2">
                        <span className="text-[#00000080] cursor-pointer">Reply</span>
                        <span className="text-[#00000080] cursor-pointer">Like</span>
                      </div>
                      <div className="text-[#FF0000] font-bold cursor-pointer">Delete</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
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
