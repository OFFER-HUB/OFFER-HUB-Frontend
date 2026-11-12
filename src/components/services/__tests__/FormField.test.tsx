import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { FormField } from "@/components/services/FormField";

describe("FormField", () => {
  it("renders label and children correctly", () => {
    render(
      <FormField id="test-input" label="Test Label" required>
        <input id="test-input" placeholder="Enter text" />
      </FormField>
    );

    expect(screen.getByText("Test Label")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter text")).toBeInTheDocument();
  });

  it("renders error message and suppresses helperText when error is present", () => {
    render(
      <FormField
        id="test-input"
        label="Test Label"
        error="This field is required"
        helperText="Some helper text"
      >
        <input id="test-input" />
      </FormField>
    );

    expect(screen.getByText("This field is required")).toBeInTheDocument();
    expect(screen.queryByText("Some helper text")).not.toBeInTheDocument();
  });

  it("renders character count properly", () => {
    render(
      <FormField
        id="test-input"
        label="Test Label"
        characterCount={{ current: 15, min: 10, max: 100 }}
      >
        <input id="test-input" />
      </FormField>
    );

    expect(screen.getByText("15 / 10 min (100 max)")).toBeInTheDocument();
  });
});
