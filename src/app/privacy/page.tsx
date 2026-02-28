import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - Builders.to",
  description: "Privacy Policy for Builders.to, a social launch pad for solo founders. Learn how we collect, use, and protect your information.",
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
        <p className="text-zinc-500 mb-12">Last updated: February 28, 2026</p>

        <div className="prose prose-invert prose-zinc max-w-none">
          <div className="space-y-8 text-zinc-300">

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">1. Introduction</h2>
              <p className="leading-relaxed">
                Welcome to Builders.to (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;), a social launch pad for solo founders. We are committed to protecting your
                privacy and personal information. This Privacy Policy explains how we collect, use,
                disclose, and safeguard your information when you use our website and services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">2. Information We Collect</h2>

              <h3 className="text-xl font-medium text-white mt-6 mb-3">2.1 Information You Provide</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong className="text-white">Account Information:</strong> When you sign in using OAuth providers (Google, GitHub, or X/Twitter), we receive your name, email address, and profile picture from those services.</li>
                <li><strong className="text-white">Profile Information:</strong> Username, display name, bio, headline, location (city, state, country, zip code), website, and social media links you choose to add to your profile.</li>
                <li><strong className="text-white">Location Data:</strong> When you provide your location, we geocode it to coordinates for map display. We apply a privacy offset of approximately 10 miles to protect your exact location.</li>
                <li><strong className="text-white">Project Information:</strong> Details about projects you submit including titles, descriptions, images, URLs, tags, and milestone data.</li>
                <li><strong className="text-white">Company Information:</strong> Business details you provide when creating company profiles, including tech stack, traction metrics, and team information.</li>
                <li><strong className="text-white">Content:</strong> Daily updates, comments, polls, and any other content you post on the platform.</li>
                <li><strong className="text-white">Service Listings:</strong> Information about services you offer, including descriptions, pricing, and portfolio projects.</li>
                <li><strong className="text-white">Local Listings:</strong> Classified listings you create, including contact information you choose to share.</li>
                <li><strong className="text-white">Job Postings:</strong> Information about roles and positions you post for your company.</li>
                <li><strong className="text-white">AI Preferences:</strong> Your interests, tone preferences, and posting style preferences when using AI content features.</li>
                <li><strong className="text-white">Events:</strong> Event details you create including title, description, date, time, location, and whether events are physical, virtual, or hybrid.</li>
                <li><strong className="text-white">Chat & Messages:</strong> Messages you send in community channels and direct conversations, including text content, images, GIFs, code snippets, polls, and emoji reactions.</li>
                <li><strong className="text-white">Presence Data:</strong> Your online/offline status, &quot;last seen&quot; timestamps, and typing indicators when using the real-time chat.</li>
                <li><strong className="text-white">Accountability Check-Ins:</strong> When you use the accountability partners feature, we collect check-in data including mood (e.g., Crushing It, Good, Okay, Struggling), notes, and check-in frequency preferences.</li>
                <li><strong className="text-white">Builder Matching Data:</strong> Your building category (e.g., SaaS, Mobile App, AI/ML, Developer Tools), tech stack, and interests used for discovering similar builders and accountability partner matching.</li>
              </ul>

              <h3 className="text-xl font-medium text-white mt-6 mb-3">2.2 Information Collected Automatically</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong className="text-white">Usage Data:</strong> Information about how you interact with our services, including pages visited, features used, and content viewed.</li>
                <li><strong className="text-white">Device Information:</strong> Browser type, operating system, and device identifiers.</li>
                <li><strong className="text-white">Log Data:</strong> IP address, access times, referring URLs, and request data.</li>
                <li><strong className="text-white">Analytics:</strong> View counts, click tracking, and engagement metrics for projects, listings, and advertisements.</li>
                <li><strong className="text-white">Browser Geolocation:</strong> When you use nearby features (events, users), we may request your browser location with your permission to find content within your radius.</li>
              </ul>

              <h3 className="text-xl font-medium text-white mt-6 mb-3">2.3 Information from Third Parties</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong className="text-white">OAuth Providers:</strong> Profile information from Google, GitHub, or X/Twitter when you authenticate.</li>
                <li><strong className="text-white">Giphy:</strong> When you use GIFs in posts, we interact with the Giphy API on your behalf.</li>
                <li><strong className="text-white">OpenStreetMap:</strong> We use OpenStreetMap Nominatim for geocoding your location data.</li>
              </ul>

              <h3 className="text-xl font-medium text-white mt-6 mb-3">2.4 Platform Connection Data</h3>
              <p className="mb-2">When you connect social media platforms for cross-posting, we collect:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong className="text-white">OAuth Tokens:</strong> Access and refresh tokens for Twitter/X and LinkedIn, stored encrypted.</li>
                <li><strong className="text-white">Platform Profiles:</strong> Your username, display name, avatar, and follower count from connected platforms.</li>
                <li><strong className="text-white">Token Expiration:</strong> When your tokens expire so we can refresh them automatically.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">3. How We Use Your Information</h2>
              <p className="mb-4">We use the information we collect to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide, maintain, and improve our services</li>
                <li>Create and manage your account</li>
                <li>Display your projects, profile, and content to the community</li>
                <li>Enable interactions between community members (comments, upvotes, follows, chat channels, direct messages)</li>
                <li>Process token rewards for engagement, referrals, and profile completion</li>
                <li>Process Pro subscription payments and rewards payouts through Stripe</li>
                <li>Process payments through Stripe for services, listings, and advertisements</li>
                <li>Generate AI-powered content suggestions based on your preferences and interests</li>
                <li>Cross-post your content to connected social media platforms (Twitter/X, LinkedIn)</li>
                <li>Send important service-related communications</li>
                <li>Send optional daily and weekly digest emails (you can opt out)</li>
                <li>Deliver push notifications (with your explicit consent)</li>
                <li>Protect against fraud, abuse, and policy violations</li>
                <li>Comply with legal obligations</li>
                <li>Generate anonymized analytics and statistics</li>
                <li>Facilitate event RSVPs</li>
                <li>Find nearby users and events based on your location</li>
                <li>Provide real-time community chat channels and private messaging between members</li>
                <li>Display your online/offline presence status and typing indicators to other chat participants</li>
                <li>Enforce chat moderation rules including auto-moderation filters and slow mode</li>
                <li>Match you with similar builders based on tech stack, building category, and interests</li>
                <li>Facilitate accountability partnerships and track check-in activity</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">4. Token System</h2>
              <p className="mb-4">Builders.to operates a virtual currency system:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong className="text-white">Builder Tokens:</strong> Earned through engagement (e.g. posting, karma), referrals, streak milestones, and Pro membership. Can be used to run sidebar advertisements, purchase services, or gift to other builders. Token transactions and balances are tracked for your account.</li>
              </ul>
              <p className="mt-4">
                Tokens have no real-world monetary value and cannot be exchanged for cash.
                We reserve the right to modify, reset, or discontinue this system at any time.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">5. Pro Subscriptions and Rewards</h2>
              <p className="mb-4">Builders.to offers Pro subscription plans with enhanced features:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong className="text-white">Subscription Data:</strong> We store your Stripe customer ID, subscription ID, plan type (monthly/yearly), and billing dates.</li>
                <li><strong className="text-white">Pro Rewards:</strong> Pro users may earn real money for quality content. We track post rewards earned, pending earnings, and lifetime earnings.</li>
                <li><strong className="text-white">Payout Information:</strong> Reward payouts are processed through Stripe. We maintain records of payout amounts and dates.</li>
              </ul>
              <p className="mt-4">
                Subscription payments are handled by Stripe. We do not store your credit card information directly.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">6. AI Features and Content Generation</h2>
              <p className="mb-4">We use OpenAI&apos;s services to provide AI-powered features:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong className="text-white">Content Generation:</strong> When you use AI to generate or improve content, your prompts and preferences are sent to OpenAI.</li>
                <li><strong className="text-white">Content Analysis:</strong> AI analyzes your content to provide improvement suggestions and engagement predictions.</li>
                <li><strong className="text-white">Image Generation:</strong> Pro users can generate images with DALL-E. Your prompts are sent to OpenAI for processing.</li>
                <li><strong className="text-white">Profile-Based Suggestions:</strong> Your interests, tone preferences, and posting history may be used to personalize AI suggestions.</li>
              </ul>
              <p className="mt-4">
                AI-generated content is subject to OpenAI&apos;s usage policies. We encourage you to review generated content before posting.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">7. Information Sharing</h2>
              <p className="mb-4">We may share your information in the following circumstances:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong className="text-white">Public Content:</strong> Your profile, projects, companies, updates, comments, service listings, local listings, job postings, and events are publicly visible to other users and visitors.</li>
                <li><strong className="text-white">Leaderboards:</strong> Token earnings and streak data may appear on public leaderboards.</li>
                <li><strong className="text-white">Service Providers:</strong> We share information with third-party vendors who assist in operating our services:
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>Stripe for payment processing</li>
                    <li>Resend for email delivery</li>
                    <li>Giphy for GIF integration</li>
                    <li>OpenAI for AI content generation and analysis</li>
                    <li>OpenStreetMap for geocoding services</li>
                    <li>Infrastructure providers for hosting and database services</li>
                  </ul>
                </li>
                <li><strong className="text-white">Legal Requirements:</strong> We may disclose information if required by law or to protect our rights and safety.</li>
                <li><strong className="text-white">Business Transfers:</strong> In connection with any merger, acquisition, or sale of assets.</li>
              </ul>
              <p className="mt-4">We do not sell your personal information to third parties.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">8. Data Security</h2>
              <p className="leading-relaxed mb-4">
                We implement appropriate technical and organizational measures to protect your personal
                information against unauthorized access, alteration, disclosure, or destruction:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong className="text-white">Two-Factor Authentication:</strong> Optional TOTP-based two-factor authentication with encrypted backup codes.</li>
                <li><strong className="text-white">OAuth Security:</strong> We use industry-standard OAuth 2.0 for authentication and do not store your social media passwords.</li>
                <li><strong className="text-white">Encrypted Connections:</strong> All data is transmitted over HTTPS.</li>
                <li><strong className="text-white">Secure Payments:</strong> Payment processing is handled by Stripe; we do not store credit card numbers.</li>
                <li><strong className="text-white">Encrypted Platform Tokens:</strong> OAuth tokens for connected platforms (Twitter, LinkedIn) are encrypted at rest.</li>
                <li><strong className="text-white">Location Privacy:</strong> Your geocoded location is offset by approximately 10 miles to protect your exact address.</li>
              </ul>
              <p className="mt-4">
                However, no method of transmission over the Internet or electronic storage is 100% secure,
                and we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">9. Your Rights and Choices</h2>
              <p className="mb-4">You have the following rights regarding your information:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong className="text-white">Access and Update:</strong> You can access and update your profile information through your account settings.</li>
                <li><strong className="text-white">Delete Content:</strong> You can delete your projects, companies, updates, comments, listings, events, and chat messages.</li>
                <li><strong className="text-white">Account Deletion:</strong> To delete your account entirely, please contact us through our community channels.</li>
                <li><strong className="text-white">Email Preferences:</strong> You can opt out of daily and weekly digest emails in your settings.</li>
                <li><strong className="text-white">Push Notifications:</strong> You can disable push notifications through your browser settings or account preferences.</li>
                <li><strong className="text-white">Two-Factor Authentication:</strong> You can enable or disable 2FA at any time in your security settings.</li>
                <li><strong className="text-white">Platform Connections:</strong> You can disconnect Twitter/X and LinkedIn accounts at any time, which revokes our access to those platforms.</li>
                <li><strong className="text-white">AI Preferences:</strong> You can update or clear your AI preferences (interests, tone, posting style) in your settings.</li>
                <li><strong className="text-white">Pro Subscription:</strong> You can cancel your Pro subscription at any time through your account settings.</li>
                <li><strong className="text-white">Data Portability:</strong> You may request a copy of your data by contacting us.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">10. Third-Party Services</h2>
              <p className="leading-relaxed mb-4">
                Our service integrates with third-party services. Your use of these services is governed
                by their respective privacy policies:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong className="text-white">Authentication:</strong> Google, GitHub, X/Twitter OAuth</li>
                <li><strong className="text-white">Payments:</strong> Stripe (subscriptions, services marketplace, advertisements)</li>
                <li><strong className="text-white">Cross-Posting:</strong> Twitter/X API, LinkedIn API (when you connect these platforms)</li>
                <li><strong className="text-white">AI Services:</strong> OpenAI (GPT-4 for content generation, DALL-E for images)</li>
                <li><strong className="text-white">Media:</strong> Giphy (for GIF selection)</li>
                <li><strong className="text-white">Video Embeds:</strong> YouTube, Twitch (when you link videos)</li>
                <li><strong className="text-white">Geocoding:</strong> OpenStreetMap Nominatim (for location services)</li>
              </ul>
              <p className="mt-4">
                We encourage you to review those policies before using them.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">11. Chat & Messaging</h2>
              <p className="leading-relaxed mb-4">
                We provide real-time community chat channels and private messaging to facilitate communication between builders:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong className="text-white">Message Content:</strong> Your messages in channels and direct conversations, including text, images, GIFs, code snippets, polls, and emoji reactions, are stored to deliver them to recipients and maintain conversation history.</li>
                <li><strong className="text-white">Channel Membership:</strong> When you join a chat channel, your membership, role (member, moderator, or owner), and notification preferences are stored.</li>
                <li><strong className="text-white">Presence & Status:</strong> Your online/offline/away/do-not-disturb status and &quot;last seen&quot; timestamp are visible to other users in the chat. Typing indicators show when you are composing a message.</li>
                <li><strong className="text-white">Read Receipts:</strong> We track when messages are read to provide unread count indicators and read receipt functionality.</li>
                <li><strong className="text-white">Bookmarks & Pins:</strong> Messages you bookmark and messages pinned by channel moderators are tracked per user and per channel.</li>
                <li><strong className="text-white">Search Indexing:</strong> Message content is indexed for full-text search to enable you to find past messages across channels.</li>
                <li><strong className="text-white">Message Retention:</strong> Free accounts can access up to 90 days of message history. Pro subscribers receive unlimited history. Messages beyond the retention window may become inaccessible.</li>
                <li><strong className="text-white">Moderation Data:</strong> Auto-moderation rules (word filters, spam detection) may analyze message content in real time. Moderation actions taken on your messages are logged.</li>
                <li><strong className="text-white">Privacy:</strong> Messages in public channels are visible to all channel members. Direct messages are private between participants. We may access any message content to investigate reported abuse or violations of our Terms.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">12. Events</h2>
              <p className="leading-relaxed mb-4">
                When you create or participate in events:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong className="text-white">Event Information:</strong> Event details including title, description, date, location, and attendee list are publicly visible.</li>
                <li><strong className="text-white">RSVP Data:</strong> Your RSVP status (Going, Interested, Not Going) is visible to other users viewing the event.</li>
                <li><strong className="text-white">Location Data:</strong> Physical event locations are displayed to help users find nearby gatherings. The same ~10 mile privacy offset applies.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">13. Leaderboard and Karma System</h2>
              <p className="leading-relaxed mb-4">
                We operate a public leaderboard and karma system to recognize community contributions:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong className="text-white">Karma Points:</strong> We track karma points earned through your contributions (updates, comments, projects, engagement). This data is used to calculate your karma level.</li>
                <li><strong className="text-white">Karma Levels:</strong> Your karma level (Seedling, Sprout, Builder, Veteran, Master, Legend) is publicly visible on your profile and the leaderboard.</li>
                <li><strong className="text-white">Public Rankings:</strong> The leaderboard displays top builders ranked by karma. Your username, profile image, and karma score may appear publicly.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">14. Builder Map</h2>
              <p className="leading-relaxed mb-4">
                We display an interactive map showing the approximate locations of builders:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong className="text-white">Map Display:</strong> If you provide a location, your approximate position is shown on the public builder map. The same ~10 mile privacy offset applies to protect your exact location.</li>
                <li><strong className="text-white">Opt-In:</strong> Your location only appears on the map if you have added location information to your profile. You can remove your location at any time to be removed from the map.</li>
                <li><strong className="text-white">Nearby Discovery:</strong> Your approximate location may be used to help other builders discover you through the &quot;Discover&quot; feature when they search for nearby builders.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">15. Accountability Partners</h2>
              <p className="leading-relaxed mb-4">
                We offer an accountability partners feature to help builders stay on track:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong className="text-white">Partner Matching:</strong> We may use your interests, goals, and activity data to suggest accountability partners.</li>
                <li><strong className="text-white">Goal Data:</strong> Goals and check-in data you share with your accountability partner are stored to maintain the partnership.</li>
                <li><strong className="text-white">Privacy:</strong> Accountability partner relationships and shared goal data are private between the paired participants.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">16. Discover and Similar Builder Matching</h2>
              <p className="leading-relaxed mb-4">
                We provide discovery features to help builders find others with similar interests:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong className="text-white">Building Category:</strong> Your selected building category (e.g., SaaS, Mobile App, AI/ML, eCommerce, Developer Tools, Fintech, Healthtech, Edtech, Marketplace, Agency, Content, Hardware) is used to match you with builders working on similar types of projects.</li>
                <li><strong className="text-white">Tech Stack Matching:</strong> The technologies you list on your profile are used to find builders with overlapping tech stacks.</li>
                <li><strong className="text-white">Interest Matching:</strong> Your declared interests help us suggest builders with shared goals and focus areas.</li>
                <li><strong className="text-white">Visibility:</strong> Your building category, tech stack, and interests may be visible to other builders browsing the Discover page. You can update or remove this information at any time through your profile settings.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">17. Cookies and Tracking</h2>
              <p className="leading-relaxed">
                We use essential cookies to maintain your session and authentication state. These cookies
                are necessary for the proper functioning of our service. We may also use analytics tools
                to understand how users interact with our platform. We track views and clicks on projects,
                listings, and advertisements to provide analytics to content creators and advertisers.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">18. Push Notifications</h2>
              <p className="leading-relaxed">
                Our platform supports web push notifications through the Progressive Web App (PWA) functionality.
                Push notifications are entirely opt-in and require your explicit permission. You can manage or
                revoke push notification permissions at any time through your browser settings. We store push
                subscription data (endpoint URL and encryption keys) only for users who opt in.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">19. Children&apos;s Privacy</h2>
              <p className="leading-relaxed">
                Our services are not intended for children under 13 years of age. We do not knowingly
                collect personal information from children under 13. If you believe we have collected
                information from a child under 13, please contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">20. International Data Transfers</h2>
              <p className="leading-relaxed">
                Your information may be transferred to and processed in countries other than your country
                of residence. These countries may have data protection laws that are different from your
                country. We take appropriate safeguards to ensure your information remains protected.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">21. Data Retention</h2>
              <p className="leading-relaxed">
                We retain your information for as long as your account is active or as needed to provide
                services. We may retain certain information for legitimate business purposes, legal compliance,
                dispute resolution, or to enforce our agreements. Token transaction history is retained
                for audit purposes. Pro subscription and rewards data is retained for financial records.
                Platform connection tokens are deleted when you disconnect a platform. Chat message
                accessibility depends on your subscription tier (90 days for free accounts, unlimited for
                Pro). Chat moderation audit logs are retained for platform integrity. Anonymized analytics
                data may be retained indefinitely.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">22. Changes to This Policy</h2>
              <p className="leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any changes
                by posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date.
                Your continued use of our services after any changes indicates your acceptance of the
                updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">23. Contact Us</h2>
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
              </ul>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}
