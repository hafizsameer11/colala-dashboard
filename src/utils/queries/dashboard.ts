import { apiCall } from "../customApiCall";
import { API_ENDPOINTS } from "../../config/apiConfig";
import Cookies from 'js-cookie';

// GET /admin/dashboard
export const getDashboardData = async (): Promise<any> => {
  const token = Cookies.get('authToken');
  return await apiCall(
    API_ENDPOINTS.DASHBOARD.Dashboard,
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
