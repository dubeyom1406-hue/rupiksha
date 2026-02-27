import { createContext, useContext, useState, useEffect } from "react";
import { dataService } from "../services/dataService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // App start pe check karo koi token saved hai kya
    const token = localStorage.getItem("rupiksha_token");
    const savedUser = localStorage.getItem("rupiksha_user");
    if (token && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setPermissions(parsedUser.permissions || []);
      } catch (e) {
        localStorage.removeItem("rupiksha_token");
        localStorage.removeItem("rupiksha_user");
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const res = await dataService.loginUser(username, password);
      if (res.success) {
        // dataService.loginUser already sets localStorage 'rupiksha_user'
        // Let's also set a fake token for consistency with AuthContext state
        localStorage.setItem("rupiksha_token", "MOCK_TOKEN_" + Date.now());
        setUser(res.user);
        setPermissions(res.user.permissions || []);
        return { success: true };
      } else {
        return { success: false, message: res.message };
      }
    } catch (err) {
      return { success: false, message: err.message || "Login failed" };
    }
  };

  const logout = () => {
    localStorage.removeItem("rupiksha_token");
    localStorage.removeItem("rupiksha_user");
    setUser(null);
    setPermissions([]);
  };

  // Check karo user ke paas specific permission hai ya nahi
  const hasPermission = (module, action) => {
    if (user?.role === "ADMIN") return true; // Admin ke paas sab access
    return permissions.some(
      (p) => p.module === module && p.action === action && p.allowed
    );
  };

  const getToken = () => localStorage.getItem("rupiksha_token");

  return (
    <AuthContext.Provider value={{ user, permissions, loading, login, logout, hasPermission, getToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
