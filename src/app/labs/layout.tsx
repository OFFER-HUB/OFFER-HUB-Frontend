import type { Metadata } from "next";

/**
 * `/labs` holds isolated evaluation pages that are not part of the product.
 * They must never be indexed — same posture as the authenticated app shell in
 * `src/app/app/layout.tsx`.
 */
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

interface LabsLayoutProps {
  children: React.ReactNode;
}

export default function LabsLayout({ children }: LabsLayoutProps): React.JSX.Element {
  return <>{children}</>;
}
