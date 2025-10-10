import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { apiFetch } from '@/lib/api/http';

vi.mock('@/lib/auth/getIdToken', () => ({
  getIdToken: vi.fn(() => Promise.resolve('test-token')),
}));

const mockFetch = vi.fn();

beforeEach(() => {
  mockFetch.mockReset();
  // @ts-expect-error – override global fetch for tests
  global.fetch = mockFetch;
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('apiFetch', () => {
  it('resolves JSON payload on success', async () => {
    const payload = { ok: true };
    mockFetch.mockResolvedValue(new Response(JSON.stringify(payload), { status: 200 }));

    const result = await apiFetch<typeof payload>('/example');

    expect(result).toEqual(payload);
    const [url, init] = mockFetch.mock.calls[0];
    expect(url).toMatch('/.netlify/functions/example');
    expect(new Headers(init?.headers).get('Authorization')).toBe('Bearer test-token');
  });

  it('retries once on network error', async () => {
    const payload = { value: 1 };
    mockFetch
      .mockRejectedValueOnce(new TypeError('network'))
      .mockResolvedValueOnce(new Response(JSON.stringify(payload), { status: 200 }));

    const result = await apiFetch<typeof payload>('/retry');

    expect(result).toEqual(payload);
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('throws ApiError on non-2xx response', async () => {
    mockFetch.mockResolvedValue(
      new Response(JSON.stringify({ message: 'Bad request', code: 'bad' }), { status: 400 })
    );

    await expect(apiFetch('/error')).rejects.toMatchObject({
      status: 400,
      message: 'Bad request',
      code: 'bad',
    });
  });
});
