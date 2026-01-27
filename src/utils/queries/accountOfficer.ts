import { apiCall } from '../customApiCall';
import { API_ENDPOINTS } from '../../config/apiConfig';
import Cookies from 'js-cookie';

/**
 * Get all account officers with vendor counts
 */
export const getAccountOfficers = async () => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  try {
    const response = await apiCall(API_ENDPOINTS.ACCOUNT_OFFICER.List, 'GET', undefined, token);
    return response;
  } catch (error) {
    console.error('Get account officers API call error:', error);
    throw error;
  }
};

/**
 * Get vendors assigned to a specific account officer
 */
export const getAccountOfficerVendors = async (
  accountOfficerId: number | string,
  page: number = 1,
  filters?: {
    status?: string;
    search?: string;
    per_page?: number;
  }
) => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  try {
    let url = API_ENDPOINTS.ACCOUNT_OFFICER.Vendors(accountOfficerId);
    const params = new URLSearchParams();
    params.append('page', page.toString());
    if (filters?.status) params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.per_page) params.append('per_page', filters.per_page.toString());
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    const response = await apiCall(url, 'GET', undefined, token);
    return response;
  } catch (error) {
    console.error('Get account officer vendors API call error:', error);
    throw error;
  }
};

/**
 * Get dashboard stats for current account officer
 */
export const getMyVendorDashboard = async () => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  try {
    const response = await apiCall(API_ENDPOINTS.ACCOUNT_OFFICER.MyDashboard, 'GET', undefined, token);
    return response;
  } catch (error) {
    console.error('Get my vendor dashboard API call error:', error);
    throw error;
  }
};

/**
 * Get vendors assigned to current user (Account Officer)
 */
export const getMyAssignedVendors = async (
  page: number = 1,
  filters?: {
    status?: string;
    search?: string;
    period?: string;
    per_page?: number;
  }
) => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  try {
    let url = API_ENDPOINTS.ACCOUNT_OFFICER.MyVendors;
    const params = new URLSearchParams();
    params.append('page', page.toString());
    if (filters?.status) params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.period) params.append('period', filters.period);
    if (filters?.per_page) params.append('per_page', filters.per_page.toString());
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    const response = await apiCall(url, 'GET', undefined, token);
    return response;
  } catch (error) {
    console.error('Get my assigned vendors API call error:', error);
    throw error;
  }
};


