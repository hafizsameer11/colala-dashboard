import { apiCall } from "../customApiCall";
import { API_ENDPOINTS } from "../../config/apiConfig";
import Cookies from 'js-cookie';

// GET /admin/dashboard
export const getDashboardData = async (period?: string): Promise<any> => {
  const token = Cookies.get('authToken');
  
  // Build URL with period parameter if provided
  let url = API_ENDPOINTS.DASHBOARD.Dashboard;
  if (period && period !== "All time") {
    const params = new URLSearchParams();
    // Map period to API format if needed
    params.append('period', period.toLowerCase().replace(/\s+/g, '_'));
    url = `${url}?${params.toString()}`;
  }
  
  return await apiCall(
    url,
    "GET",
    undefined,
    token
  );
};

// GET /admin/buyer-stats
export const getBuyerStats = async (): Promise<any> => {
  const token = Cookies.get('authToken');
  return await apiCall(
    API_ENDPOINTS.DASHBOARD.BuyerStats,
    "GET",
    undefined,
    token
  );
};

// GET /admin/seller-stats
export const getSellerStats = async (): Promise<any> => {
  const token = Cookies.get('authToken');
  return await apiCall(
    API_ENDPOINTS.DASHBOARD.SellerStats,
    "GET",
    undefined,
    token
  );
};

// GET /admin/site-stats
export const getSiteStats = async (): Promise<any> => {
  const token = Cookies.get('authToken');
  return await apiCall(
    API_ENDPOINTS.DASHBOARD.SiteStats,
    "GET",
    undefined,
    token
  );
};

// GET /admin/latest-chats
export const getLatestChats = async (): Promise<any> => {
  const token = Cookies.get('authToken');
  return await apiCall(
    API_ENDPOINTS.DASHBOARD.LatestChats,
    "GET",
    undefined,
    token
  );
};

// GET /admin/latest-orders
export const getLatestOrders = async (): Promise<any> => {
  const token = Cookies.get('authToken');
  return await apiCall(
    API_ENDPOINTS.DASHBOARD.LatestOrders,
    "GET",
    undefined,
    token
  );
};
