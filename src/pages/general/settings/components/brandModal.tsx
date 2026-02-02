import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import images from "../../../../constants/images";

interface Brand {
  id: number;
  name: string;
  slug: string;
  logo: string;
  description: string;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
}

interface BrandModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (brandData: {
    name: string;
    description: string;
    logo?: File | null;
    status: "active" | "inactive";
  }) => void;
  editingBrand?: Brand | null;
}

const BrandModal: React.FC<BrandModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingBrand,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "active" as "active" | "inactive",
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
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
      if (logoPreview) URL.revokeObjectURL(logoPreview);
    };
  }, [logoPreview]);

  // Reset form when modal opens/closes or editing brand changes
  useEffect(() => {
    if (isOpen) {
      if (editingBrand) {
        setFormData({
          name: editingBrand.name,
          description: editingBrand.description,
          status: editingBrand.status,
        });
        setLogoPreview(editingBrand.logo ? `hhttps://api.colalamall.com/storage/${editingBrand.logo}` : null);
        setLogoFile(null);
      } else {
        setFormData({
          name: "",
          description: "",
          status: "active",
        });
        setLogoPreview(null);
        setLogoFile(null);
      }
    }
  }, [isOpen, editingBrand]);

  const triggerFilePicker = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;

    // Basic validation
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    const maxBytes = 2 * 1024 * 1024; // 2MB

    if (!allowed.includes(file.type)) {
      alert("Please select a JPG, PNG, or WEBP image.");
      e.target.value = "";
      return;
    }
    if (file.size > maxBytes) {
      alert("Image too large. Max size is 2MB.");
      e.target.value = "";
      return;
    }

    // set state + preview
    if (logoPreview) URL.revokeObjectURL(logoPreview);
    const url = URL.createObjectURL(file);
    setLogoFile(file);
    setLogoPreview(url);
  };

  const clearLogo = () => {
    if (logoPreview) URL.revokeObjectURL(logoPreview);
    setLogoFile(null);
    setLogoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.name.trim()) {
      alert("Please enter a brand name");
      return;
    }

    onSave({ ...formData, logo: logoFile });
    handleClose();
  };

  const handleClose = () => {
    setFormData({ name: "", description: "", status: "active" });
    clearLogo();
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
            {editingBrand ? "Edit Brand" : "Add New Brand"}
          </h2>
          <button
            onClick={handleClose}
            className="cursor-pointer transition-colors"
          >
            <img src={images.close} alt="Close" className="w-8 h-8" />
          </button>
        </div>

        <div className="p-5">
          {/* Logo Upload */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <button
                type="button"
                onClick={triggerFilePicker}
                className="w-24 h-24 bg-gray-100 rounded-full overflow-hidden flex items-center justify-center border border-gray-200 hover:ring-2 hover:ring-[#E53E3E] transition cursor-pointer"
                aria-label="Upload brand logo"
              >
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="Brand logo preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={images.img}
                    alt="Brand logo placeholder"
                    className="w-10 h-10"
                  />
                )}
              </button>

              {logoPreview && (
                <button
                  type="button"
                  onClick={clearLogo}
                  className="absolute -right-2 -top-2 bg-white border border-gray-300 rounded-full p-1 shadow cursor-pointer"
                  title="Remove logo"
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
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Brand Name */}
            <div>
              <label className="block text-xl font-medium text-[#000] mb-2.5">
                Brand Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter brand name"
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
                placeholder="Enter brand description"
                rows={4}
                className="w-full p-5 border border-gray-300 rounded-xl text-md focus:outline-none focus:ring-2 focus:ring-[#E53E3E] focus:border-transparent placeholder-gray-400 resize-none"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-xl font-medium text-[#000] mb-2.5">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full p-5 border border-gray-300 rounded-xl text-md focus:outline-none focus:ring-2 focus:ring-[#E53E3E] focus:border-transparent bg-white"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-[#E53E3E] cursor-pointer text-white py-4 rounded-xl font-medium hover:bg-[#D32F2F] transition-colors mt-6"
            >
              {editingBrand ? "Update Brand" : "Add Brand"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default BrandModal;
