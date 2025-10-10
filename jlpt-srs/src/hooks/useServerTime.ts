import { useQuery } from '@tanstack/react-query';
import { getServerTime, type ServerTimeResponse } from '@/lib/api/time';

export function useServerTime(enabled = true) {
  return useQuery<ServerTimeResponse>({
    queryKey: ['server-time'],
    queryFn: getServerTime,
    staleTime: 60_000,
    enabled,
  });
}
