import type { Metadata } from "next";

// Site configuration
export const SITE_CONFIG = {
  name: "OFFER HUB",
  description: "Connect with top freelancers and clients on OFFER HUB - the premier marketplace for professional services. Find talent, post projects, and grow your business.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://offer-hub.org",
  locale: "en_US",
  twitterHandle: "@offerhub",
} as const;

// Default Open Graph image
export const DEFAULT_OG_IMAGE = {
  url: "/og-image.png",
  width: 1200,
  height: 630,
  alt: "OFFER HUB - Freelance Marketplace",
} as const;

/**
 * Generate metadata for a page with SEO best practices
 */
export function generatePageMetadata({
  title,
  description,
  path = "",
  image,
  noIndex = false,
}: {
  title: string;
  description: string;
  path?: string;
  image?: {
    url: string;
    width?: number;
    height?: number;
    alt?: string;
  };
  noIndex?: boolean;
}): Metadata {
  const fullTitle = title === SITE_CONFIG.name ? title : `${title} | ${SITE_CONFIG.name}`;
  const canonicalUrl = `${SITE_CONFIG.url}${path}`;
  const ogImage = image || DEFAULT_OG_IMAGE;

  return {
    title: fullTitle,
    description,
    metadataBase: new URL(SITE_CONFIG.url),
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: fullTitle,
      description,
      url: canonicalUrl,
      siteName: SITE_CONFIG.name,
      locale: SITE_CONFIG.locale,
      type: "website",
      images: [
        {
          url: ogImage.url,
          width: ogImage.width || DEFAULT_OG_IMAGE.width,
          height: ogImage.height || DEFAULT_OG_IMAGE.height,
          alt: ogImage.alt || DEFAULT_OG_IMAGE.alt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      site: SITE_CONFIG.twitterHandle,
      images: [ogImage.url],
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };
}

/**
 * JSON-LD structured data for organization
 */
export function getOrganizationSchema(): object {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    logo: `${SITE_CONFIG.url}/OFFER-HUB-logo.png`,
    description: SITE_CONFIG.description,
    sameAs: [
      `https://twitter.com/${SITE_CONFIG.twitterHandle.replace("@", "")}`,
    ],
  };
}

/**
 * JSON-LD structured data for website
 */
export function getWebsiteSchema(): object {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    description: SITE_CONFIG.description,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_CONFIG.url}/marketplace?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/**
 * JSON-LD structured data for a service listing
 */
export function getServiceSchema({
  name,
  description,
  price,
  currency = "USD",
  provider,
  url,
}: {
  name: string;
  description: string;
  price: number;
  currency?: string;
  provider: string;
  url: string;
}): object {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    provider: {
      "@type": "Person",
      name: provider,
    },
    offers: {
      "@type": "Offer",
      price,
      priceCurrency: currency,
      url,
    },
  };
}

/**
 * JSON-LD structured data for FAQ page
 */
export function getFAQSchema(
  faqs: Array<{ question: string; answer: string }>
): object {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

/**
 * JSON-LD structured data for breadcrumbs
 */
export function getBreadcrumbSchema(
  items: Array<{ name: string; url: string }>
): object {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_CONFIG.url}${item.url}`,
    })),
  };
}
