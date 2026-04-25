import axios from "axios";
import toast from "react-hot-toast";

// Use the correct backend URL (without -1)
const API_URL = "https://agile-project-management-code-review.onrender.com/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Important for CORS with credentials
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`📡 ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("❌ API Error:", error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href = "/";
      toast.error("Session expired. Please login again.");
    }
    
    if (error.response?.data?.error) {
      toast.error(error.response.data.error);
    }
    
    return Promise.reject(error);
  }
);

export default api;