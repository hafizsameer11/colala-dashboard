import React, { useState, useEffect } from "react";
import images from "../../../constants/images";

interface FormData {
  planName: string;
  monthlyPrice: string;
  benefits: string[];
  approvalStatus: string;
}

interface PlanFormProps {
  editingPlan?: any;
  onCreatePlan?: (planData: any) => void;
  onUpdatePlan?: (planData: any) => void;
  isLoading?: boolean;
}

const PlanForm: React.FC<PlanFormProps> = ({ 
  editingPlan, 
  onCreatePlan, 
  onUpdatePlan, 
  isLoading = false 
}) => {
  const [formData, setFormData] = useState<FormData>({
    planName: "",
    monthlyPrice: "",
    benefits: ["", "", ""], // Start with 3 benefits
    approvalStatus: "",
  });

  const [dropdownStates, setDropdownStates] = useState({
    approvalStatus: false,
  });

  const [selectedapprovalStatus, setSelectedapprovalStatus] = useState("");
  const [errors, setErrors] = useState<{ approvalStatus?: string }>({});
  const approvalStatus = ["Approved", "Pending", "Rejected"];

  // Initialize form with editing plan data
  useEffect(() => {
    if (editingPlan) {
      setFormData({
        planName: editingPlan.name || "",
        monthlyPrice: editingPlan.price || "",
        benefits: editingPlan.features ? Object.values(editingPlan.features) : ["", "", ""],
        approvalStatus: "Approved", // Default for existing plans
      });
    }
  }, [editingPlan]);

  const handleSave = () => {
    const planData = {
      name: formData.planName,
      price: parseFloat(formData.monthlyPrice) || 0,
      currency: "NGN",
      duration_days: 30,
      features: formData.benefits.reduce((acc, benefit, index) => {
        if (benefit.trim()) {
          acc[`feature${index + 1}`] = benefit.trim();
        }
        return acc;
      }, {} as Record<string, string>),
    };

    if (editingPlan) {
      onUpdatePlan?.(planData);
    } else {
      onCreatePlan?.(planData);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleBenefitChange = (index: number, value: string) => {
    const newBenefits = [...formData.benefits];
    newBenefits[index] = value;
    setFormData((prev) => ({
      ...prev,
      benefits: newBenefits,
    }));
  };

  const addBenefit = () => {
    setFormData((prev) => ({
      ...prev,
      benefits: [...prev.benefits, ""],
    }));
  };

  const removeBenefit = (index: number) => {
    if (formData.benefits.length > 1) {
      const newBenefits = formData.benefits.filter((_, i) => i !== index);
      setFormData((prev) => ({
        ...prev,
        benefits: newBenefits,
      }));
    }
  };

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

  return (
    <div className="flex flex-col gap-5">
      <form className="flex flex-col gap-5">
        {/* Plan Name */}
        <div className="flex flex-col gap-2">
          <label className="text-[14px] font-medium">Plan Name</label>
          <input
            type="text"
            value={formData.planName}
            onChange={(e) => handleInputChange("planName", e.target.value)}
            className="border border-[#989898] rounded-lg px-4 py-3 text-[14px] focus:outline-none focus:border-[#E53E3E]"
            placeholder="Enter plan name"
          />
        </div>

        {/* Monthly Price */}
        <div className="flex flex-col gap-2">
          <label className="text-[14px] font-medium">Monthly Price</label>
          <input
            type="number"
            value={formData.monthlyPrice}
            onChange={(e) => handleInputChange("monthlyPrice", e.target.value)}
            className="border border-[#989898] rounded-lg px-4 py-3 text-[14px] focus:outline-none focus:border-[#E53E3E]"
            placeholder="Enter monthly price"
            min="0"
            step="0.01"
          />
        </div>

        {/* Plan Benefits */}
        <div className="flex flex-col gap-2">
          <label className="text-[14px] font-medium">Plan Benefits</label>
          {formData.benefits.map((benefit, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                value={benefit}
                onChange={(e) => handleBenefitChange(index, e.target.value)}
                className="flex-1 border border-[#989898] rounded-lg px-4 py-3 text-[14px] focus:outline-none focus:border-[#E53E3E]"
                placeholder={`Benefit ${index + 1}`}
              />
              {formData.benefits.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeBenefit(index)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                >
                  <img className="w-4 h-4" src={images.delete1} alt="Remove" />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addBenefit}
            className="border-2 border-dashed border-[#989898] rounded-lg px-4 py-3 text-[14px] text-[#989898] hover:border-[#E53E3E] hover:text-[#E53E3E] transition-colors"
          >
            Add New Benefit
          </button>
        </div>

        {/* Approval Status */}
        <div className="flex flex-col gap-2">
          <label className="text-[14px] font-medium">Approval Status</label>
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
                {approvalStatus.map((status, index) => (
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
          {errors.approvalStatus && (
            <p className="text-red-500 text-sm mt-1">
              {errors.approvalStatus}
            </p>
          )}
        </div>
      </form>

      <button
        onClick={handleSave}
        disabled={isLoading}
        className="bg-[#E53E3E] text-white w-full py-3.5 cursor-pointer rounded-lg hover:bg-[#D32F2F] transition-colors mt-5 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Saving...' : (editingPlan ? 'Update Plan' : 'Create Plan')}
      </button>
    </div>
  );
};

export default PlanForm;
