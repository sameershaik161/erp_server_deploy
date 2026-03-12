import dotenv from "dotenv";
dotenv.config();

import { validateEnv } from "./src/utils/validateEnv.js";
import connectDB from "./config/db.js";
import app from "./src/app.js";

// Validate environment variables in production
if (process.env.NODE_ENV === 'production') {
  validateEnv();
}

// Render deployment: Use PORT from environment or default to 5000
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

console.log(`🚀 Environment: ${NODE_ENV}`);
console.log(`📍 Port: ${PORT}`);

// Connect to database and start server
connectDB()
  .then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${NODE_ENV}`);
      console.log(`🔗 Access: http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ DB connection failed:", err);
    process.exit(1);
  });

export default app;
