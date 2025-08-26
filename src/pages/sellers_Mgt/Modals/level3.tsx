import { useState } from "react";
import React from "react";
import images from "../../../constants/images";

interface Level3Props {
  onSaveAndClose?: () => void;
  onProceed?: () => void;
}

const Level3: React.FC<Level3Props> = ({ onSaveAndClose, onProceed }) => {
  // Separate dropdown states for each dropdown
  const [dropdownStates, setDropdownStates] = useState({
    businessType: false,
    storeAddress: false,
    deliveryPricing: false,
    approvalStatus: false,
  });
  const [selectedbusinessTypes, setSelectedbusinessTypes] = useState("");
  const [selectedstoreAddress, setSelectedstoreAddress] = useState("");
  const [selecteddeliveryPricing, setSelecteddeliveryPricing] = useState("");
  const [selectedapprovalStatus, setSelectedapprovalStatus] = useState("");
  const [selectedBrandColor, setSelectedBrandColor] = useState("");
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [errors, setErrors] = useState<{
    businessType?: string;
    storeAddress?: string;
    deliveryPricing?: string;
    approvalStatus?: string;
    video?: string;
  }>({});

  const businessTypes = ["Yes", "No"];
  const storeAddress = ["Address 1", "Address 2", "Address 3"];
  const deliveryPricing = ["Free upto 10 km", "Paid for more then 10 km"];
  const approvalStatus = ["Approved", "Pending", "Rejected"];

  // Brand colors array
  const brandColors = [
    "#E53E3E",
    "#0000FF",
    "#800080",
    "#008000",
    "#FFA500",
    "#FFA501",
    "#00FF48",
    "#4C1066",
    "#FBFF00",
    "#FF0066",
    "#374F23",
  ];

  const toggleDropdown = (dropdownName: keyof typeof dropdownStates) => {
    setDropdownStates((prev) => ({
      ...prev,
      [dropdownName]: !prev[dropdownName],
      // Close other dropdowns
      ...(Object.keys(prev) as Array<keyof typeof dropdownStates>).reduce(
        (acc, key) => {
          if (key !== dropdownName) {
            acc[key] = false;
          }
          return acc;
        },
        {} as Partial<typeof dropdownStates>
      ),
    }));
  };

  const handlebusinessTypesSelect = (businessType: string) => {
    setSelectedbusinessTypes(businessType);
    setDropdownStates((prev) => ({ ...prev, businessType: false }));
    if (errors.businessType) {
      setErrors((prev) => ({ ...prev, businessType: "" }));
    }
  };

  const handleapprovalStatusSelect = (approvalStatus: string) => {
    setSelectedapprovalStatus(approvalStatus);
    setDropdownStates((prev) => ({ ...prev, approvalStatus: false }));
    if (errors.approvalStatus) {
      setErrors((prev) => ({ ...prev, approvalStatus: "" }));
    }
  };

  const handlestoreAddressSelect = (storeAddress: string) => {
    setSelectedstoreAddress(storeAddress);
    setDropdownStates((prev) => ({ ...prev, storeAddress: false }));
    if (errors.storeAddress) {
      setErrors((prev) => ({ ...prev, storeAddress: "" }));
    }
  };

  const handledeliveryPricingSelect = (deliveryPricing: string) => {
    setSelecteddeliveryPricing(deliveryPricing);
    setDropdownStates((prev) => ({ ...prev, deliveryPricing: false }));
    if (errors.deliveryPricing) {
      setErrors((prev) => ({ ...prev, deliveryPricing: "" }));
    }
  };

  const handleBrandColorSelect = (color: string) => {
    setSelectedBrandColor(color);
  };

  // Handle video upload
  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file type
      const allowedTypes = [
        "video/mp4",
        "video/mp3",
        "video/mpeg",
        "video/quicktime",
        "video/x-msvideo",
      ];
      if (
        !allowedTypes.includes(file.type) &&
        !file.name.toLowerCase().match(/\.(mp4|mp3|mov|avi)$/)
      ) {
        setErrors((prev) => ({
          ...prev,
          video: "Please upload a valid video file (MP4, MP3, MOV, AVI)",
        }));
        return;
      }

      // Check file size (limit to 50MB)
      const maxSize = 50 * 1024 * 1024; // 50MB in bytes
      if (file.size > maxSize) {
        setErrors((prev) => ({
          ...prev,
          video: "File size should not exceed 50MB",
        }));
        return;
      }

      setSelectedVideo(file);
      if (errors.video) {
        setErrors((prev) => ({ ...prev, video: "" }));
      }
    }
  };

  // Form validation
  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!selectedbusinessTypes) {
      newErrors.businessType =
        "Please select if your business has a physical store";
    }
    if (!selectedstoreAddress) {
      newErrors.storeAddress = "Please select a store address";
    }
    if (!selecteddeliveryPricing) {
      newErrors.deliveryPricing = "Please select delivery pricing";
    }
    if (!selectedapprovalStatus) {
      newErrors.approvalStatus = "Please select approval status";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Save form data
  const saveFormData = () => {
    const dataToSave = {
      businessType: selectedbusinessTypes,
      storeAddress: selectedstoreAddress,
      deliveryPricing: selecteddeliveryPricing,
      approvalStatus: selectedapprovalStatus,
      brandColor: selectedBrandColor,
      storeVideo: selectedVideo?.name || null,
      level3Completed: true,
      submittedAt: new Date().toISOString(),
    };
    localStorage.setItem("level3FormData", JSON.stringify(dataToSave));
  };

  // Handle Save and Close
  const handleSaveAndClose = () => {
    if (validateForm()) {
      saveFormData();
      if (onSaveAndClose) {
        onSaveAndClose();
      } else {
        // Dispatch custom event for parent to listen to
        window.dispatchEvent(
          new CustomEvent("closeLevel3Modal", {
            detail: {
              saved: true,
              data: localStorage.getItem("level3FormData"),
            },
          })
        );

        // Try to find and click common modal close elements
        const closeSelectors = [
          "[data-modal-close]",
          ".modal-close",
          ".close-modal",
          '[aria-label="Close"]',
          ".modal-backdrop",
          ".overlay",
          ".modal .close",
        ];

        let modalClosed = false;
        for (const selector of closeSelectors) {
          const closeElement = document.querySelector(selector);
          if (closeElement) {
            (closeElement as HTMLElement).click();
            modalClosed = true;
            break;
          }
        }

        if (!modalClosed) {
          // Form is saved successfully, just log it
          console.log(
            "✅ Form saved successfully to localStorage. Modal needs to be closed by parent component."
          );
        }
      }
    }
  };

  // Handle Proceed
  const handleProceed = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      saveFormData();
      if (onProceed) {
        onProceed();
      } else {
        console.log("onProceed prop not provided");
      }
    }
  };

  return (
    <div>
      <form onSubmit={handleProceed}>
        <div className="mt-5">
          <label htmlFor="store" className="text-lg font-semibold">
            Does your business have a physical store
          </label>
          <div className="relative">
            <div
              className={`w-full border p-5 rounded-2xl text-lg flex flex-row justify-between items-center mt-3 cursor-pointer ${
                errors.businessType ? "border-red-500" : "border-[#989898]"
              }`}
              onClick={() => toggleDropdown("businessType")}
            >
              <div
                className={
                  selectedbusinessTypes ? "text-black" : "text-[#00000080]"
                }
              >
                {selectedbusinessTypes || "Select option"}
              </div>
              <div
                className={`transform transition-transform duration-200 ${
                  dropdownStates.businessType ? "rotate-90" : ""
                }`}
              >
                <img src={images?.rightarrow} alt="arrow" />
              </div>
            </div>

            {dropdownStates.businessType && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-[#989898] rounded-2xl shadow-lg max-h-60 overflow-y-auto">
                {businessTypes.map((businessType, index) => (
                  <div
                    key={index}
                    className="p-4 hover:bg-gray-50 cursor-pointer text-lg border-b border-gray-100 last:border-b-0"
                    onClick={() => handlebusinessTypesSelect(businessType)}
                  >
                    {businessType}
                  </div>
                ))}
              </div>
            )}
          </div>
          {errors.businessType && (
            <p className="text-red-500 text-sm mt-1">{errors.businessType}</p>
          )}
        </div>

        <div className="mt-5 ">
          <label htmlFor="videoOfStore" className="text-lg font-semibold">
            Upload 1 minute video of your store
          </label>
          <div className="flex flex-col mt-3 border w-full rounded-2xl p-10 cursor-pointer hover:bg-gray-50 transition-colors border-[#989898] ">
            <input
              type="file"
              id="videoOfStore"
              accept="video/mp4,video/mp3,video/*"
              className="hidden"
              onChange={handleVideoUpload}
            />
            <label
              htmlFor="videoOfStore"
              className="cursor-pointer w-full h-full flex flex-col items-center"
            >
              <div className="flex justify-center items-center">
                <img
                  className="max-w-full max-h-32 object-contain"
                  src={images.cam}
                  alt=""
                />
              </div>
              <div className="flex justify-center items-center mt-2 text-[#00000080] text-sm">
                {selectedVideo
                  ? selectedVideo.name
                  : "Upload 1 minute video of your store"}
              </div>
            </label>
          </div>
          {errors.video && (
            <p className="text-red-500 text-sm mt-1">{errors.video}</p>
          )}
        </div>
        <div className="mt-5">
          <label htmlFor="store" className="text-lg font-semibold">
            Add Store Addresses
          </label>
          <div className="relative">
            <div
              className={`w-full border p-5 rounded-2xl text-lg flex flex-row justify-between items-center mt-3 cursor-pointer ${
                errors.storeAddress ? "border-red-500" : "border-[#989898]"
              }`}
              onClick={() => toggleDropdown("storeAddress")}
            >
              <div
                className={
                  selectedstoreAddress ? "text-black" : "text-[#00000080]"
                }
              >
                {selectedstoreAddress || "Select option"}
              </div>
              <div
                className={`transform transition-transform duration-200 ${
                  dropdownStates.storeAddress ? "rotate-90" : ""
                }`}
              >
                <img src={images?.rightarrow} alt="arrow" />
              </div>
            </div>

            {dropdownStates.storeAddress && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-[#989898] rounded-2xl shadow-lg max-h-60 overflow-y-auto">
                {storeAddress.map((storeAddress, index) => (
                  <div
                    key={index}
                    className="p-4 hover:bg-gray-50 cursor-pointer text-lg border-b border-gray-100 last:border-b-0"
                    onClick={() => handlestoreAddressSelect(storeAddress)}
                  >
                    {storeAddress}
                  </div>
                ))}
              </div>
            )}
          </div>
          {errors.storeAddress && (
            <p className="text-red-500 text-sm mt-1">{errors.storeAddress}</p>
          )}
        </div>
        <div className="mt-5">
          <label htmlFor="store" className="text-lg font-semibold">
            Add Delivery Pricing
          </label>
          <div className="relative">
            <div
              className={`w-full border p-5 rounded-2xl text-lg flex flex-row justify-between items-center mt-3 cursor-pointer ${
                errors.deliveryPricing ? "border-red-500" : "border-[#989898]"
              }`}
              onClick={() => toggleDropdown("deliveryPricing")}
            >
              <div
                className={
                  selecteddeliveryPricing ? "text-black" : "text-[#00000080]"
                }
              >
                {selecteddeliveryPricing || "Select option"}
              </div>
              <div
                className={`transform transition-transform duration-200 ${
                  dropdownStates.deliveryPricing ? "rotate-90" : ""
                }`}
              >
                <img src={images?.rightarrow} alt="arrow" />
              </div>
            </div>

            {dropdownStates.deliveryPricing && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-[#989898] rounded-2xl shadow-lg max-h-60 overflow-y-auto">
                {deliveryPricing.map((deliveryPricing, index) => (
                  <div
                    key={index}
                    className="p-4 hover:bg-gray-50 cursor-pointer text-lg border-b border-gray-100 last:border-b-0"
                    onClick={() => handledeliveryPricingSelect(deliveryPricing)}
                  >
                    {deliveryPricing}
                  </div>
                ))}
              </div>
            )}
          </div>
          {errors.deliveryPricing && (
            <p className="text-red-500 text-sm mt-1">
              {errors.deliveryPricing}
            </p>
          )}
        </div>
        <div className="mt-5">
          <div className="text-lg">
            Select a color that suits your brand and your store shall be
            customized as such
          </div>
          <div className="flex flex-col mt-5 gap-5">
            <div className="flex flex-row justify-between">
              {brandColors.slice(0, 6).map((color, index) => (
                <div
                  key={index}
                  className={`w-15 h-15 rounded-full cursor-pointer transition-all duration-200 ${
                    selectedBrandColor === color
                      ? "border-4 border-black"
                      : "hover:border-2 hover:border-gray-300"
                  }`}
                  onClick={() => handleBrandColorSelect(color)}
                >
                  <div
                    className={`w-full h-full rounded-full ${
                      selectedBrandColor === color
                        ? "border-2 border-white"
                        : ""
                    }`}
                    style={{ backgroundColor: color }}
                  ></div>
                </div>
              ))}
            </div>
            <div className="flex flex-row gap-4.5">
              {brandColors.slice(6).map((color, index) => (
                <div
                  key={index + 6}
                  className={`w-15 h-15 rounded-full cursor-pointer transition-all duration-200 ${
                    selectedBrandColor === color
                      ? "border-4 border-black"
                      : "hover:border-2 hover:border-gray-300"
                  }`}
                  onClick={() => handleBrandColorSelect(color)}
                >
                  <div
                    className={`w-full h-full rounded-full ${
                      selectedBrandColor === color
                        ? "border-2 border-white"
                        : ""
                    }`}
                    style={{ backgroundColor: color }}
                  ></div>
                </div>
              ))}
            </div>
          </div>
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
            <p className="text-red-500 text-sm mt-1">{errors.approvalStatus}</p>
          )}
        </div>
        <div className="mt-5 flex flex-row justify-between">
          <button
            type="button"
            onClick={handleSaveAndClose}
            className="border border-[#E53E3E] rounded-2xl px-6 py-4 text-[#E53E3E] font-semibold text-lg cursor-pointer hover:bg-red-50 transition-colors"
          >
            Save and Close
          </button>
          <button
            type="submit"
            onClick={handleProceed}
            className="bg-[#E53E3E] rounded-2xl px-24 py-4 cursor-pointer text-white text-lg font-semibold hover:bg-red-600 transition-colors"
          >
            Proceed
          </button>
        </div>
      </form>
    </div>
  );
};

export default Level3;
