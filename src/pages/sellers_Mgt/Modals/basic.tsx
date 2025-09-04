import React from "react";
import { useState, useEffect } from "react";
import images from "../../../constants/images";

interface FormData {
  planName: string;
  monthlyPrice: string;
  benefits: string[];
  approvalStatus: string;
}

const Basic: React.FC = () => {
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

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem("standardPlanData");
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setFormData(parsedData);
      } catch (error) {
        console.error("Error loading saved data:", error);
      }
    }
  }, []);

  // Save data to localStorage whenever formData changes
  useEffect(() => {
    localStorage.setItem("standardPlanData", JSON.stringify(formData));
  }, [formData]);

  const handleSave = () => {
    // Handle save logic for Standard plan
    console.log("Standard plan saved:", formData);
    // You can add additional save logic here
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleBenefitChange = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      benefits: prev.benefits.map((benefit, i) =>
        i === index ? value : benefit
      ),
    }));
  };

  const addNewBenefit = () => {
    setFormData((prev) => ({
      ...prev,
      benefits: [...prev.benefits, ""],
    }));
  };

  const toggleDropdown = (dropdownName: keyof typeof dropdownStates) => {
    setDropdownStates((prev) => ({
      ...prev,
      [dropdownName]: !prev[dropdownName],
      // Close other dropdowns
      ...(Object.keys(prev) as Array<keyof typeof dropdownStates>).reduce(
        (acc, key) => {
          if (key !== dropdownName) {
            (acc as any)[key] = false;
          }
          return acc;
        },
        {} as Record<string, boolean>
      ),
    }));
  };

  const handleapprovalStatusSelect = (approvalStatus: string) => {
    setSelectedapprovalStatus(approvalStatus);
    setFormData((prev) => ({
      ...prev,
      approvalStatus: approvalStatus,
    }));
    setDropdownStates((prev) => ({ ...prev, approvalStatus: false }));
    if (errors.approvalStatus) {
      setErrors((prev) => ({ ...prev, approvalStatus: "" }));
    }
  };

  return (
    <div className="mt-5 mb-5">
      <div>
        <form action="#">
          <div className="flex flex-col gap-3">
            <label htmlFor="planName" className="text-xl font-medium">
              Plan Name
            </label>
            <input
              type="text"
              name="planName"
              id="planName"
              placeholder="Enter your plan name"
              value={formData.planName}
              onChange={(e) => handleInputChange("planName", e.target.value)}
              className="border border-[#989898] rounded-2xl p-5 w-full"
            />
          </div>
          <div className="flex flex-col gap-3 mt-5">
            <label htmlFor="monthlyPrice" className="text-xl font-medium">
              Monthly Price
            </label>
            <input
              type="text"
              name="monthlyPrice"
              id="monthlyPrice"
              placeholder="Enter your monthly price"
              value={formData.monthlyPrice}
              onChange={(e) =>
                handleInputChange("monthlyPrice", e.target.value)
              }
              className="border border-[#989898] rounded-2xl p-5 w-full"
            />
          </div>
          <div className="flex flex-col gap-3 mt-5">
            <label htmlFor="planBenefits" className="text-xl font-medium">
              Plan Benefits
            </label>
            {formData.benefits.map((benefit, index) => (
              <input
                key={index}
                type="text"
                name={`planBenefit${index + 1}`}
                id={`planBenefit${index + 1}`}
                placeholder={`Benefit ${index + 1}`}
                value={benefit}
                onChange={(e) => handleBenefitChange(index, e.target.value)}
                className="border border-[#989898] rounded-2xl p-5 w-full placeholder:text-black placeholder:font-medium"
              />
            ))}
            <button
              type="button"
              onClick={addNewBenefit}
              className="border border-dashed border-[#989898] rounded-2xl p-5 w-full text-[#989898] font-medium hover:bg-gray-50 transition-colors"
            >
              Add New
            </button>
          </div>
          <div className="mt-5">
            <label htmlFor="store" className="text-lg font-semibold">
              Approval Status
            </label>
            <div className="relative">
              <div
                className={`w-full border p-5 rounded-2xl text-lg flex flex-row justify-between items-center mt-3 cursor-pointer ${
                  errors.approvalStatus ? "border-red-500" : "border-[#989898]"
                }`}
                onClick={() => toggleDropdown("approvalStatus")}
              >
                <div
                  className={
                    selectedapprovalStatus ? "text-black" : "text-[#00000080]"
                  }
                >
                  {selectedapprovalStatus || "Change Approval Status"}
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
                  {approvalStatus.map((approvalStatus, index) => (
                    <div
                      key={index}
                      className="p-4 hover:bg-gray-50 cursor-pointer text-lg border-b border-gray-100 last:border-b-0"
                      onClick={() => handleapprovalStatusSelect(approvalStatus)}
                    >
                      {approvalStatus}
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
      </div>

      <button
        onClick={handleSave}
        className="bg-[#E53E3E] text-white w-full py-3.5 cursor-pointer rounded-lg hover:bg-[#D32F2F] transition-colors mt-5"
      >
        Save
      </button>
    </div>
  );
};

export default Basic;
