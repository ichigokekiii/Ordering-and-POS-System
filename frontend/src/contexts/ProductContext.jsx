import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const ProductContext = createContext();

export function ProductProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all product data from api
  const fetchProducts = async () => {
    try {
      const res = await api.get("/products");
      setProducts(res.data);
    } catch (error) {
      console.error("Product fetch error", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Add product
  const addProduct = async (productData) => {
    try {
      const res = await api.post("/products", productData);
      setProducts((prev) => [res.data, ...prev]);
      return res.data;
    } catch (error) {
      console.error("Failed to add product", error);
      throw error;
    }
  };

  // Update product
  const updateProduct = async (id, updatedData) => {
    try {
      const res = await api.put(`/products/${id}`, updatedData);
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? res.data : p))
      );
      return res.data;
    } catch (error) {
      console.error("Failed to update product", error);
      throw error;
    }
  };

  // Delete product
  const deleteProduct = async (id) => {
    try {
      await api.delete(`/products/${id}`);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (error) {
      console.error("Failed to delete product", error);
      throw error;
    }
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        loading,
        fetchProducts,
        addProduct,
        updateProduct,
        deleteProduct,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
}

// Custom hook
// eslint-disable-next-line react-refresh/only-export-components
export function useProducts() {
  return useContext(ProductContext);
}
