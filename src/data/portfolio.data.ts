import type { PortfolioItem } from "@/types/portfolio.types";

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

export const MOCK_PORTFOLIO_ITEMS: PortfolioItem[] = [
  {
    id: "p-1",
    title: "E-Commerce Platform Redesign",
    description:
      "Complete redesign of a major e-commerce platform focusing on user experience and conversion optimization. Implemented modern UI patterns, improved checkout flow, and increased mobile responsiveness.",
    category: "web_development",
    tags: ["React", "TypeScript", "Tailwind CSS", "UX"],
    images: [
      "https://images.unsplash.com/photo-1661956602116-aa6865609028?w=800&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=60",
    ],
    projectUrl: "https://example.com/ecommerce-project",
    startDate: "2023-10-01",
    endDate: "2024-01-15",
    isPublic: true,
    order: 0,
    createdAt: "2024-01-15",
    updatedAt: "2024-01-15",
  },
  {
    id: "p-2",
    title: "DeFi Dashboard Application",
    description:
      "Built a comprehensive DeFi dashboard for tracking cryptocurrency portfolios, staking rewards, and liquidity pool positions. Features real-time price updates and wallet integration.",
    category: "web_development",
    tags: ["Next.js", "Web3.js", "DeFi", "Charts"],
    images: [
      "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=800&auto=format&fit=crop&q=60",
    ],
    projectUrl: "https://example.com/defi-dashboard",
    repoUrl: "https://github.com/example/defi-dashboard",
    startDate: "2023-11-01",
    endDate: "2024-02-20",
    isPublic: true,
    order: 1,
    createdAt: "2024-02-20",
    updatedAt: "2024-02-20",
  },
  {
    id: "p-3",
    title: "Mobile Banking App UI",
    description:
      "Designed and developed a mobile banking application interface with focus on accessibility and security. Includes biometric authentication, transaction history, and bill payment features.",
    category: "ui_ux_design",
    tags: ["Figma", "React Native", "Accessibility", "Finance"],
    images: [
      "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=60",
    ],
    projectUrl: "https://example.com/banking-app",
    startDate: "2024-01-10",
    endDate: "2024-03-10",
    isPublic: true,
    order: 2,
    createdAt: "2024-03-10",
    updatedAt: "2024-03-10",
  },
  {
    id: "p-4",
    title: "SaaS Analytics Platform",
    description:
      "Full-stack development of a SaaS analytics platform with custom charts, data visualization, and automated reporting. Built with React, Node.js, and PostgreSQL.",
    category: "data_science",
    tags: ["React", "Node.js", "PostgreSQL", "Recharts"],
    images: [
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=60",
    ],
    repoUrl: "https://github.com/example/saas-analytics",
    startDate: "2023-12-01",
    endDate: "2024-04-05",
    isPublic: false,
    order: 3,
    createdAt: "2024-04-05",
    updatedAt: "2024-04-05",
  },
  {
    id: "p-5",
    title: "Brand Identity Design for TechCorp",
    description:
      "Full brand identity project including logo design, color palette, typography system, and brand guidelines document. Delivered print and digital asset packages.",
    category: "graphic_design",
    tags: ["Branding", "Logo", "Figma", "Illustrator"],
    images: [
      "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&auto=format&fit=crop&q=60",
    ],
    startDate: "2024-02-01",
    endDate: "2024-03-15",
    isPublic: true,
    order: 4,
    createdAt: "2024-03-15",
    updatedAt: "2024-03-15",
  },
];

export function getPortfolioItemById(id: string): PortfolioItem | undefined {
  return MOCK_PORTFOLIO_ITEMS.find((p) => p.id === id);
}
