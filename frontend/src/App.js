import { useState } from "react";
import LandingPage from "./pages/LandingPage";
import ProductPage from "./pages/ProductPage";
import AdminProductPage from "./pages/AdminProductPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AdminOverviewPage from "./pages/AdminOverviewPage";



function App() {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user"))
  );
  const [page, setPage] = useState("home");

  const handleLogin = (userData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);

    // Redirect based on role
    if (userData.role === "admin") {
      setPage("admin-overview");
    } else {
      setPage("home");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    setPage("home");
  };

  const handleRegister = (userData) => {
  localStorage.setItem("user", JSON.stringify(userData));
  setUser(userData);
  setPage("home");
};


  // Make controls available to Navbar
  window.setPage = setPage;
  window.logout = handleLogout;
  window.user = user;

  // 🔒 ADMIN WORLD
  if (user?.role === "admin") {
    if (page === "admin-products") {
      return <AdminProductPage />;
    }

    // default admin page
    return <AdminOverviewPage />;
  }


  // user side
  return (
    <>
      {page === "home" && <LandingPage />}
      {page === "products" && <ProductPage />}
      {page === "login" && <LoginPage onLogin={handleLogin} />}
      {page === "register" && (<RegisterPage onRegister={handleRegister} />)}
    </>
  );
}

export default App;
