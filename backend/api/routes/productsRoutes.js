import express from 'express';
import multer from 'multer';
import { getProducts, saveProduct, deleteProduct, modifyProduct, getFullProductById } from '../controllers/productsController.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/', upload.single('image'), saveProduct);
router.get('/', getProducts);
router.delete('/:id', deleteProduct);
router.put('/:id', upload.single('image'), modifyProduct);
router.get('/full/:id', getFullProductById);

export default router;