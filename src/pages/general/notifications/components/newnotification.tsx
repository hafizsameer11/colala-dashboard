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
  attachment?: File | null;
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
    attachment: null,
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
    attachment?: string;
    scheduled_for?: string;
  }>({});

  const resetForm = () => {
    setFormData({
      title: "",
      message: "",
      link: "",
      audience_type: "all",
      target_user_ids: [],
      attachment: null,
      scheduled_for: undefined,
    });
    setSelectedAudience("All Users");
    setIsSelectAudienceModalOpen(false);
    setErrors({});
    // clear the native file input if present
    const input = document.getElementById(
      "attachment"
    ) as HTMLInputElement | null;
    if (input) input.value = "";
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

  const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
      const maxSize = 10 * 1024 * 1024; // 10MB
      
      if (!allowedTypes.includes(file.type)) {
        setErrors((prev) => ({ 
          ...prev, 
          attachment: "File must be jpg, jpeg, png, gif, or pdf" 
        }));
        return;
      }
      
      if (file.size > maxSize) {
        setErrors((prev) => ({ 
          ...prev, 
          attachment: "File size must be less than 10MB" 
        }));
        return;
      }
    }
    
    setFormData((prev) => ({ ...prev, attachment: file }));
    setErrors((prev) => ({ ...prev, attachment: undefined }));
  };

  const removeAttachment = () => {
    const input = document.getElementById(
      "attachment"
    ) as HTMLInputElement | null;
    if (input) input.value = "";
    setFormData((prev) => ({ ...prev, attachment: null }));
  };

  const fileSize = (bytes?: number) =>
    typeof bytes === "number"
      ? bytes < 1024
        ? `${bytes} B`
        : bytes < 1024 * 1024
        ? `${(bytes / 1024).toFixed(1)} KB`
        : `${(bytes / (1024 * 1024)).toFixed(1)} MB`
      : "";

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

            {/* Attachment (compact uploaded state with tick + remove) */}
            <div>
              <label className="block text-xl font-medium text-[#000] mb-2">
                Attachment
              </label>

              <div
                className={`rounded-xl p-5 border ${
                  errors.attachment ? "border-red-400" : "border-gray-300"
                }`}
              >
                <input
                  type="file"
                  id="attachment"
                  name="attachment"
                  onChange={handleAttachmentChange}
                  className="hidden"
                  accept="image/jpeg,image/jpg,image/png,image/gif,application/pdf"
                />

                {!formData.attachment ? (
                  <label
                    htmlFor="attachment"
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
                      Click to add attachment
                    </span>
                  </label>
                ) : (
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
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
                        <p
                          className="text-sm font-medium text-gray-900 truncate"
                          title={formData.attachment.name}
                        >
                          {formData.attachment.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          Uploaded • {fileSize(formData.attachment.size)}
                        </p>
                      </div>
                    </div>
                    <div className="shrink-0 flex gap-2">
                      <label
                        htmlFor="attachment"
                        className="px-3 py-1.5 text-sm rounded-md border border-gray-300 hover:bg-gray-50 cursor-pointer"
                        title="Replace"
                      >
                        Replace
                      </label>
                      <button
                        type="button"
                        onClick={removeAttachment}
                        className="px-3 py-1.5 text-sm rounded-md border border-red-300 text-red-600 hover:bg-red-50"
                        title="Remove"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {errors.attachment && (
                <p className="mt-2 text-sm text-red-500">{errors.attachment}</p>
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
