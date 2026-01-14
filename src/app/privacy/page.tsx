import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - Builders.to",
  description: "Privacy Policy for Builders.to - Learn how we collect, use, and protect your information.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-zinc-950 py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            href="/"
            className="text-orange-500 hover:text-orange-400 transition-colors text-sm"
          >
            ← Back to Home
          </Link>
        </div>

        <h1 className="text-4xl font-bold text-white mb-2">Privacy Policy</h1>
        <p className="text-zinc-500 mb-12">Last updated: January 14, 2026</p>

        <div className="prose prose-invert prose-zinc max-w-none">
          <div className="space-y-8 text-zinc-300">

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">1. Introduction</h2>
              <p className="leading-relaxed">
                Welcome to Builders.to (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). We are committed to protecting your
                privacy and personal information. This Privacy Policy explains how we collect, use,
                disclose, and safeguard your information when you use our website and services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">2. Information We Collect</h2>

              <h3 className="text-xl font-medium text-white mt-6 mb-3">2.1 Information You Provide</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong className="text-white">Account Information:</strong> When you sign in using OAuth providers (Google, GitHub, or X/Twitter), we receive your name, email address, and profile picture from those services.</li>
                <li><strong className="text-white">Profile Information:</strong> Username, display name, bio, headline, location (city, state, country), website, and social media links you choose to add to your profile.</li>
                <li><strong className="text-white">Project Information:</strong> Details about projects you submit including titles, descriptions, images, URLs, tags, and milestone data.</li>
                <li><strong className="text-white">Company Information:</strong> Business details you provide when creating company profiles, including tech stack, traction metrics, and team information.</li>
                <li><strong className="text-white">Content:</strong> Daily updates, comments, endorsements, and any other content you post on the platform.</li>
                <li><strong className="text-white">Service Listings:</strong> Information about services you offer, including descriptions, pricing, and portfolio projects.</li>
                <li><strong className="text-white">Local Listings:</strong> Classified listings you create, including contact information you choose to share.</li>
                <li><strong className="text-white">Job Postings:</strong> Information about roles and positions you post for your company.</li>
              </ul>

              <h3 className="text-xl font-medium text-white mt-6 mb-3">2.2 Information Collected Automatically</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong className="text-white">Usage Data:</strong> Information about how you interact with our services, including pages visited, features used, and content viewed.</li>
                <li><strong className="text-white">Device Information:</strong> Browser type, operating system, and device identifiers.</li>
                <li><strong className="text-white">Log Data:</strong> IP address, access times, referring URLs, and request data.</li>
                <li><strong className="text-white">Analytics:</strong> View counts, click tracking, and engagement metrics for projects, listings, and advertisements.</li>
              </ul>

              <h3 className="text-xl font-medium text-white mt-6 mb-3">2.3 Information from Third Parties</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong className="text-white">OAuth Providers:</strong> Profile information from Google, GitHub, or X/Twitter when you authenticate.</li>
                <li><strong className="text-white">Stripe:</strong> For companies participating in the forecasting feature, we may receive limited financial data (MRR metrics) with explicit consent.</li>
                <li><strong className="text-white">Giphy:</strong> When you use GIFs in posts, we interact with the Giphy API on your behalf.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">3. How We Use Your Information</h2>
              <p className="mb-4">We use the information we collect to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide, maintain, and improve our services</li>
                <li>Create and manage your account</li>
                <li>Display your projects, profile, and content to the community</li>
                <li>Enable interactions between community members (comments, upvotes, follows, endorsements)</li>
                <li>Process token rewards for engagement, referrals, and profile completion</li>
                <li>Facilitate the forecasting system and track reputation coins</li>
                <li>Process payments through Stripe for services, listings, and advertisements</li>
                <li>Send important service-related communications</li>
                <li>Send optional daily and weekly digest emails (you can opt out)</li>
                <li>Deliver push notifications (with your explicit consent)</li>
                <li>Protect against fraud, abuse, and policy violations</li>
                <li>Comply with legal obligations</li>
                <li>Generate anonymized analytics and statistics</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">4. Token and Coin Systems</h2>
              <p className="mb-4">Builders.to operates two virtual currency systems:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong className="text-white">Builder Tokens:</strong> Earned through engagement, referrals, streaks, and profile completion. Can be used to redeem advertisements, service listings, and local listings. Token transactions and balances are tracked for your account.</li>
                <li><strong className="text-white">Forecasting Coins:</strong> A separate virtual currency used in the company forecasting system. Your coin balance, forecast history, and accuracy metrics are tracked to power leaderboards and reputation features.</li>
              </ul>
              <p className="mt-4">
                These virtual currencies have no real-world monetary value and cannot be exchanged for cash.
                We reserve the right to modify, reset, or discontinue these systems at any time.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">5. Information Sharing</h2>
              <p className="mb-4">We may share your information in the following circumstances:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong className="text-white">Public Content:</strong> Your profile, projects, companies, updates, comments, endorsements, service listings, local listings, and job postings are publicly visible to other users and visitors.</li>
                <li><strong className="text-white">Leaderboards:</strong> Token earnings, forecasting accuracy, and streak data may appear on public leaderboards.</li>
                <li><strong className="text-white">Service Providers:</strong> We share information with third-party vendors who assist in operating our services:
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>Stripe for payment processing</li>
                    <li>Resend for email delivery</li>
                    <li>Giphy for GIF integration</li>
                    <li>Infrastructure providers for hosting and database services</li>
                  </ul>
                </li>
                <li><strong className="text-white">Legal Requirements:</strong> We may disclose information if required by law or to protect our rights and safety.</li>
                <li><strong className="text-white">Business Transfers:</strong> In connection with any merger, acquisition, or sale of assets.</li>
              </ul>
              <p className="mt-4">We do not sell your personal information to third parties.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">6. Data Security</h2>
              <p className="leading-relaxed mb-4">
                We implement appropriate technical and organizational measures to protect your personal
                information against unauthorized access, alteration, disclosure, or destruction:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong className="text-white">Two-Factor Authentication:</strong> Optional TOTP-based two-factor authentication with encrypted backup codes.</li>
                <li><strong className="text-white">OAuth Security:</strong> We use industry-standard OAuth 2.0 for authentication and do not store your social media passwords.</li>
                <li><strong className="text-white">Encrypted Connections:</strong> All data is transmitted over HTTPS.</li>
                <li><strong className="text-white">Secure Payments:</strong> Payment processing is handled by Stripe; we do not store credit card numbers.</li>
              </ul>
              <p className="mt-4">
                However, no method of transmission over the Internet or electronic storage is 100% secure,
                and we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">7. Your Rights and Choices</h2>
              <p className="mb-4">You have the following rights regarding your information:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong className="text-white">Access and Update:</strong> You can access and update your profile information through your account settings.</li>
                <li><strong className="text-white">Delete Content:</strong> You can delete your projects, companies, updates, comments, and listings.</li>
                <li><strong className="text-white">Account Deletion:</strong> To delete your account entirely, please contact us through our community channels.</li>
                <li><strong className="text-white">Email Preferences:</strong> You can opt out of daily and weekly digest emails in your settings.</li>
                <li><strong className="text-white">Push Notifications:</strong> You can disable push notifications through your browser settings or account preferences.</li>
                <li><strong className="text-white">Two-Factor Authentication:</strong> You can enable or disable 2FA at any time in your security settings.</li>
                <li><strong className="text-white">Data Portability:</strong> You may request a copy of your data by contacting us.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">8. Third-Party Services</h2>
              <p className="leading-relaxed mb-4">
                Our service integrates with third-party services. Your use of these services is governed
                by their respective privacy policies:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong className="text-white">Authentication:</strong> Google, GitHub, X/Twitter OAuth</li>
                <li><strong className="text-white">Payments:</strong> Stripe</li>
                <li><strong className="text-white">Media:</strong> Giphy (for GIF selection)</li>
                <li><strong className="text-white">Video Embeds:</strong> YouTube, Twitch (when you link videos)</li>
              </ul>
              <p className="mt-4">
                We encourage you to review those policies before using them.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">9. Cookies and Tracking</h2>
              <p className="leading-relaxed">
                We use essential cookies to maintain your session and authentication state. These cookies
                are necessary for the proper functioning of our service. We may also use analytics tools
                to understand how users interact with our platform. We track views and clicks on projects,
                listings, and advertisements to provide analytics to content creators and advertisers.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">10. Push Notifications</h2>
              <p className="leading-relaxed">
                Our platform supports web push notifications through the Progressive Web App (PWA) functionality.
                Push notifications are entirely opt-in and require your explicit permission. You can manage or
                revoke push notification permissions at any time through your browser settings. We store push
                subscription data (endpoint URL and encryption keys) only for users who opt in.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">11. Children&apos;s Privacy</h2>
              <p className="leading-relaxed">
                Our services are not intended for children under 13 years of age. We do not knowingly
                collect personal information from children under 13. If you believe we have collected
                information from a child under 13, please contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">12. International Data Transfers</h2>
              <p className="leading-relaxed">
                Your information may be transferred to and processed in countries other than your country
                of residence. These countries may have data protection laws that are different from your
                country. We take appropriate safeguards to ensure your information remains protected.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">13. Data Retention</h2>
              <p className="leading-relaxed">
                We retain your information for as long as your account is active or as needed to provide
                services. We may retain certain information for legitimate business purposes, legal compliance,
                dispute resolution, or to enforce our agreements. Token and coin transaction history is retained
                for audit purposes. Anonymized analytics data may be retained indefinitely.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">14. Changes to This Policy</h2>
              <p className="leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any changes
                by posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date.
                Your continued use of our services after any changes indicates your acceptance of the
                updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">15. Contact Us</h2>
              <p className="leading-relaxed">
                If you have any questions about this Privacy Policy or our privacy practices, please
                contact us through our community channels:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li>
                  <a
                    href="https://x.com/i/communities/1943895831322439993"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-orange-500 hover:text-orange-400"
                  >
                    X Community
                  </a>
                </li>
                <li>
                  <a
                    href="https://discord.com/invite/G7nmswWkbn"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-orange-500 hover:text-orange-400"
                  >
                    Discord Server
                  </a>
                </li>
              </ul>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}
