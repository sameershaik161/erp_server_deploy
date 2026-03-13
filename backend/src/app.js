import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import mongoSanitize from "express-mongo-sanitize";
import xss from "xss-clean";
import hpp from "hpp";
import path from "path";
import { fileURLToPath } from "url";

// Custom Middlewares
import { apiLimiter, authLimiter, adminLimiter } from "./middlewares/rateLimiter.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { logger } from "./utils/logger.js";

import authRoutes from "./routes/auth.routes.js";
import achievementRoutes from "./routes/achievement.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import erpRoutes from "./routes/erp.routes.js";
import announcementRoutes from "./routes/announcement.routes.js";
import activityRoutes from "./routes/activity.routes.js";
import fileRoutes from "./routes/file.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// parse JSON bodies
app.use(express.json({ limit: '50mb' }));
// allow form-data (multer handles files)
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent HTTP Parameter Pollution
app.use(hpp({
  whitelist: [
    'year', 'department', 'section', 'status' // Allow arrays for these specific query parameters if needed
  ]
}));

// Apply Global Rate Limiter
app.use("/api", apiLimiter);

// CORS configuration for AWS deployment
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL,
  process.env.VERCEL_URL,
  process.env.RENDER_EXTERNAL_URL,
].filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // In development or if specifically allowed, allow all origins
    if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
      return callback(null, true);
    }
    
    // Robust check for allowed origins
    const isAllowed = 
      allowedOrigins.includes(origin) ||
      origin.endsWith('.vercel.app') ||
      origin.endsWith('.amazonaws.com') ||
      origin.endsWith('.onrender.com') ||
      // Allow private IP ranges for local testing
      /^http:\/\/(127\.|10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/.test(origin) ||
      // Allow the origin if it matches the current host (for proxy scenarios)
      (process.env.SERVER_IP && origin.includes(process.env.SERVER_IP));

    if (isAllowed) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(helmet({ 
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false // Allow content from any source for development
}));

// Setup Morgan to use Winston Logger
const morganFormat = process.env.NODE_ENV === "production" ? "combined" : "dev";
app.use(morgan(morganFormat, {
  stream: {
    write: (message) => logger.info(message.trim())
  }
}));

// Serve uploaded files statically with fallback
// In production (Vercel), serve from /tmp/uploads
// In development, serve from local uploads directory
const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL;
const uploadsPath = isProduction ? '/tmp/uploads' : path.join(__dirname, "../uploads");

// Create uploads directory if it doesn't exist
import fs from "fs";
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}

// Serve static files with error handling
app.use("/uploads", express.static(uploadsPath, {
  // Add error handling for missing files
  fallthrough: true,
  // Set cache headers
  maxAge: '1d'
}));

// Route Definitions
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/achievements", achievementRoutes);
app.use("/api/admin", adminLimiter, adminRoutes);
app.use("/api/erp", erpRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/activities", activityRoutes);
app.use("/uploads", fileRoutes);

// Health check endpoint for AWS
app.get("/api/health", (req, res) => {
  res.status(200).json({ 
    status: "healthy", 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get("/", (req, res) => res.json({ 
  ok: true, 
  message: "Student ERP Portal API",
  version: "1.0.0"
}));

// Route not found fallback
app.use((req, res, next) => {
  next(new Error(`Not Found - ${req.originalUrl}`));
});

// Centralized error handler
app.use(errorHandler);

export default app;
