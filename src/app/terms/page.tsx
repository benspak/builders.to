import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service - Builders.to",
  description: "Terms of Service for Builders.to - Read our terms and conditions for using the platform.",
};

export default function TermsOfServicePage() {
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

        <h1 className="text-4xl font-bold text-white mb-2">Terms of Service</h1>
        <p className="text-zinc-500 mb-12">Last updated: December 21, 2025</p>

        <div className="prose prose-invert prose-zinc max-w-none">
          <div className="space-y-8 text-zinc-300">

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
              <p className="leading-relaxed">
                By accessing or using Builders.to (&quot;the Service&quot;), you agree to be bound by these
                Terms of Service (&quot;Terms&quot;). If you do not agree to these Terms, you may not access
                or use the Service. These Terms constitute a legally binding agreement between you
                and Builders.to.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">2. Description of Service</h2>
              <p className="leading-relaxed">
                Builders.to is a community platform for builders, creators, and entrepreneurs to share
                projects, receive feedback, and connect with potential users and collaborators. The
                Service allows users to create profiles, submit projects, form companies, interact
                through comments and upvotes, and engage with other community members.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">3. User Accounts</h2>

              <h3 className="text-xl font-medium text-white mt-6 mb-3">3.1 Account Creation</h3>
              <p className="leading-relaxed">
                To use certain features of the Service, you must sign in using a supported OAuth
                provider (Google, GitHub, or X/Twitter). You are responsible for maintaining the
                security of your account credentials with these providers.
              </p>

              <h3 className="text-xl font-medium text-white mt-6 mb-3">3.2 Account Responsibilities</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>You must provide accurate and complete information</li>
                <li>You are responsible for all activity that occurs under your account</li>
                <li>You must notify us immediately of any unauthorized use of your account</li>
                <li>You may not transfer or share your account with others</li>
              </ul>

              <h3 className="text-xl font-medium text-white mt-6 mb-3">3.3 Age Requirements</h3>
              <p className="leading-relaxed">
                You must be at least 13 years old to use this Service. By using the Service, you
                represent and warrant that you meet this age requirement.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">4. User Content</h2>

              <h3 className="text-xl font-medium text-white mt-6 mb-3">4.1 Your Content</h3>
              <p className="leading-relaxed">
                You retain ownership of all content you submit to the Service (&quot;User Content&quot;),
                including projects, company profiles, comments, and profile information. By
                submitting User Content, you grant Builders.to a worldwide, non-exclusive,
                royalty-free license to use, display, reproduce, and distribute your content
                in connection with the Service.
              </p>

              <h3 className="text-xl font-medium text-white mt-6 mb-3">4.2 Content Responsibility</h3>
              <p className="mb-4">You are solely responsible for your User Content and agree not to submit content that:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Violates any law or regulation</li>
                <li>Infringes on intellectual property rights of others</li>
                <li>Contains malware, spam, or malicious code</li>
                <li>Is fraudulent, deceptive, or misleading</li>
                <li>Is defamatory, obscene, or harassing</li>
                <li>Promotes violence or discrimination</li>
                <li>Impersonates another person or entity</li>
                <li>Contains personal information of others without consent</li>
              </ul>

              <h3 className="text-xl font-medium text-white mt-6 mb-3">4.3 Content Moderation</h3>
              <p className="leading-relaxed">
                We reserve the right, but have no obligation, to review, edit, or remove any User
                Content at our sole discretion. We may remove content that violates these Terms or
                that we find objectionable for any reason.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">5. Acceptable Use</h2>
              <p className="mb-4">You agree not to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Use the Service for any illegal purpose</li>
                <li>Attempt to gain unauthorized access to the Service or other accounts</li>
                <li>Interfere with or disrupt the Service or servers</li>
                <li>Use automated systems to access the Service without permission</li>
                <li>Collect or harvest user information without consent</li>
                <li>Use the Service to send spam or unsolicited messages</li>
                <li>Circumvent any security measures or access controls</li>
                <li>Reverse engineer or attempt to extract source code</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">6. Intellectual Property</h2>

              <h3 className="text-xl font-medium text-white mt-6 mb-3">6.1 Our Property</h3>
              <p className="leading-relaxed">
                The Service, including its design, features, and content (excluding User Content),
                is owned by Builders.to and protected by copyright, trademark, and other laws.
                You may not copy, modify, or distribute our intellectual property without permission.
              </p>

              <h3 className="text-xl font-medium text-white mt-6 mb-3">6.2 Trademarks</h3>
              <p className="leading-relaxed">
                &quot;Builders.to&quot; and associated logos are trademarks of Builders.to. You may not
                use these trademarks without our prior written consent.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">7. Third-Party Services</h2>
              <p className="leading-relaxed">
                The Service may contain links to third-party websites or services that are not
                owned or controlled by Builders.to. We have no control over and assume no
                responsibility for the content, privacy policies, or practices of third-party
                sites. Your use of third-party services is at your own risk.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">8. Disclaimer of Warranties</h2>
              <p className="leading-relaxed uppercase text-sm">
                THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY
                KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES
                OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE
                DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">9. Limitation of Liability</h2>
              <p className="leading-relaxed uppercase text-sm">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, BUILDERS.TO SHALL NOT BE LIABLE FOR ANY
                INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS
                OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF
                DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM YOUR USE OF THE
                SERVICE.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">10. Indemnification</h2>
              <p className="leading-relaxed">
                You agree to indemnify, defend, and hold harmless Builders.to and its officers,
                directors, employees, and agents from any claims, damages, losses, liabilities,
                and expenses (including legal fees) arising from your use of the Service, your
                User Content, or your violation of these Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">11. Termination</h2>
              <p className="leading-relaxed">
                We may suspend or terminate your access to the Service at any time, with or
                without cause, and with or without notice. Upon termination, your right to use
                the Service will immediately cease. All provisions of these Terms that by their
                nature should survive termination shall survive.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">12. Modifications to Terms</h2>
              <p className="leading-relaxed">
                We reserve the right to modify these Terms at any time. We will notify users of
                material changes by updating the &quot;Last updated&quot; date. Your continued use of the
                Service after changes become effective constitutes acceptance of the revised Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">13. Governing Law</h2>
              <p className="leading-relaxed">
                These Terms shall be governed by and construed in accordance with the laws of
                the jurisdiction in which Builders.to operates, without regard to conflict of
                law principles.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">14. Dispute Resolution</h2>
              <p className="leading-relaxed">
                Any disputes arising from these Terms or your use of the Service shall first
                be attempted to be resolved through good-faith negotiation. If negotiation fails,
                disputes shall be resolved through binding arbitration in accordance with
                applicable arbitration rules.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">15. Severability</h2>
              <p className="leading-relaxed">
                If any provision of these Terms is found to be unenforceable or invalid, that
                provision shall be limited or eliminated to the minimum extent necessary, and
                the remaining provisions shall remain in full force and effect.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">16. Entire Agreement</h2>
              <p className="leading-relaxed">
                These Terms, together with our Privacy Policy, constitute the entire agreement
                between you and Builders.to regarding your use of the Service and supersede any
                prior agreements.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">17. Contact Us</h2>
              <p className="leading-relaxed">
                If you have any questions about these Terms, please contact us through our
                community channels:
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
