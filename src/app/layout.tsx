import type { Metadata } from "next";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "OFFER-HUB",
  description: "OFFER-HUB - Your marketplace platform",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
