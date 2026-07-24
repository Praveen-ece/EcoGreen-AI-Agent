import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import analyzeRouter from './routes/analyze';
import chatRouter from './routes/chat';
import analyzeImageRouter from './routes/analyzeImage';
import authRouter from './routes/auth';
import { connectMongo } from './db/mongo';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Enable trust proxy if behind a load balancer
app.set('trust proxy', 1);

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '20mb' }));

// Global Rate Limiter: max 100 requests per 15 minutes per IP
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100,
  message: { error: 'Too many requests from this IP, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', globalLimiter);

// Request Logging Middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Register API Routes
app.use('/api/auth', authRouter);
app.use('/api/analyze', analyzeRouter);
app.use('/api/chat', chatRouter);
app.use('/api/analyze-image', analyzeImageRouter);

// Healthcheck
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[Global Error]', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

const server = app.listen(port, async () => {
  await connectMongo();
  console.log(`[EcoPick Backend] Server is running on http://localhost:${port}`);
});

// Graceful Shutdown
const shutdown = () => {
  console.log('\n[EcoPick Backend] Shutting down gracefully...');
  server.close(() => {
    console.log('[EcoPick Backend] Server closed.');
    process.exit(0);
  });
  
  // Force close after 10s
  setTimeout(() => {
    console.error('[EcoPick Backend] Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
