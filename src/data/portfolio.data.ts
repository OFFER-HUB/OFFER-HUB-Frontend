import type { PortfolioItem } from "@/types/portfolio.types";

export const MAX_IMAGES_PER_ITEM = 5;
export const MAX_TITLE_LENGTH = 100;
export const MAX_DESCRIPTION_LENGTH = 500;
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

export const MOCK_PORTFOLIO_ITEMS: PortfolioItem[] = [
  {
    id: "1",
    title: "E-Commerce Platform Redesign",
    description:
      "Complete redesign of a major e-commerce platform focusing on user experience and conversion optimization. Implemented modern UI patterns, improved checkout flow, and increased mobile responsiveness.",
    images: [
      "https://images.unsplash.com/photo-1661956602116-aa6865609028?w=800&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=60",
    ],
    link: "https://example.com/ecommerce-project",
    order: 0,
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    title: "DeFi Dashboard Application",
    description:
      "Built a comprehensive DeFi dashboard for tracking cryptocurrency portfolios, staking rewards, and liquidity pool positions. Features real-time price updates and wallet integration.",
    images: [
      "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=800&auto=format&fit=crop&q=60",
    ],
    link: "https://example.com/defi-dashboard",
    order: 1,
    createdAt: "2024-02-20",
  },
  {
    id: "3",
    title: "Mobile Banking App UI",
    description:
      "Designed and developed a mobile banking application interface with focus on accessibility and security. Includes biometric authentication, transaction history, and bill payment features.",
    images: [
      "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=60",
    ],
    link: "https://example.com/banking-app",
    order: 2,
    createdAt: "2024-03-10",
  },
  {
    id: "4",
    title: "SaaS Analytics Platform",
    description:
      "Full-stack development of a SaaS analytics platform with custom charts, data visualization, and automated reporting. Built with React, Node.js, and PostgreSQL.",
    images: [
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=60",
    ],
    order: 3,
    createdAt: "2024-04-05",
  },
];
