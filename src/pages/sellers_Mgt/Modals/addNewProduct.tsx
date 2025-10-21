import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { createProduct, updateSellerProduct, getCategories, getBrands, getCSVTemplate, uploadBulkProductsCSV } from "../../../utils/queries/users";
import images from "../../../constants/images";
import AddAddressModal from "./addAddressModal";
import AddNewDeliveryPricing from "./addNewDeliveryPricing";
import { useToast } from "../../../contexts/ToastContext";

interface AddNewProductProps {
  isOpen: boolean;
  onClose: () => void;
  selectedStore?: any;
  editMode?: boolean;
  initialProductData?: any;
}

const AddNewProduct: React.FC<AddNewProductProps> = ({ isOpen, onClose, selectedStore, editMode = false, initialProductData }) => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  // Fetch categories and brands data
  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
    enabled: isOpen,
    staleTime: 5 * 60 * 1000,
  });

  const { data: brandsData, isLoading: brandsLoading } = useQuery({
    queryKey: ['brands'],
    queryFn: getBrands,
    enabled: isOpen,
    staleTime: 5 * 60 * 1000,
  });

  // Create/Update product mutation
  const createProductMutation = useMutation({
    mutationFn: (formData: FormData) => {
      if (editMode && initialProductData?.product_info?.id && selectedStore?.id) {
        return updateSellerProduct(selectedStore.id, initialProductData.product_info.id, formData);
      }
      return createProduct(formData);
    },
    onSuccess: () => {
      const action = editMode ? 'updated' : 'created';
      showToast(`Product ${action} successfully!`, 'success');
      // Invalidate and refetch products data
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      queryClient.invalidateQueries({ queryKey: ['sellerProducts'] });
      queryClient.invalidateQueries({ queryKey: ['adminProductDetails'] });
      queryClient.invalidateQueries({ queryKey: ['sellerProductDetails'] });
      // Reset form and close modal
      resetForm();
      onClose();
    },
    onError: (error) => {
      const action = editMode ? 'update' : 'create';
      console.error(`Failed to ${action} product:`, error);
      showToast(`Failed to ${action} product`, 'error');
      setIsSubmitting(false);
    },
  });

  // Bulk upload mutation
  const bulkUploadMutation = useMutation({
    mutationFn: uploadBulkProductsCSV,
    onSuccess: () => {
      showToast('Products uploaded successfully!', 'success');
      
      // Reset the file input
      setUploadedFile(null);
      const fileInput = document.getElementById('csvFileInput') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
      // Invalidate and refetch products data
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      queryClient.invalidateQueries({ queryKey: ['sellerProducts'] });
    },
    onError: (error) => {
      console.error('Error uploading CSV:', error);
      showToast('Error uploading CSV file. Please check the format and try again.', 'error');
    }
  });

  // CSV Template download mutation
  const downloadTemplateMutation = useMutation({
    mutationFn: getCSVTemplate,
    onSuccess: (response) => {
      try {
        const templateData = response.data;
        
        // Create CSV content from template data
        const headers = templateData.headers.join(',');
        const sampleRow = Object.values(templateData.sample_row).join(',');
        
        const csvContent = `${headers}\n${sampleRow}`;
        
        // Create and download CSV file
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = 'product_bulk_template.csv';
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up
        URL.revokeObjectURL(url);
        
        showToast('CSV template downloaded successfully', 'success');
      } catch (error) {
        console.error('Error processing CSV template:', error);
        showToast('Error downloading CSV template', 'error');
      }
    },
    onError: (error) => {
      console.error('Error downloading CSV template:', error);
      showToast('Failed to download CSV template', 'error');
    }
  });

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
  const [hasVariants, setHasVariants] = useState(false);
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [showAddDeliveryModal, setShowAddDeliveryModal] = useState(false);
  
  // Variant states
  const [variants, setVariants] = useState<Array<{
    id?: number;
    sku?: string;
    color?: string;
    size?: string;
    price?: string;
    discount_price?: string;
    stock?: string;
    images?: File[];
  }>>([]);
  const [informationTag1, setInformationTag1] = useState("");
  const [informationTag2, setInformationTag2] = useState("");
  const [informationTag3, setInformationTag3] = useState("");
  const [selectedAvailableLocation, setSelectedAvailableLocation] =
    useState("");
  const [selectedDeliveryLocation, setSelectedDeliveryLocation] = useState("");

  // File upload states
  const [productVideo, setProductVideo] = useState<File | null>(null);
  const [productImages, setProductImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<Array<{id: string, url: string, path: string}>>([]);
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

  // Populate form with initial data when in edit mode
  useEffect(() => {
    if (editMode && initialProductData) {
      const productInfo = initialProductData.product_info;
      const variantsData = initialProductData.variants || [];
      const imagesData = initialProductData.images || [];
      
      if (productInfo) {
        setProductName(productInfo.name || "");
        setSelectedCategory(productInfo.category_id?.toString() || "");
        setSelectedBrand(productInfo.brand || "");
        setShortDescription(productInfo.description || "");
        setFullDescription(productInfo.description || "");
        setPrice(productInfo.price?.toString() || "");
        setDiscountPrice(productInfo.discount_price?.toString() || "");
        setHasVariants(productInfo.has_variants || false);
        setLoyaltyPoints(productInfo.loyalty_points_applicable || false);
        
        // Set existing images data
        if (imagesData.length > 0) {
          setExistingImages(imagesData.map((img: any) => ({
            id: img.id?.toString() || "",
            url: img.url || img.path || "",
            path: img.path || img.url || "",
          })));
        }
        
        // Set variants data
        if (variantsData.length > 0) {
          setVariants(variantsData.map((variant: any) => ({
            id: variant.id,
            sku: variant.sku || "",
            color: variant.color || "",
            size: variant.size || "",
            price: variant.price?.toString() || "",
            discount_price: variant.discount_price?.toString() || "",
            stock: variant.stock?.toString() || "",
            images: variant.images || [],
          })));
        }
      }
    }
  }, [editMode, initialProductData]);

  // Extract categories and brands from API data
  const categories = categoriesData?.data || [];
  const brands = brandsData?.data || [];
  const varients = ["16GB", "32GB", "64GB"];
  const coupons = ["BLACKFRIDAY", "CYBERMONDAY", "NEWYEAR"];

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

  if (!isOpen) return null;

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
        (existingImages.length + productImages.length) < 3 ? "At least 3 images are required" : "",
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
      // Create FormData for the API
      const formData = new FormData();
      
      // Add required fields according to backend validation
      formData.append('store_id', selectedStore?.id?.toString() || '');
      formData.append('name', productName);
      formData.append('description', fullDescription);
      formData.append('price', price);
      formData.append('quantity', '0'); // Default quantity
      
      // Add category_id
      if (selectedCategory) {
        formData.append('category_id', selectedCategory);
      } else {
        formData.append('category_id', '1'); // Default category
      }
      
      if (selectedBrand) {
        formData.append('brand', selectedBrand);
      }
      
      if (fullDescription) {
        formData.append('description', fullDescription);
      }
      
      if (price) {
        formData.append('price', price);
      }
      
      if (discountPrice) {
        formData.append('discount_price', discountPrice);
      }
      
      // Add status (nullable field)
      formData.append('status', 'draft'); // Default to draft
      
      // Add video file (nullable)
      if (productVideo) {
        formData.append('video', productVideo);
      }
      
      // Add coupon code if selected (nullable)
      if (selectedCoupon) {
        formData.append('coupon_code', selectedCoupon);
      }
      
      // Add discount if applicable (nullable)
      if (discountPrice) {
        formData.append('discount', discountPrice);
      }
      
      // Add loyalty points (boolean)
      formData.append('loyality_points_applicable', loyaltyPoints.toString());
      
      // Add existing image IDs (for edit mode)
      if (editMode && existingImages.length > 0) {
        existingImages.forEach((image, index) => {
          formData.append(`existing_images[${index}][id]`, image.id);
          formData.append(`existing_images[${index}][url]`, image.url);
        });
      }
      
      // Add new image files (array)
      productImages.forEach((image, index) => {
        formData.append(`images[${index}]`, image);
      });
      
      // Add variants (array) - only if has_variants is true
      if (hasVariants && variants.length > 0) {
        variants.forEach((variant, index) => {
          if (variant.id) formData.append(`variants[${index}][id]`, variant.id.toString());
          if (variant.sku) formData.append(`variants[${index}][sku]`, variant.sku);
          if (variant.color) formData.append(`variants[${index}][color]`, variant.color);
          if (variant.size) formData.append(`variants[${index}][size]`, variant.size);
          if (variant.price) formData.append(`variants[${index}][price]`, variant.price);
          if (variant.discount_price) formData.append(`variants[${index}][discount_price]`, variant.discount_price);
          if (variant.stock) formData.append(`variants[${index}][stock]`, variant.stock);
          
          // Add variant images if any
          if (variant.images && variant.images.length > 0) {
            variant.images.forEach((image, imgIndex) => {
              formData.append(`variants[${index}][images][${imgIndex}]`, image);
            });
          }
        });
      }

      // Call the mutation
      await createProductMutation.mutateAsync(formData);
      
    } catch (error) {
      console.error("Error creating product:", error);
      alert("Error creating product. Please try again.");
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
    setHasVariants(false);
    setVariants([]);
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

  // Variant management functions
  const addVariant = () => {
    setVariants([...variants, {
      sku: '',
      color: '',
      size: '',
      price: '',
      discount_price: '',
      stock: '',
      images: []
    }]);
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const updateVariant = (index: number, field: string, value: string | File[]) => {
    const updatedVariants = [...variants];
    updatedVariants[index] = {
      ...updatedVariants[index],
      [field]: value
    };
    setVariants(updatedVariants);
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
      showToast('Please select a CSV file to upload', 'warning');
      return;
    }

    setIsUploading(true);

    try {
      // Call the API with the CSV file
      await bulkUploadMutation.mutateAsync(uploadedFile);
    } catch (error) {
      console.error('Error processing CSV:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const downloadCSVTemplate = () => {
    downloadTemplateMutation.mutate();
  };

  return (
    <div className="fixed inset-0 z-100 bg-[#00000080] bg-opacity-50 flex justify-end">
      <div className="bg-white w-[500px] relative h-full overflow-y-auto">
        {/* Header */}
        <div className="border-b border-[#787878] px-3 py-3 sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">{editMode ? 'Edit Product' : 'Add New Product'}</h2>
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
                  {/* Display existing images */}
                  {existingImages.map((image, index) => (
                    <div
                      key={`existing-${image.id}`}
                      className="relative w-24 h-24 border border-[#CDCDCD] rounded-2xl overflow-hidden"
                    >
                      <img
                        src={image.url.startsWith('http') ? image.url : `https://colala.hmstech.xyz/storage/${image.path}`}
                        alt={`Existing Product ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newExistingImages = existingImages.filter(
                            (_, i) => i !== index
                          );
                          setExistingImages(newExistingImages);
                        }}
                        className="absolute top-1 right-1 w-5 h-5 bg-gray-600 rounded-full flex items-center justify-center text-white text-sm hover:bg-gray-800"
                      >
                        ×
                      </button>
                    </div>
                  ))}

                  {/* Display new uploaded images */}
                  {productImages.map((image, index) => (
                    <div
                      key={`new-${index}`}
                      className="relative w-24 h-24 border border-[#CDCDCD] rounded-2xl overflow-hidden"
                    >
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`New Product ${index + 1}`}
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

                  {/* Show upload button if total images (existing + new) < 3 */}
                  {(existingImages.length + productImages.length) < 3 && (
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
                      {categoriesLoading ? (
                        <div className="p-4 text-center text-gray-500">Loading categories...</div>
                      ) : categories.length > 0 ? (
                        categories.map((category: any) => (
                          <div
                            key={category.id}
                            className="p-4 hover:bg-gray-50 cursor-pointer text-base border-b border-gray-100 last:border-b-0"
                            onClick={() => handleCategorySelect(category.id.toString())}
                          >
                            {category.title}
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center text-gray-500">No categories available</div>
                      )}
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
                      {brandsLoading ? (
                        <div className="p-4 text-center text-gray-500">Loading brands...</div>
                      ) : brands.length > 0 ? (
                        brands.map((brand: any) => (
                          <div
                            key={brand.id}
                            className="p-4 hover:bg-gray-50 cursor-pointer text-base border-b border-gray-100 last:border-b-0"
                            onClick={() => handleBrandSelect(brand.name)}
                          >
                            {brand.name}
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center text-gray-500">No brands available</div>
                      )}
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
                    onClick={() => setShowAddAddressModal(true)}
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
                    <div className="transform transition-transform duration-200">
                      <img src={images?.rightarrow} alt="arrow" />
                    </div>
                  </div>

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
                    onClick={() => setShowAddDeliveryModal(true)}
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
                    <div className="transform transition-transform duration-200">
                      <img src={images?.rightarrow} alt="arrow" />
                    </div>
                  </div>

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
                  {isSubmitting 
                    ? (editMode ? "Updating Product..." : "Creating Product...") 
                    : (editMode ? "Update Product" : "Post Product")
                  }
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
                    className={`cursor-pointer w-8 h-8 ${downloadTemplateMutation.isPending ? 'opacity-50' : ''}`}
                    src={images.DownloadSimple}
                    alt=""
                    onClick={downloadTemplateMutation.isPending ? undefined : downloadCSVTemplate}
                  />
                  {downloadTemplateMutation.isPending && (
                    <div className="ml-2 animate-spin rounded-full h-4 w-4 border-b-2 border-[#E53E3E]"></div>
                  )}
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
                  disabled={!uploadedFile || isUploading || bulkUploadMutation.isPending}
                  className={`w-full text-white rounded-xl py-4 font-medium transition-all ${
                    !uploadedFile || isUploading || bulkUploadMutation.isPending
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-[#000] cursor-pointer hover:bg-gray-800"
                  }`}
                >
                  {isUploading || bulkUploadMutation.isPending ? "Processing CSV..." : "Upload bulk Products"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Add Address Modal */}
      <AddAddressModal
        isOpen={showAddAddressModal}
        onClose={() => setShowAddAddressModal(false)}
        onAddressSaved={() => {
          setShowAddAddressModal(false);
          // You can add logic here to update the selected available location
        }}
      />

      {/* Add Delivery Modal */}
      <AddNewDeliveryPricing
        isOpen={showAddDeliveryModal}
        onClose={() => setShowAddDeliveryModal(false)}
        onSave={() => {
          setShowAddDeliveryModal(false);
          // You can add logic here to update the selected delivery location
        }}
      />
    </div>
  );
};

export default AddNewProduct;
