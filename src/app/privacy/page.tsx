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
        <p className="text-zinc-500 mb-12">Last updated: December 21, 2025</p>

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
                <li><strong className="text-white">Profile Information:</strong> Username, bio, location, website, and social media links you choose to add to your profile.</li>
                <li><strong className="text-white">Project Information:</strong> Details about projects you submit including titles, descriptions, images, URLs, and tags.</li>
                <li><strong className="text-white">Company Information:</strong> Business details you provide when creating company profiles.</li>
                <li><strong className="text-white">Comments:</strong> Content you post as comments on projects.</li>
              </ul>

              <h3 className="text-xl font-medium text-white mt-6 mb-3">2.2 Information Collected Automatically</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong className="text-white">Usage Data:</strong> We may collect information about how you interact with our services, including pages visited and features used.</li>
                <li><strong className="text-white">Device Information:</strong> Browser type, operating system, and device identifiers.</li>
                <li><strong className="text-white">Log Data:</strong> IP address, access times, and referring URLs.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">3. How We Use Your Information</h2>
              <p className="mb-4">We use the information we collect to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide, maintain, and improve our services</li>
                <li>Create and manage your account</li>
                <li>Display your projects and profile to the community</li>
                <li>Enable interactions between community members (comments, upvotes)</li>
                <li>Send important service-related communications</li>
                <li>Protect against fraud and abuse</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">4. Information Sharing</h2>
              <p className="mb-4">We may share your information in the following circumstances:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong className="text-white">Public Content:</strong> Your profile, projects, companies, and comments are publicly visible to other users and visitors.</li>
                <li><strong className="text-white">Service Providers:</strong> We may share information with third-party vendors who assist in operating our services (e.g., hosting, analytics).</li>
                <li><strong className="text-white">Legal Requirements:</strong> We may disclose information if required by law or to protect our rights and safety.</li>
                <li><strong className="text-white">Business Transfers:</strong> In connection with any merger, acquisition, or sale of assets.</li>
              </ul>
              <p className="mt-4">We do not sell your personal information to third parties.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">5. Data Security</h2>
              <p className="leading-relaxed">
                We implement appropriate technical and organizational measures to protect your personal
                information against unauthorized access, alteration, disclosure, or destruction. However,
                no method of transmission over the Internet or electronic storage is 100% secure, and we
                cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">6. Your Rights and Choices</h2>
              <p className="mb-4">You have the following rights regarding your information:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong className="text-white">Access and Update:</strong> You can access and update your profile information through your account settings.</li>
                <li><strong className="text-white">Delete:</strong> You can delete your projects and companies. To delete your account entirely, please contact us.</li>
                <li><strong className="text-white">Data Portability:</strong> You may request a copy of your data by contacting us.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">7. Third-Party Services</h2>
              <p className="leading-relaxed">
                Our service integrates with third-party authentication providers (Google, GitHub, X/Twitter).
                Your use of these services is governed by their respective privacy policies. We encourage
                you to review those policies before using them to sign in.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">8. Cookies and Tracking</h2>
              <p className="leading-relaxed">
                We use essential cookies to maintain your session and authentication state. These cookies
                are necessary for the proper functioning of our service. We may also use analytics tools
                to understand how users interact with our platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">9. Children&apos;s Privacy</h2>
              <p className="leading-relaxed">
                Our services are not intended for children under 13 years of age. We do not knowingly
                collect personal information from children under 13. If you believe we have collected
                information from a child under 13, please contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">10. International Data Transfers</h2>
              <p className="leading-relaxed">
                Your information may be transferred to and processed in countries other than your country
                of residence. These countries may have data protection laws that are different from your
                country. We take appropriate safeguards to ensure your information remains protected.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">11. Changes to This Policy</h2>
              <p className="leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any changes
                by posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date.
                Your continued use of our services after any changes indicates your acceptance of the
                updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">12. Contact Us</h2>
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
