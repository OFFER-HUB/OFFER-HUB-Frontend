import { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://offer-hub.org";

export default function sitemap(): MetadataRoute.Sitemap {
  const currentDate = new Date().toISOString();

  // Static public pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE_URL}/marketplace`,
      lastModified: currentDate,
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/faq`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/help`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/login`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/register`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  // TODO: Add dynamic pages (marketplace listings, user profiles) when data fetching is implemented
  // const dynamicPages = await fetchDynamicPages();

  return [...staticPages];
}
