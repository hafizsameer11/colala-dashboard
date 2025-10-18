// Colala API base URL
const API_DOMAIN = "https://colala.hmstech.xyz/api";

const API_ENDPOINTS = {
  AUTH: {
    // Authentication endpoints
    Login: API_DOMAIN + "/auth/login", // POST
  },

  // ADMIN DASHBOARD & OVERVIEW
  DASHBOARD: {
    Dashboard: API_DOMAIN + "/admin/dashboard", // GET
    BuyerStats: API_DOMAIN + "/admin/buyer-stats", // GET
    SellerStats: API_DOMAIN + "/admin/seller-stats", // GET
    SiteStats: API_DOMAIN + "/admin/site-stats", // GET
    LatestChats: API_DOMAIN + "/admin/latest-chats", // GET
    LatestOrders: API_DOMAIN + "/admin/latest-orders", // GET
  },

  // ALL USERS
  ALL_USERS: {
    List: API_DOMAIN + "/admin/all-users", // GET
    Stats: API_DOMAIN + "/admin/all-users/stats", // GET
    Search: API_DOMAIN + "/admin/all-users/search", // GET
    BulkAction: API_DOMAIN + "/admin/all-users/bulk-action", // POST
    Profile: (id: number | string) => `${API_DOMAIN}/admin/all-users/${id}/profile`, // GET
    Details: (id: number | string) => `${API_DOMAIN}/admin/all-users/${id}/details`, // GET
    Create: API_DOMAIN + "/admin/users", // POST
    Update: (id: number | string) => `${API_DOMAIN}/admin/all-users/${id}`, // PUT
    Delete: (id: number | string) => `${API_DOMAIN}/admin/all-users/${id}`, // DELETE
  },

  // CHATS
  CHATS: {
    List: API_DOMAIN + "/admin/chats", // GET
    Stats: API_DOMAIN + "/admin/chats/stats", // GET
    Search: API_DOMAIN + "/admin/chats/search", // GET
    BulkAction: API_DOMAIN + "/admin/chats/bulk-action", // POST
    Details: (id: number | string) => `${API_DOMAIN}/admin/chats/${id}/details`, // GET
    SendMessage: (id: number | string) => `${API_DOMAIN}/admin/chats/${id}/send`, // POST
    MarkAsRead: (id: number | string) => `${API_DOMAIN}/admin/chats/${id}/mark-read`, // POST
    MarkAsUnread: (id: number | string) => `${API_DOMAIN}/admin/chats/${id}/mark-unread`, // POST
    Close: (id: number | string) => `${API_DOMAIN}/admin/chats/${id}/close`, // POST
    Reopen: (id: number | string) => `${API_DOMAIN}/admin/chats/${id}/reopen`, // POST
  },

  // SUPPORT TICKETS
  SUPPORT: {
    List: API_DOMAIN + "/admin/support/tickets", // GET
    Stats: API_DOMAIN + "/admin/support/tickets/stats", // GET
    Search: API_DOMAIN + "/admin/support/tickets/search", // GET
    BulkAction: API_DOMAIN + "/admin/support/tickets/bulk-action", // POST
    Details: (id: number | string) => `${API_DOMAIN}/admin/support/tickets/${id}/details`, // GET
    Reply: (id: number | string) => `${API_DOMAIN}/admin/support/tickets/${id}/reply`, // POST
    UpdateStatus: (id: number | string) => `${API_DOMAIN}/admin/support/tickets/${id}/status`, // PUT
    Resolve: (id: number | string) => `${API_DOMAIN}/admin/support/tickets/${id}/resolve`, // PUT
    Close: (id: number | string) => `${API_DOMAIN}/admin/support/tickets/${id}/close`, // PUT
    Delete: (id: number | string) => `${API_DOMAIN}/admin/support/tickets/${id}`, // DELETE
  },

  // BUYER MANAGEMENT
  BUYER_USERS: {
    List: API_DOMAIN + "/admin/users", // GET
    Stats: API_DOMAIN + "/admin/users/stats", // GET
    Search: API_DOMAIN + "/admin/users/search", // GET
    BulkAction: API_DOMAIN + "/admin/users/bulk-action", // POST
    Profile: (id: number | string) => `${API_DOMAIN}/admin/users/${id}/profile`, // GET
    Create: API_DOMAIN + "/admin/users", // POST
    Update: (id: number | string) => `${API_DOMAIN}/admin/users/${id}`, // PUT
    Delete: (id: number | string) => `${API_DOMAIN}/admin/users/${id}`, // DELETE
    Orders: (id: number | string) => `${API_DOMAIN}/admin/users/${id}/orders`, // GET
    OrderDetails: (userId: number | string, orderId: number | string) => `${API_DOMAIN}/admin/users/${userId}/orders/${orderId}/details`, // GET
    UpdateOrderStatus: (userId: number | string, orderId: number | string) => `${API_DOMAIN}/admin/users/${userId}/orders/${orderId}/status`, // POST
    Chats: (id: number | string) => `${API_DOMAIN}/admin/users/${id}/chats`, // GET
    ChatFilter: (id: number | string) => `${API_DOMAIN}/admin/users/${id}/chats/filter`, // GET
    ChatBulkAction: (id: number | string) => `${API_DOMAIN}/admin/users/${id}/chats/bulk-action`, // POST
    ChatDetails: (userId: number | string, chatId: number | string) => `${API_DOMAIN}/admin/users/${userId}/chats/${chatId}/details`, // GET
    SendMessage: (userId: number | string, chatId: number | string) => `${API_DOMAIN}/admin/users/${userId}/chats/${chatId}/send`, // POST
    Transactions: (id: number | string) => `${API_DOMAIN}/admin/users/${id}/transactions`, // GET
    TransactionDetails: (userId: number | string, transactionId: number | string) => `${API_DOMAIN}/admin/users/${userId}/transactions/${transactionId}/details`, // GET
    TransactionBulkAction: (id: number | string) => `${API_DOMAIN}/admin/users/${id}/transactions/bulk-action`, // POST
    Posts: (id: number | string) => `${API_DOMAIN}/admin/users/${id}/posts`, // GET
  },

  // BUYER ORDERS
  BUYER_ORDERS: {
    List: API_DOMAIN + "/admin/buyer-orders", // GET
    Filter: API_DOMAIN + "/admin/orders/filter", // GET
    Details: (id: number | string) => `${API_DOMAIN}/admin/buyer-orders/${id}/details`, // GET
    UpdateStatus: (id: number | string) => `${API_DOMAIN}/admin/orders/${id}/status`, // PUT
    Tracking: (id: number | string) => `${API_DOMAIN}/admin/orders/${id}/tracking`, // GET
    BulkAction: API_DOMAIN + "/admin/orders/bulk-action", // POST
    Statistics: API_DOMAIN + "/admin/orders/statistics", // GET
  },

  // BUYER TRANSACTIONS
  BUYER_TRANSACTIONS: {
    List: API_DOMAIN + "/admin/buyer-transactions", // GET
    Filter: API_DOMAIN + "/admin/buyer-transactions/filter", // GET
    Details: (id: number | string) => `${API_DOMAIN}/admin/buyer-transactions/${id}/details`, // GET
    UpdateStatus: (id: number | string) => `${API_DOMAIN}/admin/buyer-transactions/${id}/status`, // PUT
    BulkAction: API_DOMAIN + "/admin/buyer-transactions/bulk-action", // POST
    Analytics: API_DOMAIN + "/admin/buyer-transactions/analytics", // GET
  },

  // SELLER MANAGEMENT
  SELLER_USERS: {
    List: API_DOMAIN + "/admin/seller-users", // GET
    Stats: API_DOMAIN + "/admin/seller-users/stats", // GET
    Search: API_DOMAIN + "/admin/seller-users/search", // GET
    BulkAction: API_DOMAIN + "/admin/seller-users/bulk-action", // POST
    Details: (id: number | string) => `${API_DOMAIN}/admin/seller-users/${id}/details`, // GET
    ToggleBlock: (id: number | string) => `${API_DOMAIN}/admin/seller-users/${id}/toggle-block`, // POST
    Remove: (id: number | string) => `${API_DOMAIN}/admin/seller-users/${id}/remove`, // DELETE
    Transactions: (id: number | string) => `${API_DOMAIN}/admin/seller-users/${id}/transactions`, // GET
  },

  // SELLER ORDERS
  SELLER_ORDERS: {
    Details: (userId: number | string, orderId: number | string) => `${API_DOMAIN}/admin/seller-orders/${userId}/${orderId}/details`, // GET
  },

  // SELLER CHATS
  SELLER_CHATS: {
    Details: (userId: number | string, chatId: number | string) => `${API_DOMAIN}/admin/seller-chats/${userId}/${chatId}/details`, // GET
  },

  // SELLER TRANSACTIONS
  SELLER_TRANSACTIONS: {
    List: (userId: number | string) => `${API_DOMAIN}/admin/seller-details/${userId}/transactions`, // GET
  },

  // SELLER PRODUCTS
  SELLER_PRODUCTS: {
    Create: API_DOMAIN + "/seller/products/create", // POST
    List: (userId: number | string) => `${API_DOMAIN}/admin/seller-products/${userId}`, // GET
    Details: (userId: number | string, productId: number | string) => `${API_DOMAIN}/admin/seller-products/${userId}/${productId}/details`, // GET
  },

  // SELLER SERVICES
  SELLER_SERVICES: {
    Create: API_DOMAIN + "/seller/service/create", // POST
    List: (userId: number | string) => `${API_DOMAIN}/admin/seller-services/${userId}`, // GET
    Details: (userId: number | string, serviceId: number | string) => `${API_DOMAIN}/admin/seller-services/${userId}/${serviceId}/details`, // GET
  },

  // SELLER ANNOUNCEMENTS
  SELLER_ANNOUNCEMENTS: {
    List: (userId: number | string) => `${API_DOMAIN}/admin/seller-announcements/${userId}`, // GET
    Create: (userId: number | string) => `${API_DOMAIN}/admin/seller-announcements/${userId}`, // POST
    Update: (userId: number | string, announcementId: number | string) => `${API_DOMAIN}/admin/seller-announcements/${userId}/${announcementId}`, // PUT
  },

  // SELLER BANNERS
  SELLER_BANNERS: {
    List: (userId: number | string) => `${API_DOMAIN}/admin/seller-banners/${userId}`, // GET
    Create: (userId: number | string) => `${API_DOMAIN}/admin/seller-banners/${userId}`, // POST
    Update: (userId: number | string, bannerId: number | string) => `${API_DOMAIN}/admin/seller-banners/${userId}/${bannerId}`, // PUT
    Delete: (userId: number | string, bannerId: number | string) => `${API_DOMAIN}/admin/seller-banners/${userId}/${bannerId}`, // DELETE
  },

  // SELLER COUPONS
  SELLER_COUPONS: {
    List: (userId: number | string) => `${API_DOMAIN}/admin/seller-coupons/${userId}`, // GET
    Create: (userId: number | string) => `${API_DOMAIN}/admin/seller-coupons/${userId}`, // POST
  },

  // SELLER LOYALTY
  SELLER_LOYALTY: {
    Settings: (userId: number | string) => `${API_DOMAIN}/admin/seller-loyalty-settings/${userId}`, // GET
    UpdateSettings: (userId: number | string) => `${API_DOMAIN}/admin/seller-loyalty-settings/${userId}`, // PUT
    Customers: (userId: number | string) => `${API_DOMAIN}/admin/seller-loyalty-customers/${userId}`, // GET
  },

  // ADMIN ORDERS
  ADMIN_ORDERS: {
    List: API_DOMAIN + "/admin/orders", // GET
    Details: (storeOrderId: number | string) => `${API_DOMAIN}/admin/orders/${storeOrderId}/details`, // GET
    UpdateStatus: (storeOrderId: number | string) => `${API_DOMAIN}/admin/orders/${storeOrderId}/status`, // PUT
  },

  // ADMIN TRANSACTIONS
  ADMIN_TRANSACTIONS: {
    List: API_DOMAIN + "/admin/transactions", // GET
    Details: (transactionId: number | string) => `${API_DOMAIN}/admin/transactions/${transactionId}/details`, // GET
  },

  // ADMIN SUBSCRIPTIONS
  ADMIN_SUBSCRIPTIONS: {
    List: API_DOMAIN + "/admin/subscriptions", // GET
    Plans: API_DOMAIN + "/admin/subscription-plans", // GET
    CreatePlan: API_DOMAIN + "/admin/subscription-plans", // POST
    UpdatePlan: (planId: number | string) => `${API_DOMAIN}/admin/subscription-plans/${planId}`, // PUT
  },

  // ADMIN PROMOTIONS
  ADMIN_PROMOTIONS: {
    List: API_DOMAIN + "/admin/promotions", // GET
    Details: (promotionId: number | string) => `${API_DOMAIN}/admin/promotions/${promotionId}/details`, // GET
    UpdateStatus: (promotionId: number | string) => `${API_DOMAIN}/admin/promotions/${promotionId}/status`, // PUT
    Extend: (promotionId: number | string) => `${API_DOMAIN}/admin/promotions/${promotionId}/extend`, // POST
  },

  // ADMIN PRODUCTS
  ADMIN_PRODUCTS: {
    List: API_DOMAIN + "/admin/products", // GET
    Create: API_DOMAIN + "/admin/products", // POST
    Details: (productId: number | string) => `${API_DOMAIN}/admin/products/${productId}/details`, // GET
  },

  // ADMIN SERVICES
  ADMIN_SERVICES: {
    List: API_DOMAIN + "/admin/services", // GET
    Create: API_DOMAIN + "/admin/services", // POST
    Details: (serviceId: number | string) => `${API_DOMAIN}/admin/services/${serviceId}/details`, // GET
  },

  // ADMIN STORES
  ADMIN_STORES: {
    List: API_DOMAIN + "/admin/stores", // GET
    Details: (storeId: number | string) => `${API_DOMAIN}/admin/stores/${storeId}/details`, // GET
    UpdateStatus: (storeId: number | string) => `${API_DOMAIN}/admin/stores/${storeId}/kyc-status`, // PUT
    UpdateLevel: (storeId: number | string) => `${API_DOMAIN}/admin/stores/${storeId}/level`, // PUT
  },


  // ADMIN SOCIAL FEED
  ADMIN_SOCIAL_FEED: {
    List: API_DOMAIN + "/admin/social-feed", // GET
    Details: (postId: number | string) => `${API_DOMAIN}/admin/social-feed/${postId}/details`, // GET
    Statistics: API_DOMAIN + "/admin/social-feed/statistics", // GET
  },

  // SELLER SOCIAL FEED
  SELLER_SOCIAL_FEED: {
    List: (userId: number | string) => `${API_DOMAIN}/admin/seller-details/${userId}/social-feed`, // GET
    Details: (userId: number | string, postId: number | string) => `${API_DOMAIN}/admin/seller-social-feed/${userId}/${postId}/details`, // GET
    Delete: (userId: number | string, postId: number | string) => `${API_DOMAIN}/admin/seller-social-feed/${userId}/${postId}`, // DELETE
  },

  // SELLER CREATION (3-Level Onboarding)
  SELLER_CREATION: {
    Level1Complete: API_DOMAIN + "/admin/create-seller/level1/complete", // POST
    Level2Complete: API_DOMAIN + "/admin/create-seller/level2/complete", // POST
    Level3Complete: API_DOMAIN + "/admin/create-seller/level3/complete", // POST
    Progress: API_DOMAIN + "/admin/create-seller/progress", // GET
    Categories: API_DOMAIN + "/admin/create-seller/categories", // GET
    SetApprovalStatus: API_DOMAIN + "/admin/create-seller/set-approval-status", // POST
  },

  // STORE DATA RETRIEVAL
  STORE_DATA: {
    Addresses: {
      List: API_DOMAIN + "/admin/create-seller/addresses", // GET
      Update: (id: number | string) => `${API_DOMAIN}/admin/create-seller/addresses/${id}`, // PUT
      Delete: (id: number | string) => `${API_DOMAIN}/admin/create-seller/addresses/${id}`, // DELETE
    },
    DeliveryPricing: {
      List: API_DOMAIN + "/admin/create-seller/delivery-pricing", // GET
      Update: (id: number | string) => `${API_DOMAIN}/admin/create-seller/delivery-pricing/${id}`, // PUT
      Delete: (id: number | string) => `${API_DOMAIN}/admin/create-seller/delivery-pricing/${id}`, // DELETE
    },
    TabsData: {
      SellerDetails: (id: number | string) => `${API_DOMAIN}/admin/seller-details/${id}`, // GET
      Orders: (id: number | string) => `${API_DOMAIN}/admin/seller-details/${id}/orders`, // GET
      Chats: (id: number | string) => `${API_DOMAIN}/admin/seller-details/${id}/chats`, // GET
      Transactions: (id: number | string) => `${API_DOMAIN}/admin/seller-details/${id}/transactions`, // GET
      SocialFeed: (id: number | string) => `${API_DOMAIN}/admin/seller-details/${id}/social-feed`, // GET
      Products: (id: number | string) => `${API_DOMAIN}/admin/seller-details/${id}/products`, // GET
      Announcements: (id: number | string) => `${API_DOMAIN}/admin/seller-details/${id}/announcements`, // GET
      Activities: (id: number | string) => `${API_DOMAIN}/admin/seller-details/${id}/activities`, // GET
      UpdateWallet: (id: number | string) => `${API_DOMAIN}/admin/seller-details/${id}/wallet`, // POST
      ToggleBlock: (id: number | string) => `${API_DOMAIN}/admin/seller-details/${id}/toggle-block`, // POST
      Delete: (id: number | string) => `${API_DOMAIN}/admin/seller-details/${id}`, // DELETE
    }
  },

  // CATEGORIES
  CATEGORIES: {
    List: API_DOMAIN + "/categories", // GET
    Create: API_DOMAIN + "/create-category", // POST
    CreateSubcategory: API_DOMAIN + "/create-category", // POST
    CreateSubcategoryCategory: API_DOMAIN + "/create-category", // POST
    Update: (id: number | string) => `${API_DOMAIN}/update-category/${id}`, // POST
  },

  // BRANDS
  BRANDS: {
    List: API_DOMAIN + "/brands", // GET
    Create: API_DOMAIN + "/brands", // POST
    Update: (id: number | string) => `${API_DOMAIN}/brands/${id}`, // PUT
    Delete: (id: number | string) => `${API_DOMAIN}/brands/${id}`, // DELETE
  },

  // BALANCE MANAGEMENT
  BALANCE: {
    List: API_DOMAIN + "/admin/balances", // GET
    Statistics: API_DOMAIN + "/admin/balances/statistics", // GET
  },

  // REFERRAL MANAGEMENT
  REFERRALS: {
    List: API_DOMAIN + "/admin/referrals", // GET
    Stats: API_DOMAIN + "/admin/referrals", // GET (includes statistics)
    Search: API_DOMAIN + "/admin/referrals/search", // GET
    BulkAction: API_DOMAIN + "/admin/referrals/bulk-action", // POST
    Details: (id: number | string) => `${API_DOMAIN}/admin/referrals/${id}/referred-users`, // GET
    ReferrerStats: (id: number | string) => `${API_DOMAIN}/admin/referrals/${id}/referred-users`, // GET
  },

  // NOTIFICATIONS & BANNERS
  NOTIFICATIONS: {
    List: API_DOMAIN + "/admin/notifications", // GET
    Create: API_DOMAIN + "/admin/notifications", // POST
    Details: (id: number | string) => `${API_DOMAIN}/admin/notifications/${id}`, // GET
    UpdateStatus: (id: number | string) => `${API_DOMAIN}/admin/notifications/${id}/status`, // PUT
    Delete: (id: number | string) => `${API_DOMAIN}/admin/notifications/${id}`, // DELETE
    AudienceData: API_DOMAIN + "/admin/notifications/audience/data", // GET
    AudienceUsers: API_DOMAIN + "/admin/notifications/audience/users", // GET
  },

  BANNERS: {
    List: API_DOMAIN + "/admin/banners", // GET
    Create: API_DOMAIN + "/admin/banners", // POST
    Details: (id: number | string) => `${API_DOMAIN}/admin/banners/${id}`, // GET
    Update: (id: number | string) => `${API_DOMAIN}/admin/banners/${id}`, // PUT
    Delete: (id: number | string) => `${API_DOMAIN}/admin/banners/${id}`, // DELETE
    Analytics: API_DOMAIN + "/admin/banners/analytics", // GET
    Active: API_DOMAIN + "/banners/active", // GET (public)
    TrackView: (id: number | string) => `${API_DOMAIN}/banners/${id}/view`, // POST
    TrackClick: (id: number | string) => `${API_DOMAIN}/banners/${id}/click`, // POST
  },
};

export { API_DOMAIN, API_ENDPOINTS };
