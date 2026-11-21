import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Fee notes ask the API for a quote; no unit test should reach the network.
// Suites that check the breakdown mock this module themselves.
vi.mock('@/lib/api/fees', () => ({
  getFeeQuote: vi.fn().mockResolvedValue({ minOrderAmount: '10.56', payoutMinUsd: 10, payoutMaxUsd: 10000 }),
}));
