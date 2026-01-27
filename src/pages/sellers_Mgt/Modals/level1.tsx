import images from "../../../constants/images";
import { useState, useEffect } from "react";
import { fetchCategories } from "../../../utils/queries";
import type { Category } from "../../../utils/queries";

interface Level1Props {
  onSaveAndClose?: () => void;
  onProceed?: (data: {
    storeName: string;
    email: string;
    phoneNumber: string;
    password: string;
    category: number;
    showPhoneOnProfile: boolean;
    profileImageFile?: File | null;
    bannerImageFile?: File | null;
    socialLinks?: Array<{ type: string; url: string }>;
  }) => void;
  isLoading?: boolean;
  editMode?: boolean;
  initialData?: {
    storeName?: string;
    email?: string;
    phoneNumber?: string;
    category?: number;
    showPhoneOnProfile?: boolean;
    profileImage?: string | null;
    bannerImage?: string | null;
    socialLinks?: Array<{ type: string; url: string }>;
  };
}

const Level1: React.FC<Level1Props> = ({
  onSaveAndClose,
  onProceed,
  isLoading = false,
  editMode = false,
  initialData,
}) => {
  const [showPhoneOnProfile, setShowPhoneOnProfile] = useState(initialData?.showPhoneOnProfile || false);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(initialData?.category || null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Form data state
  const [formData, setFormData] = useState({
    storeName: initialData?.storeName || "",
    email: initialData?.email || "",
    phoneNumber: initialData?.phoneNumber || "",
    instagramProfile: initialData?.socialLinks?.find(link => link.type === 'instagram')?.url || "",
    twitterHandle: initialData?.socialLinks?.find(link => link.type === 'twitter')?.url || "",
    facebookProfile: initialData?.socialLinks?.find(link => link.type === 'facebook')?.url || "",
  });

  // Image upload state
  const [profileImage, setProfileImage] = useState<string | null>(initialData?.profileImage || null);
  const [bannerImage, setBannerImage] = useState<string | null>(initialData?.bannerImage || null);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null); // For form submission
  const [bannerImageFile, setBannerImageFile] = useState<File | null>(null); // For form submission

  // Fetch categories on component mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setCategoriesLoading(true);
        const response = await fetchCategories();
        if (response.status === 'success') {
          console.log('Categories loaded:', response.data.categories);
          setCategories(response.data.categories);
        }
      } catch (error) {
        console.error('Error loading categories:', error);
      } finally {
        setCategoriesLoading(false);
      }
    };

    loadCategories();
  }, []);

  const togglePhoneVisibility = () => {
    const newValue = !showPhoneOnProfile;
    console.log('Toggling showPhoneOnProfile from', showPhoneOnProfile, 'to', newValue);
    setShowPhoneOnProfile(newValue);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleCategorySelect = (categoryId: number) => {
    setSelectedCategory(categoryId);
    setIsDropdownOpen(false);
  };

  // Image upload handlers
  const handleProfileImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        alert('Please select a valid image file (JPEG, PNG, JPG, GIF)');
        return;
      }
      
      // Validate file size (2MB max)
      const maxSize = 2 * 1024 * 1024; // 2MB in bytes
      if (file.size > maxSize) {
        alert('Image size should not exceed 2MB');
        return;
      }
      
      setProfileImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBannerImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        alert('Please select a valid image file (JPEG, PNG, JPG, GIF)');
        return;
      }
      
      // Validate file size (2MB max)
      const maxSize = 2 * 1024 * 1024; // 2MB in bytes
      if (file.size > maxSize) {
        alert('Image size should not exceed 2MB');
        return;
      }
      
      setBannerImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setBannerImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveAndClose = (e: React.FormEvent) => {
    e.preventDefault();

    // In edit mode, allow saving without requiring any fields.
    if (!editMode) {
      // Validate required fields for creation flow
      const missingBasics =
        !formData.storeName ||
        !formData.email ||
        !formData.phoneNumber;

      const missingCreationOnly =
        (!password || selectedCategory === null);

      if (missingBasics || missingCreationOnly) {
        alert("Please fill in all required fields");
        return;
      }
    }

    // Convert social media form fields to array format
    const socialLinks: Array<{ type: string; url: string }> = [];
    if (formData.instagramProfile && formData.instagramProfile.trim()) {
      socialLinks.push({ type: 'instagram', url: formData.instagramProfile.trim() });
    }
    if (formData.twitterHandle && formData.twitterHandle.trim()) {
      socialLinks.push({ type: 'twitter', url: formData.twitterHandle.trim() });
    }
    if (formData.facebookProfile && formData.facebookProfile.trim()) {
      socialLinks.push({ type: 'facebook', url: formData.facebookProfile.trim() });
    }

    // Save form data to localStorage (since no backend)
    const storeData = {
      storeName: formData.storeName,
      email: formData.email,
      phoneNumber: formData.phoneNumber,
      // For edit mode password/category might be unchanged; we still include
      // whatever the user has typed / selected.
      password,
      category: selectedCategory!,
      showPhoneOnProfile,
      socialLinks: socialLinks, // Convert to array format
      level1Completed: true,
      submittedAt: new Date().toISOString(),
    };

    localStorage.setItem("storeFormData", JSON.stringify(storeData));
    console.log("Form saved:", storeData);

    if (onSaveAndClose) {
      onSaveAndClose();
    }
  };

  const handleProceed = (e: React.FormEvent) => {
    e.preventDefault();

    // For creation, enforce required fields; for edit mode, allow partial data.
    if (!editMode) {
      if (
        !formData.storeName ||
        !formData.email ||
        !formData.phoneNumber ||
        !password ||
        selectedCategory === null
      ) {
        alert("Please fill in all required fields");
        return;
      }
    }

    // Convert social media form fields to array format
    const socialLinks: Array<{ type: string; url: string }> = [];
    if (formData.instagramProfile && formData.instagramProfile.trim()) {
      socialLinks.push({ type: 'instagram', url: formData.instagramProfile.trim() });
    }
    if (formData.twitterHandle && formData.twitterHandle.trim()) {
      socialLinks.push({ type: 'twitter', url: formData.twitterHandle.trim() });
    }
    if (formData.facebookProfile && formData.facebookProfile.trim()) {
      socialLinks.push({ type: 'facebook', url: formData.facebookProfile.trim() });
    }

    // Save form data to localStorage
    const storeData = {
      storeName: formData.storeName,
      email: formData.email,
      phoneNumber: formData.phoneNumber,
      password,
      category: selectedCategory!,
      showPhoneOnProfile,
      profileImage: profileImage,
      bannerImage: bannerImage,
      profileImageFile: profileImageFile,
      bannerImageFile: bannerImageFile,
      socialLinks: socialLinks, // Convert to array format
      level1Completed: true,
      submittedAt: new Date().toISOString(),
    };
    
    console.log('Level1 handleProceed - showPhoneOnProfile:', showPhoneOnProfile, 'type:', typeof showPhoneOnProfile);
    console.log('Level1 handleProceed - socialLinks:', socialLinks);

    localStorage.setItem("storeFormData", JSON.stringify(storeData));
    console.log("Proceeding to Level 2 with data:", storeData);

    if (onProceed) {
      onProceed(storeData);
    }
  };
  return (
    <div className="mt-5">
      {/* Profile tab content goes here */}
      <div className="flex justify-center items-center mt-10 mb-5">
        <div className="bg-[#EDEDED] rounded-full w-30 h-30 flex justify-center items-center cursor-pointer relative overflow-hidden">
          {profileImage ? (
            <img 
              src={profileImage} 
              alt="Profile Preview" 
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            <button className="flex justify-center items-center cursor-pointer">
              <img src={images.img} alt="" />
            </button>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleProfileImageChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
      </div>
      <div className="">
        <div className="bg-[#EDEDED] w-full rounded-2xl p-6 relative overflow-hidden">
          {bannerImage ? (
            <div className="relative">
              <img 
                src={bannerImage} 
                alt="Banner Preview" 
                className="w-full h-32 object-cover rounded-xl"
              />
              <div className="absolute top-2 right-2 bg-black bg-opacity-50 rounded-full p-2">
                <img src={images.cam} alt="Change" className="w-4 h-4" />
              </div>
            </div>
          ) : (
            <div className="flex flex-col justify-center items-center">
              <div className="flex justify-center items-center cursor-pointer mb-2">
                <img src={images.cam} alt="" />
              </div>
              <div className="text-[#00000080] flex justify-center items-center">
                Upload Banner
              </div>
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleBannerImageChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
      </div>
      <div className="mt-5">
        <form onSubmit={handleProceed}>
          <div className="">
            <label htmlFor="storeName" className="text-lg font-semibold">
              Store Name
            </label>
            <input
              type="text"
              id="storeName"
              name="storeName"
              value={formData.storeName}
              onChange={handleInputChange}
              placeholder="Enter Store Name"
              className="w-full mt-3 border border-[#989898] p-5 rounded-2xl  text-lg"
              required={!editMode}
            />
          </div>
          <div className="mt-5">
            <label htmlFor="email" className="text-lg font-semibold">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter email address"
              className="w-full mt-3 border border-[#989898] p-5 rounded-2xl text-lg"
              required={!editMode}
            />
          </div>
          <div className="mt-5">
            <label htmlFor="phoneNumber" className="text-lg font-semibold">
              Phone Number
            </label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              placeholder="Enter phone number"
              className="w-full mt-3 border border-[#989898] p-5 rounded-2xl text-lg"
              required={!editMode}
            />
          </div>
          <div className="mt-5">
            <div className="w-full border border-[#989898] p-5 rounded-2xl text-lg flex flex-row justify-between items-center">
              <div>Show phone on profile</div>
              <div
                onClick={togglePhoneVisibility}
                className={`w-12 h-6 rounded-full cursor-pointer transition-colors duration-300 ${
                  showPhoneOnProfile ? "bg-[#E53E3E]" : "bg-gray-300"
                } relative`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 absolute top-0.5 ${
                    showPhoneOnProfile ? "translate-x-6" : "translate-x-0.5"
                  }`}
                ></div>
              </div>
            </div>
          </div>
          {/* Password */}
          <div className="mt-5">
            <label htmlFor="password" className="text-lg font-semibold">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full mt-3 border border-[#989898] p-5 rounded-2xl  text-lg pr-12"
                required={!editMode}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-2 top-3  flex items-center px-3 text-gray-500 hover:text-gray-700 focus:outline-none cursor-pointer"
              >
                {showPassword ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="25"
                    height="25"
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
                    width="25"
                    height="25"
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
          <div className="mt-5">
            <label htmlFor="category" className="text-lg font-semibold">
              Add Category
            </label>
            <div className="relative">
              <div
                className="w-full border border-[#989898] p-5 rounded-2xl text-lg flex flex-row justify-between items-center mt-3 cursor-pointer"
                onClick={toggleDropdown}
              >
                <div
                  className={
                    selectedCategory ? "text-black" : "text-[#00000080]"
                  }
                >
                  {selectedCategory ? categories.find(cat => cat.id === selectedCategory)?.title || "Select Category" : "Select Category"}
                </div>
                <div
                  className={`transform transition-transform duration-200 ${
                    isDropdownOpen ? "rotate-90" : ""
                  }`}
                >
                  <img src={images.rightarrow} alt="" />
                </div>
              </div>

              {isDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-[#989898] rounded-2xl shadow-lg max-h-60 overflow-y-auto">
                  {categoriesLoading ? (
                    <div className="p-4 text-center text-gray-500">
                      Loading categories...
                    </div>
                  ) : categories.length > 0 ? (
                    categories.map((category) => (
                      <div
                        key={category.id}
                        className="p-4 hover:bg-gray-50 cursor-pointer text-lg border-b border-gray-100 last:border-b-0"
                        onClick={() => handleCategorySelect(category.id)}
                      >
                        {category.title}
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      No categories available
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="text-[#00000080] text-lg mt-5 font-semibold">
            Add Social Links
          </div>
          <div className="mt-5">
            <label htmlFor="instagramProfile" className="text-lg font-semibold">
              Instagram Profile
            </label>
            <input
              type="text"
              id="instagramProfile"
              name="instagramProfile"
              value={formData.instagramProfile}
              onChange={handleInputChange}
              placeholder="Enter Instagram Profile"
              className="w-full mt-3 border border-[#989898] p-5 rounded-2xl text-lg"
            />
          </div>
          <div className="mt-5">
            <label htmlFor="twitterHandle" className="text-lg font-semibold">
              X (Twitter) Handle
            </label>
            <input
              type="text"
              id="twitterHandle"
              name="twitterHandle"
              value={formData.twitterHandle}
              onChange={handleInputChange}
              placeholder="Enter X (Twitter) Handle"
              className="w-full mt-3 border border-[#989898] p-5 rounded-2xl text-lg"
            />
          </div>
          <div className="mt-5">
            <label htmlFor="facebookProfile" className="text-lg font-semibold">
              Facebook Profile
            </label>
            <input
              type="url"
              id="facebookProfile"
              name="facebookProfile"
              value={formData.facebookProfile}
              onChange={handleInputChange}
              placeholder="Enter Facebook Profile URL"
              className="w-full mt-3 border border-[#989898] p-5 rounded-2xl text-lg"
            />
          </div>
          <div className="mt-5 flex flex-row justify-between">
            <button
              type="button"
              onClick={handleSaveAndClose}
              className="border border-[#E53E3E] rounded-2xl px-6 py-4 text-[#E53E3E] font-semibold text-lg cursor-pointer"
            >
              Save and Close
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`bg-[#E53E3E] rounded-2xl px-24 py-4 cursor-pointer text-white text-lg font-semibold hover:bg-red-600 transition-colors ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? 'Processing...' : 'Proceed'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Level1;
