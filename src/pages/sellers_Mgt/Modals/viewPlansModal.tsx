import React, { useState } from "react";
import images from "../../../constants/images";

interface Plan {
  id: number;
  name: string;
  price: string;
  currency: string;
  duration_days: number;
  features: Record<string, string>;
  active_subscriptions_count: number;
  created_at: string | null;
}

interface ViewPlansModalProps {
  isOpen: boolean;
  onClose: () => void;
  plans: Plan[];
  onEditPlan?: (plan: Plan) => void;
  onCreatePlan?: () => void;
}

const ViewPlansModal: React.FC<ViewPlansModalProps> = ({
  isOpen,
  onClose,
  plans,
  onEditPlan,
  onCreatePlan,
}) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-100 bg-[#00000080] bg-opacity-50 flex justify-center items-center">
        <div className="bg-white w-[800px] max-h-[80vh] relative rounded-lg overflow-hidden">
          {/* Header */}
          <div className="border-b border-[#787878] px-6 py-4 sticky top-0 bg-white z-10">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Subscription Plans</h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={onCreatePlan}
                  className="bg-[#E53E3E] text-white px-4 py-2 rounded-lg hover:bg-[#D32F2F] transition-colors"
                >
                  Create New Plan
                </button>
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

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {plans.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No plans found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left p-3 font-medium text-gray-700">Plan Name</th>
                      <th className="text-left p-3 font-medium text-gray-700">Price</th>
                      <th className="text-left p-3 font-medium text-gray-700">Duration</th>
                      <th className="text-left p-3 font-medium text-gray-700">Features</th>
                      <th className="text-left p-3 font-medium text-gray-700">Active Subscriptions</th>
                      <th className="text-center p-3 font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {plans.map((plan, index) => (
                      <tr
                        key={plan.id}
                        className={`border-b border-gray-100 hover:bg-gray-50 ${
                          index === plans.length - 1 ? "" : "border-b"
                        }`}
                      >
                        <td className="p-4">
                          <div className="font-medium text-gray-900">{plan.name}</div>
                        </td>
                        <td className="p-4">
                          <div className="text-lg font-bold text-[#E53E3E]">
                            {plan.currency} {plan.price}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-gray-600">{plan.duration_days} days</div>
                        </td>
                        <td className="p-4">
                          <div className="text-sm text-gray-600">
                            {Object.keys(plan.features).length} features
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-sm text-gray-600">
                            {plan.active_subscriptions_count} active
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => onEditPlan?.(plan)}
                            className="text-[#E53E3E] hover:text-[#D32F2F] text-sm font-medium"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ViewPlansModal;