import { LoadingSpinner } from "@/components/ui/Icon";

const LOADING_LABEL = "Loading order...";

/**
 * Full-height placeholder shown until the order request settles.
 */
export function OrderDetailLoading(): React.JSX.Element {
  return (
    <div className="flex items-center justify-center min-h-screen" role="status">
      <LoadingSpinner />
      <span className="ml-3 text-text-secondary">{LOADING_LABEL}</span>
    </div>
  );
}
