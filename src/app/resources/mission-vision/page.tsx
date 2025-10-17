import ResourcePageWrapper from "@/components/ResourcePageWrapper";

export default function MissionVisionPage() {
  return (
    <ResourcePageWrapper
      resourceTitle="Mission & Vision Statements: Define Your Purpose"
      delay={20}
      className="bg-dark-bg py-20 px-6"
    >
      <main>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">
            Mission & Vision Statements: Your Business's North Star
          </h1>
          <div className="inline-block bg-spotify-green text-black px-4 py-2 rounded-full text-sm font-semibold mb-4">
            A LaunchKit Master Guide
          </div>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Discover the "why" behind your business and create a guiding star that drives every decision, attracts the right team, and resonates with customers. Learn the proven frameworks used by the world's most successful companies.
          </p>
        </div>

        {/* Inspirational Quote Section */}
        <div className="bg-gradient-to-r from-spotify-green/20 to-blue-500/20 p-8 rounded-lg border border-gray-700 mb-12">
          <blockquote className="text-center">
            <p className="text-2xl text-white italic mb-4">
              "The best way to find out if you can trust somebody is to trust them. But the best way to find out if you can trust a company is to understand their mission."
            </p>
            <cite className="text-spotify-green text-lg">— Simon Sinek, "Start With Why"</cite>
          </blockquote>
        </div>

        {/* Section 1: The Power of Purpose */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">1. The Power of Purpose: Why Mission & Vision Matter</h2>

          <div className="bg-dark-card p-8 rounded-lg border border-gray-700 mb-8">
            <h3 className="text-2xl font-semibold text-white mb-6">From "Start With Why" by Simon Sinek</h3>
            <p className="text-gray-300 mb-6">
              <strong className="text-white">The Golden Circle:</strong> Great companies communicate from the inside out—starting with WHY (purpose), then HOW (process), then WHAT (product). This approach creates emotional connection and loyalty.
            </p>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-xl font-semibold text-spotify-green mb-4">Real Example: Apple's WHY</h4>
                <p className="text-gray-300 mb-4">
                  Apple's mission: "To challenge the status quo and think differently." This WHY drives everything from product design to marketing. People don't buy Apple products; they buy into Apple's mission to think differently.
                </p>
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <p className="text-gray-300 text-sm">
                    <strong className="text-white">Result:</strong> Most loyal customer base in technology, willing to pay premium prices
                  </p>
                </div>
              </div>
              <div>
                <h4 className="text-xl font-semibold text-spotify-green mb-4">Real Example: Tesla's Vision</h4>
                <p className="text-gray-300 mb-4">
                  Tesla's vision: "To accelerate the world's transition to sustainable transport." This clear vision attracts passionate employees and customers who share the same environmental mission.
                </p>
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <p className="text-gray-300 text-sm">
                    <strong className="text-white">Lesson:</strong> Clear vision attracts the right people and creates unstoppable momentum
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-dark-card p-6 rounded-lg border border-gray-700">
              <h4 className="text-lg font-semibold text-white mb-3">🎯 Decision Making</h4>
              <p className="text-gray-300 text-sm">Clear mission helps you say "yes" to opportunities that align and "no" to distractions.</p>
            </div>
            <div className="bg-dark-card p-6 rounded-lg border border-gray-700">
              <h4 className="text-lg font-semibold text-white mb-3">👥 Team Alignment</h4>
              <p className="text-gray-300 text-sm">Attract employees who share your values and mission, not just those looking for a paycheck.</p>
            </div>
            <div className="bg-dark-card p-6 rounded-lg border border-gray-700">
              <h4 className="text-lg font-semibold text-white mb-3">💎 Customer Loyalty</h4>
              <p className="text-gray-300 text-sm">Customers become advocates when they believe in your mission, not just your product.</p>
            </div>
          </div>
        </section>

        {/* Strategic CTA 1 */}
        <div className="mb-16 bg-gradient-to-r from-red-900/20 to-orange-900/20 border border-red-500/30 p-6 rounded-lg">
          <h4 className="text-xl font-semibold text-white mb-3">🚨 Without a Clear Mission, You're Building on Quicksand</h4>
          <p className="text-gray-300 mb-4">
            <strong>Founder Reality Check:</strong> 73% of startups fail because they lack clear direction. While you're building features, your mission-driven competitor is building a movement that customers will die for.
          </p>
          <p className="text-gray-300 mb-4">
            <strong>The Pain:</strong> Every decision becomes a debate. Every hire feels like a gamble. Every customer interaction feels transactional instead of transformational.
          </p>
          <div className="text-center">
            <a href="/contact" className="inline-block bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
              Define Your Mission - Build a Movement
            </a>
          </div>
        </div>

        {/* Section 2: Mission vs Vision vs Values */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">2. Mission vs Vision vs Values: The Trinity of Purpose</h2>

          <div className="space-y-8">
            <div className="bg-dark-card p-8 rounded-lg border border-gray-700">
              <h3 className="text-2xl font-semibold text-white mb-6">Mission Statement: What You Do and Why</h3>
              <p className="text-gray-300 mb-6">
                <strong className="text-white">Definition:</strong> Your mission is your company's purpose—the reason you exist beyond making money. It answers "What do we do and why does it matter?"
              </p>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-xl font-semibold text-spotify-green mb-4">Real Example: Patagonia</h4>
                  <p className="text-gray-300 mb-4">
                    <em>"We're in business to save our home planet."</em>
                  </p>
                  <div className="bg-gray-800/50 p-4 rounded-lg">
                    <p className="text-gray-300 text-sm">
                      <strong className="text-white">Why it Works:</strong> Clear, environmental focus that drives every business decision from materials to marketing
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-spotify-green mb-4">Real Example: Airbnb</h4>
                  <p className="text-gray-300 mb-4">
                    <em>"To create a world where anyone can belong anywhere."</em>
                  </p>
                  <div className="bg-gray-800/50 p-4 rounded-lg">
                    <p className="text-gray-300 text-sm">
                      <strong className="text-white">Why it Works:</strong> Emotional connection to belonging, not just travel accommodations
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-dark-card p-8 rounded-lg border border-gray-700">
              <h3 className="text-2xl font-semibold text-white mb-6">Vision Statement: Where You're Going</h3>
              <p className="text-gray-300 mb-6">
                <strong className="text-white">Definition:</strong> Your vision is your long-term aspiration—the future state you want to create. It answers "What will the world look like when we succeed?"
              </p>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-xl font-semibold text-spotify-green mb-4">Real Example: Microsoft (Satya Nadella Era)</h4>
                  <p className="text-gray-300 mb-4">
                    <em>"To empower every person and every organization on the planet to achieve more."</em>
                  </p>
                  <div className="bg-gray-800/50 p-4 rounded-lg">
                    <p className="text-gray-300 text-sm">
                      <strong className="text-white">Why it Works:</strong> Universal appeal, scalable across all products and markets
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-spotify-green mb-4">Real Example: Spotify</h4>
                  <p className="text-gray-300 mb-4">
                    <em>"To unlock the potential of human creativity by giving a million creative artists the opportunity to live off their art and billions of fans the opportunity to enjoy and be inspired by it."</em>
                  </p>
                  <div className="bg-gray-800/50 p-4 rounded-lg">
                    <p className="text-gray-300 text-sm">
                      <strong className="text-white">Why it Works:</strong> Specific outcomes that benefit both creators and consumers
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-dark-card p-8 rounded-lg border border-gray-700">
              <h3 className="text-2xl font-semibold text-white mb-6">Values: How You Behave</h3>
              <p className="text-gray-300 mb-6">
                <strong className="text-white">Definition:</strong> Your values are the principles that guide behavior and decision-making. They answer "How do we act when no one is watching?"
              </p>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-xl font-semibold text-spotify-green mb-4">Real Example: Amazon's Leadership Principles</h4>
                  <p className="text-gray-300 mb-4">
                    "Customer Obsession," "Think Big," "Invent and Simplify," "Are Right, A Lot"
                  </p>
                  <div className="bg-gray-800/50 p-4 rounded-lg">
                    <p className="text-gray-300 text-sm">
                      <strong className="text-white">Why it Works:</strong> Specific, actionable behaviors that drive consistent decision-making
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-spotify-green mb-4">Real Example: Zappos</h4>
                  <p className="text-gray-300 mb-4">
                    "Deliver WOW Through Service," "Embrace and Drive Change," "Create Fun and A Little Weirdness"
                  </p>
                  <div className="bg-gray-800/50 p-4 rounded-lg">
                    <p className="text-gray-300 text-sm">
                      <strong className="text-white">Why it Works:</strong> Unique personality that attracts customers and employees who share those values
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: The Mission Statement Framework */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">3. The Mission Statement Framework</h2>

          <div className="bg-dark-card p-8 rounded-lg border border-gray-700 mb-8">
            <h3 className="text-2xl font-semibold text-white mb-6">From "Built to Last" by Jim Collins</h3>
            <p className="text-gray-300 mb-6">
              <strong className="text-white">Key Principle:</strong> "A great mission statement should be inspiring, clear, and enduring. It should answer the question: 'If we disappeared tomorrow, what would the world lose?'"
            </p>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-xl font-semibold text-spotify-green mb-4">The 5-Question Framework</h4>
                <ul className="text-gray-300 space-y-2">
                  <li>1. <strong>What do we do?</strong> (Core function)</li>
                  <li>2. <strong>Who do we serve?</strong> (Target audience)</li>
                  <li>3. <strong>How do we do it?</strong> (Unique approach)</li>
                  <li>4. <strong>Why does it matter?</strong> (Impact/value)</li>
                  <li>5. <strong>What makes us different?</strong> (Competitive advantage)</li>
                </ul>
              </div>
              <div>
                <h4 className="text-xl font-semibold text-spotify-green mb-4">Real Example: Shopify</h4>
                <p className="text-gray-300 mb-4">
                  <em>"To make commerce better for everyone, so businesses can focus on what they do best: building and selling their products."</em>
                </p>
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <p className="text-gray-300 text-sm">
                    <strong className="text-white">Analysis:</strong> Clear target (businesses), clear benefit (focus on products), clear differentiation (commerce platform)
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-spotify-green/10 border border-spotify-green/30 p-6 rounded-lg">
            <h4 className="text-xl font-semibold text-white mb-4">Mission Statement Checklist</h4>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h5 className="text-white font-semibold mb-3">✅ Must Have:</h5>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• Clear and concise (1-2 sentences)</li>
                  <li>• Inspiring and aspirational</li>
                  <li>• Customer-focused</li>
                  <li>• Differentiating</li>
                </ul>
              </div>
              <div>
                <h5 className="text-white font-semibold mb-3">❌ Avoid:</h5>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• Generic industry jargon</li>
                  <li>• Internal focus only</li>
                  <li>• Too long or complex</li>
                  <li>• Vague or meaningless</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Strategic CTA 2 */}
        <div className="mb-16 bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-500/30 p-6 rounded-lg">
          <h4 className="text-xl font-semibold text-white mb-3">💔 Mission Without Vision = Drift Without Direction</h4>
          <p className="text-gray-300 mb-4">
            <strong>Founder Reality Check:</strong> You have a mission but no vision? You're like a ship with an engine but no compass. You'll work hard but never reach your destination.
          </p>
          <p className="text-gray-300 mb-4">
            <strong>The Pain:</strong> Your team works hard but feels lost. Investors can't see the bigger picture. Customers don't understand where you're taking them.
          </p>
          <div className="text-center">
            <a href="/contact" className="inline-block bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
              Create Your Vision - Chart Your Course
            </a>
          </div>
        </div>

        {/* Section 4: Vision Statement Creation */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">4. Creating Your Vision Statement</h2>

          <div className="bg-dark-card p-8 rounded-lg border border-gray-700 mb-8">
            <h3 className="text-2xl font-semibold text-white mb-6">From "Good to Great" by Jim Collins</h3>
            <p className="text-gray-300 mb-6">
              <strong className="text-white">The BHAG (Big Hairy Audacious Goal):</strong> "A true BHAG is clear and compelling, serves as a unifying focal point of effort, and acts as a clear catalyst for team spirit. It has a finish line."
            </p>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-xl font-semibold text-spotify-green mb-4">Real Example: Amazon's Original BHAG</h4>
                <p className="text-gray-300 mb-4">
                  "Build Earth's most customer-centric company; a place where people can come to find and discover anything they might want to buy online."
                </p>
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <p className="text-gray-300 text-sm">
                    <strong className="text-white">Result:</strong> Guided Amazon from online bookstore to global marketplace to cloud computing leader
                  </p>
                </div>
              </div>
              <div>
                <h4 className="text-xl font-semibold text-spotify-green mb-4">Real Example: SpaceX</h4>
                <p className="text-gray-300 mb-4">
                  "Making life multiplanetary." This simple vision drives every rocket launch, every innovation, every decision at SpaceX.
                </p>
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <p className="text-gray-300 text-sm">
                    <strong className="text-white">Lesson:</strong> The most powerful visions are simple, bold, and seemingly impossible
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-dark-card p-6 rounded-lg border border-gray-700">
              <h4 className="text-lg font-semibold text-white mb-3">Vision Statement Formula</h4>
              <p className="text-gray-300 mb-2">
                <strong>Template:</strong> "To [achieve specific outcome] by [timeframe] so that [benefit to the world]."
              </p>
              <div className="bg-gray-800/50 p-3 rounded-lg mt-3">
                <p className="text-gray-300 text-sm">
                  <strong className="text-white">Example:</strong> "To democratize access to quality education by 2030 so that every child, regardless of location or income, can reach their full potential."
                </p>
              </div>
            </div>

            <div className="bg-dark-card p-6 rounded-lg border border-gray-700">
              <h4 className="text-lg font-semibold text-white mb-3">Vision Characteristics</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h5 className="text-white font-semibold mb-2">🎯 Specific</h5>
                  <p className="text-gray-300 text-sm">Clear, measurable outcomes</p>
                </div>
                <div>
                  <h5 className="text-white font-semibold mb-2">🚀 Inspiring</h5>
                  <p className="text-gray-300 text-sm">Makes people want to join the mission</p>
                </div>
                <div>
                  <h5 className="text-white font-semibold mb-2">⏰ Time-bound</h5>
                  <p className="text-gray-300 text-sm">Has a deadline or timeframe</p>
                </div>
                <div>
                  <h5 className="text-white font-semibold mb-2">🌍 World-changing</h5>
                  <p className="text-gray-300 text-sm">Benefits beyond just the company</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 5: Famous Entrepreneur Quotes */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">5. Wisdom from Legendary Entrepreneurs</h2>

          <div className="space-y-6">
            <div className="bg-gradient-to-r from-spotify-green/20 to-blue-500/20 p-6 rounded-lg border border-gray-700">
              <blockquote className="text-center">
                <p className="text-xl text-white italic mb-3">
                  "Your work is going to fill a large part of your life, and the only way to be truly satisfied is to do what you believe is great work. And the only way to do great work is to love what you do."
                </p>
                <cite className="text-spotify-green">— Steve Jobs, Apple</cite>
              </blockquote>
            </div>

            <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 p-6 rounded-lg border border-gray-700">
              <blockquote className="text-center">
                <p className="text-xl text-white italic mb-3">
                  "If you can't explain it simply, you don't understand it well enough."
                </p>
                <cite className="text-blue-400">— Albert Einstein (applied to business)</cite>
              </blockquote>
            </div>

            <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 p-6 rounded-lg border border-gray-700">
              <blockquote className="text-center">
                <p className="text-xl text-white italic mb-3">
                  "The best way to predict the future is to create it."
                </p>
                <cite className="text-purple-400">— Peter Drucker</cite>
              </blockquote>
            </div>

            <div className="bg-gradient-to-r from-pink-500/20 to-red-500/20 p-6 rounded-lg border border-gray-700">
              <blockquote className="text-center">
                <p className="text-xl text-white italic mb-3">
                  "Don't be afraid to give up the good to go for the great."
                </p>
                <cite className="text-pink-400">— John D. Rockefeller</cite>
              </blockquote>
            </div>
          </div>
        </section>

        {/* Section 6: The Blue Ocean Strategy for Mission & Vision */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">6. Blue Ocean Strategy: Create Uncontested Purpose</h2>

          <div className="bg-dark-card p-8 rounded-lg border border-gray-700 mb-8">
            <h3 className="text-2xl font-semibold text-white mb-6">From "Blue Ocean Strategy" by W. Chan Kim & Renée Mauborgne</h3>
            <p className="text-gray-300 mb-6">
              Instead of competing in crowded mission spaces (red oceans), create new purpose categories where competition is irrelevant. This strategy has launched some of the most successful companies in history.
            </p>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-xl font-semibold text-spotify-green mb-4">Real Example: Warby Parker</h4>
                <p className="text-gray-300 mb-4">
                  Mission: "To offer designer eyewear at a revolutionary price, while leading the way for socially conscious businesses."
                </p>
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <p className="text-gray-300 text-sm">
                    <strong className="text-white">Strategy:</strong> Combined affordable luxury with social impact (Buy a Pair, Give a Pair)
                  </p>
                </div>
              </div>
              <div>
                <h4 className="text-xl font-semibold text-spotify-green mb-4">Real Example: Ben & Jerry's</h4>
                <p className="text-gray-300 mb-4">
                  Mission: "To make, distribute and sell the finest quality all-natural ice cream and related products in a wide variety of innovative flavors made from Vermont dairy products."
                </p>
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <p className="text-gray-300 text-sm">
                    <strong className="text-white">Strategy:</strong> Combined premium product with social activism and environmental responsibility
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-spotify-green/10 border border-spotify-green/30 p-6 rounded-lg">
            <h4 className="text-xl font-semibold text-white mb-4">Your Blue Ocean Purpose Framework</h4>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h5 className="text-white font-semibold mb-3">What to Eliminate:</h5>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• Generic industry missions</li>
                  <li>• Profit-only focus</li>
                  <li>• Vague aspirational language</li>
                  <li>• Internal-only perspective</li>
                </ul>
              </div>
              <div>
                <h5 className="text-white font-semibold mb-3">What to Create:</h5>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• Unique purpose combinations</li>
                  <li>• Social impact integration</li>
                  <li>• Specific, measurable outcomes</li>
                  <li>• Customer-centric benefits</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Strategic CTA 3 */}
        <div className="mb-16 bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border border-yellow-500/30 p-6 rounded-lg">
          <h4 className="text-xl font-semibold text-white mb-3">⚡ Your Mission is Your Competitive Advantage</h4>
          <p className="text-gray-300 mb-4">
            <strong>Founder Reality Check:</strong> While your competitors are fighting over features and pricing, you could be building a movement. Mission-driven companies grow 3x faster and retain employees 2x longer.
          </p>
          <p className="text-gray-300 mb-4">
            <strong>The Pain:</strong> Generic mission = generic results. Your team works for money, not meaning. Your customers buy products, not purpose.
          </p>
          <div className="text-center">
            <a href="/contact" className="inline-block bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
              Craft Your Mission - Build Your Movement
            </a>
          </div>
        </div>

        {/* Section 7: Implementation Framework */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">7. Implementation: From Words to Action</h2>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-dark-card p-6 rounded-lg border border-gray-700">
              <h4 className="text-xl font-semibold text-white mb-4">Step 1: Communicate</h4>
              <ul className="text-gray-300 text-sm space-y-2">
                <li>• Share in every team meeting</li>
                <li>• Display prominently in office</li>
                <li>• Include in all job descriptions</li>
                <li>• Feature on website and materials</li>
              </ul>
            </div>
            <div className="bg-dark-card p-6 rounded-lg border border-gray-700">
              <h4 className="text-xl font-semibold text-white mb-4">Step 2: Align</h4>
              <ul className="text-gray-300 text-sm space-y-2">
                <li>• Use for hiring decisions</li>
                <li>• Guide strategic planning</li>
                <li>• Evaluate new opportunities</li>
                <li>• Make tough trade-offs</li>
              </ul>
            </div>
            <div className="bg-dark-card p-6 rounded-lg border border-gray-700">
              <h4 className="text-xl font-semibold text-white mb-4">Step 3: Measure</h4>
              <ul className="text-gray-300 text-sm space-y-2">
                <li>• Track mission-aligned metrics</li>
                <li>• Survey employee engagement</li>
                <li>• Monitor customer sentiment</li>
                <li>• Review quarterly progress</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section 8: Common Mistakes to Avoid */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">8. Common Mistakes That Kill Your Mission</h2>
          <div className="bg-red-900/20 border border-red-500/30 p-6 rounded-lg">
            <ul className="text-gray-300 space-y-2">
              <li>❌ Making it too generic ("We provide excellent service")</li>
              <li>❌ Focusing only on profit ("Maximize shareholder value")</li>
              <li>❌ Making it too long (more than 2 sentences)</li>
              <li>❌ Using corporate jargon ("leverage," "synergy," "paradigm")</li>
              <li>❌ Not living it (saying one thing, doing another)</li>
              <li>❌ Making it about the founder instead of customers</li>
              <li>❌ Not involving the team in creation</li>
              <li>❌ Setting it and forgetting it (not revisiting)</li>
            </ul>
          </div>
        </section>

        {/* Section 9: Your 30-Day Mission Action Plan */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">9. Your 30-Day Mission Action Plan</h2>

          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-dark-card p-6 rounded-lg border border-gray-700">
              <h4 className="text-xl font-semibold text-white mb-4">Week 1: Discovery</h4>
              <ul className="text-gray-300 text-sm space-y-2">
                <li>• Interview 10 customers</li>
                <li>• Survey your team</li>
                <li>• Analyze your "why"</li>
                <li>• Study competitors</li>
              </ul>
            </div>
            <div className="bg-dark-card p-6 rounded-lg border border-gray-700">
              <h4 className="text-xl font-semibold text-white mb-4">Week 2: Draft</h4>
              <ul className="text-gray-300 text-sm space-y-2">
                <li>• Write 5 mission drafts</li>
                <li>• Create 3 vision statements</li>
                <li>• Define 5 core values</li>
                <li>• Get feedback</li>
              </ul>
            </div>
            <div className="bg-dark-card p-6 rounded-lg border border-gray-700">
              <h4 className="text-xl font-semibold text-white mb-4">Week 3: Refine</h4>
              <ul className="text-gray-300 text-sm space-y-2">
                <li>• Test with focus groups</li>
                <li>• Validate with advisors</li>
                <li>• Check for clarity</li>
                <li>• Finalize versions</li>
              </ul>
            </div>
            <div className="bg-dark-card p-6 rounded-lg border border-gray-700">
              <h4 className="text-xl font-semibold text-white mb-4">Week 4: Launch</h4>
              <ul className="text-gray-300 text-sm space-y-2">
                <li>• Communicate to team</li>
                <li>• Update all materials</li>
                <li>• Share with customers</li>
                <li>• Plan ongoing use</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-red-900/20 to-orange-900/20 border border-red-500/30 p-8 rounded-lg">
            <h2 className="text-3xl font-bold mb-6 text-white">🚨 Stop Building Without Purpose</h2>
            <p className="text-xl text-gray-300 mb-6">
              <strong>Founder Reality Check:</strong> Every day you operate without a clear mission is a day your competitors are building movements that customers will die for. Your features won't save you—your purpose will.
            </p>
            <div className="bg-dark-card p-6 rounded-lg border border-gray-700 mb-6">
              <h3 className="text-xl font-semibold text-white mb-4">What You're Losing Every Day:</h3>
              <div className="grid md:grid-cols-3 gap-4 text-gray-300">
                <div>
                  <p className="text-red-400 font-semibold">💔 Employee Engagement</p>
                  <p className="text-sm">Working for money, not meaning</p>
                </div>
                <div>
                  <p className="text-red-400 font-semibold">🎯 Customer Loyalty</p>
                  <p className="text-sm">Buying products, not purpose</p>
                </div>
                <div>
                  <p className="text-red-400 font-semibold">🚀 Growth Momentum</p>
                  <p className="text-sm">Building features, not movements</p>
                </div>
              </div>
            </div>
            <p className="text-lg text-gray-300 mb-6">
              <strong>At LaunchKit, we help founders create mission-driven businesses that attract the right people and build lasting value.</strong> Don't let your startup become another generic company.
            </p>
            <div className="space-y-4">
              <a href="/contact" className="inline-block bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-lg font-bold text-xl transition-colors">
                🎯 Define Your Mission - Build Your Movement
              </a>
              <p className="text-sm text-gray-400">
                ⚡ Limited consultation spots available
              </p>
            </div>
          </div>
        </div>

        {/* Back to Resources */}
        <div className="text-center mt-8">
          <a href="/resources" className="text-spotify-green hover:text-green-400 text-sm font-medium">
            ← Back to Resources
          </a>
        </div>
      </div>
      </main>
    </ResourcePageWrapper>
  );
}
