import { apiCall } from '../customApiCall';
import { API_ENDPOINTS } from '../../config/apiConfig';
import Cookies from 'js-cookie';

/**
 * Get user statistics (total, active, new users)
 */
export const getUserStats = async () => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  try {
    const response = await apiCall(API_ENDPOINTS.BUYER_USERS.Stats, 'GET', undefined, token);
    return response;
  } catch (error) {
    console.error('User stats API call error:', error);
    throw error;
  }
};

/**
 * Get users list with pagination
 */
export const getUsersList = async (page: number = 1, search?: string) => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  try {
    let url = `${API_ENDPOINTS.BUYER_USERS.List}?page=${page}`;
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }
    const response = await apiCall(url, 'GET', undefined, token);
    return response;
  } catch (error) {
    console.error('Users list API call error:', error);
    throw error;
  }
};

/**
 * Search users
 */
export const searchUsers = async (searchTerm: string) => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  try {
    const response = await apiCall(API_ENDPOINTS.BUYER_USERS.Search, 'GET', { search: searchTerm }, token);
    return response;
  } catch (error) {
    console.error('Search users API call error:', error);
    throw error;
  }
};

/**
 * Get user profile details
 */
export const getUserProfile = async (userId: number | string) => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  try {
    const response = await apiCall(API_ENDPOINTS.BUYER_USERS.Profile(userId), 'GET', undefined, token);
    return response;
  } catch (error) {
    console.error('User profile API call error:', error);
    throw error;
  }
};

/**
 * Get user orders with pagination
 */
export const getUserOrders = async (userId: number | string) => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  try {
    const response = await apiCall(API_ENDPOINTS.BUYER_USERS.Orders(userId), 'GET', undefined, token);
    return response;
  } catch (error) {
    console.error('User orders API call error:', error);
    throw error;
  }
};

/**
 * Get order details by order ID
 */
export const getOrderDetails = async (userId: number | string, orderId: number | string) => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  try {
    const response = await apiCall(API_ENDPOINTS.BUYER_USERS.OrderDetails(userId, orderId), 'GET', undefined, token);
    return response;
  } catch (error) {
    console.error('Order details API call error:', error);
    throw error;
  }
};

/**
 * Get user chats with pagination
 */
export const getUserChats = async (userId: number | string, page: number = 1) => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  try {
    const response = await apiCall(`${API_ENDPOINTS.BUYER_USERS.Chats(userId)}?page=${page}`, 'GET', undefined, token);
  return response;
  } catch (error) {
    console.error('User chats API call error:', error);
    throw error;
  }
};

/**
 * Get chat details by chat ID
 */
export const getChatDetails = async (userId: number | string, chatId: number | string) => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  try {
    const response = await apiCall(API_ENDPOINTS.BUYER_USERS.ChatDetails(userId, chatId), 'GET', undefined, token);
    return response;
  } catch (error) {
    console.error('Chat details API call error:', error);
    throw error;
  }
};

/**
 * Get user transactions with pagination
 */
export const getUserTransactions = async (userId: number | string, page: number = 1) => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  try {
    const response = await apiCall(`${API_ENDPOINTS.BUYER_USERS.Transactions(userId)}?page=${page}`, 'GET', undefined, token);
    return response;
  } catch (error) {
    console.error('User transactions API call error:', error);
    throw error;
  }
};

/**
 * Get transaction details by transaction ID
 */
export const getTransactionDetails = async (userId: number | string, transactionId: number | string) => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  try {
    const response = await apiCall(API_ENDPOINTS.BUYER_USERS.TransactionDetails(userId, transactionId), 'GET', undefined, token);
    return response;
  } catch (error) {
    console.error('Transaction details API call error:', error);
    throw error;
  }
};

/**
 * Get buyer orders with pagination
 */
export const getBuyerOrders = async (page: number = 1) => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  try {
    const response = await apiCall(`${API_ENDPOINTS.BUYER_ORDERS.List}?page=${page}`, 'GET', undefined, token);
    return response;
  } catch (error) {
    console.error('Buyer orders API call error:', error);
    throw error;
  }
};

/**
 * Get buyer order details by order ID
 */
export const getBuyerOrderDetails = async (orderId: number | string) => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  try {
    const response = await apiCall(API_ENDPOINTS.BUYER_ORDERS.Details(orderId), 'GET', undefined, token);
    return response;
  } catch (error) {
    console.error('Buyer order details API call error:', error);
    throw error;
  }
};

/**
 * Get buyer transactions with pagination
 */
export const getBuyerTransactions = async (page: number = 1) => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  try {
    const response = await apiCall(`${API_ENDPOINTS.BUYER_TRANSACTIONS.List}?page=${page}`, 'GET', undefined, token);
    return response;
  } catch (error) {
    console.error('Buyer transactions API call error:', error);
    throw error;
  }
};

/**
 * Get buyer transaction details by transaction ID
 */
export const getBuyerTransactionDetails = async (transactionId: number | string) => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  try {
    const response = await apiCall(API_ENDPOINTS.BUYER_TRANSACTIONS.Details(transactionId), 'GET', undefined, token);
    return response;
  } catch (error) {
    console.error('Buyer transaction details API call error:', error);
    throw error;
  }
};

/**
 * Get balance data with pagination
 */
export const getBalanceData = async (page: number = 1) => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  try {
    const response = await apiCall(`${API_ENDPOINTS.BALANCE.List}?page=${page}`, 'GET', undefined, token);
    return response;
  } catch (error) {
    console.error('Balance data API call error:', error);
    throw error;
  }
};

/**
 * Get seller users (stores) with pagination
 */
export const getSellerUsers = async (page: number = 1, level?: number | 'all', search?: string) => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  try {
    let url = `${API_ENDPOINTS.SELLER_USERS.List}?page=${page}`;
    if (typeof level === 'number') {
      url += `&level=${level}`;
    }
    if (search && search.trim()) {
      url += `&search=${encodeURIComponent(search.trim())}`;
    }
    const response = await apiCall(url, 'GET', undefined, token);
    return response;
  } catch (error) {
    console.error('Seller users API call error:', error);
    throw error;
  }
};

/**
 * Get seller details by ID
 */
export const getSellerDetails = async (sellerId: number | string) => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  try {
    const response = await apiCall(API_ENDPOINTS.STORE_DATA.TabsData.SellerDetails(sellerId), 'GET', undefined, token);
    return response;
  } catch (error) {
    console.error('Seller details API call error:', error);
    throw error;
  }
};

/**
 * Get seller orders with pagination
 */
export const getSellerOrders = async (sellerId: number | string, page: number = 1) => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  try {
    const url = `${API_ENDPOINTS.STORE_DATA.TabsData.Orders(sellerId)}?page=${page}`;
    const response = await apiCall(url, 'GET', undefined, token);
    return response;
  } catch (error) {
    console.error('Seller orders API call error:', error);
    throw error;
  }
};

/**
 * Get seller order details by userId and orderId
 */
export const getSellerOrderDetails = async (sellerId: number | string, orderId: number | string) => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  try {
    const response = await apiCall(API_ENDPOINTS.SELLER_ORDERS.Details(sellerId, orderId), 'GET', undefined, token);
    return response;
  } catch (error) {
    console.error('Seller order details API call error:', error);
    throw error;
  }
};

/**
 * Get seller chats with pagination
 */
export const getSellerChats = async (sellerId: number | string, page: number = 1) => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  try {
    const url = `${API_ENDPOINTS.STORE_DATA.TabsData.Chats(sellerId)}?page=${page}`;
    const response = await apiCall(url, 'GET', undefined, token);
    return response;
  } catch (error) {
    console.error('Seller chats API call error:', error);
    throw error;
  }
};

/**
 * Get seller chat details
 */
export const getSellerChatDetails = async (userId: number | string, chatId: number | string) => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  try {
    const response = await apiCall(API_ENDPOINTS.SELLER_CHATS.Details(userId, chatId), 'GET', undefined, token);
    return response;
  } catch (error) {
    console.error('Seller chat details API call error:', error);
    throw error;
  }
};

/**
 * Get seller transactions with pagination
 */
export const getSellerTransactions = async (userId: number | string, page: number = 1) => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  try {
    const response = await apiCall(`${API_ENDPOINTS.SELLER_TRANSACTIONS.List(userId)}?page=${page}`, 'GET', undefined, token);
    return response;
  } catch (error) {
    console.error('Seller transactions API call error:', error);
    throw error;
  }
};

/**
 * Get seller social feed with pagination
 */
export const getSellerSocialFeed = async (userId: number | string, page: number = 1) => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  try {
    const response = await apiCall(`${API_ENDPOINTS.SELLER_SOCIAL_FEED.List(userId)}?page=${page}`, 'GET', undefined, token);
    return response;
  } catch (error) {
    console.error('Seller social feed API call error:', error);
    throw error;
  }
};

/**
 * Get seller social feed post details
 */
export const getSellerSocialFeedDetails = async (userId: number | string, postId: number | string) => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  try {
    const response = await apiCall(API_ENDPOINTS.SELLER_SOCIAL_FEED.Details(userId, postId), 'GET', undefined, token);
    return response;
  } catch (error) {
    console.error('Seller social feed details API call error:', error);
    throw error;
  }
};

/**
 * Delete seller social feed post
 */
export const deleteSellerSocialFeedPost = async (userId: number | string, postId: number | string) => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  try {
    const response = await apiCall(API_ENDPOINTS.SELLER_SOCIAL_FEED.Delete(userId, postId), 'DELETE', undefined, token);
    return response;
  } catch (error) {
    console.error('Delete seller social feed post API call error:', error);
    throw error;
  }
};

/**
 * Get seller products with pagination
 */
export const getSellerProducts = async (userId: number | string, page: number = 1) => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  try {
    const response = await apiCall(`${API_ENDPOINTS.SELLER_PRODUCTS.List(userId)}?page=${page}`, 'GET', undefined, token);
    return response;
  } catch (error) {
    console.error('Seller products API call error:', error);
    throw error;
  }
};

/**
 * Get seller product details
 */
export const getSellerProductDetails = async (userId: number | string, productId: number | string) => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  try {
    const response = await apiCall(API_ENDPOINTS.SELLER_PRODUCTS.Details(userId, productId), 'GET', undefined, token);
    return response;
  } catch (error) {
    console.error('Seller product details API call error:', error);
    throw error;
  }
};

/**
 * Get seller announcements with pagination
 */
export const getSellerAnnouncements = async (userId: number | string, page: number = 1) => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  try {
    const response = await apiCall(`${API_ENDPOINTS.SELLER_ANNOUNCEMENTS.List(userId)}?page=${page}`, 'GET', undefined, token);
    return response;
  } catch (error) {
    console.error('Seller announcements API call error:', error);
    throw error;
  }
};

/**
 * Create seller announcement
 */
export const createSellerAnnouncement = async (userId: number | string, message: string) => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  try {
    const response = await apiCall(API_ENDPOINTS.SELLER_ANNOUNCEMENTS.Create(userId), 'POST', { message }, token);
    return response;
  } catch (error) {
    console.error('Create seller announcement API call error:', error);
    throw error;
  }
};

/**
 * Update seller announcement
 */
export const updateSellerAnnouncement = async (userId: number | string, announcementId: number | string, message: string) => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  try {
    const response = await apiCall(API_ENDPOINTS.SELLER_ANNOUNCEMENTS.Update(userId, announcementId), 'PUT', { message }, token);
    return response;
  } catch (error) {
    console.error('Update seller announcement API call error:', error);
    throw error;
  }
};

/**
 * Get seller banners with pagination
 */
export const getSellerBanners = async (userId: number | string, page: number = 1) => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  try {
    const response = await apiCall(`${API_ENDPOINTS.SELLER_BANNERS.List(userId)}?page=${page}`, 'GET', undefined, token);
    return response;
  } catch (error) {
    console.error('Seller banners API call error:', error);
    throw error;
  }
};

/**
 * Create seller banner
 */
export const createSellerBanner = async (userId: number | string, formData: FormData) => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  try {
    const response = await apiCall(API_ENDPOINTS.SELLER_BANNERS.Create(userId), 'POST', formData, token, true);
    return response;
  } catch (error) {
    console.error('Create seller banner API call error:', error);
    throw error;
  }
};

/**
 * Update seller banner
 */
export const updateSellerBanner = async (userId: number | string, bannerId: number | string, formData: FormData) => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  try {
    const response = await apiCall(API_ENDPOINTS.SELLER_BANNERS.Update(userId, bannerId), 'PUT', formData, token, true);
    return response;
  } catch (error) {
    console.error('Update seller banner API call error:', error);
    throw error;
  }
};

/**
 * Delete seller banner
 */
export const deleteSellerBanner = async (userId: number | string, bannerId: number | string) => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  try {
    const response = await apiCall(API_ENDPOINTS.SELLER_BANNERS.Delete(userId, bannerId), 'DELETE', undefined, token);
    return response;
  } catch (error) {
    console.error('Delete seller banner API call error:', error);
    throw error;
  }
};

/**
 * Get seller coupons with pagination
 */
export const getSellerCoupons = async (userId: number | string, page: number = 1) => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  try {
    const response = await apiCall(`${API_ENDPOINTS.SELLER_COUPONS.List(userId)}?page=${page}`, 'GET', undefined, token);
    return response;
  } catch (error) {
    console.error('Seller coupons API call error:', error);
    throw error;
  }
};

/**
 * Create seller coupon
 */
export const createSellerCoupon = async (userId: number | string, couponData: any) => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  try {
    const response = await apiCall(API_ENDPOINTS.SELLER_COUPONS.Create(userId), 'POST', couponData, token);
    return response;
  } catch (error) {
    console.error('Create seller coupon API call error:', error);
    throw error;
  }
};

/**
 * Get seller loyalty settings
 */
export const getSellerLoyaltySettings = async (userId: number | string) => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  try {
    const response = await apiCall(API_ENDPOINTS.SELLER_LOYALTY.Settings(userId), 'GET', undefined, token);
    return response;
  } catch (error) {
    console.error('Seller loyalty settings API call error:', error);
    throw error;
  }
};

/**
 * Update seller loyalty settings
 */
export const updateSellerLoyaltySettings = async (userId: number | string, settingsData: any) => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  try {
    const response = await apiCall(API_ENDPOINTS.SELLER_LOYALTY.UpdateSettings(userId), 'PUT', settingsData, token);
    return response;
  } catch (error) {
    console.error('Update seller loyalty settings API call error:', error);
    throw error;
  }
};

/**
 * Get seller loyalty customers
 */
export const getSellerLoyaltyCustomers = async (userId: number | string) => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  try {
    const response = await apiCall(API_ENDPOINTS.SELLER_LOYALTY.Customers(userId), 'GET', undefined, token);
    return response;
  } catch (error) {
    console.error('Seller loyalty customers API call error:', error);
    throw error;
  }
};

/**
 * Get admin orders with pagination and filtering
 */
export const getAdminOrders = async (page: number = 1, status?: string) => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  try {
    let url = `${API_ENDPOINTS.ADMIN_ORDERS.List}?page=${page}`;
    if (status && status !== 'all') {
      url += `&status=${status}`;
    }
    const response = await apiCall(url, 'GET', undefined, token);
    return response;
  } catch (error) {
    console.error('Admin orders API call error:', error);
    throw error;
  }
};

/**
 * Get admin order details
 */
export const getAdminOrderDetails = async (storeOrderId: number | string) => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  try {
    const response = await apiCall(API_ENDPOINTS.ADMIN_ORDERS.Details(storeOrderId), 'GET', undefined, token);
    return response;
  } catch (error) {
    console.error('Admin order details API call error:', error);
    throw error;
  }
};

/**
 * Update order status
 */
export const updateOrderStatus = async (storeOrderId: number | string, statusData: any) => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  try {
    const response = await apiCall(API_ENDPOINTS.ADMIN_ORDERS.UpdateStatus(storeOrderId), 'PUT', statusData, token);
    return response;
  } catch (error) {
    console.error('Update order status API call error:', error);
    throw error;
  }
};

/**
 * Get admin transactions with pagination and filtering
 */
export const getAdminTransactions = async (page: number = 1, status?: string, type?: string) => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  try {
    let url = `${API_ENDPOINTS.ADMIN_TRANSACTIONS.List}?page=${page}`;
    if (status && status !== 'all') {
      url += `&status=${status}`;
    }
    if (type && type !== 'all') {
      url += `&type=${type}`;
    }
    const response = await apiCall(url, 'GET', undefined, token);
    return response;
  } catch (error) {
    console.error('Admin transactions API call error:', error);
    throw error;
  }
};

/**
 * Get admin transaction details
 */
export const getAdminTransactionDetails = async (transactionId: number | string) => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  try {
    const response = await apiCall(API_ENDPOINTS.ADMIN_TRANSACTIONS.Details(transactionId), 'GET', undefined, token);
    return response;
  } catch (error) {
    console.error('Admin transaction details API call error:', error);
    throw error;
  }
};

/**
 * Get admin subscriptions with pagination and filtering
 */
export const getAdminSubscriptions = async (page: number = 1, status?: string) => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  try {
    let url = `${API_ENDPOINTS.ADMIN_SUBSCRIPTIONS.List}?page=${page}`;
    if (status && status !== 'all') {
      url += `&status=${status}`;
    }
    const response = await apiCall(url, 'GET', undefined, token);
    return response;
  } catch (error) {
    console.error('Admin subscriptions API call error:', error);
    throw error;
  }
};

/**
 * Get admin subscription plans
 */
export const getAdminSubscriptionPlans = async () => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  try {
    const response = await apiCall(API_ENDPOINTS.ADMIN_SUBSCRIPTIONS.Plans, 'GET', undefined, token);
    return response;
  } catch (error) {
    console.error('Admin subscription plans API call error:', error);
    throw error;
  }
};

/**
 * Create subscription plan
 */
export const createSubscriptionPlan = async (planData: any) => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  try {
    const response = await apiCall(API_ENDPOINTS.ADMIN_SUBSCRIPTIONS.CreatePlan, 'POST', planData, token);
    return response;
  } catch (error) {
    console.error('Create subscription plan API call error:', error);
    throw error;
  }
};

/**
 * Update subscription plan
 */
export const updateSubscriptionPlan = async (planId: number | string, planData: any) => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  try {
    const response = await apiCall(API_ENDPOINTS.ADMIN_SUBSCRIPTIONS.UpdatePlan(planId), 'PUT', planData, token);
    return response;
  } catch (error) {
    console.error('Update subscription plan API call error:', error);
    throw error;
  }
};

/**
 * Get admin promotions with pagination and filtering
 */
export const getAdminPromotions = async (page: number = 1, status?: string) => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  try {
    let url = `${API_ENDPOINTS.ADMIN_PROMOTIONS.List}?page=${page}`;
    if (status && status !== 'all') {
      url += `&status=${status}`;
    }
    const response = await apiCall(url, 'GET', undefined, token);
    return response;
  } catch (error) {
    console.error('Admin promotions API call error:', error);
    throw error;
  }
};

/**
 * Get admin promotion details
 */
export const getAdminPromotionDetails = async (promotionId: number | string) => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  try {
    const response = await apiCall(API_ENDPOINTS.ADMIN_PROMOTIONS.Details(promotionId), 'GET', undefined, token);
    return response;
  } catch (error) {
    console.error('Admin promotion details API call error:', error);
    throw error;
  }
};

/**
 * Update promotion status
 */
export const updatePromotionStatus = async (promotionId: number | string, statusData: any) => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  try {
    const response = await apiCall(API_ENDPOINTS.ADMIN_PROMOTIONS.UpdateStatus(promotionId), 'PUT', statusData, token);
    return response;
  } catch (error) {
    console.error('Update promotion status API call error:', error);
    throw error;
  }
};

/**
 * Extend promotion
 */
export const extendPromotion = async (promotionId: number | string, extendData: any) => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  try {
    const response = await apiCall(API_ENDPOINTS.ADMIN_PROMOTIONS.Extend(promotionId), 'POST', extendData, token);
    return response;
  } catch (error) {
    console.error('Extend promotion API call error:', error);
    throw error;
  }
};

/**
 * Get admin products with pagination and filtering
 */
export const getAdminProducts = async (page: number = 1, status?: string) => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  try {
    let url = `${API_ENDPOINTS.ADMIN_PRODUCTS.List}?page=${page}`;
    if (status && status !== 'All') {
      url += `&status=${status}`;
    }
    const response = await apiCall(url, 'GET', undefined, token);
    return response;
  } catch (error) {
    console.error('Admin products API call error:', error);
    throw error;
  }
};

/**
 * Get admin product details
 */
export const getAdminProductDetails = async (productId: number | string) => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  try {
    const response = await apiCall(API_ENDPOINTS.ADMIN_PRODUCTS.Details(productId), 'GET', undefined, token);
    return response;
  } catch (error) {
    console.error('Admin product details API call error:', error);
    throw error;
  }
};

/**
 * Get admin stores with pagination and filtering
 */
export const getAdminStores = async (page: number = 1, status?: string, level?: number | string) => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  try {
    let url = `${API_ENDPOINTS.ADMIN_STORES.List}?page=${page}`;
    if (status && status !== 'All') {
      url += `&status=${status}`;
    }
    if (level && level !== 'all') {
      url += `&level=${level}`;
    }
    const response = await apiCall(url, 'GET', undefined, token);
    return response;
  } catch (error) {
    console.error('Admin stores API call error:', error);
    throw error;
  }
};

/**
 * Get admin store details
 */
export const getAdminStoreDetails = async (storeId: number | string) => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  try {
    const response = await apiCall(API_ENDPOINTS.ADMIN_STORES.Details(storeId), 'GET', undefined, token);
    return response;
  } catch (error) {
    console.error('Admin store details API call error:', error);
    throw error;
  }
};

/**
 * Update store KYC status
 */
export const updateStoreStatus = async (storeId: number | string, status: string, notes?: string, sendNotification?: boolean) => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  try {
    const data = {
      status,
      notes,
      send_notification: sendNotification ?? true
    };
    const response = await apiCall(API_ENDPOINTS.ADMIN_STORES.UpdateStatus(storeId), 'PUT', data, token);
    return response;
  } catch (error) {
    console.error('Update store status API call error:', error);
    throw error;
  }
};

/**
 * Update store onboarding level
 */
export const updateStoreLevel = async (storeId: number | string, level: number, notes?: string) => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  try {
    const data = {
      onboarding_level: level,
      notes
    };
    const response = await apiCall(API_ENDPOINTS.ADMIN_STORES.UpdateLevel(storeId), 'PUT', data, token);
    return response;
  } catch (error) {
    console.error('Update store level API call error:', error);
    throw error;
  }
};

/**
 * Get admin social feed posts
 */
export const getAdminSocialFeed = async (page: number = 1) => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  try {
    const response = await apiCall(`${API_ENDPOINTS.ADMIN_SOCIAL_FEED.List}?page=${page}`, 'GET', undefined, token);
    return response;
  } catch (error) {
    console.error('Admin social feed API call error:', error);
    throw error;
  }
};

/**
 * Get admin social feed post details
 */
export const getAdminSocialFeedDetails = async (postId: number | string) => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  try {
    const response = await apiCall(API_ENDPOINTS.ADMIN_SOCIAL_FEED.Details(postId), 'GET', undefined, token);
    return response;
  } catch (error) {
    console.error('Admin social feed details API call error:', error);
    throw error;
  }
};

/**
 * Get admin social feed statistics
 */
export const getAdminSocialFeedStatistics = async () => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  try {
    const response = await apiCall(API_ENDPOINTS.ADMIN_SOCIAL_FEED.Statistics, 'GET', undefined, token);
    return response;
  } catch (error) {
    console.error('Admin social feed statistics API call error:', error);
    throw error;
  }
};

/**
 * Get all users list with pagination
 */
export const getAllUsers = async (page: number = 1, search?: string) => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  try {
    let url = `${API_ENDPOINTS.ALL_USERS.List}?page=${page}`;
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }
    const response = await apiCall(url, 'GET', undefined, token);
    return response;
  } catch (error) {
    console.error('All users API call error:', error);
    throw error;
  }
};

/**
 * Get all users statistics
 */
export const getAllUsersStats = async () => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  try {
    const response = await apiCall(API_ENDPOINTS.ALL_USERS.Stats, 'GET', undefined, token);
    return response;
  } catch (error) {
    console.error('All users stats API call error:', error);
    throw error;
  }
};

/**
 * Get user details by ID
 */
export const getUserDetails = async (userId: number | string) => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  try {
    const response = await apiCall(API_ENDPOINTS.ALL_USERS.Details(userId), 'GET', undefined, token);
    return response;
  } catch (error) {
    console.error('User details API call error:', error);
    throw error;
  }
};
