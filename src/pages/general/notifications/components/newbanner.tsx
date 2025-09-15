import React, { useState } from "react";
import SelectAudience from "./selectaudience";
import images from "../../../../constants/images";

interface NewBannerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: BannerFormData) => void;
}

interface BannerFormData {
  image: File | null;
  audience: string;
  link: string;
}

const NewBanner: React.FC<NewBannerProps> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState<BannerFormData>({
    image: null,
    audience: "",
    link: "",
  });

  const [selectedAudience, setSelectedAudience] = useState("Select audience");
  const [isSelectAudienceModalOpen, setIsSelectAudienceModalOpen] =
    useState(false);
  const [errors, setErrors] = useState<{
    image?: string;
    audience?: string;
    link?: string;
  }>({});

  const resetForm = () => {
    setFormData({ image: null, audience: "", link: "" });
    setSelectedAudience("Select audience");
    setIsSelectAudienceModalOpen(false);
    setErrors({});
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, image: file }));
    setErrors((prev) => ({ ...prev, image: undefined }));
  };

  const handleAudienceSelect = (selectedUsers: string[]) => {
    const audienceText =
      selectedUsers.length > 0
        ? `${selectedUsers.length} users selected`
        : "Select audience";
    setSelectedAudience(audienceText);
    setFormData((prev) => ({ ...prev, audience: selectedUsers.join(", ") }));
    setErrors((prev) => ({ ...prev, audience: undefined }));
    setIsSelectAudienceModalOpen(false);
  };

  const validate = () => {
    const newErrors: { image?: string; audience?: string; link?: string } = {};
    if (!formData.image) newErrors.image = "Please choose an image.";
    if (!formData.audience) newErrors.audience = "Please select an audience.";
    if (!formData.link) newErrors.link = "Please add a link.";
    else {
      try {
        new URL(formData.link);
      } catch {
        newErrors.link =
          "Please provide a valid URL (e.g., https://example.com).";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit?.(formData);
    resetForm();
    onClose();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const fileSize = (bytes?: number) =>
    typeof bytes === "number"
      ? bytes < 1024
        ? `${bytes} B`
        : bytes < 1024 * 1024
        ? `${(bytes / 1024).toFixed(1)} KB`
        : `${(bytes / (1024 * 1024)).toFixed(1)} MB`
      : "";

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 bg-[#00000080] bg-opacity-50 flex justify-end">
      <div className="bg-white w-[500px] relative h-full overflow-y-auto">
        {/* Header */}
        <div className="border-b border-[#787878] px-3 py-3 sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">New Banner</h2>
            <div className="flex flex-row items-center gap-3">
              <button
                onClick={handleClose}
                className="p-2 rounded-md cursor-pointer"
                aria-label="Close"
              >
                <img className="w-7 h-7" src={images.close} alt="Close" />
              </button>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="p-5">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Image Upload Field */}
            <div>
              <label className="block text-xl font-medium text-[#000] mb-2">
                Image
              </label>

              <div
                className={`rounded-xl p-5 border-2 ${
                  errors.image ? "border-red-400" : "border-gray-300"
                }`}
              >
                {/* Hidden input */}
                <input
                  type="file"
                  id="bannerImage"
                  name="image"
                  onChange={handleImageChange}
                  className="hidden"
                  accept="image/*"
                />

                {!formData.image ? (
                  // Idle state (no image selected)
                  <label
                    htmlFor="bannerImage"
                    className="w-full flex flex-col items-center justify-center cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-3">
                      <svg
                        className="w-8 h-8 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <span className="text-sm text-gray-500">
                      Click to choose an image
                    </span>
                  </label>
                ) : (
                  // Uploaded state (compact, no big preview)
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6 text-green-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {formData.image.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          Uploaded • {fileSize(formData.image.size)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {errors.image && (
                <p className="mt-2 text-sm text-red-500">{errors.image}</p>
              )}
            </div>

            {/* Audience Selection */}
            <div>
              <label className="block text-xl font-medium text-[#000] mb-2">
                Audience
              </label>
              <button
                type="button"
                onClick={() => setIsSelectAudienceModalOpen(true)}
                className={`w-full p-5 border rounded-xl cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-left bg-white flex items-center justify-between ${
                  errors.audience ? "border-red-400" : "border-gray-300"
                }`}
              >
                <span
                  className={
                    selectedAudience === "Select audience"
                      ? "text-gray-400"
                      : "text-gray-900"
                  }
                >
                  {selectedAudience}
                </span>
                <svg
                  className="w-4 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {errors.audience && (
                <p className="mt-2 text-sm text-red-500">{errors.audience}</p>
              )}
            </div>

            {/* Link Field */}
            <div>
              <label className="block text-xl font-medium text-[#000] mb-2">
                Link
              </label>
              <input
                type="url"
                name="link"
                value={formData.link}
                onChange={handleInputChange}
                placeholder="Add link"
                className={`w-full p-5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent placeholder-gray-400 ${
                  errors.link ? "border-red-400" : "border-gray-300"
                }`}
              />
              {errors.link && (
                <p className="mt-2 text-sm text-red-500">{errors.link}</p>
              )}
            </div>

            {/* Send Button */}
            <button
              type="submit"
              className="w-full py-4 mt-2 bg-[#E53E3E] text-white rounded-xl hover:bg-[#d32f2f] transition-colors font-medium cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={!formData.image || !formData.audience || !formData.link}
            >
              Send
            </button>
          </form>
        </div>
      </div>

      {/* Select Audience Modal */}
      <SelectAudience
        isOpen={isSelectAudienceModalOpen}
        onClose={() => setIsSelectAudienceModalOpen(false)}
        onApply={handleAudienceSelect}
      />
    </div>
  );
};

export default NewBanner;
