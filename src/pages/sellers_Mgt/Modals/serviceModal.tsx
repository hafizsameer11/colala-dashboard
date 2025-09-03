import images from "../../../constants/images";
import { useState, useEffect } from "react";

interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SubService {
  name: string;
  from: string;
  to: string;
}

const ServiceModal: React.FC<ServiceModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [productName, setProductName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [productVideo, setProductVideo] = useState<File | null>(null);
  const [productImages, setProductImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fullDescription, setFullDescription] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");
  const [selectedPriceRange, setSelectedPriceRange] = useState("");
  const [subServices, setSubServices] = useState<SubService[]>(
    Array(8).fill({ name: "", from: "", to: "" })
  );

  const [dropdownStates, setDropdownStates] = useState({
    category: false,
    priceRange: false,
  });

  // Error state for validation
  const [errors, setErrors] = useState({
    productName: "",
    category: "",
    productImages: "",
    fullDescription: "",
    priceRange: "",
  });

  const categories = ["Electronics", "Fashion", "Home Appliances"];
  const priceRange = ["Under $100", "$100 - $500", "Above $500"];

  // Cleanup object URLs on component unmount
  useEffect(() => {
    return () => {
      // Clean up video URL
      if (productVideo) {
        URL.revokeObjectURL(URL.createObjectURL(productVideo));
      }
      // Clean up image URLs
      productImages.forEach((image) => {
        URL.revokeObjectURL(URL.createObjectURL(image));
      });
    };
  }, [productVideo, productImages]);

  const toggleDropdown = (dropdownName: string) => {
    setDropdownStates((prev) => ({
      ...prev,
      [dropdownName]: !prev[dropdownName as keyof typeof prev],
    }));
  };

  const closeAllDropdowns = () => {
    setDropdownStates({
      category: false,
      priceRange: false,
    });
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    closeAllDropdowns();
  };

  const handlePriceRangeSelect = (priceRange: string) => {
    setSelectedPriceRange(priceRange);
    closeAllDropdowns();
  };

  // File upload handlers
  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("video/")) {
      setProductVideo(file);
      setErrors((prev) => ({ ...prev, productImages: "" }));
    } else {
      alert("Please upload a valid video file");
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    if (imageFiles.length > 0) {
      const remainingSlots = 3 - productImages.length;
      const filesToAdd = imageFiles.slice(0, remainingSlots);

      setProductImages((prev) => [...prev, ...filesToAdd]);
      setErrors((prev) => ({ ...prev, productImages: "" }));

      // Reset the file input
      event.target.value = "";
    } else {
      alert("Please upload valid image files");
    }
  };

  // Handle sub-service input changes
  const handleSubServiceChange = (index: number, field: keyof SubService, value: string) => {
    const updatedSubServices = [...subServices];
    updatedSubServices[index] = {
      ...updatedSubServices[index],
      [field]: value
    };
    setSubServices(updatedSubServices);
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {
      productName: productName.trim() === "" ? "Product name is required" : "",
      category: selectedCategory === "" ? "Category is required" : "",
      productImages: productImages.length < 3 ? "At least 3 images are required" : "",
      fullDescription: fullDescription.trim() === "" ? "Full description is required" : "",
      priceRange: selectedPriceRange === "" ? "Price range is required" : "",
    };

    setErrors(newErrors);
    return Object.values(newErrors).every((error) => error === "");
  };

  // Form submission
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!validateForm()) {
      alert("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      // Filter out empty sub-services
      const nonEmptySubServices = subServices.filter(
        (service) => service.name.trim() !== "" || service.from.trim() !== "" || service.to.trim() !== ""
      );

      // Create product data object
      const productData = {
        productName,
        category: selectedCategory,
        video: productVideo,
        images: productImages,
        fullDescription,
        discountPrice: discountPrice ? parseFloat(discountPrice) : null,
        priceRange: selectedPriceRange,
        subServices: nonEmptySubServices,
      };

      // Simulate API call (replace with actual API endpoint)
      await new Promise((resolve) => setTimeout(resolve, 2000));

      console.log("Product data to submit:", productData);
      alert("Product created successfully!");

      // Reset form
      resetForm();
      onClose();
    } catch (error) {
      console.error("Error creating product:", error);
      alert("Error creating product. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form function
  const resetForm = () => {
    setProductName("");
    setSelectedCategory("");
    setProductVideo(null);
    setProductImages([]);
    setFullDescription("");
    setDiscountPrice("");
    setSelectedPriceRange("");
    setSubServices(Array(8).fill({ name: "", from: "", to: "" }));
    setErrors({
      productName: "",
      category: "",
      productImages: "",
      fullDescription: "",
      priceRange: "",
    });
  };

  return (
    <>
      <div className="fixed inset-0 z-100 bg-[#00000080] bg-opacity-50 flex justify-end">
        <div className="bg-white w-[500px] relative h-full overflow-y-auto">
          {/* Header */}
          <div className="border-b border-[#787878] px-3 py-3 sticky top-0 bg-white z-10">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Add New Service</h2>
              <div className="flex items-center">
                <button
                  onClick={onClose}
                  className="p-2 rounded-md cursor-pointer"
                  aria-label="Close"
                >
                  <img className="w-7 h-7" src={images.close} alt="Close" />
                </button>
              </div>
            </div>
          </div>

          <div className="p-5">
            <div>
              <form onSubmit={handleSubmit}>
                <div className="flex flex-col gap-2">
                  <div className="text-lg">
                    Upload at least 1 Video of your product
                  </div>
                  <div className="flex gap-3 flex-wrap">
                    {productVideo ? (
                      <div className="relative w-24 h-24 border border-[#CDCDCD] rounded-2xl overflow-hidden">
                        <video
                          src={URL.createObjectURL(productVideo)}
                          className="w-full h-full object-cover"
                          controls={false}
                          muted
                        />
                        <button
                          type="button"
                          onClick={() => setProductVideo(null)}
                          className="absolute top-1 right-1 w-5 h-5 bg-gray-600 rounded-full flex items-center justify-center text-white text-sm hover:bg-gray-800"
                        >
                          ×
                        </button>
                        <div className="absolute bottom-1 left-1 bg-black bg-opacity-70 text-white text-xs px-1 py-0.5 rounded flex items-center gap-1">
                          📹 Video
                        </div>
                      </div>
                    ) : (
                      <div className="border border-[#CDCDCD] rounded-2xl justify-center items-center w-24 h-24 relative cursor-pointer flex flex-col">
                        <input
                          type="file"
                          accept="video/*"
                          onChange={handleVideoUpload}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                        <img src={images.cam} alt="" />
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-2 mt-5">
                  <div className="text-lg">
                    Upload at least 3 clear pictures of your product
                  </div>
                  <div className="flex gap-3 flex-wrap">
                    {productImages.map((image, index) => (
                      <div
                        key={index}
                        className="relative w-24 h-24 border border-[#CDCDCD] rounded-2xl overflow-hidden"
                      >
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Product ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newImages = productImages.filter(
                              (_, i) => i !== index
                            );
                            setProductImages(newImages);
                          }}
                          className="absolute top-1 right-1 w-5 h-5 bg-gray-600 rounded-full flex items-center justify-center text-white text-sm hover:bg-gray-800"
                        >
                          ×
                        </button>
                      </div>
                    ))}

                    {productImages.length < 3 && (
                      <div className="border border-[#CDCDCD] rounded-2xl justify-center items-center w-24 h-24 relative cursor-pointer flex flex-col">
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageUpload}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                        <img src={images.cam} alt="" />
                      </div>
                    )}
                  </div>
                  {errors.productImages && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.productImages}
                    </p>
                  )}
                </div>
                <div className="mt-5 flex flex-col gap-2">
                  <label htmlFor="productName" className="text-lg">
                    Product Name
                  </label>
                  <input
                    type="text"
                    name="productName"
                    id="productName"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="Enter product name"
                    className={`border rounded-2xl p-5 ${
                      errors.productName ? "border-red-500" : "border-[#989898]"
                    }`}
                  />
                  {errors.productName && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.productName}
                    </p>
                  )}
                </div>

                {/* Category Dropdown */}
                <div className="mb-5 mt-5">
                  <label className="block text-lg text-black mb-2">
                    Category
                  </label>
                  <div className="relative">
                    <div
                      className={`flex items-center justify-between w-full p-5 border rounded-2xl cursor-pointer transition-colors ${
                        errors.category ? "border-red-500" : "border-[#989898]"
                      }`}
                      onClick={() => toggleDropdown("category")}
                    >
                      <div
                        className={
                          selectedCategory ? "text-black" : "text-[#00000080]"
                        }
                      >
                        {selectedCategory || "Select Category"}
                      </div>
                      <div
                        className={`transform transition-transform duration-200 ${
                          dropdownStates.category ? "rotate-90" : ""
                        }`}
                      >
                        <img src={images.rightarrow} alt="arrow" />
                      </div>
                    </div>

                    {dropdownStates.category && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-[#989898] rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {categories.map((category, index) => (
                          <div
                            key={index}
                            className="p-4 hover:bg-gray-50 cursor-pointer text-base border-b border-gray-100 last:border-b-0"
                            onClick={() => handleCategorySelect(category)}
                          >
                            {category}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {errors.category && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.category}
                    </p>
                  )}
                </div>

                <div className="mt-5 flex flex-col gap-2">
                  <label htmlFor="fullDescription" className="text-lg">
                    Full Description
                  </label>
                  <textarea
                    name="fullDescription"
                    id="fullDescription"
                    value={fullDescription}
                    onChange={(e) => setFullDescription(e.target.value)}
                    placeholder="Add full description"
                    rows={4}
                    className={`border rounded-2xl p-5 ${
                      errors.fullDescription
                        ? "border-red-500"
                        : "border-[#989898]"
                    }`}
                  />
                  {errors.fullDescription && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.fullDescription}
                    </p>
                  )}
                </div>

                {/* Price Range Dropdown */}
                <div className="mt-5">
                  <label className="block text-lg mb-2">Price Range</label>
                  <div className="relative">
                    <div
                      className={`flex items-center justify-between w-full p-5 border rounded-2xl cursor-pointer transition-colors ${
                        errors.priceRange
                          ? "border-red-500"
                          : "border-[#989898]"
                      }`}
                      onClick={() => toggleDropdown("priceRange")}
                    >
                      <div
                        className={
                          selectedPriceRange ? "text-black" : "text-[#00000080]"
                        }
                      >
                        {selectedPriceRange || "Type price"}
                      </div>
                      <div
                        className={`transform transition-transform duration-200 ${
                          dropdownStates.priceRange ? "rotate-90" : ""
                        }`}
                      >
                        <img src={images.rightarrow} alt="arrow" />
                      </div>
                    </div>

                    {dropdownStates.priceRange && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-[#989898] rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {priceRange.map((priceRange, index) => (
                          <div
                            key={index}
                            className="p-4 hover:bg-gray-50 cursor-pointer text-base border-b border-gray-100 last:border-b-0"
                            onClick={() => handlePriceRangeSelect(priceRange)}
                          >
                            {priceRange}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {errors.priceRange && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.priceRange}
                    </p>
                  )}
                </div>

                <div className="mt-5 flex flex-col gap-2">
                  <label htmlFor="discountPrice" className="text-lg">
                    Discount Price
                  </label>
                  <input
                    type="number"
                    name="discountPrice"
                    id="discountPrice"
                    value={discountPrice}
                    onChange={(e) => setDiscountPrice(e.target.value)}
                    placeholder="Type Discount Price"
                    className="border border-[#989898] rounded-2xl p-5"
                  />
                </div>

                <div className="mt-5 text-xl font-medium">
                  Add Sub-Service (Optional)
                </div>
                <div className="mt-1 text-sm text-[#00000080] ">
                  You can add subservices name and prices for more clarity to
                  your users
                </div>

                <div className="mt-5">
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-row">
                      <div className="text-xl font-medium w-55">Name</div>
                      <div className="text-xl font-medium">Price</div>
                    </div>
                    {subServices.map((service, index) => (
                      <div key={index} className="flex flex-row justify-between">
                        <div className="">
                          <input
                            type="text"
                            name={`subServiceName${index + 1}`}
                            id={`subServiceName${index + 1}`}
                            value={service.name}
                            onChange={(e) => handleSubServiceChange(index, 'name', e.target.value)}
                            placeholder={`Sub service name ${index + 1}`}
                            className="p-5 border border-[#989898] rounded-xl w-50"
                          />
                        </div>
                        <div className="flex flex-row gap-3.5">
                          <div>
                            <input
                              type="text"
                              name={`from${index + 1}`}
                              id={`from${index + 1}`}
                              value={service.from}
                              onChange={(e) => handleSubServiceChange(index, 'from', e.target.value)}
                              placeholder="From"
                              className="p-5 border border-[#989898] rounded-xl w-26.5"
                            />
                          </div>
                          <div>
                            <input
                              type="text"
                              name={`to${index + 1}`}
                              id={`to${index + 1}`}
                              value={service.to}
                              onChange={(e) => handleSubServiceChange(index, 'to', e.target.value)}
                              placeholder="To"
                              className="p-5 border border-[#989898] rounded-xl w-26.5"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-5" >
                    <button 
                      type="submit" 
                      className="bg-[#E53E3E] w-full text-white py-4 cursor-pointer rounded-xl disabled:opacity-50"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Posting..." : "Post Service"}
                    </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ServiceModal;