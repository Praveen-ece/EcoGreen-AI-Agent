import { Router, Request, Response } from 'express';
import { answerEcoQuestion } from '../services/geminiAgent';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  const { question } = req.body;

  if (!question || typeof question !== 'string' || question.trim() === '') {
    return res.status(400).json({ error: 'Question is required and must be a non-empty string.' });
  }

  if (question.length > 500) {
    return res.status(400).json({ error: 'Question is too long. Please keep it under 500 characters.' });
  }

  try {
    const answer = await answerEcoQuestion(question.trim());
    return res.json({ answer });
  } catch (error: any) {
    console.error('[Route /api/chat] Error:', error?.message || error);

    const errorMessage: string = error?.message || '';
    if (errorMessage.includes('GEMINI_API_KEY')) {
      return res.status(500).json({ error: 'Server configuration error: GEMINI_API_KEY is not set.' });
    }
    if (errorMessage.includes('API_KEY_INVALID') || errorMessage.includes('API key')) {
      return res.status(500).json({ error: 'Invalid Gemini API key. Please check your GEMINI_API_KEY in backend/.env' });
    }

    return res.status(500).json({
      error: `Chat failed: ${errorMessage || 'Unknown error. Check backend console for details.'}`,
    });
  }
});

export default router;
