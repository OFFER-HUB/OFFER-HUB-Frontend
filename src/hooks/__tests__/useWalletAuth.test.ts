import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useWalletAuth, type WalletAuthStep } from '../useWalletAuth';

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mockFetchAddress = vi.fn();
const mockSignMessage = vi.fn();

vi.mock('@creit.tech/stellar-wallets-kit', () => ({
  StellarWalletsKit: {
    fetchAddress: () => mockFetchAddress(),
    signMessage: (...args: unknown[]) => mockSignMessage(...args),
  },
}));

const mockRequestChallenge = vi.fn();
const mockVerifySignature = vi.fn();

vi.mock('@/services/wallet-auth.service', () => ({
  requestChallenge: (...args: unknown[]) => mockRequestChallenge(...args),
  verifySignature: (...args: unknown[]) => mockVerifySignature(...args),
  WalletAuthError: class WalletAuthError extends Error {
    code: string; status: number;
    constructor(msg: string, code: string, status: number) {
      super(msg); this.code = code; this.status = status;
    }
  },
}));

const mockLogin = vi.fn();
const mockConnectWallet = vi.fn();

vi.mock('@/stores/auth-store', () => ({
  useAuthStore: (selector: (s: { login: typeof mockLogin; connectWallet: typeof mockConnectWallet }) => unknown) =>
    selector({ login: mockLogin, connectWallet: mockConnectWallet }),
}));

// ── Helpers ───────────────────────────────────────────────────────────────────

const PUBLIC_KEY = 'GDRXE2BQUC3AZNPVFSCEZ76NJ3WWL25FYFK6RGZGIEKWE4SOOHSUJUJ';
const CHALLENGE = 'aa'.repeat(32);
const SIGNED = 'signature==';
const SESSION = {
  user: { id: 'usr_1', email: '', username: 'user_gdr', type: 'BOTH' as const },
  token: 'jwt',
};

function setup() {
  mockFetchAddress.mockResolvedValue({ address: PUBLIC_KEY });
  mockRequestChallenge.mockResolvedValue({ challenge: CHALLENGE, expiresIn: 300 });
  mockSignMessage.mockResolvedValue({ signedMessage: SIGNED, signerAddress: PUBLIC_KEY });
  mockVerifySignature.mockResolvedValue(SESSION);
}

beforeEach(() => {
  vi.clearAllMocks();
  setup();
});

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('useWalletAuth — happy path', () => {
  it('calls fetchAddress then requestChallenge with the live address', async () => {
    const { result } = renderHook(() => useWalletAuth());

    await act(async () => { await result.current.signIn(PUBLIC_KEY); });

    expect(mockFetchAddress).toHaveBeenCalledOnce();
    expect(mockRequestChallenge).toHaveBeenCalledWith(PUBLIC_KEY);
  });

  it('calls signMessage with the challenge and address hint', async () => {
    const { result } = renderHook(() => useWalletAuth());

    await act(async () => { await result.current.signIn(PUBLIC_KEY); });

    expect(mockSignMessage).toHaveBeenCalledWith(CHALLENGE, { address: PUBLIC_KEY });
  });

  it('calls verifySignature with effectiveKey, signedMessage, challenge', async () => {
    const { result } = renderHook(() => useWalletAuth());

    await act(async () => { await result.current.signIn(PUBLIC_KEY); });

    expect(mockVerifySignature).toHaveBeenCalledWith(PUBLIC_KEY, SIGNED, CHALLENGE);
  });

  it('calls login and connectWallet after successful verification', async () => {
    const { result } = renderHook(() => useWalletAuth());

    await act(async () => { await result.current.signIn(PUBLIC_KEY); });

    expect(mockLogin).toHaveBeenCalledWith(SESSION.user, SESSION.token);
    expect(mockConnectWallet).toHaveBeenCalledWith(PUBLIC_KEY);
  });

  it('returns the WalletSession object', async () => {
    const { result } = renderHook(() => useWalletAuth());
    let session;

    await act(async () => { session = await result.current.signIn(PUBLIC_KEY); });

    expect(session).toEqual(SESSION);
  });

  it('returns step:idle after successful sign-in', async () => {
    const { result } = renderHook(() => useWalletAuth());

    await act(async () => { await result.current.signIn(PUBLIC_KEY); });

    expect(result.current.step).toBe('idle');
    expect(result.current.isAuthenticating).toBe(false);
  });
});

describe('useWalletAuth — double-submit guard', () => {
  it('returns null immediately on a concurrent second call', async () => {
    const { result } = renderHook(() => useWalletAuth());
    let first: unknown, second: unknown;

    await act(async () => {
      const p1 = result.current.signIn(PUBLIC_KEY);
      const p2 = result.current.signIn(PUBLIC_KEY);
      [first, second] = await Promise.all([p1, p2]);
    });

    // One of them is the real session, the other is null (the guard)
    expect([first, second]).toContain(null);
    expect(mockRequestChallenge).toHaveBeenCalledOnce();
  });
});

describe('useWalletAuth — account mismatch', () => {
  it('sets error and returns null when signerAddress !== challengeKey', async () => {
    mockSignMessage.mockResolvedValue({ signedMessage: SIGNED, signerAddress: 'GDIFFERENT' });
    const { result } = renderHook(() => useWalletAuth());
    let session: unknown;

    await act(async () => { session = await result.current.signIn(PUBLIC_KEY); });

    expect(session).toBeNull();
    expect(result.current.error).toMatch(/different account/i);
  });
});

describe('useWalletAuth — error mapping', () => {
  it('maps WALLET_CHALLENGE_EXPIRED to the "expired" user message', async () => {
    const { WalletAuthError } = await import('@/services/wallet-auth.service');
    mockVerifySignature.mockRejectedValue(new WalletAuthError('expired', 'WALLET_CHALLENGE_EXPIRED', 401));
    const { result } = renderHook(() => useWalletAuth());

    await act(async () => { await result.current.signIn(PUBLIC_KEY); });

    expect(result.current.error).toMatch(/expired/i);
  });

  it('maps INVALID_SIGNATURE_FORMAT to the "could not be verified" message', async () => {
    const { WalletAuthError } = await import('@/services/wallet-auth.service');
    mockVerifySignature.mockRejectedValue(new WalletAuthError('bad sig', 'INVALID_SIGNATURE_FORMAT', 400));
    const { result } = renderHook(() => useWalletAuth());

    await act(async () => { await result.current.signIn(PUBLIC_KEY); });

    expect(result.current.error).toMatch(/verified/i);
  });

  it('uses the message field from plain objects (wallet kit rejections)', async () => {
    mockSignMessage.mockRejectedValue({ message: 'User rejected the request' });
    const { result } = renderHook(() => useWalletAuth());

    await act(async () => { await result.current.signIn(PUBLIC_KEY); });

    expect(result.current.error).toBe('User rejected the request');
  });
});

describe('useWalletAuth — reset', () => {
  it('clears error and returns step to idle', async () => {
    mockVerifySignature.mockRejectedValue(new Error('Something went wrong'));
    const { result } = renderHook(() => useWalletAuth());

    await act(async () => { await result.current.signIn(PUBLIC_KEY); });
    expect(result.current.error).not.toBeNull();

    act(() => { result.current.reset(); });

    expect(result.current.error).toBeNull();
    expect(result.current.step).toBe<WalletAuthStep>('idle');
  });
});
