import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./main.css";
import App from "./App";
import { ProductProvider } from "./contexts/ProductContext";
import { PremadeProvider } from "./contexts/PremadeContext";
import { CartProvider } from "./contexts/CartContext";
import { ScheduleProvider } from "./contexts/ScheduleContext";
import { AuthProvider } from "./contexts/AuthContext";
import { LoadingProvider } from "./contexts/LoadingContext";
import { NavbarProvider } from "./contexts/NavbarContext";
import { OrderProvider } from "./contexts/OrderContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <LoadingProvider>
      <NavbarProvider>
        <CartProvider>
          <ProductProvider>
            <PremadeProvider>
              <ScheduleProvider>
                <AuthProvider>
                  <OrderProvider>
                    <App />
                  </OrderProvider>
                </AuthProvider>
              </ScheduleProvider>
            </PremadeProvider>
          </ProductProvider>
        </CartProvider>
      </NavbarProvider>
    </LoadingProvider>
  </BrowserRouter>,
);
