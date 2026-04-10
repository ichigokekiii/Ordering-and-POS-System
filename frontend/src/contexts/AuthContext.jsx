/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect, useContext } from "react";
import api from "../services/api"; // Make sure to import your api instance

export const AuthContext = createContext();

const mapProfileToSessionUser = (profile) => {
  if (!profile) return null;

  return {
    id: profile.id,
    first_name: profile.first_name,
    last_name: profile.last_name,
    email: profile.email,
    phone_number: profile.phone_number,
    profile_picture: profile.profile_picture,
    role: profile.role,
  };
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const syncAuthenticatedUser = async () => {
      const token = window.sessionStorage.getItem("token");

      if (!token) {
        localStorage.removeItem("user");
        if (isMounted) {
          setUser(null);
          setLoading(false);
        }
        return;
      }

      try {
        const res = await api.get("/profile");
        if (isMounted) {
          setUser(mapProfileToSessionUser(res.data));
        }
      } catch (err) {
        console.error("Failed to restore authenticated user:", err.response?.data || err.message);
        window.sessionStorage.removeItem("token");
        localStorage.removeItem("user");
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    const handleAuthStateChange = () => {
      setLoading(true);
      syncAuthenticatedUser();
    };

    syncAuthenticatedUser();

    window.addEventListener("storage", handleAuthStateChange);
    window.addEventListener("userUpdated", handleAuthStateChange);

    return () => {
      isMounted = false;
      window.removeEventListener("storage", handleAuthStateChange);
      window.removeEventListener("userUpdated", handleAuthStateChange);
    };
  }, []);

  const handleLogin = (userData) => {
    // Some endpoints return { user: {...} } while others return the user directly
    const normalizedUser = userData?.user ? userData.user : userData;

    setUser(normalizedUser);
    localStorage.removeItem("user");
    
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
      window.sessionStorage.removeItem("token");
      
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
