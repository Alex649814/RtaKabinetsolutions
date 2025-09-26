import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import routes from './api/index.js';
import optionsRoutes from './api/routes/optionsRoutes.js';
import productVariantRoutes from './api/routes/productVariantRoutes.js';
import { fileURLToPath } from 'url';
import authRoutes from './api/routes/authRoutes.js';

dotenv.config();
const app = express();

// __dirname ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- CORS ---
const isProd = process.env.NODE_ENV === 'production';

// Puedes definir una lista por coma (opcional) ej: "https://rtakabinetssolutions.com,https://www.rtakabinetssolutions.com"
const fromList = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

console.log("✅ Allowed Origins:", allowedOrigins);

const corsOptions = {
  origin(origin, cb) {
    if (!origin) return cb(null, true); // curl/Postman
    if (allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error('CORS_NOT_ALLOWED'));
  },
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
  credentials: true,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // preflight

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rutas
app.use('/api', authRoutes);
app.use('/api/options', optionsRoutes);
app.use('/api/product_variants', productVariantRoutes);
app.use('/api', routes);

// Healthcheck
app.get('/health', (req, res) => res.status(200).json({ ok: true }));

// Archivos estáticos
app.use('/uploads', express.static(path.join(__dirname, 'api', 'uploads')));

// Manejo de error CORS (responde 403 en lugar de crash)
app.use((err, req, res, next) => {
  if (err && err.message === 'CORS_NOT_ALLOWED') {
    return res.status(403).json({ error: 'CORS blocked', origin: req.headers.origin });
  }
  next(err);
});

// Puerto
const PORT = process.env.PORT || 5000;
app.listen(process.env.PORT || 3000, '0.0.0.0', () => {
  console.log(`API listening on 0.0.0.0:${process.env.PORT || 3000}`);
});