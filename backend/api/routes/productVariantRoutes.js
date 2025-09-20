import express from 'express';
import { createProductVariant, getProductVariants, getAllProductVariants } from '../controllers/productVariantController.js';

const router = express.Router();

router.post("/", createProductVariant);
router.get("/", getProductVariants);
router.get('/admin/all', getAllProductVariants);

export default router;