import PageHeader from "../../../components/PageHeader";
import images from "../../../constants/images";
import SocialFeedModel from "../../../components/socialFeedModal";
import { useState } from "react";

const SocialFeed = () => {
  const [showModal, setShowModal] = useState(false);

  const handleShowDetails = () => {
    setShowModal(true);
  };

  return (
    <>
      <div>
        <PageHeader title="Social Feed" />
        <div className="p-5 flex flex-row gap-5">
          <div className="flex flex-col">
            <div className="flex flex-row gap-3">
              <div className="flex flex-row items-center gap-5 border border-[#989898] rounded-lg px-4 py-3.5 bg-white cursor-pointer">
                <div>Today</div>
                <div>
                  <img className="w-3 h-3 mt-1" src={images.dropdown} alt="" />
                </div>
              </div>
              <div className="flex flex-row items-center gap-5 border border-[#989898] rounded-lg px-4 py-3.5 bg-white cursor-pointer">
                <div>Store Name</div>
                <div>
                  <img className="w-3 h-3 mt-1" src={images.dropdown} alt="" />
                </div>
              </div>

              <div className="relative">
                <input
                  type="text"
                  placeholder="Search"
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
            <div
              className="flex flex-col w-full border-[#989898] border rounded-2xl mt-5"
              style={{ boxShadow: "0px 0px 2px 0px rgba(0, 0, 0, 0.25)" }}
            >
              <div className="rounded-t-2xl bg-[#F2F2F2] p-4 text-xl font-medium">
                Social Feed
              </div>
              <div className="flex flex-col bg-white rounded-b-2xl p-5 gap-5">
                <div className="flex flex-row justify-between">
                  <div className="flex gap-2">
                    <div>
                      <img className="w-15 h-15" src={images.sasha} alt="" />
                    </div>
                    <div className="flex flex-col justify-center">
                      <div className="font-medium text-lg ">Sasha Stores</div>
                      <div className="text-[#000000B2] text-md">
                        Lagos, Nigeria 20 min ago
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <button
                      className="bg-[#E53E3E] px-4 py-3 cursor-pointer rounded-xl text-white font-medium "
                      onClick={() => handleShowDetails()}
                    >
                      View Post
                    </button>
                  </div>
                </div>
                <div>
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
                </div>
                <div className="flex flex-row justify-between">
                  <div className="flex gap-2">
                    <div>
                      <img className="w-15 h-15" src={images.sasha} alt="" />
                    </div>
                    <div className="flex flex-col justify-center">
                      <div className="font-medium text-lg ">Sasha Stores</div>
                      <div className="text-[#000000B2] text-md">
                        Lagos, Nigeria 20 min ago
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <button
                      className="bg-[#E53E3E] px-4 py-3 cursor-pointer rounded-xl text-white font-medium"
                      onClick={() => handleShowDetails()}
                    >
                      View Post
                    </button>
                  </div>
                </div>
                <div>
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
                </div>
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
