import express from "express";
import { addCow, getCows, getCow, updateCowById, deleteCowById } from "./controllers/cowController.js";
import authMiddleware from "./middleware/auth.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/", addCow);
router.get("/", getCows);
router.get("/:id", getCow);
router.put("/:id", updateCowById);
router.delete("/:id", deleteCowById);

export default router;
