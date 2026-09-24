import { SessionsManager } from "@/components/settings/SessionsManager";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import Link from "next/link";

export const metadata = {
  title: "Sessions | Settings | OFFER-HUB",
};

export default function SessionsPage(): React.JSX.Element {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-linear-to-r from-primary to-secondary p-6 text-white shadow-lg shadow-primary/10">
        <div className="mb-4">
          <Link
            href="/app/settings"
            className="inline-flex items-center gap-1 text-sm font-medium text-white/80 hover:text-white hover:underline transition-colors"
          >
            <Icon path={ICON_PATHS.chevronLeft} size="sm" />
            Back to settings
          </Link>
        </div>
        <h1 className="text-2xl font-bold flex items-center gap-3">
          <Icon path={ICON_PATHS.shield} size="xl" />
          Active Sessions
        </h1>
        <p className="mt-2 text-sm text-white/80 max-w-xl leading-relaxed">
          Review the devices currently logged into your account. If you don't recognize a device or
          location, sign out of that session and consider changing your password to secure your
          account.
        </p>
      </div>

      <SessionsManager />
    </div>
  );
}
