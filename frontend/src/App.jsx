/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react-hooks/exhaustive-deps */
import { useContext, useEffect } from "react";
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";

import { AuthContext } from "./contexts/AuthContext";

import Navbar from "./components/Navbar";
import AdminSidebar from "./components/AdminSidebar";
import Footer from "./components/Footer";
import OrderLayout from "./components/OrderLayout";

// USER PAGES
import LandingPage from "./pages/users/LandingPage";
import ProductPage from "./pages/users/ProductPage";
import Feedback from "./pages/users/Feedback";
import LoginPage from "./pages/users/LoginPage";
import RegisterPage from "./pages/users/RegisterPage";
import ForgotPasswordPage from "./pages/users/ForgotPasswordPage";
import ResetPasswordPage from "./pages/users/ResetPasswordPage";
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



import StaffCustomPage from "./pages/staff/StaffCustomPage";
import StaffPremadePage from "./pages/staff/StaffPremadePage";

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const { user, handleLogin, handleLogout, loading } = useContext(AuthContext);

  useEffect(() => {
    if (!user) return;

    // If admin or owner refreshes on "/", redirect to /admin
    if (
      (user.role === "admin" || user.role === "owner") &&
      location.pathname === "/"
    ) {
      navigate("/admin");
    }

    // If staff refreshes on "/", redirect to /staff
    if (user.role === "staff" && location.pathname === "/") {
      navigate("/staff");
    }
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
  const hasAdminAccess = user && (user.role === "admin" || user.role === "owner" || user.role === "staff");

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

        <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-otp" element={<VerifyOtpPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Admin Routes */}
        <>
          <Route
            path="/admin"
            element={
              !user ? <Navigate to="/login" replace /> :
              hasAdminAccess ? (
                <div className="flex min-h-screen">
                  <AdminSidebar onLogout={handleLogout} />
                  <div className="flex-1 p-6 bg-gray-50">
                    <AdminOverviewPage user={user} />
                  </div>
                </div>
              ) : (
                <Navigate to="/" />
              )
            }
          />

          <Route
            path="/admin/analytics"
            element={
              !user ? <Navigate to="/login" replace /> :
              hasAdminAccess ? (
                <div className="flex min-h-screen">
                  <AdminSidebar onLogout={handleLogout} />
                  <div className="flex-1 p-6 bg-gray-50">
                    <AdminAnalyticsPage user={user} />
                  </div>
                </div>
              ) : (
                <Navigate to="/" />
              )
            }
          />

          <Route
            path="/admin/products"
            element={
              !user ? <Navigate to="/login" replace /> :
              hasAdminAccess ? (
                <div className="flex min-h-screen">
                  <AdminSidebar onLogout={handleLogout} />
                  <div className="flex-1 p-6 bg-gray-50">
                    <AdminProductPage user={user} />
                  </div>
                </div>
              ) : (
                <Navigate to="/" />
              )
            }
          />

    <Route
      path="/admin/content"
      element={
        !user ? <Navigate to="/login" replace /> :
        (user.role === "admin" || user.role === "owner") ? (
          <div className="flex min-h-screen">
            <AdminSidebar onLogout={handleLogout} />
            <div className="flex-1 p-6 bg-gray-50">
              <AdminContentPage />
            </div>
          </div>
        ) : (
          <Navigate to="/" />
        )
      }
    />

          <Route
            path="/admin/orders"
            element={
              !user ? <Navigate to="/login" replace /> :
              hasAdminAccess ? (
                <div className="flex min-h-screen">
                  <AdminSidebar onLogout={handleLogout} />
                  <div className="flex-1 p-6 bg-gray-50">
                    <AdminOrdersPage user={user} />
                  </div>
                </div>
              ) : (
                <Navigate to="/" />
              )
            }
          />

          <Route
            path="/admin/schedule"
            element={
              !user ? <Navigate to="/login" replace /> :
              hasAdminAccess ? (
                <div className="flex min-h-screen">
                  <AdminSidebar onLogout={handleLogout} />
                  <div className="flex-1 p-6 bg-gray-50">
                    <AdminSchedulePage user={user} />
                  </div>
                </div>
              ) : (
                <Navigate to="/" />
              )
            }
          />

          <Route
            path="/admin/users"
            element={
              !user ? <Navigate to="/login" replace /> :
              hasAdminAccess ? (
                <div className="flex min-h-screen">
                  <AdminSidebar onLogout={handleLogout} />
                  <div className="flex-1 p-6 bg-gray-50">
                    <AdminUsersPage user={user} />
                  </div>
                </div>
              ) : (
                <Navigate to="/" />
              )
            }
          />
        </>

        <Route
          path="/staff"
          element={
            !user ? <Navigate to="/login" replace /> : user.role === "staff" ? (
              <Navigate to="/staff/ordercustom" replace />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/staff/ordercustom"
          element={
            !user ? <Navigate to="/login" replace /> : user.role === "staff" ? (
              <StaffCustomPage />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/staff/orderpremade"
          element={
            !user ? <Navigate to="/login" replace /> : user.role === "staff" ? (
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
    </>
  );
}

export default App;
