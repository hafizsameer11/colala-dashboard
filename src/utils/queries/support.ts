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

/**
 * Get support tickets list with pagination and filtering
 */
export const getSupportTickets = async (
  page: number = 1, 
  search?: string, 
  status?: string,
  period?: string,
  dateFrom?: string | null,
  dateTo?: string | null,
  category?: string
) => {
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
    if (category) {
      url += `&category=${encodeURIComponent(category)}`;
    }
    url += buildDateFilterQuery(period, dateFrom, dateTo);
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
