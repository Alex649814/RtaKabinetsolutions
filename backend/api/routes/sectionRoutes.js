import express from 'express';
import { getSection, saveSection } from '../controllers/sectionController.js';
import upload from '../middlewares/multerConfig.js';

const router = express.Router();

router.get('/:pageName/:sectionName', getSection);
router.post('/:pageName/:sectionName', upload.single('image'), saveSection);


export default router;