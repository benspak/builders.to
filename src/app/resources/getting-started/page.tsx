import ResourcePageWrapper from "@/components/ResourcePageWrapper";

export default function GettingStartedPage() {
  return (
    <ResourcePageWrapper
      resourceTitle="Entrepreneurship Fundamentals: The Complete Launch Strategy"
      delay={20}
      className="bg-dark-bg py-20 px-6"
    >
      <main>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">
            Entrepreneurship Fundamentals: The Complete Launch Strategy
          </h1>
          <div className="inline-block bg-spotify-green text-black px-4 py-2 rounded-full text-sm font-semibold mb-4">
            A LaunchKit Master Guide
          </div>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Master the foundational principles that separate successful entrepreneurs from dreamers. This guide combines proven business strategies, real-world examples, and actionable frameworks to launch your venture with confidence.
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

        {/* Section 1: The Entrepreneurial Mindset */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">1. The Entrepreneurial Mindset</h2>

          <div className="bg-dark-card p-8 rounded-lg border border-gray-700 mb-8">
            <h3 className="text-2xl font-semibold text-white mb-6">What Makes Entrepreneurs Different</h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-xl font-semibold text-spotify-green mb-4">From "Mindset" by Carol Dweck</h4>
                <p className="text-gray-300 mb-4">
                  Entrepreneurs possess a growth mindset—they see challenges as opportunities to learn and improve, not as threats to their ego or intelligence.
                </p>
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <p className="text-gray-300 text-sm">
                    <strong className="text-white">Key Insight:</strong> "The passion for stretching yourself and sticking to it, even (or especially) when it's not going well, is the hallmark of the growth mindset."
                  </p>
                </div>
              </div>
              <div>
                <h4 className="text-xl font-semibold text-spotify-green mb-4">Real Example: Howard Schultz (Starbucks)</h4>
                <p className="text-gray-300 mb-4">
                  Schultz was rejected by 217 of the 242 investors he approached for Starbucks. His growth mindset kept him focused on learning from each rejection and improving his pitch.
                </p>
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <p className="text-gray-300 text-sm">
                    <strong className="text-white">Lesson:</strong> Success comes from persistence and learning, not from avoiding failure.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-dark-card p-6 rounded-lg border border-gray-700">
              <h4 className="text-lg font-semibold text-white mb-3">🎯 Opportunity Recognition</h4>
              <p className="text-gray-300 text-sm">Spot problems others miss and see them as business opportunities.</p>
            </div>
            <div className="bg-dark-card p-6 rounded-lg border border-gray-700">
              <h4 className="text-lg font-semibold text-white mb-3">💪 Resilience</h4>
              <p className="text-gray-300 text-sm">Bounce back from setbacks and use them as learning experiences.</p>
            </div>
            <div className="bg-dark-card p-6 rounded-lg border border-gray-700">
              <h4 className="text-lg font-semibold text-white mb-3">🚀 Action Orientation</h4>
              <p className="text-gray-300 text-sm">Prefer doing over planning, learning through execution.</p>
            </div>
          </div>
        </section>

        {/* Section 2: The Blue Ocean Strategy */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">2. Blue Ocean Strategy: Create Uncontested Markets</h2>

          <div className="bg-dark-card p-8 rounded-lg border border-gray-700 mb-8">
            <h3 className="text-2xl font-semibold text-white mb-6">From "Blue Ocean Strategy" by W. Chan Kim & Renée Mauborgne</h3>
            <p className="text-gray-300 mb-6">
              Instead of competing in crowded markets (red oceans), create new markets where competition is irrelevant. This strategy has launched some of the most successful companies in history.
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
            <h4 className="text-xl font-semibold text-white mb-4">Your Blue Ocean Framework</h4>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h5 className="text-white font-semibold mb-3">What to Eliminate:</h5>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• Industry practices that add cost without value</li>
                  <li>• Features customers don't use</li>
                  <li>• Processes that slow you down</li>
                </ul>
              </div>
              <div>
                <h5 className="text-white font-semibold mb-3">What to Create:</h5>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• New value propositions</li>
                  <li>• Unique customer experiences</li>
                  <li>• Innovative business models</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: The Lean Startup Methodology */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">3. The Lean Startup: Build, Measure, Learn</h2>

          <div className="bg-dark-card p-8 rounded-lg border border-gray-700 mb-8">
            <h3 className="text-2xl font-semibold text-white mb-6">From "The Lean Startup" by Eric Ries</h3>
            <p className="text-gray-300 mb-6">
              The Lean Startup methodology emphasizes rapid iteration, customer feedback, and validated learning over traditional business planning.
            </p>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-spotify-green rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-black font-bold text-2xl">🏗️</span>
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">Build</h4>
                <p className="text-gray-300 text-sm">Create a minimum viable product (MVP) to test your hypothesis</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-spotify-green rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-black font-bold text-2xl">📊</span>
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">Measure</h4>
                <p className="text-gray-300 text-sm">Collect data on how customers interact with your MVP</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-spotify-green rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-black font-bold text-2xl">🎓</span>
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">Learn</h4>
                <p className="text-gray-300 text-sm">Use insights to decide whether to pivot or persevere</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-xl font-semibold text-spotify-green mb-4">Real Example: Dropbox's MVP</h4>
                <p className="text-gray-300 mb-4">
                  Drew Houston created a 3-minute video explaining Dropbox's concept before building the product. The video generated 75,000 signups overnight, validating demand before any development costs.
                </p>
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <p className="text-gray-300 text-sm">
                    <strong className="text-white">Key Insight:</strong> "If you're not embarrassed by the first version of your product, you've launched too late." - Reid Hoffman
                  </p>
                </div>
              </div>
              <div>
                <h4 className="text-xl font-semibold text-spotify-green mb-4">Real Example: Zappos' Validation</h4>
                <p className="text-gray-300 mb-4">
                  Nick Swinmurn started Zappos by taking photos of shoes at local stores and posting them online. When someone ordered, he'd buy the shoes and ship them. This proved demand before building inventory.
                </p>
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <p className="text-gray-300 text-sm">
                    <strong className="text-white">Lesson:</strong> Test your assumptions with the simplest possible experiment
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: The 10X Rule */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">4. The 10X Rule: Think Bigger Than You Think Possible</h2>

          <div className="bg-dark-card p-8 rounded-lg border border-gray-700 mb-8">
            <h3 className="text-2xl font-semibold text-white mb-6">From "The 10X Rule" by Grant Cardone</h3>
            <p className="text-gray-300 mb-6">
              Most people set goals that are too small and then wonder why they achieve so little. The 10X Rule says you should set targets that are 10 times what you think you want, and then take 10 times the action you think is necessary.
            </p>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-xl font-semibold text-spotify-green mb-4">Real Example: Elon Musk's Vision</h4>
                <p className="text-gray-300 mb-4">
                  When Musk started Tesla, he didn't aim to sell a few thousand electric cars. He aimed to accelerate the world's transition to sustainable energy. This 10X vision attracted the talent and investment needed to achieve the impossible.
                </p>
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <p className="text-gray-300 text-sm">
                    <strong className="text-white">Quote:</strong> "When something is important enough, you do it even if the odds are not in your favor."
                  </p>
                </div>
              </div>
              <div>
                <h4 className="text-xl font-semibold text-spotify-green mb-4">Real Example: Amazon's Expansion</h4>
                <p className="text-gray-300 mb-4">
                  Bezos didn't start Amazon to sell just books online. His vision was to build "Earth's most customer-centric company" and sell everything online. This 10X thinking drove Amazon's expansion into every imaginable category.
                </p>
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <p className="text-gray-300 text-sm">
                    <strong className="text-white">Lesson:</strong> Big goals attract big resources and big talent
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-spotify-green/10 border border-spotify-green/30 p-6 rounded-lg">
            <h4 className="text-xl font-semibold text-white mb-4">Applying the 10X Rule to Your Business</h4>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h5 className="text-white font-semibold mb-3">Instead of thinking:</h5>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• "I want to make $50K this year"</li>
                  <li>• "I want 100 customers"</li>
                  <li>• "I want to launch in my city"</li>
                </ul>
              </div>
              <div>
                <h5 className="text-white font-semibold mb-3">Think 10X bigger:</h5>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• "I want to make $500K this year"</li>
                  <li>• "I want 1,000 customers"</li>
                  <li>• "I want to launch nationally"</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Section 5: The Power of Focus */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">5. The Power of Focus: Do One Thing Exceptionally Well</h2>

          <div className="bg-dark-card p-8 rounded-lg border border-gray-700 mb-8">
            <h3 className="text-2xl font-semibold text-white mb-6">From "Good to Great" by Jim Collins</h3>
            <p className="text-gray-300 mb-6">
              Great companies focus on what they can be the best at, what drives their economic engine, and what they're passionate about. This "hedgehog concept" drives sustained success.
            </p>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-xl font-semibold text-spotify-green mb-4">Real Example: Southwest Airlines</h4>
                <p className="text-gray-300 mb-4">
                  Southwest focused exclusively on being the best low-cost, point-to-point airline. They didn't add international flights, first-class seating, or cargo services. This focus made them the most profitable airline in history.
                </p>
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <p className="text-gray-300 text-sm">
                    <strong className="text-white">Quote:</strong> "The essence of a Hedgehog Concept is to attain piercing clarity about how to produce the best long-term results, and then exercising the relentless discipline to say 'No' to opportunities that fall outside the three circles."
                  </p>
                </div>
              </div>
              <div>
                <h4 className="text-xl font-semibold text-spotify-green mb-4">Real Example: Apple's Focus</h4>
                <p className="text-gray-300 mb-4">
                  When Jobs returned to Apple in 1997, he cut the product line from 350 products to just 10. This focus on a few exceptional products allowed Apple to become the most valuable company in the world.
                </p>
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <p className="text-gray-300 text-sm">
                    <strong className="text-white">Lesson:</strong> Saying no to good opportunities is essential for saying yes to great ones
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-dark-card p-6 rounded-lg border border-gray-700">
              <h4 className="text-lg font-semibold text-white mb-3">🎯 What Can You Be Best At?</h4>
              <p className="text-gray-300 text-sm">Identify your unique strengths and capabilities that competitors can't easily replicate.</p>
            </div>
            <div className="bg-dark-card p-6 rounded-lg border border-gray-700">
              <h4 className="text-lg font-semibold text-white mb-3">💰 What Drives Your Economic Engine?</h4>
              <p className="text-gray-300 text-sm">Focus on metrics that directly impact your profitability and cash flow.</p>
            </div>
            <div className="bg-dark-card p-6 rounded-lg border border-gray-700">
              <h4 className="text-lg font-semibold text-white mb-3">🔥 What Are You Passionate About?</h4>
              <p className="text-gray-300 text-sm">Pursue opportunities that align with your deepest interests and values.</p>
            </div>
          </div>
        </section>

        {/* Strategic CTA 5 */}
        <div className="mb-16 bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-500/30 p-6 rounded-lg">
          <h4 className="text-xl font-semibold text-white mb-3">🎯 Stop Chasing Shiny Objects</h4>
          <p className="text-gray-300 mb-4">
            <strong>Founder Reality Check:</strong> You're probably working on 10 different things and excelling at none. While you're multitasking, your focused competitor is dominating their niche.
          </p>
          <p className="text-gray-300 mb-4">
            <strong>The Pain:</strong> Every new feature you add dilutes your core value proposition. Every new market you enter weakens your competitive advantage. Focus wins, distraction loses.
          </p>
          <div className="text-center">
            <a href="/contact" className="inline-block bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
              Find Your Focus - Dominate Your Market
            </a>
          </div>
        </div>

        {/* Strategic CTA 6 */}
        <div className="mb-16 bg-gradient-to-r from-indigo-900/20 to-purple-900/20 border border-indigo-500/30 p-6 rounded-lg">
          <h4 className="text-xl font-semibold text-white mb-3">💡 Knowledge Without Action = Expensive Entertainment</h4>
          <p className="text-gray-300 mb-4">
            <strong>Founder Reality Check:</strong> You've read every startup book, watched every TED talk, but you're still not building. Information without implementation is just expensive procrastination.
          </p>
          <p className="text-gray-300 mb-4">
            <strong>The Pain:</strong> While you're "learning," your competitors are launching. While you're planning, they're profiting. Action beats perfection every time.
          </p>
          <div className="text-center">
            <a href="/contact" className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
              Stop Learning - Start Building
            </a>
          </div>
        </div>

        {/* Section 6: The Compound Effect */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">6. The Compound Effect: Small Actions, Massive Results</h2>

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

        {/* Section 7: Famous Business Strategies */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">7. Famous Business Strategies That Built Empires</h2>

          <div className="space-y-8">
            <div className="bg-dark-card p-8 rounded-lg border border-gray-700">
              <h3 className="text-2xl font-semibold text-white mb-6">The McDonald's Franchise Model</h3>
              <p className="text-gray-300 mb-4">
                Ray Kroc didn't invent the hamburger, but he revolutionized the restaurant industry by creating a scalable franchise system that could be replicated anywhere in the world.
              </p>
              <div className="bg-gray-800/50 p-4 rounded-lg">
                <p className="text-gray-300 text-sm">
                  <strong className="text-white">Strategy:</strong> Standardize everything (processes, training, quality) so that any franchisee can deliver the same experience anywhere in the world.
                </p>
              </div>
            </div>

            <div className="bg-dark-card p-8 rounded-lg border border-gray-700">
              <h3 className="text-2xl font-semibold text-white mb-6">The Walmart "Everyday Low Prices" Strategy</h3>
              <p className="text-gray-300 mb-4">
                Sam Walton built Walmart by focusing on one thing: offering the lowest prices every day, not just during sales. This created customer loyalty and drove competitors out of business.
              </p>
              <div className="bg-gray-800/50 p-4 rounded-lg">
                <p className="text-gray-300 text-sm">
                  <strong className="text-white">Strategy:</strong> Build scale to reduce costs, then pass savings to customers to build market share and drive out competition.
                </p>
              </div>
            </div>

            <div className="bg-dark-card p-8 rounded-lg border border-gray-700">
              <h3 className="text-2xl font-semibold text-white mb-6">The Tesla "Luxury First" Strategy</h3>
              <p className="text-gray-300 mb-4">
                Elon Musk started Tesla with the expensive Roadster to prove electric cars could be desirable, then used profits to fund development of more affordable models.
              </p>
              <div className="bg-gray-800/50 p-4 rounded-lg">
                <p className="text-gray-300 text-sm">
                  <strong className="text-white">Strategy:</strong> Start with premium products to establish brand credibility and fund R&D, then move downmarket to capture mass market.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 8: Action Plan */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">8. Your 90-Day Launch Action Plan</h2>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-dark-card p-6 rounded-lg border border-gray-700">
              <h4 className="text-xl font-semibold text-white mb-4">Month 1: Foundation</h4>
              <ul className="text-gray-300 text-sm space-y-2">
                <li>• Week 1: Define your 10X vision</li>
                <li>• Week 2: Identify your blue ocean opportunity</li>
                <li>• Week 3: Build your MVP</li>
                <li>• Week 4: Test with 10 potential customers</li>
              </ul>
            </div>
            <div className="bg-dark-card p-6 rounded-lg border border-gray-700">
              <h4 className="text-xl font-semibold text-white mb-4">Month 2: Validation</h4>
              <ul className="text-gray-300 text-sm space-y-2">
                <li>• Week 1-2: Iterate based on feedback</li>
                <li>• Week 3: Secure first 5 paying customers</li>
                <li>• Week 4: Document your learnings</li>
              </ul>
            </div>
            <div className="bg-dark-card p-6 rounded-lg border border-gray-700">
              <h4 className="text-xl font-semibold text-white mb-4">Month 3: Scale</h4>
              <ul className="text-gray-300 text-sm space-y-2">
                <li>• Week 1: Optimize your processes</li>
                <li>• Week 2: Launch marketing campaigns</li>
                <li>• Week 3: Build your team</li>
                <li>• Week 4: Plan your next 90 days</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Additional Resources Section */}
        <div className="mt-16 bg-dark-card p-8 rounded-lg border border-gray-700">
          <h3 className="text-2xl font-semibold text-white mb-6 text-center">Essential Entrepreneurship Reading List</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-spotify-green font-semibold mb-3">Foundation Books</h4>
              <ul className="text-gray-300 space-y-2">
                <li>• "The Lean Startup" by Eric Ries</li>
                <li>• "Zero to One" by Peter Thiel</li>
                <li>• "Good to Great" by Jim Collins</li>
                <li>• "Blue Ocean Strategy" by W. Chan Kim</li>
                <li>• "The 10X Rule" by Grant Cardone</li>
              </ul>
            </div>
            <div>
              <h4 className="text-spotify-green font-semibold mb-3">Advanced Strategy</h4>
              <ul className="text-gray-300 space-y-2">
                <li>• "Competitive Strategy" by Michael Porter</li>
                <li>• "Built to Last" by Jim Collins</li>
                <li>• "The Innovator's Dilemma" by Clayton Christensen</li>
                <li>• "Traction" by Gabriel Weinberg</li>
                <li>• "The Hard Thing About Hard Things" by Ben Horowitz</li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-red-900/20 to-orange-900/20 border border-red-500/30 p-8 rounded-lg">
            <h2 className="text-3xl font-bold mb-6 text-white">🚨 Time to Stop Reading, Start Building</h2>
            <p className="text-xl text-gray-300 mb-6">
              <strong>Founder Reality Check:</strong> While you're reading this guide, your competitor is already executing these strategies. Every day you delay is another day they capture your market.
            </p>
            <div className="bg-dark-card p-6 rounded-lg border border-gray-700 mb-6">
              <h3 className="text-xl font-semibold text-white mb-4">What You're Losing Every Day:</h3>
              <div className="grid md:grid-cols-3 gap-4 text-gray-300">
                <div>
                  <p className="text-red-400 font-semibold">💰 Revenue</p>
                  <p className="text-sm">Every day = $0 in sales</p>
                </div>
                <div>
                  <p className="text-red-400 font-semibold">🎯 Market Share</p>
                  <p className="text-sm">Every day = competitor advantage</p>
                </div>
                <div>
                  <p className="text-red-400 font-semibold">⏰ Time</p>
                  <p className="text-sm">Every day = opportunity cost</p>
                </div>
              </div>
            </div>
            <p className="text-lg text-gray-300 mb-6">
              <strong>At LaunchKit, we help founders launch investor-ready MVPs in just 21 days.</strong> Don't let your dreams die in planning. Let's turn your entrepreneurial vision into reality.
            </p>
            <div className="space-y-4">
              <a href="/contact" className="inline-block bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-lg font-bold text-xl transition-colors">
                🚀 Launch My MVP in 21 Days - Before It's Too Late
              </a>
              <p className="text-sm text-gray-400">
                ⚡ Limited spots available
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
