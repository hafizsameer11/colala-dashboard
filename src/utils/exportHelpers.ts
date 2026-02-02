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

/**
 * Build date filter query parameters
 * Priority: period > date_from/date_to
 */
const buildDateFilterParams = (config: ExportConfig): string => {
  let params = '';
  
  // Priority 1: Period filter (highest priority)
  const apiPeriod = config.period ? mapPeriodToApi(config.period) : null;
  if (apiPeriod) {
    params += `&period=${apiPeriod}`;
    return params; // Period takes priority, ignore custom date range
  }
  
  // Priority 2: Custom date range (only if both dateFrom and dateTo are provided)
  if (config.dateFrom && config.dateTo) {
    params += `&date_from=${config.dateFrom}`;
    params += `&date_to=${config.dateTo}`;
  }
  
  return params;
};

export interface ExportConfig {
  dataType: 'products' | 'services' | 'orders' | 'transactions' | 'users' | 'support' | 'chats' | 'disputes' | 'adminTransactions' | 'sellerUsers' | 'stores' | 'allUsers' | 'promotions' | 'withdrawals' | 'notifications' | 'banners' | 'ratings' | 'subscriptions' | 'leaderboard' | 'activities';
  status?: string;
  period?: string;
  dateFrom?: string | null;
  dateTo?: string | null;
  search?: string;
  category?: string;
  userId?: number | string;
  typeFilter?: string;
  level?: number | string;
  reviewType?: 'products' | 'stores';
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
        url += buildDateFilterParams(config);
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
        url += buildDateFilterParams(config);
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
        url += buildDateFilterParams(config);
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
        url += buildDateFilterParams(config);
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
        url += buildDateFilterParams(config);
        response = await apiCall(url, 'GET', undefined, token);
        console.log('Users export API response:', response);
        console.log('Users export response.data:', response?.data);
        
        // Export endpoint returns same structure as normal endpoint
        // Try multiple possible paths for the data
        let users = null;
        if (Array.isArray(response?.data)) {
          // If data is directly an array
          users = response.data;
        } else if (Array.isArray(response?.data?.users)) {
          // If data.users is an array
          users = response.data.users;
        } else if (Array.isArray(response?.data?.data)) {
          // If data.data is an array
          users = response.data.data;
        } else {
          // Fallback to empty array
          users = [];
        }
        
        console.log('Users export extracted:', users);
        console.log('Users export is array:', Array.isArray(users));
        console.log('Users export length:', users?.length);
        return Array.isArray(users) ? users : [];
      }

      case 'support': {
        url = `${API_ENDPOINTS.SUPPORT.List}?export=true`;
        if (config.status && config.status !== 'All') {
          url += `&status=${encodeURIComponent(config.status)}`;
        }
        url += buildDateFilterParams(config);
        if (config.search && config.search.trim()) {
          url += `&search=${encodeURIComponent(config.search.trim())}`;
        }
        response = await apiCall(url, 'GET', undefined, token);
        return response?.data?.tickets || [];
      }

      case 'chats': {
        url = `${API_ENDPOINTS.CHATS.List}?export=true`;
        if (config.status && config.status !== 'All') {
          url += `&status=${encodeURIComponent(config.status)}`;
        }
        url += buildDateFilterParams(config);
        if (config.search && config.search.trim()) {
          url += `&search=${encodeURIComponent(config.search.trim())}`;
        }
        if (config.typeFilter && config.typeFilter !== 'General') {
          url += `&type=${encodeURIComponent(config.typeFilter.toLowerCase())}`;
        }
        response = await apiCall(url, 'GET', undefined, token);
        return response?.data?.chats || response?.data?.data || [];
      }

      case 'disputes': {
        url = `${API_ENDPOINTS.DISPUTES.List}?export=true`;
        if (config.status && config.status !== 'All') {
          url += `&status=${encodeURIComponent(config.status)}`;
        }
        url += buildDateFilterParams(config);
        if (config.search && config.search.trim()) {
          url += `&search=${encodeURIComponent(config.search.trim())}`;
        }
        response = await apiCall(url, 'GET', undefined, token);
        return response?.data?.disputes || response?.data?.data || [];
      }

      case 'adminTransactions': {
        url = `${API_ENDPOINTS.ADMIN_TRANSACTIONS.List}?export=true`;
        if (config.status && config.status !== 'All' && config.status !== 'all') {
          url += `&status=${encodeURIComponent(config.status)}`;
        }
        if (config.typeFilter && config.typeFilter !== 'All') {
          // Convert typeFilter to API format (deposit, withdrawal, payment)
          const typeMap: Record<string, string> = {
            'Deposit': 'deposit',
            'Withdrawals': 'withdrawal',
            'Payments': 'payment'
          };
          const apiType = typeMap[config.typeFilter] || config.typeFilter.toLowerCase();
          url += `&type=${encodeURIComponent(apiType)}`;
        }
        url += buildDateFilterParams(config);
        if (config.search && config.search.trim()) {
          url += `&search=${encodeURIComponent(config.search.trim())}`;
        }
        response = await apiCall(url, 'GET', undefined, token);
        // Export endpoint returns same structure as normal endpoint
        return Array.isArray(response?.data) ? response.data : (response?.data?.transactions || response?.data?.data || []);
      }

      case 'sellerUsers': {
        url = `${API_ENDPOINTS.SELLER_USERS.List}?export=true`;
        if (config.search && config.search.trim()) {
          url += `&search=${encodeURIComponent(config.search.trim())}`;
        }
        url += buildDateFilterParams(config);
        response = await apiCall(url, 'GET', undefined, token);
        // Export endpoint returns same structure as normal endpoint
        return Array.isArray(response?.data) ? response.data : (response?.data?.users || response?.data?.data || []);
      }

      case 'stores': {
        url = `${API_ENDPOINTS.ADMIN_STORES.List}?export=true`;
        if (config.status && config.status !== 'All') {
          url += `&status=${encodeURIComponent(config.status)}`;
        }
        if (config.level && config.level !== 'all') {
          url += `&level=${config.level}`;
        }
        url += buildDateFilterParams(config);
        if (config.search && config.search.trim()) {
          url += `&search=${encodeURIComponent(config.search.trim())}`;
        }
        response = await apiCall(url, 'GET', undefined, token);
        return Array.isArray(response?.data) ? response.data : (response?.data?.stores?.data || response?.data?.data || []);
      }

      case 'allUsers': {
        url = `${API_ENDPOINTS.ALL_USERS.List}?export=true`;
        if (config.search && config.search.trim()) {
          url += `&search=${encodeURIComponent(config.search.trim())}`;
        }
        url += buildDateFilterParams(config);
        response = await apiCall(url, 'GET', undefined, token);
        return Array.isArray(response?.data) ? response.data : (response?.data?.users || response?.data?.data || []);
      }

      case 'promotions': {
        url = `${API_ENDPOINTS.ADMIN_PROMOTIONS.List}?export=true`;
        if (config.status && config.status !== 'All' && config.status !== 'all') {
          url += `&status=${encodeURIComponent(config.status)}`;
        }
        url += buildDateFilterParams(config);
        if (config.search && config.search.trim()) {
          url += `&search=${encodeURIComponent(config.search.trim())}`;
        }
        response = await apiCall(url, 'GET', undefined, token);
        return response?.data?.promotions || response?.data?.data || [];
      }

      case 'withdrawals': {
        url = `${API_ENDPOINTS.WITHDRAWAL_REQUESTS.List}?export=true`;
        if (config.status && config.status !== 'All' && config.status !== 'all') {
          url += `&status=${encodeURIComponent(config.status)}`;
        }
        url += buildDateFilterParams(config);
        if (config.search && config.search.trim()) {
          url += `&search=${encodeURIComponent(config.search.trim())}`;
        }
        response = await apiCall(url, 'GET', undefined, token);
        return Array.isArray(response?.data) ? response.data : (response?.data?.data || []);
      }

      case 'notifications': {
        url = `${API_ENDPOINTS.NOTIFICATIONS.List}?export=true`;
        if (config.search && config.search.trim()) {
          url += `&search=${encodeURIComponent(config.search.trim())}`;
        }
        url += buildDateFilterParams(config);
        response = await apiCall(url, 'GET', undefined, token);
        return response?.data?.notifications || response?.data?.data || [];
      }

      case 'banners': {
        url = `${API_ENDPOINTS.BANNERS.List}?export=true`;
        if (config.search && config.search.trim()) {
          url += `&search=${encodeURIComponent(config.search.trim())}`;
        }
        url += buildDateFilterParams(config);
        response = await apiCall(url, 'GET', undefined, token);
        return response?.data?.banners || response?.data?.data || [];
      }

      case 'ratings': {
        // Ratings can be for products or stores
        if (config.reviewType === 'stores') {
          url = `${API_ENDPOINTS.RATINGS_REVIEWS.Stores.List}?export=true`;
        } else {
          url = `${API_ENDPOINTS.RATINGS_REVIEWS.Products.List}?export=true`;
        }
        if (config.search && config.search.trim()) {
          url += `&search=${encodeURIComponent(config.search.trim())}`;
        }
        url += buildDateFilterParams(config);
        response = await apiCall(url, 'GET', undefined, token);
        return response?.data?.reviews || response?.data?.data || [];
      }

      case 'subscriptions': {
        url = `${API_ENDPOINTS.ADMIN_SUBSCRIPTIONS.List}?export=true`;
        if (config.status && config.status !== 'All' && config.status !== 'all') {
          url += `&status=${encodeURIComponent(config.status)}`;
        }
        url += buildDateFilterParams(config);
        if (config.search && config.search.trim()) {
          url += `&search=${encodeURIComponent(config.search.trim())}`;
        }
        response = await apiCall(url, 'GET', undefined, token);
        return response?.data?.subscriptions || response?.data?.data || [];
      }

      case 'leaderboard': {
        url = `${API_ENDPOINTS.LEADERBOARD.Main}?export=true`;
        // Leaderboard may use period filter differently - check API docs
        if (config.period && config.period !== 'All time') {
          // Map period to leaderboard format (today, weekly, monthly, all)
          const leaderboardPeriodMap: Record<string, string> = {
            'Today': 'today',
            'This Week': 'weekly',
            'This Month': 'monthly',
            'Last Month': 'monthly',
            'This Year': 'monthly',
            'Last Year': 'monthly',
            'All time': 'all'
          };
          const leaderboardPeriod = leaderboardPeriodMap[config.period] || 'all';
          if (leaderboardPeriod !== 'all') {
            url += `&period=${leaderboardPeriod}`;
          }
        }
        response = await apiCall(url, 'GET', undefined, token);
        // Leaderboard structure may vary - return all periods or current period
        if (response?.data) {
          // If it's an object with period keys, flatten all periods
          if (typeof response.data === 'object' && !Array.isArray(response.data)) {
            const allData: any[] = [];
            Object.values(response.data).forEach((periodData: any) => {
              if (Array.isArray(periodData)) {
                allData.push(...periodData);
              }
            });
            return allData;
          }
          return Array.isArray(response.data) ? response.data : [];
        }
        return [];
      }

      case 'activities': {
        if (!config.userId) {
          throw new Error('User ID is required for activities export');
        }
        url = `${API_ENDPOINTS.BUYER_USERS.Activities(config.userId)}?export=true`;
        url += buildDateFilterParams(config);
        response = await apiCall(url, 'GET', undefined, token);
        return response?.data?.activities || response?.data?.data || [];
      }

      default:
        throw new Error(`Unsupported data type: ${config.dataType}`);
    }
  } catch (error) {
    console.error(`Export data fetch error for ${config.dataType}:`, error);
    throw error;
  }
};

