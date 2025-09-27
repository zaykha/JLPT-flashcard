import { useQuery } from '@tanstack/react-query';
import { getProfile, type UserProfile } from '@/lib/user-data';
import { useAuth } from '@/store/auth';

export function useUserProfile() {
  const { user } = useAuth();
  return useQuery<UserProfile | null>({
    queryKey: ['profile', user?.uid],
    queryFn: async () => {
      if (!user) return null;
      return getProfile(user.uid);
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5m
  });
}
