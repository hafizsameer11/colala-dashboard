import { apiCall } from '../customApiCall';
import { API_ENDPOINTS } from '../../config/apiConfig';
import Cookies from 'js-cookie';

/**
 * Create a new user
 */
export const createUser = async (userData: {
  full_name: string;
  user_name: string;
  email: string;
  phone: string;
  password: string;
  country: string;
  state: string;
  role?: 'buyer' | 'seller';
  referral_code?: string;
  profile_picture?: File;
}) => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  
  try {
    // Create FormData for file upload support
    const formData = new FormData();
    formData.append('full_name', userData.full_name);
    formData.append('user_name', userData.user_name);
    formData.append('email', userData.email);
    formData.append('phone', userData.phone);
    formData.append('password', userData.password);
    formData.append('country', userData.country);
    formData.append('state', userData.state);
    
    if (userData.role) {
      formData.append('role', userData.role);
    }
    
    if (userData.referral_code) {
      formData.append('referral_code', userData.referral_code);
    }
    
    if (userData.profile_picture) {
      formData.append('profile_picture', userData.profile_picture);
    }

    const response = await apiCall(API_ENDPOINTS.BUYER_USERS.Create, 'POST', formData, token);
    return response;
  } catch (error) {
    console.error('Create user API call error:', error);
    throw error;
  }
};
