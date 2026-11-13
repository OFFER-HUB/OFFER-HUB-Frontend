import { SessionsManager } from "@/components/settings/SessionsManager";
import { SettingsHeader } from "@/components/settings/SettingsHeader";
import { ICON_PATHS } from "@/components/ui/Icon";

export const metadata = {
  title: "Sessions | Settings | OFFER-HUB",
};

export default function SessionsPage(): React.JSX.Element {
  return (
    <div className="space-y-6">
      <SettingsHeader
        icon={ICON_PATHS.shield}
        title="Active Sessions"
        description="Review the devices currently logged into your account. If you don't recognize a device, sign out of that session and consider changing your password."
      />
      <SessionsManager />
    </div>
  );
}
