import images from "../../../constants/images";
import { useEffect, useState } from "react";
import PlanForm from "./planForm";

interface PlansModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingPlan?: any;
  onCreatePlan?: (planData: any) => void;
  onUpdatePlan?: (planData: any) => void;
  isLoading?: boolean;
  initialTab?: "Basic" | "Standard" | "Ultra";
  subscriptionDetails?: any;
  error?: any;
}

const PlansModal: React.FC<PlansModalProps> = ({
  isOpen,
  onClose,
  editingPlan,
  onCreatePlan,
  onUpdatePlan,
  isLoading = false,
  initialTab = "Basic",
  subscriptionDetails,
  error,
}) => {
  // Extract plan name from subscription details (handle both nested and flat structures)
  // API response structure: { status: "success", data: { plan_info: { plan_name: "Basic" } } }
  const planInfo = subscriptionDetails?.data?.plan_info || subscriptionDetails?.plan_info;
  const rawPlanName = planInfo?.plan_name;
  
  // Normalize plan name to match tab names (capitalize first letter, handle case variations)
  const normalizedPlanName = rawPlanName 
    ? rawPlanName.charAt(0).toUpperCase() + rawPlanName.slice(1).toLowerCase()
    : null;

  // Determine which tabs to show - only show the matching plan tab when viewing subscription details
  const allTabs: Array<"Basic" | "Standard" | "Ultra"> = ["Basic", "Standard", "Ultra"];
  const visibleTabs = subscriptionDetails && normalizedPlanName
    ? allTabs.filter(tab => tab.toLowerCase() === normalizedPlanName.toLowerCase())
    : allTabs;

  // Use the plan name as the active tab when viewing subscription details
  const activeTab = subscriptionDetails && normalizedPlanName && visibleTabs.length > 0
    ? (normalizedPlanName as "Basic" | "Standard" | "Ultra")
    : initialTab;

  // Debug logging for subscription details
  console.log('PlansModal - Initial Tab:', initialTab);
  console.log('PlansModal - Subscription Details:', subscriptionDetails);
  console.log('PlansModal - Raw Plan Name:', rawPlanName);
  console.log('PlansModal - Normalized Plan Name:', normalizedPlanName);
  console.log('PlansModal - Visible Tabs:', visibleTabs);
  console.log('PlansModal - Active Tab:', activeTab);
  console.log('PlansModal - Error:', error);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-100 bg-[#00000080] bg-opacity-50 flex justify-end">
        <div className="bg-white w-[500px] relative h-full overflow-y-auto">
          {" "}
          {/* Header */}
          <div className="border-b border-[#787878] px-3 py-3 sticky top-0 bg-white z-10">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">
                {subscriptionDetails ? 'Subscription Details' : (editingPlan ? 'Edit Plan' : 'Create New Plan')}
              </h2>
              <div className="flex items-center">
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
          <div className="pl-5 pr-5">
            {subscriptionDetails ? (
              /* Subscription Details Display */
              <div className="mt-5">
                {isLoading ? (
                  <div className="flex flex-col justify-center items-center py-16">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E53E3E] mb-4"></div>
                    <p className="text-gray-600 text-sm">Loading subscription details...</p>
                  </div>
                ) : error ? (
                  <div className="flex flex-col justify-center items-center py-16">
                    <div className="text-red-500 text-center">
                      <p className="text-lg font-semibold mb-2">Error loading subscription details</p>
                      <p className="text-sm text-gray-600">Please try again later</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Plan Type Selector - Only show matching plan tab */}
                    {visibleTabs.length > 0 && (
                      <div className="flex items-center space-x-0.5 border border-[#989898] rounded-lg p-2 w-fit bg-white">
                        {visibleTabs.map((tab) => (
                          <button
                            key={tab}
                            className={`py-2 text-sm rounded-lg font-normal transition-all duration-200 cursor-pointer px-8 ${
                              activeTab === tab ? "bg-[#E53E3E] text-white" : "text-black"
                            }`}
                          >
                            {tab}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Plan Name */}
                    <div className="flex flex-col gap-3">
                      <label className="text-xl font-medium">Plan Name</label>
                      <input
                        type="text"
                        value={planInfo?.plan_name || ""}
                        readOnly
                        className="w-full rounded-2xl border border-[#989898] p-5 bg-gray-50"
                      />
                    </div>

                    {/* Monthly Price */}
                    <div className="flex flex-col gap-3">
                      <label className="text-xl font-medium">Monthly Price</label>
                      <input
                        type="text"
                        value={`${planInfo?.currency || ""} ${planInfo?.price || ""}`}
                        readOnly
                        className="w-full rounded-2xl border border-[#989898] p-5 bg-gray-50"
                      />
                    </div>

                    {/* Plan Benefits */}
                    <div className="flex flex-col gap-3">
                      <label className="text-xl font-medium">Plan Benefits</label>
                      <div className="space-y-3">
                        {planInfo?.features && Object.values(planInfo.features).map((feature, index) => (
                          <input
                            key={index}
                            type="text"
                            value={feature as string}
                            readOnly
                            className="w-full rounded-2xl border border-[#989898] p-5 bg-gray-50"
                          />
                        ))}
                      </div>
                    </div>

                    {/* Subscription Status */}
                    <div className="flex flex-col gap-3">
                      <label className="text-xl font-medium">Subscription Status</label>
                      <div className="flex items-center justify-between p-5 border border-[#989898] rounded-2xl bg-gray-50">
                        <span className="text-lg font-medium">
                          Status: <span className="font-bold text-[#E53E3E]">{(subscriptionDetails?.data?.subscription_info || subscriptionDetails?.subscription_info)?.status || "Unknown"}</span>
                        </span>
                      </div>
                    </div>

                    {/* Additional Details */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-600">Start Date</label>
                        <div className="p-3 border border-[#989898] rounded-lg bg-gray-50">
                          {(() => {
                            const subInfo = subscriptionDetails?.data?.subscription_info || subscriptionDetails?.subscription_info;
                            return subInfo?.start_date ? 
                              new Date(subInfo.start_date).toLocaleDateString() : "N/A";
                          })()}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-600">End Date</label>
                        <div className="p-3 border border-[#989898] rounded-lg bg-gray-50">
                          {(() => {
                            const subInfo = subscriptionDetails?.data?.subscription_info || subscriptionDetails?.subscription_info;
                            return subInfo?.end_date ? 
                              new Date(subInfo.end_date).toLocaleDateString() : "N/A";
                          })()}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-600">Days Remaining</label>
                        <div className="p-3 border border-[#989898] rounded-lg bg-gray-50">
                          {(() => {
                            const daysRemaining = subscriptionDetails?.data?.days_remaining || subscriptionDetails?.days_remaining;
                            return daysRemaining ? Math.ceil(daysRemaining) : "N/A";
                          })()} days
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-600">Payment Status</label>
                        <div className="p-3 border border-[#989898] rounded-lg bg-gray-50">
                          {(subscriptionDetails?.data?.subscription_info || subscriptionDetails?.subscription_info)?.payment_status || "N/A"}
                        </div>
                      </div>
                    </div>

                    {/* Store Information */}
                    <div className="border-t pt-4">
                      <h3 className="text-lg font-medium mb-3">Store Information</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Store Name:</span>
                          <span className="font-medium">{(subscriptionDetails?.data?.store_info || subscriptionDetails?.store_info)?.store_name || "N/A"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Owner:</span>
                          <span className="font-medium">{(subscriptionDetails?.data?.store_info || subscriptionDetails?.store_info)?.owner_name || "N/A"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Email:</span>
                          <span className="font-medium">{(subscriptionDetails?.data?.store_info || subscriptionDetails?.store_info)?.owner_email || "N/A"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Plan Form */
              <div className="mt-5">
                <PlanForm 
                  editingPlan={editingPlan}
                  onCreatePlan={onCreatePlan}
                  onUpdatePlan={onUpdatePlan}
                  isLoading={isLoading}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default PlansModal;
