import Link from "next/link";
import Image from "next/image";

export default function FoundersPage() {
  return (
    <main>
      {/* Hero Section */}
      <section className="bg-dark-bg py-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6 gradient-text">
            Everything founders need to launch - in one place.
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            At LaunchKit, we believe every founder deserves the right start. That means more than just code - it means guidance, resources, and support that help you go from idea to reality.
          </p>
        </div>
      </section>

      {/* Meet the Founders Section */}
      <section className="section-gray py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-semibold text-center mb-8 text-white">Meet the Founders</h2>
          <p className="text-lg text-gray-300 text-center mb-12 max-w-3xl mx-auto">
            The founders and experts behind LaunchKit who've helped startups go from idea to investor-ready MVP.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto">
            {/* Ben Spak */}
            <div className="bg-dark-card p-6 md:p-8 rounded-lg shadow-sm border border-gray-700 text-center hover:border-spotify-green transition-colors group">
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
              <div className="flex justify-center">
                <Link
                  href="/founders/ben-spak"
                  className="btn-primary text-sm"
                >
                  View Profile
                </Link>
              </div>
            </div>

            {/* Dominique Thomas */}
            <div className="bg-dark-card p-6 md:p-8 rounded-lg shadow-sm border border-gray-700 text-center hover:border-spotify-green transition-colors group">
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
              <div className="flex justify-center">
                <Link
                  href="/founders/dom-thomas"
                  className="btn-primary text-sm"
                >
                  View Profile
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Founder Profile Teaser Section */}
      <section className="bg-dark-bg py-12 md:py-20 px-4 md:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-spotify-green/10 to-blue-600/10 p-8 md:p-12 rounded-lg border border-gray-700">
            <h2 className="text-2xl md:text-3xl font-semibold text-white mb-4">
              Want a LaunchKit Founder Profile?
            </h2>
            <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
              Get your own professional founder profile page like the ones you see above.
              Perfect for building credibility, showcasing your expertise, and connecting with potential clients.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center bg-spotify-green hover:bg-green-600 text-white font-semibold px-8 py-4 rounded-lg text-lg transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* Know Your Journey Section */}
      <section className="bg-dark-bg py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-semibold mb-6 text-white">
              🚀 We Know Your Journey
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              You're not just another founder-you're someone who's ready to break free from the corporate grind and build something that matters.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">


            {/* Your Mindset */}
            <div className="bg-dark-card p-8 rounded-lg border border-gray-700">
              <h3 className="text-2xl font-semibold mb-6 text-white flex items-center gap-3">
                <span className="text-purple-400">🧠</span>
                Your Mindset & Values
              </h3>
              <div className="space-y-4 text-gray-300">
                <p className="text-lg">You value:</p>
                <ul className="list-disc list-inside space-y-3">
                  <li><span className="font-semibold text-white">Freedom</span> from the 9-5 grind and corporate politics</li>
                  <li><span className="font-semibold text-white">Control</span> over your time, decisions, and destiny</li>
                  <li><span className="font-semibold text-white">Speed</span> to market-you know first-mover advantage matters</li>
                  <li><span className="font-semibold text-white">Prestige</span> of being "the founder" and building something from scratch</li>
                </ul>
                <p className="text-lg mt-4">You're <span className="font-semibold text-white">visionary and risk-tolerant</span>, but you're also <span className="font-semibold text-white">impatient with technical complexity</span>.</p>
              </div>
            </div>

            {/* Your Dreams */}
            <div className="bg-dark-card p-8 rounded-lg border border-gray-700">
              <h3 className="text-2xl font-semibold mb-6 text-white flex items-center gap-3">
                <span className="text-green-400">💫</span>
                What You're Dreaming Of
              </h3>
              <div className="space-y-4 text-gray-300">
                <p className="text-lg">You want to:</p>
                <ul className="list-disc list-inside space-y-3">
                  <li><span className="font-semibold text-white">Launch a product</span> that gets real investor attention</li>
                  <li><span className="font-semibold text-white">Escape the corporate treadmill</span> and build your own empire</li>
                  <li><span className="font-semibold text-white">Prove yourself as a founder</span> to your network and family</li>
                  <li><span className="font-semibold text-white">Build something scalable</span> that could raise VC, get press, or land an exit</li>
                </ul>
              </div>
            </div>

            {/* Behaviors & Business Stage */}
            <div className="bg-dark-card p-8 rounded-lg border border-gray-700">
              <h3 className="text-2xl font-semibold mb-6 text-white flex items-center gap-3">
                <span className="text-orange-400">📱</span>
                Behaviors & Business Stage
              </h3>
              <div className="space-y-4 text-gray-300">
                <div>
                  <span className="font-semibold text-white">Where they spend time:</span>
                  <ul className="list-disc list-inside mt-2 ml-4 space-y-1">
                    <li>LinkedIn (posting about startup ideas, networking, reading VC content)</li>
                    <li>X/Twitter (#buildinpublic, following founders, investors, SaaS bros)</li>
                    <li>YouTube (startup stories, Y Combinator talks, AI trends)</li>
                    <li>Podcasts (My First Million, Indie Hackers, All-In Podcast)</li>
                  </ul>
                </div>
                <div>
                  <span className="font-semibold text-white">Business Stage:</span>
                  <ul className="list-disc list-inside mt-2 ml-4 space-y-1">
                    <li>Pre-product: Idea-stage founder with deck, pitch, or mockups but no live product</li>
                    <li>Seed-prep: Maybe has small friends & family check, wants to show traction</li>
                    <li>Revenue-adjacent: Might have landing page signups, wants to prove product works to raise</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Your Fears */}
            <div className="bg-dark-card p-8 rounded-lg border border-gray-700">
              <h3 className="text-2xl font-semibold mb-6 text-white flex items-center gap-3">
                <span className="text-orange-400">😰</span>
                What Keeps You Up At Night
              </h3>
              <div className="space-y-4 text-gray-300">
                <p className="text-lg">You're worried about:</p>
                <ul className="list-disc list-inside space-y-3">
                  <li><span className="font-semibold text-white">Wasting time</span> building the wrong thing</li>
                  <li><span className="font-semibold text-white">Being beaten to market</span> by competitors while you're still planning</li>
                  <li><span className="font-semibold text-white">Running out of savings</span> before you can launch</li>
                  <li><span className="font-semibold text-white">Looking unprofessional</span> to investors or early customers</li>
                  <li><span className="font-semibold text-white">Getting stuck with flaky developers</span> who waste your time and money</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Discord Community CTA */}
          <div className="mt-12 bg-gradient-to-r from-indigo-900/20 to-purple-900/20 p-8 rounded-lg border border-gray-600">
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-600 rounded-full mx-auto mb-6 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
              </div>
              <h3 className="text-2xl md:text-3xl font-semibold text-white mb-4">
                Join Our Founder Community
              </h3>
              <p className="text-lg text-gray-300 mb-6 max-w-2xl mx-auto">
                Connect with fellow founders, get real-time support, and access exclusive resources in our growing Discord community.
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

          {/* Your Goals */}
          <div className="mt-12 bg-gradient-to-r from-blue-900/20 to-purple-900/20 p-8 rounded-lg border border-gray-600">
            <h3 className="text-2xl font-semibold mb-6 text-white text-center">🎯 What You Actually Want</h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-xl font-semibold text-white mb-4">Your Investment:</h4>
                <p className="text-gray-300 mb-4">You want to spend <span className="font-semibold text-white">$5K for an MVP in 21 days</span>-something tangible you can actually demo.</p>
                <p className="text-gray-300">Your ROI expectation: <span className="font-semibold text-white">10x return</span>-$50K+ in funding or revenue within 12-18 months.</p>
              </div>
              <div>
                <h4 className="text-xl font-semibold text-white mb-4">What You Expect:</h4>
                <ul className="list-disc list-inside space-y-2 text-gray-300">
                  <li>An MVP ready to demo to investors and customers</li>
                  <li>Something that looks professional (not like a hackathon project)</li>
                  <li>To finally feel like a "real founder" with something to show</li>
                </ul>
              </div>
            </div>
          </div>

          {/* How We Help */}
          <div className="mt-12 bg-gradient-to-r from-green-900/20 to-blue-900/20 p-8 rounded-lg border border-gray-600">
            <h3 className="text-2xl font-semibold mb-6 text-white text-center">🚀 How LaunchKit Gets You There</h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <h4 className="text-xl font-semibold text-white mb-3">Our Promise</h4>
                <p className="text-gray-300">We get you from idea to investor-ready MVP in <span className="font-semibold text-white">21 days </span>- so you can pitch with confidence and real traction.</p>
              </div>
              <div className="text-center">
                <h4 className="text-xl font-semibold text-white mb-3">Why We're Different</h4>
                <p className="text-gray-300">Unlike random freelancers, we're a <span className="font-semibold text-white">structured process + launch partner</span>. Unlike agencies, we're affordable, fast, and focused on your ROI.</p>
              </div>
              <div className="text-center">
                <h4 className="text-xl font-semibold text-white mb-3">What You're Really Buying</h4>
                <p className="text-gray-300">You're not just buying code-you're buying <span className="font-semibold text-white">momentum and credibility as a founder</span>.</p>
              </div>
            </div>
          </div>

          {/* Why This Matters */}
          <div className="mt-12 bg-gradient-to-r from-purple-900/20 to-pink-900/20 p-8 rounded-lg border border-gray-600">
            <h3 className="text-2xl font-semibold mb-6 text-white text-center">💡 Why This Matters to You</h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <h4 className="text-xl font-semibold text-white mb-3">Speed & Urgency</h4>
                <p className="text-gray-300">Every week you wait, a competitor gets closer. We launch in <span className="font-semibold text-white">21 days</span>.</p>
              </div>
              <div className="text-center">
                <h4 className="text-xl font-semibold text-white mb-3">Your Pain Point</h4>
                <p className="text-gray-300">Investors don't fund ideas-they fund products. Show them <span className="font-semibold text-white">something real</span>.</p>
              </div>
              <div className="text-center">
                <h4 className="text-xl font-semibold text-white mb-3">Your ROI Edge</h4>
                <p className="text-gray-300"><span className="font-semibold text-white">$5K → $50K</span> in funding. That's how founders win.</p>
              </div>
            </div>
          </div>

          {/* Your Next Steps */}

        </div>
      </section>


      {/* Disclaimer */}
      <section className="section-gray py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-semibold mb-8 text-white">Disclaimer</h2>
          <p className="text-xl text-gray-300 mb-12">
            We believe the founders who see the best results are the ones who take ownership, follow the process, and push through challenges. If you need a guarantee before getting started, this probably isn't the right fit.
          </p>
          <p className="text-xl text-gray-300 mb-12">We're looking for motivated, self-driven founders who are committed to making progress and ready to put in the work. Our role is to guide you with proven systems, expertise, and a clear path - but the drive has to come from you.</p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-black py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-semibold mb-4 text-white">🚀 Ready to build your launch kit?</h2>
          <Link href="/contact" className="btn-primary text-lg">
            Get Started with LaunchKit
          </Link>
        </div>
      </section>
    </main>
  );
}
