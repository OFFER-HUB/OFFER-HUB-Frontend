import type { Metadata } from "next";
import Link from "next/link";
import { Navbar, Footer } from "@/components/landing";
import { Container } from "@/components/ui";
import { generatePageMetadata } from "@/lib/seo";

export const metadata: Metadata = generatePageMetadata({
  title: "Terms of Service",
  description: "Read the Terms of Service for OFFER HUB. Understand your rights and responsibilities when using our freelancing marketplace platform.",
  path: "/terms",
});

const LAST_UPDATED = "January 17, 2026";

export default function TermsPage(): React.JSX.Element {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 py-12 lg:py-16">
        <Container>
          <div className="max-w-4xl mx-auto">
            <header className="mb-10">
              <h1 className="text-3xl lg:text-4xl font-bold text-text-primary mb-4">
                Terms of Service
              </h1>
              <p className="text-text-secondary">
                Last updated: {LAST_UPDATED}
              </p>
            </header>

            <div className="prose prose-lg max-w-none">
              <section className="mb-10">
                <h2 className="text-2xl font-bold text-text-primary mb-4">
                  1. Acceptance of Terms
                </h2>
                <p className="text-text-secondary mb-4">
                  By accessing or using OFFER HUB (&quot;the Platform&quot;), you agree to be bound by these
                  Terms of Service (&quot;Terms&quot;). If you do not agree to these Terms, please do not
                  use our services.
                </p>
                <p className="text-text-secondary">
                  These Terms apply to all users of the Platform, including freelancers, clients,
                  and visitors.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold text-text-primary mb-4">
                  2. Description of Services
                </h2>
                <p className="text-text-secondary mb-4">
                  OFFER HUB is an online marketplace that connects freelancers with clients seeking
                  professional services. We provide the platform infrastructure to facilitate these
                  connections but are not a party to the agreements between freelancers and clients.
                </p>
                <p className="text-text-secondary">
                  Our services include but are not limited to: user account management, project posting,
                  proposal submission, messaging, payment processing, and dispute resolution assistance.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold text-text-primary mb-4">
                  3. User Accounts
                </h2>
                <p className="text-text-secondary mb-4">
                  To use certain features of the Platform, you must register for an account. You agree to:
                </p>
                <ul className="list-disc pl-6 text-text-secondary space-y-2 mb-4">
                  <li>Provide accurate, current, and complete information during registration</li>
                  <li>Maintain and promptly update your account information</li>
                  <li>Keep your password secure and confidential</li>
                  <li>Accept responsibility for all activities under your account</li>
                  <li>Notify us immediately of any unauthorized access to your account</li>
                </ul>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold text-text-primary mb-4">
                  4. User Conduct
                </h2>
                <p className="text-text-secondary mb-4">
                  You agree not to use the Platform to:
                </p>
                <ul className="list-disc pl-6 text-text-secondary space-y-2 mb-4">
                  <li>Violate any applicable laws or regulations</li>
                  <li>Infringe on intellectual property rights of others</li>
                  <li>Post false, misleading, or fraudulent content</li>
                  <li>Harass, abuse, or harm other users</li>
                  <li>Attempt to circumvent Platform fees or security measures</li>
                  <li>Use automated systems to access the Platform without permission</li>
                </ul>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold text-text-primary mb-4">
                  5. Payments and Fees
                </h2>
                <p className="text-text-secondary mb-4">
                  OFFER HUB charges service fees for transactions conducted through the Platform.
                  Current fee structures are displayed in your account settings. We reserve the right
                  to modify fees with reasonable notice.
                </p>
                <p className="text-text-secondary">
                  All payments are processed through secure third-party payment providers. Users are
                  responsible for any taxes applicable to their earnings or purchases.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold text-text-primary mb-4">
                  6. Intellectual Property
                </h2>
                <p className="text-text-secondary mb-4">
                  Work product ownership is determined by the agreement between freelancers and clients.
                  OFFER HUB does not claim ownership of user-generated content but requires a license
                  to display and operate the Platform.
                </p>
                <p className="text-text-secondary">
                  The OFFER HUB name, logo, and platform design are our intellectual property and may
                  not be used without permission.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold text-text-primary mb-4">
                  7. Limitation of Liability
                </h2>
                <p className="text-text-secondary mb-4">
                  OFFER HUB provides the Platform &quot;as is&quot; without warranties of any kind. We are not
                  liable for any indirect, incidental, special, or consequential damages arising from
                  your use of the Platform.
                </p>
                <p className="text-text-secondary">
                  Our total liability for any claims shall not exceed the fees paid by you to OFFER HUB
                  in the twelve months preceding the claim.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold text-text-primary mb-4">
                  8. Termination
                </h2>
                <p className="text-text-secondary">
                  We may suspend or terminate your account at our discretion for violation of these Terms
                  or for any other reason. You may close your account at any time by contacting support.
                  Upon termination, your right to use the Platform ceases immediately.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold text-text-primary mb-4">
                  9. Changes to Terms
                </h2>
                <p className="text-text-secondary">
                  We may modify these Terms at any time. Material changes will be communicated via email
                  or Platform notification. Continued use of the Platform after changes constitutes
                  acceptance of the modified Terms.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold text-text-primary mb-4">
                  10. Contact Information
                </h2>
                <p className="text-text-secondary mb-4">
                  If you have questions about these Terms, please contact us:
                </p>
                <ul className="list-none text-text-secondary space-y-2">
                  <li>Email: legal@offer-hub.org</li>
                  <li>
                    Help Center:{" "}
                    <Link href="/help" className="text-primary hover:underline">
                      offer-hub.org/help
                    </Link>
                  </li>
                </ul>
              </section>
            </div>

            <div className="mt-12 pt-8 border-t border-border-light">
              <p className="text-sm text-text-secondary">
                By using OFFER HUB, you acknowledge that you have read, understood, and agree to be
                bound by these Terms of Service. See also our{" "}
                <Link href="/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  );
}
