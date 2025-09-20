import express from "express";
import {
  getColors,
  createColor,
  deleteColor,
  updateColor,
  getSizes,
  createSize,
  deleteSize,
  updateSize
} from "../controllers/optionsController.js";

const router = express.Router();

router.get("/colors", getColors);
router.post("/colors", createColor);
router.delete("/colors/:hexCode", deleteColor); // ✅ Eliminar color por hexCode
router.put("/colors/:id", updateColor);

router.get("/sizes", getSizes);
router.post("/sizes", createSize);
router.delete("/sizes/:label", deleteSize); // ✅ Eliminar size por label
router.put("/sizes/:label", updateSize);

export default router;
