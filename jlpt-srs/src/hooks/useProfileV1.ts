import { ensureProfile } from '@/services/profileV1';
import type { UserProfile } from '@/types/userV1';
import { useEffect, useState } from 'react';



export function useProfile(uid: string | undefined) {
const [profile, setProfile] = useState<UserProfile | null>(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState<unknown>(null);


useEffect(() => {
let mounted = true;
if (!uid) return;
setLoading(true);
ensureProfile(uid)
.then((p) => mounted && setProfile(p))
.catch((e) => mounted && setError(e))
.finally(() => mounted && setLoading(false));
return () => {
mounted = false;
};
}, [uid]);


return { profile, loading, error } as const;
}