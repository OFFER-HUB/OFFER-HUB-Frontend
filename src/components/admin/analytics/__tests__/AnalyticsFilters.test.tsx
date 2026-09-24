import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { AnalyticsFilters } from "../AnalyticsFilters";

describe("AnalyticsFilters", () => {
  const defaultDateRange = {
    start: "2026-08-15",
    end: "2026-09-14",
  };

  it("renders preset ranges, date inputs, and refresh button", () => {
    render(
      <AnalyticsFilters
        dateRange={defaultDateRange}
        onDateRangeChange={vi.fn()}
        onRefresh={vi.fn()}
      />
    );

    expect(screen.getByRole("button", { name: "Last 7 days" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Last 30 days" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Last 90 days" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Last year" })).toBeInTheDocument();

    expect(screen.getByLabelText("From:")).toHaveValue("2026-08-15");
    expect(screen.getByLabelText("To:")).toHaveValue("2026-09-14");

    expect(screen.getByRole("button", { name: /refresh/i })).toBeInTheDocument();
  });

  it("triggers onDateRangeChange when clicking a preset range", () => {
    const onDateRangeChange = vi.fn();
    render(
      <AnalyticsFilters
        dateRange={defaultDateRange}
        onDateRangeChange={onDateRangeChange}
        onRefresh={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Last 7 days" }));

    expect(onDateRangeChange).toHaveBeenCalledTimes(1);
    const calledRange = onDateRangeChange.mock.calls[0][0];
    expect(calledRange).toHaveProperty("start");
    expect(calledRange).toHaveProperty("end");
  });

  it("triggers onDateRangeChange when modifying start or end dates", () => {
    const onDateRangeChange = vi.fn();
    render(
      <AnalyticsFilters
        dateRange={defaultDateRange}
        onDateRangeChange={onDateRangeChange}
        onRefresh={vi.fn()}
      />
    );

    fireEvent.change(screen.getByLabelText("From:"), {
      target: { value: "2026-08-01" },
    });

    expect(onDateRangeChange).toHaveBeenCalledWith({
      start: "2026-08-01",
      end: "2026-09-14",
    });

    fireEvent.change(screen.getByLabelText("To:"), {
      target: { value: "2026-09-20" },
    });

    expect(onDateRangeChange).toHaveBeenCalledWith({
      start: "2026-08-15",
      end: "2026-09-20",
    });
  });

  it("triggers onRefresh and shows loading state while refreshing", async () => {
    let resolveRefresh: () => void = () => {};
    const refreshPromise = new Promise<void>((resolve) => {
      resolveRefresh = resolve;
    });
    const onRefresh = vi.fn().mockImplementation(() => refreshPromise);

    render(
      <AnalyticsFilters
        dateRange={defaultDateRange}
        onDateRangeChange={vi.fn()}
        onRefresh={onRefresh}
      />
    );

    const refreshButton = screen.getByRole("button", { name: /refresh/i });
    fireEvent.click(refreshButton);

    expect(onRefresh).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Refreshing...")).toBeInTheDocument();

    resolveRefresh();

    await waitFor(() => {
      expect(screen.getByText("Refresh")).toBeInTheDocument();
    });
  });
});
