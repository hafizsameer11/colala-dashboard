# Role-Based Access Control (RBAC) - Modules Inventory

## Overview
This document provides a comprehensive list of all modules and pages in the Colala Admin Dashboard that require role-based access control.

---

## Module Categories

### 1. Dashboard
- **Route**: `/dashboard`
- **Module Name**: Dashboard
- **Description**: Main analytics and overview dashboard
- **Permissions Required**:
  - `dashboard.view` - View dashboard statistics
  - `dashboard.export` - Export dashboard data

---

### 2. Buyers Management

#### 2.1 Customer Management
- **Route**: `/customer-mgt`
- **Module Name**: Customer Management
- **Description**: Manage all buyer/customer accounts
- **Sub-modules**:
  - Customer listing and search
  - Customer details view (`/customer-details/:userId`)
  - Customer activity tracking
  - Customer transactions
  - Customer orders
  - Customer chats
  - Customer social feed
- **Permissions Required**:
  - `buyers.view` - View customer list
  - `buyers.view_details` - View customer details
  - `buyers.edit` - Edit customer information
  - `buyers.delete` - Delete/deactivate customers
  - `buyers.export` - Export customer data

#### 2.2 Orders Management (Buyers)
- **Route**: `/orders-mgt-buyers`
- **Module Name**: Buyer Orders Management
- **Description**: Manage all orders placed by buyers
- **Permissions Required**:
  - `buyer_orders.view` - View buyer orders
  - `buyer_orders.view_details` - View order details
  - `buyer_orders.update_status` - Update order status
  - `buyer_orders.cancel` - Cancel orders
  - `buyer_orders.refund` - Process refunds
  - `buyer_orders.export` - Export order data

#### 2.3 Transactions (Buyers)
- **Route**: `/transactions-buyers`
- **Module Name**: Buyer Transactions
- **Description**: View and manage all buyer financial transactions
- **Permissions Required**:
  - `buyer_transactions.view` - View transactions
  - `buyer_transactions.view_details` - View transaction details
  - `buyer_transactions.export` - Export transaction data
  - `buyer_transactions.refund` - Process refunds

---

### 3. Sellers Management

#### 3.1 Stores Management
- **Route**: `/stores-mgt`
- **Module Name**: Stores Management
- **Description**: Manage all seller stores/shops
- **Sub-modules**:
  - Store listing and search
  - Store details view (`/store-details/:storeId`)
  - Store products
  - Store orders
  - Store transactions
  - Store analytics
- **Permissions Required**:
  - `sellers.view` - View stores list
  - `sellers.view_details` - View store details
  - `sellers.edit` - Edit store information
  - `sellers.suspend` - Suspend stores
  - `sellers.activate` - Activate stores
  - `sellers.delete` - Delete stores
  - `sellers.export` - Export store data

#### 3.2 Orders Management (Sellers)
- **Route**: `/orders-mgt-sellers`
- **Module Name**: Seller Orders Management
- **Description**: Manage all orders for sellers
- **Permissions Required**:
  - `seller_orders.view` - View seller orders
  - `seller_orders.view_details` - View order details
  - `seller_orders.update_status` - Update order status
  - `seller_orders.export` - Export order data

#### 3.3 Transactions (Sellers)
- **Route**: `/transactions-sellers`
- **Module Name**: Seller Transactions
- **Description**: View and manage all seller financial transactions
- **Permissions Required**:
  - `seller_transactions.view` - View transactions
  - `seller_transactions.view_details` - View transaction details
  - `seller_transactions.approve_payout` - Approve payouts
  - `seller_transactions.reject_payout` - Reject payouts
  - `seller_transactions.export` - Export transaction data

#### 3.4 Products/Services Management
- **Route**: `/products-services`
- **Module Name**: Products & Services Management
- **Description**: Manage all products and services listed by sellers
- **Permissions Required**:
  - `products.view` - View products/services
  - `products.view_details` - View product details
  - `products.edit` - Edit products
  - `products.approve` - Approve products
  - `products.reject` - Reject products
  - `products.delete` - Delete products
  - `products.boost` - Boost product visibility
  - `products.export` - Export product data

#### 3.5 Store KYC
- **Route**: `/store-kyc`
- **Module Name**: Store KYC Verification
- **Description**: Verify and manage seller KYC documents
- **Permissions Required**:
  - `kyc.view` - View KYC requests
  - `kyc.view_details` - View KYC details
  - `kyc.approve` - Approve KYC
  - `kyc.reject` - Reject KYC
  - `kyc.request_changes` - Request KYC changes

#### 3.6 Subscriptions
- **Route**: `/subscriptions`
- **Module Name**: Subscription Management
- **Description**: Manage seller subscription plans
- **Permissions Required**:
  - `subscriptions.view` - View subscriptions
  - `subscriptions.view_details` - View subscription details
  - `subscriptions.create_plan` - Create subscription plans
  - `subscriptions.edit_plan` - Edit subscription plans
  - `subscriptions.delete_plan` - Delete subscription plans
  - `subscriptions.manage` - Manage user subscriptions

#### 3.7 Promotions
- **Route**: `/promotions`
- **Module Name**: Promotions Management
- **Description**: Manage seller promotions, coupons, and discounts
- **Permissions Required**:
  - `promotions.view` - View promotions
  - `promotions.view_details` - View promotion details
  - `promotions.create` - Create promotions
  - `promotions.edit` - Edit promotions
  - `promotions.approve` - Approve promotions
  - `promotions.reject` - Reject promotions
  - `promotions.delete` - Delete promotions

#### 3.8 Social Feed
- **Route**: `/social-feed`
- **Module Name**: Social Feed Management
- **Description**: Manage seller social media posts and announcements
- **Permissions Required**:
  - `social_feed.view` - View social feed
  - `social_feed.view_details` - View post details
  - `social_feed.approve` - Approve posts
  - `social_feed.reject` - Reject posts
  - `social_feed.delete` - Delete posts
  - `social_feed.pin` - Pin posts

---

### 4. General Management

#### 4.1 All Users
- **Route**: `/all-users`
- **Module Name**: All Users Management
- **Description**: Unified view of all users (buyers, sellers, admins)
- **Sub-modules**:
  - User listing
  - User details (`/all-users/:userId`)
- **Permissions Required**:
  - `all_users.view` - View all users
  - `all_users.view_details` - View user details
  - `all_users.edit` - Edit user information
  - `all_users.delete` - Delete users
  - `all_users.export` - Export user data

#### 4.2 Balance Management
- **Route**: `/balance`
- **Module Name**: Balance Management
- **Description**: View and manage user wallet balances
- **Permissions Required**:
  - `balance.view` - View balances
  - `balance.view_details` - View balance details
  - `balance.adjust` - Adjust user balances
  - `balance.export` - Export balance data

#### 4.3 Chats
- **Route**: `/chats`
- **Module Name**: Chat Management
- **Description**: Monitor and manage user chats
- **Permissions Required**:
  - `chats.view` - View chats
  - `chats.view_details` - View chat details
  - `chats.delete` - Delete chats
  - `chats.export` - Export chat data

#### 4.4 Analytics
- **Route**: `/analytics`
- **Module Name**: Analytics Dashboard
- **Description**: Advanced analytics and reporting
- **Permissions Required**:
  - `analytics.view` - View analytics
  - `analytics.export` - Export analytics data
  - `analytics.custom_reports` - Create custom reports

#### 4.5 Leaderboard
- **Route**: `/leaderboard`
- **Module Name**: Leaderboard Management
- **Description**: View and manage user leaderboards
- **Permissions Required**:
  - `leaderboard.view` - View leaderboard
  - `leaderboard.export` - Export leaderboard data

#### 4.6 Support
- **Route**: `/support`
- **Module Name**: Support Ticket Management
- **Description**: Manage customer support tickets
- **Permissions Required**:
  - `support.view` - View support tickets
  - `support.view_details` - View ticket details
  - `support.assign` - Assign tickets
  - `support.resolve` - Resolve tickets
  - `support.close` - Close tickets
  - `support.export` - Export ticket data

#### 4.7 Disputes
- **Route**: `/disputes`
- **Module Name**: Dispute Management
- **Description**: Manage order and transaction disputes
- **Permissions Required**:
  - `disputes.view` - View disputes
  - `disputes.view_details` - View dispute details
  - `disputes.resolve` - Resolve disputes
  - `disputes.escalate` - Escalate disputes
  - `disputes.export` - Export dispute data

#### 4.8 Withdrawal Requests
- **Route**: `/withdrawal-requests`
- **Module Name**: Withdrawal Request Management
- **Description**: Approve or reject withdrawal requests
- **Permissions Required**:
  - `withdrawals.view` - View withdrawal requests
  - `withdrawals.view_details` - View withdrawal details
  - `withdrawals.approve` - Approve withdrawals
  - `withdrawals.reject` - Reject withdrawals
  - `withdrawals.export` - Export withdrawal data

#### 4.9 Ratings & Reviews
- **Route**: `/ratings-reviews`
- **Module Name**: Ratings & Reviews Management
- **Description**: Manage product and store ratings/reviews
- **Permissions Required**:
  - `ratings.view` - View ratings/reviews
  - `ratings.view_details` - View review details
  - `ratings.approve` - Approve reviews
  - `ratings.reject` - Reject reviews
  - `ratings.delete` - Delete reviews
  - `ratings.export` - Export review data

#### 4.10 Referral Management
- **Route**: `/referral-mgt`
- **Module Name**: Referral Program Management
- **Description**: Manage referral program settings and tracking
- **Permissions Required**:
  - `referrals.view` - View referral data
  - `referrals.view_details` - View referral details
  - `referrals.settings` - Manage referral settings
  - `referrals.export` - Export referral data

#### 4.11 Notifications
- **Route**: `/notifications`
- **Module Name**: Notification Management
- **Description**: Create and manage system notifications
- **Permissions Required**:
  - `notifications.view` - View notifications
  - `notifications.create` - Create notifications
  - `notifications.edit` - Edit notifications
  - `notifications.delete` - Delete notifications
  - `notifications.send` - Send notifications

#### 4.12 Seller Help Requests
- **Route**: `/seller-help-requests`
- **Module Name**: Seller Help Requests
- **Description**: Manage help requests from sellers
- **Permissions Required**:
  - `seller_help.view` - View help requests
  - `seller_help.view_details` - View request details
  - `seller_help.resolve` - Resolve help requests
  - `seller_help.export` - Export request data

#### 4.13 Settings
- **Route**: `/settings`
- **Module Name**: System Settings
- **Description**: System configuration and admin management
- **Sub-modules**:
  - Admin Management
  - FAQ Management
  - Categories Management
  - Service Categories
  - Brands Management
  - Knowledge Base
  - Terms & Conditions
- **Permissions Required**:
  - `settings.view` - View settings
  - `settings.admin_management` - Manage admins
  - `settings.create_admin` - Create admin users
  - `settings.edit_admin` - Edit admin users
  - `settings.delete_admin` - Delete admin users
  - `settings.faq_management` - Manage FAQs
  - `settings.categories_management` - Manage categories
  - `settings.brands_management` - Manage brands
  - `settings.knowledge_base` - Manage knowledge base
  - `settings.terms_management` - Manage terms & conditions
  - `settings.system_config` - Manage system configuration

#### 4.14 Account Officer Vendors
- **Route**: `/account-officer-vendors`
- **Module Name**: Account Officer Vendors
- **Description**: Manage vendors assigned to Account Officers
- **Sub-modules**:
  - Account Officer listing (Super Admin view)
  - Assigned vendors dashboard (Account Officer view)
  - Vendor assignment management
- **Permissions Required**:
  - `account_officer_vendors.view` - View Account Officer Vendors page
  - `account_officer_vendors.view_details` - View assigned vendor details
  - `sellers.assign_account_officer` - Assign account officer to store (Super Admin only)

---

## Permission Structure

### Permission Format
Permissions follow the pattern: `{module}.{action}`

### Actions
- `view` - View/list items
- `view_details` - View detailed information
- `create` - Create new items
- `edit` - Edit existing items
- `delete` - Delete items
- `approve` - Approve items
- `reject` - Reject items
- `export` - Export data
- `manage` - Full management access

---

## Role Hierarchy (Suggested)

### 1. Super Admin
- **Description**: Full system access
- **Permissions**: All permissions (`*.*`)

### 2. Admin
- **Description**: Full operational access except system settings
- **Permissions**: All permissions except:
  - `settings.admin_management`
  - `settings.create_admin`
  - `settings.delete_admin`
  - `settings.system_config`

### 3. Moderator
- **Description**: Content moderation and support
- **Key Permissions**:
  - View permissions for most modules
  - Approve/reject permissions for:
    - Products
    - KYC
    - Promotions
    - Social Feed
    - Ratings/Reviews
  - Support and dispute management
  - Chat monitoring

### 4. Support Agent
- **Description**: Customer support focused
- **Key Permissions**:
  - `support.*`
  - `chats.view`
  - `chats.view_details`
  - `disputes.view`
  - `disputes.view_details`
  - Limited view access to orders and transactions

### 5. Financial Manager
- **Description**: Financial operations
- **Key Permissions**:
  - `buyer_transactions.*`
  - `seller_transactions.*`
  - `withdrawals.*`
  - `balance.*`
  - `analytics.view`
  - `analytics.export`

### 6. Content Manager
- **Description**: Content and product management
- **Key Permissions**:
  - `products.*`
  - `promotions.*`
  - `social_feed.*`
  - `ratings.*`
  - `categories.*`
  - `brands.*`

---

## Module Count Summary

- **Total Modules**: 25 main modules
- **Total Sub-modules**: 15+ sub-modules
- **Total Routes**: 30+ routes
- **Total Permissions**: 100+ individual permissions

---

## Notes for Implementation

1. **Route Protection**: Each route should check for appropriate permissions before rendering
2. **UI Visibility**: Hide UI elements (buttons, links) based on permissions
3. **API Protection**: Backend must validate permissions for all API endpoints
4. **Audit Logging**: Log all permission-based actions for security
5. **Permission Inheritance**: Consider implementing permission groups for easier management

