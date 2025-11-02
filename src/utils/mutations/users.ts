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
    
    // Add role (defaults to 'buyer' if not specified, matching Laravel controller)
    formData.append('role', userData.role || 'buyer');
    
    if (userData.referral_code) {
      formData.append('referral_code', userData.referral_code);
    }
    
    if (userData.profile_picture) {
      formData.append('profile_picture', userData.profile_picture);
    }

    const response = await apiCall(API_ENDPOINTS.ALL_USERS.Create, 'POST', formData, token);
    return response;
  } catch (error) {
    console.error('Create user API call error:', error);
    throw error;
  }
};

/**
 * Update an existing user
 */
export const updateUser = async (userData: {
  userId: number | string;
  full_name: string;
  user_name: string;
  email: string;
  phone: string;
  password?: string;
  country: string;
  state: string;
  role?: 'buyer' | 'seller';
  status?: 'active' | 'inactive';
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
    formData.append('country', userData.country);
    formData.append('state', userData.state);
    
    if (userData.password) {
      formData.append('password', userData.password);
    }
    
    if (userData.role) {
      formData.append('role', userData.role);
    }
    
    if (userData.status) {
      formData.append('status', userData.status);
    }
    
    if (userData.referral_code) {
      formData.append('referral_code', userData.referral_code);
    }
    
    if (userData.profile_picture) {
      formData.append('profile_picture', userData.profile_picture);
    }

    const response = await apiCall(API_ENDPOINTS.ALL_USERS.Update(userData.userId), 'PUT', formData, token);
    return response;
  } catch (error) {
    console.error('Update user API call error:', error);
    throw error;
  }
};

/**
 * Top up user wallet (admin action)
 */
export const topUpWallet = async (userId: number | string, amount: number, description?: string) => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  
  try {
    const data = {
      amount,
      ...(description && { description }),
    };
    
    const response = await apiCall(API_ENDPOINTS.BUYER_USERS.TopUp(userId), 'POST', data, token);
    return response;
  } catch (error) {
    console.error('Top up wallet API call error:', error);
    throw error;
  }
};

/**
 * Withdraw from user wallet (admin action)
 */
export const withdrawWallet = async (userId: number | string, amount: number, description?: string) => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  
  try {
    const data = {
      amount,
      ...(description && { description }),
    };
    
    const response = await apiCall(API_ENDPOINTS.BUYER_USERS.Withdraw(userId), 'POST', data, token);
    return response;
  } catch (error) {
    console.error('Withdraw wallet API call error:', error);
    throw error;
  }
};
