import { auth } from '@/lib/firebase';
import type { ApiError } from '@/lib/api/types';

/**
 * Returns the Firebase ID token for the current user.
 * Throws an ApiError with status 401 when unauthenticated or if the token cannot be produced.
 */
export async function getIdToken(forceRefresh = false): Promise<string> {
  const user = auth.currentUser;
  if (!user) {
    const error: ApiError = { code: 'auth', status: 401, message: 'Authentication required' };
    throw error;
  }

  try {
    return await user.getIdToken(forceRefresh);
  } catch (cause) {
    const error: ApiError = {
      code: 'auth-token',
      status: 401,
      message: 'Failed to retrieve authentication token',
      cause,
    };
    throw error;
  }
}
