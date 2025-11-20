import { apiCall } from '../customApiCall';
import { API_ENDPOINTS } from '../../config/apiConfig';
import Cookies from 'js-cookie';

/**
 * Get all terms and policies
 */
export const getTerms = async () => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  try {
    const response = await apiCall(API_ENDPOINTS.TERMS.Get, 'GET', undefined, token);
    return response;
  } catch (error) {
    console.error('Get terms API call error:', error);
    throw error;
  }
};

/**
 * Update terms and policies
 */
export const updateTerms = async (termsData: {
  buyer_privacy_policy?: string;
  buyer_terms_and_condition?: string;
  buyer_return_policy?: string;
  seller_onboarding_policy?: string;
  seller_privacy_policy?: string;
  seller_terms_and_condition?: string;
}) => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  try {
    const response = await apiCall(API_ENDPOINTS.TERMS.Update, 'PUT', termsData, token);
    return response;
  } catch (error) {
    console.error('Update terms API call error:', error);
    throw error;
  }
};

