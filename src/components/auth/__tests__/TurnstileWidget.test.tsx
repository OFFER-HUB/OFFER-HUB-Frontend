import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { TurnstileWidget } from "@/components/auth/TurnstileWidget";

describe("TurnstileWidget", () => {
  const renderMock = vi.fn(() => "widget-1");
  const removeMock = vi.fn();

  beforeEach(() => {
    window.turnstile = { render: renderMock, remove: removeMock };
  });

  afterEach(() => {
    delete window.turnstile;
    vi.unstubAllEnvs();
    renderMock.mockClear();
    removeMock.mockClear();
  });

  it("renders nothing and loads nothing without a site key", () => {
    vi.stubEnv("NEXT_PUBLIC_TURNSTILE_SITE_KEY", "");
    const { container } = render(<TurnstileWidget action="register" onTokenChange={vi.fn()} />);

    expect(container).toBeEmptyDOMElement();
    expect(renderMock).not.toHaveBeenCalled();
  });

  it("renders the challenge with the site key and action, and reports tokens", async () => {
    vi.stubEnv("NEXT_PUBLIC_TURNSTILE_SITE_KEY", "site-key");
    const onTokenChange = vi.fn();
    const { unmount } = render(<TurnstileWidget action="register" onTokenChange={onTokenChange} />);

    await waitFor(() => expect(renderMock).toHaveBeenCalledTimes(1));
    const options = (renderMock.mock.calls[0] as unknown as [HTMLElement, Record<string, unknown>])[1];
    expect(options).toMatchObject({ sitekey: "site-key", action: "register" });

    (options.callback as (t: string) => void)("tok");
    expect(onTokenChange).toHaveBeenLastCalledWith("tok");
    (options["expired-callback"] as () => void)();
    expect(onTokenChange).toHaveBeenLastCalledWith(null);

    unmount();
    expect(removeMock).toHaveBeenCalledWith("widget-1");
  });

  it("issues a new challenge when the reset key changes", async () => {
    vi.stubEnv("NEXT_PUBLIC_TURNSTILE_SITE_KEY", "site-key");
    const { rerender } = render(<TurnstileWidget action="register" onTokenChange={vi.fn()} resetKey={0} />);
    await waitFor(() => expect(renderMock).toHaveBeenCalledTimes(1));

    rerender(<TurnstileWidget action="register" onTokenChange={vi.fn()} resetKey={1} />);

    await waitFor(() => expect(renderMock).toHaveBeenCalledTimes(2));
    expect(removeMock).toHaveBeenCalledWith("widget-1");
  });
});
