import type { Metadata } from "next";
import { NotificationsList } from "@/components/notifications/NotificationsList";

export const metadata: Metadata = {
  title: "Notifications | Offer Hub",
  robots: { index: false, follow: false },
};

export default function NotificationsPage(): React.JSX.Element {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Notifications</h1>
        <p className="text-text-secondary mt-1">Updates about your orders, offers, messages and payments.</p>
      </div>
      <NotificationsList />
    </div>
  );
}
