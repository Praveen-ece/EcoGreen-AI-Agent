import { Router, Response } from 'express';
import { analyzeProduct } from '../services/geminiAgent';
import { AnalysisModel } from '../db/analysisModel';
import { authenticateJWT, AuthRequest } from '../middleware/auth';

const router = Router();

router.post('/', authenticateJWT, async (req: AuthRequest, res: Response) => {
  const { productDescription } = req.body;

  if (!productDescription || typeof productDescription !== 'string' || productDescription.trim() === '') {
    return res.status(400).json({ error: 'Product description is required and must be a non-empty string.' });
  }

  if (productDescription.length > 2000) {
    return res.status(400).json({ error: 'Product description is too long. Please keep it under 2000 characters.' });
  }

  try {
    const analysis = await analyzeProduct(productDescription);

    let dbId: string | undefined = undefined;
    // ── Save to MongoDB (non-blocking — don't fail the request if DB is down) ──
    try {
      const saved = await AnalysisModel.create({
        productDescription:    productDescription.trim(),
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
      console.log(`[MongoDB] Analysis saved ✓ (User: ${req.userId || 'Guest'})`);
    } catch (dbErr: any) {
      console.warn('[MongoDB] Could not save analysis (non-fatal):', dbErr?.message);
    }

    return res.json({
      ...analysis,
      _id: dbId
    });
  } catch (error: any) {
    console.error('[Route /api/analyze] Error:', error?.message || error);
    const msg: string = error?.message || '';

    if (msg.includes('could not be parsed')) return res.status(502).json({ error: 'AI response could not be parsed. Please try again.' });
    if (msg.includes('GEMINI_API_KEY'))      return res.status(500).json({ error: 'Server configuration error: GEMINI_API_KEY is not set.' });
    if (msg.includes('API key'))             return res.status(500).json({ error: 'Invalid Gemini API key. Check your GEMINI_API_KEY in backend/.env' });

    return res.status(500).json({ error: `Analysis failed: ${msg || 'Unknown error.'}` });
  }
});

// GET /api/analyze/history — Retrieve saved analyses for the logged-in user
router.get('/history', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      // Guests don't store history on server
      return res.json([]);
    }
    const analyses = await AnalysisModel.find({ userId: req.userId }).sort({ createdAt: -1 }).limit(50);
    return res.json(analyses);
  } catch (error: any) {
    console.error('[Route GET /api/analyze/history] Error:', error?.message || error);
    return res.status(500).json({ error: 'Failed to fetch analysis history.' });
  }
});

// DELETE /api/analyze/history/:id — Delete a specific analysis record belonging to the user
router.delete('/history/:id', authenticateJWT, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Authentication required.' });
    }
    const result = await AnalysisModel.findOneAndDelete({ _id: id, userId: req.userId });
    if (!result) {
      return res.status(404).json({ error: 'Analysis record not found or not owned by user.' });
    }
    console.log(`[MongoDB] Deleted analysis ${id} ✓`);
    return res.json({ success: true, message: 'Analysis deleted successfully.' });
  } catch (error: any) {
    console.error(`[Route DELETE /api/analyze/history/${id}] Error:`, error?.message || error);
    return res.status(500).json({ error: 'Failed to delete the analysis record.' });
  }
});

// DELETE /api/analyze/history — Clear all history records for the logged-in user
router.delete('/history', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Authentication required.' });
    }
    await AnalysisModel.deleteMany({ userId: req.userId });
    console.log(`[MongoDB] Cleared all history records for user ${req.userId} ✓`);
    return res.json({ success: true, message: 'All history records cleared successfully.' });
  } catch (error: any) {
    console.error('[Route DELETE /api/analyze/history] Error:', error?.message || error);
    return res.status(500).json({ error: 'Failed to clear history.' });
  }
});

export default router;
