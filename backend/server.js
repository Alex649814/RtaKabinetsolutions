import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import routes from './api/index.js';
import optionsRoutes from './api/routes/optionsRoutes.js';
import productVariantRoutes from './api/routes/productVariantRoutes.js';
import { fileURLToPath } from 'url';
import authRoutes from './api/routes/authRoutes.js'
dotenv.config();
const app = express();

// Convertir __filename y __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const allowedOrigins = [
  process.env.FRONTEND_URL,                      // p.ej. https://dominio.com
  process.env.FRONTEND_URL_WWW,                  // p.ej. https://www.dominio.com
  'http://localhost:5173',                       // Vite dev
  'http://127.0.0.1:5173'
].filter(Boolean);

const corsOptions = {
  origin(origin, cb) {
    // permitir peticiones de herramientas sin 'origin' (curl/healthchecks) y de orígenes permitidos
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error(`CORS bloqueado para: ${origin}`));
  },
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
  credentials: true,
};

// Middlewares
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // preflight
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rutas
app.use('/api', authRoutes);
app.use('/api/options', optionsRoutes);
app.use('/api/product_variants', productVariantRoutes);  // aquí está bien
app.use('/api', routes);  // aquí ya se incluye /products desde index.js

// Archivos estáticos
app.use('/uploads', express.static(path.join(__dirname, 'api', 'uploads')));

// Puerto
const PORT = process.env.PORT || 5000;  // Usar el nuevo puerto interno
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
});