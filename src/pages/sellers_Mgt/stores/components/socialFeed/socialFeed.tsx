import { useState } from "react";
import images from "../../../../../constants/images";
import BulkActionDropdown from "../../../../../components/BulkActionDropdown";
import SocialFeedTable from "./socialFeedTable";
import NewPost from "../../../Modals/newPost";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getSellerSocialFeed } from "../../../../../utils/queries/users";

const SocialFeed = () => {
  const [activeTab, setActiveTab] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const { storeId } = useParams<{ storeId: string }>();
  const tabs = ["All", "My Posts"];
  const [showModal, setShowModal] = useState(false);

  const { data: socialFeedData, isLoading, error } = useQuery({
    queryKey: ['sellerSocialFeed', storeId, currentPage],
    queryFn: () => getSellerSocialFeed(storeId!, currentPage),
    enabled: !!storeId,
    staleTime: 2 * 60 * 1000,
  });

  const posts = socialFeedData?.data?.data || [];
  const pagination = socialFeedData?.data;

  const TabButtons = () => (
    <div className="flex items-center space-x-0.5 border border-[#989898] rounded-lg p-2 w-fit bg-white">
      {tabs.map((tab) => {
        const isActive = activeTab === tab;
        return (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-2 text-sm rounded-lg font-normal transition-all duration-200 cursor-pointer ${
              isActive ? "px-8 bg-[#E53E3E] text-white" : "px-4 text-black"
            }`}
          >
            {tab}
          </button>
        );
      })}
    </div>
  );
  const handleBulkActionSelect = (action: string) => {
    // Handle the bulk action selection from the parent component
    console.log("Bulk action selected in Orders:", action);
    // Add your custom logic here
  };

  return (
    <div>
      <div className="flex flex-row justify-between items-center">
        {/* Card 1 */}
        <div
          className="flex flex-row rounded-2xl  w-90"
          style={{ boxShadow: "0px 0px 2px 0px rgba(0, 0, 0, 0.25)" }}
        >
          <div className="bg-[#E53E3E] rounded-l-2xl p-7 flex justify-center items-center ">
            <img className="w-9 h-9" src={images.transaction1} alt="" />
          </div>
          <div className="flex flex-col bg-[#FFF1F1] rounded-r-2xl p-3 pr-11 gap-1">
            <span className="font-semibold text-[15px]">Total Posts</span>
            <span className="font-semibold text-2xl">{pagination?.total || 0}</span>
            <span className="text-[#00000080] text-[13px] ">
              <span className="text-[#1DB61D]">+5%</span> increase from last
              month
            </span>
          </div>
        </div>

        {/* Card 2 */}

        <div
          className="flex flex-row rounded-2xl w-90"
          style={{ boxShadow: "0px 0px 2px 0px rgba(0, 0, 0, 0.25)" }}
        >
          <div className="bg-[#E53E3E] rounded-l-2xl p-7 flex justify-center items-center ">
            <img className="w-9 h-9" src={images.transaction1} alt="" />
          </div>
          <div className="flex flex-col bg-[#FFF1F1] rounded-r-2xl p-3 pr-11 gap-1">
            <span className="font-semibold text-[15px]">Total Likes</span>
            <span className="font-semibold text-2xl">{posts.reduce((sum, post) => sum + (post.likes_count || 0), 0)}</span>
            <span className="text-[#00000080] text-[13px] ">
              <span className="text-[#1DB61D]">+5%</span> increase from last
              month
            </span>
          </div>
        </div>

        {/* Card 3 */}

        <div
          className="flex flex-row rounded-2xl w-90"
          style={{ boxShadow: "0px 0px 2px 0px rgba(0, 0, 0, 0.25)" }}
        >
          <div className="bg-[#E53E3E] rounded-l-2xl p-7 flex justify-center items-center ">
            <img className="w-9 h-9" src={images.transaction1} alt="" />
          </div>
          <div className="flex flex-col bg-[#FFF1F1] rounded-r-2xl p-3 pr-11 gap-1">
            <span className="font-semibold text-[15px]">Total Comments</span>
            <span className="font-semibold text-2xl">{posts.reduce((sum, post) => sum + (post.comments_count || 0), 0)}</span>
            <span className="text-[#00000080] text-[13px] ">
              <span className="text-[#1DB61D]">+5%</span> increase from last
              month
            </span>
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-row justify-between">
        <div className="flex flex-row items-center gap-2">
          <div>
            <TabButtons />
          </div>
          <div className="flex flex-row items-center gap-5 border border-[#989898] rounded-lg px-4 py-3.5 bg-white cursor-pointer">
            <div>Today</div>
            <div>
              <img className="w-3 h-3 mt-1" src={images.dropdown} alt="" />
            </div>
          </div>
          <div className="flex flex-row items-center gap-5 border border-[#989898] rounded-lg px-4 py-3.5 bg-white cursor-pointer">
            <div>Store</div>
            <div>
              <img className="w-3 h-3 mt-1" src={images.dropdown} alt="" />
            </div>
          </div>
          <div>
            <BulkActionDropdown onActionSelect={handleBulkActionSelect} />
          </div>
        </div>
        <div className="flex gap-2">
          <div>
            <button className="bg-[#E53E3E] px-6 py-3.5 cursor-pointer text-white rounded-xl" onClick={() => setShowModal(true)}>
              Add new post
            </button>
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Search"
              className="pl-12 pr-6 py-3.5 border border-[#00000080] rounded-lg text-[15px] w-[363px] focus:outline-none bg-white shadow-[0_2px_6px_rgba(0,0,0,0.05)] placeholder-[#00000080]"
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
      <div>
        <SocialFeedTable 
          posts={posts}
          isLoading={isLoading}
          error={error}
          pagination={pagination}
          onPageChange={setCurrentPage}
          userId={storeId}
        />
      </div>

      
      <NewPost
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </div>
  );
};

export default SocialFeed;
