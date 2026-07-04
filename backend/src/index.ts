import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import analyzeRouter from './routes/analyze';
import chatRouter from './routes/chat';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Enable CORS for frontend running on dev port 5173
app.use(cors({
  origin: '*', // For development, allow requests from any client
}));

app.use(express.json());

// Register API Routes
app.use('/api/analyze', analyzeRouter);
app.use('/api/chat', chatRouter);

// Healthcheck
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(port, () => {
  console.log(`[EcoPick Backend] Server is running on http://localhost:${port}`);
});
