# Colala Admin Dashboard - Frontend

A comprehensive React TypeScript dashboard for managing an e-commerce marketplace platform. This frontend application provides admin interfaces for managing buyers, sellers, products, orders, analytics, and more.

## 🎨 Design

**Figma Design**: [Colala Admin Dashboard](https://www.figma.com/design/EGmRGChTitTFO3Q5gyWnKN/Colala-Admin-Dashboard?node-id=31-15743&t=SzBA2TOz1qlJvqz1-0)

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn package manager

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd Colala-Dashboard

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Default Login Credentials

```
Email: admin@admin.com
Password: admin
```

## 🏗️ Tech Stack

- **Framework**: React 19.1.0 with TypeScript
- **Build Tool**: Vite 7.0.0
- **Routing**: React Router DOM 7.6.3
- **Styling**: Tailwind CSS 4.1.11
- **Charts**: Chart.js 4.5.0 + React-ChartJS-2 5.3.0
- **Authentication**: Context API with localStorage
- **Icons & Assets**: Custom SVG icons and images

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── addUserModel.tsx
│   ├── BulkActionDropdown.tsx
│   ├── chatsModel.tsx
│   ├── PageHeader.tsx
│   ├── ProtectedRoute.tsx
│   └── ...
├── constants/           # Static data and configurations
│   ├── Buyers.ts
│   ├── Sellers.ts
│   ├── images.ts
│   └── general.ts
├── contexts/           # React Context providers
│   └── AuthContext.tsx
├── hooks/              # Custom React hooks
│   └── useDebouncedValue.ts
├── layout/             # Layout components
│   ├── Layout.tsx
│   ├── Sidebar.tsx
│   └── components/
├── pages/              # Main application pages
│   ├── auth/           # Authentication pages
│   ├── buyers_Mgt/     # Buyer management
│   ├── sellers_Mgt/    # Seller management
│   ├── general/        # General admin features
│   └── dashboard/      # Main dashboard
└── App.tsx             # Main application component
```

## 🔐 Authentication System

The application uses a Context-based authentication system with the following features:

- **Protected Routes**: All dashboard routes require authentication
- **Persistent Login**: Uses localStorage to maintain auth state
- **Auto Redirect**: Unauthenticated users are redirected to login
- **Session Management**: Automatic logout and cleanup

### Current Implementation

```typescript
// Current login credentials (hardcoded)
const validCredentials = {
  email: "admin@admin.com",
  password: "admin",
};
```

## 🌐 API Integration Guide for Backend Developers

### Authentication Endpoints Needed

```typescript
// POST /api/auth/login
interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

// POST /api/auth/logout
interface LogoutRequest {
  token: string;
}

// GET /api/auth/verify
interface VerifyTokenRequest {
  token: string;
}
```

### Dashboard Analytics Endpoints

```typescript
// GET /api/dashboard/stats
interface DashboardStats {
  totalUsers: number;
  totalSellers: number;
  totalRevenue: number;
  totalOrders: number;
  growthRates: {
    users: number;
    sellers: number;
    revenue: number;
    orders: number;
  };
}

// GET /api/dashboard/analytics
interface AnalyticsData {
  chartData: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      backgroundColor: string;
      borderColor: string;
    }>;
  };
  filters: {
    dateRange: string;
    category: string;
  };
}
```

### User Management Endpoints

```typescript
// GET /api/users?page=1&limit=10&search=""&role=""
interface UsersResponse {
  users: User[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: "buyer" | "seller" | "admin";
  status: "active" | "inactive" | "suspended";
  dateJoined: string;
  lastLogin: string;
  location: string;
  totalSpent?: number; // for buyers
  totalEarnings?: number; // for sellers
}

// POST /api/users
// PUT /api/users/:id
// DELETE /api/users/:id
```

### Store Management Endpoints

```typescript
// GET /api/stores?page=1&limit=10&search=""&status=""
interface StoresResponse {
  stores: Store[];
  pagination: PaginationInfo;
}

interface Store {
  id: string;
  name: string;
  owner: {
    id: string;
    name: string;
    email: string;
  };
  status: "active" | "pending" | "suspended";
  category: string;
  location: string;
  dateCreated: string;
  totalProducts: number;
  totalSales: number;
  rating: number;
  kycStatus: "verified" | "pending" | "rejected";
}

// GET /api/stores/:id
// POST /api/stores/:id/verify
// POST /api/stores/:id/suspend
```

### Order Management Endpoints

```typescript
// GET /api/orders?page=1&limit=10&status=""&dateRange=""
interface OrdersResponse {
  orders: Order[];
  pagination: PaginationInfo;
}

interface Order {
  id: string;
  orderNumber: string;
  buyer: {
    id: string;
    name: string;
    email: string;
  };
  seller: {
    id: string;
    name: string;
    storeName: string;
  };
  products: OrderProduct[];
  totalAmount: number;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  orderDate: string;
  deliveryDate: string;
  shippingAddress: Address;
}

interface OrderProduct {
  id: string;
  name: string;
  image: string;
  quantity: number;
  price: number;
}
```

### Product Management Endpoints

```typescript
// GET /api/products?page=1&limit=10&search=""&category=""&storeId=""
interface ProductsResponse {
  products: Product[];
  pagination: PaginationInfo;
}

interface Product {
  id: string;
  name: string;
  description: string;
  images: string[];
  price: number;
  discountPrice?: number;
  category: string;
  subcategory: string;
  stock: number;
  status: "active" | "inactive" | "out_of_stock";
  seller: {
    id: string;
    name: string;
    storeName: string;
  };
  rating: number;
  reviewCount: number;
  dateAdded: string;
}
```

### Chat & Disputes Endpoints

```typescript
// GET /api/chats?page=1&limit=10&status=""
interface ChatsResponse {
  chats: Chat[];
  pagination: PaginationInfo;
}

interface Chat {
  id: string;
  participants: {
    buyer: User;
    seller: User;
  };
  lastMessage: {
    content: string;
    timestamp: string;
    sender: "buyer" | "seller";
  };
  status: "active" | "resolved" | "escalated";
  unreadCount: number;
}

// GET /api/disputes
interface DisputesResponse {
  disputes: Dispute[];
  pagination: PaginationInfo;
}

interface Dispute {
  id: string;
  orderId: string;
  chatId: string;
  storeName: string;
  userName: string;
  lastMessage: string;
  chatDate: string;
  status: "pending" | "resolved" | "escalated";
  wonBy: "buyer" | "seller" | "pending";
}
```

### Financial Management Endpoints

```typescript
// GET /api/financial/balance
interface BalanceInfo {
  totalBalance: number;
  availableBalance: number;
  pendingBalance: number;
  escrowBalance: number;
  pointsBalance: number;
}

// GET /api/financial/transactions?page=1&limit=10&type=""
interface TransactionsResponse {
  transactions: Transaction[];
  pagination: PaginationInfo;
}

interface Transaction {
  id: string;
  type: "deposit" | "withdrawal" | "payment" | "refund" | "commission";
  amount: number;
  status: "pending" | "completed" | "failed";
  description: string;
  date: string;
  relatedOrder?: string;
  user: {
    id: string;
    name: string;
    type: "buyer" | "seller";
  };
}
```

### Analytics & Reports Endpoints

```typescript
// GET /api/analytics/overview?period=7d|30d|90d|1y
interface AnalyticsOverview {
  period: string;
  metrics: {
    revenue: {
      current: number;
      previous: number;
      growth: number;
    };
    orders: {
      current: number;
      previous: number;
      growth: number;
    };
    users: {
      current: number;
      previous: number;
      growth: number;
    };
    sellers: {
      current: number;
      previous: number;
      growth: number;
    };
  };
  charts: {
    revenue: ChartData;
    orders: ChartData;
    users: ChartData;
  };
}

interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor: string;
    borderColor: string;
  }>;
}
```

### Settings & Configuration Endpoints

```typescript
// GET /api/settings/admin
interface AdminSettings {
  admins: AdminUser[];
  faqSections: FAQSection[];
  systemConfig: SystemConfig;
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  status: "active" | "inactive";
  dateJoined: string;
  lastLogin: string;
  permissions: string[];
}

interface FAQSection {
  id: string;
  type: string;
  users: "All" | "Buyers" | "Sellers";
  questions: FAQQuestion[];
}

interface FAQQuestion {
  id: string;
  question: string;
  answer: string;
}
```

## 📱 Current Frontend Features

### Authentication

- ✅ Login/Logout functionality
- ✅ Protected route system
- ✅ Persistent authentication state
- 🔄 **Needs Backend**: JWT token validation, user roles

### Dashboard

- ✅ Analytics overview with charts
- ✅ Key metrics display
- ✅ Responsive design
- 🔄 **Needs Backend**: Real-time data, customizable date ranges

### User Management

- ✅ Users table with search/filter
- ✅ User details view
- ✅ Add/edit user forms
- 🔄 **Needs Backend**: CRUD operations, pagination, user roles

### Store Management

- ✅ Stores listing and details
- ✅ Store KYC verification interface
- ✅ Store status management
- 🔄 **Needs Backend**: Store verification, document uploads

### Order Management

- ✅ Orders table with filters
- ✅ Order status tracking
- ✅ Order details view
- 🔄 **Needs Backend**: Real-time order updates, status changes

### Product Management

- ✅ Products listing with search
- ✅ Product details and reviews
- ✅ Category management
- 🔄 **Needs Backend**: Product CRUD, image uploads, inventory

### Financial Management

- ✅ Balance overview dashboard
- ✅ Transactions history
- ✅ Payment status tracking
- 🔄 **Needs Backend**: Payment processing, financial reports

### Communication

- ✅ Chat interface
- ✅ Disputes management
- ✅ Notifications system
- 🔄 **Needs Backend**: Real-time messaging, dispute resolution

### Analytics & Reports

- ✅ Interactive charts and graphs
- ✅ Filtering and date range selection
- ✅ Export functionality UI
- 🔄 **Needs Backend**: Data aggregation, report generation

## 🔧 Environment Configuration

Create a `.env` file in the root directory:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:8000/api
VITE_API_VERSION=v1

# Authentication
VITE_JWT_SECRET=your-jwt-secret
VITE_TOKEN_EXPIRY=24h

# File Upload
VITE_MAX_FILE_SIZE=5MB
VITE_ALLOWED_FILE_TYPES=jpg,jpeg,png,pdf

# Third-party Services
VITE_STRIPE_PUBLIC_KEY=pk_test_...
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name

# Development
VITE_DEBUG_MODE=true
VITE_LOG_LEVEL=debug
```

## 🔌 API Integration Points

### HTTP Client Setup

The frontend expects a REST API with the following characteristics:

```typescript
// Expected API response format
interface APIResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

// Error response format
interface APIError {
  success: false;
  message: string;
  errors: string[];
  code: number;
}
```

### Authentication Headers

```typescript
// Expected headers for authenticated requests
{
  'Authorization': 'Bearer <jwt-token>',
  'Content-Type': 'application/json',
  'X-API-Version': 'v1'
}
```

### File Upload Endpoints

```typescript
// POST /api/upload/images (multipart/form-data)
interface ImageUploadResponse {
  success: boolean;
  data: {
    url: string;
    filename: string;
    size: number;
  };
}

// POST /api/upload/documents (for KYC, etc.)
interface DocumentUploadResponse {
  success: boolean;
  data: {
    documentId: string;
    url: string;
    type: string;
    status: "pending" | "verified" | "rejected";
  };
}
```

## 📊 Database Schema Suggestions

Based on the frontend requirements, here are the suggested database tables:

### Core Tables

- `users` - User accounts (buyers, sellers, admins)
- `stores` - Seller stores/shops
- `products` - Product catalog
- `orders` - Order transactions
- `order_items` - Individual order line items
- `categories` - Product categories
- `reviews` - Product and store reviews
- `chats` - Chat conversations
- `chat_messages` - Individual chat messages
- `disputes` - Dispute cases
- `transactions` - Financial transactions
- `notifications` - User notifications
- `admin_settings` - System configuration
- `faqs` - FAQ management

### Relationships

- Users (1:many) → Stores
- Stores (1:many) → Products
- Users (1:many) → Orders
- Orders (1:many) → OrderItems
- Users (1:many) → Chats
- Chats (1:many) → ChatMessages
- Orders (1:1) → Disputes

## 🚦 Development Workflow

1. **Frontend Development**: Complete UI/UX implementation ✅
2. **API Design**: Define endpoints and data structures 🔄
3. **Backend Development**: Implement API endpoints
4. **Integration**: Connect frontend to backend APIs
5. **Testing**: End-to-end testing
6. **Deployment**: Production deployment

## 📝 Notes for Backend Developers

1. **Authentication**: Implement JWT-based authentication with role-based access control
2. **Real-time Features**: Consider WebSocket implementation for chats and notifications
3. **File Handling**: Set up file upload service (AWS S3, Cloudinary, etc.)
4. **Data Validation**: Implement server-side validation for all inputs
5. **Pagination**: Implement cursor or offset-based pagination
6. **Caching**: Consider Redis for frequently accessed data
7. **Rate Limiting**: Implement API rate limiting for security
8. **Logging**: Set up comprehensive API logging
9. **Error Handling**: Standardize error response formats
10. **Documentation**: Create API documentation (Swagger/OpenAPI)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is private and proprietary.

---

**Contact**: For backend integration questions, please contact the development team.
