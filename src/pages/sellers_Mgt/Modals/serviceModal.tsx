import images from "../../../constants/images";
import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { createService, updateService, getAdminServiceDetails } from "../../../utils/queries/users";
import { getServiceCategoriesPublic } from "../../../utils/queries/serviceCategories";
import { useToast } from "../../../contexts/ToastContext";

interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedStore?: any;
  editingService?: {
    id: number;
    name: string;
    short_description: string;
    full_description: string;
    price_from: string;
    price_to: string | null;
    discount_price: string | null;
    category_id?: number;
    status: string;
  } | null;
}

interface SubService {
  name: string;
  from: string;
  to: string;
}

const ServiceModal: React.FC<ServiceModalProps> = ({ isOpen, onClose, selectedStore, editingService }) => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const isEditMode = !!editingService;

  // Fetch service categories data
  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ['serviceCategories'],
    queryFn: getServiceCategoriesPublic,
    enabled: isOpen,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch service details for editing
  const { data: serviceDetailsData, isLoading: loadingServiceDetails } = useQuery({
    queryKey: ['adminServiceDetails', editingService?.id],
    queryFn: () => getAdminServiceDetails(editingService!.id),
    enabled: isOpen && isEditMode && !!editingService?.id,
    staleTime: 5 * 60 * 1000,
  });

  const [productName, setProductName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [productVideo, setProductVideo] = useState<File | null>(null);
  const [productImages, setProductImages] = useState<File[]>([]);
  const [existingVideoUrl, setExistingVideoUrl] = useState<string | null>(null);
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
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

  // Extract categories from API data
  // Public endpoint returns: { status: boolean, data: ServiceCategory[] }
  const categories = categoriesData?.data || [];
  const priceRange = ["Under $100", "$100 - $500", "Above $500"];

  // Create service mutation
  const createServiceMutation = useMutation({
    mutationFn: createService,
    onSuccess: () => {
      // Invalidate and refetch services data
      queryClient.invalidateQueries({ queryKey: ['adminServices'] });
      queryClient.invalidateQueries({ queryKey: ['sellerServices'] });
      queryClient.invalidateQueries({ queryKey: ['adminServiceDetails'] });
      showToast('Service created successfully', 'success');
      // Reset form and close modal
      resetForm();
      onClose();
    },
    onError: (error) => {
      console.error('Failed to create service:', error);
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to create service. Please try again.';
      showToast(errorMessage, 'error');
      setIsSubmitting(false);
    },
  });

  // Update service mutation
  const updateServiceMutation = useMutation({
    mutationFn: (serviceData: FormData) => updateService(editingService!.id, serviceData),
    onSuccess: () => {
      // Invalidate and refetch services data
      queryClient.invalidateQueries({ queryKey: ['adminServices'] });
      queryClient.invalidateQueries({ queryKey: ['sellerServices'] });
      queryClient.invalidateQueries({ queryKey: ['adminServiceDetails', editingService?.id] });
      showToast('Service updated successfully', 'success');
      // Reset form and close modal
      resetForm();
      onClose();
    },
    onError: (error) => {
      console.error('Failed to update service:', error);
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to update service. Please try again.';
      showToast(errorMessage, 'error');
      setIsSubmitting(false);
    },
  });


  // Populate form when editing
  useEffect(() => {
    if (isOpen && isEditMode && serviceDetailsData?.data) {
      const serviceInfo = serviceDetailsData.data.service_info;
      const media = serviceDetailsData.data.media || [];
      const subServicesData = serviceDetailsData.data.sub_services || [];

      setProductName(serviceInfo.name || '');
      setFullDescription(serviceInfo.full_description || '');
      setDiscountPrice(serviceInfo.discount_price || '');
      
      // Set price range - format for display
      if (serviceInfo.price_from && serviceInfo.price_to) {
        const fromNum = parseFloat(serviceInfo.price_from);
        const toNum = parseFloat(serviceInfo.price_to);
        if (fromNum < 100 && toNum <= 100) {
          setSelectedPriceRange("Under $100");
        } else if (fromNum >= 500) {
          setSelectedPriceRange("Above $500");
        } else if (fromNum >= 100 && toNum <= 500) {
          setSelectedPriceRange("$100 - $500");
        } else {
          // Custom range - display as is
          setSelectedPriceRange(`₦${serviceInfo.price_from} - ₦${serviceInfo.price_to}`);
        }
      } else if (serviceInfo.price_from) {
        const fromNum = parseFloat(serviceInfo.price_from);
        if (fromNum < 100) {
          setSelectedPriceRange("Under $100");
        } else if (fromNum >= 500) {
          setSelectedPriceRange("Above $500");
        } else {
          setSelectedPriceRange("$100 - $500");
        }
      }

      // Set category - check both category_info and category
      const categoryId = serviceDetailsData.data.category_info?.id || 
                         serviceDetailsData.data.category?.id ||
                         serviceInfo.category_id;
      if (categoryId) {
        setSelectedCategory(categoryId.toString());
      }

      // Set existing media URLs
      const videoMedia = media.find((m: any) => m.type === 'video');
      if (videoMedia) {
        setExistingVideoUrl(videoMedia.url || videoMedia.path);
      } else {
        setExistingVideoUrl(null);
      }

      const imageMedia = media.filter((m: any) => m.type === 'image');
      setExistingImageUrls(imageMedia.map((m: any) => m.url || m.path));

      // Set sub-services
      const formattedSubServices = subServicesData.map((sub: any) => ({
        name: sub.name || '',
        from: sub.price_from || '',
        to: sub.price_to || '',
      }));
      
      // Fill remaining slots
      while (formattedSubServices.length < 8) {
        formattedSubServices.push({ name: '', from: '', to: '' });
      }
      setSubServices(formattedSubServices.slice(0, 8));
    } else if (isOpen && !isEditMode) {
      // Reset form for new service
      resetForm();
      setExistingVideoUrl(null);
      setExistingImageUrls([]);
    }
  }, [isOpen, isEditMode, serviceDetailsData]);

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
      const target = event.target as any;
      if (target) {
        target.value = "";
      }
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
    // In edit mode, all fields are optional, so validation is more lenient
    const newErrors = {
      productName: !isEditMode && productName.trim() === "" ? "Product name is required" : "",
      category: !isEditMode && selectedCategory === "" ? "Category is required" : "",
      productImages: !isEditMode && productImages.length < 3 ? "At least 3 images are required" : "", // Images optional when editing
      fullDescription: !isEditMode && fullDescription.trim() === "" ? "Full description is required" : "",
      priceRange: !isEditMode && selectedPriceRange === "" ? "Price range is required" : "",
    };

    setErrors(newErrors);
    return Object.values(newErrors).every((error) => error === "");
  };

  // Form submission
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // Validation only for new services (edit mode has all optional fields)
    if (!isEditMode && !validateForm()) {
      alert("Please fill in all required fields");
      return;
    }

    // Additional safety check for required fields (only for new services)
    if (!isEditMode && !selectedStore?.id) {
      alert("Please select a store first");
      return;
    }

    setIsSubmitting(true);

    try {
      // Filter out empty sub-services
      const nonEmptySubServices = subServices.filter(
        (service) => service.name.trim() !== "" || service.from.trim() !== "" || service.to.trim() !== ""
      );

      // Create FormData for the API
      const formData = new FormData();
      
      // Debug logging
      console.log('Form submission data:', {
        selectedStore: selectedStore,
        productName: productName,
        fullDescription: fullDescription,
        selectedPriceRange: selectedPriceRange,
        discountPrice: discountPrice
      });
      
      // Add required fields for new services
      if (!isEditMode) {
        formData.append('store_id', selectedStore?.id?.toString() || '');
        formData.append('name', productName);
        formData.append('full_description', fullDescription);
        formData.append('short_description', productName);
      } else {
        // For edit mode, all fields are optional - only send what's provided
        if (productName.trim()) {
          formData.append('name', productName);
        }
        if (fullDescription.trim()) {
          formData.append('full_description', fullDescription);
        }
        if (productName.trim()) {
          formData.append('short_description', productName);
        }
      }
      
      // Add category fields (optional)
      if (selectedCategory) {
        formData.append('category_id', selectedCategory);
        formData.append('service_category_id', selectedCategory); // Also send service_category_id
      }
      
      // Add price fields (optional)
      if (selectedPriceRange && selectedPriceRange.trim() !== '') {
        if (selectedPriceRange === "Under $100") {
          formData.append('price_from', '0');
          formData.append('price_to', '100');
        } else if (selectedPriceRange === "Above $500") {
          formData.append('price_from', '500');
          formData.append('price_to', '999999');
        } else {
          // Handle range format like "$100 - $500" or "₦100 - ₦500" or direct values
          const priceRangeParts = selectedPriceRange.split(' - ');
          if (priceRangeParts.length >= 2) {
            const from = priceRangeParts[0].trim();
            const to = priceRangeParts[1].trim();
            // Remove currency symbols and extract numbers
            const fromValue = from.replace(/[^\d.]/g, '');
            const toValue = to.replace(/[^\d.]/g, '');
            if (fromValue) {
              formData.append('price_from', fromValue);
            }
            if (toValue) {
              formData.append('price_to', toValue);
            }
          } else {
            // Single value - extract number
            const singleValue = selectedPriceRange.replace(/[^\d.]/g, '');
            if (singleValue) {
              formData.append('price_from', singleValue);
            }
          }
        }
      }
      
      // Add discount price (optional)
      if (discountPrice && discountPrice.trim() !== '') {
        formData.append('discount_price', discountPrice);
      }
      
      // Add is_sold and is_unavailable (optional, only in edit mode if available)
      if (isEditMode && serviceDetailsData?.data?.service_info) {
        const serviceInfo = serviceDetailsData.data.service_info;
        if (serviceInfo.is_sold !== undefined) {
          formData.append('is_sold', serviceInfo.is_sold ? '1' : '0');
        }
        if (serviceInfo.is_unavailable !== undefined) {
          formData.append('is_unavailable', serviceInfo.is_unavailable ? '1' : '0');
        }
      }
      
      // Add video file (separate field for service video)
      // Backend supports: video - Single video file for the service
      if (productVideo) {
        formData.append('video', productVideo);
      }
      
      // Add media files (images and videos in media[] array)
      // Backend supports: media[] - Array of image/video files
      // Format: media[0], media[1], media[2], etc.
      // Supported types: Images (jpg, jpeg, png, gif, webp), Videos (mp4, mov, avi, webm)
      // Max size: 10MB per file
      productImages.forEach((image, index) => {
        formData.append(`media[${index}]`, image);
      });
      
      // Add sub-services
      nonEmptySubServices.forEach((service, index) => {
        if (service.name && service.name.trim() !== '') {
          formData.append(`sub_services[${index}][name]`, service.name);
        }
        if (service.from && service.from.trim() !== '') {
          formData.append(`sub_services[${index}][price_from]`, service.from);
        }
        if (service.to && service.to.trim() !== '') {
          formData.append(`sub_services[${index}][price_to]`, service.to);
        }
      });

      // Call the appropriate mutation
      if (isEditMode) {
        await updateServiceMutation.mutateAsync(formData);
      } else {
        await createServiceMutation.mutateAsync(formData);
      }
      
    } catch (error) {
      console.error("Error creating service:", error);
      console.error("Error details:", error);
      alert("Error creating service. Please try again.");
      setIsSubmitting(false);
    }
  };

  // Reset form function
  const resetForm = () => {
    setProductName("");
    setSelectedCategory("");
    setProductVideo(null);
    setProductImages([]);
    setExistingVideoUrl(null);
    setExistingImageUrls([]);
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
              <h2 className="text-xl font-bold">{isEditMode ? 'Edit Service' : 'Add New Service'}</h2>
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
                    ) : existingVideoUrl ? (
                      <div className="relative w-24 h-24 border border-[#CDCDCD] rounded-2xl overflow-hidden">
                        <video
                          src={existingVideoUrl}
                          className="w-full h-full object-cover"
                          controls={false}
                          muted
                        />
                        <div className="absolute bottom-1 left-1 bg-black bg-opacity-70 text-white text-xs px-1 py-0.5 rounded flex items-center gap-1">
                          📹 Existing
                        </div>
                      </div>
                    ) : null}
                    {(!productVideo && !existingVideoUrl) && (
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
                    {/* Existing images */}
                    {existingImageUrls.map((imageUrl, index) => (
                      <div
                        key={`existing-${index}`}
                        className="relative w-24 h-24 border border-[#CDCDCD] rounded-2xl overflow-hidden"
                      >
                        <img
                          src={imageUrl}
                          alt={`Existing ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Hide broken images
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        <div className="absolute bottom-1 left-1 bg-black bg-opacity-70 text-white text-xs px-1 py-0.5 rounded">
                          Existing
                        </div>
                      </div>
                    ))}
                    
                    {/* New uploaded images */}
                    {productImages.map((image, index) => (
                      <div
                        key={`new-${index}`}
                        className="relative w-24 h-24 border border-[#CDCDCD] rounded-2xl overflow-hidden"
                      >
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`New ${index + 1}`}
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
                        <div className="absolute bottom-1 left-1 bg-green-600 bg-opacity-70 text-white text-xs px-1 py-0.5 rounded">
                          New
                        </div>
                      </div>
                    ))}

                    {(existingImageUrls.length + productImages.length < 3 || isEditMode) && (
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
                    onChange={(e) => setProductName((e.target as any).value)}
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
                        {selectedCategory 
                          ? categories.find((cat: any) => cat.id.toString() === selectedCategory)?.title || "Select Category"
                          : "Select Category"}
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
                        {categoriesLoading ? (
                          <div className="p-4 text-center text-gray-500">Loading categories...</div>
                        ) : categories.length > 0 ? (
                          categories.map((category: any) => (
                            <div
                              key={category.id}
                              className={`p-4 hover:bg-gray-50 cursor-pointer text-base border-b border-gray-100 last:border-b-0 ${
                                selectedCategory === category.id.toString() ? 'bg-blue-50 font-semibold' : ''
                              }`}
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
                            onChange={(e) => setFullDescription((e.target as HTMLTextAreaElement).value)}
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
                    onChange={(e) => setDiscountPrice((e.target as any).value)}
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
                            onChange={(e) => handleSubServiceChange(index, 'name', (e.target as any).value)}
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
                              onChange={(e) => handleSubServiceChange(index, 'from', (e.target as any).value)}
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
                              onChange={(e) => handleSubServiceChange(index, 'to', (e.target as any).value)}
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
                      disabled={isSubmitting || (isEditMode && loadingServiceDetails)}
                    >
                      {isSubmitting 
                        ? (isEditMode ? "Updating..." : "Posting...") 
                        : (isEditMode ? "Update Service" : "Post Service")}
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