import { apiFetch } from '@/lib/api/http';

export type ServerTimeResponse = {
  iso: string;
  timezone: string;
};

export function getServerTime(): Promise<ServerTimeResponse> {
  return apiFetch<ServerTimeResponse>('/time');
}
