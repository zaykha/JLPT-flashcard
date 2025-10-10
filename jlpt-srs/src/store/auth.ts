import { create } from 'zustand';
import { auth, googleProvider } from '@/lib/firebase';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  type User
} from 'firebase/auth';

type AuthState = {
  user: User | null;
  loading: boolean;
  error?: string;
  signInGoogle: () => Promise<void>;
  signInEmail: (email: string, password: string) => Promise<void>;
  signUpEmail: (email: string, password: string) => Promise<void>;
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
  async signInEmail(email, password) {
    set({ loading: true, error: undefined });
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      set({ loading: false, error: error?.message ?? 'Unable to sign in' });
      throw error;
    }
  },
  async signUpEmail(email, password) {
    set({ loading: true, error: undefined });
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      set({ loading: false, error: error?.message ?? 'Unable to sign up' });
      throw error;
    }
  },
  async signOutUser() {
    await signOut(auth);
  },
  init() {
    onAuthStateChanged(auth, (u) => set({ user: u, loading: false }));
  },
}));
