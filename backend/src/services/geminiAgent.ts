import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { ECO_SYSTEM_PROMPT } from '../prompts/ecoSystemPrompt';
import { ProductAnalysis } from '../types/product';
import { parseClaudeResponse } from './responseParser';
import dotenv from 'dotenv';

dotenv.config();

// ── Gemini client factory ──────────────────────────────────────────────────────
function getModel(systemInstruction: string): GenerativeModel {
  const apiKey = process.env.GEMINI_API_KEY || '';
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set. Please add it to backend/.env');
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash-8b';
  console.log(`[GeminiAgent] Using model: ${modelName}`);

  return genAI.getGenerativeModel({
    model: modelName,
    systemInstruction,
  });
}

// ── Generate content with error detail ────────────────────────────────────────
async function generateText(model: GenerativeModel, prompt: string): Promise<string> {
  const result = await model.generateContent(prompt);
  const response = result.response;

  // Log finish reason for debugging
  const candidate = response.candidates?.[0];
  if (candidate?.finishReason && candidate.finishReason !== 'STOP') {
    console.warn(`[GeminiAgent] Finish reason: ${candidate.finishReason}`);
  }

  const text = response.text();
  if (!text || text.trim() === '') {
    throw new Error(
      `Gemini returned an empty response. Finish reason: ${candidate?.finishReason ?? 'unknown'}`
    );
  }
  return text;
}

// ── Generate Amazon.in and Flipkart search URLs for a product ─────────────────
function buildShoppingLinks(productName: string): Array<{
  website: string; price: string; availability: string;
  link: string; seller: string; estimatedDelivery: string;
}> {
  const encoded = encodeURIComponent(productName);
  return [
    {
      website: 'Amazon.in',
      price: 'Check on site',
      availability: 'Check on site',
      link: `https://www.amazon.in/s?k=${encoded}&ref=ecopick`,
      seller: 'Amazon.in',
      estimatedDelivery: '2-5 business days',
    },
    {
      website: 'Flipkart',
      price: 'Check on site',
      availability: 'Check on site',
      link: `https://www.flipkart.com/search?q=${encoded}&affid=ecopick`,
      seller: 'Flipkart',
      estimatedDelivery: '3-5 business days',
    },
  ];
}

// ── Web search helper — always returns Amazon.in + Flipkart links ──────────────
async function performWebSearch(query: string): Promise<string> {
  console.log(`[WebSearch] Building Amazon.in + Flipkart links for: "${query}"`);

  // If Tavily is configured, try live search first
  if (process.env.TAVILY_API_KEY) {
    try {
      const response = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: process.env.TAVILY_API_KEY,
          query: `${query} site:amazon.in OR site:flipkart.com`,
          search_depth: 'basic',
          include_answer: false,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.results && data.results.length > 0) {
          return JSON.stringify(data.results);
        }
      }
    } catch (err) {
      console.warn('[WebSearch] Tavily failed, using direct links:', err);
    }
  }

  // Always return Amazon.in + Flipkart direct search links
  return JSON.stringify(buildShoppingLinks(query));
}

// ── ECO Q&A system prompt ─────────────────────────────────────────────────────
const ECO_QA_SYSTEM_PROMPT = `You are EcoPick, an expert sustainability and environmental advisor.
Answer questions about eco-friendly products, carbon footprint reduction, sustainable manufacturing,
waste minimization, recyclability, green shopping, environmental certifications, and climate change.

Guidelines:
- Answer clearly and factually in plain language
- Keep answers concise (3-5 paragraphs or a short bullet list)
- Recommend specific eco-friendly products when the user asks for product suggestions
- Prioritize environmental impact, then quality, then price
- Never fabricate statistics; cite EPA, WWF, or IPCC if needed`;

// ── General eco Q&A ────────────────────────────────────────────────────────────
export async function answerEcoQuestion(question: string): Promise<string> {
  console.log(`[GeminiAgent] Answering eco question...`);
  const model = getModel(ECO_QA_SYSTEM_PROMPT);
  const text = await generateText(model, question);
  return text;
}

// ── Image-based product analysis ──────────────────────────────────────────────
export async function analyzeProductImage(
  imageBase64: string,
  mimeType: string,
  userHint: string
): Promise<ProductAnalysis> {
  console.log(`[GeminiAgent] Analyzing product image (${mimeType})...`);

  const apiKey = process.env.GEMINI_API_KEY || '';
  if (!apiKey) throw new Error('GEMINI_API_KEY is not set.');

  const genAI = new GoogleGenerativeAI(apiKey);
  const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const model = genAI.getGenerativeModel({ model: modelName, systemInstruction: ECO_SYSTEM_PROMPT });

  const shoppingLinks = buildShoppingLinks(userHint || 'eco friendly product');

  const prompt = `The user has uploaded a product image. Please:
1. Identify exactly what product is shown in the image (brand, material, category if visible)
2. Perform a full eco analysis as per your system instructions
3. Recommend eco-friendlier alternatives available on Amazon.in and Flipkart

${userHint ? `User's note about the product: ${userHint}` : ''}

For EVERY alternative, include 2 websiteAvailability entries:
- Amazon.in: https://www.amazon.in/s?k=PRODUCT_NAME
- Flipkart: https://www.flipkart.com/search?q=PRODUCT_NAME

Base shopping links: ${JSON.stringify(shoppingLinks)}

${JSON_ONLY_INSTRUCTION}`;

  let rawText: string;
  try {
    const result = await model.generateContent([
      {
        inlineData: {
          data: imageBase64,
          mimeType: mimeType as 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif',
        },
      },
      prompt,
    ]);
    rawText = result.response.text();
  } catch (err: any) {
    console.error('[GeminiAgent] Image analysis error:', err?.message || err);
    throw new Error(`Gemini API error: ${err?.message || 'Unknown error'}`);
  }

  if (!rawText?.trim()) throw new Error('Gemini returned an empty response for the image.');

  console.log('[GeminiAgent] Image analysis response (first 200):', rawText.slice(0, 200));

  const parsed = parseClaudeResponse(rawText);

  // Guarantee Amazon.in + Flipkart links on every alternative
  parsed.alternatives = parsed.alternatives.map(alt => {
    const links = buildShoppingLinks(alt.productName);
    const hasAmazon = alt.websiteAvailability.some(w => w.website.toLowerCase().includes('amazon'));
    const hasFlipkart = alt.websiteAvailability.some(w => w.website.toLowerCase().includes('flipkart'));
    if (!hasAmazon) alt.websiteAvailability.push(links[0]);
    if (!hasFlipkart) alt.websiteAvailability.push(links[1]);
    alt.websiteAvailability = alt.websiteAvailability.filter(w =>
      w.website.toLowerCase().includes('amazon') || w.website.toLowerCase().includes('flipkart')
    );
    return alt;
  });

  return parsed;
}

// ── Strict JSON instruction appended to every product analysis prompt ──────────
const JSON_ONLY_INSTRUCTION = `

CRITICAL: Your entire response must be ONLY a valid JSON object. 
Do NOT include any text before or after the JSON.
Do NOT wrap it in markdown code blocks or backticks.
Start your response with { and end with }.`;

// ── Product analysis ──────────────────────────────────────────────────────────
export async function analyzeProduct(productDescription: string): Promise<ProductAnalysis> {
  console.log(`[GeminiAgent] Analyzing product...`);

  // Build Amazon.in + Flipkart search links for the original product query
  const shoppingLinks = buildShoppingLinks(productDescription);

  const prompt = `Product Details / Description: ${productDescription}

IMPORTANT INSTRUCTIONS FOR websiteAvailability:
For EVERY alternative product you recommend, you MUST include exactly 2 entries in websiteAvailability:
1. Amazon.in — use this URL format: https://www.amazon.in/s?k=PRODUCT_NAME_URL_ENCODED
2. Flipkart — use this URL format: https://www.flipkart.com/search?q=PRODUCT_NAME_URL_ENCODED

Replace PRODUCT_NAME_URL_ENCODED with the actual eco-friendly alternative product name, URL-encoded (spaces become +).

Example for "Bamboo Water Bottle":
- Amazon.in: https://www.amazon.in/s?k=Bamboo+Water+Bottle
- Flipkart: https://www.flipkart.com/search?q=Bamboo+Water+Bottle

Set price to "Check on site", availability to "Check on site", seller to the platform name, estimatedDelivery to "2-5 business days".

Base shopping links for the original product:
${JSON.stringify(shoppingLinks, null, 2)}

Analyze this product and respond with the JSON object as specified in your system instructions.${JSON_ONLY_INSTRUCTION}`;

  const model = getModel(ECO_SYSTEM_PROMPT);

  let rawText: string;
  try {
    rawText = await generateText(model, prompt);
  } catch (err: any) {
    console.error('[GeminiAgent] Gemini API error:', err?.message || err);
    throw new Error(`Gemini API error: ${err?.message || 'Unknown error'}`);
  }

  console.log('[GeminiAgent] Raw response (first 200 chars):', rawText.slice(0, 200));

  const parsed = parseClaudeResponse(rawText);

  // Post-process: ensure every alternative has Amazon.in + Flipkart links
  parsed.alternatives = parsed.alternatives.map(alt => {
    const hasAmazon = alt.websiteAvailability.some(w =>
      w.website.toLowerCase().includes('amazon')
    );
    const hasFlipkart = alt.websiteAvailability.some(w =>
      w.website.toLowerCase().includes('flipkart')
    );

    const generatedLinks = buildShoppingLinks(alt.productName);

    if (!hasAmazon) {
      alt.websiteAvailability.push(generatedLinks[0]); // Amazon.in
    }
    if (!hasFlipkart) {
      alt.websiteAvailability.push(generatedLinks[1]); // Flipkart
    }

    // Keep only Amazon.in and Flipkart entries
    alt.websiteAvailability = alt.websiteAvailability.filter(w =>
      w.website.toLowerCase().includes('amazon') ||
      w.website.toLowerCase().includes('flipkart')
    );

    return alt;
  });

  return parsed;
}
