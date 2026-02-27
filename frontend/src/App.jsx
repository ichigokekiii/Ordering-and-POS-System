import { useState } from "react";
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";

import Navbar from "./components/Navbar";
import AdminSidebar from "./components/AdminSidebar";
import Footer from "./components/Footer";

// USER PAGES
import LandingPage from "./pages/users/LandingPage";
import ProductPage from "./pages/users/ProductPage";
import Feedback from "./pages/users/Feedback";
import LoginPage from "./pages/users/LoginPage";
import RegisterPage from "./pages/users/RegisterPage";
import AboutPage from "./pages/users/AboutPage";
import SchedulePage from "./pages/users/SchedulePage";
import OrderPage from "./pages/users/OrderPage";
import OrderCustom from "./pages/users/OrderCustom";
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
import AdminPremadePage from "./pages/admin/AdminPremadePage";

// STAFF PAGE
import StaffPage from "./pages/staff/StaffPage";

function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));

  const navigate = useNavigate();
  const location = useLocation();

  // temporary role router
  const isAdminRoute =
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/staff");

  const handleLogin = (userData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);

    if (userData.role === "admin") {
      navigate("/admin");
    } else if (userData.role === "staff") {
      navigate("/staff");
    } else {
      navigate("/");
    }
  };

  const handleRegister = (userData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    navigate("/");
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
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

        <Route path="/order" element={<OrderPage />} />
        <Route path="/ordercustom" element={<OrderCustom />} />
        <Route path="/orderpremade" element={<OrderPremade />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />

        <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />

        <Route
          path="/register"
          element={<RegisterPage onRegister={handleRegister} />}
        />

        {/* Admin Navbar */}
        {user?.role === "admin" ? (
          <>
            <Route
              path="/admin"
              element={
                <div className="flex min-h-screen">
                  <AdminSidebar onLogout={handleLogout} />
                  <div className="flex-1 p-6 bg-gray-50">
                    <AdminOverviewPage />
                  </div>
                </div>
              }
            />

            <Route
              path="/admin/analytics"
              element={
                <div className="flex min-h-screen">
                  <AdminSidebar onLogout={handleLogout} />
                  <div className="flex-1 p-6 bg-gray-50">
                    <AdminAnalyticsPage />
                  </div>
                </div>
              }
            />

            <Route
              path="/admin/products"
              element={
                <div className="flex min-h-screen">
                  <AdminSidebar onLogout={handleLogout} />
                  <div className="flex-1 p-6 bg-gray-50">
                    <AdminProductPage />
                  </div>
                </div>
              }
            />

            <Route
              path="/admin/premades"
              element={
                <div className="flex min-h-screen">
                  <AdminSidebar onLogout={handleLogout} />
                  <div className="flex-1 p-6 bg-gray-50">
                    <AdminPremadePage />
                  </div>
                </div>
              }
            />

            <Route
              path="/admin/orders"
              element={
                <div className="flex min-h-screen">
                  <AdminSidebar onLogout={handleLogout} />
                  <div className="flex-1 p-6 bg-gray-50">
                    <AdminOrdersPage />
                  </div>
                </div>
              }
            />

            <Route
              path="/admin/schedule"
              element={
                <div className="flex min-h-screen">
                  <AdminSidebar onLogout={handleLogout} />
                  <div className="flex-1 p-6 bg-gray-50">
                    <AdminSchedulePage />
                  </div>
                </div>
              }
            />

            <Route
              path="/admin/users"
              element={
                <div className="flex min-h-screen">
                  <AdminSidebar onLogout={handleLogout} />
                  <div className="flex-1 p-6 bg-gray-50">
                    <AdminUsersPage />
                  </div>
                </div>
              }
            />
          </>
        ) : (
          <>
            <Route path="/admin/*" element={<Navigate to="/" />} />
          </>
        )}

        {user?.role === "staff" ? (
          <Route
            path="/staff"
            element={<StaffPage user={user} onLogout={handleLogout} />}
          />
        ) : (
          <Route path="/staff" element={<Navigate to="/" />} />
        )}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      {/* User Footer */}
      {!isAdminRoute && <Footer />}
    </>
  );
}

export default App;
