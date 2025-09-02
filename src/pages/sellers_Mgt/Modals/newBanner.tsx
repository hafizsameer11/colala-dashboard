import { useState, useEffect } from "react";
import images from "../../../constants/images";

interface NewBannerProps {
  isOpen: boolean;
  onClose: () => void;
}

const NewBanner: React.FC<NewBannerProps> = ({ isOpen, onClose }) => {
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

    if (!bannerFile) {
      newErrors.bannerFile = "Please upload a banner image or video";
    }

    if (!bannerLink.trim()) {
      newErrors.bannerLink = "Please enter a banner link";
    } else if (!isValidUrl(bannerLink)) {
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
      // Simulate API call
      const formData = new FormData();
      if (bannerFile) {
        formData.append("banner", bannerFile);
      }
      formData.append("link", bannerLink);

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      console.log("Banner uploaded successfully:", {
        file: bannerFile?.name,
        link: bannerLink,
      });

      alert("Banner uploaded successfully!");

      // Reset form
      setBannerFile(null);
      setBannerLink("");
      setErrors({ bannerFile: "", bannerLink: "" });

      // Close modal
      onClose();
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
            <h2 className="text-xl font-bold">Add New Banner</h2>
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
                Upload Banner
              </label>

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
                Banner Link
              </label>
              <input
                type="text"
                id="bannerLink"
                value={bannerLink}
                onChange={(e) => {
                  setBannerLink(e.target.value);
                  setErrors((prev) => ({ ...prev, bannerLink: "" }));
                }}
                className={`border rounded-xl p-5 ${
                  errors.bannerLink ? "border-red-500" : "border-[#989898]"
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
                className={`w-full py-4 text-white rounded-xl transition-colors ${
                  isSubmitting
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-[#E53E3E] hover:bg-[#d63333] cursor-pointer"
                }`}
              >
                {isSubmitting ? "Uploading..." : "Upload Banner"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewBanner;
