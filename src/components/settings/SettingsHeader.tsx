import Link from "next/link";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";

interface SettingsHeaderProps {
  icon: string;
  title: string;
  description: string;
  /** The hub page itself has nowhere to go back to. */
  showBack?: boolean;
}

/** Shared banner for every settings sub-page, so they all read as one section. */
export function SettingsHeader({ icon, title, description, showBack = true }: SettingsHeaderProps): React.JSX.Element {
  return (
    <div className="rounded-2xl bg-gradient-to-r from-primary to-secondary p-6 text-white shadow-lg shadow-primary/10">
      {showBack && (
        <Link
          href="/app/settings"
          className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-white/80 transition-colors hover:text-white hover:underline"
        >
          <Icon path={ICON_PATHS.chevronLeft} size="sm" />
          Back to settings
        </Link>
      )}
      <h1 className="flex items-center gap-3 text-2xl font-bold">
        <Icon path={icon} size="lg" />
        {title}
      </h1>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/80">{description}</p>
    </div>
  );
}
