import { apiCall } from '../customApiCall';
import { API_ENDPOINTS } from '../../config/apiConfig';
import Cookies from 'js-cookie';

export const createBanner = async (formData: FormData) => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const url = API_ENDPOINTS.BANNERS.Create;
  
  return await apiCall(url, 'POST', formData, token);
};

export const updateBanner = async (bannerId: number | string, formData: FormData) => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const url = API_ENDPOINTS.BANNERS.Update(bannerId);
  
  // Backend expects POST for updates
  return await apiCall(url, 'POST', formData, token);
};

export const deleteBanner = async (bannerId: number | string) => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const url = API_ENDPOINTS.BANNERS.Delete(bannerId);
  
  return await apiCall(url, 'DELETE', undefined, token);
};

export const trackBannerView = async (bannerId: number | string) => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const url = API_ENDPOINTS.BANNERS.TrackView(bannerId);
  
  return await apiCall(url, 'POST', undefined, token);
};

export const trackBannerClick = async (bannerId: number | string) => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const url = API_ENDPOINTS.BANNERS.TrackClick(bannerId);
  
  return await apiCall(url, 'POST', undefined, token);
};
