import express from 'express';
import uploadRoutes from './routes/uploadRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import sectionRoutes from './routes/sectionRoutes.js';
import carouselRoutes from './routes/carouselRoutes.js';
import galleryRoutes from './routes/galleryRoutes.js';
import productsRoutes from './routes/productsRoutes.js';
import productVariantRoutes from './routes/productVariantRoutes.js'; // ✅ AGREGADO

const router = express.Router();

router.use('/upload', uploadRoutes);
router.use('/contact', contactRoutes);
router.use('/section', sectionRoutes);
router.use('/carousel', carouselRoutes);
router.use('/gallery', galleryRoutes);
router.use('/products', productsRoutes);
router.use('/product-variants', productVariantRoutes); // ✅ AGREGADO

export default router;