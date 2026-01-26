import { useState } from "react";
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";

import { AnimatePresence } from "framer-motion";

import Navbar from "./components/Navbar";
import AdminSidebar from "./components/AdminSidebar";
import PageTransition from "./components/PageTransition";

import LandingPage from "./pages/LandingPage";
import ProductPage from "./pages/ProductPage";
import AboutPage from "./pages/AboutPage";
import SchedulePage from "./pages/SchedulePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AdminOverviewPage from "./pages/AdminOverviewPage";
import AdminProductPage from "./pages/AdminProductPage";

function App() {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user"))
  );

  const navigate = useNavigate();
  const location = useLocation();

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
      {/* User Navbar */}
      {user?.role !== "admin" && (
        <Navbar user={user} onLogout={handleLogout} />
      )}

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>

          {/* User Routes */}
          <Route
            path="/"
            element={
              <PageTransition>
                <LandingPage />
              </PageTransition>
            }
          />

          <Route 
            path="/about" 
            element={
              <PageTransition>
                <AboutPage />
              </PageTransition>
            } 
          />

          <Route
            path="/products"
            element={
              <PageTransition>
                <ProductPage />
              </PageTransition>
            }
          />

          <Route 
            path="/schedule" 
            element={
              <PageTransition>
                <SchedulePage />
              </PageTransition>
            } 
          />

          <Route
            path="/login"
            element={
              <PageTransition>
                <LoginPage onLogin={handleLogin} />
              </PageTransition>
            }
          />

          <Route
            path="/register"
            element={
              <PageTransition>
                <RegisterPage onRegister={handleRegister} />
              </PageTransition>
            }
          />

          {/* Admin Routes */}
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
              <Route path="/admin/products" element={<Navigate to="/" />} />
            </>
          )}

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AnimatePresence>
    </>
  );
}

export default App;
