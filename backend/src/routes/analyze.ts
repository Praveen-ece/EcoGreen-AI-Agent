import { Router, Request, Response } from 'express';
import { analyzeProduct } from '../services/geminiAgent';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  const { productDescription } = req.body;

  if (!productDescription || typeof productDescription !== 'string' || productDescription.trim() === '') {
    return res.status(400).json({ error: 'Product description is required and must be a non-empty string.' });
  }

  try {
    const analysis = await analyzeProduct(productDescription);
    return res.json(analysis);
  } catch (error: any) {
    console.error('[Route /api/analyze] Error:', error?.message || error);

    const errorMessage: string = error?.message || '';
    if (errorMessage.includes('could not be parsed')) {
      return res.status(502).json({ error: 'AI response could not be parsed. Please try again.' });
    }
    if (errorMessage.includes('GEMINI_API_KEY')) {
      return res.status(500).json({ error: 'Server configuration error: GEMINI_API_KEY is not set.' });
    }
    if (errorMessage.includes('API_KEY_INVALID') || errorMessage.includes('API key')) {
      return res.status(500).json({ error: 'Invalid Gemini API key. Please check your GEMINI_API_KEY in backend/.env' });
    }

    return res.status(500).json({
      error: `Analysis failed: ${errorMessage || 'Unknown error. Check backend console for details.'}`,
    });
  }
});

export default router;
