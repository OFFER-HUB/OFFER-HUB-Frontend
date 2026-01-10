import Link from "next/link";
import { Icon } from "@/components/ui/Icon";

interface EmptyStateProps {
  icon: string;
  message: string;
  linkHref?: string;
  linkText?: string;
}

export function EmptyState({
  icon,
  message,
  linkHref,
  linkText,
}: EmptyStateProps): React.JSX.Element {
  return (
    <div className="text-center py-12">
      <Icon path={icon} size="xl" className="text-text-secondary mx-auto mb-4" />
      <p className="text-text-secondary">{message}</p>
      {linkHref && linkText && (
        <Link
          href={linkHref}
          className="text-primary hover:underline mt-2 inline-block"
        >
          {linkText}
        </Link>
      )}
    </div>
  );
}
