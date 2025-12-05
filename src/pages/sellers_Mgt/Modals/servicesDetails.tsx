import images from "../../../constants/images";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAdminServiceDetails } from "../../../utils/queries/users";

interface ServiceData {
  id: number;
  name: string;
  short_description: string;
  price_from: string;
  price_to: string;
  discount_price: string | null;
  store_name: string;
  seller_name: string;
  status: string;
  is_sold: number;
  is_unavailable: number;
  sub_services_count: number;
  media_count: number;
  created_at: string;
  formatted_date: string;
  primary_media: string;
}

interface ServicesDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  serviceData?: ServiceData | null;
}

const ServicesDetails: React.FC<ServicesDetailsProps> = ({
  isOpen,
  onClose,
  serviceData,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<
    "Product Details" | "Product Stats"
  >("Product Details");

  // Fetch service details from API
  const { data: serviceDetails, isLoading, error } = useQuery({
    queryKey: ['adminServiceDetails', serviceData?.id],
    queryFn: () => getAdminServiceDetails(serviceData!.id),
    enabled: !!serviceData?.id,
    staleTime: 5 * 60 * 1000,
  });

  // Transform API response to match expected format
  const realServiceData = serviceDetails?.data ? {
    service_info: serviceDetails.data.service_info,
    store_info: serviceDetails.data.store_info,
    media: serviceDetails.data.media?.map((img: any) => ({
      id: img.id,
      type: img.type,
      url: img.url,
      path: img.url, // For compatibility
    })) || [],
    sub_services: serviceDetails.data.sub_services || [],
    statistics: serviceDetails.data.statistics || {},
  } : null;

  const tabs = ["Product Details", "Product Stats"];

  const renderTabContent = () => {
    switch (activeTab) {
      case "Product Details":
        if (isLoading) {
          return (
            <div className="flex flex-col justify-center items-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E53E3E] mb-4"></div>
              <p className="text-gray-600 text-sm">Loading service details...</p>
            </div>
          );
        }

        if (error || !realServiceData) {
          return (
            <div className="flex flex-col justify-center items-center py-16">
              <div className="text-red-500 text-center">
                <p className="text-lg font-semibold mb-2">Error loading service details</p>
                <p className="text-sm text-gray-600">Please try again later</p>
              </div>
            </div>
          );
        }

        return (
          <div className="">
            {/* Video Section */}
            {realServiceData.service_info.video && (
              <div className="relative rounded-2xl overflow-hidden">
                <video
                  src={realServiceData.service_info.video.startsWith('http')
                    ? realServiceData.service_info.video
                    : `https://colala.hmstech.xyz/storage/${realServiceData.service_info.video}`}
                  controls
                  className="w-full h-auto object-cover"
                  preload="metadata"
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            )}

            {/* Service Images */}
            {realServiceData.media && realServiceData.media.length > 0 && (
              <div className="flex flex-row mt-5 gap-3">
                {realServiceData.media.slice(0, 3).map((img: any, index: number) => (
                  <div key={index}>
                    <img
                      src={img.url || img.path}
                      alt={`Service image ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="mt-5">
              <div className="flex flex-row justify-between border-b border-b-[#00000080] p-1 pb-5">
                <div className="flex flex-col gap-2">
                  <div className="text-xl font-medium">
                    {realServiceData.service_info.name}
                  </div>
                  <div className="text-xl font-bold text-[#E53E3E]">
                    ₦{realServiceData.service_info.price_from} - ₦{realServiceData.service_info.price_to}
                    {realServiceData.service_info.discount_price && (
                      <span className="text-sm text-gray-500 ml-2">
                        (Discounted: ₦{realServiceData.service_info.discount_price})
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-row items-center">
                  <div>
                    <img className="w-8 h-8" src={images.start1} alt="" />
                  </div>
                  <div className="text-[#00000080] text-2xl">
                    {realServiceData.statistics.average_rating || '0.0'}
                  </div>
                </div>
              </div>
              <div className="border-b border-b-[#00000080] p-1 pb-5 flex flex-col mt-5">
                <div className="text-[#00000080] text-lg font-semibold">
                  Description
                </div>
                <div className="font-semibold text-xl">
                  {realServiceData.service_info.short_description}
                </div>
                {realServiceData.service_info.full_description && (
                  <div className="mt-2 text-gray-700 whitespace-pre-line">
                    {realServiceData.service_info.full_description}
                  </div>
                )}
              </div>
            </div>
            <div className="mt-5 flex flex-col border-[0.3px] border-[#CDCDCD] rounded-2xl">
              <div className="bg-[#E53E3E] text-white font-bold text-xl p-4 rounded-t-2xl">
                Price Breakdown
              </div>
              {realServiceData.sub_services && realServiceData.sub_services.length > 0 ? (
                realServiceData.sub_services.map((subService: any, index: number) => (
                  <div key={subService.id} className={`flex flex-row p-4 ${index < realServiceData.sub_services.length - 1 ? 'border-b-[0.3px] border-b-[#CDCDCD]' : ''}`}>
                    <div className="text-[#00000080] text-lg w-40">{subService.name}</div>
                    <div className="text-lg">₦{subService.price_from} - ₦{subService.price_to}</div>
                  </div>
                ))
              ) : (
                <div className="flex flex-row p-4">
                  <div className="text-[#00000080] text-lg w-40">Base Service</div>
                  <div className="text-lg">₦{realServiceData.service_info.price_from} - ₦{realServiceData.service_info.price_to}</div>
                </div>
              )}
            </div>
            <div className="mt-5">
              <div className="flex gap-3">
                {/* Delete Button */}
                <button
                  type="button"
                  className="w-16 h-16 bg-white border border-gray-200 rounded-2xl flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>

                {/* Analytics Button */}
                <button
                  type="button"
                  className="w-16 h-16 bg-white border border-gray-200 rounded-2xl flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </button>

                {/* Edit Product Button */}
                <button
                  type="button"
                  className="flex-1 bg-[#E53E3E] text-white rounded-2xl py-4 px-6 font-medium cursor-pointer hover:bg-red-600 transition-colors"
                >
                  Edit Product
                </button>
              </div>
            </div>
          </div>
        );
      case "Product Stats":
        if (isLoading) {
          return (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E53E3E]"></div>
              <span className="ml-3 text-gray-600">Loading service statistics...</span>
            </div>
          );
        }

        if (error || !realServiceData) {
          return (
            <div className="flex justify-center items-center py-8">
              <div className="text-center text-red-500">
                <p className="text-sm">Error loading service statistics</p>
              </div>
            </div>
          );
        }

        return (
          <div>
            <div className="flex flex-col gap-3">
              <div className="flex flex-row justify-between gap-3">
                <div className="flex flex-col border border-[#989898] rounded-xl items-center justify-center gap-2 py-3 px-4 flex-1 min-h-[80px]">
                  <div className="text-[#000000B2] text-sm">Views</div>
                  <div className="font-bold text-lg">{realServiceData.statistics.views || 0}</div>
                </div>
                <div className="flex flex-col border border-[#989898] rounded-xl items-center justify-center gap-2 py-3 px-4 flex-1 min-h-[80px]">
                  <div className="text-[#000000B2] text-sm">Impressions</div>
                  <div className="font-bold text-lg">{realServiceData.statistics.impressions || 0}</div>
                </div>
                <div className="flex flex-col border border-[#989898] rounded-xl items-center justify-center gap-2 py-3 px-4 flex-1 min-h-[80px]">
                  <div className="text-[#000000B2] text-sm">Clicks</div>
                  <div className="font-bold text-lg">{realServiceData.statistics.clicks || 0}</div>
                </div>
              </div>
              <div className="flex flex-row justify-between gap-3">
                <div className="flex flex-col border border-[#989898] rounded-xl items-center justify-center gap-2 py-3 px-4 flex-1 min-h-[80px]">
                  <div className="text-[#000000B2] text-sm">Chats</div>
                  <div className="font-bold text-lg">{realServiceData.statistics.chats || 0}</div>
                </div>
                <div className="flex flex-col border border-[#989898] rounded-xl items-center justify-center gap-2 py-3 px-4 flex-1 min-h-[80px]">
                  <div className="text-[#000000B2] text-sm">Phone Views</div>
                  <div className="font-bold text-lg">{realServiceData.statistics.phone_views || 0}</div>
                </div>
                <div className="flex flex-col border border-[#989898] rounded-xl items-center justify-center gap-2 py-3 px-4 flex-1 min-h-[80px]">
                  <div className="text-[#000000B2] text-sm">Total Engagement</div>
                  <div className="font-bold text-lg">{realServiceData.statistics.total_engagement || 0}</div>
                </div>
              </div>
              <div className="flex flex-row justify-between gap-3 mt-2">
                <div className="flex flex-col border border-[#989898] rounded-xl items-center justify-center gap-2 py-3 px-4 flex-1 min-h-[80px]">
                  <div className="text-[#000000B2] text-sm">Sub Services</div>
                  <div className="font-bold text-lg">{realServiceData.statistics.sub_services_count || 0}</div>
                </div>
                <div className="flex flex-col border border-[#989898] rounded-xl items-center justify-center gap-2 py-3 px-4 flex-1 min-h-[80px]">
                  <div className="text-[#000000B2] text-sm">Media Count</div>
                  <div className="font-bold text-lg">{realServiceData.statistics.media_count || 0}</div>
                </div>
                <div className="flex flex-col border border-[#989898] rounded-xl items-center justify-center gap-2 py-3 px-4 flex-1 min-h-[80px]">
                  <div className="text-[#000000B2] text-sm">Status</div>
                  <div className="font-bold text-lg capitalize">{realServiceData.service_info.status || 'N/A'}</div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-100 bg-[#00000080] bg-opacity-50 flex justify-end">
      <div className="bg-white w-[500px] relative h-full overflow-y-auto">
        {" "}
        {/* Header */}
        <div className="border-b border-[#787878] px-3 py-3 sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Service Details</h2>
            <div className="flex items-center">
              <button
                onClick={onClose}
                className="p-2 rounded-md cursor-pointer"
                aria-label="Close"
              >
                <img className="w-7 h-7" src={images.close} alt="Close" />
              </button>
            </div>
          </div>
        </div>
        <div className="p-5">
          {" "}
          {/* Tab Buttons */}
          <div className="flex bg-white rounded-xl p-1 mb-6 w-fit border border-[#989898]">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() =>
                  setActiveTab(tab as "Product Details" | "Product Stats")
                }
                className={`px-6 py-3 rounded-xl cursor-pointer font-medium transition-colors text-sm ${activeTab === tab
                    ? "bg-[#E53E3E] text-white shadow-sm"
                    : "text-[#000000] "
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>
          {/* Tab Content */}
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default ServicesDetails;

