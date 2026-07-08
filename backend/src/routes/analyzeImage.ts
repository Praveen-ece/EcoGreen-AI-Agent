import { Router, Request, Response } from 'express';
import { analyzeProductImage } from '../services/geminiAgent';

const router = Router();

// POST /api/analyze-image
// Accepts multipart/form-data with field "image" (file) and optional "hint" (text)
// Uses raw body parsing — client sends base64 JSON body for simplicity
router.post('/', async (req: Request, res: Response) => {
  const { imageBase64, mimeType, hint } = req.body;

  if (!imageBase64 || typeof imageBase64 !== 'string') {
    return res.status(400).json({ error: 'imageBase64 is required.' });
  }
  if (!mimeType || typeof mimeType !== 'string') {
    return res.status(400).json({ error: 'mimeType is required (e.g. image/jpeg).' });
  }

  try {
    const analysis = await analyzeProductImage(
      imageBase64,
      mimeType,
      typeof hint === 'string' ? hint : ''
    );
    return res.json(analysis);
  } catch (error: any) {
    console.error('[Route /api/analyze-image] Error:', error?.message || error);
    const msg: string = error?.message || '';

    if (msg.includes('GEMINI_API_KEY')) {
      return res.status(500).json({ error: 'Server configuration error: GEMINI_API_KEY is not set.' });
    }
    if (msg.includes('API key') || msg.includes('API_KEY_INVALID')) {
      return res.status(500).json({ error: 'Invalid Gemini API key.' });
    }
    if (msg.includes('could not be parsed')) {
      return res.status(502).json({ error: 'AI response could not be parsed. Please try again.' });
    }
    return res.status(500).json({
      error: `Image analysis failed: ${msg || 'Unknown error. Check backend console.'}`,
    });
  }
});

export default router;
