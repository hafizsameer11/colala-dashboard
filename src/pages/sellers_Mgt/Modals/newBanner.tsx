import { useState, useEffect } from "react";
import images from "../../../constants/images";

interface NewBannerProps {
  isOpen: boolean;
  onClose: () => void;
  editingBanner?: any;
  onCreateBanner?: (formData: FormData) => void;
  onUpdateBanner?: (bannerId: string, formData: FormData) => void;
  isLoading?: boolean;
}

const NewBanner: React.FC<NewBannerProps> = ({
  isOpen,
  onClose,
  editingBanner,
  onCreateBanner,
  onUpdateBanner,
  isLoading = false
}) => {
  if (!isOpen) return null;

  // State management
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerLink, setBannerLink] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({
    bannerFile: "",
    bannerLink: "",
  });

  // Clean up file URLs when component unmounts or file changes
  useEffect(() => {
    return () => {
      if (bannerFile) {
        URL.revokeObjectURL(URL.createObjectURL(bannerFile));
      }
    };
  }, [bannerFile]);

  // Populate form when editing
  useEffect(() => {
    if (editingBanner) {
      setBannerLink(editingBanner.link || "");
      setBannerFile(null); // Reset file for new upload
    } else {
      setBannerLink("");
      setBannerFile(null);
    }
  }, [editingBanner]);

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type (image or video)
      if (file.type.startsWith("image/") || file.type.startsWith("video/")) {
        setBannerFile(file);
        setErrors((prev) => ({ ...prev, bannerFile: "" }));
      } else {
        alert("Please upload a valid image or video file");
        event.target.value = "";
      }
    }
  };

  // Remove uploaded file
  const removeFile = () => {
    setBannerFile(null);
    // Reset file input
    const fileInput = document.getElementById(
      "uploadBanner"
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {
      bannerFile: "",
      bannerLink: "",
    };

    // File is only required for new banners, not when editing (can keep current image)
    if (!editingBanner && !bannerFile) {
      newErrors.bannerFile = "Please upload a banner image or video";
    }

    // Banner link is optional, but if provided, must be a valid URL
    if (bannerLink.trim() && !isValidUrl(bannerLink)) {
      newErrors.bannerLink = "Please enter a valid URL";
    }

    setErrors(newErrors);
    return !newErrors.bannerFile && !newErrors.bannerLink;
  };

  // URL validation helper
  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // Handle form submission
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      if (bannerFile) {
        formData.append("image", bannerFile);
      }
      if (bannerLink.trim()) {
        formData.append("link", bannerLink);
      }

      if (editingBanner && onUpdateBanner) {
        onUpdateBanner(editingBanner.id, formData);
      } else if (onCreateBanner) {
        onCreateBanner(formData);
      }

      // Reset form
      setBannerFile(null);
      setBannerLink("");
      setErrors({ bannerFile: "", bannerLink: "" });
    } catch (error) {
      console.error("Error uploading banner:", error);
      alert("Error uploading banner. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="fixed inset-0 z-100 bg-[#00000080] bg-opacity-50 flex justify-end">
      <div className="bg-white w-[500px] relative h-130 overflow-y-auto">
        {/* Header */}
        <div className="border-b border-[#787878] px-3 py-3 sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">
              {editingBanner ? "Edit Banner" : "Add New Banner"}
            </h2>
            <div className="flex items-center">
              <button
                onClick={onClose}
                className="p-2 rounded-md  cursor-pointer"
                aria-label="Close"
              >
                <img className="w-7 h-7" src={images.close} alt="Close" />
              </button>
            </div>
          </div>
        </div>
        <div className="p-5">
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-3">
              <label htmlFor="uploadBanner" className="text-xl font-medium">
                {editingBanner ? "Update Banner (Optional)" : "Upload Banner"}
              </label>
              {editingBanner && (
                <p className="text-sm text-gray-600">
                  Leave empty to keep the current banner image
                </p>
              )}

              {/* File Upload Area */}
              {bannerFile ? (
                <div className="relative rounded-xl border border-[#989898] overflow-hidden">
                  {bannerFile.type.startsWith("image/") ? (
                    <img
                      src={URL.createObjectURL(bannerFile)}
                      alt="Banner preview"
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <video
                      src={URL.createObjectURL(bannerFile)}
                      className="w-full h-48 object-cover"
                      controls
                    />
                  )}
                  <button
                    type="button"
                    onClick={removeFile}
                    className="absolute top-2 right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors"
                  >
                    ×
                  </button>
                </div>
              ) : editingBanner?.image ? (
                <div className="relative rounded-xl border border-[#989898] overflow-hidden">
                  <img
                    src={editingBanner.image}
                    alt="Current banner"
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                    Current banner
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3 items-center justify-center p-10 rounded-xl border border-[#989898] cursor-pointer hover:border-[#E53E3E] transition-colors relative">
                  <input
                    type="file"
                    id="uploadBanner"
                    accept="image/*,video/*"
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <div>
                    <img className="w-10 h-10" src={images.cam} alt="" />
                  </div>
                  <div className="text-[#00000080] text-xl">
                    Upload photo or video
                  </div>
                </div>
              )}

              {errors.bannerFile && (
                <span className="text-red-500 text-sm">
                  {errors.bannerFile}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-3 mt-5">
              <label htmlFor="bannerLink" className="text-xl font-medium">
                Banner Link (Optional)
              </label>
              <input
                type="text"
                id="bannerLink"
                value={bannerLink}
                onChange={(e) => {
                  setBannerLink(e.target.value);
                  setErrors((prev) => ({ ...prev, bannerLink: "" }));
                }}
                className={`border rounded-xl p-5 ${errors.bannerLink ? "border-red-500" : "border-[#989898]"
                  }`}
                placeholder="Enter Banner link"
              />
              {errors.bannerLink && (
                <span className="text-red-500 text-sm">
                  {errors.bannerLink}
                </span>
              )}
            </div>

            <div className="mt-5">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-4 text-white rounded-xl transition-colors ${isSubmitting
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-[#E53E3E] hover:bg-[#d63333] cursor-pointer"
                  }`}
              >
                {isSubmitting ? "Saving..." : (editingBanner ? "Update Banner" : "Upload Banner")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewBanner;
