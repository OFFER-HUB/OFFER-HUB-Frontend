import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { clientCookies, COOKIE_CONFIG } from "@/lib/cookies";
import { clearAuthTokens } from "@/lib/auth-client";

export interface User {
  id: string;
  email: string;
  username: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  redirectAfterLogin: string | null;
  login: (user: User) => void;
  logout: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  setRedirectAfterLogin: (path: string | null) => void;
}

/**
 * Secure cookie storage for auth state
 *
 * Note: This stores only non-sensitive user info (id, email, username).
 * Actual auth tokens are stored in httpOnly cookies via the server API.
 * See /api/auth/token for secure token management.
 */
const secureCookieStorage = {
  getItem: (name: string): string | null => {
    return clientCookies.get(name);
  },
  setItem: (name: string, value: string): void => {
    clientCookies.set(name, value, COOKIE_CONFIG.EXPIRY_DAYS);
  },
  removeItem: (name: string): void => {
    clientCookies.remove(name);
  },
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      redirectAfterLogin: null,
      login: (user) => {
        set({ user, isAuthenticated: true });
      },
      logout: async () => {
        // Clear secure httpOnly token cookies via server API
        await clearAuthTokens();
        // Clear client-side auth state
        set({ user: null, isAuthenticated: false, redirectAfterLogin: null });
      },
      setLoading: (loading) => set({ isLoading: loading }),
      setRedirectAfterLogin: (path) => set({ redirectAfterLogin: path }),
    }),
    {
      name: COOKIE_CONFIG.AUTH_STATE,
      storage: createJSONStorage(() => secureCookieStorage),
      // Only persist non-sensitive data
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
