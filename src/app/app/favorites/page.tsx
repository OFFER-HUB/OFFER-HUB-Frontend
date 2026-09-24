import type { Metadata } from "next";
import { FavoritesList } from "@/components/favorites/FavoritesList";

export const metadata: Metadata = {
  title: "Favorites | Offer Hub",
  robots: { index: false, follow: false },
};

export default function FavoritesPage(): React.JSX.Element {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary">Favorites</h1>
        <p className="text-text-secondary mt-1">Your saved offers, services, and freelancers.</p>
      </div>
      <FavoritesList />
    </div>
  );
}
