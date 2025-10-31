import type { ApiError } from '@/lib/api/types';
import { getIdToken } from '@/lib/auth/getIdToken';

const ABSOLUTE_PATTERN = /^https?:\/\//i;
const API_MODE = (import.meta.env.VITE_API_MODE ?? 'prod').toLowerCase();
// In local mode we rely on Vite's dev proxy to forward /.netlify/functions → http://localhost:8888
const API_BASE = API_MODE === 'local'
  ? ''
  : (import.meta.env.VITE_API_BASE ?? '').replace(/\/$/, '');
const FUNCTIONS_PREFIX = '/.netlify/functions';

function resolveUrl(path: string): string {
  if (ABSOLUTE_PATTERN.test(path)) return path;
  const withLeadingSlash = path.startsWith('/') ? path : `/${path}`;
  const finalPath = withLeadingSlash.startsWith(FUNCTIONS_PREFIX)
    ? withLeadingSlash
    : `${FUNCTIONS_PREFIX}${withLeadingSlash}`;
  return `${API_BASE}${finalPath}`;
}

async function parseResponse<T>(res: Response): Promise<T> {
  const text = await res.text();
  if (!text) {
    return undefined as T;
  }
  try {
    return JSON.parse(text) as T;
  } catch (cause) {
    const error: ApiError = {
      status: res.status,
      message: 'Failed to parse response payload',
      code: 'parse-error',
      cause,
    };
    throw error;
  }
}

function buildError(status: number, body: unknown, fallback: string): ApiError {
  if (body && typeof body === 'object') {
    const maybe = body as Record<string, any>;
    const message = typeof maybe.message === 'string' ? maybe.message : fallback;
    const code = typeof maybe.code === 'string' ? maybe.code : undefined;
    return { status, code, message };
  }
  return { status, message: fallback };
}

function isNetworkError(error: unknown): boolean {
  return !!error && typeof error === 'object' && ('name' in error) && (error as any).name === 'TypeError';
}

async function performFetch<T>(url: string, init?: RequestInit, retry = true): Promise<T> {
  const token = await getIdToken();
  const headers = new Headers(init?.headers ?? {});
  headers.set('Authorization', `Bearer ${token}`);
  if (!headers.has('Accept')) headers.set('Accept', 'application/json');
  const requestInit: RequestInit = {
    ...init,
    headers,
  };

  let response: Response;
  try {
    response = await fetch(url, requestInit);
  } catch (error) {
    if (retry && isNetworkError(error)) {
      return performFetch<T>(url, init, false);
    }
    const apiError: ApiError = {
      code: 'network',
      message: friendlyMessage(error),
      cause: error,
    };
    throw apiError;
  }

  if (!response.ok) {
    let body: unknown;
    try {
      body = await response.clone().json();
    } catch {
      body = undefined;
    }
    const error = buildError(response.status, body, response.statusText || 'Request failed');
    throw error;
  }

  return parseResponse<T>(response);
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const url = resolveUrl(path);
  return performFetch<T>(url, init);
}

export function friendlyMessage(error: unknown): string {
  if (!error) return 'Unexpected error';
  if (typeof error === 'string') return error;
  if (typeof error === 'number') return `Error ${error}`;
  if (typeof error === 'object') {
    const err = error as Partial<ApiError> & { message?: string };
    if (err.message) return err.message;
  }
  return 'Something went wrong. Please try again.';
}
