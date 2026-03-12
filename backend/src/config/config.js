import dotenv from "dotenv";
dotenv.config();

/**
 * Centralized Configuration Module
 * Validates and exports environment variables required for the application.
 */

// Define required variables
const requiredConfig = [
  "PORT",
  "MONGO_URI",
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
    uri: process.env.MONGO_URI,
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
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
    }
  }
};
