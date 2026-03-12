import dotenv from "dotenv";
dotenv.config();

import { config, validateConfig } from "./src/config/config.js";
import { logger } from "./src/utils/logger.js";
import connectDB from "./config/db.js";
import app from "./src/app.js";

// Validate environment variables in production
validateConfig();

const PORT = config.port;
const NODE_ENV = config.env;

logger.info(`🚀 Starting server in ${NODE_ENV} mode...`);

// Connect to database and start server
connectDB()
  .then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      logger.info(`✅ Server running on port ${PORT}`);
      logger.info(`🌍 Environment: ${NODE_ENV}`);
    });
  })
  .catch((err) => {
    logger.error(`❌ DB connection failed: ${err.message}`);
    process.exit(1);
  });

export default app;
