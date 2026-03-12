import axios from "axios";

// Create base Axios instance
// Default to Vercel backend for production, can be overridden with .env file
const baseURL = import.meta.env.VITE_API_BASE_URL || "https://skillflux-backend.vercel.app/api";
console.log("🔧 Axios Base URL:", baseURL);

const axiosInstance = axios.create({
  baseURL: baseURL,
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically attach JWT token if available
axiosInstance.interceptors.request.use(
  (config) => {
    console.log(`📤 API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("🔑 Token attached to request");
    } else {
      console.log("⚠️ No token found in localStorage");
    }
    
    // If the request contains FormData, remove Content-Type to let browser set it with boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
      console.log("📎 FormData detected - Content-Type will be auto-set");
    }
    
    return config;
  },
  (error) => {
    console.error("❌ Request error:", error);
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
axiosInstance.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} from ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error("❌ API Error:", error.response?.status, error.response?.data || error.message);
    
    // Global handling for expired/invalid tokens
    if (error.response?.status === 401) {
      console.warn("Unauthorized access - clearing token and state");
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      
      // Prevent redirect loop if already on login page
      if (window.location.pathname !== '/skillflux/login' && window.location.pathname !== '/skillflux/') {
         window.location.href = '/skillflux/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
