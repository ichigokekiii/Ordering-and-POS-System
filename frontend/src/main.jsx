import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from "react-router-dom";
import './main.css';
import App from "./App";
import { ProductProvider } from "./contexts/ProductContext";
import { PremadeProvider } from "./contexts/PremadeContext";
import { CartProvider } from "./contexts/CartContext";
import { ScheduleProvider } from "./contexts/ScheduleContext";
import { AuthProvider } from "./contexts/AuthContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <CartProvider>
      <ProductProvider>
        <PremadeProvider>
          <ScheduleProvider>
            <AuthProvider>
              <App />
            </AuthProvider>
          </ScheduleProvider>
        </PremadeProvider>
      </ProductProvider>
    </CartProvider>
  </BrowserRouter>
);
