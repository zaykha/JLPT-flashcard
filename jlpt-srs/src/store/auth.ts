import { create } from 'zustand';
import { auth, googleProvider } from '@/lib/firebase';
import { onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth';

type AuthState = {
  user: User | null;
  loading: boolean;
  error?: string;
  signInGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
  init: () => void;
};

export const useAuth = create<AuthState>((set) => ({
  user: null,
  loading: true,
  error: undefined,
  async signInGoogle() {
    set({ loading: true, error: undefined });
    await signInWithPopup(auth, googleProvider);
  },
  async signOutUser() {
    await signOut(auth);
  },
  init() {
    onAuthStateChanged(auth, (u) => set({ user: u, loading: false }));
  },
}));
