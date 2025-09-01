import express from "express";
import pool from "../db.js";

const router = express.Router();

// 🐄 Get all cows
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM cows ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching cows:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// 🐄 Get a single cow by ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM cows WHERE id = $1", [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Cow not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching cow:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// 🐄 Add a new cow
router.post("/", async (req, res) => {
  const { name, age, lactationStage, photo, milkVolume, fatPercent, proteinPercent, lactosePercent, pH } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO cows (name, age, lactation_stage, photo, milk_volume, fat_percent, protein_percent, lactose_percent, ph) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *",
      [name, age, lactationStage, photo, milkVolume, fatPercent, proteinPercent, lactosePercent, pH]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error inserting cow:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// 🐄 Update cow
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, age, lactationStage, photo, milkVolume, fatPercent, proteinPercent, lactosePercent, pH } = req.body;
  try {
    const result = await pool.query(
      "UPDATE cows SET name = $1, age = $2, lactation_stage = $3, photo = $4, milk_volume = $5, fat_percent = $6, protein_percent = $7, lactose_percent = $8, ph = $9 WHERE id = $10 RETURNING *",
      [name, age, lactationStage, photo, milkVolume, fatPercent, proteinPercent, lactosePercent, pH, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Cow not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error updating cow:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// 🐄 Delete cow
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("DELETE FROM cows WHERE id = $1 RETURNING *", [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Cow not found" });
    res.json({ message: "Cow deleted successfully" });
  } catch (err) {
    console.error("Error deleting cow:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

export default router; // ✅ ES module export
