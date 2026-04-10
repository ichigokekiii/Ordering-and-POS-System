import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const ProductContext = createContext();

export function ProductProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [premades, setPremades] = useState([]);

  // Fetch all products
  const fetchProducts = async () => {
    try {
      const res = await api.get("/products");
      setProducts(res.data);
    } catch (error) {
      console.error("Product fetch error", error);
    }
  };

  const fetchPremades = async () => {
    try {
      const res = await api.get("/premades");
      setPremades(res.data);
    } catch (error) {
      console.error("Premade fetch error", error);
    }
  };

  useEffect(() => {
    const loadAll = async () => {
      try {
        await Promise.all([
          fetchProducts(),
          fetchPremades()
        ]);
      } catch (error) {
        console.error("Failed to load data", error);
      } finally {
        setLoading(false);
      }
    };

    loadAll();
  }, []);

  // Add product (Axios automatically handles FormData headers)
  const addProduct = async (formData) => {
    try {
      const res = await api.post("/products", formData);
      setProducts((prev) => [res.data, ...prev]);
      return res.data;
    } catch (error) {
      console.error("Failed to add product", error);
      throw error;
    }
  };

  // Add premade
  const addPremade = async (formData) => {
    try {
      const res = await api.post("/premades", formData);
      setPremades((prev) => [res.data, ...prev]);
      return res.data;
    } catch (error) {
      console.error("Failed to add premade", error);
      throw error;
    }
  };

  // Update product
  const updateProduct = async (id, formData) => {
    try {
      if (!formData.has("_method")) {
        formData.append("_method", "PUT");
      }

      const res = await api.post(`/products/${id}`, formData);
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? res.data : p))
      );
      return res.data;
    } catch (error) {
      console.error("Failed to update product", error);
      throw error;
    }
  };

  // Update premade
  const updatePremade = async (id, formData) => {
    try {
      if (!formData.has("_method")) {
        formData.append("_method", "PUT");
      }

      const res = await api.post(`/premades/${id}`, formData);
      setPremades((prev) =>
        prev.map((p) => (p.id === id ? res.data : p))
      );
      return res.data;
    } catch (error) {
      console.error("Failed to update premade", error);
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

  const deletePremade = async (id) => {
    try {
      await api.delete(`/premades/${id}`);
      setPremades((prev) => prev.filter((p) => p.id !== id));
    } catch (error) {
      console.error("Failed to delete premade", error);
      throw error;
    }
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        premades,
        loading,

        fetchProducts,
        fetchPremades,

        addProduct,
        addPremade,

        updateProduct,
        updatePremade,

        deleteProduct,
        deletePremade,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useProducts() {
  return useContext(ProductContext);
}
