import { createContext, useContext, useState, useEffect } from "react";
import axios from "../api/axiosInstance";
import { toast } from "react-toastify";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔹 Login handler (works for student & admin)
  const login = async (identifier, password, isAdmin = false) => {
    try {
      const endpoint = isAdmin ? "admin/login" : "auth/login";
      const payload = isAdmin
        ? { username: identifier, password }
        : { email: identifier, password };

      const res = await axios.post(endpoint, payload);
      const data = res.data.data; // ApiResponse object has a data field

      localStorage.setItem("token", data.token);
      localStorage.setItem("role", isAdmin ? "admin" : "student");

      setUser({
        ...(isAdmin ? data.admin : data.user),
        role: isAdmin ? "admin" : "student",
      });

      // Refresh user data after login to get current points
      if (!isAdmin) {
        try {
          const userRes = await axios.get("auth/me");
          setUser({
            ...userRes.data,
            role: "student"
          });
          console.log("AuthContext: Updated user data after login:", userRes.data);
        } catch (err) {
          console.warn("Failed to refresh user data after login:", err);
        }
      }

      toast.success("Login successful!");
      return res;
    } catch (err) {
      console.error("Login error:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Login failed");
      throw err;
    }
  };

  // 🔹 Logout
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setUser(null);
    toast.info("Logged out");
  };

  // 🔹 Refresh user data
  const refreshUser = async () => {
    try {
      console.log("AuthContext: Manually refreshing user data");
      const res = await axios.get("auth/me");
      console.log("AuthContext: Refreshed user data:", res.data);
      const role = localStorage.getItem("role");
      setUser({ ...res.data, role: role || "student" });
      return res.data;
    } catch (err) {
      console.error("AuthContext: Refresh failed:", err);
      throw err;
    }
  };

  // 🔹 Load user profile automatically if token exists
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    
    console.log("AuthContext: useEffect triggered");
    console.log("AuthContext: Token exists:", !!token);
    console.log("AuthContext: Role:", role);
    
    if (!token) {
      console.log("AuthContext: No token found, not loading user");
      setLoading(false);
      return;
    }

    const fetchUser = async () => {
      try {
        console.log("AuthContext: Fetching user data from /auth/me");
        const res = await axios.get("auth/me");
        console.log("AuthContext: Raw response from /auth/me:", res.data);
        console.log("AuthContext: User year field:", res.data?.year);
        console.log("AuthContext: User department field:", res.data?.department);
        console.log("AuthContext: Response keys:", Object.keys(res.data));
        
        const userData = { ...res.data, role: role || "student" };
        console.log("AuthContext: Setting user data:", {
          name: userData.name,
          year: userData.year,
          department: userData.department,
          hasYear: !!userData.year,
          allKeys: Object.keys(userData)
        });
        
        setUser(userData);
      } catch (err) {
        console.warn("Auth verification failed:", err.response?.status);
        console.error("Auth error details:", err.response?.data);
        logout();
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
