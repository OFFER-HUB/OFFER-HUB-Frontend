import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { clearAuthTokens } from "@/lib/auth-client";

export interface UserBalance {
  available: string;
  reserved: string;
}

export interface UserWallet {
  publicKey: string;
  type: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  avatarUrl?: string;
  type?: "BUYER" | "SELLER" | "BOTH" | "ADMIN";
  balance?: UserBalance;
  wallet?: UserWallet;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  redirectAfterLogin: string | null;
  login: (user: User, token: string) => void;
  logout: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  setRedirectAfterLogin: (path: string | null) => void;
}

/**
 * localStorage-based storage for auth state
 *
 * Uses localStorage instead of cookies to avoid:
 * - Cookie size limits (4KB) that cause issues with large JWT tokens
 * - Browser-specific cookie handling inconsistencies
 * - Cookie configuration headaches
 *
 * localStorage is reliable, has no size limit, and works consistently across all browsers.
 */
const localStorageWrapper = {
  getItem: (name: string): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(name);
  },
  setItem: (name: string, value: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(name, value);
  },
  removeItem: (name: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(name);
  },
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      redirectAfterLogin: null,
      login: (user, token) => {
        set({ user, token, isAuthenticated: true });
      },
      logout: async () => {
        // Clear secure httpOnly token cookies via server API
        await clearAuthTokens();
        // Clear client-side auth state
        set({ user: null, token: null, isAuthenticated: false, redirectAfterLogin: null });
      },
      setLoading: (loading) => set({ isLoading: loading }),
      setRedirectAfterLogin: (path) => set({ redirectAfterLogin: path }),
    }),
    {
      name: "auth-state",
      storage: createJSONStorage(() => localStorageWrapper),
      // Persist all auth data
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
