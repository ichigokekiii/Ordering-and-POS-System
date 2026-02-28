import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const ProductContext = createContext();

export function ProductProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all products
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
    const formData = new FormData();
    formData.append("name", productData.name);
    formData.append("description", productData.description);
    formData.append("price", productData.price);
    formData.append("category", productData.category);
    formData.append("isAvailable", Number(productData.isAvailable));
    if (productData.image) {
      formData.append("image", productData.image);
    }

    const res = await api.post("/products", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
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
    const formData = new FormData();
    formData.append("_method", "PUT");
    formData.append("name", updatedData.name);
    formData.append("description", updatedData.description);
    formData.append("price", updatedData.price);
    formData.append("category", updatedData.category);
    formData.append("isAvailable", Number(updatedData.isAvailable));
    if (updatedData.image) {
      formData.append("image", updatedData.image);
    }

    const res = await api.post(`/products/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
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

// eslint-disable-next-line react-refresh/only-export-components
export function useProducts() {
  return useContext(ProductContext);
}
