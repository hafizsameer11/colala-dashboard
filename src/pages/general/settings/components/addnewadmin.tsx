import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import images from "../../../../constants/images";

interface AddNewAdminProps {
  isOpen: boolean;
  onClose: () => void;
  onAddAdmin: (adminData: {
    name: string;
    email: string;
    password: string;
    role: string;
  }) => void;
}

const AddNewAdmin: React.FC<AddNewAdminProps> = ({
  isOpen,
  onClose,
  onAddAdmin,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "Admin",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  const roleOptions = ["Admin", "Super Admin", "Moderator"];

  // Handle body scroll lock when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    // Cleanup function to restore scroll when component unmounts
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Handle escape key press
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscapeKey);
    }

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.password.trim()
    ) {
      alert("Please fill in all fields");
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

    onAddAdmin(formData);

    // Reset form
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "Admin",
    });

    onClose();
  };

  const handleClose = () => {
    // Reset form when closing
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "Admin",
    });
    setShowPassword(false);
    setIsRoleDropdownOpen(false);
    onClose();
  };

  if (!isOpen) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-100 bg-[#00000080] bg-opacity-50 flex justify-end"
      onClick={(e) => {
        // Close modal when clicking on backdrop
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <div
        className="bg-white w-[500px] relative h-full overflow-y-auto"
        onClick={(e) => {
          // Prevent closing when clicking inside modal
          e.stopPropagation();
        }}
      >
        {/* Header */}
        <div className="flex items-center p-5 border-b border-[#787878] justify-between mb-6">
          <h2 className=" font-semibold text-gray-900">Add New Admin</h2>
          <button
            onClick={handleClose}
            className=" cursor-pointer transition-colors"
          >
            <img src={images.close} alt="Close" className="w-8 h-8" />
          </button>
        </div>

        <div className="p-5">
          {/* Profile Picture Placeholder */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center cursor-pointer">
              <img src={images.img} alt="Profile" className="w-10 h-10 cursor-pointer" />
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
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter full name"
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
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 cursor-pointer rounded"
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

            {/* Assign Role */}
            <div>
              <label className="block text-xl font-medium text-[#000] mb-2.5">
                Assign Role
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                  className="w-full p-5 cursor-pointer border border-gray-300 rounded-xl text-md focus:outline-none focus:ring-2 focus:ring-[#E53E3E] focus:border-transparent text-left flex items-center justify-between bg-white"
                >
                  <span className="text-gray-900 cursor-pointer">{formData.role}</span>
                  <svg
                    className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                      isRoleDropdownOpen ? "rotate-180" : ""
                    }`}
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

                {isRoleDropdownOpen && (
                  <div className="absolute top-full left-0 mt-1 w-full cursor-pointer bg-white border border-gray-300 rounded-lg shadow-lg z-[10001]">
                    {roleOptions.map((role) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({ ...prev, role }));
                          setIsRoleDropdownOpen(false);
                        }}
                        className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg"
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-[#E53E3E] cursor-pointer text-white py-3 px-4 rounded-lg font-medium text-sm hover:bg-[#D32F2F] transition-colors mt-6"
            >
              Add Admin
            </button>
          </form>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default AddNewAdmin;
