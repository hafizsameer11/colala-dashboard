import { apiCall } from '../customApiCall';
import { API_ENDPOINTS } from '../../config/apiConfig';
import Cookies from 'js-cookie';

/**
 * Get support tickets list with pagination and filtering
 */
export const getSupportTickets = async (page: number = 1, search?: string, status?: string) => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  try {
    let url = `${API_ENDPOINTS.SUPPORT.List}?page=${page}`;
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }
    if (status) {
      url += `&status=${encodeURIComponent(status)}`;
    }
    const response = await apiCall(url, 'GET', undefined, token);
    return response;
  } catch (error) {
    console.error('Support tickets API call error:', error);
    throw error;
  }
};

/**
 * Get support ticket statistics
 */
export const getSupportStats = async () => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  try {
    const response = await apiCall(API_ENDPOINTS.SUPPORT.Stats, 'GET', undefined, token);
    return response;
  } catch (error) {
    console.error('Support stats API call error:', error);
    throw error;
  }
};

/**
 * Get support ticket details by ID
 */
export const getSupportTicketDetails = async (ticketId: number | string) => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  try {
    const response = await apiCall(API_ENDPOINTS.SUPPORT.Details(ticketId), 'GET', undefined, token);
    return response;
  } catch (error) {
    console.error('Support ticket details API call error:', error);
    throw error;
  }
};
