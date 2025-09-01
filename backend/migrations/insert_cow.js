import fs from "fs";
import pool from "../db.js";

const insertCows = async () => {
  try {
    const filePath = "C:\\Users\\Hellen\\Downloads\\smartmilk\\smartmilk\\data\\cows.json";

    // ✅ Check if file exists
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

    for (const cow of cows) {
      const query = `
        INSERT INTO cows (
          user_id, name, age, lactation_stage, photo,
          milk_volume, fat_percent, protein_percent, lactose_percent, ph
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
        RETURNING id
      `;

      const values = [
        1, // 👈 temporary user_id (replace with real logged-in user later)
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
  } catch (error) {
    console.error("❌ Unexpected error:", error.message);
  } finally {
    await pool.end();
  }
};

insertCows();
