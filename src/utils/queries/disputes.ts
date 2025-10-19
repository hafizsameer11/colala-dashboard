import { apiCall } from '../customApiCall';
import { API_ENDPOINTS } from '../../config/apiConfig';
import Cookies from 'js-cookie';

/**
 * Get dispute statistics
 */
export const getDisputeStatistics = async () => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  try {
    const response = await apiCall(API_ENDPOINTS.DISPUTES.Statistics, 'GET', undefined, token);
    return response;
  } catch (error) {
    console.error('Dispute statistics API call error:', error);
    throw error;
  }
};

/**
 * Get disputes list with pagination and filters
 */
export const getDisputesList = async (params?: {
  page?: number;
  status?: string;
  category?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
}) => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  try {
    let url = API_ENDPOINTS.DISPUTES.List;
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    if (queryParams.toString()) {
      url += `?${queryParams.toString()}`;
    }
    
    const response = await apiCall(url, 'GET', undefined, token);
    return response;
  } catch (error) {
    console.error('Disputes list API call error:', error);
    throw error;
  }
};

/**
 * Get dispute details by ID
 */
export const getDisputeDetails = async (disputeId: number | string) => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  try {
    const response = await apiCall(API_ENDPOINTS.DISPUTES.Details(disputeId), 'GET', undefined, token);
    return response;
  } catch (error) {
    console.error('Dispute details API call error:', error);
    throw error;
  }
};

/**
 * Resolve a dispute
 */
export const resolveDispute = async (disputeId: number | string, resolveData?: any) => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  try {
    const response = await apiCall(API_ENDPOINTS.DISPUTES.Resolve(disputeId), 'POST', resolveData, token);
    return response;
  } catch (error) {
    console.error('Resolve dispute API call error:', error);
    throw error;
  }
};

/**
 * Close a dispute
 */
export const closeDispute = async (disputeId: number | string, closeData?: any) => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  try {
    const response = await apiCall(API_ENDPOINTS.DISPUTES.Close(disputeId), 'POST', closeData, token);
    return response;
  } catch (error) {
    console.error('Close dispute API call error:', error);
    throw error;
  }
};
