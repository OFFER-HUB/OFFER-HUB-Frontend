export interface UserBalance {
  available: string;
  reserved: string;
}

export interface UserWallet {
  /** Present when the wallet came from the backend (login/OAuth/wallet-verify/connect); absent for the plain SWK-mirrored shape some older call sites still construct. */
  id?: string;
  publicKey: string;
  type: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  firstName?: string | null;
  lastName?: string | null;
  avatarUrl?: string;
  type?: "BUYER" | "SELLER" | "BOTH";
  balance?: UserBalance;
  wallet?: UserWallet;
  isEmailVerified?: boolean;
  /**
   * Mirrors the `isAdmin` claim of the session JWT. `type` is the marketplace
   * role (buyer/seller) and has nothing to do with authorization — this is the
   * only field admin route guards may check.
   */
  isAdmin?: boolean;
}
