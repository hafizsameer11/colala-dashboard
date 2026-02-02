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
 * Get chats list with pagination and filtering
 */
export const getChats = async (
  page: number = 1, 
  search?: string, 
  type?: string,
  period?: string,
  dateFrom?: string | null,
  dateTo?: string | null,
  status?: string
) => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  try {
    let url = `${API_ENDPOINTS.CHATS.List}?page=${page}`;
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }
    if (type) {
      url += `&type=${encodeURIComponent(type)}`;
    }
    if (status) {
      url += `&status=${encodeURIComponent(status)}`;
    }
    url += buildDateFilterQuery(period, dateFrom, dateTo);
    const response = await apiCall(url, 'GET', undefined, token);
    return response;
  } catch (error) {
    console.error('Chats API call error:', error);
    throw error;
  }
};

/**
 * Get chat statistics
 */
export const getChatsStats = async () => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  try {
    const response = await apiCall(API_ENDPOINTS.CHATS.Stats, 'GET', undefined, token);
    return response;
  } catch (error) {
    console.error('Chats stats API call error:', error);
    throw error;
  }
};

/**
 * Get chat details by ID
 */
export const getChatDetails = async (chatId: number | string) => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  try {
    const response = await apiCall(API_ENDPOINTS.CHATS.Details(chatId), 'GET', undefined, token);
    return response;
  } catch (error) {
    console.error('Chat details API call error:', error);
    throw error;
  }
};

/**
 * Send message to chat
 * Supports both JSON (text only) and FormData (with attachment)
 */
export const sendChatMessage = async (
  chatId: number | string, 
  messageData: FormData | {
    message: string;
    sender_type: 'buyer' | 'store';
  }
) => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  try {
    const response = await apiCall(API_ENDPOINTS.CHATS.SendMessage(chatId), 'POST', messageData, token);
    return response;
  } catch (error) {
    console.error('Send chat message API call error:', error);
    throw error;
  }
};

/**
 * Update chat status
 */
export const updateChatStatus = async (chatId: number | string, statusData: {
  status: 'open' | 'closed' | 'resolved';
  type?: 'general' | 'support' | 'dispute';
}) => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  
  // Validate and ensure status is never null
  if (!statusData.status || !['open', 'closed', 'resolved'].includes(statusData.status)) {
    throw new Error('Invalid status value. Status must be one of: open, closed, resolved');
  }
  
  // Prepare the payload, ensuring no null values are sent
  const payload: {
    status: 'open' | 'closed' | 'resolved';
    type?: 'general' | 'support' | 'dispute';
  } = {
    status: statusData.status
  };
  
  // Only include type if it's a valid value
  if (statusData.type && ['general', 'support', 'dispute'].includes(statusData.type)) {
    payload.type = statusData.type;
  }
  
  console.log('Sending status update to API:', {
    chatId,
    payload,
    endpoint: API_ENDPOINTS.CHATS.UpdateStatus(chatId)
  });
  
  try {
    const response = await apiCall(API_ENDPOINTS.CHATS.UpdateStatus(chatId), 'PUT', payload, token);
    console.log('Status update API response:', response);
    return response;
  } catch (error) {
    console.error('Update chat status API call error:', error);
    throw error;
  }
};