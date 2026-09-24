import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ExportControls } from "../ExportControls";
import { exportAnalyticsCsv } from "@/lib/api/admin-analytics";

vi.mock("@/stores/auth-store", () => ({
  useAuthStore: () => ({ token: "fake-jwt-token" }),
}));

vi.mock("@/lib/api/admin-analytics", () => ({
  exportAnalyticsCsv: vi.fn(),
}));

describe("ExportControls", () => {
  const defaultDateRange = {
    start: "2026-08-15",
    end: "2026-09-14",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    window.URL.createObjectURL = vi.fn().mockReturnValue("blob:http://localhost/fake-blob");
    window.URL.revokeObjectURL = vi.fn();
  });

  it("renders export CSV button", () => {
    render(<ExportControls dateRange={defaultDateRange} />);
    expect(screen.getByRole("button", { name: /export csv/i })).toBeInTheDocument();
  });

  it("triggers CSV export and downloads blob when clicked", async () => {
    const fakeBlob = new Blob(["test,csv,data"], { type: "text/csv" });
    (exportAnalyticsCsv as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(fakeBlob);

    render(<ExportControls dateRange={defaultDateRange} />);

    const button = screen.getByRole("button", { name: /export csv/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(exportAnalyticsCsv).toHaveBeenCalledWith("fake-jwt-token", defaultDateRange);
      expect(window.URL.createObjectURL).toHaveBeenCalledWith(fakeBlob);
      expect(window.URL.revokeObjectURL).toHaveBeenCalledWith("blob:http://localhost/fake-blob");
    });
  });
});
