import { Router, Response } from 'express';
import { analyzeProductImage } from '../services/geminiAgent';
import { AnalysisModel } from '../db/analysisModel';
import { authenticateJWT, AuthRequest } from '../middleware/auth';

const router = Router();

// POST /api/analyze-image
// Accepts JSON body with imageBase64, mimeType, and optional hint
router.post('/', authenticateJWT, async (req: AuthRequest, res: Response) => {
  const { imageBase64, mimeType, hint } = req.body;

  if (!imageBase64 || typeof imageBase64 !== 'string') {
    return res.status(400).json({ error: 'imageBase64 is required.' });
  }
  if (!mimeType || typeof mimeType !== 'string') {
    return res.status(400).json({ error: 'mimeType is required (e.g. image/jpeg).' });
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
  if (!allowedTypes.includes(mimeType)) {
    return res.status(400).json({ error: 'Unsupported image type. Please use JPEG, PNG, or WebP.' });
  }

  // base64 size check ~5MB limit (5MB = ~7MB in base64, let's say 10MB to be safe)
  if (imageBase64.length > 10 * 1024 * 1024) {
    return res.status(400).json({ error: 'Image is too large. Max size is roughly 5MB.' });
  }

  try {
    const analysis = await analyzeProductImage(
      imageBase64,
      mimeType,
      typeof hint === 'string' ? hint : ''
    );

    let dbId: string | undefined = undefined;
    // ── Save to MongoDB (non-blocking) ──
    try {
      const saved = await AnalysisModel.create({
        productDescription:    hint ? `Image Upload: ${hint.trim()}` : 'Image Upload',
        productName:           analysis.productAnalysis.product,
        category:              analysis.productAnalysis.category,
        material:              analysis.productAnalysis.material,
        carbonFootprint:       analysis.productAnalysis.estimatedCarbonFootprint,
        carbonFootprintKg:     analysis.productAnalysis.carbonFootprintKg,
        sustainabilityScore:   analysis.productAnalysis.sustainabilityScore,
        environmentalConcerns: analysis.productAnalysis.environmentalConcerns,
        alternativesCount:     analysis.alternatives.length,
        bestChoiceProduct:     analysis.bestChoice.productName,
        userId:                req.userId || null,
        rawAnalysis:           analysis,
      });
      dbId = saved._id.toString();
      console.log(`[MongoDB] Image analysis saved ✓ (User: ${req.userId || 'Guest'})`);
    } catch (dbErr: any) {
      console.warn('[MongoDB] Could not save image analysis (non-fatal):', dbErr?.message);
    }

    return res.json({
      ...analysis,
      _id: dbId
    });
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
