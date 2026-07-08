import { ProductAnalysis } from '../types/product';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

export async function analyzeProduct(productDescription: string): Promise<ProductAnalysis> {
  const response = await fetch(`${API_BASE}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productDescription }),
  });

  if (!response.ok) {
    let errorMsg = 'An unexpected error occurred while analyzing the product.';
    try { const d = await response.json(); errorMsg = d.error || errorMsg; } catch (_) {}
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
    try { const d = await response.json(); errorMsg = d.error || errorMsg; } catch (_) {}
    throw new Error(errorMsg);
  }
  const data = await response.json();
  return data.answer as string;
}

// ── Image analysis — converts File to base64 and sends to backend ─────────────
export async function analyzeProductImage(
  file: File,
  hint: string
): Promise<ProductAnalysis> {
  // Read file as base64
  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Strip data URL prefix: "data:image/jpeg;base64,..."
      resolve(result.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const response = await fetch(`${API_BASE}/analyze-image`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      imageBase64: base64,
      mimeType: file.type || 'image/jpeg',
      hint,
    }),
  });

  if (!response.ok) {
    let errorMsg = 'Image analysis failed. Please try again.';
    try { const d = await response.json(); errorMsg = d.error || errorMsg; } catch (_) {}
    throw new Error(errorMsg);
  }
  return response.json();
}

export async function fetchHistory(): Promise<any[]> {
  const response = await fetch(`${API_BASE}/analyze/history`);
  if (!response.ok) {
    let errorMsg = 'Failed to fetch analysis history.';
    try { const d = await response.json(); errorMsg = d.error || errorMsg; } catch (_) {}
    throw new Error(errorMsg);
  }
  return response.json();
}

export async function deleteHistoryItem(id: string): Promise<{ success: boolean }> {
  const response = await fetch(`${API_BASE}/analyze/history/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    let errorMsg = 'Failed to delete history item.';
    try { const d = await response.json(); errorMsg = d.error || errorMsg; } catch (_) {}
    throw new Error(errorMsg);
  }
  return response.json();
}

export async function clearAllHistory(): Promise<{ success: boolean }> {
  const response = await fetch(`${API_BASE}/analyze/history`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    let errorMsg = 'Failed to clear history.';
    try { const d = await response.json(); errorMsg = d.error || errorMsg; } catch (_) {}
    throw new Error(errorMsg);
  }
  return response.json();
}

