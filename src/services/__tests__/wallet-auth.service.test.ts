import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/config/api', () => ({ API_URL: 'http://localhost:4000/api/v1' }));

import { requestChallenge, verifySignature, WalletAuthError } from '../wallet-auth.service';

const BASE = 'http://localhost:4000/api/v1';

function mockFetch(body: unknown, status = 200) {
  const ok = status >= 200 && status < 300;
  const json = vi.fn().mockResolvedValue(body);
  global.fetch = vi.fn().mockResolvedValue({ ok, status, json });
}

function mockFetchNetworkError() {
  global.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));
}

function mockFetchBadJson(status = 500) {
  global.fetch = vi.fn().mockResolvedValue({
    ok: false,
    status,
    json: vi.fn().mockRejectedValue(new SyntaxError('bad json')),
  });
}

const CHALLENGE_RESPONSE = { data: { challenge: 'aa'.repeat(32), expiresIn: 300 } };
const PUBLIC_KEY = 'GDRXE2BQUC3AZNPVFSCEZ76NJ3WWL25FYFK6RGZGIEKWE4SOOHSUJUJ';

describe('requestChallenge', () => {
  beforeEach(() => { vi.restoreAllMocks(); });

  it('returns { challenge, expiresIn } from a valid response', async () => {
    mockFetch(CHALLENGE_RESPONSE);

    const result = await requestChallenge(PUBLIC_KEY);

    expect(result.challenge).toBe(CHALLENGE_RESPONSE.data.challenge);
    expect(result.expiresIn).toBe(300);
  });

  it('posts to /auth/wallet/challenge with the public key', async () => {
    mockFetch(CHALLENGE_RESPONSE);

    await requestChallenge(PUBLIC_KEY);

    expect(fetch).toHaveBeenCalledWith(
      `${BASE}/auth/wallet/challenge`,
      expect.objectContaining({ method: 'POST' }),
    );
    const body = JSON.parse((fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body as string);
    expect(body.publicKey).toBe(PUBLIC_KEY);
  });

  it('throws MALFORMED_RESPONSE when data.challenge is missing', async () => {
    mockFetch({ data: { expiresIn: 300 } });

    await expect(requestChallenge(PUBLIC_KEY)).rejects.toMatchObject({
      code: 'MALFORMED_RESPONSE',
    });
  });

  it('throws NETWORK_ERROR when fetch rejects', async () => {
    mockFetchNetworkError();

    const err = await requestChallenge(PUBLIC_KEY).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(WalletAuthError);
    expect((err as WalletAuthError).code).toBe('NETWORK_ERROR');
    expect((err as WalletAuthError).status).toBe(0);
  });

  it('throws with API error code on non-2xx response with valid envelope', async () => {
    mockFetch({ error: { code: 'RATE_LIMITED', message: 'Too many requests' } }, 429);

    const err = await requestChallenge(PUBLIC_KEY).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(WalletAuthError);
    expect((err as WalletAuthError).code).toBe('RATE_LIMITED');
    expect((err as WalletAuthError).status).toBe(429);
  });

  it('throws UNKNOWN_ERROR when non-2xx response has non-JSON body', async () => {
    mockFetchBadJson(503);

    const err = await requestChallenge(PUBLIC_KEY).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(WalletAuthError);
    expect((err as WalletAuthError).code).toBe('UNKNOWN_ERROR');
  });
});

const SESSION_RESPONSE = {
  data: {
    token: 'jwt_abc',
    user: {
      id: 'usr_1',
      email: 'test@example.com',
      username: 'testuser',
      firstName: 'Alice',
      lastName: 'Bob',
      type: 'BOTH',
      wallet: { publicKey: PUBLIC_KEY, type: 'EXTERNAL' },
    },
  },
};

describe('verifySignature', () => {
  beforeEach(() => { vi.restoreAllMocks(); });

  it('returns { user, token } on a valid 200 response', async () => {
    mockFetch(SESSION_RESPONSE);

    const result = await verifySignature(PUBLIC_KEY, 'sig==', 'challenge');

    expect(result.token).toBe('jwt_abc');
    expect(result.user.id).toBe('usr_1');
    expect(result.user.email).toBe('test@example.com');
  });

  it('collapses null email to empty string', async () => {
    const resp = { data: { ...SESSION_RESPONSE.data, user: { ...SESSION_RESPONSE.data.user, email: null } } };
    mockFetch(resp);

    const result = await verifySignature(PUBLIC_KEY, 'sig==', 'challenge');

    expect(result.user.email).toBe('');
  });

  it('returns undefined wallet when payload.wallet is not a record', async () => {
    const resp = { data: { ...SESSION_RESPONSE.data, user: { ...SESSION_RESPONSE.data.user, wallet: null } } };
    mockFetch(resp);

    const result = await verifySignature(PUBLIC_KEY, 'sig==', 'challenge');

    expect(result.user.wallet).toBeUndefined();
  });

  it('maps valid UserType values correctly', async () => {
    for (const type of ['BUYER', 'SELLER', 'BOTH', 'ADMIN'] as const) {
      const resp = { data: { ...SESSION_RESPONSE.data, user: { ...SESSION_RESPONSE.data.user, type } } };
      mockFetch(resp);
      const result = await verifySignature(PUBLIC_KEY, 'sig==', 'challenge');
      expect(result.user.type).toBe(type);
    }
  });

  it('returns undefined type for unknown user type strings', async () => {
    const resp = { data: { ...SESSION_RESPONSE.data, user: { ...SESSION_RESPONSE.data.user, type: 'UNKNOWN_ROLE' } } };
    mockFetch(resp);

    const result = await verifySignature(PUBLIC_KEY, 'sig==', 'challenge');

    expect(result.user.type).toBeUndefined();
  });

  it('throws MALFORMED_RESPONSE when token is missing', async () => {
    mockFetch({ data: { user: SESSION_RESPONSE.data.user } });

    await expect(verifySignature(PUBLIC_KEY, 'sig==', 'challenge')).rejects.toMatchObject({
      code: 'MALFORMED_RESPONSE',
    });
  });

  it('throws MALFORMED_RESPONSE when user is not a record', async () => {
    mockFetch({ data: { token: 'jwt', user: 'not-an-object' } });

    await expect(verifySignature(PUBLIC_KEY, 'sig==', 'challenge')).rejects.toMatchObject({
      code: 'MALFORMED_RESPONSE',
    });
  });

  it('throws WalletAuthError with API code on 401', async () => {
    mockFetch({ error: { code: 'WALLET_CHALLENGE_EXPIRED', message: 'Challenge expired' } }, 401);

    const err = await verifySignature(PUBLIC_KEY, 'sig==', 'challenge').catch((e: unknown) => e);
    expect((err as WalletAuthError).code).toBe('WALLET_CHALLENGE_EXPIRED');
    expect((err as WalletAuthError).status).toBe(401);
  });

  it('throws NETWORK_ERROR on network failure', async () => {
    mockFetchNetworkError();

    const err = await verifySignature(PUBLIC_KEY, 'sig==', 'challenge').catch((e: unknown) => e);
    expect((err as WalletAuthError).code).toBe('NETWORK_ERROR');
  });
});
