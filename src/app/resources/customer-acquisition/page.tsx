import Link from "next/link";
import ResourcePageWrapper from "@/components/ResourcePageWrapper";

export default function CustomerAcquisitionPage() {
  return (
    <ResourcePageWrapper
      resourceTitle="Customer Acquisition Playbook: Find Your First Customers"
      delay={20}
      className="bg-dark-bg py-20 px-6"
    >
      <main>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">
            🎯 The Ultimate Customer Acquisition Playbook
          </h1>
          <div className="inline-block bg-spotify-green text-black px-4 py-2 rounded-full text-sm font-semibold mb-4">
            A LaunchKit Master Guide
          </div>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Stop struggling to find customers. Learn the proven customer acquisition strategies used by billion-dollar companies like Airbnb, Dropbox, and Tesla. This comprehensive guide combines expert insights from leading entrepreneurship books with real-world case studies and the anonymous founder conversation that reveals the truth about customer acquisition.
          </p>
        </div>

        {/* Inspirational Quote Section */}
        <div className="bg-gradient-to-r from-spotify-green/20 to-blue-500/20 p-8 rounded-lg border border-gray-700 mb-12">
          <blockquote className="text-center">
            <p className="text-2xl text-white italic mb-4">
              "The best time to start a business was yesterday. The second best time is now."
            </p>
            <cite className="text-spotify-green text-lg">— Adapted from Chinese Proverb</cite>
          </blockquote>
        </div>

        {/* The Anonymous Founder Reality Check */}
        <div className="bg-red-900/20 border border-red-500/30 p-8 rounded-lg mb-12">
          <h2 className="text-2xl font-semibold text-white mb-6 text-center">💬 The Anonymous Founder Reality Check</h2>
          <div className="bg-dark-card p-6 rounded-lg border border-gray-700">
            <blockquote className="text-gray-300 italic mb-4">
              "So how do you find your customers? It just looks like everybody is doing the same thing and the people actually succeeding have connections to people with urgencies + capital."
            </blockquote>
            <blockquote className="text-gray-300 italic mb-4">
              "Without those connections then you have to focus on local and basically just try to meet as many people as possible until you find somebody with a need. You then have to develop a relationship and basically appear like an expert waiting in the wing until they have nobody else to turn to."
            </blockquote>
            <blockquote className="text-gray-300 italic mb-4">
              "Am I understanding the game correctly? It's funny when you realize the actual hard part isn't even building the tech."
            </blockquote>
            <div className="bg-spotify-green/10 border border-spotify-green/30 p-4 rounded-lg mt-4">
              <p className="text-white font-semibold">
                💡 <strong>The Expert Response:</strong> "Try to frame it more as you being a teacher. There's a lot of value you can add by simply guiding people past some problems for free, and charging for others. You're here to add value and during that process you can capture some of it by way of sales."
              </p>
            </div>
          </div>
        </div>

        {/* Section 1: The Psychology of Customer Acquisition */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">1. The Psychology of Customer Acquisition</h2>

          <div className="bg-dark-card p-8 rounded-lg border border-gray-700 mb-8">
            <h3 className="text-2xl font-semibold text-white mb-6">From "Influence: The Psychology of Persuasion" by Robert Cialdini</h3>
            <p className="text-gray-300 mb-6">
              Customer acquisition isn't just about marketing—it's about understanding human psychology and building genuine relationships. The most successful companies focus on adding value first, then capturing value through sales.
            </p>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-xl font-semibold text-spotify-green mb-4">Real Example: HubSpot's Content Strategy</h4>
                <p className="text-gray-300 mb-4">
                  HubSpot built a billion-dollar company by giving away valuable content and tools for free. They became the go-to resource for marketing knowledge, then monetized through their software platform.
                </p>
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <p className="text-gray-300 text-sm">
                    <strong className="text-white">Strategy:</strong> "Give away your best content for free. When people see the value you provide, they'll want to pay for your premium services."
                  </p>
                </div>
              </div>
              <div>
                <h4 className="text-xl font-semibold text-spotify-green mb-4">Real Example: Tesla's Education Approach</h4>
                <p className="text-gray-300 mb-4">
                  Elon Musk regularly shares Tesla's patents and technology with competitors. This "open source" approach positions Tesla as the leader in electric vehicles and creates more demand for their products.
                </p>
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <p className="text-gray-300 text-sm">
                    <strong className="text-white">Lesson:</strong> "When you're the teacher, you become the authority. Authority drives sales."
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-dark-card p-6 rounded-lg border border-gray-700">
              <h4 className="text-lg font-semibold text-white mb-3">🎓 The Teacher Position</h4>
              <p className="text-gray-300 text-sm">Position yourself as the expert who can guide customers past their problems. Teachers get respect and sales.</p>
            </div>
            <div className="bg-dark-card p-6 rounded-lg border border-gray-700">
              <h4 className="text-lg font-semibold text-white mb-3">💝 Value First, Sales Second</h4>
              <p className="text-gray-300 text-sm">Give away valuable insights and tools for free. Build trust before asking for money.</p>
            </div>
            <div className="bg-dark-card p-6 rounded-lg border border-gray-700">
              <h4 className="text-lg font-semibold text-white mb-3">🤝 Relationship Building</h4>
              <p className="text-gray-300 text-sm">Focus on understanding customer pain points and being the solution when they're ready to buy.</p>
            </div>
          </div>
        </section>

        {/* Section 2: The Local-First Strategy */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">2. The Local-First Strategy: Build Relationships, Then Scale</h2>

          <div className="bg-dark-card p-8 rounded-lg border border-gray-700 mb-8">
            <h3 className="text-2xl font-semibold text-white mb-6">From "The Lean Startup" by Eric Ries</h3>
            <p className="text-gray-300 mb-6">
              Start local, build deep relationships, then scale. This approach allows you to understand your customers intimately before expanding to broader markets.
            </p>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-xl font-semibold text-spotify-green mb-4">Real Example: Airbnb's Local Launch</h4>
                <p className="text-gray-300 mb-4">
                  Airbnb started by manually helping hosts in San Francisco. The founders personally visited properties, took photos, and provided customer service. This local approach helped them understand exactly what customers needed.
                </p>
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <p className="text-gray-300 text-sm">
                    <strong className="text-white">Strategy:</strong> "Do things that don't scale. Manual processes help you understand customers better than any algorithm."
                  </p>
                </div>
              </div>
              <div>
                <h4 className="text-xl font-semibold text-spotify-green mb-4">Real Example: Salesforce's City-by-City Approach</h4>
                <p className="text-gray-300 mb-4">
                  Salesforce didn't launch globally. They focused on San Francisco first, then expanded city by city. Each city became a reference customer for the next city, creating a domino effect of growth.
                </p>
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <p className="text-gray-300 text-sm">
                    <strong className="text-white">Lesson:</strong> "Dominate one market completely before expanding to the next."
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-spotify-green/10 border border-spotify-green/30 p-6 rounded-lg">
            <h4 className="text-xl font-semibold text-white mb-4">Your Local-First Action Plan</h4>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h5 className="text-white font-semibold mb-3">Week 1-2: Local Market Research</h5>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• Identify 50 potential customers in your city</li>
                  <li>• Attend local industry meetups and events</li>
                  <li>• Join local business groups and chambers of commerce</li>
                  <li>• Research local competitors and their pricing</li>
                </ul>
              </div>
              <div>
                <h5 className="text-white font-semibold mb-3">Week 3-4: Relationship Building</h5>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• Schedule coffee meetings with potential customers</li>
                  <li>• Offer free consultations or demos</li>
                  <li>• Ask for feedback on your product/service</li>
                  <li>• Build a local reference customer base</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Strategic CTA 1 */}
          <div className="mt-8 bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/30 p-6 rounded-lg">
            <h4 className="text-xl font-semibold text-white mb-3">🏙️ Stop Trying to Go Viral - Go Local</h4>
            <p className="text-gray-300 mb-4">
              <strong>Founder Reality Check:</strong> You're probably trying to reach millions of people instead of serving 100 customers really well. Local customers become your best sales team and reference customers.
            </p>
            <p className="text-gray-300 mb-4">
              <strong>The Pain:</strong> Global marketing without local validation leads to expensive failures. You'll spend thousands on ads that reach the wrong people while your local competitors dominate.
            </p>
            <div className="text-center">
              <a href="/contact" className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                Dominate Your Local Market First
              </a>
            </div>
          </div>
        </section>

        {/* Section 3: Famous Customer Acquisition Strategies */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">3. Famous Customer Acquisition Strategies That Built Empires</h2>

          <div className="space-y-8">
            <div className="bg-dark-card p-8 rounded-lg border border-gray-700">
              <h3 className="text-2xl font-semibold text-white mb-6">The Dropbox "Referral Program" Strategy</h3>
              <p className="text-gray-300 mb-4">
                Dropbox grew from 100,000 to 4 million users in 15 months using a simple referral program. Users got 500MB of free storage for each friend they referred.
              </p>
              <div className="bg-gray-800/50 p-4 rounded-lg">
                <p className="text-gray-300 text-sm">
                  <strong className="text-white">Strategy:</strong> "Make your customers your marketing team. Give them incentives to share your product with their network."
                </p>
              </div>
              <div className="bg-gray-800/50 p-4 rounded-lg mt-4">
                <p className="text-gray-300 text-sm">
                  <strong className="text-white">Result:</strong> 60% of new users came from referrals, creating viral growth without advertising spend.
                </p>
              </div>
            </div>

            <div className="bg-dark-card p-8 rounded-lg border border-gray-700">
              <h3 className="text-2xl font-semibold text-white mb-6">The Tesla "Elon Musk" Strategy</h3>
              <p className="text-gray-300 mb-4">
                Tesla doesn't spend money on traditional advertising. Instead, Elon Musk uses his personal brand and social media presence to generate massive free publicity and customer acquisition.
              </p>
              <div className="bg-gray-800/50 p-4 rounded-lg">
                <p className="text-gray-300 text-sm">
                  <strong className="text-white">Strategy:</strong> "Build a personal brand that aligns with your company mission. Your personality becomes your marketing."
                </p>
              </div>
              <div className="bg-gray-800/50 p-4 rounded-lg mt-4">
                <p className="text-gray-300 text-sm">
                  <strong className="text-white">Result:</strong> $800+ billion company with virtually zero advertising spend.
                </p>
              </div>
            </div>

            <div className="bg-dark-card p-8 rounded-lg border border-gray-700">
              <h3 className="text-2xl font-semibold text-white mb-6">The Slack "Product-Led Growth" Strategy</h3>
              <p className="text-gray-300 mb-4">
                Slack grew from 0 to $1 billion valuation in 3 years by making their product so good that users naturally invited their teams. The product itself was the customer acquisition channel.
              </p>
              <div className="bg-gray-800/50 p-4 rounded-lg">
                <p className="text-gray-300 text-sm">
                  <strong className="text-white">Strategy:</strong> "Build a product that's so valuable, users become your sales team. Make sharing easier than not sharing."
                </p>
              </div>
              <div className="bg-gray-800/50 p-4 rounded-lg mt-4">
                <p className="text-gray-300 text-sm">
                  <strong className="text-white">Result:</strong> Fastest-growing B2B SaaS company in history, reaching $1B ARR in record time.
                </p>
              </div>
            </div>

            <div className="bg-dark-card p-8 rounded-lg border border-gray-700">
              <h3 className="text-2xl font-semibold text-white mb-6">The Dollar Shave Club "Viral Video" Strategy</h3>
              <p className="text-gray-300 mb-4">
                Dollar Shave Club spent $4,500 on a single viral video that generated 12,000 customers in 48 hours. The video was funny, memorable, and clearly explained their value proposition.
              </p>
              <div className="bg-gray-800/50 p-4 rounded-lg">
                <p className="text-gray-300 text-sm">
                  <strong className="text-white">Strategy:</strong> "Create content that people want to share. Entertainment value + clear value proposition = viral customer acquisition."
                </p>
              </div>
              <div className="bg-gray-800/50 p-4 rounded-lg mt-4">
                <p className="text-gray-300 text-sm">
                  <strong className="text-white">Result:</strong> Sold to Unilever for $1 billion, proving the power of creative customer acquisition.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: The 10X Rule for Customer Acquisition */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">4. The 10X Rule: Think Bigger Than You Think Possible</h2>

          <div className="bg-dark-card p-8 rounded-lg border border-gray-700 mb-8">
            <h3 className="text-2xl font-semibold text-white mb-6">From "The 10X Rule" by Grant Cardone</h3>
            <p className="text-gray-300 mb-6">
              Most founders set customer acquisition goals that are too small. The 10X Rule says you should set targets that are 10 times what you think you want, and then take 10 times the action you think is necessary.
            </p>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-xl font-semibold text-spotify-green mb-4">Real Example: Amazon's Customer Obsession</h4>
                <p className="text-gray-300 mb-4">
                  Jeff Bezos didn't aim to serve thousands of customers. He aimed to serve every customer on Earth. This 10X vision drove Amazon's expansion into every imaginable category and geography.
                </p>
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <p className="text-gray-300 text-sm">
                    <strong className="text-white">Quote:</strong> "We see our customers as invited guests to a party, and we are the hosts. It's our job every day to make every important aspect of the customer experience a little bit better."
                  </p>
                </div>
              </div>
              <div>
                <h4 className="text-xl font-semibold text-spotify-green mb-4">Real Example: Apple's Global Domination</h4>
                <p className="text-gray-300 mb-4">
                  Steve Jobs didn't just want to sell computers. He wanted to change the world through technology. This 10X vision drove Apple's expansion into music, phones, tablets, and beyond.
                </p>
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <p className="text-gray-300 text-sm">
                    <strong className="text-white">Lesson:</strong> "Think different. Think bigger. Think impossible, then make it possible."
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-spotify-green/10 border border-spotify-green/30 p-6 rounded-lg">
            <h4 className="text-xl font-semibold text-white mb-4">Applying the 10X Rule to Customer Acquisition</h4>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h5 className="text-white font-semibold mb-3">Instead of thinking:</h5>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• "I want 100 customers this year"</li>
                  <li>• "I want to reach my local market"</li>
                  <li>• "I want to make $50K revenue"</li>
                </ul>
              </div>
              <div>
                <h5 className="text-white font-semibold mb-3">Think 10X bigger:</h5>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• "I want 1,000 customers this year"</li>
                  <li>• "I want to dominate my industry globally"</li>
                  <li>• "I want to make $500K revenue"</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Strategic CTA 2 */}
          <div className="mt-8 bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border border-yellow-500/30 p-6 rounded-lg">
            <h4 className="text-xl font-semibold text-white mb-3">🎯 Are You Thinking Too Small?</h4>
            <p className="text-gray-300 mb-4">
              <strong>Founder Reality Check:</strong> You're probably setting customer acquisition goals that are 10X too small. Small goals attract small customers, small investors, and small results.
            </p>
            <p className="text-gray-300 mb-4">
              <strong>The Pain:</strong> While you're trying to get 100 customers, your competitor is building systems to get 10,000. They'll dominate your market while you're still thinking small.
            </p>
            <div className="text-center">
              <a href="/contact" className="inline-block bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                Set 10X Bigger Customer Goals
              </a>
            </div>
          </div>
        </section>

        {/* Section 5: The Blue Ocean Strategy for Customer Acquisition */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">5. The Blue Ocean Strategy: Create Uncontested Markets</h2>

          <div className="bg-dark-card p-8 rounded-lg border border-gray-700 mb-8">
            <h3 className="text-2xl font-semibold text-white mb-6">From "Blue Ocean Strategy" by W. Chan Kim & Renée Mauborgne</h3>
            <p className="text-gray-300 mb-6">
              Instead of competing for customers in crowded markets (red oceans), create new markets where competition is irrelevant. This strategy has launched some of the most successful companies in history.
            </p>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-xl font-semibold text-spotify-green mb-4">Real Example: Cirque du Soleil</h4>
                <p className="text-gray-300 mb-4">
                  Instead of competing with traditional circuses, Cirque du Soleil eliminated animals and added theatrical elements, creating a new entertainment category that appealed to adults willing to pay premium prices.
                </p>
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <p className="text-gray-300 text-sm">
                    <strong className="text-white">Strategy:</strong> Eliminate (animals), Reduce (clown acts), Raise (ticket prices), Create (theatrical experience)
                  </p>
                </div>
              </div>
              <div>
                <h4 className="text-xl font-semibold text-spotify-green mb-4">Real Example: Southwest Airlines</h4>
                <p className="text-gray-300 mb-4">
                  Southwest eliminated first-class seating, meals, and assigned seats while creating a fun, friendly atmosphere. They created a new category: "the fun airline" that competed with driving, not other airlines.
                </p>
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <p className="text-gray-300 text-sm">
                    <strong className="text-white">Result:</strong> Most profitable airline in history for 47 consecutive years
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-spotify-green/10 border border-spotify-green/30 p-6 rounded-lg">
            <h4 className="text-xl font-semibold text-white mb-4">Your Blue Ocean Customer Acquisition Framework</h4>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h5 className="text-white font-semibold mb-3">What to Eliminate:</h5>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• Traditional marketing channels that don't work</li>
                  <li>• Features customers don't value</li>
                  <li>• Processes that slow customer acquisition</li>
                </ul>
              </div>
              <div>
                <h5 className="text-white font-semibold mb-3">What to Create:</h5>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• New customer acquisition channels</li>
                  <li>• Unique customer experiences</li>
                  <li>• Innovative referral systems</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Section 6: Entrepreneur Quotes on Customer Acquisition */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">6. Wisdom from Famous Entrepreneurs on Customer Acquisition</h2>

          <div className="space-y-6">
            <div className="bg-gradient-to-r from-spotify-green/20 to-blue-500/20 p-6 rounded-lg border border-gray-700">
              <blockquote className="text-center">
                <p className="text-xl text-white italic mb-3">
                  "Your most unhappy customers are your greatest source of learning."
                </p>
                <cite className="text-spotify-green">— Bill Gates, Microsoft Co-founder</cite>
              </blockquote>
            </div>

            <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 p-6 rounded-lg border border-gray-700">
              <blockquote className="text-center">
                <p className="text-xl text-white italic mb-3">
                  "The goal of a startup is to figure out the right thing to build—the thing customers want and will pay for—as quickly as possible."
                </p>
                <cite className="text-blue-400">— Eric Ries, The Lean Startup</cite>
              </blockquote>
            </div>

            <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 p-6 rounded-lg border border-gray-700">
              <blockquote className="text-center">
                <p className="text-xl text-white italic mb-3">
                  "The best entrepreneurs know this: every great business is built around a secret that's hidden from the outside. A great company is a conspiracy to change the world."
                </p>
                <cite className="text-purple-400">— Peter Thiel, PayPal Co-founder</cite>
              </blockquote>
            </div>

            <div className="bg-gradient-to-r from-pink-500/20 to-red-500/20 p-6 rounded-lg border border-gray-700">
              <blockquote className="text-center">
                <p className="text-xl text-white italic mb-3">
                  "If you're not embarrassed by the first version of your product, you've launched too late."
                </p>
                <cite className="text-pink-400">— Reid Hoffman, LinkedIn Co-founder</cite>
              </blockquote>
            </div>
          </div>
        </section>

        {/* Section 7: Practical Customer Acquisition Techniques */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">7. Practical Customer Acquisition Techniques That Work</h2>

          <div className="space-y-6">
            <div className="bg-dark-card p-6 rounded-lg border border-gray-700">
              <h3 className="text-xl font-semibold text-white mb-4">Content Marketing & Education</h3>
              <p className="text-gray-300 mb-3">
                Create valuable content that educates your target audience. Blog posts, videos, podcasts, and webinars position you as the expert and attract customers naturally.
              </p>
              <div className="bg-gray-800/50 p-4 rounded-lg">
                <p className="text-gray-300 text-sm">
                  <strong className="text-white">Tools:</strong> WordPress for blogs, YouTube for videos, Zoom for webinars. Focus on solving real problems your customers face.
                </p>
              </div>
              <div className="bg-gray-800/50 p-4 rounded-lg mt-3">
                <p className="text-gray-300 text-sm">
                  <strong className="text-white">Real Example:</strong> HubSpot's blog generates millions of visitors and thousands of customers through free marketing education.
                </p>
              </div>
            </div>

            <div className="bg-dark-card p-6 rounded-lg border border-gray-700">
              <h3 className="text-xl font-semibold text-white mb-4">Referral Programs</h3>
              <p className="text-gray-300 mb-3">
                Turn your existing customers into your sales team. Offer incentives for referrals and make it easy for customers to share your product.
              </p>
              <div className="bg-gray-800/50 p-4 rounded-lg">
                <p className="text-gray-300 text-sm">
                  <strong className="text-white">Strategy:</strong> Give both the referrer and referee something valuable. Make sharing easier than not sharing.
                </p>
              </div>
              <div className="bg-gray-800/50 p-4 rounded-lg mt-3">
                <p className="text-gray-300 text-sm">
                  <strong className="text-white">Real Example:</strong> Dropbox's referral program grew them from 100K to 4M users in 15 months.
                </p>
              </div>
            </div>

            <div className="bg-dark-card p-6 rounded-lg border border-gray-700">
              <h3 className="text-xl font-semibold text-white mb-4">Partnership & Collaboration</h3>
              <p className="text-gray-300 mb-3">
                Partner with companies that serve the same customers but aren't competitors. Cross-promote each other's products and share customer bases.
              </p>
              <div className="bg-gray-800/50 p-4 rounded-lg">
                <p className="text-gray-300 text-sm">
                  <strong className="text-white">Partnership Types:</strong> Affiliate programs, co-marketing campaigns, integration partnerships, joint webinars.
                </p>
              </div>
              <div className="bg-gray-800/50 p-4 rounded-lg mt-3">
                <p className="text-gray-300 text-sm">
                  <strong className="text-white">Real Example:</strong> Shopify's app store partnerships have driven massive growth for both Shopify and their partner companies.
                </p>
              </div>
            </div>
          </div>

          {/* Strategic CTA 3 */}
          <div className="mt-8 bg-gradient-to-r from-green-900/20 to-teal-900/20 border border-green-500/30 p-6 rounded-lg">
            <h4 className="text-xl font-semibold text-white mb-3">🚀 Stop Guessing - Start Testing</h4>
            <p className="text-gray-300 mb-4">
              <strong>Founder Reality Check:</strong> You're probably trying one customer acquisition method and giving up when it doesn't work immediately. The best companies test dozens of channels and double down on what works.
            </p>
            <p className="text-gray-300 mb-4">
              <strong>The Pain:</strong> While you're stuck on one failing channel, your competitor is testing 10 different approaches and finding the one that works. They'll capture your market while you're still guessing.
            </p>
            <div className="text-center">
              <a href="/contact" className="inline-block bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                Test Multiple Customer Acquisition Channels
              </a>
            </div>
          </div>
        </section>

        {/* Section 8: The 90-Day Customer Acquisition Sprint */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">8. Your 90-Day Customer Acquisition Sprint</h2>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-dark-card p-6 rounded-lg border border-gray-700">
              <h4 className="text-xl font-semibold text-white mb-4">Month 1: Foundation & Research</h4>
              <ul className="text-gray-300 text-sm space-y-2">
                <li>• Week 1: Define your ideal customer profile</li>
                <li>• Week 2: Research where your customers hang out</li>
                <li>• Week 3: Create valuable content for your audience</li>
                <li>• Week 4: Set up tracking and analytics</li>
              </ul>
            </div>
            <div className="bg-dark-card p-6 rounded-lg border border-gray-700">
              <h4 className="text-xl font-semibold text-white mb-4">Month 2: Testing & Validation</h4>
              <ul className="text-gray-300 text-sm space-y-2">
                <li>• Week 1-2: Test 3-5 customer acquisition channels</li>
                <li>• Week 3: Analyze results and identify winners</li>
                <li>• Week 4: Optimize your best-performing channel</li>
              </ul>
            </div>
            <div className="bg-dark-card p-6 rounded-lg border border-gray-700">
              <h4 className="text-xl font-semibold text-white mb-4">Month 3: Scale & Optimize</h4>
              <ul className="text-gray-300 text-sm space-y-2">
                <li>• Week 1: Double down on winning channels</li>
                <li>• Week 2: Launch referral program</li>
                <li>• Week 3: Build partnerships and collaborations</li>
                <li>• Week 4: Plan your next 90 days</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section 9: Essential Reading List */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">9. Essential Reading for Customer Acquisition</h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-dark-card p-6 rounded-lg border border-gray-700">
              <h4 className="text-spotify-green font-semibold mb-3">Customer Acquisition Books</h4>
              <ul className="text-gray-300 space-y-2">
                <li>• "Traction" by Gabriel Weinberg</li>
                <li>• "Influence" by Robert Cialdini</li>
                <li>• "The Lean Startup" by Eric Ries</li>
                <li>• "Crossing the Chasm" by Geoffrey Moore</li>
                <li>• "The Mom Test" by Rob Fitzpatrick</li>
              </ul>
            </div>
            <div className="bg-dark-card p-6 rounded-lg border border-gray-700">
              <h4 className="text-spotify-green font-semibold mb-3">Marketing & Growth</h4>
              <ul className="text-gray-300 space-y-2">
                <li>• "This Is Marketing" by Seth Godin</li>
                <li>• "Contagious" by Jonah Berger</li>
                <li>• "Hooked" by Nir Eyal</li>
                <li>• "The 10X Rule" by Grant Cardone</li>
                <li>• "Blue Ocean Strategy" by W. Chan Kim</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Final Takeaway */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">🔑 Final Takeaway</h2>
          <div className="bg-spotify-green/10 border border-spotify-green/30 p-6 rounded-lg">
            <p className="text-white font-semibold mb-4">Successful customer acquisition requires:</p>
            <ul className="text-gray-300 space-y-2">
              <li>• <strong className="text-white">Position yourself as the teacher</strong> who can guide customers past their problems</li>
              <li>• <strong className="text-white">Start local and build deep relationships</strong> before scaling globally</li>
              <li>• <strong className="text-white">Give value first, ask for sales second</strong> - build trust before asking for money</li>
              <li>• <strong className="text-white">Test multiple channels</strong> and double down on what works</li>
              <li>• <strong className="text-white">Think 10X bigger</strong> than you think possible</li>
            </ul>
            <p className="text-gray-300 mt-4">
              Remember: Customer acquisition isn't about finding people to sell to. It's about finding people with problems you can solve and becoming the expert they turn to when they're ready to buy.
            </p>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center bg-gradient-to-r from-red-900/20 to-orange-900/20 border border-red-500/30 p-8 rounded-lg">
          <h2 className="text-3xl font-bold text-white mb-6">🚨 Stop Struggling to Find Customers</h2>
          <p className="text-xl text-gray-300 mb-6">
            <strong>Founder Reality Check:</strong> 42% of startups fail because they can't find customers. You're either building a customer acquisition system or gambling with your business.
          </p>
          <div className="bg-dark-card p-6 rounded-lg border border-gray-700 mb-6">
            <h3 className="text-xl font-semibold text-white mb-4">What Poor Customer Acquisition Costs You:</h3>
            <div className="grid md:grid-cols-3 gap-4 text-gray-300">
              <div>
                <p className="text-red-400 font-semibold">💰 Lost Revenue</p>
                <p className="text-sm">$0 in sales = $0 in business</p>
              </div>
              <div>
                <p className="text-red-400 font-semibold">⏰ Wasted Time</p>
                <p className="text-sm">Months of building, no customers</p>
              </div>
              <div>
                <p className="text-red-400 font-semibold">💔 Broken Dreams</p>
                <p className="text-sm">Back to your day job</p>
              </div>
            </div>
          </div>
          <p className="text-lg text-gray-300 mb-6">
            <strong>LaunchKit helps founders build customer acquisition systems that generate consistent revenue.</strong> Don't let poor customer acquisition kill your startup dreams.
          </p>
          <div className="space-y-4">
            <a href="/contact" className="inline-block bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-lg font-bold text-xl transition-colors">
              🎯 Build Your Customer Acquisition System
            </a>
          </div>
        </section>

        {/* Back to Resources */}
        <div className="text-center mt-8">
          <Link href="/resources" className="text-spotify-green hover:text-green-400 font-medium">
            ← Back to All Resources
          </Link>
        </div>
      </div>
      </main>
    </ResourcePageWrapper>
  );
}
