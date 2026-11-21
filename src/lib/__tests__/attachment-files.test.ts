import { describe, expect, it } from "vitest";
import {
  ATTACHMENT_ACCEPT,
  ATTACHMENT_MAX_BYTES,
  attachmentProblem,
} from "../attachment-files";

describe("attachmentProblem", () => {
  it.each(["delivery.zip", "report.PDF", "photo.jpeg", "notes.md", "data.csv"])(
    "accepts %s",
    (name) => {
      expect(attachmentProblem({ name, size: 1024 })).toBeNull();
    },
  );

  it("rejects source code and says to use a ZIP", () => {
    const message = attachmentProblem({ name: "main.py", size: 1024 });
    expect(message).toContain(".py files");
    expect(message).toContain("ZIP");
  });

  it("rejects a file with no extension", () => {
    expect(attachmentProblem({ name: "README", size: 10 })).toContain("This file type");
  });

  it("rejects a file over 10MB, even if the format is fine", () => {
    expect(attachmentProblem({ name: "big.zip", size: ATTACHMENT_MAX_BYTES + 1 })).toContain("10MB");
    expect(attachmentProblem({ name: "ok.zip", size: ATTACHMENT_MAX_BYTES })).toBeNull();
  });

  it("builds an accept list for the file picker", () => {
    expect(ATTACHMENT_ACCEPT).toContain(".zip");
    expect(ATTACHMENT_ACCEPT).not.toContain(".py");
  });
});
