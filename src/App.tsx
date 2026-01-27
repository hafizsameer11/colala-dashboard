import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "./App.css";
import Layout from "./layout/Layout";
import Dashboard from "./pages/dashboard/Dashboard";
import Customer_mgt from "./pages/buyers_Mgt/customer_mgt/customer_mgt";
import CustomerDetails from "./pages/buyers_Mgt/customer_mgt/customerDetails/customerDetails";
import StoreDetails from "./pages/sellers_Mgt/stores/storeDetails/storeDetails";
import OrdersMgtbuyers from "./pages/buyers_Mgt/ordersMgt/ordersMgt";
import Transactionsbuyers from "./pages/buyers_Mgt/Transactions/Transactions";
import Stores_mgt from "./pages/sellers_Mgt/stores/stores_mgt";
import OrdersMgtsellers from "./pages/sellers_Mgt/orders/orders_Mgt";
import Transactionssellers from "./pages/sellers_Mgt/Transactions/transactions";
import Products_Services from "./pages/sellers_Mgt/Products_services/products_sevices";
import StoreKYC from "./pages/sellers_Mgt/store_KYC/storeKYC";
import Subscription from "./pages/sellers_Mgt/subscription/subscription";
import Promotions from "./pages/sellers_Mgt/promotions/promotions";
import SocialFeed from "./pages/sellers_Mgt/socialFeed/socialFeed";
import AllUsers from "./pages/general/allUsers/allUsers";
import UserDetailsPage from "./pages/general/allUsers/userDetailsPage";
import Balance from "./pages/general/balance/balance";
import Chats from "./pages/general/chats/chats";
import Analytics from "./pages/general/analytics/analytics";
import LeaderBoard from "./pages/general/leaderBoard/leaderBoard";
import Support from "./pages/general/support/support";
import RatingsReviews from "./pages/general/ratingsReviews/ratingsReviews";
import ReferralMgt from "./pages/general/referralMgt/referralMgt";
import Notifications from "./pages/general/notifications/notifications";
import Settings from "./pages/general/settings/Settings";
import Login from "./pages/auth/Login";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ToastProvider } from "./contexts/ToastContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Disputes from "./pages/general/disputes/disputes";
import { QueryProvider } from "./providers/QueryProvider";
import SellerHelpRequests from "./pages/general/sellerHelpRequests/sellerHelpRequests";
import WithdrawalRequests from "./pages/general/withdrawalRequests/withdrawalRequests";
import RoleManagement from "./pages/general/roleManagement/roleManagement";
import AccountOfficerVendors from "./pages/general/accountOfficerVendors/accountOfficerVendors";

// Component to handle initial route based on auth status
const InitialRoute = () => {
  const { isAuthenticated, loading, roles } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E53E3E] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    // Check if user is an account officer
    const roleSlugs = roles.map(r => r.slug);
    const isAccountOfficer = roleSlugs.includes('account_officer');
    
    // Redirect account officers to a different page (e.g., stores management or first available page)
    // For now, redirect to stores management as account officers likely manage stores
    if (isAccountOfficer) {
      return <Navigate to="/stores-mgt" replace />;
    }
    
    // Other users go to dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return <Navigate to="/login" replace />;
};

function App() {
  // Route permission mapping - each route requires a specific permission
  const protectedRoutes = [
    { path: "dashboard", element: <Dashboard />, permission: "dashboard.view" },
    { path: "customer-mgt", element: <Customer_mgt />, permission: "buyers.view" },
    { path: "customer-details/:userId", element: <CustomerDetails />, permission: "buyers.view_details" },
    { path: "store-details/:storeId", element: <StoreDetails />, permission: "sellers.view_details" },
    { path: "orders-mgt-buyers", element: <OrdersMgtbuyers />, permission: "buyer_orders.view" },
    { path: "transactions-buyers", element: <Transactionsbuyers />, permission: "buyer_transactions.view" },
    { path: "stores-mgt", element: <Stores_mgt />, permission: "sellers.view" },
    { path: "orders-mgt-sellers", element: <OrdersMgtsellers />, permission: "seller_orders.view" },
    { path: "transactions-sellers", element: <Transactionssellers />, permission: "seller_transactions.view" },
    { path: "products-services", element: <Products_Services />, permission: "products.view" },
    { path: "store-kyc", element: <StoreKYC />, permission: "kyc.view" },
    { path: "subscriptions", element: <Subscription />, permission: "subscriptions.view" },
    { path: "promotions", element: <Promotions />, permission: "promotions.view" },
    { path: "social-feed", element: <SocialFeed />, permission: "social_feed.view" },
    { path: "all-users", element: <AllUsers />, permission: "all_users.view" },
    { path: "all-users/:userId", element: <UserDetailsPage />, permission: "all_users.view_details" },
    { path: "balance", element: <Balance />, permission: "balance.view" },
    { path: "chats", element: <Chats />, permission: "chats.view" },
    { path: "analytics", element: <Analytics />, permission: "analytics.view" },
    { path: "leaderboard", element: <LeaderBoard />, permission: "leaderboard.view" },
    { path: "support", element: <Support />, permission: "support.view" },
    { path: "disputes", element: <Disputes />, permission: "disputes.view" },
    { path: "withdrawal-requests", element: <WithdrawalRequests />, permission: "withdrawals.view" },
    { path: "ratings-reviews", element: <RatingsReviews />, permission: "ratings.view" },
    { path: "referral-mgt", element: <ReferralMgt />, permission: "referrals.view" },
    { path: "notifications", element: <Notifications />, permission: "notifications.view" },
    { path: "seller-help-requests", element: <SellerHelpRequests />, permission: "seller_help.view" },
    { path: "role-management", element: <RoleManagement />, permission: "settings.admin_management" },
    { path: "settings", element: <Settings />, permission: "settings.view" },
    { path: "account-officer-vendors", element: <AccountOfficerVendors />, permission: "account_officer_vendors.view" },
  ];

  return (
    <QueryProvider>
      <AuthProvider>
        <ToastProvider>
          <Router>
            <Routes>
            {/* Root route - redirects based on auth status */}
            <Route path="/" element={<InitialRoute />} />

            {/* Login Route - Public */}
            <Route path="/login" element={<Login />} />

            {/* Protected Routes with Layout */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              {protectedRoutes.map(({ path, element, permission }) => (
                <Route 
                  key={path} 
                  path={path} 
                  element={
                    <ProtectedRoute permission={permission}>
                      {element}
                    </ProtectedRoute>
                  } 
                />
              ))}
            </Route>

            {/* Catch all route - redirect to root */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </Router>
        </ToastProvider>
      </AuthProvider>
    </QueryProvider>
  );
}

export default App;
