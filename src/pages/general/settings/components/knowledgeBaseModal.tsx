import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import images from "../../../../constants/images";

interface KnowledgeBaseItem {
  id: number;
  title: string;
  description: string;
  type: "general" | "buyer" | "seller";
  url: string | null;
  video: string | null;
  media_url: string | null;
  is_active: boolean;
  view_count: number;
  created_by: {
    id: number;
    name: string;
    email: string;
  };
  created_at: string;
  updated_at: string;
}

interface KnowledgeBaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (kbData: {
    title: string;
    description?: string;
    type: "general" | "buyer" | "seller";
    url?: string;
    video?: File | null;
    is_active?: boolean;
  }) => void;
  editingItem?: KnowledgeBaseItem | null;
}

const KnowledgeBaseModal: React.FC<KnowledgeBaseModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingItem,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "general" as "general" | "buyer" | "seller",
    url: "",
    is_active: true,
  });

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"url" | "video">("url");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Escape key to close
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) handleClose();
    };
    if (isOpen) document.addEventListener("keydown", handleEscapeKey);
    return () => document.removeEventListener("keydown", handleEscapeKey);
  }, [isOpen]);

  // Cleanup preview URL
  useEffect(() => {
    return () => {
      if (videoPreview) URL.revokeObjectURL(videoPreview);
    };
  }, [videoPreview]);

  // Reset form when modal opens/closes or editing item changes
  useEffect(() => {
    if (isOpen) {
      if (editingItem) {
        setFormData({
          title: editingItem.title,
          description: editingItem.description || "",
          type: editingItem.type,
          url: editingItem.url || "",
          is_active: editingItem.is_active,
        });
        // Determine media type based on what exists
        if (editingItem.video) {
          setMediaType("video");
          setVideoPreview(`https://colala.hmstech.xyz/storage/${editingItem.video}`);
        } else if (editingItem.url) {
          setMediaType("url");
        } else {
          setMediaType("url");
        }
        setVideoFile(null);
      } else {
        setFormData({
          title: "",
          description: "",
          type: "general",
          url: "",
          is_active: true,
        });
        setVideoPreview(null);
        setVideoFile(null);
        setMediaType("url");
      }
    }
  }, [isOpen, editingItem]);

  const triggerFilePicker = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;

    // Basic validation
    const allowed = ["video/mp4", "video/avi", "video/mov", "video/wmv", "video/flv", "video/webm"];
    const maxBytes = 50 * 1024 * 1024; // 50MB

    if (!allowed.includes(file.type)) {
      alert("Please select a valid video file (mp4, avi, mov, wmv, flv, webm).");
      e.target.value = "";
      return;
    }
    if (file.size > maxBytes) {
      alert("Video too large. Max size is 50MB.");
      e.target.value = "";
      return;
    }

    // set state + preview
    if (videoPreview) URL.revokeObjectURL(videoPreview);
    const url = URL.createObjectURL(file);
    setVideoFile(file);
    setVideoPreview(url);
    setMediaType("video");
  };

  const clearVideo = () => {
    if (videoPreview) URL.revokeObjectURL(videoPreview);
    setVideoFile(null);
    setVideoPreview(null);
    setMediaType("url");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.title.trim()) {
      alert("Please enter a title");
      return;
    }

    if (mediaType === "url" && !formData.url.trim()) {
      alert("Please enter a URL");
      return;
    }

    if (mediaType === "video" && !videoFile && !videoPreview && !editingItem?.video) {
      alert("Please upload a video");
      return;
    }

    onSave({ 
      ...formData, 
      video: mediaType === "video" ? videoFile : null,
      url: mediaType === "url" ? formData.url : "",
    });
    handleClose();
  };

  const handleClose = () => {
    setFormData({ title: "", description: "", type: "general", url: "", is_active: true });
    clearVideo();
    onClose();
  };

  if (!isOpen) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-100 bg-[#00000080] bg-opacity-50 flex justify-end"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        className="bg-white w-[500px] relative h-full overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center p-5 border-b border-[#787878] justify-between mb-6">
          <h2 className="font-semibold text-gray-900">
            {editingItem ? "Edit Knowledge Base Item" : "Add New Knowledge Base Item"}
          </h2>
          <button
            onClick={handleClose}
            className="cursor-pointer transition-colors"
          >
            <img src={images.close} alt="Close" className="w-8 h-8" />
          </button>
        </div>

        <div className="p-5">
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-xl font-medium text-[#000] mb-2.5">
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter title"
                className="w-full p-5 border border-gray-300 rounded-xl text-md focus:outline-none focus:ring-2 focus:ring-[#E53E3E] focus:border-transparent placeholder-gray-400"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xl font-medium text-[#000] mb-2.5">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter description"
                rows={4}
                className="w-full p-5 border border-gray-300 rounded-xl text-md focus:outline-none focus:ring-2 focus:ring-[#E53E3E] focus:border-transparent placeholder-gray-400 resize-none"
              />
            </div>

            {/* Type */}
            <div>
              <label className="block text-xl font-medium text-[#000] mb-2.5">
                Type *
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full p-5 border border-gray-300 rounded-xl text-md focus:outline-none focus:ring-2 focus:ring-[#E53E3E] focus:border-transparent bg-white"
                required
              >
                <option value="general">General</option>
                <option value="buyer">Buyer</option>
                <option value="seller">Seller</option>
              </select>
            </div>

            {/* Media Type Toggle */}
            <div>
              <label className="block text-xl font-medium text-[#000] mb-2.5">
                Media Type *
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setMediaType("url");
                    clearVideo();
                  }}
                  className={`flex-1 p-3 border-2 rounded-xl font-medium transition-colors ${
                    mediaType === "url"
                      ? "border-[#E53E3E] bg-[#E53E3E] text-white"
                      : "border-gray-300 bg-white text-gray-700"
                  }`}
                >
                  URL
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMediaType("video");
                    setFormData((prev) => ({ ...prev, url: "" }));
                  }}
                  className={`flex-1 p-3 border-2 rounded-xl font-medium transition-colors ${
                    mediaType === "video"
                      ? "border-[#E53E3E] bg-[#E53E3E] text-white"
                      : "border-gray-300 bg-white text-gray-700"
                  }`}
                >
                  Video File
                </button>
              </div>
            </div>

            {/* URL Input */}
            {mediaType === "url" && (
              <div>
                <label className="block text-xl font-medium text-[#000] mb-2.5">
                  URL *
                </label>
                <input
                  type="url"
                  name="url"
                  value={formData.url}
                  onChange={handleInputChange}
                  placeholder="https://example.com"
                  className="w-full p-5 border border-gray-300 rounded-xl text-md focus:outline-none focus:ring-2 focus:ring-[#E53E3E] focus:border-transparent placeholder-gray-400"
                  required={mediaType === "url"}
                />
              </div>
            )}

            {/* Video Upload */}
            {mediaType === "video" && (
              <div>
                <label className="block text-xl font-medium text-[#000] mb-2.5">
                  Video File *
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={triggerFilePicker}
                    className="w-full p-5 border border-gray-300 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer text-left"
                  >
                    {videoPreview ? (
                      <span className="text-gray-900">Video selected</span>
                    ) : (
                      <span className="text-gray-500">Click to upload video (Max 50MB)</span>
                    )}
                  </button>

                  {videoPreview && (
                    <button
                      type="button"
                      onClick={clearVideo}
                      className="absolute right-2 top-2 bg-white border border-gray-300 rounded-full p-1 shadow cursor-pointer"
                      title="Remove video"
                    >
                      <svg
                        className="w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/mp4,video/avi,video/mov,video/wmv,video/flv,video/webm"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>
              </div>
            )}

            {/* Active Status */}
            <div>
              <label className="block text-xl font-medium text-[#000] mb-2.5">
                Status
              </label>
              <select
                name="is_active"
                value={formData.is_active ? "1" : "0"}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, is_active: e.target.value === "1" }));
                }}
                className="w-full p-5 border border-gray-300 rounded-xl text-md focus:outline-none focus:ring-2 focus:ring-[#E53E3E] focus:border-transparent bg-white"
              >
                <option value="1">Active</option>
                <option value="0">Inactive</option>
              </select>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-[#E53E3E] cursor-pointer text-white py-4 rounded-xl font-medium hover:bg-[#D32F2F] transition-colors mt-6"
            >
              {editingItem ? "Update Item" : "Add Item"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default KnowledgeBaseModal;

