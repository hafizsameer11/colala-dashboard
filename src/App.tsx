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

// Component to handle initial route based on auth status
const InitialRoute = () => {
  const { isAuthenticated, loading } = useAuth();

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

  return isAuthenticated ? (
    <Navigate to="/dashboard" replace />
  ) : (
    <Navigate to="/login" replace />
  );
};

function App() {
  const protectedRoutes = [
    { path: "dashboard", element: <Dashboard /> },
    { path: "customer-mgt", element: <Customer_mgt /> },
    { path: "customer-details/:userId", element: <CustomerDetails /> },
    { path: "store-details/:storeId", element: <StoreDetails /> },
    { path: "orders-mgt-buyers", element: <OrdersMgtbuyers /> },
    { path: "transactions-buyers", element: <Transactionsbuyers /> },
    { path: "stores-mgt", element: <Stores_mgt /> },
    { path: "orders-mgt-sellers", element: <OrdersMgtsellers /> },
    { path: "transactions-sellers", element: <Transactionssellers /> },
    { path: "products-services", element: <Products_Services /> },
    { path: "store-kyc", element: <StoreKYC /> },
    { path: "subscriptions", element: <Subscription /> },
    { path: "promotions", element: <Promotions /> },
    { path: "social-feed", element: <SocialFeed /> },
    { path: "all-users", element: <AllUsers /> },
    { path: "all-users/:userId", element: <UserDetailsPage /> },
    { path: "balance", element: <Balance /> },
    { path: "chats", element: <Chats /> },
    { path: "analytics", element: <Analytics /> },
    { path: "leaderboard", element: <LeaderBoard /> },
    { path: "support", element: <Support /> },
    { path: "disputes", element: <Disputes /> },
    { path: "ratings-reviews", element: <RatingsReviews /> },
    { path: "referral-mgt", element: <ReferralMgt /> },
    { path: "notifications", element: <Notifications /> },
    { path: "settings", element: <Settings /> },
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
              {protectedRoutes.map(({ path, element }) => (
                <Route key={path} path={path} element={element} />
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
