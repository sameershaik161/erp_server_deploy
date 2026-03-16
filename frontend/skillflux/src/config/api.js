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
  const rawPath = String(filePath).trim();
  if (!rawPath) return null;
  // If already a full URL, return as is
  if (rawPath.startsWith('http')) return rawPath;

  // Handle URLs missing protocol (e.g. "160.187.169.41/skillflux/uploads/x.pdf")
  // so they become valid absolute URLs.
  const looksLikeHostWithoutProtocol = /^([a-zA-Z0-9.-]+|\d{1,3}(?:\.\d{1,3}){3})(?::\d+)?\//.test(rawPath);
  if (looksLikeHostWithoutProtocol) {
    const protocol = window.location?.protocol || 'http:';
    return `${protocol}//${rawPath}`;
  }

  // Normalize local uploads paths (handle both "/uploads/..." and "uploads/...")
  const normalizedPath = rawPath.startsWith('uploads/') ? `/${rawPath}` : rawPath;
  
  // Get token from localStorage
  const adminToken = localStorage.getItem('adminToken');
  const studentToken = localStorage.getItem('token');
  const token = adminToken || studentToken;

  const normalizedApiBase = API_BASE_URL.endsWith('/')
    ? API_BASE_URL.slice(0, -1)
    : API_BASE_URL;
  const normalizedBackendBase = BACKEND_URL.endsWith('/')
    ? BACKEND_URL.slice(0, -1)
    : BACKEND_URL;

  // Prefer serving uploaded files through the API prefix so it works behind
  // subdirectory proxies (e.g. /skillflux/api) without requiring a separate
  // nginx rule for /skillflux/uploads.
  const baseUrl = normalizedPath.startsWith('/uploads/')
    ? `${normalizedApiBase}${normalizedPath}` // -> .../api/uploads/<filename>
    : `${normalizedBackendBase}${normalizedPath.startsWith('/') ? '' : '/'}${normalizedPath}`;
  if (token) {
    const separator = baseUrl.includes('?') ? '&' : '?';
    return `${baseUrl}${separator}token=${token}`;
  }
  
  return baseUrl;
};
