// Database migration to add Google OAuth columns to users table
import pool from "./db.js";

async function migrate() {
  try {
    console.log("Starting migration: Adding Google OAuth columns to users table...");
    
    // Add google_id column
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE,
      ADD COLUMN IF NOT EXISTS avatar VARCHAR(500),
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    `);
    
    console.log("✅ Migration completed successfully: Added google_id, avatar, and updated_at columns to users table");
    
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run migration if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migrate()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export default migrate;
