import React, { useState } from "react";
import images from "../constants/images";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAdminSocialFeedDetails, deleteAdminSocialFeedPost, deleteAdminSocialFeedComment } from "../utils/queries/users";
import { useToast } from "../contexts/ToastContext";

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

interface MediaItem {
  id: number;
  type: string;
  url: string;
  position: number;
}

// Media Slider Component
const MediaSlider: React.FC<{ media: MediaItem[] }> = ({ media }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % media.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + media.length) % media.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div className="relative">
      {/* Main Image Display */}
      <div className="relative w-full rounded-lg overflow-hidden">
        <img
          className="w-full h-auto rounded-lg"
          src={media[currentIndex].url}
          alt={`Media ${currentIndex + 1}`}
          onError={(e) => {
            e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDQwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMDAgMTAwTDIyMCAxMjBMMjAwIDE0MEwxODAgMTIwTDIwMCAxMDBaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPg==';
          }}
        />

        {/* Navigation Arrows */}
        {media.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Image Counter */}
        {media.length > 1 && (
          <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
            {currentIndex + 1} / {media.length}
          </div>
        )}
      </div>

      {/* Thumbnail Navigation */}
      {media.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto">
          {media.map((item, index) => (
            <button
              key={item.id}
              onClick={() => goToSlide(index)}
              className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${index === currentIndex
                  ? 'border-red-500'
                  : 'border-gray-300 hover:border-gray-400'
                }`}
            >
              <img
                className="w-full h-full object-cover"
                src={item.url}
                alt={`Thumbnail ${index + 1}`}
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0zMiAzMkwyOCAzNkwyMCAyOEwyNCAyNEwzMiAzMloiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+';
                }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const SocialFeedModel: React.FC<SocialFeedModelProps> = ({
  isOpen,
  onClose,
  postId,
}) => {
  // State to track which reply inputs are open
  const [openReplies, setOpenReplies] = useState<Set<string>>(new Set());
  const [replyTexts, setReplyTexts] = useState<{ [key: string]: string }>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);

  // Helper function to construct proper image URL
  const getImageUrl = (profilePicture: string | null) => {
    if (!profilePicture) return images.adam;
    return `https://colala.hmstech.xyz/storage/${profilePicture}`;
  };

  // Toast and query client
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  // Delete post mutation
  const deletePostMutation = useMutation({
    mutationFn: deleteAdminSocialFeedPost,
    onSuccess: () => {
      showToast('Post deleted successfully', 'success');
      queryClient.invalidateQueries({ queryKey: ['adminSocialFeed'] });
      onClose();
    },
    onError: (error: any) => {
      console.error('Delete post error:', error);
      showToast(error?.response?.data?.message || 'Failed to delete post', 'error');
    },
  });

  // Delete comment mutation
  const deleteCommentMutation = useMutation({
    mutationFn: ({ postId, commentId }: { postId: number | string, commentId: number | string }) =>
      deleteAdminSocialFeedComment(postId, commentId),
    onSuccess: () => {
      showToast('Comment deleted successfully', 'success');
      queryClient.invalidateQueries({ queryKey: ['adminSocialFeedDetails', postId] });
      setCommentToDelete(null);
    },
    onError: (error: any) => {
      console.error('Delete comment error:', error);
      showToast(error?.response?.data?.message || 'Failed to delete comment', 'error');
      setCommentToDelete(null);
    },
  });

  // Fetch post details
  const { data: postDetails, isLoading, error } = useQuery({
    queryKey: ['adminSocialFeedDetails', postId],
    queryFn: () => getAdminSocialFeedDetails(postId!),
    enabled: !!postId && isOpen,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Debug logging
  console.log('SocialFeedModal Debug - Post details:', postDetails);
  console.log('SocialFeedModal Debug - Comments:', postDetails?.data?.recent_comments);
  console.log('SocialFeedModal Debug - Comment profile pictures:', postDetails?.data?.recent_comments?.map((c: any) => c.profile_picture));

  // Handler functions
  const handleDeletePost = () => {
    if (postId) {
      setShowDeleteConfirm(true);
    }
  };

  const confirmDeletePost = () => {
    if (postId) {
      deletePostMutation.mutate(postId);
      setShowDeleteConfirm(false);
    }
  };

  const cancelDeletePost = () => {
    setShowDeleteConfirm(false);
  };

  const handleDeleteComment = (commentId: string) => {
    setCommentToDelete(commentId);
  };

  const confirmDeleteComment = () => {
    if (postId && commentToDelete) {
      deleteCommentMutation.mutate({ postId, commentId: commentToDelete });
    }
  };

  const cancelDeleteComment = () => {
    setCommentToDelete(null);
  };

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
    const text = replyTexts[commentId];
    if (!text.trim()) return;

    const newReply: Reply = {
      id: Date.now().toString(),
      text: text.trim(),
      author: "Admin", // You can get this from auth context
      replyTo: "Original Commenter", // You can get this from the comment data
      timestamp: "Just now",
    };

    setReplies((prev) => ({
      ...prev,
      [commentId]: [...(prev[commentId] || []), newReply],
    }));

    // Clear the reply text
    setReplyTexts((prev) => ({
      ...prev,
      [commentId]: "",
    }));

    // Close the reply input
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
      [commentId]: (prev[commentId] || []).filter((reply) => reply.id !== replyId),
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
                      src={postDetails.data.user_info?.profile_picture || images.sasha}
                      alt={postDetails.data.user_info?.name || "User"}
                      onError={(e) => {
                        e.currentTarget.src = images.sasha;
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
                  <button
                    className="font-bold text-[#FF0000] text-lg cursor-pointer disabled:opacity-50"
                    onClick={handleDeletePost}
                    disabled={deletePostMutation.isPending}
                  >
                    {deletePostMutation.isPending ? 'Deleting...' : 'Delete Post'}
                  </button>
                </div>
              </div>

              {/* Media Slider */}
              {postDetails.data.media && postDetails.data.media.length > 0 && (
                <div className="mt-4">
                  {postDetails.data.media.length === 1 ? (
                    // Single image
                    <img
                      className="w-full rounded-lg"
                      src={postDetails.data.media[0].url}
                      alt=""
                      onError={(e) => {
                        e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDQwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMDAgMTAwTDIyMCAxMjBMMjAwIDE0MEwxODAgMTIwTDIwMCAxMDBaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPg==';
                      }}
                    />
                  ) : (
                    // Multiple images with slider
                    <MediaSlider media={postDetails.data.media} />
                  )}
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
                      src={getImageUrl(comment.profile_picture)}
                      alt={comment.user_name || "User"}
                      onError={(e) => {
                        e.currentTarget.src = images.adam;
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
                        <span
                          className="text-[#00000080] cursor-pointer"
                          onClick={() => toggleReply(comment.id?.toString() || index.toString())}
                        >
                          Reply
                        </span>
                        <span className="text-[#00000080] cursor-pointer">Like</span>
                      </div>
                      <div
                        className="text-[#FF0000] font-bold cursor-pointer disabled:opacity-50"
                        onClick={() => handleDeleteComment(comment.id?.toString() || index.toString())}
                      >
                        {deleteCommentMutation.isPending && commentToDelete === (comment.id?.toString() || index.toString()) ? 'Deleting...' : 'Delete'}
                      </div>
                    </div>

                    {/* Reply Input */}
                    {openReplies.has(comment.id?.toString() || index.toString()) && (
                      <div className="mt-3 flex flex-row gap-2 items-center">
                        <img className="w-8 h-8" src={images.sasha} alt="" />
                        <div className="flex-1 flex gap-2">
                          <input
                            type="text"
                            placeholder="Write a reply..."
                            value={replyTexts[comment.id?.toString() || index.toString()] || ""}
                            onChange={(e) =>
                              handleReplyTextChange(comment.id?.toString() || index.toString(), e.target.value)
                            }
                            onKeyPress={(e) => {
                              if (e.key === "Enter") {
                                handleReplySubmit(comment.id?.toString() || index.toString());
                              }
                            }}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#E53E3E]"
                          />
                          <button
                            onClick={() => handleReplySubmit(comment.id?.toString() || index.toString())}
                            className="px-4 py-2 bg-[#E53E3E] text-white rounded-lg hover:bg-[#D32F2F] transition-colors"
                          >
                            Reply
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Display Replies */}
                    {replies[comment.id?.toString() || index.toString()]?.map((reply) => (
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
                                handleReplyDelete(comment.id?.toString() || index.toString(), reply.id)
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
              ))}
            </div>
          )}

          {/* Show message if no comments */}
          {(!postDetails?.data?.recent_comments || postDetails.data.recent_comments.length === 0) && (
            <div className="text-center py-10 text-gray-500">
              No comments yet. Be the first to comment!
            </div>
          )}
        </div>
      </div>

      {/* Delete Post Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-bold mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this post? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                onClick={cancelDeletePost}
                disabled={deletePostMutation.isPending}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                onClick={confirmDeletePost}
                disabled={deletePostMutation.isPending}
              >
                {deletePostMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Comment Confirmation Dialog */}
      {commentToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-bold mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this comment? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                onClick={cancelDeleteComment}
                disabled={deleteCommentMutation.isPending}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                onClick={confirmDeleteComment}
                disabled={deleteCommentMutation.isPending}
              >
                {deleteCommentMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SocialFeedModel;