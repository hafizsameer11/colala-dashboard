import { apiCall } from '../customApiCall';
import { API_ENDPOINTS } from '../../config/apiConfig';
import Cookies from 'js-cookie';

export const getBanners = async (page: number = 1, search?: string, is_active?: boolean, audience_type?: string, position?: string) => {
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
  if (is_active !== undefined) {
    params.append('is_active', is_active.toString());
  }
  if (audience_type) {
    params.append('audience_type', audience_type);
  }
  if (position) {
    params.append('position', position);
  }

  const url = `${API_ENDPOINTS.BANNERS.List}?${params.toString()}`;
  
  return await apiCall(url, 'GET', undefined, token);
};

export const getBannerDetails = async (bannerId: number | string) => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const url = API_ENDPOINTS.BANNERS.Details(bannerId);
  
  return await apiCall(url, 'GET', undefined, token);
};

export const getBannerAnalytics = async (date_from?: string, date_to?: string) => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const params = new URLSearchParams();
  if (date_from) {
    params.append('date_from', date_from);
  }
  if (date_to) {
    params.append('date_to', date_to);
  }

  const url = `${API_ENDPOINTS.BANNERS.Analytics}?${params.toString()}`;
  
  return await apiCall(url, 'GET', undefined, token);
};
