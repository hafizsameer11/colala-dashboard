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


  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-100 bg-[#00000080] bg-opacity-50 flex justify-end">
        <div className="bg-white w-[500px] relative h-full overflow-y-auto">
          {" "}
          {/* Header */}
          <div className="border-b border-gray-300 px-5 py-4 sticky top-0 bg-white z-10 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {subscriptionDetails ? 'Subscription Details' : (editingPlan ? 'Edit Plan' : 'Create New Plan')}
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <img className="w-6 h-6" src={images.close} alt="Close" />
              </button>
            </div>
          </div>
          <div className="pl-5 pr-5">
            {subscriptionDetails ? (
              /* Subscription Details Display */
              <div className="mt-5 pb-8">
                {isLoading ? (
                  <div className="flex flex-col justify-center items-center py-20">
                    <div className="relative">
                      <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-[#E53E3E] mb-6"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 bg-[#E53E3E] rounded-full animate-pulse"></div>
                      </div>
                    </div>
                    <p className="text-gray-700 text-base font-medium mt-4">Loading subscription details...</p>
                    <p className="text-gray-500 text-sm mt-2">Please wait while we fetch the information</p>
                  </div>
                ) : error ? (
                  <div className="flex flex-col justify-center items-center py-20">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
                      <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-lg font-semibold text-gray-900 mb-2">Error loading subscription details</p>
                    <p className="text-sm text-gray-600 text-center max-w-sm">We encountered an issue while fetching the subscription information. Please try again later.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Plan Type Selector - Only show matching plan tab */}
                    {visibleTabs.length > 0 && (
                      <div className="flex items-center space-x-1 border border-gray-300 rounded-xl p-1.5 w-fit bg-white shadow-sm">
                        {visibleTabs.map((tab) => (
                          <button
                            key={tab}
                            className={`py-2.5 px-6 text-sm rounded-lg font-semibold transition-all duration-200 cursor-pointer ${
                              activeTab === tab 
                                ? "bg-[#E53E3E] text-white shadow-md" 
                                : "text-gray-700 hover:bg-gray-100"
                            }`}
                          >
                            {tab}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Plan Name */}
                    <div className="flex flex-col gap-2">
                      <label className="text-base font-semibold text-gray-700">Plan Name</label>
                      <div className="w-full rounded-xl border border-gray-300 p-4 bg-gray-50 text-gray-900 font-medium">
                        {planInfo?.plan_name || "N/A"}
                      </div>
                    </div>

                    {/* Monthly Price */}
                    <div className="flex flex-col gap-2">
                      <label className="text-base font-semibold text-gray-700">Monthly Price</label>
                      <div className="w-full rounded-xl border border-gray-300 p-4 bg-gray-50 text-gray-900 font-semibold text-lg">
                        {planInfo?.currency || ""} {planInfo?.price ? Number(planInfo.price).toLocaleString() : "N/A"}
                      </div>
                    </div>

                    {/* Plan Benefits */}
                    {planInfo?.features && Object.keys(planInfo.features).length > 0 && (
                      <div className="flex flex-col gap-2">
                        <label className="text-base font-semibold text-gray-700">Plan Benefits</label>
                        <div className="space-y-2">
                          {Object.values(planInfo.features).map((feature, index) => (
                            <div
                              key={index}
                              className="w-full rounded-xl border border-gray-300 p-4 bg-gray-50 text-gray-900 flex items-start gap-3"
                            >
                              <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              <span className="flex-1">{feature as string}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Subscription Status */}
                    <div className="flex flex-col gap-2">
                      <label className="text-base font-semibold text-gray-700">Subscription Status</label>
                      <div className="flex items-center justify-between p-4 border border-gray-300 rounded-xl bg-white">
                        <span className="text-base font-medium text-gray-700">
                          Status:
                        </span>
                        <span className={`px-4 py-2 rounded-lg font-semibold text-sm ${
                          (() => {
                            const status = (subscriptionDetails?.data?.subscription_info || subscriptionDetails?.subscription_info)?.status?.toLowerCase() || "unknown";
                            if (status === "active") return "bg-green-100 text-green-800";
                            if (status === "expired" || status === "cancelled") return "bg-red-100 text-red-800";
                            return "bg-gray-100 text-gray-800";
                          })()
                        }`}>
                          {(subscriptionDetails?.data?.subscription_info || subscriptionDetails?.subscription_info)?.status || "Unknown"}
                        </span>
                      </div>
                    </div>

                    {/* Additional Details */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-gray-700">Start Date</label>
                        <div className="p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900">
                          {(() => {
                            const subInfo = subscriptionDetails?.data?.subscription_info || subscriptionDetails?.subscription_info;
                            return subInfo?.start_date ? 
                              new Date(subInfo.start_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : "N/A";
                          })()}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-gray-700">End Date</label>
                        <div className="p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900">
                          {(() => {
                            const subInfo = subscriptionDetails?.data?.subscription_info || subscriptionDetails?.subscription_info;
                            return subInfo?.end_date ? 
                              new Date(subInfo.end_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : "N/A";
                          })()}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-gray-700">Days Remaining</label>
                        <div className="p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 font-medium">
                          {(() => {
                            const daysRemaining = subscriptionDetails?.data?.days_remaining || subscriptionDetails?.days_remaining;
                            return daysRemaining ? `${Math.ceil(daysRemaining)} days` : "N/A";
                          })()}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-gray-700">Payment Status</label>
                        <div className={`p-3 border border-gray-300 rounded-lg font-medium text-sm ${
                          (() => {
                            const paymentStatus = (subscriptionDetails?.data?.subscription_info || subscriptionDetails?.subscription_info)?.payment_status?.toLowerCase() || "unknown";
                            if (paymentStatus === "paid") return "bg-green-50 text-green-800";
                            if (paymentStatus === "pending") return "bg-yellow-50 text-yellow-800";
                            if (paymentStatus === "failed") return "bg-red-50 text-red-800";
                            return "bg-gray-50 text-gray-800";
                          })()
                        }`}>
                          {(subscriptionDetails?.data?.subscription_info || subscriptionDetails?.subscription_info)?.payment_status || "N/A"}
                        </div>
                      </div>
                    </div>

                    {/* Payment Information */}
                    {(() => {
                      const subInfo = subscriptionDetails?.data?.subscription_info || subscriptionDetails?.subscription_info;
                      if (subInfo?.transaction_ref || subInfo?.payment_method) {
                        return (
                          <div className="border-t border-gray-200 pt-4">
                            <h3 className="text-base font-semibold text-gray-700 mb-3">Payment Information</h3>
                            <div className="space-y-3">
                              {subInfo?.transaction_ref && (
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                                  <span className="text-sm font-medium text-gray-600">Transaction Reference:</span>
                                  <span className="text-sm font-mono text-gray-900">{subInfo.transaction_ref}</span>
                                </div>
                              )}
                              {subInfo?.payment_method && (
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                                  <span className="text-sm font-medium text-gray-600">Payment Method:</span>
                                  <span className="text-sm font-medium text-gray-900 capitalize">{subInfo.payment_method}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })()}

                    {/* Store Information */}
                    <div className="border-t border-gray-200 pt-4">
                      <h3 className="text-base font-semibold text-gray-700 mb-4">Store Information</h3>
                      <div className="space-y-3 bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                          <span className="text-sm font-medium text-gray-600">Store Name:</span>
                          <span className="text-sm font-semibold text-gray-900">{(subscriptionDetails?.data?.store_info || subscriptionDetails?.store_info)?.store_name || "N/A"}</span>
                        </div>
                        <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                          <span className="text-sm font-medium text-gray-600">Owner:</span>
                          <span className="text-sm font-semibold text-gray-900">{(subscriptionDetails?.data?.store_info || subscriptionDetails?.store_info)?.owner_name || "N/A"}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-600">Email:</span>
                          <span className="text-sm font-semibold text-gray-900">{(subscriptionDetails?.data?.store_info || subscriptionDetails?.store_info)?.owner_email || "N/A"}</span>
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
