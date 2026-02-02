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
        <p className="text-zinc-500 mb-12">Last updated: January 29, 2026</p>

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
                Builders.to is a launch pad and social network for builders, entrepreneurs, and founders to share
                what they&apos;re building, get feedback, meet collaborators, and find early users. The Service includes:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li>Creating profiles and sharing projects at any development stage</li>
                <li>Posting daily updates and engaging with other builders</li>
                <li>Creating and managing company profiles</li>
                <li>Offering and purchasing builder services through the marketplace</li>
                <li>Posting and browsing local classifieds</li>
                <li>Earning and using virtual tokens</li>
                <li>Purchasing and displaying advertisements</li>
                <li>Subscribing to Pro plans for enhanced features and rewards</li>
                <li>Using AI-powered content generation and analysis tools</li>
                <li>Cross-posting content to connected social media platforms (Twitter/X, LinkedIn)</li>
                <li>Hosting and attending events and meetups</li>
                <li>Sending and receiving direct messages with other builders</li>
                <li>Discovering nearby builders and events</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">3. User Accounts</h2>

              <h3 className="text-xl font-medium text-white mt-6 mb-3">3.1 Account Creation</h3>
              <p className="leading-relaxed">
                To use certain features of the Service, you must sign in using a supported OAuth
                provider (Google, GitHub, or X/Twitter). You are responsible for maintaining the
                security of your account credentials with these providers.
              </p>

              <h3 className="text-xl font-medium text-white mt-6 mb-3">3.2 Account Security</h3>
              <p className="leading-relaxed mb-4">
                We offer optional two-factor authentication (2FA) for enhanced account security.
                You are encouraged to enable 2FA to protect your account. You are responsible for:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Keeping your OAuth provider credentials secure</li>
                <li>Safely storing your 2FA backup codes if you enable two-factor authentication</li>
                <li>All activity that occurs under your account</li>
                <li>Notifying us immediately of any unauthorized use of your account</li>
              </ul>

              <h3 className="text-xl font-medium text-white mt-6 mb-3">3.3 Account Responsibilities</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>You must provide accurate and complete information</li>
                <li>You may not transfer or share your account with others</li>
                <li>You may not create multiple accounts for the purpose of manipulation or fraud</li>
                <li>You may not impersonate another person or entity</li>
              </ul>

              <h3 className="text-xl font-medium text-white mt-6 mb-3">3.4 Age Requirements</h3>
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
                including projects, company profiles, daily updates, comments, service listings,
                local listings, job postings, and profile information. By submitting User Content,
                you grant Builders.to a worldwide, non-exclusive, royalty-free license to use,
                display, reproduce, and distribute your content in connection with the Service.
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
                <li>Manipulates engagement metrics (upvotes, likes, follows) through artificial means</li>
                <li>Promotes illegal products or services</li>
              </ul>

              <h3 className="text-xl font-medium text-white mt-6 mb-3">4.3 AI-Generated Content</h3>
              <p className="leading-relaxed mb-4">
                When using our AI content generation features:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>You are responsible for reviewing and editing AI-generated content before posting</li>
                <li>AI-generated content is subject to the same content guidelines as manually created content</li>
                <li>You may not use AI features to generate content that violates these Terms</li>
                <li>AI suggestions are provided as-is without guarantees of accuracy or appropriateness</li>
                <li>DALL-E image generation (Pro feature) is subject to OpenAI&apos;s content policies</li>
              </ul>

              <h3 className="text-xl font-medium text-white mt-6 mb-3">4.4 Content Moderation</h3>
              <p className="leading-relaxed">
                We reserve the right, but have no obligation, to review, edit, or remove any User
                Content at our sole discretion. We may remove content that violates these Terms or
                that we find objectionable for any reason. Users may report content through our
                reporting system, and we will review flagged content as appropriate.
              </p>

              <h3 className="text-xl font-medium text-white mt-6 mb-3">4.5 Threaded Comments</h3>
              <p className="leading-relaxed">
                Comments on projects, updates, events, and listings support threaded replies.
                All content guidelines apply equally to replies. Reply chains may be collapsed
                or moderated if they violate our policies or become disruptive.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">5. Cross-Platform Posting</h2>

              <h3 className="text-xl font-medium text-white mt-6 mb-3">5.1 Platform Connections</h3>
              <p className="leading-relaxed mb-4">
                You may connect your Twitter/X and LinkedIn accounts to enable cross-posting. By connecting:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>You authorize us to post content on your behalf to connected platforms</li>
                <li>You are responsible for complying with each platform&apos;s terms of service</li>
                <li>We store encrypted OAuth tokens to maintain your connections</li>
                <li>You can disconnect platforms at any time, which revokes our access</li>
              </ul>

              <h3 className="text-xl font-medium text-white mt-6 mb-3">5.2 Cross-Posted Content</h3>
              <p className="leading-relaxed mb-4">
                When cross-posting content:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Content is adapted to each platform&apos;s requirements (character limits, media formats)</li>
                <li>You are responsible for the content posted to external platforms</li>
                <li>We are not responsible for how external platforms handle your content</li>
                <li>Scheduled posts will be published at the specified time if your connection is active</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">6. Services Marketplace</h2>

              <h3 className="text-xl font-medium text-white mt-6 mb-3">6.1 Service Providers</h3>
              <p className="leading-relaxed">
                If you offer services through the marketplace, you agree to:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>Provide accurate descriptions of your services</li>
                <li>Deliver services as described within the stated timeframe</li>
                <li>Communicate promptly with buyers</li>
                <li>Complete Stripe Connect onboarding for payment processing</li>
                <li>Handle disputes professionally and in good faith</li>
              </ul>

              <h3 className="text-xl font-medium text-white mt-6 mb-3">6.2 Service Buyers</h3>
              <p className="leading-relaxed">
                If you purchase services, you agree to:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>Provide clear and accurate requirements</li>
                <li>Communicate promptly with service providers</li>
                <li>Pay for services through the platform</li>
                <li>Acknowledge delivery when services are completed satisfactorily</li>
              </ul>

              <h3 className="text-xl font-medium text-white mt-6 mb-3">6.3 Platform Role</h3>
              <p className="leading-relaxed">
                Builders.to facilitates connections between service providers and buyers but is not
                a party to service agreements. We are not responsible for the quality, safety, or
                legality of services offered or purchased. Disputes should be resolved between
                parties, though we may intervene at our discretion.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">7. Local Listings and Classifieds</h2>
              <p className="leading-relaxed mb-4">
                Local listings allow users to post classifieds in various categories. You agree that:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>All listing information must be accurate and not misleading</li>
                <li>You will not post prohibited items or services</li>
                <li>You are responsible for all transactions that result from your listings</li>
                <li>Listings may be removed if flagged by the community or found to violate these Terms</li>
                <li>Paid listings are subject to expiration and non-refundable after activation</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">8. Events and Meetups</h2>

              <h3 className="text-xl font-medium text-white mt-6 mb-3">8.1 Event Hosts</h3>
              <p className="leading-relaxed mb-4">
                If you host events on the platform, you agree to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide accurate event information including date, time, and location</li>
                <li>Update or cancel events promptly if circumstances change</li>
                <li>Ensure venues are appropriate and accessible for advertised capacity</li>
                <li>Not host events for illegal activities or purposes that violate these Terms</li>
                <li>Take reasonable responsibility for attendee safety at physical events</li>
              </ul>

              <h3 className="text-xl font-medium text-white mt-6 mb-3">8.2 Event Attendees</h3>
              <p className="leading-relaxed mb-4">
                If you attend events, you agree to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>RSVP honestly and update your status if plans change</li>
                <li>Behave respectfully toward hosts and other attendees</li>
                <li>Follow venue rules and local laws</li>
                <li>Understand that Builders.to is not responsible for event quality, safety, or outcomes</li>
              </ul>

              <h3 className="text-xl font-medium text-white mt-6 mb-3">8.3 Platform Role</h3>
              <p className="leading-relaxed">
                Builders.to facilitates event discovery and RSVPs but is not an event organizer or
                venue. We are not responsible for the quality, safety, or legality of events. All
                liability for events rests with the hosts and attendees.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">9. Direct Messaging</h2>

              <h3 className="text-xl font-medium text-white mt-6 mb-3">10.1 Acceptable Use</h3>
              <p className="leading-relaxed mb-4">
                Direct messaging is provided for legitimate communication between builders. You agree not to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Send spam, unsolicited promotions, or bulk messages</li>
                <li>Harass, threaten, or abuse other users</li>
                <li>Share illegal content or content that violates these Terms</li>
                <li>Impersonate others or send deceptive messages</li>
                <li>Use messaging to circumvent platform rules or fees</li>
              </ul>

              <h3 className="text-xl font-medium text-white mt-6 mb-3">10.2 Privacy and Moderation</h3>
              <p className="leading-relaxed">
                Messages are private between participants. However, we may access message content
                to investigate reports of abuse, harassment, or Terms violations. Users can report
                abusive messages, and we may take action including account suspension for violations.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">11. Advertising</h2>
              <p className="leading-relaxed mb-4">
                Users may purchase advertisements to be displayed on the platform. Advertisers agree:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>All advertisement content must be truthful and not misleading</li>
                <li>Advertisements must not violate any laws or these Terms</li>
                <li>We reserve the right to reject or remove any advertisement</li>
                <li>Ad payments are non-refundable after the ad begins running</li>
                <li>View and click metrics are provided as estimates, not guarantees</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">12. Pro Subscriptions</h2>
              <p className="mb-4">Pro subscription plans provide enhanced features:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong className="text-white">Plan Options:</strong> Monthly ($3.99/month) or Yearly ($39.99/year) billing</li>
                <li><strong className="text-white">Pro Rewards:</strong> Pro users may earn money for quality content. Rewards are discretionary and subject to our policies.</li>
                <li><strong className="text-white">DALL-E Access:</strong> Pro users can generate AI images. Usage is subject to OpenAI&apos;s policies.</li>
                <li><strong className="text-white">Billing:</strong> Subscriptions are billed through Stripe and auto-renew unless cancelled.</li>
                <li><strong className="text-white">Cancellation:</strong> You may cancel at any time. Access continues until the end of the billing period.</li>
                <li><strong className="text-white">Refunds:</strong> Subscription payments are generally non-refundable except as required by law.</li>
                <li><strong className="text-white">Feature Changes:</strong> We may modify Pro features at any time with reasonable notice.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">13. Acceptable Use</h2>
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
                <li>Manipulate the token system</li>
                <li>Create fake accounts or artificially inflate engagement metrics</li>
                <li>Use the platform for money laundering or financial fraud</li>
                <li>Post false or misleading information about businesses or individuals</li>
                <li>Abuse AI features to generate spam, misleading content, or policy-violating material</li>
                <li>Use cross-posting features to spam connected platforms</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">14. Payments and Refunds</h2>
              <p className="leading-relaxed mb-4">
                All payments are processed through Stripe. By making payments, you agree to Stripe&apos;s
                terms of service. Regarding refunds:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Pro subscription payments are generally non-refundable except as required by law</li>
                <li>Service listing fees and advertisement purchases are generally non-refundable once activated</li>
                <li>Service order disputes should be resolved between buyer and seller</li>
                <li>We may issue refunds at our discretion for technical errors or extenuating circumstances</li>
                <li>Chargebacks may result in account suspension pending investigation</li>
                <li>Pro rewards payouts are processed through Stripe and subject to minimum payout thresholds</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">15. Intellectual Property</h2>

              <h3 className="text-xl font-medium text-white mt-6 mb-3">12.1 Our Property</h3>
              <p className="leading-relaxed">
                The Service, including its design, features, and content (excluding User Content),
                is owned by Builders.to and protected by copyright, trademark, and other laws.
                You may not copy, modify, or distribute our intellectual property without permission.
              </p>

              <h3 className="text-xl font-medium text-white mt-6 mb-3">12.2 Trademarks</h3>
              <p className="leading-relaxed">
                &quot;Builders.to&quot; and associated logos are trademarks of Builders.to. You may not
                use these trademarks without our prior written consent.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">16. Third-Party Services</h2>
              <p className="leading-relaxed mb-4">
                The Service integrates with and links to third-party services:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong className="text-white">Payment Processing:</strong> Stripe handles all payments. Use is subject to Stripe&apos;s terms.</li>
                <li><strong className="text-white">Social Platforms:</strong> Twitter/X and LinkedIn integrations are subject to their respective terms.</li>
                <li><strong className="text-white">AI Services:</strong> OpenAI powers our content generation. Use is subject to OpenAI&apos;s policies.</li>
                <li><strong className="text-white">Media Services:</strong> Giphy, YouTube, and Twitch embeds are subject to their terms.</li>
              </ul>
              <p className="mt-4">
                We have no control over and assume no responsibility for the content, privacy policies,
                or practices of third-party services. Your use of third-party services is at your own risk.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">17. Disclaimer of Warranties</h2>
              <p className="leading-relaxed uppercase text-sm">
                THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY
                KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES
                OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE
                DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE.
                WE DO NOT GUARANTEE THE ACCURACY OF TOKEN BALANCES, PRO REWARDS CALCULATIONS,
                AI-GENERATED CONTENT, OR ANY METRICS DISPLAYED ON THE PLATFORM. AI FEATURES ARE PROVIDED
                WITHOUT WARRANTIES REGARDING ACCURACY, APPROPRIATENESS, OR FITNESS FOR ANY PURPOSE.
                WE DO NOT GUARANTEE THE SAFETY, QUALITY, OR OUTCOMES OF EVENTS
                OR INTERACTIONS RESULTING FROM DIRECT MESSAGING OR NEARBY DISCOVERY FEATURES.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">18. Limitation of Liability</h2>
              <p className="leading-relaxed uppercase text-sm">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, BUILDERS.TO SHALL NOT BE LIABLE FOR ANY
                INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS
                OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF
                DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM YOUR USE OF THE
                SERVICE, INCLUDING BUT NOT LIMITED TO LOSSES RELATED TO THE TOKEN SYSTEM, PRO
                REWARDS, SERVICE MARKETPLACE TRANSACTIONS, AI-GENERATED CONTENT, OR CROSS-POSTED
                CONTENT ON THIRD-PARTY PLATFORMS, EVENTS, OR INTERACTIONS
                FACILITATED THROUGH DIRECT MESSAGING OR NEARBY DISCOVERY FEATURES.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">19. Indemnification</h2>
              <p className="leading-relaxed">
                You agree to indemnify, defend, and hold harmless Builders.to and its officers,
                directors, employees, and agents from any claims, damages, losses, liabilities,
                and expenses (including legal fees) arising from your use of the Service, your
                User Content (including AI-generated content), your service marketplace activities,
                content cross-posted to external platforms, or your violation of these Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">20. Termination</h2>
              <p className="leading-relaxed mb-4">
                We may suspend or terminate your access to the Service at any time, with or
                without cause, and with or without notice. Upon termination:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Your right to use the Service will immediately cease</li>
                <li>Any unused tokens or coins will be forfeited</li>
                <li>Pro subscription will be cancelled without refund for the current period</li>
                <li>Pending Pro rewards may be forfeited</li>
                <li>Active service orders may be cancelled</li>
                <li>Active listings and advertisements may be removed</li>
                <li>Connected platform authorizations will be revoked</li>
                <li>Hosted events may be cancelled</li>
                <li>Direct message history may be deleted</li>
              </ul>
              <p className="mt-4">
                All provisions of these Terms that by their nature should survive termination
                shall survive.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">21. Modifications to Terms</h2>
              <p className="leading-relaxed">
                We reserve the right to modify these Terms at any time. We will notify users of
                material changes by updating the &quot;Last updated&quot; date. Your continued use of the
                Service after changes become effective constitutes acceptance of the revised Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">22. Governing Law</h2>
              <p className="leading-relaxed">
                These Terms shall be governed by and construed in accordance with the laws of
                the jurisdiction in which Builders.to operates, without regard to conflict of
                law principles.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">23. Dispute Resolution</h2>
              <p className="leading-relaxed">
                Any disputes arising from these Terms or your use of the Service shall first
                be attempted to be resolved through good-faith negotiation. If negotiation fails,
                disputes shall be resolved through binding arbitration in accordance with
                applicable arbitration rules.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">24. Severability</h2>
              <p className="leading-relaxed">
                If any provision of these Terms is found to be unenforceable or invalid, that
                provision shall be limited or eliminated to the minimum extent necessary, and
                the remaining provisions shall remain in full force and effect.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">25. Entire Agreement</h2>
              <p className="leading-relaxed">
                These Terms, together with our Privacy Policy, constitute the entire agreement
                between you and Builders.to regarding your use of the Service and supersede any
                prior agreements.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">26. Contact Us</h2>
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
