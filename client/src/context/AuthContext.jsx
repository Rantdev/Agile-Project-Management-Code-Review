import React, { createContext, useState, useContext, useEffect } from "react";
import api from "../services/api";
import toast from "react-hot-toast";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [needsRoleSetup, setNeedsRoleSetup] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    
    if (token && savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        checkRoleSetup();
      } catch (error) {
        localStorage.clear();
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const checkRoleSetup = async () => {
    try {
      const res = await api.get("/auth/check-role-setup");
      setNeedsRoleSetup(res.data.needsRoleSetup);
    } catch (error) {
      setNeedsRoleSetup(true);
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
        await checkRoleSetup();
        toast.success("Login successful!");
        return true;
      }
      return false;
    } catch (error) {
      toast.error(error.response?.data?.error || "Login failed");
      return false;
    }
  };

  const googleLogin = async (credential) => {
    try {
      const res = await api.post("/auth/google", { token: credential });
      if (res.data.success) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        setUser(res.data.user);
        api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
        await checkRoleSetup();
        toast.success("Google login successful!");
        return { success: true, needsRoleSetup };
      }
      return { success: false };
    } catch (error) {
      toast.error("Google login failed");
      return { success: false };
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
        setNeedsRoleSetup(true);
        toast.success("Registration successful!");
        return { success: true, needsRoleSetup: true };
      }
      return { success: false };
    } catch (error) {
      toast.error(error.response?.data?.error || "Registration failed");
      return { success: false };
    }
  };

  const completeRoleSetup = async (roleData) => {
    try {
      const res = await api.post("/profile/setup-role", roleData);
      if (res.data.success) {
        setNeedsRoleSetup(false);
        const userRes = await api.get("/auth/me");
        setUser(userRes.data.user);
        localStorage.setItem("user", JSON.stringify(userRes.data.user));
        toast.success("Profile setup complete!");
        return true;
      }
      return false;
    } catch (error) {
      toast.error(error.response?.data?.error || "Setup failed");
      return false;
    }
  };

  const logout = () => {
    localStorage.clear();
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    setNeedsRoleSetup(false);
    toast.success("Logged out");
  };

  return (
    <AuthContext.Provider value={{ 
      user, loading, needsRoleSetup, login, register, googleLogin, completeRoleSetup, logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};