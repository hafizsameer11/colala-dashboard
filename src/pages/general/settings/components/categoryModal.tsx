import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import images from "../../../../constants/images";

interface Category {
  id: number;
  parent_id: number | null;
  title: string;
  image: string;
  color: string;
  products_count: number;
  image_url: string;
  children: Category[];
  created_at: string;
  updated_at: string;
}

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (categoryData: {
    title: string;
    image?: File | null;
    color: string;
    parent_id?: number | null;
  }) => void;
  editingCategory?: Category | null;
  parentCategories?: Category[];
}

const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingCategory,
  parentCategories = [],
}) => {
  const [formData, setFormData] = useState({
    title: "",
    color: "#E53E3E",
    parent_id: null as number | null,
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
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
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  // Reset form when modal opens/closes or editing category changes
  useEffect(() => {
    if (isOpen) {
      if (editingCategory) {
        setFormData({
          title: editingCategory.title,
          color: editingCategory.color,
          parent_id: editingCategory.parent_id,
        });
        setImagePreview(editingCategory.image_url || null);
        setImageFile(null);
      } else {
        setFormData({
          title: "",
          color: "#E53E3E",
          parent_id: null,
        });
        setImagePreview(null);
        setImageFile(null);
      }
    }
  }, [isOpen, editingCategory]);

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
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    const url = URL.createObjectURL(file);
    setImageFile(file);
    setImagePreview(url);
  };

  const clearImage = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ 
      ...prev, 
      [name]: name === "parent_id" ? (value ? parseInt(value) : null) : value 
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.title.trim()) {
      alert("Please enter a category title");
      return;
    }

    onSave({ 
      ...formData, 
      image: imageFile,
      parent_id: formData.parent_id || null
    });
    handleClose();
  };

  const handleClose = () => {
    setFormData({ title: "", color: "#E53E3E", parent_id: null });
    clearImage();
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
            {editingCategory ? "Edit Category" : "Add New Category"}
          </h2>
          <button
            onClick={handleClose}
            className="cursor-pointer transition-colors"
          >
            <img src={images.close} alt="Close" className="w-8 h-8" />
          </button>
        </div>

        <div className="p-5">
          {/* Image Upload */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <button
                type="button"
                onClick={triggerFilePicker}
                className="w-24 h-24 bg-gray-100 rounded-full overflow-hidden flex items-center justify-center border border-gray-200 hover:ring-2 hover:ring-[#E53E3E] transition cursor-pointer"
                aria-label="Upload category image"
              >
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Category image preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={images.img}
                    alt="Category image placeholder"
                    className="w-10 h-10"
                  />
                )}
              </button>

              {imagePreview && (
                <button
                  type="button"
                  onClick={clearImage}
                  className="absolute -right-2 -top-2 bg-white border border-gray-300 rounded-full p-1 shadow cursor-pointer"
                  title="Remove image"
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
            {/* Category Title */}
            <div>
              <label className="block text-xl font-medium text-[#000] mb-2.5">
                Category Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter category title"
                className="w-full p-5 border border-gray-300 rounded-xl text-md focus:outline-none focus:ring-2 focus:ring-[#E53E3E] focus:border-transparent placeholder-gray-400"
                required
              />
            </div>

            {/* Parent Category */}
            <div>
              <label className="block text-xl font-medium text-[#000] mb-2.5">
                Parent Category (Optional)
              </label>
              <select
                name="parent_id"
                value={formData.parent_id || ""}
                onChange={handleInputChange}
                className="w-full p-5 border border-gray-300 rounded-xl text-md focus:outline-none focus:ring-2 focus:ring-[#E53E3E] focus:border-transparent bg-white"
              >
                <option value="">Select parent category (for subcategory)</option>
                {parentCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Color */}
            <div>
              <label className="block text-xl font-medium text-[#000] mb-2.5">
                Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  name="color"
                  value={formData.color}
                  onChange={handleInputChange}
                  className="w-16 h-12 border border-gray-300 rounded-lg cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.color}
                  onChange={handleInputChange}
                  placeholder="#E53E3E"
                  className="flex-1 p-5 border border-gray-300 rounded-xl text-md focus:outline-none focus:ring-2 focus:ring-[#E53E3E] focus:border-transparent"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-[#E53E3E] cursor-pointer text-white py-4 rounded-xl font-medium hover:bg-[#D32F2F] transition-colors mt-6"
            >
              {editingCategory ? "Update Category" : "Add Category"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default CategoryModal;
