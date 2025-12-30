/**
 * Seller Onboarding Field Keys
 * 
 * This file contains all available field keys for the seller onboarding rejection system.
 * These keys are used when calling the admin rejection endpoint to reject specific onboarding fields.
 * 
 * Reference: docs/ONBOARDING_FIELD_KEYS.md
 */

/**
 * Array of all available field keys (for validation and iteration)
 * This is defined first so we can derive the type from it
 */
const ONBOARDING_FIELD_KEYS_ARRAY = [
  // Level 1
  'level1.basic',
  'level1.profile_media',
  'level1.categories_social',
  
  // Level 2
  'level2.business_details',
  'level2.documents',
  
  // Level 3
  'level3.physical_store',
  'level3.utility_bill',
  'level3.addresses',
  'level3.delivery_pricing',
  'level3.theme'
] as const;

// Export the array
export const ONBOARDING_FIELD_KEYS = ONBOARDING_FIELD_KEYS_ARRAY;

// Derive the type from the const array
export type OnboardingFieldKey = typeof ONBOARDING_FIELD_KEYS_ARRAY[number];

export interface OnboardingField {
  key: OnboardingFieldKey;
  label: string;
  level: 1 | 2 | 3;
  description: string;
}


/**
 * Array of field objects with labels and descriptions (for UI display)
 */
export const ONBOARDING_FIELDS: OnboardingField[] = [
  {
    key: 'level1.basic',
    label: 'Basic Information',
    level: 1,
    description: 'Store name, email, phone, location, referral code'
  },
  {
    key: 'level1.profile_media',
    label: 'Profile & Banner Images',
    level: 1,
    description: 'Profile image and banner image'
  },
  {
    key: 'level1.categories_social',
    label: 'Categories & Social Links',
    level: 1,
    description: 'Selected categories and social media links'
  },
  {
    key: 'level2.business_details',
    label: 'Business Details',
    level: 2,
    description: 'Registered name, business type, NIN number, BN number, CAC number'
  },
  {
    key: 'level2.documents',
    label: 'Business Documents',
    level: 2,
    description: 'NIN document, CAC document, utility bill, store video'
  },
  {
    key: 'level3.physical_store',
    label: 'Physical Store Information',
    level: 3,
    description: 'Physical store flag and store video'
  },
  {
    key: 'level3.utility_bill',
    label: 'Utility Bill',
    level: 3,
    description: 'Utility bill document upload'
  },
  {
    key: 'level3.addresses',
    label: 'Store Addresses',
    level: 3,
    description: 'Store address information'
  },
  {
    key: 'level3.delivery_pricing',
    label: 'Delivery Pricing',
    level: 3,
    description: 'Delivery pricing configuration'
  },
  {
    key: 'level3.theme',
    label: 'Theme Color',
    level: 3,
    description: 'Store theme color selection'
  }
];

/**
 * Get fields by level
 */
export const getFieldsByLevel = (level: 1 | 2 | 3): OnboardingField[] => {
  return ONBOARDING_FIELDS.filter(field => field.level === level);
};

/**
 * Get field by key
 */
export const getFieldByKey = (key: OnboardingFieldKey): OnboardingField | undefined => {
  return ONBOARDING_FIELDS.find(field => field.key === key);
};

/**
 * Check if a field key is valid
 */
export const isValidFieldKey = (key: string): key is OnboardingFieldKey => {
  return (ONBOARDING_FIELD_KEYS as readonly string[]).includes(key);
};

