// controllers/authController.js
import { findUserByEmail, createUser } from "../models/UserModel.js";
import bcrypt from "bcryptjs";

// REGISTER
export const register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const newUser = await createUser({ name, email, password });
    res.status(201).json({ message: "User registered successfully", user: { id: newUser.id, name: newUser.name, email: newUser.email } });

  } catch (err) {
    console.error("register error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// LOGIN
export const login = async (req, res) => {
  const { email, password } = req.body; // use email, not name

  try {
    const user = await findUserByEmail(email);
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    res.status(200).json({ message: "Login successful", user: { id: user.id, name: user.name, email: user.email } });

  } catch (err) {
    console.error("login error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// GOOGLE OAUTH
import { verifyGoogleToken } from "../config/googleOAuth.js";
import { createOrUpdateGoogleUser } from "../models/UserModel.js";

export const googleAuth = async (req, res) => {
  const { idToken } = req.body;

  try {
    if (!idToken) {
      return res.status(400).json({ error: "Google ID token is required" });
    }

    // Verify Google ID token
    const googleUser = await verifyGoogleToken(idToken);
    
    if (!googleUser.emailVerified) {
      return res.status(400).json({ error: "Google email not verified" });
    }

    // Create or update user in database
    const user = await createOrUpdateGoogleUser({
      googleId: googleUser.googleId,
      email: googleUser.email,
      name: googleUser.name,
      picture: googleUser.picture
    });

    res.status(200).json({
      message: "Google authentication successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar
      }
    });

  } catch (error) {
    console.error("Google auth error:", error);
    res.status(400).json({ error: error.message || "Google authentication failed" });
  }
};

