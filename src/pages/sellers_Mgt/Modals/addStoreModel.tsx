import images from "../../../constants/images";
import React, { useState, useEffect } from "react";
import Level1 from "./level1";
import Level2 from "./level2";
import Level3 from "./level3";
import {
  createSellerLevel1,
  createSellerLevel2,
  createSellerLevel3,
  updateSellerLevel1,
  updateSellerLevel2,
  updateSellerLevel3,
} from "../../../utils/mutations";

interface AddStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToSavedAddress?: () => void;
  initialTab?: "Level 1" | "Level 2" | "Level 3";
  editMode?: boolean;
  initialStoreData?: {
    // NOTE: id is the existing store identifier used by the edit routes (store_id)
    id?: string;
    storeName?: string;
    email?: string;
    phoneNumber?: string;
    category?: number;
    showPhoneOnProfile?: boolean;
    profileImage?: string | null;
    bannerImage?: string | null;
    socialLinks?: Array<{ type: string; url: string }>;
    location?: string;
    storeStatus?: string;
    businessDetails?: any;
    addresses?: any[];
    deliveryPricing?: any[];
    isVerified?: boolean;
  };
}

const AddStoreModal: React.FC<AddStoreModalProps> = ({
  isOpen,
  onClose,
  onProceedToSavedAddress,
  initialTab = "Level 1",
  editMode = false,
  initialStoreData,
}) => {
  const [activeTab, setActiveTab] = useState<"Level 1" | "Level 2" | "Level 3">(
    initialTab
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [storeId, setStoreId] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setError(null);

      // In edit mode, we already have a store_id from initialStoreData
      if (editMode && initialStoreData?.id) {
        const existingId = Number(initialStoreData.id);
        if (!Number.isNaN(existingId)) {
          setStoreId(existingId);
        }
      }
    }
  }, [isOpen, initialTab, editMode, initialStoreData]);

  // Level 1 handler
  const handleLevel1Complete = async (level1Data: {
    storeName: string;
    email: string;
    phoneNumber: string;
    password: string;
    category: number;
    showPhoneOnProfile: boolean;
    profileImageFile?: File | null;
    bannerImageFile?: File | null;
    socialLinks?: Array<{ type: string; url: string }>;
  }) => {
    setIsLoading(true);
    setError(null);
    try {
      if (editMode) {
        // EDIT FLOW: call Level1 update route with existing store_id
        const currentStoreId = storeId ?? (initialStoreData?.id ? Number(initialStoreData.id) : null);
        if (!currentStoreId || Number.isNaN(currentStoreId)) {
          throw new Error("Store ID not found for edit. Cannot update Level 1.");
        }

        const updatePayload: Parameters<typeof updateSellerLevel1>[0] = {
          store_id: currentStoreId,
        };

        if (level1Data.storeName) updatePayload.store_name = level1Data.storeName;
        if (level1Data.email) updatePayload.store_email = level1Data.email;
        if (level1Data.phoneNumber) updatePayload.store_phone = level1Data.phoneNumber;
        updatePayload.show_phone_on_profile = level1Data.showPhoneOnProfile;
        if (level1Data.profileImageFile) updatePayload.profile_image = level1Data.profileImageFile;
        if (level1Data.bannerImageFile) updatePayload.banner_image = level1Data.bannerImageFile;
        if (level1Data.category) updatePayload.categories = [level1Data.category];
        if (level1Data.socialLinks && level1Data.socialLinks.length > 0) {
          updatePayload.social_links = level1Data.socialLinks.map((link) => ({
            type: link.type as 'instagram' | 'facebook' | 'twitter' | 'linkedin' | 'youtube',
            url: link.url,
          }));
        }

        await updateSellerLevel1(updatePayload);
        // For edit we keep the same tab by default; user can switch manually
      } else {
        // CREATE FLOW: call Level1 complete route
        const mappedData = {
          store_name: level1Data.storeName,
          store_email: level1Data.email,
          store_phone: level1Data.phoneNumber,
          password: level1Data.password,
          store_location: '', // Add if available
          referral_code: '', // Add if available
          profile_image: level1Data.profileImageFile || undefined,
          banner_image: level1Data.bannerImageFile || undefined,
          show_phone_on_profile: level1Data.showPhoneOnProfile,
          categories: [level1Data.category], // Already a number
          social_links: (level1Data.socialLinks || []).map(link => ({
            type: link.type as 'instagram' | 'facebook' | 'twitter' | 'linkedin' | 'youtube',
            url: link.url
          }))
        };
        
        console.log('Sending Level 1 data:', {
          ...mappedData,
          profile_image: mappedData.profile_image ? `${mappedData.profile_image.name} (${mappedData.profile_image.type})` : 'No file',
          banner_image: mappedData.banner_image ? `${mappedData.banner_image.name} (${mappedData.banner_image.type})` : 'No file',
          show_phone_on_profile: mappedData.show_phone_on_profile,
          show_phone_on_profile_type: typeof mappedData.show_phone_on_profile
        });
        
        const response = await createSellerLevel1(mappedData);
        if (response.data && response.data.store_id) {
          setStoreId(response.data.store_id);
          setActiveTab("Level 2");
        }
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save Level 1 details';
      setError(errorMessage);
      console.error('Level 1 error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Level 2 handler
  const handleLevel2Complete = async (level2Data: {
    businessName: string;
    businessType: string;
    ninNumber: string;
    cacNumber?: string;
    ninDocument?: File;
    cacDocument?: File;
    utilityBill?: File;
  }) => {
    const currentStoreId = storeId ?? (initialStoreData?.id ? Number(initialStoreData.id) : null);
    if (!currentStoreId || Number.isNaN(currentStoreId)) {
      setError('Store ID not found. Please complete Level 1 first.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    try {
      if (editMode) {
        const updatePayload: Parameters<typeof updateSellerLevel2>[0] = {
          store_id: currentStoreId,
        };

        if (level2Data.businessName) updatePayload.business_name = level2Data.businessName;
        if (level2Data.businessType) updatePayload.business_type = level2Data.businessType;
        if (level2Data.ninNumber) updatePayload.nin_number = level2Data.ninNumber;
        if (level2Data.cacNumber) updatePayload.cac_number = level2Data.cacNumber;
        if (level2Data.ninDocument) updatePayload.nin_document = level2Data.ninDocument;
        if (level2Data.cacDocument) updatePayload.cac_document = level2Data.cacDocument;
        if (level2Data.utilityBill) updatePayload.utility_bill = level2Data.utilityBill;

        await updateSellerLevel2(updatePayload);
      } else {
        const mappedData = {
          store_id: currentStoreId,
          business_name: level2Data.businessName,
          business_type: level2Data.businessType,
          nin_number: level2Data.ninNumber,
          cac_number: level2Data.cacNumber,
          nin_document: level2Data.ninDocument,
          cac_document: level2Data.cacDocument,
          utility_bill: level2Data.utilityBill
        };
        
        await createSellerLevel2(mappedData);
        setActiveTab("Level 3");
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save Level 2 details';
      setError(errorMessage);
      console.error('Level 2 error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Level 3 handler
  const handleLevel3Complete = async (level3Data: {
    has_physical_store: boolean;
    store_video?: File;
    utility_bill?: File;
    theme_color: string;
    addresses?: Array<{
      state: string;
      local_government: string;
      full_address: string;
      is_main?: boolean;
      opening_hours?: Record<string, { from: string; to: string }>;
    }>;
    delivery_pricing?: Array<{
      state: string;
      local_government: string;
      variant: string;
      price: number;
      is_free: boolean;
    }>;
  }) => {
    const currentStoreId = storeId ?? (initialStoreData?.id ? Number(initialStoreData.id) : null);
    if (!currentStoreId || Number.isNaN(currentStoreId)) {
      setError('Store ID not found. Please complete Level 1 first.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    try {
      if (editMode) {
        const updatePayload: Parameters<typeof updateSellerLevel3>[0] = {
          store_id: currentStoreId,
        };

        if (typeof level3Data.has_physical_store === 'boolean') {
          updatePayload.has_physical_store = level3Data.has_physical_store;
        }
        if (level3Data.store_video) updatePayload.store_video = level3Data.store_video;
        if (level3Data.utility_bill) updatePayload.utility_bill = level3Data.utility_bill;
        if (level3Data.theme_color) updatePayload.theme_color = level3Data.theme_color;
        if (level3Data.addresses) updatePayload.addresses = level3Data.addresses;
        if (level3Data.delivery_pricing) updatePayload.delivery_pricing = level3Data.delivery_pricing;

        await updateSellerLevel3(updatePayload);
      } else {
        const mappedData = {
          store_id: currentStoreId,
          has_physical_store: level3Data.has_physical_store,
          store_video: level3Data.store_video,
          utility_bill: level3Data.utility_bill,
          theme_color: level3Data.theme_color,
          addresses: level3Data.addresses || [],
          delivery_pricing: level3Data.delivery_pricing || []
        };
        
        await createSellerLevel3(mappedData);
      }
      
      // Proceed to saved address modal or close
      if (onProceedToSavedAddress) {
        onProceedToSavedAddress();
      } else {
        onClose();
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save Level 3 details';
      setError(errorMessage);
      console.error('Level 3 error:', error);
    } finally {
      setIsLoading(false);
    }
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
          <h2 className="text-xl font-semibold">
            {editMode ? "Edit Store" : "Add New Store"}
          </h2>
        </div>

        <div className="p-5 pb-8">
          {/* Error Display */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="mb-4 p-3 bg-blue-100 border border-blue-400 text-blue-700 rounded">
              Processing... Please wait.
            </div>
          )}

          {/* Tabs */}
          <div className="flex p-1 gap-4 border border-[#989898] rounded-lg mt-5 w-83.5">
            <button
              onClick={() => setActiveTab("Level 1")}
              className={`px-6 py-2 rounded-lg font-medium cursor-pointer ${
                activeTab === "Level 1"
                  ? "bg-[#E53E3E] text-white "
                  : "bg-transparent text-black"
              }`}
            >
              Level 1
            </button>
            <button
              onClick={() => setActiveTab("Level 2")}
              className={`px-6 py-2 rounded-lg font-medium cursor-pointer ${
                activeTab === "Level 2"
                  ? "bg-red-500 text-white"
                  : "bg-transparent text-black"
              }`}
            >
              Level 2
            </button>
            <button
              onClick={() => setActiveTab("Level 3")}
              className={`px-6 py-2 rounded-lg font-medium cursor-pointer ${
                activeTab === "Level 3"
                  ? "bg-red-500 text-white"
                  : "bg-transparent text-black"
              }`}
            >
              Level 3
            </button>
          </div>

          {/* Tab Content */}
          <div className="">
            {activeTab === "Level 1" && (
              <Level1
                onSaveAndClose={onClose}
                onProceed={handleLevel1Complete}
                isLoading={isLoading}
                editMode={editMode}
                initialData={initialStoreData}
              />
            )}
            {activeTab === "Level 2" && (
              <Level2
                onSaveAndClose={onClose}
                onProceed={handleLevel2Complete}
                isLoading={isLoading}
                editMode={editMode}
                initialData={initialStoreData?.businessDetails}
              />
            )}
            {activeTab === "Level 3" && (
              <Level3
                onSaveAndClose={onClose}
                onProceed={handleLevel3Complete}
                isLoading={isLoading}
                editMode={editMode}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddStoreModal;
