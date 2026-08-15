import Link from "next/link";
import { cn } from "@/lib/cn";
import { NEUMORPHIC_CARD, PRIMARY_BUTTON } from "@/lib/styles";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";

const ORDERS_ROUTE = "/app/orders";

/**
 * Shown when the order request came back empty — either it does not exist or it
 * belongs to somebody else. The two cases are deliberately not distinguished.
 */
export function OrderNotFoundCard(): React.JSX.Element {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className={cn(NEUMORPHIC_CARD, "text-center py-12")}>
        <Icon path={ICON_PATHS.alertCircle} size="lg" className="text-error mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-text-primary mb-2">Order Not Found</h2>
        <p className="text-text-secondary mb-6">
          The order you&apos;re looking for doesn&apos;t exist or you don&apos;t have access.
        </p>
        <Link href={ORDERS_ROUTE} className={PRIMARY_BUTTON}>
          Back to Orders
        </Link>
      </div>
    </div>
  );
}
