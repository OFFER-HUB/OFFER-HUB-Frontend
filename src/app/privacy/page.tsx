import type { Metadata } from "next";
import Link from "next/link";
import { Navbar, Footer } from "@/components/landing";
import { Container } from "@/components/ui";
import { generatePageMetadata } from "@/lib/seo";

export const metadata: Metadata = generatePageMetadata({
  title: "Privacy Policy",
  description: "Learn how OFFER HUB collects, uses, and protects your personal information. Our commitment to your privacy and data security.",
  path: "/privacy",
});

const LAST_UPDATED = "January 17, 2026";

export default function PrivacyPage(): React.JSX.Element {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 py-12 lg:py-16">
        <Container>
          <div className="max-w-4xl mx-auto">
            <header className="mb-10">
              <h1 className="text-3xl lg:text-4xl font-bold text-text-primary mb-4">
                Privacy Policy
              </h1>
              <p className="text-text-secondary">
                Last updated: {LAST_UPDATED}
              </p>
            </header>

            <div className="prose prose-lg max-w-none">
              <section className="mb-10">
                <h2 className="text-2xl font-bold text-text-primary mb-4">
                  1. Introduction
                </h2>
                <p className="text-text-secondary mb-4">
                  OFFER HUB (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. This
                  Privacy Policy explains how we collect, use, disclose, and safeguard your information
                  when you use our platform.
                </p>
                <p className="text-text-secondary">
                  By using OFFER HUB, you consent to the data practices described in this policy. If you
                  do not agree with our policies, please do not use our services.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold text-text-primary mb-4">
                  2. Information We Collect
                </h2>

                <h3 className="text-xl font-semibold text-text-primary mb-3 mt-6">
                  2.1 Information You Provide
                </h3>
                <ul className="list-disc pl-6 text-text-secondary space-y-2 mb-4">
                  <li>Account information (name, email, password)</li>
                  <li>Profile information (bio, skills, portfolio)</li>
                  <li>Payment information (processed by secure third-party providers)</li>
                  <li>Communications (messages, support tickets)</li>
                  <li>Content you create (proposals, reviews, comments)</li>
                </ul>

                <h3 className="text-xl font-semibold text-text-primary mb-3 mt-6">
                  2.2 Information Collected Automatically
                </h3>
                <ul className="list-disc pl-6 text-text-secondary space-y-2 mb-4">
                  <li>Device information (browser type, operating system)</li>
                  <li>Log data (IP address, access times, pages viewed)</li>
                  <li>Cookies and similar tracking technologies</li>
                  <li>Usage patterns and preferences</li>
                </ul>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold text-text-primary mb-4">
                  3. How We Use Your Information
                </h2>
                <p className="text-text-secondary mb-4">
                  We use collected information to:
                </p>
                <ul className="list-disc pl-6 text-text-secondary space-y-2 mb-4">
                  <li>Provide and maintain our services</li>
                  <li>Process transactions and send related information</li>
                  <li>Send administrative messages and updates</li>
                  <li>Respond to comments, questions, and support requests</li>
                  <li>Monitor and analyze usage trends</li>
                  <li>Detect, prevent, and address technical issues and fraud</li>
                  <li>Personalize your experience on the platform</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold text-text-primary mb-4">
                  4. Information Sharing
                </h2>
                <p className="text-text-secondary mb-4">
                  We may share your information in the following circumstances:
                </p>
                <ul className="list-disc pl-6 text-text-secondary space-y-2 mb-4">
                  <li>
                    <strong>With other users:</strong> Profile information visible to facilitate
                    business relationships
                  </li>
                  <li>
                    <strong>With service providers:</strong> Third parties that assist in operating
                    our platform
                  </li>
                  <li>
                    <strong>For legal compliance:</strong> When required by law or to protect rights
                  </li>
                  <li>
                    <strong>Business transfers:</strong> In connection with mergers or acquisitions
                  </li>
                  <li>
                    <strong>With your consent:</strong> For any other purpose with your permission
                  </li>
                </ul>
                <p className="text-text-secondary">
                  We do not sell your personal information to third parties for marketing purposes.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold text-text-primary mb-4">
                  5. Cookies and Tracking
                </h2>
                <p className="text-text-secondary mb-4">
                  We use cookies and similar technologies to:
                </p>
                <ul className="list-disc pl-6 text-text-secondary space-y-2 mb-4">
                  <li>Remember your preferences and settings</li>
                  <li>Authenticate users and prevent fraud</li>
                  <li>Analyze site traffic and usage patterns</li>
                  <li>Deliver relevant content and features</li>
                </ul>
                <p className="text-text-secondary">
                  You can manage cookie preferences through our cookie consent banner or your browser
                  settings. Note that disabling certain cookies may affect platform functionality.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold text-text-primary mb-4">
                  6. Data Security
                </h2>
                <p className="text-text-secondary mb-4">
                  We implement appropriate technical and organizational measures to protect your
                  information, including:
                </p>
                <ul className="list-disc pl-6 text-text-secondary space-y-2 mb-4">
                  <li>Encryption of data in transit and at rest</li>
                  <li>Regular security assessments and audits</li>
                  <li>Access controls and authentication measures</li>
                  <li>Employee training on data protection</li>
                </ul>
                <p className="text-text-secondary">
                  However, no method of transmission over the Internet is 100% secure. We cannot
                  guarantee absolute security of your data.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold text-text-primary mb-4">
                  7. Your Rights
                </h2>
                <p className="text-text-secondary mb-4">
                  Depending on your location, you may have the following rights:
                </p>
                <ul className="list-disc pl-6 text-text-secondary space-y-2 mb-4">
                  <li>
                    <strong>Access:</strong> Request a copy of your personal data
                  </li>
                  <li>
                    <strong>Correction:</strong> Request correction of inaccurate data
                  </li>
                  <li>
                    <strong>Deletion:</strong> Request deletion of your data
                  </li>
                  <li>
                    <strong>Portability:</strong> Receive your data in a structured format
                  </li>
                  <li>
                    <strong>Objection:</strong> Object to certain processing activities
                  </li>
                  <li>
                    <strong>Withdraw consent:</strong> Withdraw previously given consent
                  </li>
                </ul>
                <p className="text-text-secondary">
                  To exercise these rights, please contact us at privacy@offer-hub.org.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold text-text-primary mb-4">
                  8. Data Retention
                </h2>
                <p className="text-text-secondary">
                  We retain your personal information for as long as your account is active or as
                  needed to provide services. We may retain certain information for longer periods
                  as required by law or for legitimate business purposes, such as fraud prevention
                  or dispute resolution.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold text-text-primary mb-4">
                  9. International Transfers
                </h2>
                <p className="text-text-secondary">
                  Your information may be transferred to and processed in countries other than your
                  own. We ensure appropriate safeguards are in place to protect your data in accordance
                  with applicable laws.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold text-text-primary mb-4">
                  10. Children&apos;s Privacy
                </h2>
                <p className="text-text-secondary">
                  OFFER HUB is not intended for users under 18 years of age. We do not knowingly
                  collect personal information from children. If you believe we have collected
                  information from a child, please contact us immediately.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold text-text-primary mb-4">
                  11. Changes to This Policy
                </h2>
                <p className="text-text-secondary">
                  We may update this Privacy Policy from time to time. We will notify you of any
                  material changes by posting the new policy on this page and updating the
                  &quot;Last updated&quot; date. We encourage you to review this policy periodically.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold text-text-primary mb-4">
                  12. Contact Us
                </h2>
                <p className="text-text-secondary mb-4">
                  If you have questions about this Privacy Policy or our data practices, please contact us:
                </p>
                <ul className="list-none text-text-secondary space-y-2">
                  <li>Email: privacy@offer-hub.org</li>
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
                By using OFFER HUB, you acknowledge that you have read and understood this Privacy
                Policy. See also our{" "}
                <Link href="/terms" className="text-primary hover:underline">
                  Terms of Service
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
