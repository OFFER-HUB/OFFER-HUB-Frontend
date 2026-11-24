import { beforeEach, describe, expect, it } from "vitest";
import { renderHook } from "@testing-library/react";
import { useWelcomeGreeting } from "../useWelcomeGreeting";

beforeEach(() => {
  window.localStorage.clear();
});

describe("useWelcomeGreeting", () => {
  it("greets a first visit with Welcome and every later visit with Welcome back", () => {
    const first = renderHook(() => useWelcomeGreeting("usr_1"));
    expect(first.result.current).toBe("Welcome");
    first.unmount();

    const second = renderHook(() => useWelcomeGreeting("usr_1"));
    expect(second.result.current).toBe("Welcome back");
  });

  it("tracks each user separately", () => {
    renderHook(() => useWelcomeGreeting("usr_1")).unmount();

    const other = renderHook(() => useWelcomeGreeting("usr_2"));
    expect(other.result.current).toBe("Welcome");
  });

  it("falls back to Welcome back when there is no user yet", () => {
    const { result } = renderHook(() => useWelcomeGreeting(undefined));
    expect(result.current).toBe("Welcome back");
  });
});
