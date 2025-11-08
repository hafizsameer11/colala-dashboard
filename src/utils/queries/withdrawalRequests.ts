import Cookies from 'js-cookie';
import { apiCall } from '../customApiCall';
import { API_ENDPOINTS } from '../../config/apiConfig';

export const getWithdrawalRequests = async (page = 1) => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const url = `${API_ENDPOINTS.WITHDRAWAL_REQUESTS.List}?page=${page}`;
  return apiCall(url, 'GET', undefined, token);
};

export const getWithdrawalRequestDetails = async (requestId: number | string) => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }

  return apiCall(API_ENDPOINTS.WITHDRAWAL_REQUESTS.Details(requestId), 'GET', undefined, token);
};

export const approveWithdrawalRequest = async (requestId: number | string) => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }

  return apiCall(API_ENDPOINTS.WITHDRAWAL_REQUESTS.Approve(requestId), 'POST', {}, token);
};

export const rejectWithdrawalRequest = async (requestId: number | string) => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }

  return apiCall(API_ENDPOINTS.WITHDRAWAL_REQUESTS.Reject(requestId), 'POST', {}, token);
};


