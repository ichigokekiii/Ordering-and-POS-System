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

  // Add product
const addProduct = async (productData) => {
  try {
    const formData = new FormData();
    formData.append("name", productData.name);
    formData.append("description", productData.description);
    formData.append("price", productData.price);
    formData.append("category", productData.category);
    formData.append("type", productData.type || "");
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

const addPremade = async (premadeData) => {
  try {
    const formData = new FormData();
    formData.append("name", premadeData.name);
    formData.append("description", premadeData.description);
    formData.append("price", premadeData.price);
    formData.append("isAvailable", Number(premadeData.isAvailable));
    if (premadeData.image) {
      formData.append("image", premadeData.image);
    }

    const res = await api.post("/premades", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    setPremades((prev) => [res.data, ...prev]);
    return res.data;
  } catch (error) {
    console.error("Failed to add premade", error);
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
    formData.append("type", updatedData.type || "");
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

const updatePremade = async (id, updatedData) => {
  try {
    const formData = new FormData();
    formData.append("_method", "PUT");
    formData.append("name", updatedData.name);
    formData.append("description", updatedData.description);
    formData.append("price", updatedData.price);
    formData.append("isAvailable", Number(updatedData.isAvailable));
    if (updatedData.image) {
      formData.append("image", updatedData.image);
    }

    const res = await api.post(`/premades/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

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
