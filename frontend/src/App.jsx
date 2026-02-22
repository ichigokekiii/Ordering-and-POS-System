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

import LandingPage from "./pages/LandingPage";
import ProductPage from "./pages/ProductPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AboutPage from "./pages/AboutPage";
import SchedulePage from "./pages/SchedulePage";
import OrderPage from "./pages/OrderPage";
import OrderCustom from "./pages/OrderCustom";
import OrderPremade from "./pages/OrderPremade";

import OrderLayout from "./components/OrderLayout";
import CartPage from "./pages/CartPage";


import AdminOverviewPage from "./pages/AdminOverviewPage";
import AdminAnalyticsPage from "./pages/AdminAnalyticsPage";
import AdminProductPage from "./pages/AdminProductPage";
import AdminOrdersPage from "./pages/AdminOrdersPage";
import AdminSchedulePage from "./pages/AdminSchedulePage";
import AdminUsersPage from "./pages/AdminUsersPage";
import AdminPremadePage from "./pages/AdminPremadePage";

import StaffPage from "./pages/StaffPage";

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

        <Route element={<OrderLayout />}>
          <Route path="/order" element={<OrderPage />} />
          <Route path="/ordercustom" element={<OrderCustom />} />
          <Route path="/orderpremade" element={<OrderPremade />} />
          <Route path="/cart" element={<CartPage />} />
        </Route>

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
    </>
  );
}

export default App;
