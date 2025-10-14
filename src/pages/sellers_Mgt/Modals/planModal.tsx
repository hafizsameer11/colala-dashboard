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
}

const PlansModal: React.FC<PlansModalProps> = ({
  isOpen,
  onClose,
  editingPlan,
  onCreatePlan,
  onUpdatePlan,
  isLoading = false,
}) => {

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
                {editingPlan ? 'Edit Plan' : 'Create New Plan'}
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
            {/* Plan Form */}
            <div className="mt-5">
              <PlanForm 
                editingPlan={editingPlan}
                onCreatePlan={onCreatePlan}
                onUpdatePlan={onUpdatePlan}
                isLoading={isLoading}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PlansModal;
