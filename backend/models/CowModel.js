import pool from "../db.js";

// Generate next cow ID like "COW001"
const generateCowId = async () => {
  const result = await pool.query(`
    SELECT id FROM cows 
    WHERE id ~ '^COW[0-9]+$' 
    ORDER BY id DESC 
    LIMIT 1
  `);

  if (result.rows.length === 0) return "COW001";

  const lastId = result.rows[0].id; // e.g., "COW007"
  const num = parseInt(lastId.replace("COW", ""), 10) + 1;
  return `COW${String(num).padStart(3, "0")}`;
};

// Create a new cow
export const createCow = async (cowData) => {
  const {
    user_id,
    name,
    age,
    lactationStage,
    photo,
    milkVolume,
    fatPercent,
    proteinPercent,
    lactosePercent,
    pH,
  } = cowData;

  const id = await generateCowId();

  const query = `
    INSERT INTO cows (
      id, user_id, name, age, lactation_stage, photo,
      milk_volume, fat_percent, protein_percent, lactose_percent, ph
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
    RETURNING *
  `;

  const values = [
    id,
    user_id,
    name,
    age,
    lactationStage,
    photo,
    milkVolume,
    fatPercent,
    proteinPercent,
    lactosePercent,
    pH,
  ];

  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

// Get all cows for a user
export const getCowsByUser = async (userId) => {
  const query = "SELECT * FROM cows WHERE user_id = $1 ORDER BY created_at DESC";
  try {
    const result = await pool.query(query, [userId]);
    return result.rows;
  } catch (error) {
    throw error;
  }
};

// Get a single cow by id and user_id
export const getCowById = async (cowId, userId) => {
  const query = "SELECT * FROM cows WHERE id = $1 AND user_id = $2";
  try {
    const result = await pool.query(query, [cowId, userId]);
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

// Update a cow
export const updateCow = async (cowId, userId, updates) => {
  const fields = [];
  const values = [];
  let paramCount = 1;

  Object.keys(updates).forEach((key) => {
    if (updates[key] !== undefined) {
      fields.push(`${key} = $${paramCount}`);
      values.push(updates[key]);
      paramCount++;
    }
  });

  if (fields.length === 0) return null;

  const query = `
    UPDATE cows 
    SET ${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP
    WHERE id = $${paramCount} AND user_id = $${paramCount + 1}
    RETURNING *
  `;

  values.push(cowId, userId);

  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

// Delete a cow
export const deleteCow = async (cowId, userId) => {
  const query = "DELETE FROM cows WHERE id = $1 AND user_id = $2";
  try {
    const result = await pool.query(query, [cowId, userId]);
    return result.rowCount > 0;
  } catch (error) {
    throw error;
  }
};
