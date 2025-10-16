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
  subject: string;
  message: string;
  link: string;
  audience: string;
  attachment?: File | null;
}

const NewNotification: React.FC<NewNotificationProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<NotificationFormData>({
    subject: "",
    message: "",
    link: "",
    audience: "",
    attachment: null,
  });

  const [selectedAudience, setSelectedAudience] = useState("Select audience");
  const [isSelectAudienceModalOpen, setIsSelectAudienceModalOpen] =
    useState(false);

  const [errors, setErrors] = useState<{
    subject?: string;
    message?: string;
    audience?: string;
    link?: string;
    attachment?: string;
  }>({});

  const resetForm = () => {
    setFormData({
      subject: "",
      message: "",
      link: "",
      audience: "",
      attachment: null,
    });
    setSelectedAudience("Select audience");
    setIsSelectAudienceModalOpen(false);
    setErrors({});
    // clear the native file input if present
    const input = document.getElementById(
      "attachment"
    ) as HTMLInputElement | null;
    if (input) input.value = "";
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

  const handleAudienceSelect = (selectedUsers: string[]) => {
    const audienceText =
      selectedUsers.length > 0
        ? `${selectedUsers.length} users selected`
        : "Select audience";
    setSelectedAudience(audienceText);
    setFormData((prev) => ({
      ...prev,
      audience: selectedUsers.join(", "),
    }));
    setErrors((prev) => ({ ...prev, audience: undefined }));
    setIsSelectAudienceModalOpen(false);
  };

  const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
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
    if (!formData.subject.trim()) next.subject = "Subject is required.";
    if (!formData.message.trim()) next.message = "Message is required.";
    if (!formData.audience.trim()) next.audience = "Please select an audience.";
    if (formData.link.trim()) {
      try {
        // validates if provided
        new URL(formData.link.trim());
      } catch {
        next.link = "Provide a valid URL (e.g., https://example.com).";
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
            {/* Subject */}
            <div>
              <label className="block text-xl font-medium text-[#000] mb-2">
                Subject
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                placeholder="Message Subject"
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
                Message
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                placeholder="Type Message"
                rows={6}
                className={`w-full p-5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none ${
                  errors.message ? "border-red-400" : "border-gray-300"
                }`}
              />
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
                Audience
              </label>
              <button
                type="button"
                onClick={() => setIsSelectAudienceModalOpen(true)}
                className={`w-full p-5 cursor-pointer border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-left bg-white flex items-center justify-between ${
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
                  accept="image/*,application/pdf,.doc,.docx"
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

            {/* Send */}
            <button
              type="submit"
              className="w-full bg-[#E53E3E] text-white py-4 rounded-xl hover:bg-[#d32f2f] transition-colors font-medium cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={
                !formData.subject || !formData.message || !formData.audience || isLoading
              }
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Sending...
                </div>
              ) : (
                'Send'
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
