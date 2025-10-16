import { apiCall } from '../customApiCall';
import { API_ENDPOINTS } from '../../config/apiConfig';
import Cookies from 'js-cookie';

export const getNotifications = async (page: number = 1, search?: string, status?: string, audience_type?: string) => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const params = new URLSearchParams({
    page: page.toString(),
  });

  if (search && search.trim()) {
    params.append('search', search.trim());
  }
  if (status) {
    params.append('status', status);
  }
  if (audience_type) {
    params.append('audience_type', audience_type);
  }

  const url = `${API_ENDPOINTS.NOTIFICATIONS.List}?${params.toString()}`;
  
  return await apiCall(url, 'GET', undefined, token);
};

export const getNotificationDetails = async (notificationId: number | string) => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const url = API_ENDPOINTS.NOTIFICATIONS.Details(notificationId);
  
  return await apiCall(url, 'GET', undefined, token);
};

export const getAudienceData = async (search?: string, limit?: number) => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const params = new URLSearchParams();
  if (search && search.trim()) {
    params.append('search', search.trim());
  }
  if (limit) {
    params.append('limit', limit.toString());
  }

  const url = `${API_ENDPOINTS.NOTIFICATIONS.AudienceData}?${params.toString()}`;
  
  return await apiCall(url, 'GET', undefined, token);
};

export const getAudienceUsers = async (search?: string, role?: string, page?: number, per_page?: number) => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const params = new URLSearchParams();
  if (search && search.trim()) {
    params.append('search', search.trim());
  }
  if (role) {
    params.append('role', role);
  }
  if (page) {
    params.append('page', page.toString());
  }
  if (per_page) {
    params.append('per_page', per_page.toString());
  }

  const url = `${API_ENDPOINTS.NOTIFICATIONS.AudienceUsers}?${params.toString()}`;
  
  return await apiCall(url, 'GET', undefined, token);
};
