import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { LessonCatalog } from '@/lib/api/types';
import type { JLPTLevelStr } from '@/types/userV1';
import { getLessonCatalogFromFirestore } from '@/lib/api/lessons';
import { loadLessonCatalog, saveLessonCatalog, type CachedLessonCatalog } from '@/lib/cache/lessons';

export function useLessonCatalog(level: JLPTLevelStr | null | undefined) {
  const queryClient = useQueryClient();
  const enabled = !!level;

  const query = useQuery<CachedLessonCatalog | null>({
    queryKey: ['lessonCatalog', level],
    enabled,
    staleTime: Infinity,
    queryFn: async () => {
      if (!level) return null;
      const cached = await loadLessonCatalog(level);
      if (cached) return cached;
      const fresh = await getLessonCatalogFromFirestore(level);
      return saveLessonCatalog(level, fresh);
    },
  });

  const refresh = async () => {
    if (!level) return null;
    const fresh = await getLessonCatalogFromFirestore(level);
    const record = await saveLessonCatalog(level, fresh);
    queryClient.setQueryData(['lessonCatalog', level], record);
    return record;
  };

  return { ...query, refresh };
}
