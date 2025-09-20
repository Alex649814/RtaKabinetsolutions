// backend/api/routes/uploadRoutes.js
import express from 'express';
import { uploadImage, getImagesBySection } from '../controllers/uploadController.js';
import upload from '../middlewares/multerConfig.js'; // <--- importar aquí

const router = express.Router();

router.post('/', upload.single('image'), uploadImage);

router.get('/:section', getImagesBySection);

export default router;

