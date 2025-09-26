// backend/api/routes/carouselRoutes.js
import express from 'express';
import { deleteCarouselImage, saveCarousel, getCarousel } from '../controllers/carouselController.js';
import upload from '../middlewares/multerConfig.js';

const router = express.Router();

// Validar que pageName exista
router.param('pageName', (req, res, next, pageName) => {
  if (!pageName) return res.status(400).json({ message: 'Falta pageName' });
  next();
});

router.post('/:pageName', upload.array('images'), saveCarousel);
router.get('/:pageName', getCarousel);
router.delete('/:pageName/:id', deleteCarouselImage);

export default router;
