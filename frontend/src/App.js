import { useState } from "react";
import LandingPage from "./pages/LandingPage";
import ProductPage from "./pages/ProductPage";
import AdminProductPage from "./pages/AdminProductPage";

function App() {
  const [page, setPage] = useState("home");

  return (
    <>
      {page === "home" && <LandingPage />}
      {page === "products" && <ProductPage />}
      {page === "admin" && <AdminProductPage />}

      {/* Pass page setter to navbar via window (simple MVP trick) */}
      <div className="hidden">
        {window.setPage = setPage}
      </div>
    </>
  );
}

export default App;
