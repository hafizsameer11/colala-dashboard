import { apiCall } from './customApiCall';
import { API_ENDPOINTS } from '../config/apiConfig';
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

export interface ExportConfig {
  dataType: 'products' | 'services' | 'orders' | 'transactions' | 'users';
  status?: string;
  period?: string;
  search?: string;
  category?: string;
  userId?: number | string;
  typeFilter?: string;
}

/**
 * Fetch all data for export from API
 * Uses the same routes with export=true parameter
 */
export const fetchExportData = async (config: ExportConfig): Promise<any[]> => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    let url = '';
    let response;

    switch (config.dataType) {
      case 'products': {
        url = `${API_ENDPOINTS.ADMIN_PRODUCTS.List}?export=true`;
        if (config.status && config.status !== 'All') {
          url += `&status=${config.status}`;
        }
        if (config.search && config.search.trim()) {
          url += `&search=${encodeURIComponent(config.search.trim())}`;
        }
        response = await apiCall(url, 'GET', undefined, token);
        return response?.data?.products || [];
      }

      case 'services': {
        url = `${API_ENDPOINTS.ADMIN_SERVICES.List}?export=true`;
        if (config.status && config.status !== 'All') {
          url += `&status=${config.status}`;
        }
        if (config.search && config.search.trim()) {
          url += `&search=${encodeURIComponent(config.search.trim())}`;
        }
        if (config.category && config.category !== 'All Categories') {
          url += `&category=${encodeURIComponent(config.category)}`;
        }
        response = await apiCall(url, 'GET', undefined, token);
        return response?.data?.services || [];
      }

      case 'orders': {
        url = `${API_ENDPOINTS.BUYER_ORDERS.List}?export=true`;
        if (config.status && config.status !== 'All' && config.status !== 'all') {
          url += `&status=${config.status}`;
        }
        const apiPeriod = config.period ? mapPeriodToApi(config.period) : null;
        if (apiPeriod) {
          url += `&period=${apiPeriod}`;
        }
        if (config.search && config.search.trim()) {
          url += `&search=${encodeURIComponent(config.search.trim())}`;
        }
        response = await apiCall(url, 'GET', undefined, token);
        // Export endpoint returns same structure as normal endpoint
        // Return data as-is without transformation
        return Array.isArray(response?.data) ? response.data : (response?.data?.store_orders?.data || []);
      }

      case 'transactions': {
        if (!config.userId) {
          throw new Error('User ID is required for transactions export');
        }
        url = `${API_ENDPOINTS.BUYER_USERS.Transactions(config.userId)}?export=true`;
        const apiPeriod = config.period ? mapPeriodToApi(config.period) : null;
        if (apiPeriod) {
          url += `&period=${apiPeriod}`;
        }
        if (config.status && config.status !== 'All') {
          url += `&status=${config.status}`;
        }
        response = await apiCall(url, 'GET', undefined, token);
        return response?.data?.transactions?.data || [];
      }

      case 'users': {
        url = `${API_ENDPOINTS.BUYER_USERS.List}?export=true`;
        if (config.search && config.search.trim()) {
          url += `&search=${encodeURIComponent(config.search.trim())}`;
        }
        const apiPeriod = config.period ? mapPeriodToApi(config.period) : null;
        if (apiPeriod) {
          url += `&period=${apiPeriod}`;
        }
        response = await apiCall(url, 'GET', undefined, token);
        return response?.data?.users || response?.data?.data || [];
      }

      default:
        throw new Error(`Unsupported data type: ${config.dataType}`);
    }
  } catch (error) {
    console.error(`Export data fetch error for ${config.dataType}:`, error);
    throw error;
  }
};

