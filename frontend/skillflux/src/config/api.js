// API Configuration
// Central place to manage API URLs

// Base API URL for axios requests
// Priority: Environment variable > Local development
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

// Backend server URL for file uploads/downloads
export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

console.log('🌍 API Configuration:');
console.log('  API_BASE_URL:', API_BASE_URL);
console.log('  BACKEND_URL:', BACKEND_URL);
console.log('  Mode:', import.meta.env.MODE);

// Helper function to get full file URL with authentication token
export const getFileUrl = (filePath) => {
  if (!filePath) return null;
  // If already a full URL, return as is
  if (filePath.startsWith('http')) return filePath;
  
  // Get token from localStorage
  const adminToken = localStorage.getItem('adminToken');
  const studentToken = localStorage.getItem('token');
  const token = adminToken || studentToken;
  
  // Build URL with token parameter
  const baseUrl = `${BACKEND_URL}${filePath}`;
  if (token) {
    const separator = baseUrl.includes('?') ? '&' : '?';
    return `${baseUrl}${separator}token=${token}`;
  }
  
  return baseUrl;
};
