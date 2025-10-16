import { apiCall } from '../customApiCall';
import { API_ENDPOINTS } from '../../config/apiConfig';
import Cookies from 'js-cookie';

/**
 * Reply to a support ticket
 */
export const replyToTicket = async (ticketId: number | string, data: string | FormData) => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  
  try {
    const response = await apiCall(
      API_ENDPOINTS.SUPPORT.Reply(ticketId), 
      'POST', 
      data, 
      token
    );
    return response;
  } catch (error) {
    console.error('Reply to ticket API call error:', error);
    throw error;
  }
};

/**
 * Update ticket status
 */
export const updateTicketStatus = async (ticketId: number | string, status: string) => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  
  try {
    const response = await apiCall(
      API_ENDPOINTS.SUPPORT.UpdateStatus(ticketId), 
      'PUT', 
      { status }, 
      token
    );
    return response;
  } catch (error) {
    console.error('Update ticket status API call error:', error);
    throw error;
  }
};

/**
 * Resolve ticket
 */
export const resolveTicket = async (ticketId: number | string) => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  
  try {
    const response = await apiCall(
      API_ENDPOINTS.SUPPORT.Resolve(ticketId), 
      'PUT', 
      undefined, 
      token
    );
    return response;
  } catch (error) {
    console.error('Resolve ticket API call error:', error);
    throw error;
  }
};

/**
 * Close ticket
 */
export const closeTicket = async (ticketId: number | string) => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  
  try {
    const response = await apiCall(
      API_ENDPOINTS.SUPPORT.Close(ticketId), 
      'PUT', 
      undefined, 
      token
    );
    return response;
  } catch (error) {
    console.error('Close ticket API call error:', error);
    throw error;
  }
};

/**
 * Delete ticket
 */
export const deleteTicket = async (ticketId: number | string) => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  
  try {
    const response = await apiCall(
      API_ENDPOINTS.SUPPORT.Delete(ticketId), 
      'DELETE', 
      undefined, 
      token
    );
    return response;
  } catch (error) {
    console.error('Delete ticket API call error:', error);
    throw error;
  }
};
