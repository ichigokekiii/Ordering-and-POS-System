import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from "react-router-dom";
import './main.css';
import App from "./App";
import { ProductProvider } from "./contexts/ProductContext";
import { PremadeProvider } from "./contexts/PremadeContext";
import { CartProvider } from "./contexts/CartContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <CartProvider>
  <BrowserRouter>
    <ProductProvider>
       <PremadeProvider>
      <App />
      </PremadeProvider>
    </ProductProvider>
  </BrowserRouter>
  </CartProvider>
);


