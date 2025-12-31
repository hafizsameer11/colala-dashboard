import images from "../../../constants/images";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAdminPromotionDetails } from "../../../utils/queries/users";
import { STORAGE_DOMAIN } from "../../../config/apiConfig";

interface Promotion {
  id: string;
  storeName: string;
  sellerName: string;
  product: string;
  productImage: string | null;
  amount: string;
  duration: string;
  date: string;
  status: string;
  statusColor: string;
  reach: number;
  impressions: number;
  clicks: number;
  cpc: string;
}

interface PromotionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  promotion?: Promotion | null;
  onStatusUpdate?: (promotionId: number | string, statusData: any) => void;
  onExtendPromotion?: (promotionId: number | string, extendData: any) => void;
}

const PromotionsModal: React.FC<PromotionsModalProps> = ({
  isOpen,
  onClose,
  promotion,
  onStatusUpdate,
  onExtendPromotion,
}) => {
  if (!isOpen) return null;

  // Fetch detailed promotion data
  const { data: promotionDetails, isLoading, error } = useQuery({
    queryKey: ['adminPromotionDetails', promotion?.id],
    queryFn: () => getAdminPromotionDetails(promotion!.id),
    enabled: !!promotion?.id && isOpen,
  });

  const [dropdownStates, setDropdownStates] = useState({
    approvalStatus: false,
  });
  const [selectedapprovalStatus, setSelectedapprovalStatus] = useState("");
  const [extendData, setExtendData] = useState({
    additionalDays: "",
    additionalBudget: "",
  });
  const approvalStatusOptions = ["pending", "approved", "active", "stopped", "rejected", "completed"];

  const toggleDropdown = (dropdownName: keyof typeof dropdownStates) => {
    setDropdownStates((prev) => ({
      ...prev,
      [dropdownName]: !prev[dropdownName],
    }));
  };

  const handleapprovalStatusSelect = (status: string) => {
    setSelectedapprovalStatus(status);
    setDropdownStates((prev) => ({ ...prev, approvalStatus: false }));
  };

  const handleStatusUpdate = () => {
    if (selectedapprovalStatus && promotion && onStatusUpdate) {
      onStatusUpdate(promotion.id, {
        status: selectedapprovalStatus,
        notes: "Status updated by admin",
      });
      onClose();
    }
  };

  const handleExtendPromotion = () => {
    if (promotion && onExtendPromotion && extendData.additionalDays) {
      onExtendPromotion(promotion.id, {
        additional_days: parseInt(extendData.additionalDays),
        additional_budget: extendData.additionalBudget ? parseFloat(extendData.additionalBudget) : undefined,
      });
      onClose();
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-100 bg-[#00000080] bg-opacity-50 flex justify-end">
        <div className="bg-white w-[500px] relative h-full overflow-y-auto">
          {/* Header */}
          <div className="border-b border-[#787878] px-3 py-3 sticky top-0 bg-white z-10">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Promotion Details</h2>
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
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E53E3E]"></div>
              </div>
            ) : error ? (
              <div className="text-center text-red-500 py-8">
                <p>Error loading promotion details</p>
              </div>
            ) : promotion && promotionDetails ? (
              <>
            <div
              className="flex flex-col rounded-2xl"
              style={{ boxShadow: "0px 0px 4px 0px rgba(0, 0, 0, 0.25)" }}
            >
              <div>
                <img
                    className="rounded-t-2xl w-full h-48 object-cover"
                    src={(() => {
                      // Try multiple possible image paths from API response
                      const imagePath = promotionDetails.data.product_info?.product_images?.[0]?.path || 
                                       promotionDetails.data.product_info?.product?.images?.[0]?.path ||
                                       promotionDetails.data.product_info?.product?.images?.[0]?.gcs_uri;
                      if (imagePath) {
                        return imagePath.startsWith('http') 
                          ? imagePath 
                          : `${STORAGE_DOMAIN}/${imagePath}`;
                      }
                      return images.laptop;
                    })()}
                    alt="Product"
                    onError={(e) => {
                      e.currentTarget.src = images.laptop;
                    }}
                />
              </div>
              <div className="flex flex-row justify-between bg-[#F2F2F2] p-3">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-[#E53E3E] rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">
                        {promotionDetails.data.store_info?.store_name?.charAt(0)?.toUpperCase() || "S"}
                      </span>
                    </div>
                    <div className="text-[#B91919]">
                      {promotionDetails.data.store_info?.store_name || "Store"}
                    </div>
                </div>
                <div className="flex items-center">
                  <div>
                    <img className="w-4 h-4" src={images.start1} alt="Rating" />
                  </div>
                  <div className="text-[#00000080]">
                    {promotionDetails.data.product_info?.product?.average_rating || "0"}
                  </div>
                </div>
              </div>
              <div className="flex flex-col p-5 gap-5">
                <div className="text-xl font-medium">
                  {promotionDetails.data.product_info?.product?.name || "No Product Name"}
                </div>
                <div className="flex flex-row gap-2">
                  {promotionDetails.data.product_info?.product?.discount_price ? (
                    <>
                      <div className="text-[#E53E3E] font-bold text-xl">
                        ₦{parseFloat(promotionDetails.data.product_info.product.discount_price).toLocaleString()}
                      </div>
                      <div className="text-[#00000080] line-through text-xl">
                        ₦{parseFloat(promotionDetails.data.product_info.product.price || "0").toLocaleString()}
                      </div>
                    </>
                  ) : (
                    <div className="text-[#E53E3E] font-bold text-xl">
                      ₦{parseFloat(promotionDetails.data.product_info?.product?.price || "0").toLocaleString()}
                    </div>
                  )}
                </div>
                <div className="flex flex-row gap-2 flex-wrap">
                  {promotionDetails.data.product_info?.product?.tag1 && (
                    <div className="flex items-center bg-[#FFA500] text-white rounded-md">
                      <div className="relative w-15 h-10 bg-[#FF3300] overflow-hidden rounded-md flex items-center px-3">
                        <div className="absolute top-0 right-0 w-1/3 h-full bg-[#FFA500] [clip-path:polygon(50%_0,100%_0,100%_100%,0_100%)]"></div>
                        <img className="w-5 h-5" src={images.cart1} alt="Cart" />
                      </div>
                      <span className="text-sm font-medium pr-3">
                        {promotionDetails.data.product_info.product.tag1}
                      </span>
                    </div>
                  )}
                  {promotionDetails.data.product_info?.product?.tag2 && (
                    <div className="flex items-center bg-[#FFA500] text-white rounded-md">
                      <div className="relative w-15 h-10 bg-[#FF3300] overflow-hidden rounded-md flex items-center px-3">
                        <div className="absolute top-0 right-0 w-1/3 h-full bg-[#FFA500] [clip-path:polygon(50%_0,100%_0,100%_100%,0_100%)]"></div>
                        <img className="w-5 h-5" src={images.cart1} alt="Cart" />
                      </div>
                      <span className="text-sm font-medium pr-3">
                        {promotionDetails.data.product_info.product.tag2}
                      </span>
                    </div>
                  )}
                  {promotionDetails.data.product_info?.product?.tag3 && (
                    <div className="flex items-center bg-[#FFA500] text-white rounded-md">
                      <div className="relative w-15 h-10 bg-[#FF3300] overflow-hidden rounded-md flex items-center px-3">
                        <div className="absolute top-0 right-0 w-1/3 h-full bg-[#FFA500] [clip-path:polygon(50%_0,100%_0,100%_100%,0_100%)]"></div>
                        <img className="w-5 h-5" src={images.cart1} alt="Cart" />
                      </div>
                      <span className="text-sm font-medium pr-3">
                        {promotionDetails.data.product_info.product.tag3}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex flex-row items-center">
                  <div>
                    <img
                      className="w-6 h-6"
                      src={images.location}
                      alt="Location"
                    />
                  </div>
                  <div className="text-[#00000080] text-lg">
                    {promotionDetails.data.promotion_info?.location || "Location not specified"}
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-5 flex flex-col gap-1">
              <div className="flex flex-row justify-between p-4 bg-[#EDEDED] border border-[#CACACA] rounded-t-2xl rounded-b-lg">
                <div className="text-[#00000080] text-xl">Reach</div>
                <div className="text-xl font-semibold">{promotionDetails.data.performance_metrics?.reach?.toLocaleString() || promotionDetails.data.promotion_info?.reach?.toLocaleString() || "0"}</div>
              </div>
              <div className="flex flex-row justify-between p-4 bg-[#EDEDED] border border-[#CACACA] rounded-t-lg rounded-b-lg">
                <div className="text-[#00000080] text-xl">Impressions</div>
                <div className="text-xl font-semibold">{promotionDetails.data.performance_metrics?.impressions?.toLocaleString() || promotionDetails.data.promotion_info?.impressions?.toLocaleString() || "0"}</div>
              </div>
              <div className="flex flex-row justify-between p-4 bg-[#EDEDED] border border-[#CACACA] rounded-t-lg rounded-b-lg">
                <div className="text-[#00000080] text-xl">Clicks</div>
                <div className="text-xl font-semibold">{promotionDetails.data.performance_metrics?.clicks?.toLocaleString() || promotionDetails.data.promotion_info?.clicks?.toLocaleString() || "0"}</div>
              </div>
              <div className="flex flex-row justify-between p-4 bg-[#EDEDED] border border-[#CACACA] rounded-t-lg rounded-b-lg">
                <div className="text-[#00000080] text-xl">Cost/Click</div>
                <div className="text-xl font-semibold">₦{promotionDetails.data.performance_metrics?.cpc || promotionDetails.data.promotion_info?.cpc || "0"}</div>
              </div>
              <div className="flex flex-row justify-between p-4 bg-[#EDEDED] border border-[#CACACA] rounded-t-lg rounded-b-lg">
                <div className="text-[#00000080] text-xl">Amount Spent</div>
                <div className="text-xl font-semibold">₦{promotionDetails.data.performance_metrics?.amount_spent?.toLocaleString() || promotionDetails.data.promotion_info?.total_amount?.toLocaleString() || "0"}</div>
              </div>
              <div className="flex flex-row justify-between p-4 bg-[#EDEDED] border border-[#CACACA] rounded-t-lg rounded-b-lg">
                <div className="text-[#00000080] text-xl">Date Created</div>
                <div className="text-xl font-semibold">{new Date(promotionDetails.data.promotion_info?.created_at).toLocaleDateString()}</div>
              </div>
              <div className="flex flex-row justify-between p-4 bg-[#EDEDED] border border-[#CACACA] rounded-t-lg rounded-b-lg">
                <div className="text-[#00000080] text-xl">Duration</div>
                <div className="text-xl font-semibold">{promotionDetails.data.promotion_info?.duration || "0"} Days</div>
              </div>
              <div className="flex flex-row justify-between p-4 bg-[#EDEDED] border border-[#CACACA] rounded-t-lg rounded-b-lg">
                <div className="text-[#00000080] text-xl">Budget</div>
                <div className="text-xl font-semibold">₦{promotionDetails.data.promotion_info?.budget?.toLocaleString() || "0"}</div>
              </div>
              <div className="flex flex-row justify-between p-4 bg-[#EDEDED] border border-[#CACACA] rounded-b-2xl rounded-t-lg">
                <div className="text-[#00000080] text-xl">Status</div>
                <div className="text-xl font-semibold text-[#008000]">
                  {(() => {
                    const status = promotionDetails.data.promotion_info?.status?.toUpperCase() || "N/A";
                    const createdDate = promotionDetails.data.promotion_info?.created_at;
                    const duration = promotionDetails.data.promotion_info?.duration;
                    
                    // Check if promotion has ended
                    if (createdDate && duration) {
                      const created = new Date(createdDate);
                      const endDate = new Date(created);
                      endDate.setDate(endDate.getDate() + parseInt(duration));
                      const today = new Date();
                      today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison
                      endDate.setHours(0, 0, 0, 0);
                      
                      // If end date is less than today, show "ENDED"
                      if (endDate < today) {
                        return "ENDED";
                      }
                    }
                    
                    return status;
                  })()}
                </div>
              </div>
            </div>
            <div className="mt-5 flex flex-row gap-3">
              <div className="border border-[#B8B8B8] rounded-xl p-4">
                <img className="cursor-pointer" src={images.edit1} alt="Edit" />
              </div>
              <div className="border border-[#B8B8B8] rounded-xl p-4">
                <img
                  className="cursor-pointer w-6 h-6"
                  src={images.stop}
                  alt="Stop"
                />
              </div>
              <div className="border border-[#B8B8B8] rounded-xl p-4">
                <img
                  className="cursor-pointer"
                  src={images.delete1}
                  alt="Delete"
                />
              </div>
            </div>

            {/* Status Update Section */}
            <div className="mt-6 p-4 border border-gray-200 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Update Status</h3>
              <div className="relative">
                <div
                  className="flex items-center justify-between border border-[#989898] rounded-2xl p-4 cursor-pointer"
                  onClick={() => toggleDropdown("approvalStatus")}
                >
                  <div className="text-lg">
                    {selectedapprovalStatus || "Select Status"}
                  </div>
                  <div
                    className={`transform transition-transform duration-200 ${
                      dropdownStates.approvalStatus ? "rotate-90" : ""
                    }`}
                  >
                    <img src={images?.rightarrow} alt="arrow" />
                  </div>
                </div>

                {dropdownStates.approvalStatus && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-[#989898] rounded-2xl shadow-lg max-h-60 overflow-y-auto">
                    {approvalStatusOptions.map((status, index) => (
                      <div
                        key={index}
                        className="p-4 hover:bg-gray-50 cursor-pointer text-lg border-b border-gray-100 last:border-b-0"
                        onClick={() => handleapprovalStatusSelect(status)}
                      >
                        {status}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={handleStatusUpdate}
                disabled={!selectedapprovalStatus}
                className="mt-4 bg-[#E53E3E] text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Update Status
              </button>
            </div>

            {/* Extend Promotion Section */}
            <div className="mt-6 p-4 border border-gray-200 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Extend Promotion</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Additional Days</label>
                  <input
                    type="number"
                    value={extendData.additionalDays}
                    onChange={(e) => setExtendData(prev => ({ ...prev, additionalDays: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="Enter additional days"
                    min="1"
                    max="365"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Additional Budget (Optional)</label>
                  <input
                    type="number"
                    value={extendData.additionalBudget}
                    onChange={(e) => setExtendData(prev => ({ ...prev, additionalBudget: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="Enter additional budget"
                    min="0"
                  />
                </div>
                <button
                  onClick={handleExtendPromotion}
                  disabled={!extendData.additionalDays}
                  className="bg-[#E53E3E] text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Extend Promotion
                </button>
              </div>
            </div>
              </>
            ) : promotion ? (
              <div className="text-center text-gray-500 py-8">
                <p>Loading promotion details...</p>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <p>No promotion selected</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default PromotionsModal;
