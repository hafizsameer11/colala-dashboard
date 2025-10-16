import { apiCall } from '../customApiCall';
import { API_ENDPOINTS } from '../../config/apiConfig';
import Cookies from 'js-cookie';

export const createNotification = async (formData: FormData) => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const url = API_ENDPOINTS.NOTIFICATIONS.Create;
  
  return await apiCall(url, 'POST', formData, token);
};

export const updateNotificationStatus = async (notificationId: number | string, status: string) => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const url = API_ENDPOINTS.NOTIFICATIONS.UpdateStatus(notificationId);
  const data = { status };
  
  return await apiCall(url, 'PUT', data, token);
};

export const deleteNotification = async (notificationId: number | string) => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const url = API_ENDPOINTS.NOTIFICATIONS.Delete(notificationId);
  
  return await apiCall(url, 'DELETE', undefined, token);
};
