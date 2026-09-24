import type { FAQCategory } from "@/types/faq.types";

export const faqCategories: FAQCategory[] = [
  {
    id: "general",
    name: "General Questions",
    icon: "help-circle",
    items: [
      {
        id: "general-1",
        question: "What is OFFER HUB?",
        answer:
          "OFFER HUB is a decentralized freelance marketplace built on Stellar blockchain. It connects clients with talented freelancers worldwide, enabling secure and transparent transactions using cryptocurrency.",
      },
      {
        id: "general-2",
        question: "How do I get started on OFFER HUB?",
        answer:
          "Getting started is easy! Simply create an account, connect your Stellar wallet, complete your profile, and you can start browsing jobs or posting projects. Our onboarding guide will walk you through each step.",
      },
      {
        id: "general-3",
        question: "Is OFFER HUB free to use?",
        answer:
          "Creating an account and browsing the platform is completely free. We charge a small service fee only when a project is successfully completed, ensuring you only pay when you get results.",
      },
      {
        id: "general-4",
        question: "What makes OFFER HUB different from other freelance platforms?",
        answer:
          "OFFER HUB leverages blockchain technology for transparent, secure, and fast payments. Smart contracts ensure fair dealings, and our decentralized approach gives both clients and freelancers more control over their work and earnings.",
      },
    ],
  },
  {
    id: "payments",
    name: "Payments & Billing",
    icon: "credit-card",
    items: [
      {
        id: "payments-1",
        question: "What payment methods are supported?",
        answer:
          "OFFER HUB primarily uses Stellar Lumens (XLM) and other Stellar-based tokens for payments. You can easily convert to and from traditional currencies using integrated exchange partners.",
      },
      {
        id: "payments-2",
        question: "How do escrow payments work?",
        answer:
          "When a client funds a project, the payment is held in a smart contract escrow. Funds are released to the freelancer only when milestones are approved or the project is completed, protecting both parties.",
      },
      {
        id: "payments-3",
        question: "What are the platform fees?",
        answer:
          "We charge a competitive 5% service fee on completed projects. This fee covers platform maintenance, dispute resolution services, and continuous improvements to the platform.",
      },
      {
        id: "payments-4",
        question: "How quickly can I withdraw my earnings?",
        answer:
          "Thanks to Stellar's fast blockchain, withdrawals are processed within seconds. Once funds are released from escrow, they're immediately available in your wallet for withdrawal or use.",
      },
    ],
  },
  {
    id: "security",
    name: "Security & Privacy",
    icon: "shield",
    items: [
      {
        id: "security-1",
        question: "How is my personal information protected?",
        answer:
          "We use industry-standard encryption for all personal data. Your information is stored securely and never shared with third parties without your explicit consent. We comply with GDPR and other privacy regulations.",
      },
      {
        id: "security-2",
        question: "Is my wallet secure on OFFER HUB?",
        answer:
          "We never store your private keys. All wallet connections use secure protocols, and you maintain full control of your funds at all times. We recommend using hardware wallets for additional security.",
      },
      {
        id: "security-3",
        question: "What happens if there's a dispute?",
        answer:
          "Our dispute resolution system involves neutral arbitrators who review evidence from both parties. The smart contract holds funds until the dispute is resolved, ensuring fair outcomes for everyone.",
      },
      {
        id: "security-4",
        question: "How do you verify freelancer identities?",
        answer:
          "We offer optional identity verification badges. Verified freelancers complete KYC checks, providing clients with additional assurance when hiring for sensitive projects.",
      },
    ],
  },
  {
    id: "technical",
    name: "Technical Support",
    icon: "settings",
    items: [
      {
        id: "technical-1",
        question: "Which wallets are compatible with OFFER HUB?",
        answer:
          "We support all major Stellar wallets including Freighter, Lobstr, and Solar. Hardware wallet support is available through compatible browser extensions.",
      },
      {
        id: "technical-2",
        question: "I'm having trouble connecting my wallet. What should I do?",
        answer:
          "First, ensure your wallet extension is updated and your browser allows the connection. Try refreshing the page or clearing your browser cache. If issues persist, contact our support team.",
      },
      {
        id: "technical-3",
        question: "What browsers are supported?",
        answer:
          "OFFER HUB works best on Chrome, Firefox, Brave, and Edge. We recommend keeping your browser updated to the latest version for optimal performance and security.",
      },
      {
        id: "technical-4",
        question: "How do I report a bug or technical issue?",
        answer:
          "You can report issues through our GitHub repository, Discord community, or by emailing support@offerhub.io. Please include screenshots and detailed descriptions to help us resolve issues quickly.",
      },
    ],
  },
  {
    id: "clients",
    name: "For Clients",
    icon: "briefcase",
    items: [
      {
        id: "clients-1",
        question: "How do I post a job on OFFER HUB?",
        answer:
          "Click 'Post a Job' from your dashboard, fill in project details including description, budget, and timeline. You can set it as public or invite specific freelancers. Fund the escrow to make your job visible.",
      },
      {
        id: "clients-2",
        question: "How do I choose the right freelancer?",
        answer:
          "Review freelancer profiles, portfolios, ratings, and reviews from previous clients. You can also conduct interviews and request sample work before making your decision.",
      },
      {
        id: "clients-3",
        question: "Can I hire multiple freelancers for one project?",
        answer:
          "Yes! You can break your project into milestones and assign different freelancers to each, or create a team project where multiple freelancers collaborate on your work.",
      },
      {
        id: "clients-4",
        question: "What if I'm not satisfied with the work?",
        answer:
          "Communicate concerns with your freelancer first. If issues can't be resolved, you can open a dispute. Our arbitration system will review the case and determine a fair resolution based on the project agreement.",
      },
    ],
  },
  {
    id: "freelancers",
    name: "For Freelancers",
    icon: "user",
    items: [
      {
        id: "freelancers-1",
        question: "How do I create a compelling profile?",
        answer:
          "Complete all profile sections, showcase your best work in your portfolio, get verified, and actively request reviews from satisfied clients. A complete profile significantly increases your chances of being hired.",
      },
      {
        id: "freelancers-2",
        question: "How do I find suitable jobs?",
        answer:
          "Use our search filters to find jobs matching your skills and preferences. Set up job alerts to be notified of new opportunities. You can also apply to jobs directly or wait for client invitations.",
      },
      {
        id: "freelancers-3",
        question: "How are ratings calculated?",
        answer:
          "Your rating is based on client reviews across categories: quality of work, communication, timeliness, and professionalism. Consistent high performance builds your reputation and attracts more clients.",
      },
      {
        id: "freelancers-4",
        question: "Can I work with clients outside the platform?",
        answer:
          "We encourage all transactions to go through OFFER HUB for your protection. Off-platform work isn't covered by our escrow or dispute resolution services. Repeated off-platform solicitation may result in account restrictions.",
      },
    ],
  },
];
