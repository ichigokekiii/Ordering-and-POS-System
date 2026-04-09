import { useContext, useEffect, useRef } from "react";
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";

import { AuthContext } from "./contexts/AuthContext";

import Navbar from "./components/Navbar";
import AdminLayout from "./components/AdminLayout";
import Footer from "./components/Footer";
import OrderLayout from "./components/OrderLayout";
import AdminQuickActions from "./components/AdminQuickActions";
import { hasAdminDashboardAccess } from "./utils/adminAccess";

// USER PAGES
import LandingPage from "./pages/users/LandingPage";
import ProductPage from "./pages/users/ProductPage";
import Feedback from "./pages/users/Feedback";
import AuthPage from "./pages/users/AuthPage";
import ForgotPasswordPage from "./pages/users/ForgotPasswordPage";
import ResetPasswordPage from "./pages/users/Resetpasswordpage"
import VerifyOtpPage from "./pages/users/VerifyOtpPage";
import ProfilePage from "./pages/users/ProfilePage";
import AboutPage from "./pages/users/AboutPage";
import SchedulePage from "./pages/users/SchedulePage";
import OrderPage from "./pages/users/OrderPage";
import OrderCustom from "./pages/users/OrderCustom";
import OrderCustomAdditional from "./pages/users/OrderCustomAdditional";
import OrderPremade from "./pages/users/OrderPremade";
import CartPage from "./pages/users/CartPage";
import CheckoutPage from "./pages/users/CheckoutPage";

// ADMIN PAGES
import AdminOverviewPage from "./pages/admin/AdminOverviewPage";
import AdminAnalyticsPage from "./pages/admin/AdminAnalyticsPage";
import AdminProductPage from "./pages/admin/AdminProductPage";
import AdminOrdersPage from "./pages/admin/AdminOrdersPage";
import AdminSchedulePage from "./pages/admin/AdminSchedulePage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminContentPage from "./pages/admin/AdminContentPage";
import AdminLogsPage from "./pages/admin/AdminLogsPage";
import AdminFeedbacksPage from "./pages/admin/AdminFeedbacksPage";

import StaffCustomPage from "./pages/staff/StaffCustomPage";
import StaffPremadePage from "./pages/staff/StaffPremadePage";

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const didHandleInitialRoleRedirect = useRef(false);

  const { user, handleLogin, handleLogout, loading } = useContext(AuthContext);

  useEffect(() => {
    if (!user || didHandleInitialRoleRedirect.current) return;

    if ((user.role === "admin" || user.role === "owner") && location.pathname === "/") {
      navigate("/admin");
      didHandleInitialRoleRedirect.current = true;
      return;
    }

    if (user.role === "staff" && location.pathname === "/") {
      navigate("/admin");
      didHandleInitialRoleRedirect.current = true;
      return;
    }

    didHandleInitialRoleRedirect.current = true;
  }, [user, location.pathname, navigate]);

  // Prevent routes from evaluating before auth state is restored
  if (loading) {
    return null;
  }

  // temporary role router
  const isAdminRoute =
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/staff");

  // Helper variable to clean up the long condition
  const hasAdminAccess = hasAdminDashboardAccess(user);
  const canAccessPos = user && (user.role === "admin" || user.role === "owner" || user.role === "staff");

  const renderAdminPage = (page, allowAccess = hasAdminAccess) => {
    if (!user) return <Navigate to="/login" replace />;
    if (!allowAccess) return <Navigate to="/" />;

    return (
      <AdminLayout user={user} onLogout={handleLogout}>
        {page}
      </AdminLayout>
    );
  };

  return (
    <>
      {/* User Navbar */}
      {!isAdminRoute && <Navbar user={user} onLogout={handleLogout} />}

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/products" element={<ProductPage />} />
        <Route path="/schedule" element={<SchedulePage />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="/profile" element={<ProfilePage />} />

        <Route element={<OrderLayout />}>
          <Route path="/order" element={<OrderPage />} />
          <Route path="/ordercustom" element={<OrderCustom />} />
          <Route path="/order/custom/additional" element={<OrderCustomAdditional />} />
          <Route path="/orderpremade" element={<OrderPremade />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
        </Route>

        <Route path="/login" element={<AuthPage onLogin={handleLogin} initialView="login" />} />
        <Route path="/register" element={<AuthPage onLogin={handleLogin} initialView="register" />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/verify-otp" element={<VerifyOtpPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Admin Routes */}
        <>
          <Route
            path="/admin"
            element={renderAdminPage(<AdminOverviewPage user={user} />)}
          />

          <Route
            path="/admin/analytics"
            element={renderAdminPage(<AdminAnalyticsPage user={user} />)}
          />

          <Route
            path="/admin/products"
            element={renderAdminPage(<AdminProductPage user={user} />)}
          />

    <Route
      path="/admin/content"
      element={renderAdminPage(
        <AdminContentPage user={user} />,
        hasAdminAccess
      )}
    />

          <Route
            path="/admin/orders"
            element={renderAdminPage(<AdminOrdersPage user={user} />)}
          />

          <Route
            path="/admin/schedule"
            element={renderAdminPage(<AdminSchedulePage user={user} />)}
          />

          <Route
            path="/admin/users"
            element={renderAdminPage(<AdminUsersPage user={user} />)}
          />

          <Route
            path="/admin/logs"
            element={renderAdminPage(<AdminLogsPage />)}
          />

          <Route
  path="/admin/feedbacks"
  element={renderAdminPage(<AdminFeedbacksPage user={user} />)}
/>
        </>

        <Route
          path="/staff"
          element={
            !user ? <Navigate to="/login" replace /> : canAccessPos ? (
              <Navigate to="/staff/ordercustom" replace />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/staff/ordercustom"
          element={
            !user ? <Navigate to="/login" replace /> : canAccessPos ? (
              <StaffCustomPage />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/staff/orderpremade"
          element={
            !user ? <Navigate to="/login" replace /> : canAccessPos ? (
              <StaffPremadePage />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      {/* User Footer */}
      {!isAdminRoute && <Footer />}
      <AdminQuickActions user={user} />
    </>
  );
}

export default App;
