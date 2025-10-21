import React, { useState, useRef, useEffect } from "react";
import images from "../../../constants/images";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSellerSocialFeedDetails, deleteSellerSocialFeedPost, deleteSellerSocialFeedComment } from "../../../utils/queries/users";
import { useToast } from "../../../contexts/ToastContext";
interface Reply {
  id: string;
  text: string;
  author: string;
  replyTo: string;
  timestamp: string;
}

interface MediaItem {
  id: number;
  path: string;
  url: string;
  type: string;
}

interface Comment {
  id: number;
  body: string;
  text?: string;
  message?: string;
  created_at: string;
  user_name?: string;
  user_avatar?: string;
  user?: {
    id: number;
    name: string;
    profile_picture?: string;
  };
}

interface Like {
  id: number;
  user_name: string;
  user_avatar?: string;
  created_at: string;
}

interface SocialFeedModelProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
  postId?: string;
}

const SocialFeedModel: React.FC<SocialFeedModelProps> = ({
  isOpen,
  onClose,
  userId,
  postId,
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

  // Interactive popup states
  const [showLikesPopup, setShowLikesPopup] = useState(false);
  const [showSharesPopup, setShowSharesPopup] = useState(false);
  const [showCommentsPopup, setShowCommentsPopup] = useState(false);
  const [showMediaPopup, setShowMediaPopup] = useState(false);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // Refs for popup positioning
  const likesButtonRef = useRef<HTMLDivElement>(null);
  const sharesButtonRef = useRef<HTMLDivElement>(null);
  const commentsButtonRef = useRef<HTMLDivElement>(null);

  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const { data: postDetails, isLoading, error } = useQuery({
    queryKey: ['sellerSocialFeedDetails', userId, postId],
    queryFn: () => getSellerSocialFeedDetails(userId!, postId!),
    enabled: isOpen && !!userId && !!postId,
    staleTime: 2 * 60 * 1000,
  });

  const deletePostMutation = useMutation({
    mutationFn: () => deleteSellerSocialFeedPost(userId!, postId!),
    onSuccess: () => {
      showToast('Post deleted successfully', 'success');
      // Invalidate and refetch social feed list
      queryClient.invalidateQueries({ queryKey: ['sellerSocialFeed', userId] });
      queryClient.invalidateQueries({ queryKey: ['sellerSocialFeedDetails', userId, postId] });
      // Close the modal
      onClose();
    },
    onError: (error) => {
      console.error('Failed to delete post:', error);
      showToast('Failed to delete post', 'error');
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: ({ commentId }: { commentId: string }) => deleteSellerSocialFeedComment(userId!, postId!, commentId),
    onSuccess: () => {
      showToast('Comment deleted successfully', 'success');
      // Invalidate and refetch post details to update comments
      queryClient.invalidateQueries({ queryKey: ['sellerSocialFeedDetails', userId, postId] });
    },
    onError: (error) => {
      console.error('Failed to delete comment:', error);
      showToast('Failed to delete comment', 'error');
    },
  });

  const postInfo = postDetails?.data?.post_info;
  const authorInfo = postDetails?.data?.author_info;
  const media: MediaItem[] = postDetails?.data?.media || [];
  const likes: Like[] = postDetails?.data?.likes || [];
  const comments: Comment[] = postDetails?.data?.comments || [];

  const handleDeletePost = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    deletePostMutation.mutate();
    setShowDeleteConfirm(false);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const handleDeleteComment = (commentId: string) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      deleteCommentMutation.mutate({ commentId });
    }
  };

  // Interactive popup handlers
  const handleLikesClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowLikesPopup(!showLikesPopup);
  };

  const handleSharesClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowSharesPopup(!showSharesPopup);
  };

  const handleCommentsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowCommentsPopup(!showCommentsPopup);
  };

  const handleMediaClick = (index: number) => {
    setSelectedMediaIndex(index);
    setShowMediaPopup(true);
  };

  const handleTooltipShow = (text: string, e: React.MouseEvent) => {
    setTooltipPosition({ x: e.clientX, y: e.clientY });
    setShowTooltip(text);
  };

  const handleTooltipHide = () => {
    setShowTooltip(null);
  };

  // Close popups when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showLikesPopup && !likesButtonRef.current?.contains(event.target as Node)) {
        setShowLikesPopup(false);
      }
      if (showSharesPopup && !sharesButtonRef.current?.contains(event.target as Node)) {
        setShowSharesPopup(false);
      }
      if (showCommentsPopup && !commentsButtonRef.current?.contains(event.target as Node)) {
        setShowCommentsPopup(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showLikesPopup, showSharesPopup, showCommentsPopup]);

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
            <h2 className="text-lg font-bold">Post Details</h2>
            <div className="flex flex-row items-center gap-3">
              <button
                onClick={handleDeletePost}
                disabled={deletePostMutation.isPending}
                className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                onMouseEnter={(e) => handleTooltipShow('Delete this post permanently', e)}
                onMouseLeave={handleTooltipHide}
              >
                {deletePostMutation.isPending ? 'Deleting...' : 'Delete Post'}
              </button>
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
            <div className="flex justify-center items-center h-64 text-red-500">Failed to load post details</div>
          ) : (
          <div className="flex flex-row justify-between">
            <div className="flex gap-2">
              <div>
                <img className="w-20 h-20 rounded-full object-cover" src={authorInfo?.profile_picture || images.sasha} alt="" />
              </div>
              <div className="flex flex-col gap-2 items-center justify-center">
                <span className="text-[20px]">{authorInfo?.name || 'N/A'}</span>
                <span className="text-[#00000080] text-[10px]">{postInfo?.created_at || 'N/A'}</span>
              </div>
            </div>
            <div className="mt-5">
              <button 
                onClick={handleDeletePost}
                disabled={deletePostMutation.isPending}
                className={`font-bold text-[#FF0000] text-lg cursor-pointer ${
                  deletePostMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {deletePostMutation.isPending ? 'Deleting...' : 'Delete Post'}
              </button>
            </div>
          </div>
          )}
          <div className="mt-4">
            {media.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {media.map((m: MediaItem, index: number) => (
                  <div 
                    key={index} 
                    className="cursor-pointer hover:scale-105 transition-transform duration-200 border-2 border-transparent hover:border-blue-300 rounded-lg overflow-hidden"
                    onClick={() => handleMediaClick(index)}
                    onMouseEnter={(e) => handleTooltipShow('Click to view full size', e)}
                    onMouseLeave={handleTooltipHide}
                  >
                    <img 
                      className="w-full h-32 object-cover" 
                      src={m.url} 
                      alt={`Media ${index + 1}`} 
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="w-full h-40 bg-gray-100 rounded flex items-center justify-center text-gray-500">No media</div>
            )}
          </div>
          <div className="w-full bg-[#F0F0F0] rounded-lg p-3 mt-4">
            {postInfo?.body || 'N/A'}
          </div>
          <div className="flex flex-row gap-3 mt-4">
            <div 
              ref={likesButtonRef}
              className="flex items-center gap-1 cursor-pointer hover:bg-gray-100 p-2 rounded-lg transition-colors duration-200"
              onClick={handleLikesClick}
              onMouseEnter={(e) => handleTooltipShow(`View ${postInfo?.likes_count ?? 0} likes`, e)}
              onMouseLeave={handleTooltipHide}
            >
              <div>
                <img className="cursor-pointer" src={images.heart} alt="" />
              </div>
              <div>{postInfo?.likes_count ?? 0}</div>
            </div>
            <div 
              ref={commentsButtonRef}
              className="flex items-center gap-1 cursor-pointer hover:bg-gray-100 p-2 rounded-lg transition-colors duration-200"
              onClick={handleCommentsClick}
              onMouseEnter={(e) => handleTooltipShow(`View ${postInfo?.comments_count ?? 0} comments`, e)}
              onMouseLeave={handleTooltipHide}
            >
              <div>
                <img className="cursor-pointer" src={images.comment} alt="" />
              </div>
              <div>{postInfo?.comments_count ?? 0}</div>
            </div>
            <div 
              ref={sharesButtonRef}
              className="flex items-center gap-1 cursor-pointer hover:bg-gray-100 p-2 rounded-lg transition-colors duration-200"
              onClick={handleSharesClick}
              onMouseEnter={(e) => handleTooltipShow(`View ${postInfo?.shares_count ?? 0} shares`, e)}
              onMouseLeave={handleTooltipHide}
            >
              <div>
                <img className="cursor-pointer" src={images.share} alt="" />
              </div>
              <div>{postInfo?.shares_count ?? 0}</div>
            </div>
          </div>
          <div className="flex flex-col mt-4 gap-4 mb-10">
            {comments.length === 0 ? (
              <div className="text-center text-gray-500">No comments yet</div>
            ) : (
              comments.map((c: Comment) => {
                const commenterName = c.user?.name || c.user_name || 'Unknown';
                const commenterAvatar = c.user?.profile_picture || c.user_avatar || images.adam;
                const commentText = c.body || c.text || c.message || '';
                const createdAt = c.created_at || '';
                const commentId = String(c.id);
                return (
                  <div key={commentId} className="flex flex-row gap-3">
                    <div>
                      <img className="w-15 h-15 rounded-full object-cover" src={commenterAvatar} alt="" />
                    </div>
                    <div className="flex flex-col w-full">
                      <div className="flex flex-row gap-1 items-center">
                        <span className="text-[#E53E3E] font-semibold text-md">{commenterName}</span>
                        <span className="text-[#00000080] text-sm">{createdAt}</span>
                      </div>
                      <div>
                        <span className="text-[14px] font-semibold">{commentText}</span>
                      </div>
                      <div className="flex flex-row mt-3 justify-between items-center">
                        <div className="flex gap-2 items-center">
                          <span
                            className="text-[#00000080] cursor-pointer"
                            onClick={() => toggleReply(commentId)}
                          >
                            Reply
                          </span>
                          <img className="cursor-pointer" src={images.comment} alt="" />
                          <span>0</span>
                        </div>
                        <div className="text-[#FF0000] font-bold cursor-pointer">Delete</div>
                      </div>

                      {openReplies.has(commentId) && (
                        <div className="mt-3 flex flex-row gap-2 items-center">
                          <img className="w-8 h-8 rounded-full" src={authorInfo?.profile_picture || images.sasha} alt="" />
                          <div className="flex-1 flex gap-2">
                            <input
                              type="text"
                              placeholder="Write a reply..."
                              value={replyTexts[commentId] || ""}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                const target = e.target;
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                handleReplyTextChange(commentId, (target as any).value);
                              }}
                              onKeyPress={(e) => {
                                if (e.key === "Enter") {
                                  handleReplySubmit(commentId);
                                }
                              }}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#E53E3E]"
                            />
                            <button onClick={() => handleReplySubmit(commentId)} className="px-4 py-2 bg-[#E53E3E] text-white rounded-lg hover:bg-[#D32F2F] transition-colors">Reply</button>
                          </div>
                        </div>
                      )}

                      {/* Display local replies */}
                      {replies[commentId]?.map((reply) => (
                        <div key={reply.id} className="flex flex-row gap-3 mt-3">
                          <div>
                            <img className="w-10 h-10 rounded-full object-cover" src={images.sasha} alt="" />
                          </div>
                          <div className="flex flex-col w-full">
                            <div className="flex flex-row gap-1 items-center">
                              <span className="text-[#E53E3E] font-semibold text-sm">{reply.author}</span>
                              <span className="text-[#00000080] text-sm">{reply.timestamp}</span>
                            </div>
                            <div className="flex flex-row justify-between items-center w-full">
                              <div className="text-[14px] font-semibold">
                                <span className="text-[#FF0000]">@{reply.replyTo}</span> {reply.text}
                              </div>
                              <div 
                                className="text-[#FF0000] font-bold cursor-pointer"
                                onClick={() => handleReplyDelete(commentId, reply.id)}
                              >
                                Delete
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Interactive Popups */}
      
      {/* Delete Confirmation Popup */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                <img src={images.error} alt="Warning" className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Post</h3>
                <p className="text-sm text-gray-500">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this post? This will permanently remove the post and all its data.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deletePostMutation.isPending}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors"
              >
                {deletePostMutation.isPending ? 'Deleting...' : 'Delete Post'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Likes Popup */}
      {showLikesPopup && (
        <div className="absolute top-16 left-4 bg-white border border-gray-200 rounded-lg shadow-lg z-40 max-w-xs">
          <div className="p-3 border-b border-gray-100">
            <h4 className="font-semibold text-gray-900">Likes ({likes.length})</h4>
          </div>
          <div className="max-h-60 overflow-y-auto">
            {likes.length === 0 ? (
              <div className="p-3 text-gray-500 text-sm">No likes yet</div>
            ) : (
              likes.map((like: Like) => (
                <div key={like.id} className="flex items-center p-3 hover:bg-gray-50">
                  <img 
                    src={like.user_avatar || images.adam} 
                    alt={like.user_name}
                    className="w-8 h-8 rounded-full mr-3"
                  />
                  <div>
                    <div className="font-medium text-sm">{like.user_name}</div>
                    <div className="text-xs text-gray-500">{like.created_at}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Shares Popup */}
      {showSharesPopup && (
        <div className="absolute top-16 left-32 bg-white border border-gray-200 rounded-lg shadow-lg z-40 max-w-xs">
          <div className="p-3 border-b border-gray-100">
            <h4 className="font-semibold text-gray-900">Shares ({postInfo?.shares_count ?? 0})</h4>
          </div>
          <div className="max-h-60 overflow-y-auto">
            <div className="p-3 text-gray-500 text-sm">Share details not available</div>
          </div>
        </div>
      )}

      {/* Comments Popup */}
      {showCommentsPopup && (
        <div className="absolute top-16 left-60 bg-white border border-gray-200 rounded-lg shadow-lg z-40 max-w-xs">
          <div className="p-3 border-b border-gray-100">
            <h4 className="font-semibold text-gray-900">Comments ({comments.length})</h4>
          </div>
          <div className="max-h-60 overflow-y-auto">
            {comments.length === 0 ? (
              <div className="p-3 text-gray-500 text-sm">No comments yet</div>
            ) : (
              comments.map((comment: Comment) => (
                <div key={comment.id} className="p-3 hover:bg-gray-50 border-b border-gray-100">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start flex-1">
                      <img 
                        src={comment.user?.profile_picture || images.adam} 
                        alt={comment.user?.name}
                        className="w-6 h-6 rounded-full mr-2 mt-1"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-sm">{comment.user?.name}</div>
                        <div className="text-sm text-gray-700 mt-1">{comment.body}</div>
                        <div className="text-xs text-gray-500 mt-1">{comment.created_at}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteComment(String(comment.id))}
                      disabled={deleteCommentMutation.isPending}
                      className={`ml-2 text-red-500 hover:text-red-700 text-sm font-medium ${
                        deleteCommentMutation.isPending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                      }`}
                    >
                      {deleteCommentMutation.isPending ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Media Viewer Popup */}
      {showMediaPopup && media.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center">
          <div className="relative max-w-4xl max-h-[90vh] mx-4">
            <button
              onClick={() => setShowMediaPopup(false)}
              className="absolute top-4 right-4 z-10 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-2 transition-colors"
            >
              <img src={images.close} alt="Close" className="w-6 h-6" />
            </button>
            <img 
              src={media[selectedMediaIndex]?.url} 
              alt={`Media ${selectedMediaIndex + 1}`}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            {media.length > 1 && (
              <div className="flex justify-center mt-4 gap-2">
                {media.map((_: MediaItem, index: number) => (
                  <button
                    key={index}
                    onClick={() => setSelectedMediaIndex(index)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      index === selectedMediaIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tooltip */}
      {showTooltip && (
        <div 
          className="fixed z-50 bg-gray-900 text-white text-sm px-2 py-1 rounded shadow-lg pointer-events-none"
          style={{
            left: tooltipPosition.x + 10,
            top: tooltipPosition.y - 30,
          }}
        >
          {showTooltip}
        </div>
      )}
    </div>
  );
};
export default SocialFeedModel;
