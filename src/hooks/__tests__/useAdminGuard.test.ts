import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAdminGuard } from "@/hooks/useAdminGuard";
import { useAuthStore } from "@/stores/auth-store";
import type { User } from "@/types/user.types";

const mockReplace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace, push: vi.fn() }),
}));

const BASE_USER: User = {
  id: "usr_1",
  email: "user@example.com",
  username: "user",
  type: "BOTH",
};

function setSession(user: User | null, hasHydrated: boolean) {
  act(() => {
    useAuthStore.setState({
      user,
      token: user ? "token" : null,
      isAuthenticated: user !== null,
      hasHydrated,
    });
  });
}

describe("useAdminGuard", () => {
  beforeEach(() => {
    mockReplace.mockClear();
    setSession(null, false);
  });

  it("does nothing until the persisted session has rehydrated", () => {
    // A signed-in admin looks signed-out before hydration; redirecting here
    // would bounce them to /login on every hard reload.
    const { result } = renderHook(() => useAdminGuard());

    expect(result.current).toBe(false);
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("sends a signed-out visitor to /login", () => {
    setSession(null, true);
    const { result } = renderHook(() => useAdminGuard());

    expect(result.current).toBe(false);
    expect(mockReplace).toHaveBeenCalledWith("/login");
  });

  it("sends a signed-in non-admin back to their dashboard", () => {
    setSession({ ...BASE_USER, isAdmin: false }, true);
    const { result } = renderHook(() => useAdminGuard());

    expect(result.current).toBe(false);
    expect(mockReplace).toHaveBeenCalledWith("/app/client/dashboard");
  });

  it("treats a session with no isAdmin flag at all as non-admin", () => {
    setSession(BASE_USER, true);
    const { result } = renderHook(() => useAdminGuard());

    expect(result.current).toBe(false);
    expect(mockReplace).toHaveBeenCalledWith("/app/client/dashboard");
  });

  it("authorizes an admin without redirecting", () => {
    setSession({ ...BASE_USER, isAdmin: true }, true);
    const { result } = renderHook(() => useAdminGuard());

    expect(result.current).toBe(true);
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("never grants access based on the marketplace role", () => {
    // `type` is BUYER/SELLER/BOTH — the value the old guard compared against
    // ("ADMIN") does not exist, so no role may substitute for the JWT claim.
    setSession({ ...BASE_USER, type: "BOTH" }, true);
    const { result } = renderHook(() => useAdminGuard());

    expect(result.current).toBe(false);
  });
});
