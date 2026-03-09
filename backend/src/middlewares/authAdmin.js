import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";

export default async function authAdmin(req, res, next) {
  try {
    console.log(`🔐 AuthAdmin middleware - ${req.method} ${req.path}`);
    const header = req.headers.authorization;
    
    // Support token via query param for file downloads (e.g., Excel export)
    let token;
    if (header) {
      token = header.split(" ")[1];
    } else if (req.query.token) {
      token = req.query.token;
    }
    
    if (!token) {
      console.log("❌ No authorization header or token");
      return res.status(401).json({ message: "No admin token" });
    }
    console.log("🎫 Token received, verifying...");
    const payload = jwt.verify(token, process.env.ADMIN_JWT_SECRET);
    console.log("✅ Token verified, payload:", payload.id);
    const admin = await Admin.findById(payload.id);
    if (!admin) {
      console.log("❌ Admin not found in database");
      return res.status(401).json({ message: "Admin not found" });
    }
    console.log(`✅ Admin authenticated: ${admin.username}`);
    req.admin = admin;
    next();
  } catch (err) {
    console.log("❌ Auth error:", err.message);
    return res.status(401).json({ message: "Admin unauthorized", error: err.message });
  }
}
