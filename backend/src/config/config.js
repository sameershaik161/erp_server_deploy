import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from common locations (works even if process.cwd() differs)
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

/**
 * Centralized Configuration Module
 * Validates and exports environment variables required for the application.
 */

// Define required variables
const requiredConfig = [
  "PORT",
  "JWT_SECRET",
  "AWS_ACCESS_KEY_ID",
  "AWS_SECRET_ACCESS_KEY",
  "AWS_REGION",
  "AWS_BUCKET_NAME",
];

export const config = {
  env: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT || "5000", 10),
  db: {
    uri: process.env.MONGO_URI || process.env.MONGODB_URI || process.env.DATABASE_URL,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES || "7d",
  },
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
    bucketName: process.env.AWS_BUCKET_NAME,
  },
  cors: {
    frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  },
};

// Validate variables explicitly in production
export const validateConfig = () => {
  if (config.env === "production") {
    const missing = requiredConfig.filter((key) => !process.env[key]);
    if (!config.db?.uri) {
      missing.push("MONGO_URI (or MONGODB_URI/DATABASE_URL)");
    }
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
    }
  }
};
