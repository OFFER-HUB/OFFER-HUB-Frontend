/** @type {import('next').NextConfig} */
const nextConfig = {
  // Image optimization configuration
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },

  // Compression
  compress: true,

  // Power optimizations by reducing bundle size
  reactStrictMode: true,

  // Experimental features for better performance
  experimental: {
    optimizePackageImports: ["@/components/ui", "@/lib"],
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https:",
              "font-src 'self' data:",
              "connect-src 'self' https:",
              "frame-ancestors 'none'",
              "form-action 'self'",
              "base-uri 'self'",
            ].join("; "),
          },
          // Cache static assets for better performance
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      // Override cache for HTML pages (dynamic content)
      {
        source: "/:path*",
        has: [
          {
            type: "header",
            key: "accept",
            value: "(.*text/html.*)",
          },
        ],
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
