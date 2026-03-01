import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const PremadeContext = createContext();

export function PremadeProvider({ children }) {
  const [premades, setPremades] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all Premades
  const fetchPremades = async () => {
    try {
      const res = await api.get("/premades");
      setPremades(res.data);
    } catch (error) {
      console.error("Premade fetch error", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPremades();
  }, []);

  // Add Premade
  const addPremade = async (PremadeData) => {
    try {
      const res = await api.post("/premades", PremadeData);
      setPremades((prev) => [res.data, ...prev]);
      return res.data;
    } catch (error) {
      console.error("Failed to add Premade", error);
      throw error;
    }
  };

  // Update Premade
  const updatePremade = async (id, updatedData) => {
    try {
      const res = await api.put(`/premades/${id}`, updatedData);
      setPremades((prev) =>
        prev.map((p) => (p.id === id ? res.data : p))
      );
      return res.data;
    } catch (error) {
      console.error("Failed to update Premade", error);
      throw error;
    }
  };

  // Delete Premade
  const deletePremade = async (id) => {
    try {
      await api.delete(`/premades/${id}`);
      setPremades((prev) => prev.filter((p) => p.id !== id));
    } catch (error) {
      console.error("Failed to delete Premade", error);
      throw error;
    }
  };

  return (
    <PremadeContext.Provider
      value={{
        premades,
        loading,
        fetchPremades,
        addPremade,
        updatePremade,
        deletePremade,
      }}
    >
      {children}
    </PremadeContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function usePremades() {
  return useContext(PremadeContext);
}
