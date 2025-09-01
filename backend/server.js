// server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import pool from "./db.js"; // import pool directly

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);

// Cow routes
import cowRoutes from "./routes/cows.js";
app.use("/api/cows", cowRoutes);

// Example route
app.get("/api/test", (req, res) => {
  res.json({ message: "Backend is running 🚀" });
});

// Farm route
app.get("/api/farm", (req, res) => {
  const mockFarmData = {
    name: "SmartMilk Dairy Farm",
    location: "Farm Location",
    totalCows: 0,
    dailyMilkProduction: 0,
    alerts: [],
    stats: {
      averageMilkVolume: 0,
      averageFatPercent: 0,
      averageProteinPercent: 0,
      averageLactosePercent: 0,
      averagePH: 6.5
    }
  };
  res.json(mockFarmData);
});

// Test DB connection
pool.connect()
  .then(() => console.log("✅ Connected to PostgreSQL"))
  .catch(err => console.error("❌ DB Connection Error:", err));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
