import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Landing from "./pages/Landing";
import StudentLogin from "./pages/Auth/StudentLogin";
import AdminLogin from "./pages/Auth/AdminLogin";
import Register from "./pages/Auth/Register";
import Dashboard from "./pages/Student/Dashboard";
import Profile from "./pages/Student/Profile";
import Achievements from "./pages/Student/Achievements";
import AddAchievement from "./pages/Student/AddAchievement";
import UpdateERP from "./pages/Student/UpdateERP";
import Announcements from "./pages/Student/Announcements";
import Leaderboard from "./pages/Student/Leaderboard";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import ManageAchievements from "./pages/Admin/ManageAchievements";
import Analytics from "./pages/Admin/Analytics";
import ManageERPs from "./pages/Admin/ManageERPs";
import ManageAnnouncements from "./pages/Admin/ManageAnnouncements";
import Students from "./pages/Admin/Students";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<StudentLogin />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/register" element={<Register />} />

          {/* Student */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/achievements" element={<ProtectedRoute><Achievements /></ProtectedRoute>} />
          <Route path="/add" element={<ProtectedRoute><AddAchievement /></ProtectedRoute>} />
          <Route path="/update-erp" element={<ProtectedRoute><UpdateERP /></ProtectedRoute>} />
          <Route path="/announcements" element={<ProtectedRoute><Announcements /></ProtectedRoute>} />
          <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />

          {/* Admin */}
          <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/students" element={<ProtectedRoute role="admin"><Students /></ProtectedRoute>} />
          <Route path="/admin/manage" element={<ProtectedRoute role="admin"><ManageAchievements /></ProtectedRoute>} />
          <Route path="/admin/analytics" element={<ProtectedRoute role="admin"><Analytics /></ProtectedRoute>} />
          <Route path="/admin/manage-erp" element={<ProtectedRoute role="admin"><ManageERPs /></ProtectedRoute>} />
          <Route path="/admin/announcements" element={<ProtectedRoute role="admin"><ManageAnnouncements /></ProtectedRoute>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
        <ToastContainer position="top-right" />
      </BrowserRouter>
    </AuthProvider>
  );
}
