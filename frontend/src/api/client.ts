import { ProductAnalysis } from '../types/product';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';
const DEFAULT_TIMEOUT = 30000; // 30 seconds

interface FetchOptions extends RequestInit {
  timeout?: number;
  retries?: number;
}

// Authentication Helpers
export function setToken(token: string) {
  localStorage.setItem('ecopick_token', token);
}

export function getToken(): string | null {
  return localStorage.getItem('ecopick_token');
}

export function clearToken() {
  localStorage.removeItem('ecopick_token');
  localStorage.removeItem('ecopick_user');
}

export function getAuthHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

// Helper to fetch with timeout and retry logic, injecting Authorization header
async function fetchWithRetry(url: string, options: FetchOptions = {}): Promise<Response> {
  const { timeout = DEFAULT_TIMEOUT, retries = 1, headers, ...fetchOptions } = options;

  let attempt = 0;
  while (attempt <= retries) {
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeout);
      
      const authHeaders = getAuthHeaders();
      const mergedHeaders = {
        ...authHeaders,
        ...headers,
      };

      const response = await fetch(url, {
        ...fetchOptions,
        headers: mergedHeaders,
        signal: controller.signal,
      });
      
      clearTimeout(id);
      
      if (!response.ok) {
        // Don't retry on client errors (4xx)
        if (response.status >= 400 && response.status < 500) {
           return response;
        }
        throw new Error(`Server error: ${response.status}`);
      }
      return response;
    } catch (err: any) {
      if (err.name === 'AbortError') {
        if (attempt === retries) throw new Error('Request timed out. Please try again.');
      } else {
        if (attempt === retries) throw err;
      }
      // Wait before retrying
      await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt)));
      attempt++;
    }
  }
  throw new Error('Request failed');
}

// Auth API Calls
export async function login(email: string, password: string): Promise<{ token: string; user: { name: string; email: string } }> {
  const response = await fetchWithRetry(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
    timeout: 10000,
  });

  if (!response.ok) {
    let errorMsg = 'Failed to log in.';
    try { const d = await response.json(); errorMsg = d.error || errorMsg; } catch (_) {}
    throw new Error(errorMsg);
  }
  const data = await response.json();
  setToken(data.token);
  localStorage.setItem('ecopick_user', JSON.stringify(data.user));
  return data;
}

export async function signup(name: string, email: string, password: string): Promise<{ token: string; user: { name: string; email: string } }> {
  const response = await fetchWithRetry(`${API_BASE}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
    timeout: 10000,
  });

  if (!response.ok) {
    let errorMsg = 'Failed to register.';
    try { const d = await response.json(); errorMsg = d.error || errorMsg; } catch (_) {}
    throw new Error(errorMsg);
  }
  const data = await response.json();
  setToken(data.token);
  localStorage.setItem('ecopick_user', JSON.stringify(data.user));
  return data;
}

// Product Analysis API Calls
export async function analyzeProduct(productDescription: string): Promise<ProductAnalysis> {
  const response = await fetchWithRetry(`${API_BASE}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productDescription }),
    timeout: 60000, // Analysis can take longer
    retries: 2
  });

  if (!response.ok) {
    let errorMsg = 'An unexpected error occurred while analyzing the product.';
    try { const d = await response.json(); errorMsg = d.error || errorMsg; } catch (_) {}
    throw new Error(errorMsg);
  }
  return response.json();
}

export async function chatWithEco(question: string): Promise<string> {
  const response = await fetchWithRetry(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question }),
    timeout: 20000,
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

  const response = await fetchWithRetry(`${API_BASE}/analyze-image`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      imageBase64: base64,
      mimeType: file.type || 'image/jpeg',
      hint,
    }),
    timeout: 60000, // Vision API can be slow
    retries: 1
  });

  if (!response.ok) {
    let errorMsg = 'Image analysis failed. Please try again.';
    try { const d = await response.json(); errorMsg = d.error || errorMsg; } catch (_) {}
    throw new Error(errorMsg);
  }
  return response.json();
}

export async function fetchHistory(): Promise<any[]> {
  const response = await fetchWithRetry(`${API_BASE}/analyze/history`, {
    timeout: 10000,
    retries: 2
  });
  if (!response.ok) {
    let errorMsg = 'Failed to fetch analysis history.';
    try { const d = await response.json(); errorMsg = d.error || errorMsg; } catch (_) {}
    throw new Error(errorMsg);
  }
  return response.json();
}

export async function deleteHistoryItem(id: string): Promise<{ success: boolean }> {
  const response = await fetchWithRetry(`${API_BASE}/analyze/history/${id}`, {
    method: 'DELETE',
    timeout: 10000
  });
  if (!response.ok) {
    let errorMsg = 'Failed to delete history item.';
    try { const d = await response.json(); errorMsg = d.error || errorMsg; } catch (_) {}
    throw new Error(errorMsg);
  }
  return response.json();
}

export async function clearAllHistory(): Promise<{ success: boolean }> {
  const response = await fetchWithRetry(`${API_BASE}/analyze/history`, {
    method: 'DELETE',
    timeout: 15000
  });
  if (!response.ok) {
    let errorMsg = 'Failed to clear history.';
    try { const d = await response.json(); errorMsg = d.error || errorMsg; } catch (_) {}
    throw new Error(errorMsg);
  }
  return response.json();
}
