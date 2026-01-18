import type { Metadata, Viewport } from "next";
import "@/app/globals.css";
import { NavigationProgressProvider } from "@/components/providers/NavigationProgressProvider";
import { SITE_CONFIG, DEFAULT_OG_IMAGE, getOrganizationSchema, getWebsiteSchema } from "@/lib/seo";

export const metadata: Metadata = {
  title: {
    default: SITE_CONFIG.name,
    template: `%s | ${SITE_CONFIG.name}`,
  },
  description: SITE_CONFIG.description,
  metadataBase: new URL(SITE_CONFIG.url),
  icons: {
    icon: "/OFFER-HUB-logo.png",
    shortcut: "/OFFER-HUB-logo.png",
    apple: "/OFFER-HUB-logo.png",
  },
  openGraph: {
    type: "website",
    locale: SITE_CONFIG.locale,
    url: SITE_CONFIG.url,
    siteName: SITE_CONFIG.name,
    title: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    site: SITE_CONFIG.twitterHandle,
    title: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    images: [DEFAULT_OG_IMAGE.url],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Add verification tokens when available
    // google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#149A9B",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(getOrganizationSchema()),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(getWebsiteSchema()),
          }}
        />
      </head>
      <body>
        <NavigationProgressProvider />
        {children}
      </body>
    </html>
  );
}
