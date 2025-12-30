import { apiCall } from '../customApiCall';
import { API_ENDPOINTS } from '../../config/apiConfig';
import Cookies from 'js-cookie';
import type { OnboardingFieldKey } from '../../constants/onboardingFields';

/**
 * Level 1 - Create Store (Basic Information)
 */
export const createSellerLevel1 = async (storeData: {
  store_name: string;
  store_email: string;
  store_phone: string;
  password: string;
  store_location?: string;
  referral_code?: string;
  profile_image?: File;
  banner_image?: File;
  show_phone_on_profile?: boolean;
  categories?: number[];
  social_links?: Array<{
    type: 'instagram' | 'facebook' | 'twitter' | 'linkedin' | 'youtube';
    url: string;
  }>;
}) => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  
  try {
    const formData = new FormData();
    formData.append('store_name', storeData.store_name);
    formData.append('store_email', storeData.store_email);
    formData.append('store_phone', storeData.store_phone);
    formData.append('password', storeData.password);
    
    if (storeData.store_location) {
      formData.append('store_location', storeData.store_location);
    }
    
    if (storeData.referral_code) {
      formData.append('referral_code', storeData.referral_code);
    }
    
    if (storeData.profile_image && storeData.profile_image instanceof File) {
      console.log('Adding profile_image:', storeData.profile_image.name, storeData.profile_image.type);
      formData.append('profile_image', storeData.profile_image);
    } else {
      console.log('No profile_image file provided');
    }
    
    if (storeData.banner_image && storeData.banner_image instanceof File) {
      console.log('Adding banner_image:', storeData.banner_image.name, storeData.banner_image.type);
      formData.append('banner_image', storeData.banner_image);
    } else {
      console.log('No banner_image file provided');
    }
    
    // Always send show_phone_on_profile as it's required by backend
    // Laravel boolean validation expects "1" or "0", not "true" or "false"
    const booleanValue = storeData.show_phone_on_profile ? '1' : '0';
    console.log('Adding show_phone_on_profile:', booleanValue, 'from:', storeData.show_phone_on_profile);
    formData.append('show_phone_on_profile', booleanValue);
    
    if (storeData.categories && storeData.categories.length > 0) {
      storeData.categories.forEach(categoryId => {
        formData.append('categories[]', categoryId.toString());
      });
    }
    
    if (storeData.social_links && storeData.social_links.length > 0) {
      storeData.social_links.forEach((link, index) => {
        formData.append(`social_links[${index}][type]`, link.type);
        formData.append(`social_links[${index}][url]`, link.url);
      });
    }

    const response = await apiCall(API_ENDPOINTS.SELLER_CREATION.Level1Complete, 'POST', formData, token);
    return response;
  } catch (error) {
    console.error('Create seller level 1 API call error:', error);
    throw error;
  }
};

/**
 * Level 2 - Business Information
 */
export const createSellerLevel2 = async (businessData: {
  store_id: number | string;
  business_name: string;
  business_type: string;
  nin_number: string;
  cac_number?: string;
  nin_document?: File;
  cac_document?: File;
  utility_bill?: File;
}) => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  
  try {
    const formData = new FormData();
    formData.append('store_id', businessData.store_id.toString());
    formData.append('business_name', businessData.business_name);
    formData.append('business_type', businessData.business_type);
    formData.append('nin_number', businessData.nin_number);
    
    if (businessData.cac_number) {
      formData.append('cac_number', businessData.cac_number);
    }
    
    if (businessData.nin_document) {
      formData.append('nin_document', businessData.nin_document);
    }
    
    if (businessData.cac_document) {
      formData.append('cac_document', businessData.cac_document);
    }
    
    if (businessData.utility_bill) {
      formData.append('utility_bill', businessData.utility_bill);
    }

    const response = await apiCall(API_ENDPOINTS.SELLER_CREATION.Level2Complete, 'POST', formData, token);
    return response;
  } catch (error) {
    console.error('Create seller level 2 API call error:', error);
    throw error;
  }
};

/**
 * Level 3 - Store Details and Pricing
 */
export const createSellerLevel3 = async (storeDetailsData: {
  store_id: number | string;
  has_physical_store: boolean;
  store_video?: File;
  utility_bill?: File;
  theme_color: string;
  addresses?: Array<{
    state: string;
    local_government: string;
    full_address: string;
    is_main?: boolean;
    opening_hours?: {
      monday?: { from: string; to: string };
      tuesday?: { from: string; to: string };
      wednesday?: { from: string; to: string };
      thursday?: { from: string; to: string };
      friday?: { from: string; to: string };
      saturday?: { from: string; to: string };
      sunday?: { from: string; to: string };
    };
  }>;
  delivery_pricing?: Array<{
    state: string;
    local_government: string;
    variant: string;
    price: number;
    is_free: boolean;
  }>;
}) => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  
  try {
    const formData = new FormData();
    formData.append('store_id', storeDetailsData.store_id.toString());
    // Always send has_physical_store as it's required by backend
    // Laravel boolean validation expects "1" or "0", not "true" or "false"
    const hasPhysicalStoreValue = storeDetailsData.has_physical_store ? '1' : '0';
    console.log('Adding has_physical_store:', hasPhysicalStoreValue, 'from:', storeDetailsData.has_physical_store);
    formData.append('has_physical_store', hasPhysicalStoreValue);
    formData.append('theme_color', storeDetailsData.theme_color);
    
    if (storeDetailsData.store_video) {
      formData.append('store_video', storeDetailsData.store_video);
    }
    
    if (storeDetailsData.utility_bill) {
      formData.append('utility_bill', storeDetailsData.utility_bill);
    }
    
    // Add addresses
    if (storeDetailsData.addresses && storeDetailsData.addresses.length > 0) {
      storeDetailsData.addresses.forEach((address, index) => {
        formData.append(`addresses[${index}][state]`, address.state);
        formData.append(`addresses[${index}][local_government]`, address.local_government);
        formData.append(`addresses[${index}][full_address]`, address.full_address);
        
      if (address.is_main !== undefined) {
        // Laravel boolean validation expects "1" or "0", not "true" or "false"
        const isMainValue = address.is_main ? '1' : '0';
        console.log(`Adding addresses[${index}][is_main]:`, isMainValue, 'from:', address.is_main);
        formData.append(`addresses[${index}][is_main]`, isMainValue);
      }
        
        // Add opening hours if provided
        if (address.opening_hours) {
          const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
          days.forEach(day => {
            if (address.opening_hours![day as keyof typeof address.opening_hours]) {
              const hours = address.opening_hours![day as keyof typeof address.opening_hours];
              if (hours) {
                formData.append(`addresses[${index}][opening_hours][${day}][from]`, hours.from);
                formData.append(`addresses[${index}][opening_hours][${day}][to]`, hours.to);
              }
            }
          });
        }
      });
    }
    
    // Add delivery pricing
    if (storeDetailsData.delivery_pricing && storeDetailsData.delivery_pricing.length > 0) {
      storeDetailsData.delivery_pricing.forEach((pricing, index) => {
        formData.append(`delivery_pricing[${index}][state]`, pricing.state);
        formData.append(`delivery_pricing[${index}][local_government]`, pricing.local_government);
        formData.append(`delivery_pricing[${index}][variant]`, pricing.variant);
        formData.append(`delivery_pricing[${index}][price]`, pricing.price.toString());
      // Laravel boolean validation expects "1" or "0", not "true" or "false"
      const isFreeValue = pricing.is_free ? '1' : '0';
      console.log(`Adding delivery_pricing[${index}][is_free]:`, isFreeValue, 'from:', pricing.is_free);
      formData.append(`delivery_pricing[${index}][is_free]`, isFreeValue);
      });
    }

    const response = await apiCall(API_ENDPOINTS.SELLER_CREATION.Level3Complete, 'POST', formData, token);
    return response;
  } catch (error) {
    console.error('Create seller level 3 API call error:', error);
    throw error;
  }
};

/**
 * Reject an onboarding field
 * 
 * This function allows admins to reject specific onboarding fields with a reason.
 * When a field is rejected, the seller must re-upload it before they can proceed.
 * 
 * @param storeId - The ID of the store
 * @param fieldKey - The field key to reject (e.g., 'level1.basic', 'level2.documents')
 * @param rejectionReason - The reason for rejection (max 1000 characters)
 * 
 * @returns Promise with the rejection response including updated progress
 * 
 * @example
 * ```typescript
 * await rejectOnboardingField(123, 'level2.documents', 'Document quality is too low. Please upload a clearer image.');
 * ```
 */
export const rejectOnboardingField = async (
  storeId: number | string,
  fieldKey: OnboardingFieldKey,
  rejectionReason: string
) => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }

  if (!rejectionReason || rejectionReason.trim().length === 0) {
    throw new Error('Rejection reason is required');
  }

  if (rejectionReason.length > 1000) {
    throw new Error('Rejection reason must be 1000 characters or less');
  }

  try {
    const payload = {
      store_id: typeof storeId === 'string' ? parseInt(storeId, 10) : storeId,
      field_key: fieldKey,
      rejection_reason: rejectionReason.trim(),
    };

    console.log('Rejecting onboarding field:', payload);

    const response = await apiCall(
      API_ENDPOINTS.SELLER_CREATION.RejectField,
      'POST',
      payload,
      token
    );

    console.log('Reject field response:', response);
    return response;
  } catch (error) {
    console.error('Reject onboarding field API call error:', error);
    throw error;
  }
};
