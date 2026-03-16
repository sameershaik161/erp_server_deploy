import mongoose from "mongoose";

const connectDB = async () => {
  try {
    mongoose.set("strictQuery", false);

    const mongoUri =
      process.env.MONGO_URI ||
      process.env.MONGODB_URI ||
      process.env.DATABASE_URL;

    if (!mongoUri || typeof mongoUri !== "string" || mongoUri.trim().length === 0) {
      throw new Error(
        "Missing MongoDB connection string. Set MONGO_URI (preferred) or MONGODB_URI/DATABASE_URL in your environment or .env file."
      );
    }

    const conn = await mongoose.connect(mongoUri, {
      ssl: true,
      tlsAllowInvalidCertificates: false, // Updated from deprecated sslValidate
      retryWrites: true,
      w: "majority",
      serverSelectionTimeoutMS: 15000,
    });

    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err.message);
    throw err;
  }
};

export default connectDB;
