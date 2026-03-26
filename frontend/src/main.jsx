import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./main.css";
import App from "./App";
import { ProductProvider } from "./contexts/ProductContext";
import { CartProvider } from "./contexts/CartContext";
import { ScheduleProvider } from "./contexts/ScheduleContext";
import { AuthProvider } from "./contexts/AuthContext";
import { LoadingProvider } from "./contexts/LoadingContext";
import { NavbarProvider } from "./contexts/NavbarContext";
import { OrderProvider } from "./contexts/OrderContext";
import { ContentProvider } from "./contexts/ContentContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <LoadingProvider>
      <NavbarProvider>
        <CartProvider>
          <ProductProvider>
            <ScheduleProvider>
              <AuthProvider>
                <OrderProvider>
                  <ContentProvider>
                    <App />
                  </ContentProvider>
                </OrderProvider>
              </AuthProvider>
            </ScheduleProvider>
          </ProductProvider>
        </CartProvider>
      </NavbarProvider>
    </LoadingProvider>
  </BrowserRouter>,
);
