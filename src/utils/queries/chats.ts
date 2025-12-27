import { apiCall } from '../customApiCall';
import { API_ENDPOINTS } from '../../config/apiConfig';
import Cookies from 'js-cookie';

/**
 * Get chats list with pagination and filtering
 */
export const getChats = async (page: number = 1, search?: string, type?: string) => {
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
 */
export const sendChatMessage = async (chatId: number | string, messageData: {
  message: string;
  sender_type: 'buyer' | 'store';
}) => {
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