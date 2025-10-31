import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/store/auth';
import type { LessonProgress } from '@/types/lessonV1';
import { getLessonProgress } from '@/services/progressV1';
// import { getLessonProgress, type LessonProgress } from '@/lib/user-data';

const EMPTY: LessonProgress = {completed: [], failed: [], current: []};

export function useLessonProgress() {
  const user = useAuth(state => state.user);

  return useQuery<LessonProgress>({
    queryKey: ['lessonProgress', user?.uid],
    queryFn: () => getLessonProgress(user!.uid),
    enabled: !!user,
    initialData: EMPTY,
    staleTime: 60_000,
  });
}
