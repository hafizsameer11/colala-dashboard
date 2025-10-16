import { apiCall } from '../customApiCall';
import { API_ENDPOINTS } from '../../config/apiConfig';
import Cookies from 'js-cookie';

export const getReferrals = async (page: number = 1, search?: string) => {
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

  const url = `${API_ENDPOINTS.REFERRALS.List}?${params.toString()}`;
  
  return await apiCall(url, 'GET', undefined, token);
};

export const getReferralDetails = async (referrerId: number | string) => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const url = API_ENDPOINTS.REFERRALS.Details(referrerId);
  
  return await apiCall(url, 'GET', undefined, token);
};
