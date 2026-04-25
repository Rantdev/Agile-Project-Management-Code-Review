import React, { createContext, useState, useContext, useEffect } from "react";
import api from "../services/api";
import toast from "react-hot-toast";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    
    if (token && savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        verifyToken();
      } catch (error) {
        console.error("Failed to parse user:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);
  const googleLogin = async (credential) => {
  try {
    const res = await api.post("/auth/google", { token: credential });
    
    if (res.data.success) {
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setUser(res.data.user);
      api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      
      toast.success("Google login successful!");
      
      // Check if role setup is needed
      const roleCheck = await api.get("/auth/check-role-setup");
      
      if (roleCheck.data.needsRoleSetup) {
        return { success: true, needsRoleSetup: true };
      }
      return { success: true, needsRoleSetup: false };
    }
    return { success: false };
  } catch (error) {
    console.error("Google login error:", error);
    toast.error("Google login failed");
    return { success: false };
  }
};

  const verifyToken = async () => {
    try {
      const res = await api.get("/auth/me");
      if (res.data.success) {
        setUser(res.data.user);
        localStorage.setItem("user", JSON.stringify(res.data.user));
      }
    } catch (error) {
      console.error("Token verification failed:", error);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const res = await api.post("/auth/login", { email, password });
      
      if (res.data.success) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        setUser(res.data.user);
        api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
        toast.success(res.data.message || "Login successful!");
        return { success: true, user: res.data.user };
      }
      return { success: false, error: res.data.error };
    } catch (error) {
      const errorMessage = error.response?.data?.error || "Login failed";
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const register = async (name, email, password) => {
    try {
      const res = await api.post("/auth/register", { name, email, password });
      
      if (res.data.success) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        setUser(res.data.user);
        api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
        toast.success(res.data.message || "Registration successful!");
        return { success: true, user: res.data.user };
      }
      return { success: false, error: res.data.error };
    } catch (error) {
      const errorMessage = error.response?.data?.error || "Registration failed";
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    toast.success("Logged out successfully");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};