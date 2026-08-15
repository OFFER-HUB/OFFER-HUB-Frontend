import { NEUMORPHIC_CARD } from "@/lib/styles";

const EMPTY_DESCRIPTION_LABEL = "No description provided";

interface OrderDescriptionCardProps {
  description: string | null | undefined;
}

/**
 * Free-text brief attached to the order.
 */
export function OrderDescriptionCard({
  description,
}: OrderDescriptionCardProps): React.JSX.Element {
  return (
    <div className={NEUMORPHIC_CARD}>
      <h2 className="text-lg font-semibold text-text-primary mb-4">Description</h2>
      <p className="text-text-secondary break-words">
        {description || EMPTY_DESCRIPTION_LABEL}
      </p>
    </div>
  );
}
