import Link from "next/link";
import ResourcePageWrapper from "@/components/ResourcePageWrapper";

export default function BusinessModelRoadmapPage() {
  return (
    <ResourcePageWrapper
      resourceTitle="Business Model Roadmap: From Idea to Profit"
      delay={20}
      className="bg-dark-bg py-20 px-6"
    >
      <main>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">
            🗺️ The Business Model Roadmap: From Idea to Empire
          </h1>
          <div className="inline-block bg-spotify-green text-black px-4 py-2 rounded-full text-sm font-semibold mb-4">
            A LaunchKit Master Guide
          </div>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Stop building products without a clear path to profit. Learn the proven business model frameworks used by billion-dollar companies like Amazon, Tesla, and Apple. This comprehensive guide combines expert insights from leading entrepreneurship books with real-world case studies and actionable roadmaps.
          </p>
        </div>

        {/* Inspirational Quote Section */}
        <div className="bg-gradient-to-r from-spotify-green/20 to-blue-500/20 p-8 rounded-lg border border-gray-700 mb-12">
          <blockquote className="text-center">
            <p className="text-2xl text-white italic mb-4">
              "A business model is a story about how an organization creates, delivers, and captures value."
            </p>
            <cite className="text-spotify-green text-lg">— Alexander Osterwalder, Business Model Generation</cite>
          </blockquote>
        </div>

        {/* The Founder Reality Check */}
        <div className="bg-red-900/20 border border-red-500/30 p-8 rounded-lg mb-12">
          <h2 className="text-2xl font-semibold text-white mb-6 text-center">💬 The Anonymous Founder Reality Check</h2>
          <div className="bg-dark-card p-6 rounded-lg border border-gray-700">
            <blockquote className="text-gray-300 italic mb-4">
              "I've been building this product for 6 months and I still don't know how I'm going to make money. I'm just hoping that if I build it, customers will come and pay for it somehow."
            </blockquote>
            <blockquote className="text-gray-300 italic mb-4">
              "My cofounder and I keep arguing about pricing. Should we charge monthly? One-time? Freemium? We're paralyzed by all the options and just want to launch something."
            </blockquote>
            <blockquote className="text-gray-300 italic mb-4">
              "I see all these successful companies with different business models and I don't know which one to copy. What worked for them might not work for me, right?"
            </blockquote>
            <div className="bg-spotify-green/10 border border-spotify-green/30 p-4 rounded-lg mt-4">
              <p className="text-white font-semibold">
                💡 <strong>The Expert Response:</strong> "Every successful business has a clear business model from day one. You need to know exactly how you'll make money before you build anything. This roadmap will show you how to choose, test, and optimize your business model systematically."
              </p>
            </div>
          </div>
        </div>

        {/* Section 1: The Psychology of Business Models */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">1. The Psychology of Business Models</h2>

          <div className="bg-dark-card p-8 rounded-lg border border-gray-700 mb-8">
            <h3 className="text-2xl font-semibold text-white mb-6">From "Business Model Generation" by Alexander Osterwalder</h3>
            <p className="text-gray-300 mb-6">
              A business model isn't just about making money—it's about creating, delivering, and capturing value in a sustainable way. The most successful companies understand that their business model is their competitive advantage.
            </p>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-xl font-semibold text-spotify-green mb-4">Real Example: Amazon's Evolving Model</h4>
                <p className="text-gray-300 mb-4">
                  Amazon started as an online bookstore but evolved into a platform business. They now make money from retail sales, AWS cloud services, Prime subscriptions, and marketplace fees—multiple revenue streams from one ecosystem.
                </p>
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <p className="text-gray-300 text-sm">
                    <strong className="text-white">Strategy:</strong> "Start with one business model, then expand into complementary models that serve the same customers."
                  </p>
                </div>
              </div>
              <div>
                <h4 className="text-xl font-semibold text-spotify-green mb-4">Real Example: Tesla's Innovation Model</h4>
                <p className="text-gray-300 mb-4">
                  Tesla doesn't just sell cars—they sell energy storage, solar panels, software updates, and even insurance. Their business model creates multiple touchpoints with customers throughout their journey.
                </p>
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <p className="text-gray-300 text-sm">
                    <strong className="text-white">Lesson:</strong> "Think beyond your initial product. How can you serve customers throughout their entire lifecycle?"
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-dark-card p-6 rounded-lg border border-gray-700">
              <h4 className="text-lg font-semibold text-white mb-3">🎯 Value Creation</h4>
              <p className="text-gray-300 text-sm">What unique value do you provide that customers can't get elsewhere? This is your competitive moat.</p>
            </div>
            <div className="bg-dark-card p-6 rounded-lg border border-gray-700">
              <h4 className="text-lg font-semibold text-white mb-3">🚚 Value Delivery</h4>
              <p className="text-gray-300 text-sm">How do you get your product to customers? The delivery mechanism is often as important as the product itself.</p>
            </div>
            <div className="bg-dark-card p-6 rounded-lg border border-gray-700">
              <h4 className="text-lg font-semibold text-white mb-3">💰 Value Capture</h4>
              <p className="text-gray-300 text-sm">How do you extract money from the value you create? This is where most founders struggle.</p>
            </div>
          </div>
        </section>

        {/* Section 2: The 9 Building Blocks of Business Models */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">2. The 9 Building Blocks of Business Models</h2>

          <div className="bg-dark-card p-8 rounded-lg border border-gray-700 mb-8">
            <h3 className="text-2xl font-semibold text-white mb-6">From "Business Model Generation" by Alexander Osterwalder</h3>
            <p className="text-gray-300 mb-6">
              Every business model can be broken down into 9 building blocks. Understanding these blocks helps you design, test, and optimize your business model systematically.
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-4">
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <h4 className="text-lg font-semibold text-spotify-green mb-2">1. Value Propositions</h4>
                  <p className="text-gray-300 text-sm">What unique value do you offer? What problems do you solve?</p>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <h4 className="text-lg font-semibold text-spotify-green mb-2">2. Customer Segments</h4>
                  <p className="text-gray-300 text-sm">Who are your target customers? What are their needs?</p>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <h4 className="text-lg font-semibold text-spotify-green mb-2">3. Channels</h4>
                  <p className="text-gray-300 text-sm">How do you reach and serve your customers?</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <h4 className="text-lg font-semibold text-spotify-green mb-2">4. Customer Relationships</h4>
                  <p className="text-gray-300 text-sm">What type of relationship do you want with customers?</p>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <h4 className="text-lg font-semibold text-spotify-green mb-2">5. Revenue Streams</h4>
                  <p className="text-gray-300 text-sm">How does your business make money?</p>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <h4 className="text-lg font-semibold text-spotify-green mb-2">6. Key Resources</h4>
                  <p className="text-gray-300 text-sm">What assets are essential to your business?</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <h4 className="text-lg font-semibold text-spotify-green mb-2">7. Key Activities</h4>
                  <p className="text-gray-300 text-sm">What activities are crucial to your business?</p>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <h4 className="text-lg font-semibold text-spotify-green mb-2">8. Key Partnerships</h4>
                  <p className="text-gray-300 text-sm">Who are your key suppliers and partners?</p>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <h4 className="text-lg font-semibold text-spotify-green mb-2">9. Cost Structure</h4>
                  <p className="text-gray-300 text-sm">What are your major cost drivers?</p>
                </div>
              </div>
            </div>
          </div>

          {/* Strategic CTA 1 */}
          <div className="mt-8 bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/30 p-6 rounded-lg">
            <h4 className="text-xl font-semibold text-white mb-3">🎯 Stop Building Without a Business Model</h4>
            <p className="text-gray-300 mb-4">
              <strong>Founder Reality Check:</strong> You're probably building features without knowing how they'll make money. Every feature should directly support your business model, or it's just expensive decoration.
            </p>
            <p className="text-gray-300 mb-4">
              <strong>The Pain:</strong> Building without a clear business model is like driving without a destination. You'll waste months building the wrong things while your competitors capture the market.
            </p>
            <div className="text-center">
              <a href="/contact" className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                Design Your Business Model First
              </a>
            </div>
          </div>
        </section>

        {/* Section 3: Famous Business Model Strategies */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">3. Famous Business Model Strategies That Built Empires</h2>

          <div className="space-y-8">
            <div className="bg-dark-card p-8 rounded-lg border border-gray-700">
              <h3 className="text-2xl font-semibold text-white mb-6">The Apple "Ecosystem" Strategy</h3>
              <p className="text-gray-300 mb-4">
                Apple doesn't just sell products—they sell an ecosystem. iPhone users buy AirPods, Apple Watch, MacBooks, and subscribe to Apple Music, iCloud, and App Store services. Each product makes the others more valuable.
              </p>
              <div className="bg-gray-800/50 p-4 rounded-lg">
                <p className="text-gray-300 text-sm">
                  <strong className="text-white">Strategy:</strong> "Create products that work better together than apart. Lock customers into your ecosystem through superior integration."
                </p>
              </div>
              <div className="bg-gray-800/50 p-4 rounded-lg mt-4">
                <p className="text-gray-300 text-sm">
                  <strong className="text-white">Result:</strong> $3+ trillion company with the highest customer loyalty in tech.
                </p>
              </div>
            </div>

            <div className="bg-dark-card p-8 rounded-lg border border-gray-700">
              <h3 className="text-2xl font-semibold text-white mb-6">The Netflix "Subscription" Strategy</h3>
              <p className="text-gray-300 mb-4">
                Netflix transformed from a DVD rental service to a streaming platform by changing their business model. Instead of charging per rental, they charge a monthly subscription for unlimited access to content.
              </p>
              <div className="bg-gray-800/50 p-4 rounded-lg">
                <p className="text-gray-300 text-sm">
                  <strong className="text-white">Strategy:</strong> "Predictable recurring revenue is more valuable than one-time sales. Subscriptions create customer lifetime value."
                </p>
              </div>
              <div className="bg-gray-800/50 p-4 rounded-lg mt-4">
                <p className="text-gray-300 text-sm">
                  <strong className="text-white">Result:</strong> $200+ billion company that disrupted the entire entertainment industry.
                </p>
              </div>
            </div>

            <div className="bg-dark-card p-8 rounded-lg border border-gray-700">
              <h3 className="text-2xl font-semibold text-white mb-6">The Uber "Marketplace" Strategy</h3>
              <p className="text-gray-300 mb-4">
                Uber doesn't own cars or employ drivers—they connect riders with drivers and take a percentage of each transaction. This asset-light model scales globally without massive capital investment.
              </p>
              <div className="bg-gray-800/50 p-4 rounded-lg">
                <p className="text-gray-300 text-sm">
                  <strong className="text-white">Strategy:</strong> "Don't own the assets—own the platform that connects supply and demand. Take a percentage of every transaction."
                </p>
              </div>
              <div className="bg-gray-800/50 p-4 rounded-lg mt-4">
                <p className="text-gray-300 text-sm">
                  <strong className="text-white">Result:</strong> $100+ billion company that disrupted transportation without owning a single vehicle.
                </p>
              </div>
            </div>

            <div className="bg-dark-card p-8 rounded-lg border border-gray-700">
              <h3 className="text-2xl font-semibold text-white mb-6">The Shopify "Platform" Strategy</h3>
              <p className="text-gray-300 mb-4">
                Shopify doesn't just sell e-commerce software—they've built an entire ecosystem of apps, themes, payment processing, and fulfillment services. They make money from subscriptions, transaction fees, and app store commissions.
              </p>
              <div className="bg-gray-800/50 p-4 rounded-lg">
                <p className="text-gray-300 text-sm">
                  <strong className="text-white">Strategy:</strong> "Build a platform that enables others to build on top of you. Take a percentage of their success."
                </p>
              </div>
              <div className="bg-gray-800/50 p-4 rounded-lg mt-4">
                <p className="text-gray-300 text-sm">
                  <strong className="text-white">Result:</strong> $200+ billion company that powers millions of online stores worldwide.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: The Lean Canvas Approach */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">4. The Lean Canvas: Rapid Business Model Design</h2>

          <div className="bg-dark-card p-8 rounded-lg border border-gray-700 mb-8">
            <h3 className="text-2xl font-semibold text-white mb-6">From "Running Lean" by Ash Maurya</h3>
            <p className="text-gray-300 mb-6">
              The Lean Canvas is a one-page business model template designed for startups. It focuses on the most critical elements you need to validate before building anything.
            </p>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-xl font-semibold text-spotify-green mb-4">Real Example: Dropbox's Lean Canvas</h4>
                <p className="text-gray-300 mb-4">
                  Dropbox used the Lean Canvas to validate their business model before building. They identified file sync as the core problem, tech-savvy users as their segment, and freemium as their revenue model.
                </p>
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <p className="text-gray-300 text-sm">
                    <strong className="text-white">Key Insight:</strong> "Focus on the problem first, then the solution. Most startups build solutions looking for problems."
                  </p>
                </div>
              </div>
              <div>
                <h4 className="text-xl font-semibold text-spotify-green mb-4">Real Example: Airbnb's Pivot</h4>
                <p className="text-gray-300 mb-4">
                  Airbnb started as a platform for conference attendees to find accommodation. When that market was too small, they pivoted to vacation rentals using the same core technology but different customer segments.
                </p>
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <p className="text-gray-300 text-sm">
                    <strong className="text-white">Lesson:</strong> "Your business model can pivot while keeping your core technology. Focus on finding product-market fit."
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-spotify-green/10 border border-spotify-green/30 p-6 rounded-lg">
            <h4 className="text-xl font-semibold text-white mb-4">Your Lean Canvas Framework</h4>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h5 className="text-white font-semibold mb-3">Left Side (Problem Focus):</h5>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• Problem (top 3 problems you solve)</li>
                  <li>• Customer Segments (who has these problems)</li>
                  <li>• Unique Value Proposition (why you're different)</li>
                  <li>• Solution (how you solve the problems)</li>
                  <li>• Key Metrics (how you measure success)</li>
                </ul>
              </div>
              <div>
                <h5 className="text-white font-semibold mb-3">Right Side (Solution Focus):</h5>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• Channels (how you reach customers)</li>
                  <li>• Revenue Streams (how you make money)</li>
                  <li>• Cost Structure (what it costs to operate)</li>
                  <li>• Unfair Advantage (what can't be copied)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Strategic CTA 2 */}
          <div className="mt-8 bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border border-yellow-500/30 p-6 rounded-lg">
            <h4 className="text-xl font-semibold text-white mb-3">⚡ Stop Overthinking - Start Validating</h4>
            <p className="text-gray-300 mb-4">
              <strong>Founder Reality Check:</strong> You're probably spending months perfecting your business plan instead of testing your business model with real customers. Perfect plans don't exist—only validated models do.
            </p>
            <p className="text-gray-300 mb-4">
              <strong>The Pain:</strong> While you're perfecting your business model on paper, your competitors are testing theirs with real customers and iterating based on feedback. They'll find product-market fit while you're still planning.
            </p>
            <div className="text-center">
              <a href="/contact" className="inline-block bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                Test Your Business Model Now
              </a>
            </div>
          </div>
        </section>

        {/* Section 5: The Blue Ocean Strategy for Business Models */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">5. The Blue Ocean Strategy: Create Uncontested Markets</h2>

          <div className="bg-dark-card p-8 rounded-lg border border-gray-700 mb-8">
            <h3 className="text-2xl font-semibold text-white mb-6">From "Blue Ocean Strategy" by W. Chan Kim & Renée Mauborgne</h3>
            <p className="text-gray-300 mb-6">
              Instead of competing in crowded markets (red oceans), create new markets where competition is irrelevant. This strategy has launched some of the most successful business models in history.
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
            <h4 className="text-xl font-semibold text-white mb-4">Your Blue Ocean Business Model Framework</h4>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h5 className="text-white font-semibold mb-3">What to Eliminate:</h5>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• Features that customers don't value</li>
                  <li>• Processes that slow down delivery</li>
                  <li>• Costs that don't add value</li>
                  <li>• Complexity that confuses customers</li>
                </ul>
              </div>
              <div>
                <h5 className="text-white font-semibold mb-3">What to Create:</h5>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• New customer experiences</li>
                  <li>• Unique value propositions</li>
                  <li>• Innovative revenue models</li>
                  <li>• Unconventional partnerships</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Section 6: Entrepreneur Quotes on Business Models */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">6. Wisdom from Famous Entrepreneurs on Business Models</h2>

          <div className="space-y-6">
            <div className="bg-gradient-to-r from-spotify-green/20 to-blue-500/20 p-6 rounded-lg border border-gray-700">
              <blockquote className="text-center">
                <p className="text-xl text-white italic mb-3">
                  "The business model is the most important thing. It's more important than the technology, more important than the team, more important than the market."
                </p>
                <cite className="text-spotify-green">— Marc Andreessen, Andreessen Horowitz</cite>
              </blockquote>
            </div>

            <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 p-6 rounded-lg border border-gray-700">
              <blockquote className="text-center">
                <p className="text-xl text-white italic mb-3">
                  "A business model is a story about how an organization creates, delivers, and captures value. But it's not just any story—it's a story that explains how your business works."
                </p>
                <cite className="text-blue-400">— Alexander Osterwalder, Business Model Generation</cite>
              </blockquote>
            </div>

            <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 p-6 rounded-lg border border-gray-700">
              <blockquote className="text-center">
                <p className="text-xl text-white italic mb-3">
                  "The best business models are simple, clear, and easy to understand. If you can't explain your business model in one sentence, it's too complicated."
                </p>
                <cite className="text-purple-400">— Steve Jobs, Apple Co-founder</cite>
              </blockquote>
            </div>

            <div className="bg-gradient-to-r from-pink-500/20 to-red-500/20 p-6 rounded-lg border border-gray-700">
              <blockquote className="text-center">
                <p className="text-xl text-white italic mb-3">
                  "Your business model should be so good that it's obvious to everyone why it works. If you have to explain it, it's not good enough."
                </p>
                <cite className="text-pink-400">— Peter Thiel, PayPal Co-founder</cite>
              </blockquote>
            </div>
          </div>
        </section>

        {/* Section 7: The 10X Rule for Business Models */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">7. The 10X Rule: Think Bigger Than You Think Possible</h2>

          <div className="bg-dark-card p-8 rounded-lg border border-gray-700 mb-8">
            <h3 className="text-2xl font-semibold text-white mb-6">From "The 10X Rule" by Grant Cardone</h3>
            <p className="text-gray-300 mb-6">
              Most founders set business model goals that are too small. The 10X Rule says you should set targets that are 10 times what you think you want, and then take 10 times the action you think is necessary.
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
                <h4 className="text-xl font-semibold text-spotify-green mb-4">Real Example: Tesla's Mission</h4>
                <p className="text-gray-300 mb-4">
                  Elon Musk didn't just want to sell electric cars. He wanted to accelerate the world's transition to sustainable transport. This 10X vision drove Tesla's expansion into energy storage, solar panels, and beyond.
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
            <h4 className="text-xl font-semibold text-white mb-4">Applying the 10X Rule to Business Models</h4>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h5 className="text-white font-semibold mb-3">Instead of thinking:</h5>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• "I want to make $100K revenue"</li>
                  <li>• "I want to serve my local market"</li>
                  <li>• "I want to build one product"</li>
                </ul>
              </div>
              <div>
                <h5 className="text-white font-semibold mb-3">Think 10X bigger:</h5>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• "I want to make $1M revenue"</li>
                  <li>• "I want to dominate my industry globally"</li>
                  <li>• "I want to build an ecosystem of products"</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Strategic CTA 3 */}
          <div className="mt-8 bg-gradient-to-r from-green-900/20 to-teal-900/20 border border-green-500/30 p-6 rounded-lg">
            <h4 className="text-xl font-semibold text-white mb-3">🚀 Are You Thinking Too Small?</h4>
            <p className="text-gray-300 mb-4">
              <strong>Founder Reality Check:</strong> You're probably setting business model goals that are 10X too small. Small goals attract small customers, small investors, and small results.
            </p>
            <p className="text-gray-300 mb-4">
              <strong>The Pain:</strong> While you're trying to make $100K, your competitor is building systems to make $1M. They'll dominate your market while you're still thinking small.
            </p>
            <div className="text-center">
              <a href="/contact" className="inline-block bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                Set 10X Bigger Business Goals
              </a>
            </div>
          </div>
        </section>

        {/* Section 8: The 90-Day Business Model Sprint */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">8. Your 90-Day Business Model Sprint</h2>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-dark-card p-6 rounded-lg border border-gray-700">
              <h4 className="text-xl font-semibold text-white mb-4">Month 1: Design & Research</h4>
              <ul className="text-gray-300 text-sm space-y-2">
                <li>• Week 1: Complete your Lean Canvas</li>
                <li>• Week 2: Research successful business models in your industry</li>
                <li>• Week 3: Interview 20 potential customers</li>
                <li>• Week 4: Refine your value proposition based on feedback</li>
              </ul>
            </div>
            <div className="bg-dark-card p-6 rounded-lg border border-gray-700">
              <h4 className="text-xl font-semibold text-white mb-4">Month 2: Test & Validate</h4>
              <ul className="text-gray-300 text-sm space-y-2">
                <li>• Week 1-2: Build a simple MVP to test your model</li>
                <li>• Week 3: Test different pricing strategies</li>
                <li>• Week 4: Analyze results and identify what works</li>
              </ul>
            </div>
            <div className="bg-dark-card p-6 rounded-lg border border-gray-700">
              <h4 className="text-xl font-semibold text-white mb-4">Month 3: Optimize & Scale</h4>
              <ul className="text-gray-300 text-sm space-y-2">
                <li>• Week 1: Double down on what's working</li>
                <li>• Week 2: Eliminate what's not working</li>
                <li>• Week 3: Plan your next 90 days</li>
                <li>• Week 4: Set up systems for scaling</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section 9: Essential Reading List */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">9. Essential Reading for Business Model Mastery</h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-dark-card p-6 rounded-lg border border-gray-700">
              <h4 className="text-spotify-green font-semibold mb-3">Business Model Books</h4>
              <ul className="text-gray-300 space-y-2">
                <li>• "Business Model Generation" by Alexander Osterwalder</li>
                <li>• "Running Lean" by Ash Maurya</li>
                <li>• "The Lean Startup" by Eric Ries</li>
                <li>• "Blue Ocean Strategy" by W. Chan Kim</li>
                <li>• "Platform Revolution" by Geoffrey Parker</li>
              </ul>
            </div>
            <div className="bg-dark-card p-6 rounded-lg border border-gray-700">
              <h4 className="text-spotify-green font-semibold mb-3">Strategy & Innovation</h4>
              <ul className="text-gray-300 space-y-2">
                <li>• "The 10X Rule" by Grant Cardone</li>
                <li>• "Zero to One" by Peter Thiel</li>
                <li>• "Crossing the Chasm" by Geoffrey Moore</li>
                <li>• "The Innovator's Dilemma" by Clayton Christensen</li>
                <li>• "Good to Great" by Jim Collins</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Final Takeaway */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">🔑 Final Takeaway</h2>
          <div className="bg-spotify-green/10 border border-spotify-green/30 p-6 rounded-lg">
            <p className="text-white font-semibold mb-4">Successful business models require:</p>
            <ul className="text-gray-300 space-y-2">
              <li>• <strong className="text-white">Clear value proposition</strong> that solves real customer problems</li>
              <li>• <strong className="text-white">Multiple revenue streams</strong> to reduce risk and increase value</li>
              <li>• <strong className="text-white">Scalable systems</strong> that can grow with your business</li>
              <li>• <strong className="text-white">Competitive moats</strong> that protect your market position</li>
              <li>• <strong className="text-white">Customer obsession</strong> that drives continuous improvement</li>
            </ul>
            <p className="text-gray-300 mt-4">
              Remember: Your business model is not set in stone. It should evolve as you learn more about your customers and market. The best entrepreneurs constantly test, iterate, and optimize their business models.
            </p>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center bg-gradient-to-r from-red-900/20 to-orange-900/20 border border-red-500/30 p-8 rounded-lg">
          <h2 className="text-3xl font-bold text-white mb-6">🚨 Stop Building Without a Business Model</h2>
          <p className="text-xl text-gray-300 mb-6">
            <strong>Founder Reality Check:</strong> 90% of startups fail because they don't have a clear path to profit. You're either building a business model or gambling with your future.
          </p>
          <div className="bg-dark-card p-6 rounded-lg border border-gray-700 mb-6">
            <h3 className="text-xl font-semibold text-white mb-4">What No Business Model Costs You:</h3>
            <div className="grid md:grid-cols-3 gap-4 text-gray-300">
              <div>
                <p className="text-red-400 font-semibold">💰 Lost Revenue</p>
                <p className="text-sm">Building features that don't make money</p>
              </div>
              <div>
                <p className="text-red-400 font-semibold">⏰ Wasted Time</p>
                <p className="text-sm">Months of building, no clear path to profit</p>
              </div>
              <div>
                <p className="text-red-400 font-semibold">💔 Broken Dreams</p>
                <p className="text-sm">Back to your day job</p>
              </div>
            </div>
          </div>
          <p className="text-lg text-gray-300 mb-6">
            <strong>LaunchKit helps founders design, test, and optimize business models that generate consistent revenue.</strong> Don't let a weak business model kill your startup dreams.
          </p>
          <div className="space-y-4">
            <a href="/contact" className="inline-block bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-lg font-bold text-xl transition-colors">
              🗺️ Design Your Business Model
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
