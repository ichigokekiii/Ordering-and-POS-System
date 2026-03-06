/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect, useContext } from "react";

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

    window.dispatchEvent(new Event("userUpdated"));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("userUpdated"));
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