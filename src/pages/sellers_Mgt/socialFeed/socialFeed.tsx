import PageHeader from "../../../components/PageHeader";
import images from "../../../constants/images";
import SocialFeedModel from "../../../components/socialFeedModal";
import StatCard from "../../../components/StatCard";
import StatCardGrid from "../../../components/StatCardGrid";
import { useState, useEffect, useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAdminSocialFeed, getAdminSocialFeedStatistics } from "../../../utils/queries/users";

function useDebouncedValue<T>(value: T, delay = 450) {
  const [debounced, setDebounced] = useState<T>(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

type Post = {
  id: string;
  storeName: string;
  location: string;
  timeAgo: string;
  avatar: string;
  image: string;
  text: string;
  likes: number;
  comments: number;
  shares: number;
  media?: any[];
  recentComments?: any[];
  store?: any;
  user?: any;
};

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
              className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                index === currentIndex 
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

const SocialFeed = () => {
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [isStoreDropdownOpen, setIsStoreDropdownOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const storeDropdownRef = useRef<HTMLDivElement | null>(null);

  const debouncedSearch = useDebouncedValue(search, 450);

  // Helper function to construct proper image URL
  const getImageUrl = (profilePicture: string | null) => {
    if (!profilePicture) return images.sasha;
    return `https://colala.hmstech.xyz/storage/${profilePicture}`;
  };

  // Fetch social feed data
  const { data: socialFeedData, isLoading: isLoadingPosts, error: postsError } = useQuery({
    queryKey: ['adminSocialFeed', currentPage],
    queryFn: () => getAdminSocialFeed(currentPage),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch statistics
  const { data: statisticsData, isLoading: isLoadingStats } = useQuery({
    queryKey: ['adminSocialFeedStatistics'],
    queryFn: getAdminSocialFeedStatistics,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const handleShowDetails = (postId: number) => {
    setSelectedPostId(postId);
    setShowModal(true);
  };

  // Transform API data to component format
  const posts = useMemo(() => {
    if (!socialFeedData?.data?.posts) return [];

    return socialFeedData.data.posts.map((post: any) => ({
      id: post.id.toString(),
      storeName: post.store?.store_name || post.user?.full_name || "Unknown Store",
      location: post.store?.store_location || "Unknown Location",
      timeAgo: post.time_ago || post.formatted_date || "Unknown time",
      avatar: post.store?.profile_image || post.user?.profile_image || images.sasha,
      image: post.media?.[0]?.url || null,
      text: post.body || "",
      likes: post.likes_count || 0,
      comments: post.comments_count || 0,
      shares: post.shares_count || 0,
      media: post.media || [],
      recentComments: post.recent_comments || [],
      store: post.store,
      user: post.user,
    }));
  }, [socialFeedData]);

  // Unique store options for dropdown
  const storeOptions = useMemo(
    () => Array.from(new Set(posts.map((p) => p.storeName))),
    [posts]
  );

  // Close dropdown on outside click
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (
        isStoreDropdownOpen &&
        storeDropdownRef.current &&
        !storeDropdownRef.current.contains(e.target as Node)
      ) {
        setIsStoreDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [isStoreDropdownOpen]);

  // Filter posts by search + selected store
  const filteredPosts = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    return posts.filter((p) => {
      const matchesStore = selectedStore ? p.storeName === selectedStore : true;
      const matchesSearch = !q
        ? true
        : [p.storeName, p.location, p.text].some((f) =>
          f.toLowerCase().includes(q)
        );
      return matchesStore && matchesSearch;
    });
  }, [debouncedSearch, posts, selectedStore]);

  // Get all comments from posts for the comments section
  const allComments = useMemo(() => {
    const comments: any[] = [];
    posts.forEach(post => {
      if (post.recentComments && post.recentComments.length > 0) {
        post.recentComments.forEach((comment: any) => {
          comments.push({
            ...comment,
            storeName: post.storeName,
            postId: post.id,
          });
        });
      }
    });
    return comments.slice(0, 10); // Show only first 10 comments
  }, [posts]);

  // Statistics data
  const statistics = statisticsData?.data?.current_stats || {
    total_posts: 0,
    total_likes: 0,
    total_comments: 0,
    total_shares: 0,
  };

  // Pagination data
  const pagination = socialFeedData?.data?.pagination || {
    current_page: 1,
    last_page: 1,
    per_page: 20,
    total: 0,
  };

  const handleLoadMore = () => {
    if (currentPage < pagination.last_page) {
      setCurrentPage(prev => prev + 1);
    }
  };

  return (
    <>
      <div>
        <PageHeader title="Social Feed" />
        <div className="p-3 sm:p-4 md:p-5 flex flex-col lg:flex-row gap-4 sm:gap-5">
          <div className="flex flex-col flex-1">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-1.5 w-full sm:w-auto">
                <div className="flex flex-row items-center gap-3 sm:gap-5 border border-[#989898] rounded-lg px-3 sm:px-4 py-2.5 sm:py-3.5 bg-white cursor-pointer text-xs sm:text-sm">
                  <div>Today</div>
                  <div>
                    <img
                      className="w-3 h-3 mt-1"
                      src={images.dropdown}
                      alt=""
                    />
                  </div>
                </div>
                <div className="relative w-full sm:w-auto" ref={storeDropdownRef}>
                  <button
                    onClick={() => setIsStoreDropdownOpen((o) => !o)}
                    className="flex flex-row items-center justify-between gap-3 border border-[#989898] rounded-lg px-3 sm:px-4 py-2.5 sm:py-3.5 bg-white cursor-pointer w-full sm:w-48 sm:min-w-[12rem] text-xs sm:text-sm"
                  >
                    <div className="truncate text-left flex-1">
                      {selectedStore || "Store Name"}
                    </div>
                    <div className="flex-shrink-0">
                      <img
                        className={`w-3 h-3 mt-1 transition-transform ${isStoreDropdownOpen ? "rotate-180" : ""
                          }`}
                        src={images.dropdown}
                        alt=""
                      />
                    </div>
                  </button>

                  {isStoreDropdownOpen && (
                    <div
                      className="absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
                      style={{ minWidth: "10rem" }}
                    >
                      <ul className="py-2">
                        <li>
                          <button
                            onClick={() => {
                              setSelectedStore(null);
                              setIsStoreDropdownOpen(false);
                            }}
                            className="w-full text-left px-4 py-2.5 hover:bg-gray-50 truncate"
                          >
                            All Stores
                          </button>
                        </li>

                        {storeOptions.map((name) => (
                          <li key={name}>
                            <button
                              onClick={() => {
                                setSelectedStore(name);
                                setIsStoreDropdownOpen(false);
                              }}
                              className={`w-full text-left px-4 py-2.5 hover:bg-gray-50 truncate ${selectedStore === name ? "font-semibold" : ""
                                }`}
                              title={name} // Show full text on hover
                            >
                              {name}
                            </button>
                          </li>
                        ))}

                        <li>
                          <div className="my-1 h-px bg-gray-200" />
                        </li>
                        <li>
                          <button
                            onClick={() => {
                              setSelectedStore(null);
                              setIsStoreDropdownOpen(false);
                            }}
                            className="w-full text-left px-4 py-2.5 text-red-600 hover:bg-red-50 truncate"
                          >
                            Clear Filter
                          </button>
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              <div className="ml-0 sm:ml-8 w-full sm:w-auto">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-12 pr-6 py-2.5 sm:py-3.5 border border-[#00000080] rounded-lg text-sm sm:text-[15px] w-full sm:w-[250px] md:w-[300px] focus:outline-none bg-white shadow-[0_2px_6px_rgba(0,0,0,0.05)] placeholder-[#00000080]"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div
              className="flex flex-col w-full border-[#989898] border rounded-2xl mt-4 sm:mt-5"
              style={{ boxShadow: "0px 0px 2px 0px rgba(0, 0, 0, 0.25)" }}
            >
              <div className="rounded-t-2xl bg-[#F2F2F2] p-3 sm:p-4 text-lg sm:text-xl font-medium">
                Social Feed
              </div>
              <div className="flex flex-col bg-white rounded-b-2xl p-3 sm:p-4 md:p-5 gap-4 sm:gap-5">
                {isLoadingPosts ? (
                  <div className="text-center text-gray-500 py-10">
                    Loading posts...
                  </div>
                ) : filteredPosts.length === 0 ? (
                  <div className="text-center text-gray-500 py-10">
                    No posts match your search.
                  </div>
                ) : (
                  filteredPosts.map((post) => (
                    <div key={post.id} className="flex flex-col gap-5">
                      {/* Header row */}
                      <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0">
                        <div className="flex gap-2">
                          <div>
                            <img
                              className="w-12 h-12 sm:w-15 sm:h-15 rounded-full object-cover"
                              src={post.avatar}
                              alt=""
                              onError={(e) => {
                                e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMzAiIGZpbGw9IiNGM0Y0RjYiLz4KPHBhdGggZD0iTTMwIDI1QzMyLjc2MTQgMjUgMzUgMjcuMjM4NiAzNSAzMEMzNSAzMi43NjE0IDMyLjc2MTQgMzUgMzAgMzVDMjcuMjM4NiAzNSAyNSAzMi43NjE0IDI1IDMwQzI1IDI3LjIzODYgMjcuMjM4NiAyNSAzMCAyNVoiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTMwIDM1QzMyLjc2MTQgMzUgMzUgMzIuNzYxNCAzNSAzMEMzNSAyNy4yMzg2IDMyLjc2MTQgMjUgMzAgMjVDMjcuMjM4NiAyNSAyNSAyNy4yMzg2IDI1IDMwQzI1IDMyLjc2MTQgMjcuMjM4NiAzNSAzMCAzNVoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+';
                              }}
                            />
                          </div>
                          <div className="flex flex-col justify-center">
                            <div className="font-medium text-base sm:text-lg">
                              {post.storeName}
                            </div>
                            <div className="text-[#000000B2] text-sm sm:text-md">
                              {post.location} {post.timeAgo}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <button
                            className="bg-[#E53E3E] px-3 sm:px-4 py-2 sm:py-3 cursor-pointer rounded-xl text-white font-medium text-sm sm:text-base w-full sm:w-auto"
                            onClick={() => handleShowDetails(parseInt(post.id))}
                          >
                            View Post
                          </button>
                        </div>
                      </div>

                      {/* Media Display */}
                      {(post.media && post.media.length > 0) || post.image ? (
                        <div>
                          {post.media && post.media.length > 0 ? (
                            // Multiple images with slider
                            post.media.length === 1 ? (
                              // Single image from media array
                              <img
                                className="w-full rounded-lg"
                                src={post.media[0].url}
                                alt=""
                                onError={(e) => {
                                  e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDQwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMDAgMTAwTDIyMCAxMjBMMjAwIDE0MEwxODAgMTIwTDIwMCAxMDBaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPg==';
                                }}
                              />
                            ) : (
                              // Multiple images with slider
                              <MediaSlider media={post.media} />
                            )
                          ) : post.image ? (
                            // Fallback to single image
                            <img
                              className="w-full rounded-lg"
                              src={post.image}
                              alt=""
                              onError={(e) => {
                                e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDQwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMDAgMTAwTDIyMCAxMjBMMjAwIDE0MEwxODAgMTIwTDIwMCAxMDBaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPg==';
                              }}
                            />
                          ) : null}
                        </div>
                      ) : null}

                      {/* Caption */}
                      <div className="bg-[#F0F0F0] rounded-xl p-3 sm:p-4 md:p-5 text-base sm:text-lg md:text-xl font-normal">
                        {post.text}
                      </div>

                      {/* Stats */}
                      <div className="flex flex-row gap-3">
                        <div className="flex items-center gap-1">
                          <img
                            className="cursor-pointer"
                            src={images.heart}
                            alt=""
                          />
                          <div>{post.likes}</div>
                        </div>
                        <div className="flex items-center gap-1">
                          <img
                            className="cursor-pointer"
                            src={images.comment}
                            alt=""
                          />
                          <div>{post.comments}</div>
                        </div>
                        <div className="flex items-center gap-1">
                          <img
                            className="cursor-pointer"
                            src={images.share}
                            alt=""
                          />
                          <div>{post.shares}</div>
                        </div>
                      </div>

                      {/* Divider between posts */}
                      <div className="h-px bg-[#E5E5E5]" />
                    </div>
                  ))
                )}

                {/* Load More Button */}
                {currentPage < pagination.last_page && (
                  <div className="flex justify-center mt-6">
                    <button
                      onClick={handleLoadMore}
                      className="bg-[#E53E3E] text-white px-8 py-3 rounded-lg hover:bg-red-600 transition-colors font-medium"
                      disabled={isLoadingPosts}
                    >
                      {isLoadingPosts ? "Loading..." : "Load More Posts"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-col flex-1 gap-4 sm:gap-5">
            <div
              className="flex flex-col h-fit rounded-2xl border border-[#989898]"
              style={{ boxShadow: "0px 0px 2px 0px rgba(0, 0, 0, 0.25)" }}
            >
              <div className="bg-[#F2F2F2] text-lg sm:text-xl font-medium p-3 sm:p-4 rounded-t-2xl">
                Stats
              </div>
              <div className="flex bg-white p-3 sm:p-4 md:p-5 flex-col gap-4 sm:gap-5 rounded-b-2xl">
                <StatCardGrid columns={2}>
                  <StatCard
                    icon={images.feed1}
                    title="Total Posts"
                    value={isLoadingStats ? "Loading..." : statistics.total_posts}
                  />
                  <StatCard
                    icon={images.heart}
                    title="Total Likes"
                    value={isLoadingStats ? "Loading..." : statistics.total_likes}
                  />
                  <StatCard
                    icon={images.comment}
                    title="Total Comments"
                    value={isLoadingStats ? "Loading..." : statistics.total_comments}
                  />
                  <StatCard
                    icon={images.share}
                    title="Total Shares"
                    value={isLoadingStats ? "Loading..." : statistics.total_shares}
                  />
                </StatCardGrid>
              </div>
            </div>
            <div
              className="flex flex-col rounded-2xl border border-[#989898]"
              style={{ boxShadow: "0px 0px 2px 0px rgba(0, 0, 0, 0.25)" }}
            >
              <div className="bg-[#F2F2F2] text-lg sm:text-xl font-medium p-3 sm:p-4 rounded-t-2xl">
                Comments
              </div>
              <div className="bg-white p-3 sm:p-4 md:p-5 rounded-b-2xl flex flex-col gap-2 sm:gap-3">
                {allComments.length > 0 ? (
                  allComments.map((comment, index) => (
                    <div key={index} className="flex flex-row gap-2 border border-[#DDDDDD] rounded-xl p-2">
                      <div>
                        <img
                          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
                          src={getImageUrl(comment.profile_picture)}
                          alt={comment.user_name || "User"}
                          onError={(e) => {
                            e.currentTarget.src = images.sasha;
                          }}
                        />
                      </div>
                      <div className="flex flex-col justify-center flex-1 min-w-0">
                        <div className="font-medium text-sm sm:text-md break-words">
                          {comment.body || comment.comment || "No comment text"}{" "}
                          <span>
                            <button
                              className="text-[#E53E3E] font-bold cursor-pointer text-xs sm:text-sm"
                              onClick={() => handleShowDetails(comment.postId)}
                            >
                              View Comment
                            </button>
                          </span>
                        </div>
                        <div className="text-[#000000B2] text-[10px] sm:text-[12px]">
                          {comment.user_name || comment.storeName || "Unknown User"}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    No comments available
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <SocialFeedModel
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          postId={selectedPostId}
        />
      </div>
    </>
  );
};

export default SocialFeed;