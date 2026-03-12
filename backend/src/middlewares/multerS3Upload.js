import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use /tmp directory for Vercel serverless environment
// In production (Vercel), use /tmp which is writable
// In development, use local uploads directory
const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL;
const uploadsDir = isProduction ? '/tmp/uploads' : path.join(__dirname, "../../uploads");

// Create uploads directory if it doesn't exist
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Use disk storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Sanitize the file name to avoid directory traversal and execution
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const uniqueName = `${Date.now()}_${Math.random().toString(36).slice(2)}_${safeName}`;
    cb(null, uniqueName);
  }
});

// File validation filter
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only JPEG, PNG, PDF, and DOC files are allowed."), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Reduced to 10 MB for security
  fileFilter
});

export default upload;
