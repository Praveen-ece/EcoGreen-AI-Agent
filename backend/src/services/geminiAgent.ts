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
  const modelName = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
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

// ── Web search helper (Tavily or mock fallback) ────────────────────────────────
async function performWebSearch(query: string): Promise<string> {
  console.log(`[WebSearch] Querying: "${query}"`);

  if (process.env.TAVILY_API_KEY) {
    try {
      const response = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: process.env.TAVILY_API_KEY,
          query,
          search_depth: 'basic',
          include_answer: false,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        return JSON.stringify(data.results || data);
      }
    } catch (err) {
      console.warn('[WebSearch] Tavily failed, using mock fallback:', err);
    }
  }

  // Smart keyword-based mock fallback
  const lowerQuery = query.toLowerCase();
  const mockDb = [
    {
      keywords: ['water bottle', 'flask', 'bottle', 'cup', 'tumbler', 'thermos'],
      results: [
        { website: 'IKEA', price: '$12.99', availability: 'In Stock', link: 'https://www.ikea.com/us/en/p/enkelsparing-water-bottle-stainless-steel-40529573/', seller: 'IKEA US', estimatedDelivery: '3-5 business days' },
        { website: 'Amazon', price: '$18.50', availability: 'In Stock', link: 'https://www.amazon.com/s?k=stainless+steel+water+bottle', seller: 'EcoLife Goods', estimatedDelivery: '2 business days' },
        { website: 'Decathlon', price: '$15.00', availability: 'In Stock', link: 'https://www.decathlon.com/products/hiking-stainless-steel-mh500-08l', seller: 'Decathlon', estimatedDelivery: '4 business days' },
      ],
    },
    {
      keywords: ['t-shirt', 'shirt', 'clothing', 'tee', 'cotton', 'apparel', 'fashion', 'top'],
      results: [
        { website: 'Organic Basics', price: '$35.00', availability: 'In Stock', link: 'https://organicbasics.com/products/mens-cotton-tee', seller: 'Organic Basics', estimatedDelivery: '5-7 business days' },
        { website: 'Amazon', price: '$22.00', availability: 'In Stock', link: 'https://www.amazon.com/s?k=organic+cotton+t-shirt', seller: 'GreenWear Co.', estimatedDelivery: '3 business days' },
      ],
    },
    {
      keywords: ['toothbrush', 'bamboo', 'oral', 'dental', 'brush'],
      results: [
        { website: 'Amazon', price: '$7.99 (4-Pack)', availability: 'In Stock', link: 'https://www.amazon.com/s?k=bamboo+toothbrush', seller: 'EcoBrush Lab', estimatedDelivery: '2 business days' },
      ],
    },
    {
      keywords: ['bag', 'tote', 'canvas', 'carry', 'shopping'],
      results: [
        { website: 'IKEA', price: '$2.99', availability: 'In Stock', link: 'https://www.ikea.com/us/en/p/skynke-carrier-bag-patterned-90480838/', seller: 'IKEA', estimatedDelivery: '3 business days' },
      ],
    },
    {
      keywords: ['shoe', 'sneaker', 'boot', 'footwear', 'running'],
      results: [
        { website: 'Allbirds', price: '$98.00', availability: 'In Stock', link: 'https://www.allbirds.com/products/mens-tree-runners', seller: 'Allbirds', estimatedDelivery: '5-7 business days' },
        { website: 'Amazon', price: '$65.00', availability: 'In Stock', link: 'https://www.amazon.com/s?k=eco+friendly+running+shoes', seller: 'EcoStep', estimatedDelivery: '3 business days' },
      ],
    },
  ];

  for (const entry of mockDb) {
    if (entry.keywords.some((k) => lowerQuery.includes(k))) {
      return JSON.stringify(entry.results);
    }
  }

  return JSON.stringify([
    { website: 'Amazon', price: 'See site', availability: 'In Stock', link: 'https://www.amazon.com/s?k=' + encodeURIComponent(query), seller: 'Various Eco Sellers', estimatedDelivery: '3-5 business days' },
  ]);
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

// ── Strict JSON instruction appended to every product analysis prompt ──────────
const JSON_ONLY_INSTRUCTION = `

CRITICAL: Your entire response must be ONLY a valid JSON object. 
Do NOT include any text before or after the JSON.
Do NOT wrap it in markdown code blocks or backticks.
Start your response with { and end with }.`;

// ── Product analysis ──────────────────────────────────────────────────────────
export async function analyzeProduct(productDescription: string): Promise<ProductAnalysis> {
  console.log(`[GeminiAgent] Analyzing product...`);

  const searchResults = await performWebSearch(productDescription);

  const prompt = `Product Details / Description: ${productDescription}

Web search results for pricing and availability (use these to fill websiteAvailability fields):
${searchResults}

Analyze this product and respond with the JSON object as specified in your system instructions.${JSON_ONLY_INSTRUCTION}`;

  const model = getModel(ECO_SYSTEM_PROMPT);

  let rawText: string;
  try {
    rawText = await generateText(model, prompt);
  } catch (err: any) {
    console.error('[GeminiAgent] Gemini API error:', err?.message || err);
    // Surface the actual Gemini error message
    throw new Error(`Gemini API error: ${err?.message || 'Unknown error'}`);
  }

  console.log('[GeminiAgent] Raw response (first 200 chars):', rawText.slice(0, 200));

  return parseClaudeResponse(rawText);
}
