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
  per_page?: number;
  status?: string;
  category?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
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
export const resolveDispute = async (
  disputeId: number | string,
  resolveData: {
    resolution_notes: string;
    won_by: 'buyer' | 'seller' | 'admin';
  }
) => {
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
export const closeDispute = async (disputeId: number | string, closeData?: { resolution_notes?: string }) => {
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

/**
 * Update dispute status
 */
export const updateDisputeStatus = async (
  disputeId: number | string,
  statusData: {
    status: 'pending' | 'on_hold' | 'resolved' | 'closed';
    resolution_notes?: string;
    won_by?: 'buyer' | 'seller' | 'admin';
  }
) => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  try {
    const response = await apiCall(API_ENDPOINTS.DISPUTES.UpdateStatus(disputeId), 'PUT', statusData, token);
    return response;
  } catch (error) {
    console.error('Update dispute status API call error:', error);
    throw error;
  }
};

/**
 * Bulk action on disputes
 */
export const bulkDisputeAction = async (actionData: {
  action: 'update_status' | 'resolve' | 'close';
  dispute_ids: number[];
  status?: 'pending' | 'on_hold' | 'resolved' | 'closed';
  won_by?: 'buyer' | 'seller' | 'admin';
  resolution_notes?: string;
}) => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  try {
    const response = await apiCall(API_ENDPOINTS.DISPUTES.BulkAction, 'POST', actionData, token);
    return response;
  } catch (error) {
    console.error('Bulk dispute action API call error:', error);
    throw error;
  }
};

/**
 * Get dispute analytics
 */
export const getDisputeAnalytics = async (params?: {
  date_from?: string;
  date_to?: string;
}) => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  try {
    let url = API_ENDPOINTS.DISPUTES.Analytics;
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
    console.error('Dispute analytics API call error:', error);
    throw error;
  }
};

/**
 * Get dispute chat messages
 */
export const getDisputeChat = async (disputeId: number | string) => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  try {
    const response = await apiCall(API_ENDPOINTS.DISPUTES.Chat(disputeId), 'GET', undefined, token);
    return response;
  } catch (error) {
    console.error('Get dispute chat API call error:', error);
    throw error;
  }
};

/**
 * Send message in dispute chat (Admin)
 */
export const sendDisputeMessage = async (
  disputeId: number | string,
  messageData: FormData | { message?: string; image?: File }
) => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  try {
    const response = await apiCall(API_ENDPOINTS.DISPUTES.SendMessage(disputeId), 'POST', messageData, token);
    return response;
  } catch (error) {
    console.error('Send dispute message API call error:', error);
    throw error;
  }
};
