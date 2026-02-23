import Cookies from 'js-cookie';
import { apiCall } from '../customApiCall';
import { API_ENDPOINTS } from '../../config/apiConfig';

/**
 * Map UI period options to API period values
 */
const mapPeriodToApi = (period: string): string | null => {
  const periodMap: Record<string, string> = {
    'Today': 'today',
    'This Week': 'this_week',
    'This Month': 'this_month',
    'Last Month': 'last_month',
    'This Year': 'this_year',
    'Last Year': 'this_year',
  };
  
  if (period === 'All time' || !period) {
    return null;
  }
  
  return periodMap[period] || null;
};

/**
 * Build date filter query parameters
 * Priority: period > date_from/date_to
 */
const buildDateFilterQuery = (period?: string, dateFrom?: string | null, dateTo?: string | null): string => {
  let query = '';
  
  // Priority 1: Period filter (highest priority)
  const apiPeriod = period ? mapPeriodToApi(period) : null;
  if (apiPeriod) {
    query += `&period=${apiPeriod}`;
    return query; // Period takes priority, ignore custom date range
  }
  
  // Priority 2: Custom date range (only if both dateFrom and dateTo are provided)
  if (dateFrom && dateTo) {
    query += `&date_from=${dateFrom}`;
    query += `&date_to=${dateTo}`;
  }
  
  return query;
};

export const getWithdrawalRequests = async (
  page = 1,
  status?: string,
  period?: string,
  dateFrom?: string | null,
  dateTo?: string | null,
  search?: string
) => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }

  let url = `${API_ENDPOINTS.WITHDRAWAL_REQUESTS.List}?page=${page}`;
  if (status && status !== 'All' && status !== 'all') {
    url += `&status=${encodeURIComponent(status)}`;
  }
  url += buildDateFilterQuery(period, dateFrom, dateTo);
  if (search && search.trim()) {
    url += `&search=${encodeURIComponent(search.trim())}`;
  }
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


