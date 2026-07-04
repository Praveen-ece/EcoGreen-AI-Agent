import { ProductAnalysis } from '../types/product';

const API_BASE = 'http://localhost:5000/api';

export async function analyzeProduct(productDescription: string): Promise<ProductAnalysis> {
  const response = await fetch(`${API_BASE}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productDescription }),
  });

  if (!response.ok) {
    let errorMsg = 'An unexpected error occurred while analyzing the product.';
    try {
      const errData = await response.json();
      errorMsg = errData.error || errorMsg;
    } catch (_) {}
    throw new Error(errorMsg);
  }

  return response.json();
}

export async function chatWithEco(question: string): Promise<string> {
  const response = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question }),
  });

  if (!response.ok) {
    let errorMsg = 'An unexpected error occurred. Please try again.';
    try {
      const errData = await response.json();
      errorMsg = errData.error || errorMsg;
    } catch (_) {}
    throw new Error(errorMsg);
  }

  const data = await response.json();
  return data.answer as string;
}
