import { apiCall } from '../customApiCall';
import { API_ENDPOINTS } from '../../config/apiConfig';
import Cookies from 'js-cookie';

/**
 * Get FAQ statistics
 */
export const getFaqStatistics = async () => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  try {
    const response = await apiCall(API_ENDPOINTS.FAQ.Statistics, 'GET', undefined, token);
    return response;
  } catch (error) {
    console.error('FAQ statistics API call error:', error);
    throw error;
  }
};

/**
 * Get FAQ categories
 */
export const getFaqCategories = async () => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  try {
    const response = await apiCall(API_ENDPOINTS.FAQ.Categories, 'GET', undefined, token);
    return response;
  } catch (error) {
    console.error('FAQ categories API call error:', error);
    throw error;
  }
};

/**
 * Get FAQs by category
 */
export const getFaqsByCategory = async (category: string, page: number = 1) => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  try {
    let url = `${API_ENDPOINTS.FAQ.ByCategory(category)}?page=${page}`;
    const response = await apiCall(url, 'GET', undefined, token);
    return response;
  } catch (error) {
    console.error('FAQs by category API call error:', error);
    throw error;
  }
};

/**
 * Get FAQ details by ID
 */
export const getFaqDetails = async (faqId: number | string) => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  try {
    const response = await apiCall(API_ENDPOINTS.FAQ.Details(faqId), 'GET', undefined, token);
    return response;
  } catch (error) {
    console.error('FAQ details API call error:', error);
    throw error;
  }
};

/**
 * Create a new FAQ
 */
export const createFaq = async (faqData: {
  faq_category_id: string;
  question: string;
  answer: string;
  is_active: number;
}) => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  try {
    const response = await apiCall(API_ENDPOINTS.FAQ.List, 'POST', faqData, token);
    return response;
  } catch (error) {
    console.error('Create FAQ API call error:', error);
    throw error;
  }
};

/**
 * Update an existing FAQ
 */
export const updateFaq = async (faqId: number | string, faqData: {
  faq_category_id: string;
  question: string;
  answer: string;
  is_active: number;
}) => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  try {
    const response = await apiCall(API_ENDPOINTS.FAQ.Update(faqId), 'PUT', faqData, token);
    return response;
  } catch (error) {
    console.error('Update FAQ API call error:', error);
    throw error;
  }
};

/**
 * Delete an FAQ
 */
export const deleteFaq = async (faqId: number | string) => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  try {
    const response = await apiCall(API_ENDPOINTS.FAQ.Delete(faqId), 'DELETE', undefined, token);
    return response;
  } catch (error) {
    console.error('Delete FAQ API call error:', error);
    throw error;
  }
};
