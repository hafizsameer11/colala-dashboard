import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Layout from "./layout/Layout";
import Dashboard from "./pages/dashboard/Dashboard";
import Customer_mgt from "./pages/buyers_Mgt/customer_mgt/customer_mgt";
import CustomerDetails from "./pages/buyers_Mgt/customer_mgt/customerDetails";
import StoreDetails from "./pages/sellers_Mgt/stores/storeDetails";
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
import Balance from "./pages/general/balance/balance";
import Chats from "./pages/general/chats/chats";
import Analytics from "./pages/general/analytics/analytics";
import LeaderBoard from "./pages/general/leaderBoard/leaderBoard";
import Support from "./pages/general/support/support";
import RatingsReviews from "./pages/general/ratingsReviews/ratingsReviews";
import ReferralMgt from "./pages/general/referralMgt/referralMgt";
import Notifications from "./pages/general/notifications/notifications";
import Settings from "./pages/general/settings/Settings";

function App() {
  const routes = [
    { path: "/", element: <Dashboard /> },
    { path: "/dashboard", element: <Dashboard /> },
    { path: "/customer-mgt", element: <Customer_mgt /> },
    { path: "/customer-details/:userId", element: <CustomerDetails /> },
    { path: "/store-details/:storeId", element: <StoreDetails /> },
    { path: "/orders-mgt-buyers", element: <OrdersMgtbuyers /> },
    { path: "/transactions-buyers", element: <Transactionsbuyers /> },
    { path: "/stores-mgt", element: <Stores_mgt /> },
    { path: "/orders-mgt-sellers", element: <OrdersMgtsellers /> },
    { path: "/transactions-sellers", element: <Transactionssellers /> },
    { path: "/products-services", element: <Products_Services /> },
    { path: "/store-kyc", element: <StoreKYC /> },
    { path: "/subscriptions", element: <Subscription /> },
    { path: "/promotions", element: <Promotions /> },
    { path: "/social-feed", element: <SocialFeed /> },
    { path: "/all-users", element: <AllUsers /> },
    { path: "/balance", element: <Balance /> },
    { path: "/chats", element: <Chats /> },
    { path: "/analytics", element: <Analytics /> },
    { path: "/leaderboard", element: <LeaderBoard /> },
    { path: "/support", element: <Support /> },
    { path: "/ratings-reviews", element: <RatingsReviews /> },
    { path: "/referral-mgt", element: <ReferralMgt /> },
    { path: "/notifications", element: <Notifications /> },
    { path: "/settings", element: <Settings /> },
  ];
  return (
    <Router>
      <Routes>
        {/* Layout Wraps All Routes */}
        <Route path="/" element={<Layout />}>
          {routes.map(({ path, element }) => (
            <Route key={path} path={path} element={element} />
          ))}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
