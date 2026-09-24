"use client";

export function AuthDivider() {
  return (
    <div className="flex items-center gap-4 my-4">
      <div className="flex-1 h-px bg-border-light" />
      <span className="text-sm text-text-secondary">or</span>
      <div className="flex-1 h-px bg-border-light" />
    </div>
  );
}
