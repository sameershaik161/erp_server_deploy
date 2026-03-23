import rateLimit from "express-rate-limit";

// Centralized error response standard
const standardMessage = {
  success: false,
  message: "Too many requests from this IP, please try again later."
};

// Global API Limiter (500 requests per minute)
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 500, // Limit each IP to 500 requests per `window` (here, per minute)
  message: standardMessage,
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Stricter limiter for Authentication Routes (register, login, forgot password)
export const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 requests per minute for auth routes
  message: {
    success: false,
    message: "Too many login/registration attempts, please try again after a minute."
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Medium limiter for Admin Routes
export const adminLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // Limit each IP to 60 requests per minute for admin actions
  message: {
    success: false,
    message: "Too many admin requests, please wait."
  },
  standardHeaders: true,
  legacyHeaders: false,
});
