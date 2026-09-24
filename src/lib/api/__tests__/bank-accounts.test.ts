import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/config/api", () => ({ API_URL: "http://localhost:4000/api/v1" }));

import {
  listBankAccounts,
  addBankAccount,
  setDefaultBankAccount,
  deleteBankAccount,
  SUPPORTED_CORRIDORS,
} from "../bank-accounts";

const BASE = "http://localhost:4000/api/v1";
const TOKEN = "test-token";
const ACCOUNT_ID = "ba_abc123";

function jsonResponse(body: unknown, ok = true, status = 200) {
  return { ok, status, json: vi.fn().mockResolvedValue(body) };
}

function lastCall() {
  return (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls.at(-1);
}

const SAMPLE_ACCOUNT = {
  id: ACCOUNT_ID,
  userId: "usr_1",
  country: "MX",
  rail: "SPEI_BITSO",
  accountNumber: "012345678901234567",
  bankName: "BBVA",
  holderName: "Jane Doe",
  blindpayBankAccountId: null,
  isDefault: true,
  details: { spei_protocol: "clabe" },
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("SUPPORTED_CORRIDORS", () => {
  it("only lists the 4 corridors BlindPay actually supports, not the 7 originally assumed", () => {
    const countries = new Set(SUPPORTED_CORRIDORS.map((c) => c.country));
    expect(countries).toEqual(new Set(["BR", "MX", "AR", "CO"]));
    expect(countries.has("PE")).toBe(false);
    expect(countries.has("CL")).toBe(false);
    expect(countries.has("CR")).toBe(false);
  });

  it("lists all three Brazilian rails", () => {
    const brazilRails = SUPPORTED_CORRIDORS.filter((c) => c.country === "BR").map((c) => c.rail);
    expect(brazilRails.sort()).toEqual(["PIX", "PIX_SAFE", "TED"]);
  });

  it("uses BlindPay's real rail name for Colombia, not the generic PSE label", () => {
    const colombia = SUPPORTED_CORRIDORS.find((c) => c.country === "CO");
    expect(colombia?.rail).toBe("ACH_COP_BITSO");
  });
});

describe("listBankAccounts", () => {
  it("GETs /users/me/bank-accounts and returns the unwrapped array", async () => {
    const body = { data: [SAMPLE_ACCOUNT] };
    global.fetch = vi.fn().mockResolvedValue(jsonResponse(body)) as unknown as typeof fetch;

    const result = await listBankAccounts(TOKEN);

    expect(lastCall()?.[0]).toBe(`${BASE}/users/me/bank-accounts`);
    expect(lastCall()?.[1]).toMatchObject({ headers: { Authorization: `Bearer ${TOKEN}` } });
    expect(result).toEqual([SAMPLE_ACCOUNT]);
  });

  it("throws a typed BankAccountApiError carrying the backend code and status", async () => {
    const body = { error: { code: "UNAUTHORIZED", message: "No token provided" } };
    global.fetch = vi.fn().mockResolvedValue(jsonResponse(body, false, 401)) as unknown as typeof fetch;

    await expect(listBankAccounts(TOKEN)).rejects.toMatchObject({
      message: "No token provided",
      code: "UNAUTHORIZED",
      status: 401,
    });
  });
});

describe("addBankAccount", () => {
  it("POSTs the full payload including rail-specific details", async () => {
    const body = { data: SAMPLE_ACCOUNT };
    global.fetch = vi.fn().mockResolvedValue(jsonResponse(body)) as unknown as typeof fetch;
    const payload = {
      country: "MX",
      rail: "SPEI_BITSO",
      accountNumber: "012345678901234567",
      bankName: "BBVA",
      holderName: "Jane Doe",
      details: { spei_protocol: "clabe" },
    };

    const result = await addBankAccount(TOKEN, payload);

    expect(lastCall()?.[0]).toBe(`${BASE}/users/me/bank-accounts`);
    const init = lastCall()?.[1] as RequestInit;
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body as string)).toEqual(payload);
    expect(result).toEqual(SAMPLE_ACCOUNT);
  });

  it("surfaces the invalid-corridor error structurally", async () => {
    const body = {
      error: {
        code: "BANK_ACCOUNT_INVALID_CORRIDOR",
        message: 'Rail "PIX" is not available in MX. Allowed rails: SPEI_BITSO',
      },
    };
    global.fetch = vi.fn().mockResolvedValue(jsonResponse(body, false, 422)) as unknown as typeof fetch;

    await expect(
      addBankAccount(TOKEN, {
        country: "MX",
        rail: "PIX",
        accountNumber: "x",
        bankName: "x",
        holderName: "x",
      })
    ).rejects.toMatchObject({ code: "BANK_ACCOUNT_INVALID_CORRIDOR", status: 422 });
  });
});

describe("setDefaultBankAccount", () => {
  it("PATCHes /users/me/bank-accounts/:id/default", async () => {
    const body = { data: { ...SAMPLE_ACCOUNT, isDefault: true } };
    global.fetch = vi.fn().mockResolvedValue(jsonResponse(body)) as unknown as typeof fetch;

    const result = await setDefaultBankAccount(TOKEN, ACCOUNT_ID);

    expect(lastCall()?.[0]).toBe(`${BASE}/users/me/bank-accounts/${ACCOUNT_ID}/default`);
    expect((lastCall()?.[1] as RequestInit).method).toBe("PATCH");
    expect(result.isDefault).toBe(true);
  });
});

describe("deleteBankAccount", () => {
  it("DELETEs /users/me/bank-accounts/:id and resolves without parsing a body", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, status: 204, json: vi.fn() }) as unknown as typeof fetch;

    await expect(deleteBankAccount(TOKEN, ACCOUNT_ID)).resolves.toBeUndefined();

    expect(lastCall()?.[0]).toBe(`${BASE}/users/me/bank-accounts/${ACCOUNT_ID}`);
    expect((lastCall()?.[1] as RequestInit).method).toBe("DELETE");
  });

  it("throws when a payout still references the account", async () => {
    const body = {
      error: { code: "BANK_ACCOUNT_HAS_PAYOUTS", message: `Bank account ${ACCOUNT_ID} cannot be deleted: 1 payout(s) reference it` },
    };
    global.fetch = vi.fn().mockResolvedValue(jsonResponse(body, false, 409)) as unknown as typeof fetch;

    await expect(deleteBankAccount(TOKEN, ACCOUNT_ID)).rejects.toMatchObject({
      code: "BANK_ACCOUNT_HAS_PAYOUTS",
      status: 409,
    });
  });
});
