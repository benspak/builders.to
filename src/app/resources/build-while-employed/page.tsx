import ResourcePageWrapper from "@/components/ResourcePageWrapper";

export default function BuildWhileEmployedPage() {
  return (
    <ResourcePageWrapper
      resourceTitle="Build While Employed: Launch Your Startup Safely"
      delay={20}
      className="bg-dark-bg py-20 px-6"
    >
      <main>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">
            🚀 The Ultimate Guide: Building a Million-Dollar Business While Keeping Your Day Job
          </h1>
          <div className="inline-block bg-spotify-green text-black px-4 py-2 rounded-full text-sm font-semibold mb-4">
            A LaunchKit Master Guide
          </div>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Learn the proven strategies used by founders like Sara Blakely (Spanx), Brian Chesky (Airbnb), and Steve Jobs (Apple) to build empires while maintaining financial security. This comprehensive guide combines expert insights from leading entrepreneurship books with real-world case studies to give you a systematic approach to building wealth without quitting your job.
          </p>
        </div>

        {/* Inspirational Quote Section */}
        <div className="bg-gradient-to-r from-spotify-green/20 to-blue-500/20 p-8 rounded-lg border border-gray-700 mb-12">
          <blockquote className="text-center">
            <p className="text-2xl text-white italic mb-4">
              "The best time to plant a tree was 20 years ago. The second best time is now."
            </p>
            <cite className="text-spotify-green text-lg">— Chinese Proverb</cite>
          </blockquote>
        </div>

        {/* Famous Business Strategy Section */}
        <div className="bg-dark-card p-8 rounded-lg border border-gray-700 mb-12">
          <h2 className="text-2xl font-semibold text-white mb-6 text-center">🏆 Famous Business Strategies for Building While Employed</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gray-800/50 p-4 rounded-lg">
              <h4 className="text-spotify-green font-semibold mb-2">The "Bootstrap First" Strategy</h4>
              <p className="text-gray-300 text-sm">
                <strong>From "The $100 Startup" by Chris Guillebeau:</strong> Start with minimal resources, validate demand, then scale. This approach has built companies like Mailchimp, Basecamp, and GitHub.
              </p>
            </div>
            <div className="bg-gray-800/50 p-4 rounded-lg">
              <h4 className="text-spotify-green font-semibold mb-2">The "Lean Startup" Methodology</h4>
              <p className="text-gray-300 text-sm">
                <strong>From "The Lean Startup" by Eric Ries:</strong> Build-Measure-Learn cycle allows you to test ideas quickly without massive investment, perfect for employed founders.
              </p>
            </div>
            <div className="bg-gray-800/50 p-4 rounded-lg">
              <h4 className="text-spotify-green font-semibold mb-2">The "Blue Ocean" Approach</h4>
              <p className="text-gray-300 text-sm">
                <strong>From "Blue Ocean Strategy" by W. Chan Kim:</strong> Create uncontested market space by solving problems your competitors ignore, allowing you to build without direct competition.
              </p>
            </div>
            <div className="bg-gray-800/50 p-4 rounded-lg">
              <h4 className="text-spotify-green font-semibold mb-2">The "10X Rule" Philosophy</h4>
              <p className="text-gray-300 text-sm">
                <strong>From "The 10X Rule" by Grant Cardone:</strong> Set goals 10 times bigger than you think possible and work 10 times harder than others expect, creating massive competitive advantages.
              </p>
            </div>
          </div>
        </div>

        {/* Section 1: The Psychology of Building While Employed */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">1. The Psychology of Building While Employed</h2>

          <div className="bg-dark-card p-8 rounded-lg border border-gray-700 mb-8">
            <h3 className="text-2xl font-semibold text-white mb-6">From "Mindset" by Carol Dweck</h3>
            <p className="text-gray-300 mb-6">
              Building a business while employed requires a growth mindset—the belief that your abilities can be developed through dedication and hard work. This mindset separates successful side entrepreneurs from those who give up.
            </p>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-xl font-semibold text-spotify-green mb-4">Real Example: Howard Schultz (Starbucks)</h4>
                <p className="text-gray-300 mb-4">
                  Schultz worked at Xerox while building his coffee vision. He used his job to learn sales and business development skills, then applied them to building Starbucks into a global empire.
                </p>
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <p className="text-gray-300 text-sm">
                    <strong className="text-white">Key Insight:</strong> "Your job is not a prison—it's a training ground for your entrepreneurial journey."
                  </p>
                </div>
              </div>
              <div>
                <h4 className="text-xl font-semibold text-spotify-green mb-4">Real Example: Reid Hoffman (LinkedIn)</h4>
                <p className="text-gray-300 mb-4">
                  Hoffman worked at PayPal while developing LinkedIn's concept. He used his job to build industry connections and learn about scaling technology companies.
                </p>
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <p className="text-gray-300 text-sm">
                    <strong className="text-white">Lesson:</strong> Every job teaches valuable skills that can be applied to your business.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-dark-card p-6 rounded-lg border border-gray-700">
              <h4 className="text-lg font-semibold text-white mb-3">🧠 Growth Mindset</h4>
              <p className="text-gray-300 text-sm">See challenges as opportunities to learn and improve, not as threats.</p>
            </div>
            <div className="bg-dark-card p-6 rounded-lg border border-gray-700">
              <h4 className="text-lg font-semibold text-white mb-3">⚡ Delayed Gratification</h4>
              <p className="text-gray-300 text-sm">Sacrifice short-term comfort for long-term success and freedom.</p>
            </div>
            <div className="bg-dark-card p-6 rounded-lg border border-gray-700">
              <h4 className="text-lg font-semibold text-white mb-3">💪 Resilience</h4>
              <p className="text-gray-300 text-sm">Bounce back from setbacks and use them as learning experiences.</p>
            </div>
          </div>
        </section>

        {/* Section 2: The Compound Effect Strategy */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">2. The Compound Effect: Small Actions, Massive Results</h2>

          <div className="bg-dark-card p-8 rounded-lg border border-gray-700 mb-8">
            <h3 className="text-2xl font-semibold text-white mb-6">From "The Compound Effect" by Darren Hardy</h3>
            <p className="text-gray-300 mb-6">
              Success doesn't happen overnight. It's the result of consistent, daily actions that compound over time. Small improvements, when applied consistently, create exponential results.
            </p>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-xl font-semibold text-spotify-green mb-4">Real Example: Warren Buffett</h4>
                <p className="text-gray-300 mb-4">
                  Buffett started investing at age 11 and has been reading 500-1000 pages per day for decades. This daily habit of learning and investing has compounded into a $100+ billion fortune.
                </p>
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <p className="text-gray-300 text-sm">
                    <strong className="text-white">Quote:</strong> "The best investment you can make is in yourself."
                  </p>
                </div>
              </div>
              <div>
                <h4 className="text-xl font-semibold text-spotify-green mb-4">Real Example: Amazon's Customer Focus</h4>
                <p className="text-gray-300 mb-4">
                  Amazon's success comes from obsessing over customer experience every single day. This daily focus on customer satisfaction has compounded into the world's most customer-centric company.
                </p>
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <p className="text-gray-300 text-sm">
                    <strong className="text-white">Lesson:</strong> Consistency beats intensity every time
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-spotify-green/10 border border-spotify-green/30 p-6 rounded-lg">
            <h4 className="text-xl font-semibold text-white mb-4">Daily Habits That Compound Success</h4>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h5 className="text-white font-semibold mb-3">Morning Routine:</h5>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• Read industry news (15 min)</li>
                  <li>• Plan your top 3 priorities</li>
                  <li>• Exercise or meditation</li>
                </ul>
              </div>
              <div>
                <h5 className="text-white font-semibold mb-3">Evening Routine:</h5>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• Review your day's progress</li>
                  <li>• Plan tomorrow's priorities</li>
                  <li>• Learn something new (30 min)</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Step 1 */}
          <div className="bg-dark-card p-8 rounded-lg border border-gray-700">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-spotify-green rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-black font-bold text-xl">1</span>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-semibold mb-4 text-white">Set Clear Priorities</h2>
                <p className="text-gray-300 text-lg leading-relaxed mb-4">
                  Decide what matters most right now: validating your idea, finding first customers, or building your MVP. Focus on the activities with the highest ROI.
                </p>

                <div className="bg-gray-800/50 p-4 rounded-lg mb-4">
                  <h4 className="text-spotify-green font-semibold mb-2">Real Example: Nike's Early Days</h4>
                  <p className="text-gray-300">
                    Bill Bowerman, Nike's co-founder, was a track coach at the University of Oregon while developing his revolutionary waffle-soled running shoes. He prioritized innovation and testing with his athletes before scaling production.
                  </p>
                </div>

                <div className="bg-gray-800/50 p-4 rounded-lg mb-4">
                  <h4 className="text-spotify-green font-semibold mb-2">Quote from "The Lean Startup" by Eric Ries</h4>
                  <p className="text-gray-300 italic">
                    "The goal of a startup is to figure out the right thing to build—the thing customers want and will pay for—as quickly as possible."
                  </p>
                </div>

                <div className="bg-gray-800/50 p-4 rounded-lg mb-4">
                  <h4 className="text-spotify-green font-semibold mb-2">Quote from "Good to Great" by Jim Collins</h4>
                  <p className="text-gray-300 italic">
                    "The good-to-great companies did not focus principally on what to do to become great; they focused equally on what not to do and what to stop doing."
                  </p>
                </div>

                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <h4 className="text-spotify-green font-semibold mb-2">Actionable Framework</h4>
                  <ul className="text-gray-300 list-disc list-inside space-y-1">
                    <li>Week 1-2: Market research and customer interviews</li>
                    <li>Week 3-4: MVP development and testing</li>
                    <li>Week 5-6: Customer acquisition and validation</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-dark-card p-8 rounded-lg border border-gray-700">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-spotify-green rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-black font-bold text-xl">2</span>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-semibold mb-4 text-white">Create a Time Block System</h2>
                <p className="text-gray-300 text-lg leading-relaxed mb-4">
                  Dedicate consistent hours each week to your business. Early mornings, evenings, or weekends can become productive work blocks if scheduled intentionally.
                </p>

                <div className="bg-gray-800/50 p-4 rounded-lg mb-4">
                  <h4 className="text-spotify-green font-semibold mb-2">Real Example: Sara Blakely (Spanx)</h4>
                  <p className="text-gray-300">
                    While working full-time selling fax machines, Blakely spent her evenings and weekends researching patents, testing prototypes, and building her company. She eventually became the youngest self-made female billionaire.
                  </p>
                </div>

                <div className="bg-gray-800/50 p-4 rounded-lg mb-4">
                  <h4 className="text-spotify-green font-semibold mb-2">Quote from "Deep Work" by Cal Newport</h4>
                  <p className="text-gray-300 italic">
                    "The ability to perform deep work is becoming increasingly rare at the same time it is becoming increasingly valuable in our economy."
                  </p>
                </div>

                <div className="bg-gray-800/50 p-4 rounded-lg mb-4">
                  <h4 className="text-spotify-green font-semibold mb-2">Quote from "The 4-Hour Workweek" by Tim Ferriss</h4>
                  <p className="text-gray-300 italic">
                    "Focus on being productive instead of busy. Don't confuse motion with progress. A rocking horse keeps moving but never makes any forward progress."
                  </p>
                </div>

                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <h4 className="text-spotify-green font-semibold mb-2">Recommended Time Block Schedule</h4>
                  <div className="grid md:grid-cols-2 gap-4 text-gray-300">
                    <div>
                      <h5 className="font-semibold text-white">Weekdays:</h5>
                      <ul className="list-disc list-inside space-y-1">
                        <li>5:00-7:00 AM: Deep work on business</li>
                        <li>Lunch break: Customer research</li>
                        <li>8:00-10:00 PM: Planning & execution</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-semibold text-white">Weekends:</h5>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Saturday: 4-6 hours focused work</li>
                        <li>Sunday: 2-3 hours planning</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-dark-card p-8 rounded-lg border border-gray-700">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-spotify-green rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-black font-bold text-xl">3</span>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-semibold mb-4 text-white">Use Your Job as an Asset</h2>
                <p className="text-gray-300 text-lg leading-relaxed mb-4">
                  Your current job provides stability and sometimes insights. Learn from your industry, build skills, or network with contacts who may become future customers.
                </p>

                <div className="bg-gray-800/50 p-4 rounded-lg mb-4">
                  <h4 className="text-spotify-green font-semibold mb-2">Real Example: Apple's Steve Jobs</h4>
                  <p className="text-gray-300">
                    Jobs worked at Atari while developing Apple I. He learned about electronics manufacturing, distribution channels, and business operations that directly benefited Apple's early success.
                  </p>
                </div>

                <div className="bg-gray-800/50 p-4 rounded-lg mb-4">
                  <h4 className="text-spotify-green font-semibold mb-2">Quote from "Zero to One" by Peter Thiel</h4>
                  <p className="text-gray-300 italic">
                    "The best entrepreneurs know this: every great business is built around a secret that's hidden from the outside. A great company is a conspiracy to change the world."
                  </p>
                </div>

                <div className="bg-gray-800/50 p-4 rounded-lg mb-4">
                  <h4 className="text-spotify-green font-semibold mb-2">Quote from "The Millionaire Fastlane" by MJ DeMarco</h4>
                  <p className="text-gray-300 italic">
                    "Your job is not your career. Your job is a stepping stone to your career. Use it to learn, network, and build the foundation for your business."
                  </p>
                </div>

                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <h4 className="text-spotify-green font-semibold mb-2">Leverage Your Job For:</h4>
                  <ul className="text-gray-300 list-disc list-inside space-y-1">
                    <li><strong>Industry Knowledge:</strong> Understand customer pain points and market gaps</li>
                    <li><strong>Network Building:</strong> Connect with potential customers, partners, or investors</li>
                    <li><strong>Skill Development:</strong> Learn project management, sales, or technical skills</li>
                    <li><strong>Financial Stability:</strong> Fund your business without external investment</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="bg-dark-card p-8 rounded-lg border border-gray-700">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-spotify-green rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-black font-bold text-xl">4</span>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-semibold mb-4 text-white">Start Lean</h2>
                <p className="text-gray-300 text-lg leading-relaxed mb-4">
                  Avoid overspending in the early stages. Use no-code tools, freelancers, or AI to save time and money while testing your concept.
                </p>

                <div className="bg-gray-800/50 p-4 rounded-lg mb-4">
                  <h4 className="text-spotify-green font-semibold mb-2">Real Example: Airbnb's Bootstrap Story</h4>
                  <p className="text-gray-300">
                    Brian Chesky and Joe Gebbia started Airbnb with just $1,000 and their own apartment. They used simple tools like Craigslist for marketing and built a basic website to test demand before raising any funding.
                  </p>
                </div>

                <div className="bg-gray-800/50 p-4 rounded-lg mb-4">
                  <h4 className="text-spotify-green font-semibold mb-2">Quote from "The $100 Startup" by Chris Guillebeau</h4>
                  <p className="text-gray-300 italic">
                    "You don't need a million dollars to start a business. You need a good idea, some basic skills, and the willingness to work hard."
                  </p>
                </div>

                <div className="bg-gray-800/50 p-4 rounded-lg mb-4">
                  <h4 className="text-spotify-green font-semibold mb-2">Quote from "Running Lean" by Ash Maurya</h4>
                  <p className="text-gray-300 italic">
                    "The goal of a lean startup is to learn what customers want as quickly as possible, not to build what you think they want."
                  </p>
                </div>

                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <h4 className="text-spotify-green font-semibold mb-2">Lean Startup Toolkit</h4>
                  <div className="grid md:grid-cols-2 gap-4 text-gray-300">
                    <div>
                      <h5 className="font-semibold text-white">No-Code Tools:</h5>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Webflow for websites</li>
                        <li>Zapier for automation</li>
                        <li>Notion for project management</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-semibold text-white">Cost-Effective Services:</h5>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Fiverr for design work</li>
                        <li>Upwork for development</li>
                        <li>Canva for graphics</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 5 */}
          <div className="bg-dark-card p-8 rounded-lg border border-gray-700">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-spotify-green rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-black font-bold text-xl">5</span>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-semibold mb-4 text-white">Validate Before Scaling</h2>
                <p className="text-gray-300 text-lg leading-relaxed mb-4">
                  Don't quit your job until you've proven traction. Secure paying customers or at least strong signals of demand before taking the leap.
                </p>

                <div className="bg-gray-800/50 p-4 rounded-lg mb-4">
                  <h4 className="text-spotify-green font-semibold mb-2">Real Example: Dropbox's MVP Strategy</h4>
                  <p className="text-gray-300">
                    Drew Houston created a simple video demonstrating Dropbox's concept before building the full product. The video went viral, generating 75,000 signups overnight and proving massive demand existed.
                  </p>
                </div>

                <div className="bg-gray-800/50 p-4 rounded-lg mb-4">
                  <h4 className="text-spotify-green font-semibold mb-2">Quote from "Traction" by Gabriel Weinberg</h4>
                  <p className="text-gray-300 italic">
                    "Traction is a sign that something is working. If nothing is working, you need to pivot. If something is working, you need to double down on it."
                  </p>
                </div>

                <div className="bg-gray-800/50 p-4 rounded-lg mb-4">
                  <h4 className="text-spotify-green font-semibold mb-2">Quote from "The Mom Test" by Rob Fitzpatrick</h4>
                  <p className="text-gray-300 italic">
                    "The truth is that people lie to you when they're trying to be nice. The Mom Test is about asking questions that even your mom can't lie to you about."
                  </p>
                </div>

                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <h4 className="text-spotify-green font-semibold mb-2">Validation Metrics to Track</h4>
                  <div className="grid md:grid-cols-2 gap-4 text-gray-300">
                    <div>
                      <h5 className="font-semibold text-white">Customer Validation:</h5>
                      <ul className="list-disc list-inside space-y-1">
                        <li>10+ paying customers</li>
                        <li>Customer retention &gt; 80%</li>
                        <li>Positive unit economics</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-semibold text-white">Market Validation:</h5>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Growing waitlist</li>
                        <li>Competitor analysis</li>
                        <li>Market size &gt; $1B</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 6 */}
          <div className="bg-dark-card p-8 rounded-lg border border-gray-700">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-spotify-green rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-black font-bold text-xl">6</span>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-semibold mb-4 text-white">Protect Your Energy</h2>
                <p className="text-gray-300 text-lg leading-relaxed mb-4">
                  Balancing a job and business can lead to burnout. Prioritize rest, exercise, and boundaries so you don't run out of steam.
                </p>

                <div className="bg-gray-800/50 p-4 rounded-lg mb-4">
                  <h4 className="text-spotify-green font-semibold mb-2">Real Example: Elon Musk's Work Schedule</h4>
                  <p className="text-gray-300">
                    While building Tesla and SpaceX, Musk maintained a strict schedule with dedicated time for family and exercise. He famously said, "If you're not working 80-100 hours a week, you're not working hard enough," but also emphasized the importance of sustainable energy management.
                  </p>
                </div>

                <div className="bg-gray-800/50 p-4 rounded-lg mb-4">
                  <h4 className="text-spotify-green font-semibold mb-2">Quote from "The Power of Full Engagement" by Jim Loehr</h4>
                  <p className="text-gray-300 italic">
                    "Energy, not time, is the fundamental currency of high performance. The number of hours in a day is fixed, but the quantity and quality of energy available to us is not."
                  </p>
                </div>

                <div className="bg-gray-800/50 p-4 rounded-lg mb-4">
                  <h4 className="text-spotify-green font-semibold mb-2">Quote from "Essentialism" by Greg McKeown</h4>
                  <p className="text-gray-300 italic">
                    "If you don't prioritize your life, someone else will. The way of the Essentialist means living by design, not by default."
                  </p>
                </div>

                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <h4 className="text-spotify-green font-semibold mb-2">Energy Management Strategies</h4>
                  <ul className="text-gray-300 list-disc list-inside space-y-1">
                    <li><strong>Sleep:</strong> Prioritize 7-8 hours for peak cognitive performance</li>
                    <li><strong>Exercise:</strong> 30 minutes daily to boost energy and creativity</li>
                    <li><strong>Nutrition:</strong> Eat for sustained energy, not quick fixes</li>
                    <li><strong>Boundaries:</strong> Set clear work hours and stick to them</li>
                    <li><strong>Recovery:</strong> Take regular breaks and vacations</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Step 7 */}
          <div className="bg-dark-card p-8 rounded-lg border border-gray-700">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-spotify-green rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-black font-bold text-xl">7</span>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-semibold mb-4 text-white">Maintain Professional Integrity</h2>
                <p className="text-gray-300 text-lg leading-relaxed mb-4">
                  Don't use your employer's time or resources for your business. Stay ethical — your reputation matters for long-term success.
                </p>

                <div className="bg-gray-800/50 p-4 rounded-lg mb-4">
                  <h4 className="text-spotify-green font-semibold mb-2">Real Example: Warren Buffett's Ethical Standards</h4>
                  <p className="text-gray-300">
                    Buffett built his investment empire while maintaining the highest ethical standards. He famously said, "It takes 20 years to build a reputation and five minutes to ruin it. If you think about that, you'll do things differently."
                  </p>
                </div>

                <div className="bg-gray-800/50 p-4 rounded-lg mb-4">
                  <h4 className="text-spotify-green font-semibold mb-2">Quote from "Built to Last" by Jim Collins</h4>
                  <p className="text-gray-300 italic">
                    "Visionary companies distinguish their timeless core values and enduring purpose, which should never change, from their operating practices and business strategies, which should be changing constantly."
                  </p>
                </div>

                <div className="bg-gray-800/50 p-4 rounded-lg mb-4">
                  <h4 className="text-spotify-green font-semibold mb-2">Quote from "The Speed of Trust" by Stephen M.R. Covey</h4>
                  <p className="text-gray-300 italic">
                    "Trust is the one thing that changes everything. When trust goes up, speed goes up and cost goes down. When trust goes down, speed goes down and cost goes up."
                  </p>
                </div>

                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <h4 className="text-spotify-green font-semibold mb-2">Ethical Guidelines</h4>
                  <ul className="text-gray-300 list-disc list-inside space-y-1">
                    <li>Never use company time, equipment, or resources for personal business</li>
                    <li>Don't compete directly with your employer</li>
                    <li>Maintain confidentiality agreements</li>
                    <li>Be transparent about conflicts of interest</li>
                    <li>Respect non-compete clauses if they exist</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Step 8 */}
          <div className="bg-dark-card p-8 rounded-lg border border-gray-700">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-spotify-green rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-black font-bold text-xl">8</span>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-semibold mb-4 text-white">Plan the Transition</h2>
                <p className="text-gray-300 text-lg leading-relaxed mb-4">
                  Set a milestone for when you'll go full-time (e.g., consistent revenue, funding, or savings). A clear plan gives you confidence and reduces risk.
                </p>

                <div className="bg-gray-800/50 p-4 rounded-lg mb-4">
                  <h4 className="text-spotify-green font-semibold mb-2">Real Example: Jeff Bezos's Calculated Risk</h4>
                  <p className="text-gray-300">
                    Bezos quit his Wall Street job to start Amazon only after calculating that if he failed, he could always get another job. He had 6 months of runway and a clear plan for what he would build.
                  </p>
                </div>

                <div className="bg-gray-800/50 p-4 rounded-lg mb-4">
                  <h4 className="text-spotify-green font-semibold mb-2">Quote from "The Hard Thing About Hard Things" by Ben Horowitz</h4>
                  <p className="text-gray-300 italic">
                    "The most important rule of raising money privately: Look for a market of one. You only need one investor to say yes."
                  </p>
                </div>

                <div className="bg-gray-800/50 p-4 rounded-lg mb-4">
                  <h4 className="text-spotify-green font-semibold mb-2">Quote from "The Psychology of Money" by Morgan Housel</h4>
                  <p className="text-gray-300 italic">
                    "The ability to do what you want, when you want, with who you want, for as long as you want, is priceless. It is the highest dividend money pays."
                  </p>
                </div>

                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <h4 className="text-spotify-green font-semibold mb-2">Transition Checklist</h4>
                  <div className="grid md:grid-cols-2 gap-4 text-gray-300">
                    <div>
                      <h5 className="font-semibold text-white">Financial Readiness:</h5>
                      <ul className="list-disc list-inside space-y-1">
                        <li>6-12 months of living expenses</li>
                        <li>Consistent monthly revenue</li>
                        <li>Positive cash flow</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-semibold text-white">Business Readiness:</h5>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Proven product-market fit</li>
                        <li>Growing customer base</li>
                        <li>Clear growth strategy</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Famous Entrepreneur Quotes Section */}
        <div className="mt-16 bg-dark-card p-8 rounded-lg border border-gray-700">
          <h3 className="text-2xl font-semibold text-white mb-6 text-center">💬 Wisdom from Legendary Entrepreneurs</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gray-800/50 p-4 rounded-lg">
              <blockquote className="text-gray-300 italic mb-2">
                "The way to get started is to quit talking and begin doing."
              </blockquote>
              <cite className="text-spotify-green text-sm">— Walt Disney</cite>
            </div>
            <div className="bg-gray-800/50 p-4 rounded-lg">
              <blockquote className="text-gray-300 italic mb-2">
                "Success is not final, failure is not fatal: it is the courage to continue that counts."
              </blockquote>
              <cite className="text-spotify-green text-sm">— Winston Churchill</cite>
            </div>
            <div className="bg-gray-800/50 p-4 rounded-lg">
              <blockquote className="text-gray-300 italic mb-2">
                "The future belongs to those who believe in the beauty of their dreams."
              </blockquote>
              <cite className="text-spotify-green text-sm">— Eleanor Roosevelt</cite>
            </div>
            <div className="bg-gray-800/50 p-4 rounded-lg">
              <blockquote className="text-gray-300 italic mb-2">
                "Don't watch the clock; do what it does. Keep going."
              </blockquote>
              <cite className="text-spotify-green text-sm">— Sam Levenson</cite>
            </div>
            <div className="bg-gray-800/50 p-4 rounded-lg">
              <blockquote className="text-gray-300 italic mb-2">
                "The only limit to our realization of tomorrow will be our doubts of today."
              </blockquote>
              <cite className="text-spotify-green text-sm">— Franklin D. Roosevelt</cite>
            </div>
            <div className="bg-gray-800/50 p-4 rounded-lg">
              <blockquote className="text-gray-300 italic mb-2">
                "It always seems impossible until it's done."
              </blockquote>
              <cite className="text-spotify-green text-sm">— Nelson Mandela</cite>
            </div>
          </div>
        </div>

        {/* Additional Resources Section */}
        <div className="mt-16 bg-dark-card p-8 rounded-lg border border-gray-700">
          <h3 className="text-2xl font-semibold text-white mb-6 text-center">📚 Recommended Reading & Resources</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-spotify-green font-semibold mb-3">Essential Books</h4>
              <ul className="text-gray-300 space-y-2">
                <li>• "The Lean Startup" by Eric Ries</li>
                <li>• "Zero to One" by Peter Thiel</li>
                <li>• "The $100 Startup" by Chris Guillebeau</li>
                <li>• "Traction" by Gabriel Weinberg</li>
                <li>• "Deep Work" by Cal Newport</li>
                <li>• "The Millionaire Fastlane" by MJ DeMarco</li>
                <li>• "Running Lean" by Ash Maurya</li>
                <li>• "The Mom Test" by Rob Fitzpatrick</li>
                <li>• "Essentialism" by Greg McKeown</li>
                <li>• "The Psychology of Money" by Morgan Housel</li>
              </ul>
            </div>
            <div>
              <h4 className="text-spotify-green font-semibold mb-3">Success Stories to Study</h4>
              <ul className="text-gray-300 space-y-2">
                <li>• Nike's early days with Bill Bowerman</li>
                <li>• Apple's garage startup story</li>
                <li>• Spanx's bootstrap journey</li>
                <li>• Airbnb's validation strategy</li>
                <li>• Dropbox's MVP approach</li>
                <li>• Tesla's energy revolution</li>
                <li>• Microsoft's partnership model</li>
                <li>• Amazon's customer obsession</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Section 9: The Compound Effect for Employed Founders */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">9. The Compound Effect: Small Actions, Massive Results</h2>

          <div className="bg-dark-card p-8 rounded-lg border border-gray-700 mb-8">
            <h3 className="text-2xl font-semibold text-white mb-6">From "The Compound Effect" by Darren Hardy</h3>
            <p className="text-gray-300 mb-6">
              Success doesn't happen overnight. It's the result of consistent, daily actions that compound over time. Small improvements, when applied consistently, create exponential results.
            </p>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-xl font-semibold text-spotify-green mb-4">Real Example: Warren Buffett's Reading Habit</h4>
                <p className="text-gray-300 mb-4">
                  Buffett reads 500-1000 pages per day and has been doing so for decades. This daily habit of learning has compounded into a $100+ billion fortune and unparalleled investment wisdom.
                </p>
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <p className="text-gray-300 text-sm">
                    <strong className="text-white">Quote:</strong> "The best investment you can make is in yourself."
                  </p>
                </div>
              </div>
              <div>
                <h4 className="text-xl font-semibold text-spotify-green mb-4">Real Example: Amazon's Customer Obsession</h4>
                <p className="text-gray-300 mb-4">
                  Amazon's success comes from obsessing over customer experience every single day. This daily focus on customer satisfaction has compounded into the world's most customer-centric company.
                </p>
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <p className="text-gray-300 text-sm">
                    <strong className="text-white">Lesson:</strong> Consistency beats intensity every time
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-spotify-green/10 border border-spotify-green/30 p-6 rounded-lg">
            <h4 className="text-xl font-semibold text-white mb-4">Your Daily Compound Actions</h4>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h5 className="text-white font-semibold mb-3">Morning Routine (30 min):</h5>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• Read industry news (15 min)</li>
                  <li>• Plan your top 3 business priorities</li>
                  <li>• Exercise or meditation (15 min)</li>
                </ul>
              </div>
              <div>
                <h5 className="text-white font-semibold mb-3">Evening Routine (30 min):</h5>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• Review your day's progress</li>
                  <li>• Plan tomorrow's priorities</li>
                  <li>• Learn something new about your industry</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-red-900/20 to-orange-900/20 border border-red-500/30 p-8 rounded-lg">
            <h2 className="text-3xl font-bold text-white mb-6">🚨 Your Job Security is an Illusion</h2>
            <p className="text-xl text-gray-300 mb-6">
              <strong>Founder Reality Check:</strong> While you're comfortable in your job, AI and automation are coming for your position. Building a business while employed isn't just smart - it's survival.
            </p>
            <div className="bg-dark-card p-6 rounded-lg border border-gray-700 mb-6">
              <h3 className="text-xl font-semibold text-white mb-4">What Waiting Costs You:</h3>
              <div className="grid md:grid-cols-3 gap-4 text-gray-300">
                <div>
                  <p className="text-red-400 font-semibold">🤖 Job Displacement</p>
                  <p className="text-sm">AI replacing your role</p>
                </div>
                <div>
                  <p className="text-red-400 font-semibold">💰 Opportunity Cost</p>
                  <p className="text-sm">$1M+ in potential equity</p>
                </div>
                <div>
                  <p className="text-red-400 font-semibold">⏰ Age Factor</p>
                  <p className="text-sm">Harder to take risks later</p>
                </div>
              </div>
            </div>
            <p className="text-lg text-gray-300 mb-6">
              <strong>LaunchKit helps employed founders build MVPs that create financial freedom.</strong> Start building your safety net before you need it.
            </p>
            <div className="space-y-4">
              <a href="/contact" className="inline-block bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-lg font-bold text-xl transition-colors">
                🛡️ Build Your Financial Safety Net Now
              </a>
              <p className="text-sm text-gray-400">
                ⚡ Limited spots available for employed founders
              </p>
            </div>
          </div>
        </div>
      </div>
      </main>
    </ResourcePageWrapper>
  );
}
