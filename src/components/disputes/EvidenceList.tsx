"use client";

import { EvidenceItem, type EvidenceUploadItem } from "@/components/disputes/EvidenceItem";

interface EvidenceListProps {
  items: EvidenceUploadItem[];
  removable?: boolean;
  onRemove?: (itemId: string) => void;
  onRetry?: (itemId: string) => void;
}

export function EvidenceList({
  items,
  removable = false,
  onRemove,
  onRetry,
}: EvidenceListProps): React.JSX.Element {
  if (items.length === 0) {
    return (
      <p className="text-sm text-text-secondary">
        No evidence uploaded yet.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {items.map((item) => (
        <EvidenceItem
          key={item.localId}
          item={item}
          removable={removable}
          onRemove={onRemove}
          onRetry={onRetry}
        />
      ))}
    </div>
  );
}
