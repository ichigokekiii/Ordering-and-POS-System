import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from "react-router-dom";
import './main.css';
import App from "./App";
import { ProductProvider } from "./contexts/ProductContext";
import { PremadeProvider } from "./contexts/PremadeContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <ProductProvider>
       <PremadeProvider>
      <App />
      </PremadeProvider>
    </ProductProvider>
  </BrowserRouter>
);


