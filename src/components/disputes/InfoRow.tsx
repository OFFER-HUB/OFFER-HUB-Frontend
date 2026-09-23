import type { ReactNode } from "react";

interface InfoRowProps {
  label: string;
  children: ReactNode;
}

export function InfoRow({ label, children }: InfoRowProps): React.JSX.Element {
  return (
    <div className="flex justify-between">
      <span className="text-text-secondary text-sm">{label}</span>
      {children}
    </div>
  );
}