import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from common locations regardless of PM2 cwd
dotenv.config({ path: path.resolve(__dirname, ".env") });
dotenv.config({ path: path.resolve(__dirname, "../.env") });

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
