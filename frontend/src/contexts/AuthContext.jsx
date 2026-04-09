/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect, useContext } from "react";
import api from "../services/api"; // Make sure to import your api instance

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error("Failed to parse stored user:", err);
        localStorage.removeItem("user");
      }
    }

    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    // Some endpoints return { user: {...} } while others return the user directly
    const normalizedUser = userData?.user ? userData.user : userData;

    setUser(normalizedUser);
    localStorage.setItem("user", JSON.stringify(normalizedUser));
    
    // Note: Ensure your login component is also doing localStorage.setItem("token", ...)
    // after a successful login!

    window.dispatchEvent(new Event("userUpdated"));
  };

  // Changed to async to safely notify the backend before clearing storage
  const handleLogout = async () => {
    try {
      // Securely invalidate the session/token on the backend
      await api.post("/logout");
    } catch (err) {
      console.error("Server logout failed", err);
    } finally {
      // ALWAYS clear frontend state, even if the backend request fails
      setUser(null);
      localStorage.removeItem("user");
      localStorage.removeItem("token"); // <-- THIS WAS THE MISSING PIECE!
      
      // Optional: Clear any stored cart data for security
      window.sessionStorage.removeItem("staff-pos-cart"); 

      window.dispatchEvent(new Event("userUpdated"));
    }
  };

  return (
    <AuthContext.Provider value={{ user, handleLogin, handleLogout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}