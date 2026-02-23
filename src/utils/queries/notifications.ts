import { apiCall } from '../customApiCall';
import { API_ENDPOINTS } from '../../config/apiConfig';
import Cookies from 'js-cookie';

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

export const getNotifications = async (
  page: number = 1, 
  search?: string, 
  status?: string, 
  audience_type?: string,
  period?: string,
  dateFrom?: string | null,
  dateTo?: string | null
) => {
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
  
  // Add date filter (period or date_from/date_to)
  const dateFilterQuery = buildDateFilterQuery(period, dateFrom, dateTo);
  if (dateFilterQuery) {
    // Parse the query string and add to params
    const dateParams = new URLSearchParams(dateFilterQuery);
    dateParams.forEach((value, key) => {
      params.append(key, value);
    });
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
