import images from "../../../constants/images";
import { useState, useEffect, useRef } from "react";
import React from "react";

interface Level2Props {
  onSaveAndClose: () => void;
  onProceed: () => void;
}

const Level2: React.FC<Level2Props> = ({ onSaveAndClose, onProceed }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedbusinessTypes, setSelectedbusinessTypes] = useState("");
  const [formData, setFormData] = useState({
    businessName: "",
    businessType: "",
    ninNumber: "",
    cacNumber: "",
    ninSlip: null as File | null,
    cacCertificate: null as File | null,
  });
  const [ninSlipPreview, setNinSlipPreview] = useState<string>("");
  const [cacCertificatePreview, setCacCertificatePreview] =
    useState<string>("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const ninSlipInputRef = useRef<HTMLInputElement>(null);
  const cacCertificateInputRef = useRef<HTMLInputElement>(null);

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem("level2FormData");
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      setFormData(parsedData);
      setSelectedbusinessTypes(parsedData.businessType || "");
    }
  }, []);

  const businessTypes = [
    "Electronics",
    "Phones & Accessories",
    "Fashion & Clothing",
    "Home & Garden",
    "Sports & Fitness",
    "Books & Media",
    "Beauty & Health",
    "Automotive",
    "Toys & Games",
    "Food & Beverages",
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleFileUpload = (
    field: "ninSlip" | "cacCertificate",
    file: File
  ) => {
    setFormData((prev) => ({ ...prev, [field]: file }));

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (field === "ninSlip") {
        setNinSlipPreview(result);
      } else {
        setCacCertificatePreview(result);
      }
    };
    reader.readAsDataURL(file);

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.businessName.trim()) {
      newErrors.businessName = "Business name is required";
    }
    if (!formData.businessType) {
      newErrors.businessType = "Business type is required";
    }
    if (!formData.ninNumber.trim()) {
      newErrors.ninNumber = "NIN number is required";
    }
    if (!formData.cacNumber.trim()) {
      newErrors.cacNumber = "CAC number is required";
    }
    if (!formData.ninSlip) {
      newErrors.ninSlip = "NIN slip is required";
    }
    if (!formData.cacCertificate) {
      newErrors.cacCertificate = "CAC certificate is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveFormData = () => {
    const dataToSave = {
      ...formData,
      ninSlip: formData.ninSlip?.name || null,
      cacCertificate: formData.cacCertificate?.name || null,
    };
    localStorage.setItem("level2FormData", JSON.stringify(dataToSave));
  };

  const handleSaveAndClose = () => {
    if (validateForm()) {
      saveFormData();
      onSaveAndClose();
    }
  };

  const handleProceed = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      saveFormData();
      onProceed();
    }
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handlebusinessTypesSelect = (businessType: string) => {
    setSelectedbusinessTypes(businessType);
    setFormData((prev) => ({ ...prev, businessType }));
    setIsDropdownOpen(false);
    if (errors.businessType) {
      setErrors((prev) => ({ ...prev, businessType: "" }));
    }
  };

  return (
    <>
      <div>
        <div className="mt-5">
          <form onSubmit={handleProceed}>
            <div className="">
              <label htmlFor="businessName" className="text-lg font-semibold">
                Business Name
              </label>
              <input
                type="text"
                id="businessName"
                name="businessName"
                value={formData.businessName}
                onChange={handleInputChange}
                placeholder="Enter Business Name"
                className={`w-full mt-3 border p-5 rounded-2xl text-lg ${
                  errors.businessName ? "border-red-500" : "border-[#989898]"
                }`}
                required
              />
              {errors.businessName && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.businessName}
                </p>
              )}
            </div>
            <div className="mt-5">
              <label htmlFor="category" className="text-lg font-semibold">
                Business type
              </label>
              <div className="relative">
                <div
                  className={`w-full border p-5 rounded-2xl text-lg flex flex-row justify-between items-center mt-3 cursor-pointer ${
                    errors.businessType ? "border-red-500" : "border-[#989898]"
                  }`}
                  onClick={toggleDropdown}
                >
                  <div
                    className={
                      selectedbusinessTypes ? "text-black" : "text-[#00000080]"
                    }
                  >
                    {selectedbusinessTypes || "Select Business type"}
                  </div>
                  <div
                    className={`transform transition-transform duration-200 ${
                      isDropdownOpen ? "rotate-90" : ""
                    }`}
                  >
                    <img src={images.rightarrow} alt="" />
                  </div>
                </div>

                {isDropdownOpen && (
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
                <p className="text-red-500 text-sm mt-1">
                  {errors.businessType}
                </p>
              )}
            </div>
            <div className="mt-5">
              <label htmlFor="ninNumber" className="text-lg font-semibold">
                NIN Number
              </label>
              <input
                type="text"
                id="ninNumber"
                name="ninNumber"
                value={formData.ninNumber}
                onChange={handleInputChange}
                placeholder="Enter NIN Number"
                className={`w-full mt-3 border p-5 rounded-2xl text-lg ${
                  errors.ninNumber ? "border-red-500" : "border-[#989898]"
                }`}
                required
              />
              {errors.ninNumber && (
                <p className="text-red-500 text-sm mt-1">{errors.ninNumber}</p>
              )}
            </div>
            <div className="mt-5">
              <label htmlFor="cacNumber" className="text-lg font-semibold">
                CAC Number
              </label>
              <input
                type="text"
                id="cacNumber"
                name="cacNumber"
                value={formData.cacNumber}
                onChange={handleInputChange}
                placeholder="Enter CAC Number"
                className={`w-full mt-3 border p-5 rounded-2xl text-lg ${
                  errors.cacNumber ? "border-red-500" : "border-[#989898]"
                }`}
                required
              />
              {errors.cacNumber && (
                <p className="text-red-500 text-sm mt-1">{errors.cacNumber}</p>
              )}
            </div>
            <div className="mt-5">
              <label htmlFor="ninSlip" className="text-lg font-semibold">
                Upload NIN Slip
              </label>
              <input
                type="file"
                id="ninSlip"
                ref={ninSlipInputRef}
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload("ninSlip", file);
                }}
                className="hidden"
              />
              <div
                className={`flex flex-col mt-3 border w-full rounded-2xl p-10 cursor-pointer hover:bg-gray-50 transition-colors ${
                  errors.ninSlip ? "border-red-500" : "border-[#989898]"
                }`}
                onClick={() => ninSlipInputRef.current?.click()}
              >
                <div className="flex justify-center items-center">
                  {ninSlipPreview ? (
                    <img
                      src={ninSlipPreview}
                      alt="NIN Slip Preview"
                      className="max-w-full max-h-32 object-contain"
                    />
                  ) : (
                    <img src={images.cam} alt="" />
                  )}
                </div>
                <div className="flex justify-center items-center mt-2 text-[#00000080] text-sm">
                  {formData.ninSlip
                    ? formData.ninSlip.name
                    : "Upload a clear picture of your NIN Slip"}
                </div>
              </div>
              {errors.ninSlip && (
                <p className="text-red-500 text-sm mt-1">{errors.ninSlip}</p>
              )}
            </div>
            <div className="mt-5">
              <label htmlFor="cacSlip" className="text-lg font-semibold">
                Upload CAC Certificate
              </label>
              <input
                type="file"
                id="cacCertificate"
                ref={cacCertificateInputRef}
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload("cacCertificate", file);
                }}
                className="hidden"
              />
              <div
                className={`flex flex-col mt-3 border w-full rounded-2xl p-10 cursor-pointer hover:bg-gray-50 transition-colors ${
                  errors.cacCertificate ? "border-red-500" : "border-[#989898]"
                }`}
                onClick={() => cacCertificateInputRef.current?.click()}
              >
                <div className="flex justify-center items-center">
                  {cacCertificatePreview ? (
                    <img
                      src={cacCertificatePreview}
                      alt="CAC Certificate Preview"
                      className="max-w-full max-h-32 object-contain"
                    />
                  ) : (
                    <img src={images.cam} alt="" />
                  )}
                </div>
                <div className="flex justify-center items-center mt-2 text-[#00000080] text-sm">
                  {formData.cacCertificate
                    ? formData.cacCertificate.name
                    : "Upload a clear picture of your CAC Certificate"}
                </div>
              </div>
              {errors.cacCertificate && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.cacCertificate}
                </p>
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
                className="bg-[#E53E3E] rounded-2xl px-24 py-4 cursor-pointer text-white text-lg font-semibold hover:bg-red-600 transition-colors"
              >
                Proceed
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Level2;
