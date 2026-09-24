import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo";

export const metadata: Metadata = generatePageMetadata({
  title: "Our Global Community",
  description:
    "Explore the OFFER HUB global community. Connect with talented freelancers and clients from around the world on our interactive map.",
  path: "/our-community",
});

export default function OurCommunityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-gray-950 min-h-screen">
      {children}
    </div>
  );
}
