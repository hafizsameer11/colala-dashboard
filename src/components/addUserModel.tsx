import React, { useState } from "react";
import images from "../constants/images";

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddUserModal: React.FC<AddUserModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<"profile" | "address">("profile");
  const [showPassword, setShowPassword] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    username: "",
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    // Add your form submission logic here
    // You can call an API, validate the data, etc.
    onClose(); // Close modal after submission
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 bg-[#00000080] bg-opacity-50 flex justify-end">
      <div className="bg-white w-[500px] relative h-full overflow-y-auto">
        {/* Header */}
        <div className="border-b border-[#787878] p-3 sticky top-0 bg-white z-10">
          <button
            onClick={onClose}
            className="absolute flex items-center right-3 cursor-pointer"
          >
            <img src={images.close} alt="Close" />
          </button>
          <h2 className="text-xl font-semibold">Add New User</h2>
        </div>

        <div className="p-5 pb-8">
          {/* Tabs */}
          <div className="flex p-1 gap-4 border border-[#989898] rounded-lg mt-5 w-[275px]">
            <button
              onClick={() => setActiveTab("profile")}
              className={`px-6 py-2 rounded-lg font-medium cursor-pointer ${
                activeTab === "profile"
                  ? "bg-[#E53E3E] text-white "
                  : "bg-transparent text-black"
              }`}
            >
              Profile
            </button>
            <button
              onClick={() => setActiveTab("address")}
              className={`px-6 py-2 rounded-lg font-medium cursor-pointer ${
                activeTab === "address"
                  ? "bg-red-500 text-white"
                  : "bg-transparent text-black"
              }`}
            >
              Saved Address
            </button>
          </div>

          {/* Tab Content */}
          <div className="">
            {activeTab === "profile" && (
              <div className="mt-5">
                {/* Profile tab content goes here */}
                <div className="flex justify-center items-center mt-10 mb-10">
                  <div className="bg-[#EDEDED] rounded-full w-25 h-25 flex justify-center items-center cursor-pointer">
                    <button className="flex justify-center items-center cursor-pointer">
                      <img src={images.img} alt="" />
                    </button>
                  </div>
                </div>

                <div>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Username */}
                    <div>
                      <label
                        htmlFor="username"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Username
                      </label>
                      <input
                        type="text"
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        placeholder="Enter username"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-400 transition-shadow"
                        required
                      />
                    </div>

                    {/* Full Name */}
                    <div>
                      <label
                        htmlFor="fullName"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        placeholder="Enter full name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-400 transition-shadow"
                        required
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Enter email address"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-400 transition-shadow"
                        required
                      />
                    </div>

                    {/* Phone Number */}
                    <div>
                      <label
                        htmlFor="phoneNumber"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phoneNumber"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        placeholder="Enter phone number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-400 transition-shadow"
                        required
                      />
                    </div>

                    {/* Password */}
                    <div>
                      <label
                        htmlFor="password"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          id="password"
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          placeholder="Enter password"
                          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-400 transition-shadow"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700 focus:outline-none cursor-pointer"
                        >
                          {showPassword ? (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          ) : (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                              <path d="m2 2 20 20" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Add User Button */}
                    <div className="mt-6">
                      <button
                        type="submit"
                        className="w-full bg-[#E53E3E] text-white py-3 px-4 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 transition-colors font-normal cursor-pointer"
                      >
                        Add User
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
            {activeTab === "address" && (
              <div className="mt-5" >
                {/* Saved Address tab content goes here */}
                <div className="flex items-center justify-center" >
                    <p className="font-bold text-2xl" >No Saved Addresses</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddUserModal;
