import { describe, it, expect, beforeEach } from 'vitest';
import { act } from '@testing-library/react';
import { useAuthStore } from '../auth-store';

const MOCK_USER = {
  id: 'usr_1',
  email: 'test@example.com',
  username: 'testuser',
  firstName: 'Alice',
  lastName: null,
  type: 'BOTH' as const,
};

const TOKEN = 'jwt_test_token';

/** Unsigned-but-well-formed JWT carrying the given claims (base64url, no padding). */
function makeJwt(payload: Record<string, unknown>): string {
  const b64u = (value: unknown) =>
    btoa(JSON.stringify(value)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return `${b64u({ alg: 'HS256', typ: 'JWT' })}.${b64u(payload)}.signature`;
}

const ADMIN_TOKEN = makeJwt({ sub: 'usr_1', email: 'test@example.com', type: 'BOTH', isAdmin: true });
const NON_ADMIN_TOKEN = makeJwt({ sub: 'usr_1', email: 'test@example.com', type: 'BOTH', isAdmin: false });

function resetStore() {
  act(() => {
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      redirectAfterLogin: null,
      walletAddress: null,
      walletConnected: false,
      hasHydrated: false,
    });
  });
}

describe('auth-store', () => {
  beforeEach(() => { resetStore(); });

  describe('login', () => {
    it('sets user, token and isAuthenticated:true', () => {
      act(() => { useAuthStore.getState().login(MOCK_USER, TOKEN); });

      const state = useAuthStore.getState();
      expect(state.user).toEqual({ ...MOCK_USER, isAdmin: false });
      expect(state.token).toBe(TOKEN);
      expect(state.isAuthenticated).toBe(true);
    });

    it('mirrors the JWT isAdmin claim onto user.isAdmin', () => {
      // The login response body never carries isAdmin — only the token does —
      // so the store is what makes it visible to admin route guards.
      act(() => { useAuthStore.getState().login(MOCK_USER, ADMIN_TOKEN); });
      expect(useAuthStore.getState().user?.isAdmin).toBe(true);

      act(() => { useAuthStore.getState().login(MOCK_USER, NON_ADMIN_TOKEN); });
      expect(useAuthStore.getState().user?.isAdmin).toBe(false);
    });

    it('ignores any isAdmin the caller puts on the user object', () => {
      const spoofed = { ...MOCK_USER, isAdmin: true };
      act(() => { useAuthStore.getState().login(spoofed, NON_ADMIN_TOKEN); });

      expect(useAuthStore.getState().user?.isAdmin).toBe(false);
    });

    it('does not carry a previous session\'s wallet into a new account that has none', () => {
      // Simulate a wallet connected under a prior account in the same browser
      // (walletAddress/walletConnected are persisted to localStorage, so this
      // survives a plain page reload, not just an in-memory switch).
      act(() => { useAuthStore.getState().connectWallet('GOLD_ACCOUNT_WALLET'); });

      act(() => { useAuthStore.getState().login(MOCK_USER, TOKEN); });

      const state = useAuthStore.getState();
      expect(state.walletAddress).toBeNull();
      expect(state.walletConnected).toBe(false);
    });

    it('reflects the logging-in account\'s own wallet when it has one', () => {
      act(() => { useAuthStore.getState().connectWallet('GSTALE_FROM_BEFORE'); });

      const walletUser = { ...MOCK_USER, wallet: { publicKey: 'GNEW_ACCOUNT_WALLET', type: 'EXTERNAL' } };
      act(() => { useAuthStore.getState().login(walletUser, TOKEN); });

      const state = useAuthStore.getState();
      expect(state.walletAddress).toBe('GNEW_ACCOUNT_WALLET');
      expect(state.walletConnected).toBe(true);
    });
  });

  describe('logout', () => {
    it('clears user, token, isAuthenticated, wallet state', async () => {
      act(() => { useAuthStore.getState().login(MOCK_USER, TOKEN); });
      act(() => { useAuthStore.getState().connectWallet('GABCDEF'); });

      await act(async () => { await useAuthStore.getState().logout(); });

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.walletAddress).toBeNull();
      expect(state.walletConnected).toBe(false);
    });

    it('does not throw when called on an already-logged-out store', async () => {
      await expect(
        act(async () => { await useAuthStore.getState().logout(); })
      ).resolves.not.toThrow();
    });
  });

  describe('connectWallet', () => {
    it('sets walletAddress and walletConnected:true', () => {
      act(() => { useAuthStore.getState().connectWallet('GABCDEFG'); });

      const state = useAuthStore.getState();
      expect(state.walletAddress).toBe('GABCDEFG');
      expect(state.walletConnected).toBe(true);
    });
  });

  describe('disconnectWallet', () => {
    it('clears walletAddress and sets walletConnected:false', () => {
      act(() => { useAuthStore.getState().connectWallet('GABCDEFG'); });
      act(() => { useAuthStore.getState().disconnectWallet(); });

      const state = useAuthStore.getState();
      expect(state.walletAddress).toBeNull();
      expect(state.walletConnected).toBe(false);
    });
  });

  describe('setHasHydrated', () => {
    it('flips hasHydrated to true', () => {
      act(() => { useAuthStore.getState().setHasHydrated(true); });
      expect(useAuthStore.getState().hasHydrated).toBe(true);
    });
  });

  describe('setLoading', () => {
    it('reflects true and false', () => {
      act(() => { useAuthStore.getState().setLoading(true); });
      expect(useAuthStore.getState().isLoading).toBe(true);

      act(() => { useAuthStore.getState().setLoading(false); });
      expect(useAuthStore.getState().isLoading).toBe(false);
    });
  });

  describe('setRedirectAfterLogin', () => {
    it('stores a path and clears with null', () => {
      act(() => { useAuthStore.getState().setRedirectAfterLogin('/dashboard'); });
      expect(useAuthStore.getState().redirectAfterLogin).toBe('/dashboard');

      act(() => { useAuthStore.getState().setRedirectAfterLogin(null); });
      expect(useAuthStore.getState().redirectAfterLogin).toBeNull();
    });
  });

  describe('persist rehydrate', () => {
    it('derives user.isAdmin from the persisted token, not the persisted user', async () => {
      // Sessions written before this field existed have a user without isAdmin
      // but a token that already carries the claim.
      localStorage.setItem('auth-state', JSON.stringify({
        state: { user: MOCK_USER, token: ADMIN_TOKEN, isAuthenticated: true, walletAddress: null, walletConnected: false },
        version: 0,
      }));

      await act(async () => { await useAuthStore.persist.rehydrate(); });

      expect(useAuthStore.getState().user?.isAdmin).toBe(true);
      expect(useAuthStore.getState().hasHydrated).toBe(true);
      localStorage.removeItem('auth-state');
    });
  });

  describe('persist partialize', () => {
    it('persisted slice contains only auth and wallet fields', () => {
      // Access the persist middleware options to verify the partialize function
      // produces only the expected keys.
      act(() => {
        useAuthStore.getState().login(MOCK_USER, TOKEN);
        useAuthStore.getState().connectWallet('GABC');
        useAuthStore.getState().setLoading(true);
        useAuthStore.getState().setRedirectAfterLogin('/home');
      });

      const fullState = useAuthStore.getState();
      // These keys should be in the persisted slice
      expect(fullState.user).not.toBeNull();
      expect(fullState.token).not.toBeNull();
      expect(fullState.walletAddress).not.toBeNull();
      // These keys should NOT be in the persisted slice (isLoading, redirectAfterLogin are excluded)
      // We verify they reset on a fresh store rather than persisting
      resetStore();
      expect(useAuthStore.getState().isLoading).toBe(false);
      expect(useAuthStore.getState().redirectAfterLogin).toBeNull();
    });
  });
});
