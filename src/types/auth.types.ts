export interface RegisterFormData {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface AuthFormErrors {
  email?: string;
  username?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

/**
 * Claims the backend puts in the session JWT
 * (`{ sub, email, type, sessionId?, walletAddress?, isAdmin }`).
 *
 * `isAdmin` only travels here — the `user` object in the login response does not
 * carry it — so the store reads it off the token instead of the response body.
 */
export interface SessionTokenPayload {
  sub: string;
  email?: string | null;
  type?: string;
  sessionId?: string;
  walletAddress?: string;
  isAdmin?: boolean;
  iat?: number;
  exp?: number;
}
