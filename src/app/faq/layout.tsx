import type { Metadata } from "next";
import { generatePageMetadata, getFAQSchema } from "@/lib/seo";

// FAQ data for structured data (simplified version)
const FAQ_ITEMS = [
  {
    question: "What is OFFER HUB?",
    answer:
      "OFFER HUB is a freelance marketplace connecting businesses with talented professionals worldwide.",
  },
  {
    question: "How do I get started as a freelancer?",
    answer:
      "Create an account, complete your profile, and start offering your services to potential clients.",
  },
  {
    question: "How do I hire a freelancer?",
    answer:
      "Browse our marketplace, review freelancer profiles, and send project proposals to professionals that match your needs.",
  },
  {
    question: "What payment methods are supported?",
    answer:
      "We support various payment methods including credit cards, PayPal, and bank transfers for secure transactions.",
  },
  {
    question: "How does OFFER HUB protect my payments?",
    answer:
      "We use escrow payments to ensure funds are held securely until project milestones are completed and approved.",
  },
];

export const metadata: Metadata = generatePageMetadata({
  title: "FAQ",
  description:
    "Find answers to frequently asked questions about OFFER HUB. Learn about our freelance marketplace, payments, and how to get started.",
  path: "/faq",
});

export default function FAQLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(getFAQSchema(FAQ_ITEMS)),
        }}
      />
      {children}
    </>
  );
}
