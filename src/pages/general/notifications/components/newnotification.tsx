import React, { useState } from "react";
import images from "../../../../constants/images";
import SelectAudience from "./selectaudience";

interface NewNotificationProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: NotificationFormData) => void;
  isLoading?: boolean;
}

interface NotificationFormData {
  title: string;
  message: string;
  link: string;
  audience_type: "all" | "buyers" | "sellers" | "specific";
  target_user_ids?: number[];
  scheduled_for?: string;
}

const NewNotification: React.FC<NewNotificationProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<NotificationFormData>({
    title: "",
    message: "",
    link: "",
    audience_type: "all",
    target_user_ids: [],
    scheduled_for: undefined,
  });

  const [selectedAudience, setSelectedAudience] = useState("All Users");
  const [isSelectAudienceModalOpen, setIsSelectAudienceModalOpen] =
    useState(false);

  const [errors, setErrors] = useState<{
    subject?: string;
    message?: string;
    audience?: string;
    link?: string;
    scheduled_for?: string;
  }>({});

  const resetForm = () => {
    setFormData({
      title: "",
      message: "",
      link: "",
      audience_type: "all",
      target_user_ids: [],
      scheduled_for: undefined,
    });
    setSelectedAudience("All Users");
    setIsSelectAudienceModalOpen(false);
    setErrors({});
    const scheduledInput = document.getElementById(
      "scheduled_for"
    ) as HTMLInputElement | null;
    if (scheduledInput) scheduledInput.value = "";
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleAudienceTypeChange = (type: "all" | "buyers" | "sellers" | "specific") => {
    setFormData((prev) => ({
      ...prev,
      audience_type: type,
      target_user_ids: type === "specific" ? prev.target_user_ids : [],
    }));
    
    if (type === "specific") {
      setIsSelectAudienceModalOpen(true);
    } else {
      setSelectedAudience(
        type === "all" ? "All Users" :
        type === "buyers" ? "All Buyers" :
        "All Sellers"
      );
      setErrors((prev) => ({ ...prev, audience: undefined }));
    }
  };

  const handleAudienceSelect = (selectedUsers: string[]) => {
    const userIds = selectedUsers.map(id => parseInt(id)).filter(id => !isNaN(id));
    const audienceText =
      userIds.length > 0
        ? `${userIds.length} users selected`
        : "Select specific users";
    setSelectedAudience(audienceText);
    setFormData((prev) => ({
      ...prev,
      target_user_ids: userIds,
      audience_type: userIds.length > 0 ? "specific" : "all",
    }));
    setErrors((prev) => ({ ...prev, audience: undefined }));
    setIsSelectAudienceModalOpen(false);
  };


  const validate = () => {
    const next: typeof errors = {};
    if (!formData.title.trim()) next.subject = "Title is required.";
    if (!formData.message.trim()) next.message = "Message is required.";
    if (formData.message.length > 1000) next.message = "Message must be less than 1000 characters.";
    if (formData.audience_type === "specific" && (!formData.target_user_ids || formData.target_user_ids.length === 0)) {
      next.audience = "Please select at least one user for specific audience.";
    }
    if (formData.link && formData.link.trim()) {
      try {
        new URL(formData.link.trim());
      } catch {
        next.link = "Provide a valid URL (e.g., https://example.com).";
      }
    }
    if (formData.scheduled_for) {
      const scheduledDate = new Date(formData.scheduled_for);
      const now = new Date();
      if (scheduledDate <= now) {
        next.scheduled_for = "Scheduled date must be in the future.";
      }
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit?.(formData);
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 bg-[#00000080] flex justify-end">
      <div className="bg-white w-[500px] relative h-full overflow-y-auto">
        {/* Header */}
        <div className="border-b border-[#787878] px-3 py-3 sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">New Notification</h2>
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
            {/* Title */}
            <div>
              <label className="block text-xl font-medium text-[#000] mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Notification Title"
                maxLength={255}
                className={`w-full p-5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent placeholder-gray-400 text-sm ${
                  errors.subject ? "border-red-400" : "border-gray-300"
                }`}
              />
              {errors.subject && (
                <p className="mt-2 text-sm text-red-500">{errors.subject}</p>
              )}
            </div>

            {/* Message */}
            <div>
              <label className="block text-xl font-medium text-[#000] mb-2">
                Message <span className="text-red-500">*</span>
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                placeholder="Type Message"
                rows={6}
                maxLength={1000}
                className={`w-full p-5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none ${
                  errors.message ? "border-red-400" : "border-gray-300"
                }`}
              />
              <div className="mt-1 text-xs text-gray-500 text-right">
                {formData.message.length}/1000 characters
              </div>
              {errors.message && (
                <p className="mt-2 text-sm text-red-500">{errors.message}</p>
              )}
            </div>

            {/* Link (optional) */}
            <div>
              <label className="block text-xl font-medium text-[#000] mb-2">
                Link
              </label>
              <input
                type="url"
                name="link"
                value={formData.link}
                onChange={handleInputChange}
                placeholder="Add link (optional)"
                className={`w-full p-5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                  errors.link ? "border-red-400" : "border-gray-300"
                }`}
              />
              {errors.link && (
                <p className="mt-2 text-sm text-red-500">{errors.link}</p>
              )}
            </div>

            {/* Audience */}
            <div>
              <label className="block text-xl font-medium text-[#000] mb-2">
                Audience <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleAudienceTypeChange("all")}
                    className={`p-3 border rounded-xl text-sm font-medium transition-colors ${
                      formData.audience_type === "all"
                        ? "bg-[#E53E3E] text-white border-[#E53E3E]"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    All Users
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAudienceTypeChange("buyers")}
                    className={`p-3 border rounded-xl text-sm font-medium transition-colors ${
                      formData.audience_type === "buyers"
                        ? "bg-[#E53E3E] text-white border-[#E53E3E]"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    All Buyers
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAudienceTypeChange("sellers")}
                    className={`p-3 border rounded-xl text-sm font-medium transition-colors ${
                      formData.audience_type === "sellers"
                        ? "bg-[#E53E3E] text-white border-[#E53E3E]"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    All Sellers
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAudienceTypeChange("specific")}
                    className={`p-3 border rounded-xl text-sm font-medium transition-colors ${
                      formData.audience_type === "specific"
                        ? "bg-[#E53E3E] text-white border-[#E53E3E]"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    Specific Users
                  </button>
                </div>
                {formData.audience_type === "specific" && (
                  <button
                    type="button"
                    onClick={() => setIsSelectAudienceModalOpen(true)}
                    className={`w-full p-3 cursor-pointer border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-left bg-white flex items-center justify-between ${
                      errors.audience ? "border-red-400" : "border-gray-300"
                    }`}
                  >
                    <span className={formData.target_user_ids && formData.target_user_ids.length > 0 ? "text-gray-900" : "text-gray-400"}>
                      {formData.target_user_ids && formData.target_user_ids.length > 0
                        ? `${formData.target_user_ids.length} users selected`
                        : "Click to select specific users"}
                    </span>
                    <svg
                      className="w-4 h-4 text-gray-400"
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
                )}
              </div>
              {errors.audience && (
                <p className="mt-2 text-sm text-red-500">{errors.audience}</p>
              )}
            </div>

            {/* Scheduled For (Optional) */}
            <div>
              <label className="block text-xl font-medium text-[#000] mb-2">
                Schedule Notification (Optional)
              </label>
              <input
                type="datetime-local"
                id="scheduled_for"
                name="scheduled_for"
                value={formData.scheduled_for || ""}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, scheduled_for: e.target.value }));
                  setErrors((prev) => ({ ...prev, scheduled_for: undefined }));
                }}
                min={new Date().toISOString().slice(0, 16)}
                className={`w-full p-5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                  errors.scheduled_for ? "border-red-400" : "border-gray-300"
                }`}
              />
              {errors.scheduled_for && (
                <p className="mt-2 text-sm text-red-500">{errors.scheduled_for}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Leave empty to send immediately
              </p>
            </div>

            {/* Send */}
            <button
              type="submit"
              className="w-full bg-[#E53E3E] text-white py-4 rounded-xl hover:bg-[#d32f2f] transition-colors font-medium cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={
                !formData.title || !formData.message || 
                (formData.audience_type === "specific" && (!formData.target_user_ids || formData.target_user_ids.length === 0)) ||
                isLoading
              }
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  {formData.scheduled_for ? "Scheduling..." : "Sending..."}
                </div>
              ) : (
                formData.scheduled_for ? 'Schedule Notification' : 'Send Notification'
              )}
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

export default NewNotification;
