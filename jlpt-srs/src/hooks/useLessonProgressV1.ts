import { getLessonProgress } from '@/services/progressV1';
import type { LessonProgress } from '@/types/lessonV1';
import { useEffect, useState } from 'react';


export function useLessonProgress(uid: string | undefined) {
const [progress, setProgress] = useState<LessonProgress | null>(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState<unknown>(null);


useEffect(() => {
let mounted = true;
if (!uid) return;
setLoading(true);
getLessonProgress(uid)
.then((p) => mounted && setProgress(p))
.catch((e) => mounted && setError(e))
.finally(() => mounted && setLoading(false));
return () => {
mounted = false;
};
}, [uid]);


return { progress, loading, error } as const;
}