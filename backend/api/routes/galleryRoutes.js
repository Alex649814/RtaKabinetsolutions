import express from 'express';
import upload from '../middlewares/multerConfig.js';
import { getGallerySection, saveGallerySection, deleteGalleryImage } from '../controllers/galleryController.js';

const router = express.Router();

router.param('pageName', (req, res, next, pageName) => {
  if (!pageName) return res.status(400).json({ message: 'Falta pageName' });
  next();
});

router.param('sectionName', (req, res, next, sectionName) => {
  if (!sectionName) return res.status(400).json({ message: 'Falta sectionName' });
  next();
});

router.get('/:pageName/:sectionName', getGallerySection);
router.post('/:pageName/:sectionName', upload.array('images'), saveGallerySection);
router.delete('/:pageName/:sectionName/:id', deleteGalleryImage);

export default router;