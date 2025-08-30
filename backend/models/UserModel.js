// models/UserModel.js
import pool from "../db.js";
import bcrypt from "bcryptjs";

// Create user
export const createUser = async ({ name, email, password }) => {
  const hashedPassword = await bcrypt.hash(password, 10);

  const query = `
    INSERT INTO users (name, email, password)
    VALUES ($1, $2, $3)
    RETURNING *
  `;
  const values = [name, email, hashedPassword];

  const { rows } = await pool.query(query, values);
  return rows[0];
};

// Find user by email
export const findUserByEmail = async (email) => {
  const query = `
    SELECT * FROM users WHERE email = $1
  `;
  const { rows } = await pool.query(query, [email]);
  return rows[0];
};

// Find user by Google ID
export const findUserByGoogleId = async (googleId) => {
  const query = `
    SELECT * FROM users WHERE google_id = $1
  `;
  const { rows } = await pool.query(query, [googleId]);
  return rows[0];
};

// Create or update user with Google data
export const createOrUpdateGoogleUser = async ({ googleId, email, name, picture }) => {
  // Check if user exists by email
  const existingUser = await findUserByEmail(email);
  
  if (existingUser) {
    // Update existing user with Google ID
    const updateQuery = `
      UPDATE users 
      SET google_id = $1, name = $2, avatar = $3, updated_at = CURRENT_TIMESTAMP
      WHERE email = $4
      RETURNING *
    `;
    const { rows } = await pool.query(updateQuery, [googleId, name, picture, email]);
    return rows[0];
  } else {
    // Create new user with Google data
    const insertQuery = `
      INSERT INTO users (google_id, email, name, avatar, password)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    // Use a dummy password for Google users since they'll authenticate via Google
    const dummyPassword = 'google_oauth_user_' + Math.random().toString(36).substring(2);
    const { rows } = await pool.query(insertQuery, [googleId, email, name, picture, dummyPassword]);
    return rows[0];
  }
};
