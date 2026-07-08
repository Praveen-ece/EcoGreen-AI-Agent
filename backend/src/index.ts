import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import analyzeRouter from './routes/analyze';
import chatRouter from './routes/chat';
import analyzeImageRouter from './routes/analyzeImage';
import { connectMongo } from './db/mongo';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '20mb' }));

// Register API Routes
app.use('/api/analyze', analyzeRouter);
app.use('/api/chat', chatRouter);
app.use('/api/analyze-image', analyzeImageRouter);

// Healthcheck
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(port, async () => {
  await connectMongo();
  console.log(`[EcoPick Backend] Server is running on http://localhost:${port}`);
});
