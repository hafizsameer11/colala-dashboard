import images from "../../../constants/images";
import { useState, useRef } from "react";

interface NewPostProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (postData: PostData) => void;
}

interface PostData {
  media: File[];
  description: string;
  storeLink: string;
}

const NewPost: React.FC<NewPostProps> = ({ isOpen, onClose, onSubmit }) => {
  const [description, setDescription] = useState("");
  const [storeLink, setStoreLink] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

    // Filter for images and videos only
    const validFiles = files.filter(
      (file) => file.type.startsWith("image/") || file.type.startsWith("video/")
    );

    setSelectedFiles((prevFiles) => [...prevFiles, ...validFiles]);

    // Create preview URLs
    validFiles.forEach((file) => {
      const url = URL.createObjectURL(file);
      setPreviewUrls((prev) => [...prev, url]);
    });
  };

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newUrls = previewUrls.filter((_, i) => i !== index);

    // Revoke the URL to free up memory
    URL.revokeObjectURL(previewUrls[index]);

    setSelectedFiles(newFiles);
    setPreviewUrls(newUrls);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!description.trim()) {
      alert("Please enter a description");
      return;
    }

    const postData: PostData = {
      media: selectedFiles,
      description: description.trim(),
      storeLink: storeLink.trim(),
    };

    if (onSubmit) {
      onSubmit(postData);
    }

    // Reset form
    setDescription("");
    setStoreLink("");
    setSelectedFiles([]);
    setPreviewUrls([]);

    console.log("Post submitted:", postData);
    alert("Post submitted successfully!");
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-100 bg-[#00000080] bg-opacity-50 flex justify-end">
      <div className="bg-white w-[500px] relative h-full overflow-y-auto">
        {/* Header */}
        <div className="border-b border-[#787878] px-3 py-3 sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Add New Post</h2>
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
            {/* Photo/Video Upload Section */}
            <div className="flex flex-col gap-3">
              <label htmlFor="photovideo" className="text-xl font-semibold">
                Photo or Video
              </label>

              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleFileSelect}
                className="hidden"
              />

              {/* Upload Area */}
              <div
                onClick={triggerFileInput}
                className="flex flex-col justify-center items-center gap-2 border border-[#989898] rounded-xl p-15 cursor-pointer hover:border-[#E53E3E] hover:bg-gray-50 transition-colors"
              >
                <div>
                  <img
                    className="cursor-pointer"
                    src={images.cam}
                    alt="Upload"
                  />
                </div>
                <div className="text-[#00000080] cursor-pointer">
                  Upload photo or video
                </div>
              </div>
            </div>

            {/* Preview Selected Files */}
            {selectedFiles.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      {file.type.startsWith("image/") ? (
                        <img
                          src={previewUrls[index]}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <video
                          src={previewUrls[index]}
                          className="w-full h-full object-cover"
                          controls
                        />
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                    <div className="text-xs text-gray-600 mt-1 truncate">
                      {file.name}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Description Input */}
            <div className="flex flex-col gap-3 mt-6 mb-6">
              <label htmlFor="description" className="text-xl font-semibold">
                Description
              </label>
              <textarea
                name="description"
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Type a description..."
                rows={4}
                className="border border-[#989898] w-full rounded-xl p-5 resize-none focus:outline-none focus:ring-2 focus:ring-[#E53E3E] focus:border-transparent"
              />
            </div>

            {/* Store Link Input */}
            <div className="flex flex-col gap-3 mt-3">
              <label htmlFor="storeLink" className="text-xl font-semibold">
                Store Link
              </label>
              <input
                type="text"
                name="storeLink"
                id="storeLink"
                value={storeLink}
                onChange={(e) => setStoreLink(e.target.value)}
                placeholder="Enter store link"
                className="border border-[#989898] w-full rounded-xl p-5"
              />
            </div>

            {/* Submit Button */}
            <div className="mt-7">
              <button
                type="submit"
                className="w-full bg-[#E53E3E] cursor-pointer py-4 text-white rounded-xl hover:bg-[#d63534] transition-colors"
              >
                Send Post
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewPost;
