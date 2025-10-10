// src/lib/api.ts — legacy helper for vocabulary session APIs

// Use VITE_API_BASE to call a different origin in prod (when frontend + backend are on different domains).
// For local `netlify dev`, leave it empty to use the proxy to http://localhost:8888
const API_BASE = import.meta.env.VITE_API_BASE ?? '';

export type CreateSessionBody = {
  uid: string;
  level: 'N5'|'N4'|'N3'|'N2'|'N1';
  perDay: number;
  topics?: string[];
  ratioDue?: number;
  force?: boolean;
  dateISO?: string;
};

export type VocabItem = {
  id: string;
  jp: string;
  kana?: string;
  romaji?: string;
  meaning: string;
  level: string;
  topic: string;
  subtopics?: string[];
  tags?: string[];
};

export type CreateSessionResponse = {
  dateISO: string;
  meta: Record<string, unknown>;
  wordIds: string[];
  items: VocabItem[];
};

async function parseJSONSafe<T>(res: Response): Promise<T> {
  const txt = await res.text();
  try {
    return JSON.parse(txt) as T;
  } catch {
    throw new Error(`Non-JSON response (${res.status}): ${txt?.slice(0, 400)}`);
  }
}

export async function createOrGetTodaySession(
  body: CreateSessionBody,
  idToken?: string
): Promise<CreateSessionResponse> {
  const url = `${API_BASE}/api/v1/sessions`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`API ${res.status} ${res.statusText}: ${txt?.slice(0, 400)}`);
  }

  return parseJSONSafe<CreateSessionResponse>(res);
}
