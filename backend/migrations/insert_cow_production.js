import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pool from "../db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const insertCowsProduction = async () => {
  try {
    // Use relative path from backend directory to smartmilk/data/cows.json
    const filePath = path.join(__dirname, "../../smartmilk/data/cows.json");

    console.log("Looking for cows.json at:", filePath);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error("❌ cows.json file not found at:", filePath);
      return;
    }

    const data = fs.readFileSync(filePath, "utf-8");
    let cows;

    try {
      cows = JSON.parse(data);
    } catch (parseError) {
      console.error("❌ Failed to parse cows.json:", parseError.message);
      return;
    }

    console.log(`Found ${cows.length} cows to insert`);

    for (const cow of cows) {
      // Check if cow already exists
      const existingCow = await pool.query(
        "SELECT id FROM cows WHERE name = $1",
        [cow.name]
      );

      if (existingCow.rows.length > 0) {
        console.log(`⚠️  Cow ${cow.name} already exists, skipping`);
        continue;
      }

      const query = `
        INSERT INTO cows (
          user_id, name, age, lactation_stage, photo,
          milk_volume, fat_percent, protein_percent, lactose_percent, ph
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
        RETURNING id
      `;

      const values = [
        1, // Default user_id (replace with actual admin user ID in production)
        cow.name,
        cow.age,
        cow.lactationStage,
        cow.photo,
        cow.milkVolume,
        cow.fatPercent,
        cow.proteinPercent,
        cow.lactosePercent,
        cow.pH
      ];

      try {
        const res = await pool.query(query, values);
        console.log(`✅ Inserted cow ${cow.name} with DB ID: ${res.rows[0].id}`);
      } catch (dbError) {
        console.error(`❌ DB error inserting cow ${cow.name}:`, dbError.message);
      }
    }

    console.log("✅ Cow insertion completed");
  } catch (error) {
    console.error("❌ Unexpected error:", error.message);
  } finally {
    await pool.end();
  }
};

// Run the migration
insertCowsProduction();
