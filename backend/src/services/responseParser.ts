import { ProductAnalysis, Alternative, CarbonFootprint } from '../types/product';

function extractJson(rawText: string): string {
  let text = rawText.trim();
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) return fenceMatch[1].trim();
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return text.slice(firstBrace, lastBrace + 1).trim();
  }
  return text;
}

function toCarbon(val: unknown): CarbonFootprint {
  if (val === 'LOW' || val === 'MEDIUM' || val === 'HIGH') return val;
  return 'MEDIUM';
}

export function parseGeminiResponse(rawText: string): ProductAnalysis {
  const cleaned = extractJson(rawText);

  try {
    const parsed = JSON.parse(cleaned);
    const analysis = parsed.productAnalysis || {};

    const productAnalysisNormalized = {
      product:                  String(analysis.product || ''),
      category:                 String(analysis.category || ''),
      material:                 String(analysis.material || ''),
      estimatedCarbonFootprint: toCarbon(analysis.estimatedCarbonFootprint),
      carbonFootprintKg:        Number(analysis.carbonFootprintKg ?? 0),
      sustainabilityScore:      Number(analysis.sustainabilityScore ?? 50),
      environmentalConcerns:    Array.isArray(analysis.environmentalConcerns)
                                  ? analysis.environmentalConcerns.map(String)
                                  : [],
    };

    const alternativesNormalized: Alternative[] = (
      Array.isArray(parsed.alternatives) ? parsed.alternatives : []
    ).map((alt: any) => {
      const websiteAvailabilityNormalized = (
        Array.isArray(alt.websiteAvailability) ? alt.websiteAvailability : []
      ).map((web: any) => ({
        website:          String(web.website || ''),
        price:            String(web.price || ''),
        availability:     String(web.availability || ''),
        link:             String(web.link || ''),
        seller:           String(web.seller || ''),
        estimatedDelivery:String(web.estimatedDelivery || ''),
      }));

      return {
        productName:              String(alt.productName || ''),
        estimatedCarbonFootprint: toCarbon(alt.estimatedCarbonFootprint),
        carbonFootprintKg:        Number(alt.carbonFootprintKg ?? 0),
        material:                 String(alt.material || ''),
        manufacturingCountry:     String(alt.manufacturingCountry || ''),
        estimatedShippingImpact:  String(alt.estimatedShippingImpact || ''),
        packagingType:            String(alt.packagingType || ''),
        recyclability:            String(alt.recyclability || ''),
        durability:               String(alt.durability || ''),
        averagePrice:             String(alt.averagePrice || ''),
        customerRating:           String(alt.customerRating || ''),
        availability:             String(alt.availability || ''),
        websiteAvailability:      websiteAvailabilityNormalized,
        reasonForRecommendation:  String(alt.reasonForRecommendation || ''),
      };
    });

    // Sort: lowest carbon emissions first, then highest rating
    const footprintScore: Record<CarbonFootprint, number> = { LOW: 1, MEDIUM: 2, HIGH: 3 };
    alternativesNormalized.sort((a, b) => {
      const carbonDiff = footprintScore[a.estimatedCarbonFootprint] - footprintScore[b.estimatedCarbonFootprint];
      if (carbonDiff !== 0) return carbonDiff;
      // Secondary: lower kg is better
      if (a.carbonFootprintKg !== b.carbonFootprintKg) return a.carbonFootprintKg - b.carbonFootprintKg;
      return (parseFloat(b.customerRating) || 0) - (parseFloat(a.customerRating) || 0);
    });

    return {
      productAnalysis: productAnalysisNormalized,
      alternatives:    alternativesNormalized,
      bestChoice: {
        productName: String(parsed.bestChoice?.productName || ''),
        explanation: String(parsed.bestChoice?.explanation || ''),
      },
      greenShoppingTips: Array.isArray(parsed.greenShoppingTips)
        ? parsed.greenShoppingTips.map(String)
        : [
            'Buy only when needed.',
            'Choose durable products.',
            'Prefer local sellers.',
            'Use standard shipping instead of express delivery.',
            'Choose recyclable packaging.',
            'Reuse products whenever possible.',
          ],
      dataDisclaimer: String(
        parsed.dataDisclaimer ||
          "Live product data is unavailable. Please verify the latest information on the seller's website."
      ),
    };
  } catch (error) {
    console.error('[ResponseParser] Failed to parse AI JSON response.');
    console.error('[ResponseParser] Cleaned text:\n', cleaned);
    throw new Error('AI response could not be parsed into the expected JSON format.');
  }
}

export const parseClaudeResponse = parseGeminiResponse;
