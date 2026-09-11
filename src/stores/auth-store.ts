import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { WalletConnectionState } from "@/types/wallet.types";
import type { User, UserWallet } from "@/types/user.types";
import { hasAdminClaim } from "@/lib/jwt";

export type { User, UserWallet } from "@/types/user.types";

/**
 * Auth store state.
 *
 * The wallet slice mirrors SWK's own state so the rest of the app can read the
 * connected address without depending on the Stellar Wallets Kit.
 */
interface AuthState extends WalletConnectionState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  redirectAfterLogin: string | null;
  /**
   * False until the persisted session has been read back from localStorage.
   *
   * Until then `token` is null on a page reload even for a signed-in user, so
   * anything that renders a "please sign in" state must wait for this instead of
   * treating the empty store as "signed out".
   */
  hasHydrated: boolean;
  login: (user: User, token: string) => void;
  logout: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  setRedirectAfterLogin: (path: string | null) => void;
  setHasHydrated: (value: boolean) => void;
  /**
   * Reflects the account's primary wallet (backend source of truth) onto
   * `user.wallet` — e.g. after `POST /wallet/connect` links a new one. A
   * no-op if nothing is signed in yet.
   */
  setPrimaryWallet: (wallet: UserWallet | undefined) => void;
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
      walletAddress: null,
      walletConnected: false,
      hasHydrated: false,
      login: (user, token) => {
        // walletAddress/walletConnected are persisted to localStorage and
        // otherwise survive a login as leftover state from whichever account
        // was signed in before — a brand new account with nothing connected
        // would show a previous session's wallet. Only trust a wallet here
        // when this session's own user record actually has one.
        set({
          user: { ...user, isAdmin: hasAdminClaim(token) },
          token,
          isAuthenticated: true,
          walletAddress: user.wallet?.publicKey ?? null,
          walletConnected: user.wallet != null,
        });
      },
      logout: async () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          redirectAfterLogin: null,
          walletAddress: null,
          walletConnected: false,
        });
      },
      setLoading: (loading) => set({ isLoading: loading }),
      setRedirectAfterLogin: (path) => set({ redirectAfterLogin: path }),
      connectWallet: (address) => set({ walletAddress: address, walletConnected: true }),
      disconnectWallet: () => set({ walletAddress: null, walletConnected: false }),
      setHasHydrated: (value) => set({ hasHydrated: value }),
      setPrimaryWallet: (wallet) =>
        set((state) => (state.user ? { user: { ...state.user, wallet } } : state)),
    }),
    {
      name: "auth-state",
      storage: createJSONStorage(() => localStorageWrapper),
      // Read localStorage only once the client is mounted (see AuthProvider).
      // Hydrating at module load would make the first client render disagree with
      // the server-rendered HTML, which React resolves by keeping the server's
      // signed-out markup — the reason sessions appeared to vanish on reload.
      skipHydration: true,
      // Persist all auth data
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        walletAddress: state.walletAddress,
        walletConnected: state.walletConnected,
      }),
      // `isAdmin` is derived from the token rather than trusted from storage, so a
      // session persisted before the field existed on User still resolves correctly.
      merge: (persistedState, currentState) => {
        const merged = { ...currentState, ...(persistedState as Partial<AuthState>) };
        if (merged.user) {
          merged.user = { ...merged.user, isAdmin: hasAdminClaim(merged.token) };
        }
        return merged;
      },
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
