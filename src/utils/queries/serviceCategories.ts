import { apiCall } from '../customApiCall';
import { API_ENDPOINTS } from '../../config/apiConfig';
import Cookies from 'js-cookie';

export interface ServiceCategory {
  id: number;
  title: string;
  image: string | null;
  image_url: string | null;
  is_active: boolean;
  services_count?: number;
  services?: any[];
  created_at: string;
  updated_at: string;
}

export interface ServiceCategoriesResponse {
  status: boolean;
  data: {
    data: ServiceCategory[];
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
    from: number | null;
    to: number | null;
  };
}

/**
 * Get all service categories (Public - No auth required)
 */
export const getServiceCategoriesPublic = async (): Promise<{ status: boolean; data: ServiceCategory[] }> => {
  try {
    const response = await apiCall(API_ENDPOINTS.SERVICE_CATEGORIES.List, 'GET', undefined, undefined);
    return response;
  } catch (error) {
    console.error('Get service categories (public) API call error:', error);
    throw error;
  }
};

/**
 * Get all service categories (Admin - Paginated)
 */
export const getServiceCategories = async (
  page: number = 1,
  perPage: number = 15,
  isActive?: boolean
): Promise<ServiceCategoriesResponse> => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('per_page', perPage.toString());
    if (isActive !== undefined) {
      params.append('is_active', isActive.toString());
    }

    const url = `${API_ENDPOINTS.SERVICE_CATEGORIES.AdminList}?${params.toString()}`;
    const response = await apiCall(url, 'GET', undefined, token);
    return response;
  } catch (error) {
    console.error('Get service categories API call error:', error);
    throw error;
  }
};

/**
 * Get single service category (Admin)
 */
export const getServiceCategoryById = async (id: number | string): Promise<{ status: boolean; data: ServiceCategory }> => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    const response = await apiCall(API_ENDPOINTS.SERVICE_CATEGORIES.AdminGetById(id), 'GET', undefined, token);
    return response;
  } catch (error) {
    console.error('Get service category by ID API call error:', error);
    throw error;
  }
};

/**
 * Create new service category
 */
export const createServiceCategory = async (categoryData: FormData): Promise<{ status: boolean; message: string; data: ServiceCategory }> => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    const response = await apiCall(API_ENDPOINTS.SERVICE_CATEGORIES.Create, 'POST', categoryData, token);
    return response;
  } catch (error) {
    console.error('Create service category API call error:', error);
    throw error;
  }
};

/**
 * Update service category
 */
export const updateServiceCategory = async (
  categoryId: number | string,
  categoryData: FormData
): Promise<{ status: boolean; message: string; data: ServiceCategory }> => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    // Debug: Log FormData contents before sending
    console.log('Updating service category:', categoryId);
    console.log('FormData entries:');
    for (const [key, value] of categoryData.entries()) {
      console.log(`${key}:`, value instanceof File ? `File: ${value.name}` : value);
    }

    // Ensure title is present
    if (!categoryData.has('title')) {
      throw new Error('Title field is required but missing from FormData');
    }

    const titleValue = categoryData.get('title');
    if (!titleValue || (typeof titleValue === 'string' && !titleValue.trim())) {
      throw new Error('Title field cannot be empty');
    }

    const response = await apiCall(API_ENDPOINTS.SERVICE_CATEGORIES.Update(categoryId), 'PUT', categoryData, token);
    return response;
  } catch (error) {
    console.error('Update service category API call error:', error);
    throw error;
  }
};

/**
 * Delete service category
 */
export const deleteServiceCategory = async (
  categoryId: number | string
): Promise<{ status: boolean; message: string; data: null }> => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    const response = await apiCall(API_ENDPOINTS.SERVICE_CATEGORIES.Delete(categoryId), 'DELETE', undefined, token);
    return response;
  } catch (error) {
    console.error('Delete service category API call error:', error);
    throw error;
  }
};

