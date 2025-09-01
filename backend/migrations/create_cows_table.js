import pool from "../db.js";

const createCowsTable = async () => {
  try {
    const query = `
      -- Drop the table if it exists
      DROP TABLE IF EXISTS cows CASCADE;
      DROP SEQUENCE IF EXISTS cows_id_seq;

      -- Create sequence for numeric part
      CREATE SEQUENCE cows_id_seq START 1;

      -- Create table
      CREATE TABLE IF NOT EXISTS cows (
        id VARCHAR(20) PRIMARY KEY DEFAULT ('COW' || LPAD(nextval('cows_id_seq')::TEXT, 3, '0')),
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        age INTEGER NOT NULL,
        lactation_stage VARCHAR(50) NOT NULL,
        photo VARCHAR(255),
        milk_volume DECIMAL(5,2) NOT NULL,
        fat_percent DECIMAL(4,2) NOT NULL,
        protein_percent DECIMAL(4,2) NOT NULL,
        lactose_percent DECIMAL(4,2) NOT NULL,
        ph DECIMAL(3,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Indexes
      CREATE INDEX IF NOT EXISTS idx_cows_user_id ON cows(user_id);
      CREATE INDEX IF NOT EXISTS idx_cows_created_at ON cows(created_at DESC);
    `;

    await pool.query(query);
    console.log("✅ Cows table recreated with auto-generated IDs (COW001 style)");
  } catch (error) {
    console.error("❌ Error creating cows table:", error);
  } finally {
    pool.end();
  }
};

createCowsTable();
