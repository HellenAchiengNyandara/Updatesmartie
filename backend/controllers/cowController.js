import { createCow, getCowsByUser, getCowById, updateCow, deleteCow } from "../models/CowModel.js";

// Create a new cow
export const addCow = async (req, res) => {
  try {
    const cowData = req.body;
    const newCow = await createCow(cowData);
    res.status(201).json(newCow);
  } catch (error) {
    console.error("Error adding cow:", error);
    res.status(500).json({ error: "Failed to add cow" });
  }
};

// Get all cows
export const getCows = async (req, res) => {
  try {
    const cows = await getCowsByUser();
    res.json(cows);
  } catch (error) {
    console.error("Error fetching cows:", error);
    res.status(500).json({ error: "Failed to fetch cows" });
  }
};

// Get a single cow by id
export const getCow = async (req, res) => {
  try {
    const cowId = req.params.id;
    const cow = await getCowById(cowId);
    if (!cow) {
      return res.status(404).json({ error: "Cow not found" });
    }
    res.json(cow);
  } catch (error) {
    console.error("Error fetching cow:", error);
    res.status(500).json({ error: "Failed to fetch cow" });
  }
};

// Update a cow
export const updateCowById = async (req, res) => {
  try {
    const cowId = req.params.id;
    const updates = req.body;
    const updatedCow = await updateCow(cowId, updates);
    if (!updatedCow) {
      return res.status(404).json({ error: "Cow not found or not updated" });
    }
    res.json(updatedCow);
  } catch (error) {
    console.error("Error updating cow:", error);
    res.status(500).json({ error: "Failed to update cow" });
  }
};

// Delete a cow
export const deleteCowById = async (req, res) => {
  try {
    const cowId = req.params.id;
    await deleteCow(cowId);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting cow:", error);
    res.status(500).json({ error: "Failed to delete cow" });
  }
};
