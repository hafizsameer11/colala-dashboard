import { useState, useEffect } from "react";
import images from "../../../constants/images";

interface AddNewProductProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddNewProduct: React.FC<AddNewProductProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  // Form field states
  const [productName, setProductName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [fullDescription, setFullDescription] = useState("");
  const [price, setPrice] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");
  const [selectedVarient, setSelectedVarient] = useState("");
  const [selectedCoupon, setSelectedCoupon] = useState("");
  const [loyaltyPoints, setLoyaltyPoints] = useState(false);
  const [informationTag1, setInformationTag1] = useState("");
  const [informationTag2, setInformationTag2] = useState("");
  const [informationTag3, setInformationTag3] = useState("");
  const [selectedAvailableLocation, setSelectedAvailableLocation] =
    useState("");
  const [selectedDeliveryLocation, setSelectedDeliveryLocation] = useState("");

  // File upload states
  const [productVideo, setProductVideo] = useState<File | null>(null);
  const [productImages, setProductImages] = useState<File[]>([]);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [dropdownStates, setDropdownStates] = useState({
    category: false,
    brand: false,
    varient: false,
    coupon: false,
    availableLocation: false,
    deliveryLocation: false,
  });

  // Error state for validation
  const [errors, setErrors] = useState({
    productName: "",
    category: "",
    brand: "",
    shortDescription: "",
    fullDescription: "",
    price: "",
    varient: "",
    coupon: "",
    availableLocation: "",
    deliveryLocation: "",
    productImages: "",
  });

  const categories = ["Electronics", "Fashion", "Home Appliances"];
  const brands = ["Samsung", "Apple", "LG"];
  const varients = ["16GB", "32GB", "64GB"];
  const coupons = ["BLACKFRIDAY", "CYBERMONDAY", "NEWYEAR"];
  const availableLocations = ["Warehouse A", "Warehouse B", "Warehouse C"];
  const deliveryLocations = ["City A", "City B", "City C"];

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
      brand: false,
      varient: false,
      coupon: false,
      availableLocation: false,
      deliveryLocation: false,
    });
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    closeAllDropdowns();
  };

  const handleBrandSelect = (brand: string) => {
    setSelectedBrand(brand);
    closeAllDropdowns();
  };

  const handleVarientSelect = (varient: string) => {
    setSelectedVarient(varient);
    closeAllDropdowns();
  };

  const handleCouponSelect = (coupon: string) => {
    setSelectedCoupon(coupon);
    closeAllDropdowns();
  };

  const handleAvailableLocationSelect = (location: string) => {
    setSelectedAvailableLocation(location);
    closeAllDropdowns();
  };

  const handleDeliveryLocationSelect = (location: string) => {
    setSelectedDeliveryLocation(location);
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

  // Form validation
  const validateForm = () => {
    const newErrors = {
      productName: productName.trim() === "" ? "Product name is required" : "",
      category: selectedCategory === "" ? "Category is required" : "",
      brand: selectedBrand === "" ? "Brand is required" : "",
      shortDescription:
        shortDescription.trim() === "" ? "Short description is required" : "",
      fullDescription:
        fullDescription.trim() === "" ? "Full description is required" : "",
      price: price.trim() === "" ? "Price is required" : "",
      varient: "",
      coupon: "",
      availableLocation:
        selectedAvailableLocation === ""
          ? "Available location is required"
          : "",
      deliveryLocation:
        selectedDeliveryLocation === "" ? "Delivery location is required" : "",
      productImages:
        productImages.length < 3 ? "At least 3 images are required" : "",
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
      // Create product data object
      const productData = {
        productName,
        category: selectedCategory,
        brand: selectedBrand,
        shortDescription,
        fullDescription,
        price: parseFloat(price),
        discountPrice: discountPrice ? parseFloat(discountPrice) : null,
        variant: selectedVarient,
        couponCode: selectedCoupon,
        loyaltyPointsAllowed: loyaltyPoints,
        informationTags: [
          informationTag1,
          informationTag2,
          informationTag3,
        ].filter((tag) => tag.trim() !== ""),
        availableLocation: selectedAvailableLocation,
        deliveryLocation: selectedDeliveryLocation,
        video: productVideo,
        images: productImages,
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
    setSelectedBrand("");
    setShortDescription("");
    setFullDescription("");
    setPrice("");
    setDiscountPrice("");
    setSelectedVarient("");
    setSelectedCoupon("");
    setLoyaltyPoints(false);
    setInformationTag1("");
    setInformationTag2("");
    setInformationTag3("");
    setSelectedAvailableLocation("");
    setSelectedDeliveryLocation("");
    setProductVideo(null);
    setProductImages([]);
    setErrors({
      productName: "",
      category: "",
      brand: "",
      shortDescription: "",
      fullDescription: "",
      price: "",
      varient: "",
      coupon: "",
      availableLocation: "",
      deliveryLocation: "",
      productImages: "",
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "text/csv") {
      setUploadedFile(file);
    } else {
      alert("Please upload a valid CSV file");
    }
  };

  const handleBulkUpload = async () => {
    if (!uploadedFile) {
      alert("Please select a CSV file to upload");
      return;
    }

    setIsUploading(true);

    try {
      // Read the CSV file
      const text = await uploadedFile.text();
      const lines = text.split("\n");
      const headers = lines[0]
        .split(",")
        .map((header) => header.replace(/"/g, "").trim());

      // Validate headers
      const expectedHeaders = [
        "Product Name",
        "Category",
        "Brand",
        "Short Description",
        "Full Description",
        "Price",
        "Discount Price",
        "Variant",
        "Coupon Code",
        "Loyalty Points Allowed",
        "Information Tag 1",
        "Information Tag 2",
        "Information Tag 3",
        "Available Locations",
        "Delivery Locations",
        "Video URL",
        "Image 1 URL",
        "Image 2 URL",
        "Image 3 URL",
      ];

      const isValidFormat = expectedHeaders.every((header) =>
        headers.includes(header)
      );

      if (!isValidFormat) {
        alert("Invalid CSV format. Please use the downloaded template.");
        setIsUploading(false);
        return;
      }

      // Process each product row
      const products = [];
      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim() === "") continue; // Skip empty lines

        const values = lines[i]
          .split(",")
          .map((value) => value.replace(/"/g, "").trim());

        if (values.length >= expectedHeaders.length) {
          const product = {
            productName: values[0],
            category: values[1],
            brand: values[2],
            shortDescription: values[3],
            fullDescription: values[4],
            price: values[5],
            discountPrice: values[6],
            variant: values[7],
            couponCode: values[8],
            loyaltyPoints: values[9],
            infoTag1: values[10],
            infoTag2: values[11],
            infoTag3: values[12],
            availableLocations: values[13],
            deliveryLocations: values[14],
            videoUrl: values[15],
            image1Url: values[16],
            image2Url: values[17],
            image3Url: values[18],
          };

          products.push(product);
        }
      }

      // Simulate API call (replace with actual API endpoint)
      await new Promise((resolve) => setTimeout(resolve, 2000));

      console.log("Products to upload:", products);
      alert(
        `Successfully processed ${products.length} products from CSV file!`
      );

      // Reset the file input
      setUploadedFile(null);
      const fileInput = document.getElementById(
        "csvFileInput"
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    } catch (error) {
      console.error("Error processing CSV:", error);
      alert(
        "Error processing the CSV file. Please check the format and try again."
      );
    } finally {
      setIsUploading(false);
    }
  };

  const downloadCSVTemplate = () => {
    // Create PDF using data URL
    const generatePDFDataURL = () => {
      const content = `
        %PDF-1.4
        1 0 obj
        <<
        /Type /Catalog
        /Pages 2 0 R
        >>
        endobj
        
        2 0 obj
        <<
        /Type /Pages
        /Kids [3 0 R]
        /Count 1
        >>
        endobj
        
        3 0 obj
        <<
        /Type /Page
        /Parent 2 0 R
        /MediaBox [0 0 612 792]
        /Contents 4 0 R
        /Resources <<
          /Font << /F1 5 0 R >>
        >>
        >>
        endobj
        
        4 0 obj
        <<
        /Length 2000
        >>
        stream
        BT
        /F1 24 Tf
        50 750 Td
        (Product Bulk Upload Template) Tj
        0 -30 Td
        /F1 12 Tf
        (Instructions:) Tj
        0 -20 Td
        (1. Fill in all required fields for each product) Tj
        0 -15 Td
        (2. Use pipe separator | for multiple values) Tj
        0 -15 Td
        (3. Ensure all URLs are valid and accessible) Tj
        0 -15 Td
        (4. Save as CSV format when ready to upload) Tj
        0 -30 Td
        (Field Specifications:) Tj
        0 -20 Td
        (Product Name - iPhone 14 Pro Max - Required) Tj
        0 -15 Td
        (Category - Electronics - Required) Tj
        0 -15 Td
        (Brand - Apple - Required) Tj
        0 -15 Td
        (Short Description - Latest iPhone... - Required) Tj
        0 -15 Td
        (Price - 150000 - Required) Tj
        0 -15 Td
        (Discount Price - 140000 - Optional) Tj
        0 -15 Td
        (Variant - 128GB|256GB|512GB - Optional) Tj
        0 -15 Td
        (Available Locations - Warehouse A|B - Required) Tj
        0 -15 Td
        (Delivery Locations - City A|B|C - Required) Tj
        ET
        endstream
        endobj
        
        5 0 obj
        <<
        /Type /Font
        /Subtype /Type1
        /BaseFont /Helvetica
        >>
        endobj
        
        xref
        0 6
        0000000000 65535 f 
        0000000010 00000 n 
        0000000079 00000 n 
        0000000173 00000 n 
        0000000301 00000 n 
        0000002356 00000 n 
        trailer
        <<
        /Size 6
        /Root 1 0 R
        >>
        startxref
        2456
        %%EOF
      `;

      return content;
    };

    // Create PDF blob and download
    const pdfContent = generatePDFDataURL();
    const blob = new Blob([pdfContent], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "product_bulk_template.pdf";
    link.style.display = "none";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-100 bg-[#00000080] bg-opacity-50 flex justify-end">
      <div className="bg-white w-[500px] relative h-full overflow-y-auto">
        {/* Header */}
        <div className="border-b border-[#787878] px-3 py-3 sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Add New Product</h2>
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
                      <img src={images?.rightarrow} alt="arrow" />
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
                  <p className="text-red-500 text-sm mt-1">{errors.category}</p>
                )}
              </div>

              {/* Brand Dropdown */}
              <div className="">
                <label className="block text-lg mb-2">Brand</label>
                <div className="relative">
                  <div
                    className={`flex items-center justify-between w-full p-5 border rounded-2xl cursor-pointer transition-colors ${
                      errors.brand ? "border-red-500" : "border-[#989898]"
                    }`}
                    onClick={() => toggleDropdown("brand")}
                  >
                    <div
                      className={
                        selectedBrand ? "text-black" : "text-[#00000080]"
                      }
                    >
                      {selectedBrand || "Select Brand"}
                    </div>
                    <div
                      className={`transform transition-transform duration-200 ${
                        dropdownStates.brand ? "rotate-90" : ""
                      }`}
                    >
                      <img src={images?.rightarrow} alt="arrow" />
                    </div>
                  </div>

                  {dropdownStates.brand && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-[#989898] rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {brands.map((brand, index) => (
                        <div
                          key={index}
                          className="p-4 hover:bg-gray-50 cursor-pointer text-base border-b border-gray-100 last:border-b-0"
                          onClick={() => handleBrandSelect(brand)}
                        >
                          {brand}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {errors.brand && (
                  <p className="text-red-500 text-sm mt-1">{errors.brand}</p>
                )}
              </div>

              <div className="mt-5 flex flex-col gap-2">
                <label htmlFor="shortDescription" className="text-lg">
                  Short Description
                </label>
                <input
                  type="text"
                  name="shortDescription"
                  id="shortDescription"
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder="Type description"
                  className={`border rounded-2xl p-5 ${
                    errors.shortDescription
                      ? "border-red-500"
                      : "border-[#989898]"
                  }`}
                />
                {errors.shortDescription && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.shortDescription}
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
              <div className="mt-5 flex flex-col gap-2">
                <label htmlFor="price" className="text-lg">
                  Price
                </label>
                <input
                  type="number"
                  name="price"
                  id="price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Type Price"
                  className={`border rounded-2xl p-5 ${
                    errors.price ? "border-red-500" : "border-[#989898]"
                  }`}
                />
                {errors.price && (
                  <p className="text-red-500 text-sm mt-1">{errors.price}</p>
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
              <div className="mt-5 text-md underline text-[#E53E3E] cursor-pointer">
                Add Wholesale prices
              </div>
              {/* Varient Dropdown */}
              <div className="mt-5">
                <label className="block text-lg mb-2">Add Variant</label>
                <div className="relative">
                  <div
                    className={`flex items-center justify-between w-full p-5 border rounded-2xl cursor-pointer transition-colors ${
                      errors.varient ? "border-red-500" : "border-[#989898]"
                    }`}
                    onClick={() => toggleDropdown("varient")}
                  >
                    <div
                      className={
                        selectedVarient ? "text-black" : "text-[#00000080]"
                      }
                    >
                      {selectedVarient || "Add New description"}
                    </div>
                    <div
                      className={`transform transition-transform duration-200 ${
                        dropdownStates.varient ? "rotate-90" : ""
                      }`}
                    >
                      <img src={images?.rightarrow} alt="arrow" />
                    </div>
                  </div>

                  {dropdownStates.varient && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-[#989898] rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {varients.map((varient, index) => (
                        <div
                          key={index}
                          className="p-4 hover:bg-gray-50 cursor-pointer text-base border-b border-gray-100 last:border-b-0"
                          onClick={() => handleVarientSelect(varient)}
                        >
                          {varient}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {errors.varient && (
                  <p className="text-red-500 text-sm mt-1">{errors.varient}</p>
                )}
              </div>
              {/* Coupon Code Dropdown */}
              <div className="mt-5">
                <label className="block text-lg mb-2">Add Coupon Code</label>
                <div className="relative">
                  <div
                    className={`flex items-center justify-between w-full p-5 border rounded-2xl cursor-pointer transition-colors ${
                      errors.coupon ? "border-red-500" : "border-[#989898]"
                    }`}
                    onClick={() => toggleDropdown("coupon")}
                  >
                    <div
                      className={
                        selectedCoupon ? "text-black" : "text-[#00000080]"
                      }
                    >
                      {selectedCoupon || "Choose coupon code"}
                    </div>
                    <div
                      className={`transform transition-transform duration-200 ${
                        dropdownStates.coupon ? "rotate-90" : ""
                      }`}
                    >
                      <img src={images?.rightarrow} alt="arrow" />
                    </div>
                  </div>

                  {dropdownStates.coupon && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-[#989898] rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {coupons.map((coupon, index) => (
                        <div
                          key={index}
                          className="p-4 hover:bg-gray-50 cursor-pointer text-base border-b border-gray-100 last:border-b-0"
                          onClick={() => handleCouponSelect(coupon)}
                        >
                          {coupon}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {errors.coupon && (
                  <p className="text-red-500 text-sm mt-1">{errors.coupon}</p>
                )}
              </div>
              <div className="mt-5 flex flex-row gap-2">
                <div>
                  <input
                    className="w-5 h-5 mt-1"
                    type="checkbox"
                    name="buyerscanuseloyaltypoints"
                    id="buyerscanuseloyaltypoints"
                    checked={loyaltyPoints}
                    onChange={(e) => setLoyaltyPoints(e.target.checked)}
                  />
                </div>
                <div className="text-md font-medium">
                  Buyers can use loyalty points during purchase
                </div>
              </div>
              <div className="mt-5 flex flex-col gap-2">
                <label htmlFor="informationTag" className="text-lg">
                  Information tag
                </label>
                <input
                  type="text"
                  name="informationTag1"
                  id="informationTag1"
                  value={informationTag1}
                  onChange={(e) => setInformationTag1(e.target.value)}
                  placeholder="Information Tag 1"
                  className="border border-[#989898] rounded-2xl p-5 mb-2"
                />
                <input
                  type="text"
                  name="informationTag2"
                  id="informationTag2"
                  value={informationTag2}
                  onChange={(e) => setInformationTag2(e.target.value)}
                  placeholder="Information Tag 2"
                  className="border border-[#989898] rounded-2xl p-5 mb-2"
                />
                <input
                  type="text"
                  name="informationTag3"
                  id="informationTag3"
                  value={informationTag3}
                  onChange={(e) => setInformationTag3(e.target.value)}
                  placeholder="Information Tag 3"
                  className="border border-[#989898] rounded-2xl p-5"
                />
              </div>

              {/* Availability locations Dropdown */}
              <div className="mt-5">
                <label className="block text-lg mb-2">
                  Availability locations
                </label>
                <div className="relative">
                  <div
                    className={`flex items-center justify-between w-full p-5 border rounded-2xl cursor-pointer transition-colors ${
                      errors.availableLocation
                        ? "border-red-500"
                        : "border-[#989898]"
                    }`}
                    onClick={() => toggleDropdown("availableLocation")}
                  >
                    <div
                      className={
                        selectedAvailableLocation
                          ? "text-black"
                          : "text-[#00000080]"
                      }
                    >
                      {selectedAvailableLocation || "Available locations"}
                    </div>
                    <div
                      className={`transform transition-transform duration-200 ${
                        dropdownStates.availableLocation ? "rotate-90" : ""
                      }`}
                    >
                      <img src={images?.rightarrow} alt="arrow" />
                    </div>
                  </div>

                  {dropdownStates.availableLocation && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-[#989898] rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {availableLocations.map((location, index) => (
                        <div
                          key={index}
                          className="p-4 hover:bg-gray-50 cursor-pointer text-base border-b border-gray-100 last:border-b-0"
                          onClick={() =>
                            handleAvailableLocationSelect(location)
                          }
                        >
                          {location}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {errors.availableLocation && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.availableLocation}
                  </p>
                )}
              </div>

              {/* Delivery locations Dropdown */}
              <div className="mt-5">
                <label className="block text-lg mb-2">Delivery locations</label>
                <div className="relative">
                  <div
                    className={`flex items-center justify-between w-full p-5 border rounded-2xl cursor-pointer transition-colors ${
                      errors.deliveryLocation
                        ? "border-red-500"
                        : "border-[#989898]"
                    }`}
                    onClick={() => toggleDropdown("deliveryLocation")}
                  >
                    <div
                      className={
                        selectedDeliveryLocation
                          ? "text-black"
                          : "text-[#00000080]"
                      }
                    >
                      {selectedDeliveryLocation || "Delivery locations"}
                    </div>
                    <div
                      className={`transform transition-transform duration-200 ${
                        dropdownStates.deliveryLocation ? "rotate-90" : ""
                      }`}
                    >
                      <img src={images?.rightarrow} alt="arrow" />
                    </div>
                  </div>

                  {dropdownStates.deliveryLocation && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-[#989898] rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {deliveryLocations.map((location, index) => (
                        <div
                          key={index}
                          className="p-4 hover:bg-gray-50 cursor-pointer text-base border-b border-gray-100 last:border-b-0"
                          onClick={() => handleDeliveryLocationSelect(location)}
                        >
                          {location}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {errors.deliveryLocation && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.deliveryLocation}
                  </p>
                )}
              </div>

              <div className="mt-5">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full text-white py-4 rounded-xl font-medium transition-all ${
                    isSubmitting
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-[#E53E3E] cursor-pointer hover:bg-red-600"
                  }`}
                >
                  {isSubmitting ? "Creating Product..." : "Post Product"}
                </button>
              </div>

              <div className="mt-5 flex flex-col gap-4">
                <div>
                  Upload several products at once with our bulk template, follow
                  the steps below to proceed:
                </div>
                <div className="flex flex-row gap-2 items-center">
                  <div className="rounded-full bg-[#E53E3E] w-5 h-5"></div>
                  <div className="text-[#000000B2] text-sm">
                    Download bulk template below
                  </div>
                </div>
                <div className="flex flex-row gap-2 items-center">
                  <div className="rounded-full bg-[#E53E3E] w-5 h-5"></div>
                  <div className="text-[#000000B2] text-sm">
                    Fill the template accordingly
                  </div>
                </div>
                <div className="flex flex-row gap-2 items-center">
                  <div className="rounded-full bg-[#E53E3E] w-5 h-5"></div>
                  <div className="text-[#000000B2] text-sm">
                    Upload the filled template in the space provided
                  </div>
                </div>
                <div className="flex flex-row gap-2 items-center">
                  <div className="rounded-full bg-[#E53E3E] w-5 h-5"></div>
                  <div className="text-[#000000B2] text-sm">
                    Bulk Upload Successful
                  </div>
                </div>
              </div>
              <div className="flex flex-row border border-[#CDCDCD] rounded-2xl p-3 mt-5 pl-8 justify-between">
                <div className="flex gap-2">
                  <div>
                    <img src={images.csv} alt="" className="w-13 h-13" />
                  </div>
                  <div className="flex flex-col">
                    <div className="text-md">Download CSV bulk template</div>
                    <div className="text-sm text-[#00000080]">200 kb</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <img
                    className="cursor-pointer w-8 h-8"
                    src={images.DownloadSimple}
                    alt=""
                    onClick={downloadCSVTemplate}
                  />
                </div>
              </div>
              <div className="border border-[#CDCDCD] rounded-2xl flex flex-col items-center justify-center w-full mt-5 p-10 gap-2 relative">
                <input
                  type="file"
                  id="csvFileInput"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <div>
                  <img
                    className="cursor-pointer w-8 h-8"
                    src={images.UploadSimple}
                    alt=""
                  />
                </div>
                <div className="text-[#00000080]">
                  {uploadedFile
                    ? `Selected: ${uploadedFile.name}`
                    : "Upload Filled template"}
                </div>
                {uploadedFile && (
                  <div className="text-sm text-green-600 mt-2">
                    ✓ CSV file ready for upload
                  </div>
                )}
              </div>
              <div className="mt-5">
                <button
                  type="button"
                  onClick={handleBulkUpload}
                  disabled={!uploadedFile || isUploading}
                  className={`w-full text-white rounded-xl py-4 font-medium transition-all ${
                    !uploadedFile || isUploading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-[#000] cursor-pointer hover:bg-gray-800"
                  }`}
                >
                  {isUploading ? "Processing CSV..." : "Upload bulk Products"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddNewProduct;
