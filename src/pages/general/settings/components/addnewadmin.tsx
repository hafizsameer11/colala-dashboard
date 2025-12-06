import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useMutation } from "@tanstack/react-query";
import { createUser } from "../../../../utils/mutations/users";
import images from "../../../../constants/images";

interface AddNewAdminProps {
  isOpen: boolean;
  onClose: () => void;
  onAddAdmin: (adminData: {
    full_name: string;
    user_name: string;
    email: string;
    phone: string;
    password: string;
    country: string;
    state: string;
    role: "admin";
    referral_code?: string;
    profile_picture?: File | null;
  }) => void;
}

const AddNewAdmin: React.FC<AddNewAdminProps> = ({
  isOpen,
  onClose,
  onAddAdmin,
}) => {
  const [formData, setFormData] = useState({
    full_name: "",
    user_name: "",
    email: "",
    phone: "",
    password: "",
    country: "",
    state: "",
    role: "admin" as "buyer" | "seller" | "admin",
    referral_code: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  // --- Image state
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const clearAvatar = useCallback(() => {
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarFile(null);
    setAvatarPreview(null);
    if (fileInputRef.current) {
      (fileInputRef.current as any).value = "";
    }
  }, [avatarPreview]);

  const handleClose = useCallback(() => {
    setFormData({ 
      full_name: "", 
      user_name: "", 
      email: "", 
      phone: "", 
      password: "", 
      country: "", 
      state: "", 
      role: "admin" as "buyer" | "seller" | "admin", 
      referral_code: "" 
    });
    setShowPassword(false);
    clearAvatar();
    onClose();
  }, [onClose, clearAvatar]);

  // Mutation for creating user
  const createUserMutation = useMutation({
    mutationFn: createUser,
    onSuccess: (data) => {
      console.log('User created successfully:', data);
      alert('User created successfully!');
      // Call the onAddAdmin callback with the created user data
      onAddAdmin(formData);
      // Reset form and close modal
      handleClose();
    },
    onError: (error: Error) => {
      console.error('Error creating user:', error);
      alert(`Error creating user: ${error.message || 'Something went wrong'}`);
    }
  });

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
  }, [isOpen, handleClose]);

  // Cleanup preview URL
  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  const triggerFilePicker = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;

    // Basic validation
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    const maxBytes = 2 * 1024 * 1024; // 2MB

    if (!allowed.includes(file.type)) {
      alert("Please select a JPG, PNG, or WEBP image.");
      (e.target as any).value = "";
      return;
    }
    if (file.size > maxBytes) {
      alert("Image too large. Max size is 2MB.");
      (e.target as any).value = "";
      return;
    }

    // set state + preview
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    const url = URL.createObjectURL(file);
    setAvatarFile(file);
    setAvatarPreview(url);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = (e.target as any);
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (
      !formData.full_name.trim() ||
      !formData.user_name.trim() ||
      !formData.email.trim() ||
      !formData.phone.trim() ||
      !formData.password.trim() ||
      !formData.country.trim() ||
      !formData.state.trim()
    ) {
      alert("Please fill in all required fields");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert("Please enter a valid email address");
      return;
    }

    // Password validation
    if (formData.password.length < 6) {
      alert("Password must be at least 6 characters long");
      return;
    }

    // Use mutation to create user
    // Always set role to "admin" for admin creation
    createUserMutation.mutate({
      ...formData,
      role: "admin" as "buyer" | "seller" | "admin",
      profile_picture: avatarFile || undefined
    });
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
          <h2 className="font-semibold text-gray-900">Add New Admin</h2>
          <button
            onClick={handleClose}
            className="cursor-pointer transition-colors"
          >
            <img src={images.close} alt="Close" className="w-8 h-8" />
          </button>
        </div>

        <div className="p-5">
          {/* Profile Picture Upload */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <button
                type="button"
                onClick={triggerFilePicker}
                className="w-24 h-24 bg-gray-100 rounded-full overflow-hidden flex items-center justify-center border border-gray-200 hover:ring-2 hover:ring-[#E53E3E] transition cursor-pointer"
                aria-label="Upload profile image"
              >
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Profile preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={images.img}
                    alt="Profile placeholder"
                    className="w-10 h-10"
                  />
                )}
              </button>

              {avatarPreview && (
                <button
                  type="button"
                  onClick={clearAvatar}
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
            {/* Full Name */}
            <div>
              <label className="block text-xl font-medium text-[#000] mb-2.5">
                Full Name
              </label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                placeholder="Enter full name"
                className="w-full p-5 border border-gray-300 rounded-xl text-md focus:outline-none focus:ring-2 focus:ring-[#E53E3E] focus:border-transparent placeholder-gray-400"
                required
              />
            </div>

            {/* Username */}
            <div>
              <label className="block text-xl font-medium text-[#000] mb-2.5">
                Username
              </label>
              <input
                type="text"
                name="user_name"
                value={formData.user_name}
                onChange={handleInputChange}
                placeholder="Enter username"
                className="w-full p-5 border border-gray-300 rounded-xl text-md focus:outline-none focus:ring-2 focus:ring-[#E53E3E] focus:border-transparent placeholder-gray-400"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xl font-medium text-[#000] mb-2.5">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter email address"
                className="w-full p-5 border border-gray-300 rounded-xl text-md focus:outline-none focus:ring-2 focus:ring-[#E53E3E] focus:border-transparent placeholder-gray-400"
                required
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xl font-medium text-[#000] mb-2.5">
                Phone
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Enter phone number"
                className="w-full p-5 border border-gray-300 rounded-xl text-md focus:outline-none focus:ring-2 focus:ring-[#E53E3E] focus:border-transparent placeholder-gray-400"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xl font-medium text-[#000] mb-2.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter password"
                  className="w-full p-5 pr-12 border border-gray-300 rounded-xl text-md focus:outline-none focus:ring-2 focus:ring-[#E53E3E] focus:border-transparent placeholder-gray-400"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 cursor-pointer rounded"
                >
                  {showPassword ? (
                    <svg
                      className="w-5 h-5 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Country */}
            <div>
              <label className="block text-xl font-medium text-[#000] mb-2.5">
                Country
              </label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                placeholder="Enter country"
                className="w-full p-5 border border-gray-300 rounded-xl text-md focus:outline-none focus:ring-2 focus:ring-[#E53E3E] focus:border-transparent placeholder-gray-400"
                required
              />
            </div>

            {/* State */}
            <div>
              <label className="block text-xl font-medium text-[#000] mb-2.5">
                State
              </label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                placeholder="Enter state"
                className="w-full p-5 border border-gray-300 rounded-xl text-md focus:outline-none focus:ring-2 focus:ring-[#E53E3E] focus:border-transparent placeholder-gray-400"
                required
              />
            </div>

            {/* Referral Code */}
            <div>
              <label className="block text-xl font-medium text-[#000] mb-2.5">
                Referral Code (Optional)
              </label>
              <input
                type="text"
                name="referral_code"
                value={formData.referral_code}
                onChange={handleInputChange}
                placeholder="Enter referral code"
                className="w-full p-5 border border-gray-300 rounded-xl text-md focus:outline-none focus:ring-2 focus:ring-[#E53E3E] focus:border-transparent placeholder-gray-400"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={createUserMutation.isPending}
              className={`w-full py-4 rounded-xl font-medium transition-colors mt-6 ${
                createUserMutation.isPending
                  ? 'bg-gray-400 cursor-not-allowed text-white'
                  : 'bg-[#E53E3E] cursor-pointer text-white hover:bg-[#D32F2F]'
              }`}
            >
              {createUserMutation.isPending ? 'Creating User...' : 'Add User'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default AddNewAdmin;
