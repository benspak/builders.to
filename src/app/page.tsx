import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  return (
    <main>
      {/* Hero Section */}
      <section className="bg-dark-bg py-12 md:py-20 px-4 md:px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 gradient-text">
            Fix Your Technical Debt Before It Costs You Everything
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-6 md:mb-8 max-w-3xl mx-auto px-2">
            Tired of constant bugs, crashes, and "it works on my computer" excuses? Stop losing customers and investor meetings to unreliable code. Get your app properly fixed by experts who understand startup urgency.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/client-intake" className="btn-primary text-lg">
              Get My App Fixed - Free Assessment
            </Link>
          </div>
        </div>
      </section>

      {/* Meet Our Team Section */}
      <section className="section-gray py-12 md:py-20 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-semibold text-center mb-8 md:mb-16 text-white">Meet Our Team</h2>
          <p className="text-lg md:text-xl text-gray-300 text-center mb-12 max-w-3xl mx-auto">
            The founders and experts behind LaunchKit who've helped startups go from idea to investor-ready MVP.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto">
            {/* Team Member 1 */}
            <div className="bg-dark-card p-6 md:p-8 rounded-lg shadow-sm border border-gray-700 text-center">
              <div className="w-24 h-24 bg-spotify-green rounded-full mx-auto mb-4 flex items-center justify-center overflow-hidden">
                <Image
                  src="/ben.jpg"
                  alt="Ben Spak - Co-Founder & CEO"
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">Ben Spak</h3>
              <p className="text-spotify-green font-medium mb-3">Co-Founder & CEO</p>
              <p className="text-gray-300 text-sm mb-4">
                Former founder who built 3 SaaS companies. Expert in rapid MVP development and startup strategy.
              </p>
              <div className="flex justify-center space-x-2 mb-3">
                <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">MVP Development</span>
                <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">Fundraising</span>
              </div>
            </div>

            {/* Team Member 2 */}
            <div className="bg-dark-card p-6 md:p-8 rounded-lg shadow-sm border border-gray-700 text-center">
              <div className="w-24 h-24 bg-spotify-green rounded-full mx-auto mb-4 flex items-center justify-center overflow-hidden">
                <Image
                  src="/dom-thomas.jpg"
                  alt="Dominique Thomas - Co-Founder & CTO"
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">Dominique Thomas</h3>
              <p className="text-spotify-green font-medium mb-3">Co-Founder & CTO</p>
              <p className="text-gray-300 text-sm mb-4">
                Full-stack engineer with 4+ years building scalable products. Expert with Web3 and decentralized applications.
              </p>
              <div className="flex justify-center space-x-2 mb-3">
                <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">Full-Stack</span>
                <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">Web3</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Past Projects Section */}
      <section className="bg-dark-bg py-12 md:py-20 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-semibold text-center mb-8 md:mb-16 text-white">Past Projects We've Built</h2>
          <p className="text-lg md:text-xl text-gray-300 text-center mb-12 max-w-3xl mx-auto">
            See what we've delivered for other companies.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {/* Project 1 - Karma Auto */}
            <div className="bg-dark-card rounded-lg shadow-sm border border-gray-700 overflow-hidden group hover:border-spotify-green transition-colors">
              <div className="relative h-48 overflow-hidden">
                <Image
                  src="/karma-auto.jpeg"
                  alt="Karma Auto - Lease Page"
                  width={400}
                  height={300}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-10 transition-all"></div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2 text-white">Karma Automotive</h3>
                <p className="text-spotify-green font-medium mb-3">Lease Page</p>
                <p className="text-gray-300 text-sm mb-4">
                  We developed a lease page for Karma Automotive.
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">JavaScript</span>
                  <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">HTML</span>
                  <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">CSS</span>
                </div>
              </div>
            </div>

            {/* Project 2 - Popvia Dashboard */}
            <div className="bg-dark-card rounded-lg shadow-sm border border-gray-700 overflow-hidden group hover:border-spotify-green transition-colors">
              <div className="relative h-48 overflow-hidden">
                <Image
                  src="/popvia-dashboard.jpeg"
                  alt="Popvia Dashboard - Analytics Platform"
                  width={400}
                  height={300}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-10 transition-all"></div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2 text-white">PopVia</h3>
                <p className="text-spotify-green font-medium mb-3">Task Management App</p>
                <p className="text-gray-300 text-sm mb-4">
                  We developed a task management app and dashboard for PopVia.
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">React.js</span>
                  <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">MongoDB</span>
                  <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">Express.js</span>
                </div>
              </div>
            </div>

            {/* Project 3 - Signature Flight Support */}
            <div className="bg-dark-card rounded-lg shadow-sm border border-gray-700 overflow-hidden group hover:border-spotify-green transition-colors">
              <div className="relative h-48 overflow-hidden">
                <Image
                  src="/signature-avionics.jpeg"
                  alt="Signature Flight Support - Aviation Management System"
                  width={400}
                  height={300}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-10 transition-all"></div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2 text-white">Signature Flight Support</h3>
                <p className="text-spotify-green font-medium mb-3">Aviation Careers Website</p>
                <p className="text-gray-300 text-sm mb-4">
                  We developed a careers website for Signature Flight Support.
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">Vue.js</span>
                  <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">Python</span>
                  <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">AWS</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="bg-black py-12 md:py-20 px-4 md:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-semibold mb-4 text-white">Ready to Stop Planning and Start Building?</h2>
          <p className="text-lg md:text-xl text-gray-300 mb-6 md:mb-8 px-2">
            Fix your existing codebase for or build your full MVP in 21 days for $10k.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/contact" className="btn-primary text-lg">
              Get Started
            </Link>
          </div>
        </div>
      </section>

      {/* Obstacles New Startup Founders Face Section */}
      <section className="section-gray py-12 md:py-20 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-semibold text-center mb-8 md:mb-16 text-white">
            🚧 Obstacles New Startup Founders Face
          </h2>
          <p className="text-lg text-gray-300 text-center mb-12 max-w-3xl mx-auto">
            We've identified the most common challenges that prevent founders from launching. Here's how LaunchKit solves each one:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {/* Business Foundation */}
            <div className="bg-dark-card p-6 rounded-lg border border-gray-700">
              <div className="w-12 h-12 bg-spotify-green rounded-lg mb-4 flex items-center justify-center">
                <span className="text-white font-bold text-xl">🏢</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Business Foundation</h3>
              <ul className="space-y-3 text-gray-300 text-sm mb-6">
                <li>• Pick a business name</li>
                <li>• Pick a domain name</li>
                <li>• Unsure if the idea solves a real problem</li>
                <li>• Confusion around registering LLC/C-Corp</li>
                <li>• No clear business model or path to profit</li>
              </ul>
              <div className="space-y-2">
                <Link href="/resources/business-naming" className="text-spotify-green hover:text-green-400 text-sm font-medium block">
                  Get Business Foundation Resources →
                </Link>
                <Link href="/resources/mission-vision" className="text-spotify-green hover:text-green-400 text-sm font-medium block">
                  Get Mission & Vision Resources →
                </Link>
              </div>
            </div>

            {/* Sales & Marketing */}
            <div className="bg-dark-card p-6 rounded-lg border border-gray-700">
              <div className="w-12 h-12 bg-spotify-green rounded-lg mb-4 flex items-center justify-center">
                <span className="text-white font-bold text-xl">📈</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Sales & Marketing</h3>
              <ul className="space-y-3 text-gray-300 text-sm mb-6">
                <li>• Won't get enough sales</li>
                <li>• Don't have the money to spend on advertising</li>
                <li>• Don't know how to market</li>
                <li>• Trouble reaching and interviewing potential customers</li>
                <li>• No clear business model to monetize customers</li>
              </ul>
              <div className="space-y-2">
                <Link href="/resources/customer-acquisition" className="text-spotify-green hover:text-green-400 text-sm font-medium block">
                  Get Customer Acquisition Resources →
                </Link>
                <Link href="/resources/early-customer-acquisition" className="text-spotify-green hover:text-green-400 text-sm font-medium block">
                  Get Sales Scripts & Outreach Plans →
                </Link>
                <Link href="/resources/business-model-roadmap" className="text-spotify-green hover:text-green-400 text-sm font-medium block">
                  Get Business Model Resources →
                </Link>
              </div>
            </div>

            {/* Technical & Development */}
            <div className="bg-dark-card p-6 rounded-lg border border-gray-700">
              <div className="w-12 h-12 bg-spotify-green rounded-lg mb-4 flex items-center justify-center">
                <span className="text-white font-bold text-xl">💻</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Technical & Development</h3>
              <ul className="space-y-3 text-gray-300 text-sm mb-6">
                <li>• Don't know how to make landing pages</li>
                <li>• Non-technical founders don't know how to code</li>
                <li>• Confused about hosting, payments, compliance, integrations</li>
                <li>• Fear of security issues and downtime</li>
                <li>• MVP scope creep killing timelines and budgets</li>
              </ul>
              <div className="space-y-2">
                <Link href="/resources/ai-landing-pages" className="text-spotify-green hover:text-green-400 text-sm font-medium block">
                  Get AI Landing Page Resources →
                </Link>
                <Link href="/resources/domain-naming" className="text-spotify-green hover:text-green-400 text-sm font-medium block">
                  Get Technical Resources →
                </Link>
                <Link href="/resources/mvp-project-scope" className="text-spotify-green hover:text-green-400 text-sm font-medium block">
                  Master MVP Scope Management →
                </Link>
              </div>
            </div>

            {/* Growth & Scaling */}
            <div className="bg-dark-card p-6 rounded-lg border border-gray-700">
              <div className="w-12 h-12 bg-spotify-green rounded-lg mb-4 flex items-center justify-center">
                <span className="text-white font-bold text-xl">🚀</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Growth & Scaling</h3>
              <ul className="space-y-3 text-gray-300 text-sm mb-6">
                <li>• Don't know which KPIs to track</li>
                <li>• Don't know how to scale beyond MVP</li>
                <li>• Can't afford full-time staff</li>
                <li>• Risk of being burned by cheap dev shops</li>
                <li>• Feature creep preventing MVP launch</li>
              </ul>
              <div className="space-y-2">
                <Link href="/resources#growth" className="text-spotify-green hover:text-green-400 text-sm font-medium block">
                  Get Growth Resources →
                </Link>
                <Link href="/resources/mvp-project-scope" className="text-spotify-green hover:text-green-400 text-sm font-medium block">
                  Master MVP Scope Management →
                </Link>
              </div>
            </div>

            {/* Mindset & Execution */}
            <div className="bg-dark-card p-6 rounded-lg border border-gray-700">
              <div className="w-12 h-12 bg-spotify-green rounded-lg mb-4 flex items-center justify-center">
                <span className="text-white font-bold text-xl">🧠</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Mindset & Execution</h3>
              <ul className="space-y-3 text-gray-300 text-sm mb-6">
                <li>• It will take too much time</li>
                <li>• Will suck at it</li>
                <li>• Many founders stuck in analysis paralysis instead of launching</li>
                <li>• Pressure to quit job vs stay employed while building</li>
                <li>• How to pick a cofounder</li>
              </ul>
              <div className="space-y-2">
                <Link href="/resources/build-while-employed" className="text-spotify-green hover:text-green-400 text-sm font-medium block">
                  Get Mindset Resources →
                </Link>
                <Link href="/resources/free-up-time" className="text-spotify-green hover:text-green-400 text-sm font-medium block">
                  Get Time Management Resources →
                </Link>
              </div>
            </div>

            {/* Funding & Investment */}
            <div className="bg-dark-card p-6 rounded-lg border border-gray-700">
              <div className="w-12 h-12 bg-spotify-green rounded-lg mb-4 flex items-center justify-center">
                <span className="text-white font-bold text-xl">💰</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Funding & Investment</h3>
              <ul className="space-y-3 text-gray-300 text-sm mb-6">
                <li>• Investors won't fund just an idea-want traction, data, or a working demo</li>
                <li>• Decks and pitches often lack structure or compelling ROI</li>
                <li>• Founders unsure how much to raise or how to talk about valuation</li>
                <li>• Competitors moving quickly, creating FOMO</li>
              </ul>
              <Link href="/resources#growth" className="text-spotify-green hover:text-green-400 text-sm font-medium">
                Get Funding Resources →
              </Link>
            </div>

            {/* Brand & Positioning */}
            <div className="bg-dark-card p-6 rounded-lg border border-gray-700">
              <div className="w-12 h-12 bg-spotify-green rounded-lg mb-4 flex items-center justify-center">
                <span className="text-white font-bold text-xl">🎨</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Brand & Positioning</h3>
              <ul className="space-y-3 text-gray-300 text-sm mb-6">
                <li>• Little or no brand presence</li>
                <li>• Unsure how to stand out on social (LinkedIn, X, TikTok)</li>
                <li>• Struggle to create hooks, stories, and consistent messaging</li>
                <li>• Lack of clarity on pricing, positioning, or target market</li>
              </ul>
              <Link href="/resources/business-naming" className="text-spotify-green hover:text-green-400 text-sm font-medium">
                Get Branding Resources →
              </Link>
            </div>

            {/* Support & Community */}
            <div className="bg-dark-card p-6 rounded-lg border border-gray-700">
              <div className="w-12 h-12 bg-spotify-green rounded-lg mb-4 flex items-center justify-center">
                <span className="text-white font-bold text-xl">🤝</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Support & Community</h3>
              <ul className="space-y-3 text-gray-300 text-sm mb-6">
                <li>• Overwhelmed with decisions and no experienced partner to sanity-check</li>
                <li>• Friends/family don't understand startup pressure</li>
                <li>• Fear of failure without mentorship</li>
                <li>• Don't know what contracts (NDAs, agreements, IP protection) are necessary</li>
              </ul>
              <div className="space-y-2">
                <Link href="/resources/pick-cofounder" className="text-spotify-green hover:text-green-400 text-sm font-medium block">
                  Get Support Resources →
                </Link>
                <Link href="/resources/hr-compliance-admin" className="text-spotify-green hover:text-green-400 text-sm font-medium block">
                  Get Legal Protection Resources →
                </Link>
              </div>
            </div>
          </div>

          {/* Resources Hub CTA */}
          <div className="text-center mt-12">
            <div className="bg-gradient-to-r from-spotify-green to-green-600 p-8 rounded-lg">
              <h3 className="text-2xl md:text-3xl font-semibold text-white mb-4">
                Get Solutions to All These Problems
              </h3>
              <p className="text-lg text-white mb-6 max-w-2xl mx-auto">
                Our comprehensive resources hub has guides, templates, and tools to help you overcome every startup obstacle.
              </p>
              <Link href="/resources" className="bg-white text-spotify-green hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold text-lg transition-colors">
                Explore Resources Hub
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How We Help Founders Section */}
      <section className="bg-dark-bg py-12 md:py-20 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-semibold text-center mb-8 md:mb-16 text-white">How We Help Founders</h2>
          <p className="text-lg md:text-xl text-gray-300 text-center mb-12 max-w-3xl mx-auto">
            See for yourself how LaunchKit has helped founders go from idea to investor-ready MVP in just 21 days.
          </p>

          <div className="bg-dark-card p-8 md:p-12 rounded-lg border border-gray-700">
            <div className="text-center">
              <div className="mb-8">
                <Image
                  src="/sanket-social-proof.png"
                  alt="Sanket's testimonial about LaunchKit"
                  width={800}
                  height={400}
                  className="mx-auto rounded-lg shadow-lg"
                />
              </div>
              <div className="max-w-4xl mx-auto">
                <blockquote className="text-xl md:text-2xl text-gray-300 italic mb-6 leading-relaxed">
                  "LaunchKit helped me validate my business idea and get my MVP up and running."
                </blockquote>
                <div className="flex items-center justify-center gap-4">
                  <div className="w-12 h-12 bg-spotify-green rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">S</span>
                  </div>
                  <div className="text-left">
                    <p className="text-white font-semibold text-lg">Sanket</p>
                    <p className="text-gray-400">Founder</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Discord Community Section */}
      <section className="section-gray py-12 md:py-20 px-4 md:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-dark-card p-8 md:p-12 rounded-lg border border-gray-700">
            <div className="w-16 h-16 bg-indigo-600 rounded-full mx-auto mb-6 flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
            </div>
            <h2 className="text-3xl md:text-4xl font-semibold mb-4 text-white">Join Our Discord Community</h2>
            <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Connect with fellow founders, get real-time support, and access exclusive resources in our growing startup community.
            </p>
            <a
              href="https://discord.gg/hH6YsyqypU"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-4 rounded-lg text-lg transition-colors"
            >
              <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
              Join Discord Server
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
