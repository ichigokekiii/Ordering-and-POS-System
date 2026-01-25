import { useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";

import Navbar from "./components/Navbar";
import AdminSidebar from "./components/AdminSidebar";

import LandingPage from "./pages/LandingPage";
import ProductPage from "./pages/ProductPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AdminOverviewPage from "./pages/AdminOverviewPage";
import AdminProductPage from "./pages/AdminProductPage";

function App() {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user"))
  );

  const navigate = useNavigate();

  const handleLogin = (userData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);

    if (userData.role === "admin") {
      navigate("/admin");
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
      {/* user navbar */}
      {user?.role !== "admin" && (
        <Navbar user={user} onLogout={handleLogout} />
      )}

      <Routes>
        {/* user routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/products" element={<ProductPage />} />

        <Route
          path="/login"
          element={<LoginPage onLogin={handleLogin} />}
        />

        <Route
          path="/register"
          element={<RegisterPage onRegister={handleRegister} />}
        />

        {/* admin routes */}
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
          </>
        ) : (
          <>
            <Route path="/admin" element={<Navigate to="/" />} />
            <Route
              path="/admin/products"
              element={<Navigate to="/" />}
            />
          </>
        )}

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

export default App;
