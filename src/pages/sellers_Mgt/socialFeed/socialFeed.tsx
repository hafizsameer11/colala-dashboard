import PageHeader from "../../../components/PageHeader";
import images from "../../../constants/images";
import SocialFeedModel from "../../../components/socialFeedModal";
import { useState, useEffect, useMemo, useRef } from "react";

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
};

const SocialFeed = () => {
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [isStoreDropdownOpen, setIsStoreDropdownOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState<string | null>(null);
  const storeDropdownRef = useRef<HTMLDivElement | null>(null);

  const debouncedSearch = useDebouncedValue(search, 450);

  const handleShowDetails = () => setShowModal(true);

  // Seed posts
  const posts = useMemo<Post[]>(
    () => [
      {
        id: "1",
        storeName: "Sasha Stores",
        location: "Lagos, Nigeria",
        timeAgo: "20 min ago",
        avatar: images.sasha,
        image: images.apple,
        text: "Get this phone at a cheap price for a limited period of time, get the best product with us",
        likes: 500,
        comments: 26,
        shares: 26,
      },
      {
        id: "2",
        storeName: "Alex Stores",
        location: "Abuja, Nigeria",
        timeAgo: "1 hr ago",
        avatar: images.sasha,
        image: images.apple,
        text: "Same-day deliveries across the city. Limited offer, book now!",
        likes: 128,
        comments: 12,
        shares: 9,
      },
      {
        id: "3",
        storeName: "Don Stores",
        location: "Port Harcourt, Nigeria",
        timeAgo: "Yesterday",
        avatar: images.sasha,
        image: images.apple,
        text: "Weekend mega sale — up to 40% off on selected items.",
        likes: 980,
        comments: 73,
        shares: 44,
      },
    ],
    []
  );

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

  return (
    <>
      <div>
        <PageHeader title="Social Feed" />
        <div className="p-5 flex flex-row gap-5">
          <div className="flex flex-col">
            <div className="flex flex-row justify-between items-center">
              <div className="flex flex-row gap-1.5">
                <div className="flex flex-row items-center gap-5 border border-[#989898] rounded-lg px-4 py-3.5 bg-white cursor-pointer">
                  <div>Today</div>
                  <div>
                    <img
                      className="w-3 h-3 mt-1"
                      src={images.dropdown}
                      alt=""
                    />
                  </div>
                </div>
                <div className="relative" ref={storeDropdownRef}>
                  <button
                    onClick={() => setIsStoreDropdownOpen((o) => !o)}
                    className="flex flex-row items-center justify-between gap-3 border border-[#989898] rounded-lg px-4 py-3.5 bg-white cursor-pointer w-48 min-w-[12rem]"
                  >
                    <div className="truncate text-left flex-1">
                      {selectedStore || "Store Name"}
                    </div>
                    <div className="flex-shrink-0">
                      <img
                        className={`w-3 h-3 mt-1 transition-transform ${
                          isStoreDropdownOpen ? "rotate-180" : ""
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
                              className={`w-full text-left px-4 py-2.5 hover:bg-gray-50 truncate ${
                                selectedStore === name ? "font-semibold" : ""
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

              <div className="ml-8">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-12 pr-6 py-3.5 border border-[#00000080] rounded-lg text-[15px] w-[300px] focus:outline-none bg-white shadow-[0_2px_6px_rgba(0,0,0,0.05)] placeholder-[#00000080]"
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
              className="flex flex-col w-full border-[#989898] border rounded-2xl mt-5"
              style={{ boxShadow: "0px 0px 2px 0px rgba(0, 0, 0, 0.25)" }}
            >
              <div className="rounded-t-2xl bg-[#F2F2F2] p-4 text-xl font-medium">
                Social Feed
              </div>
              <div className="flex flex-col bg-white rounded-b-2xl p-5 gap-5">
                {filteredPosts.length === 0 ? (
                  <div className="text-center text-gray-500 py-10">
                    No posts match your search.
                  </div>
                ) : (
                  filteredPosts.map((post) => (
                    <div key={post.id} className="flex flex-col gap-5">
                      {/* Header row */}
                      <div className="flex flex-row justify-between">
                        <div className="flex gap-2">
                          <div>
                            <img
                              className="w-15 h-15"
                              src={post.avatar}
                              alt=""
                            />
                          </div>
                          <div className="flex flex-col justify-center">
                            <div className="font-medium text-lg ">
                              {post.storeName}
                            </div>
                            <div className="text-[#000000B2] text-md">
                              {post.location} {post.timeAgo}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <button
                            className="bg-[#E53E3E] px-4 py-3 cursor-pointer rounded-xl text-white font-medium "
                            onClick={handleShowDetails}
                          >
                            View Post
                          </button>
                        </div>
                      </div>

                      {/* Image */}
                      <div>
                        <img className="w-full" src={post.image} alt="" />
                      </div>

                      {/* Caption */}
                      <div className="bg-[#F0F0F0] rounded-xl p-5 text-xl font-normal">
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

                {/* Your extra static sections below remain unchanged (if you still want them) */}
                {/* <div>
                  <img className="w-full" src={images.apple} alt="" />
                </div>
                <div className="bg-[#F0F0F0] rounded-xl p-5 text-xl font-normal">
                  Get this phone at a cheap price for a limited period of time,
                  get the best pro duct with us
                </div>
                <div className="flex flex-row gap-3">
                  <div className="flex items-center gap-1">
                    <div>
                      <img
                        className="cursor-pointer"
                        src={images.heart}
                        alt=""
                      />
                    </div>
                    <div>500</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <div>
                      <img
                        className="cursor-pointer"
                        src={images.comment}
                        alt=""
                      />
                    </div>
                    <div>26</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <div>
                      <img
                        className="cursor-pointer"
                        src={images.share}
                        alt=""
                      />
                    </div>
                    <div>26</div>
                  </div>
                </div> */}
                {/* ... (rest of your static blocks) */}
              </div>
            </div>
          </div>
          <div className="flex flex-col w-170 gap-5">
            <div
              className="flex flex-col h-fit rounded-2xl border border-[#989898]"
              style={{ boxShadow: "0px 0px 2px 0px rgba(0, 0, 0, 0.25)" }}
            >
              <div className="bg-[#F2F2F2] text-xl font-medium p-4 rounded-t-2xl">
                Stats
              </div>
              <div className="flex bg-white p-5 flex-col gap-5 rounded-b-2xl">
                <div className="flex flex-row gap-5">
                  <div
                    className="flex flex-row rounded-2xl"
                    style={{ boxShadow: "0px 0px 2px 0px rgba(0, 0, 0, 0.25)" }}
                  >
                    <div className="bg-[#E53E3E] flex justify-center items-center p-5 rounded-l-2xl">
                      <img src={images.feed1} alt="" />
                    </div>
                    <div className="rounded-r-2xl bg-[#FFF1F1] flex flex-col p-4 pr-8 justify-between">
                      <div className="text-xl font-semibold">Total Posts</div>
                      <div className="text-xl font-semibold">200</div>
                    </div>
                  </div>
                  <div
                    className="flex flex-row rounded-2xl"
                    style={{ boxShadow: "0px 0px 2px 0px rgba(0, 0, 0, 0.25)" }}
                  >
                    <div className="bg-[#E53E3E] flex justify-center items-center p-5 rounded-l-2xl">
                      <img src={images.feed1} alt="" />
                    </div>
                    <div className="rounded-r-2xl bg-[#FFF1F1] flex flex-col p-4 pr-8 justify-between">
                      <div className="text-xl font-semibold">Total Posts</div>
                      <div className="text-xl font-semibold">200</div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-row gap-5">
                  <div
                    className="flex flex-row rounded-2xl"
                    style={{ boxShadow: "0px 0px 2px 0px rgba(0, 0, 0, 0.25)" }}
                  >
                    <div className="bg-[#E53E3E] flex justify-center items-center p-5 rounded-l-2xl">
                      <img src={images.feed1} alt="" />
                    </div>
                    <div className="rounded-r-2xl bg-[#FFF1F1] flex flex-col p-4 pr-8 justify-between">
                      <div className="text-xl font-semibold">Total Posts</div>
                      <div className="text-xl font-semibold">200</div>
                    </div>
                  </div>
                  <div
                    className="flex flex-row rounded-2xl"
                    style={{ boxShadow: "0px 0px 2px 0px rgba(0, 0, 0, 0.25)" }}
                  >
                    <div className="bg-[#E53E3E] flex justify-center items-center p-5 rounded-l-2xl">
                      <img src={images.feed1} alt="" />
                    </div>
                    <div className="rounded-r-2xl bg-[#FFF1F1] flex flex-col p-4 pr-8 justify-between">
                      <div className="text-xl font-semibold">Total Posts</div>
                      <div className="text-xl font-semibold">200</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div
              className="flex flex-col rounded-2xl border border-[#989898]"
              style={{ boxShadow: "0px 0px 2px 0px rgba(0, 0, 0, 0.25)" }}
            >
              <div className="bg-[#F2F2F2] text-xl font-medium p-4 rounded-t-2xl">
                Comments
              </div>
              <div className="bg-white p-5 rounded-b-2xl flex flex-col gap-3 ">
                <div className="flex flex-row gap-2 border border-[#DDDDDD] rounded-xl p-2 ">
                  <div>
                    <img className="w-12 h-12" src={images.sasha} alt="" />
                  </div>
                  <div className="flex flex-col justify-center">
                    <div className="font-medium text-md ">
                      I like what i am seeing{" "}
                      <span>
                        <button className="text-[#E53E3E] font-bold cursor-pointer">
                          View Comment
                        </button>
                      </span>
                    </div>
                    <div className="text-[#000000B2] text-[12px]">
                      Sasha Stores
                    </div>
                  </div>
                </div>
                <div className="flex flex-row gap-2 border border-[#DDDDDD] rounded-xl p-2 ">
                  <div>
                    <img className="w-12 h-12" src={images.sasha} alt="" />
                  </div>
                  <div className="flex flex-col justify-center">
                    <div className="font-medium text-md ">
                      I like what i am seeing{" "}
                      <span>
                        <button className="text-[#E53E3E] font-bold cursor-pointer">
                          View Comment
                        </button>
                      </span>
                    </div>
                    <div className="text-[#000000B2] text-[12px]">
                      Sasha Stores
                    </div>
                  </div>
                </div>
                <div className="flex flex-row gap-2 border border-[#DDDDDD] rounded-xl p-2 ">
                  <div>
                    <img className="w-12 h-12" src={images.sasha} alt="" />
                  </div>
                  <div className="flex flex-col justify-center">
                    <div className="font-medium text-md ">
                      I like what i am seeing{" "}
                      <span>
                        <button className="text-[#E53E3E] font-bold cursor-pointer">
                          View Comment
                        </button>
                      </span>
                    </div>
                    <div className="text-[#000000B2] text-[12px]">
                      Sasha Stores
                    </div>
                  </div>
                </div>
                <div className="flex flex-row gap-2 border border-[#DDDDDD] rounded-xl p-2 ">
                  <div>
                    <img className="w-12 h-12" src={images.sasha} alt="" />
                  </div>
                  <div className="flex flex-col justify-center">
                    <div className="font-medium text-md ">
                      I like what i am seeing{" "}
                      <span>
                        <button className="text-[#E53E3E] font-bold cursor-pointer">
                          View Comment
                        </button>
                      </span>
                    </div>
                    <div className="text-[#000000B2] text-[12px]">
                      Sasha Stores
                    </div>
                  </div>
                </div>
                <div className="flex flex-row gap-2 border border-[#DDDDDD] rounded-xl p-2 ">
                  <div>
                    <img className="w-12 h-12" src={images.sasha} alt="" />
                  </div>
                  <div className="flex flex-col justify-center">
                    <div className="font-medium text-md ">
                      I like what i am seeing{" "}
                      <span>
                        <button className="text-[#E53E3E] font-bold cursor-pointer">
                          View Comment
                        </button>
                      </span>
                    </div>
                    <div className="text-[#000000B2] text-[12px]">
                      Sasha Stores
                    </div>
                  </div>
                </div>
                <div className="flex flex-row gap-2 border border-[#DDDDDD] rounded-xl p-2 ">
                  <div>
                    <img className="w-12 h-12" src={images.sasha} alt="" />
                  </div>
                  <div className="flex flex-col justify-center">
                    <div className="font-medium text-md ">
                      I like what i am seeing{" "}
                      <span>
                        <button className="text-[#E53E3E] font-bold cursor-pointer">
                          View Comment
                        </button>
                      </span>
                    </div>
                    <div className="text-[#000000B2] text-[12px]">
                      Sasha Stores
                    </div>
                  </div>
                </div>
                <div className="flex flex-row gap-2 border border-[#DDDDDD] rounded-xl p-2 ">
                  <div>
                    <img className="w-12 h-12" src={images.sasha} alt="" />
                  </div>
                  <div className="flex flex-col justify-center">
                    <div className="font-medium text-md ">
                      I like what i am seeing{" "}
                      <span>
                        <button className="text-[#E53E3E] font-bold cursor-pointer">
                          View Comment
                        </button>
                      </span>
                    </div>
                    <div className="text-[#000000B2] text-[12px]">
                      Sasha Stores
                    </div>
                  </div>
                </div>
                <div className="flex flex-row gap-2 border border-[#DDDDDD] rounded-xl p-2 ">
                  <div>
                    <img className="w-12 h-12" src={images.sasha} alt="" />
                  </div>
                  <div className="flex flex-col justify-center">
                    <div className="font-medium text-md ">
                      I like what i am seeing{" "}
                      <span>
                        <button className="text-[#E53E3E] font-bold cursor-pointer">
                          View Comment
                        </button>
                      </span>
                    </div>
                    <div className="text-[#000000B2] text-[12px]">
                      Sasha Stores
                    </div>
                  </div>
                </div>
                <div className="flex flex-row gap-2 border border-[#DDDDDD] rounded-xl p-2 ">
                  <div>
                    <img className="w-12 h-12" src={images.sasha} alt="" />
                  </div>
                  <div className="flex flex-col justify-center">
                    <div className="font-medium text-md ">
                      I like what i am seeing{" "}
                      <span>
                        <button className="text-[#E53E3E] font-bold cursor-pointer">
                          View Comment
                        </button>
                      </span>
                    </div>
                    <div className="text-[#000000B2] text-[12px]">
                      Sasha Stores
                    </div>
                  </div>
                </div>
                <div className="flex flex-row gap-2 border border-[#DDDDDD] rounded-xl p-2 ">
                  <div>
                    <img className="w-12 h-12" src={images.sasha} alt="" />
                  </div>
                  <div className="flex flex-col justify-center">
                    <div className="font-medium text-md ">
                      I like what i am seeing{" "}
                      <span>
                        <button className="text-[#E53E3E] font-bold cursor-pointer">
                          View Comment
                        </button>
                      </span>
                    </div>
                    <div className="text-[#000000B2] text-[12px]">
                      Sasha Stores
                    </div>
                  </div>
                </div>
                <div className="flex flex-row gap-2 border border-[#DDDDDD] rounded-xl p-2 ">
                  <div>
                    <img className="w-12 h-12" src={images.sasha} alt="" />
                  </div>
                  <div className="flex flex-col justify-center">
                    <div className="font-medium text-md ">
                      I like what i am seeing{" "}
                      <span>
                        <button className="text-[#E53E3E] font-bold cursor-pointer">
                          View Comment
                        </button>
                      </span>
                    </div>
                    <div className="text-[#000000B2] text-[12px]">
                      Sasha Stores
                    </div>
                  </div>
                </div>
                <div className="flex flex-row gap-2 border border-[#DDDDDD] rounded-xl p-2 ">
                  <div>
                    <img className="w-12 h-12" src={images.sasha} alt="" />
                  </div>
                  <div className="flex flex-col justify-center">
                    <div className="font-medium text-md ">
                      I like what i am seeing{" "}
                      <span>
                        <button className="text-[#E53E3E] font-bold cursor-pointer">
                          View Comment
                        </button>
                      </span>
                    </div>
                    <div className="text-[#000000B2] text-[12px]">
                      Sasha Stores
                    </div>
                  </div>
                </div>
                <div className="flex flex-row gap-2 border border-[#DDDDDD] rounded-xl p-2 ">
                  <div>
                    <img className="w-12 h-12" src={images.sasha} alt="" />
                  </div>
                  <div className="flex flex-col justify-center">
                    <div className="font-medium text-md ">
                      I like what i am seeing{" "}
                      <span>
                        <button className="text-[#E53E3E] font-bold cursor-pointer">
                          View Comment
                        </button>
                      </span>
                    </div>
                    <div className="text-[#000000B2] text-[12px]">
                      Sasha Stores
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <SocialFeedModel
          isOpen={showModal}
          onClose={() => setShowModal(false)}
        />
      </div>
    </>
  );
};

export default SocialFeed;
