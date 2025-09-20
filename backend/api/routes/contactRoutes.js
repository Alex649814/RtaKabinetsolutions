import express  from 'express';
import { saveContactForm } from '../controllers/contactController.js';

const router = express.Router();

router.post('/', saveContactForm);

export default router;
