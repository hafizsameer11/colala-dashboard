# Backend Endpoints Requiring Period Parameter Support

This document lists all API endpoints that need to support the `period` query parameter for time-based filtering.

## Period Parameter Values

The frontend sends these period values:
- `today` - Data from today
- `this_week` - Data from the last 7 days
- `this_month` - Data from the current month
- `last_month` - Data from the previous month (if needed)
- No parameter or `null` - All time data

## Endpoints Requiring Period Support

### 1. User Management Endpoints

#### ✅ Already Implemented
- `GET /api/admin/users/stats?period={period}` - User statistics
- `GET /api/admin/users?page={page}&period={period}` - Users list

#### 🔄 Needs Implementation
- `GET /api/admin/all-users?page={page}&period={period}` - All users list
- `GET /api/admin/all-users/analytics?period={period}` - All users statistics
- `GET /api/admin/all-users/{userId}/details?period={period}` - User details (includes activities)

### 2. Orders Management Endpoints

#### 🔄 Needs Implementation
- `GET /api/admin/buyer-orders?page={page}&status={status}&period={period}` - Buyer orders list
- `GET /api/admin/orders?page={page}&period={period}` - Admin orders list
- `GET /api/admin/orders/statistics?period={period}` - Orders statistics
- `GET /api/admin/users/{userId}/orders?page={page}&period={period}` - User orders (customer details)

### 3. Seller/Store Management Endpoints

#### 🔄 Needs Implementation
- `GET /api/admin/seller-users?page={page}&level={level}&search={search}&period={period}` - Seller users list
- `GET /api/admin/seller-users/stats?period={period}` - Seller users statistics
- `GET /api/admin/stores?page={page}&status={status}&level={level}&period={period}` - Stores list

### 4. Transactions Endpoints

#### 🔄 Needs Implementation
- `GET /api/admin/buyer-transactions?page={page}&period={period}` - Buyer transactions
- `GET /api/admin/buyer-transactions/analytics?period={period}` - Buyer transactions analytics
- `GET /api/admin/transactions?page={page}&status={status}&type={type}&period={period}` - Admin transactions
- `GET /api/admin/seller-details/{userId}/transactions?page={page}&period={period}` - Seller transactions
- `GET /api/admin/users/{userId}/transactions?page={page}&period={period}` - User transactions (customer details)
- `GET /api/admin/users/{userId}/notifications?page={page}&status={status}&period={period}` - User notifications (customer details)

### 5. Subscriptions Endpoints

#### 🔄 Needs Implementation
- `GET /api/admin/subscriptions?page={page}&status={status}&period={period}` - Subscriptions list

### 6. Promotions Endpoints

#### 🔄 Needs Implementation
- `GET /api/admin/promotions?page={page}&status={status}&period={period}` - Promotions list

### 7. Products & Services Endpoints

#### 🔄 Needs Implementation
- `GET /api/admin/products?page={page}&status={status}&period={period}` - Products list
- `GET /api/admin/services?page={page}&status={status}&period={period}` - Services list

### 8. Social Feed Endpoints

#### 🔄 Needs Implementation
- `GET /api/admin/social-feed?page={page}&period={period}` - Social feed posts
- `GET /api/admin/social-feed/statistics?period={period}` - Social feed statistics
- `GET /api/admin/seller-details/{userId}/social-feed?page={page}&period={period}` - Seller social feed

### 9. Chats Endpoints

#### 🔄 Needs Implementation
- `GET /api/admin/chats?page={page}&period={period}` - Chats list
- `GET /api/admin/chats/stats?period={period}` - Chats statistics
- `GET /api/admin/users/{userId}/chats?page={page}&period={period}` - User chats (customer details)

### 10. Support Tickets Endpoints

#### 🔄 Needs Implementation
- `GET /api/admin/support/tickets?page={page}&period={period}` - Support tickets
- `GET /api/admin/support/tickets/stats?period={period}` - Support tickets statistics

### 11. Withdrawal Requests Endpoints

#### 🔄 Needs Implementation
- `GET /api/admin/withdrawal-requests?page={page}&period={period}` - Withdrawal requests

### 12. Ratings & Reviews Endpoints

#### 🔄 Needs Implementation
- `GET /api/admin/ratings-reviews/products?page={page}&period={period}` - Product reviews
- `GET /api/admin/ratings-reviews/stores?page={page}&period={period}` - Store reviews
- `GET /api/admin/ratings-reviews/summary?period={period}` - Reviews summary

### 13. Notifications & Banners Endpoints

#### 🔄 Needs Implementation
- `GET /api/admin/notifications?page={page}&period={period}` - Notifications list
- `GET /api/admin/banners?page={page}&period={period}` - Banners list
- `GET /api/admin/banners/analytics?period={period}` - Banners analytics

### 14. Disputes Endpoints

#### 🔄 Needs Implementation
- `GET /api/admin/disputes?page={page}&period={period}` - Disputes list
- `GET /api/admin/disputes/statistics?period={period}` - Disputes statistics
- `GET /api/admin/disputes/analytics?period={period}` - Disputes analytics

### 15. Analytics & Dashboard Endpoints

#### 🔄 Needs Implementation
- `GET /api/admin/analytics/dashboard?period={period}` - Analytics dashboard
- `GET /api/admin/dashboard?period={period}` - Main dashboard
- `GET /api/admin/buyer-stats?period={period}` - Buyer stats
- `GET /api/admin/seller-stats?period={period}` - Seller stats
- `GET /api/admin/site-stats?period={period}` - Site stats

### 16. Balance Endpoints

#### 🔄 Needs Implementation
- `GET /api/admin/balances?page={page}&period={period}` - Balances list
- `GET /api/admin/balances/statistics?period={period}` - Balance statistics

### 17. Referrals Endpoints

#### 🔄 Needs Implementation
- `GET /api/admin/referrals?page={page}&period={period}` - Referrals list

### 18. Leaderboard Endpoints

#### 🔄 Needs Implementation
- `GET /api/admin/leaderboard?period={period}` - Leaderboard
- `GET /api/admin/leaderboard/top-revenue?period={period}` - Top revenue stores
- `GET /api/admin/leaderboard/top-orders?period={period}` - Top orders stores
- `GET /api/admin/leaderboard/analytics?period={period}` - Leaderboard analytics

## Implementation Notes

1. **Period Parameter Format**: The period should be passed as a query parameter: `?period=today`, `?period=this_week`, `?period=this_month`

2. **Default Behavior**: If no period parameter is provided, return all-time data (no filtering)

3. **Date Filtering Logic**:
   - `today`: Filter records where `created_at` or relevant date field is from today (00:00:00 to 23:59:59)
   - `this_week`: Filter records from the last 7 days
   - `this_month`: Filter records from the current calendar month
   - `last_month`: Filter records from the previous calendar month

4. **Statistics Endpoints**: Statistics endpoints should calculate metrics based on the filtered period (e.g., total count, percentage changes, etc.)

5. **Pagination**: Period filtering should be applied before pagination, so paginated results reflect the filtered dataset

6. **Consistency**: All list endpoints should support the same period values for consistency across the application

## Testing Checklist

For each endpoint:
- [ ] Test with `period=today`
- [ ] Test with `period=this_week`
- [ ] Test with `period=this_month`
- [ ] Test without period parameter (should return all data)
- [ ] Verify statistics match filtered data
- [ ] Verify pagination works correctly with period filter
- [ ] Test edge cases (empty results, boundary dates, etc.)
