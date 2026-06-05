export interface ApiRequestConfig {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  data?: unknown;
}

// Use the Vite proxy path in development; vite.config.ts forwards /api to the backend target.
const API_BASE_URL = '/api';

async function readErrorMessage(response: Response): Promise<string> {
  const contentType = response.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) {
    try {
      const body = (await response.json()) as { message?: string; error?: string };
      return body.message ?? body.error ?? 'Something went wrong while calling the API.';
    } catch {
      return 'Something went wrong while calling the API.';
    }
  }

  const text = await response.text();
  return text || 'Something went wrong while calling the API.';
}

// Simple fetch wrapper so page components can stay clean and readable.
export async function apiFetch<T>(config: ApiRequestConfig): Promise<T> {
  const { url, method = 'GET', headers = {}, data } = config;
  const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;

  const response = await fetch(`${API_BASE_URL}${url}`, {
    method,
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...headers,
    },
    body: data === undefined ? undefined : isFormData ? (data as FormData) : JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  return (await response.json()) as T;
}
