import ResourcePageWrapper from "@/components/ResourcePageWrapper";

export default function PickCofounderPage() {
  return (
    <ResourcePageWrapper
      resourceTitle="Pick Your Cofounder: Build Legendary Partnerships"
      delay={20}
      className="bg-dark-bg py-20 px-6"
    >
      <main>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-center mb-8 text-white">
            The Cofounder Selection: Build Your Dream Team
          </h1>
          <div className="inline-block bg-spotify-green text-black px-4 py-2 rounded-full text-sm font-semibold mb-4">
            A LaunchKit Master Guide
          </div>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Your cofounder can make or break your startup. Learn the proven frameworks used by successful founders like Jobs & Wozniak, Gates & Allen, and Page & Brin to build legendary partnerships that create billion-dollar companies.
          </p>
        </div>

        {/* Inspirational Quote Section */}
        <div className="bg-gradient-to-r from-spotify-green/20 to-blue-500/20 p-8 rounded-lg border border-gray-700 mb-12">
          <blockquote className="text-center">
            <p className="text-2xl text-white italic mb-4">
              "Great things in business are never done by one person. They're done by a team of people."
            </p>
            <cite className="text-spotify-green text-lg">— Steve Jobs, Apple Co-founder</cite>
          </blockquote>
        </div>

        {/* Section 1: The Psychology of Cofounder Relationships */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">1. The Psychology of Cofounder Relationships</h2>

          <div className="bg-dark-card p-8 rounded-lg border border-gray-700 mb-8">
            <h3 className="text-2xl font-semibold text-white mb-6">From "The Founder's Dilemma" by Noam Wasserman</h3>
            <p className="text-gray-300 mb-6">
              Cofounder relationships are more complex than business partnerships—they're like marriages that require emotional intelligence, communication skills, and shared values. Understanding the psychology behind successful partnerships is crucial.
            </p>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-xl font-semibold text-spotify-green mb-4">Real Example: Bill Gates & Paul Allen (Microsoft)</h4>
                <p className="text-gray-300 mb-4">
                  Gates and Allen met in high school and bonded over their shared passion for computers. Their friendship provided the emotional foundation that helped them navigate Microsoft's early challenges, including working 18-hour days together.
                </p>
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <p className="text-gray-300 text-sm">
                    <strong className="text-white">Key Insight:</strong> "The best cofounder relationships start with genuine friendship and shared interests, not just business needs."
                  </p>
                </div>
              </div>
              <div>
                <h4 className="text-xl font-semibold text-spotify-green mb-4">Real Example: Larry Page & Sergey Brin (Google)</h4>
                <p className="text-gray-300 mb-4">
                  Page and Brin initially clashed during their PhD studies at Stanford. However, their intellectual rivalry evolved into mutual respect and complementary skills—Page focused on product vision, Brin on business strategy.
                </p>
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <p className="text-gray-300 text-sm">
                    <strong className="text-white">Lesson:</strong> Initial friction can lead to stronger partnerships when channeled constructively.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-dark-card p-6 rounded-lg border border-gray-700">
              <h4 className="text-lg font-semibold text-white mb-3">🧠 Cognitive Diversity</h4>
              <p className="text-gray-300 text-sm">Different thinking styles lead to better problem-solving and innovation.</p>
            </div>
            <div className="bg-dark-card p-6 rounded-lg border border-gray-700">
              <h4 className="text-lg font-semibold text-white mb-3">💪 Emotional Resilience</h4>
              <p className="text-gray-300 text-sm">Partners who can support each other during setbacks build stronger companies.</p>
            </div>
            <div className="bg-dark-card p-6 rounded-lg border border-gray-700">
              <h4 className="text-lg font-semibold text-white mb-3">🤝 Trust & Vulnerability</h4>
              <p className="text-gray-300 text-sm">The ability to be honest about weaknesses and ask for help.</p>
            </div>
          </div>
        </section>

        {/* Section 2: The Cofounder Compatibility Framework */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">2. The Cofounder Compatibility Framework</h2>

          <div className="bg-dark-card p-8 rounded-lg border border-gray-700 mb-8">
            <h3 className="text-2xl font-semibold text-white mb-6">From "The Hard Thing About Hard Things" by Ben Horowitz</h3>
            <p className="text-gray-300 mb-6">
              Horowitz emphasizes that cofounder compatibility goes beyond skills—it's about shared values, work ethic, and the ability to handle stress together. This framework helps you evaluate potential partners systematically.
            </p>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-xl font-semibold text-spotify-green mb-4">Real Example: Ben & Jerry's Ice Cream</h4>
                <p className="text-gray-300 mb-4">
                  Ben Cohen and Jerry Greenfield were childhood friends who shared values about social responsibility and quality. Their partnership succeeded because they aligned on company culture and mission, not just business goals.
                </p>
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <p className="text-gray-300 text-sm">
                    <strong className="text-white">Strategy:</strong> Values alignment creates stronger company culture and customer loyalty.
                  </p>
                </div>
              </div>
              <div>
                <h4 className="text-xl font-semibold text-spotify-green mb-4">Real Example: Hewlett-Packard</h4>
                <p className="text-gray-300 mb-4">
                  Bill Hewlett and Dave Packard built HP on the "HP Way"—a set of shared values including respect for individuals, contribution to society, and integrity. This foundation helped HP become a $100+ billion company.
                </p>
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <p className="text-gray-300 text-sm">
                    <strong className="text-white">Lesson:</strong> Shared values create sustainable competitive advantages.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-spotify-green/10 border border-spotify-green/30 p-6 rounded-lg">
            <h4 className="text-xl font-semibold text-white mb-4">Your Cofounder Compatibility Checklist</h4>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h5 className="text-white font-semibold mb-3">Values & Culture:</h5>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• Do you share the same vision for company culture?</li>
                  <li>• Are your personal values aligned?</li>
                  <li>• Do you have similar work-life balance preferences?</li>
                  <li>• Are you both committed to the same level of risk?</li>
                </ul>
              </div>
              <div>
                <h5 className="text-white font-semibold mb-3">Work Style & Communication:</h5>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• Do you communicate effectively under stress?</li>
                  <li>• Are your decision-making styles compatible?</li>
                  <li>• Do you handle conflict in similar ways?</li>
                  <li>• Are you both comfortable with ambiguity?</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: The Skill Complementarity Matrix */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">3. The Skill Complementarity Matrix</h2>

          <div className="bg-dark-card p-8 rounded-lg border border-gray-700 mb-8">
            <h3 className="text-2xl font-semibold text-white mb-6">From "Zero to One" by Peter Thiel</h3>
            <p className="text-gray-300 mb-6">
              Thiel argues that the best cofounder relationships create 1+1=3 outcomes through skill complementarity. When cofounders bring different but complementary skills, they can achieve more together than either could alone.
            </p>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-spotify-green rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-black font-bold text-2xl">🎯</span>
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">Product Vision</h4>
                <p className="text-gray-300 text-sm">Someone who can see the big picture and define what to build</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-spotify-green rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-black font-bold text-2xl">⚙️</span>
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">Execution</h4>
                <p className="text-gray-300 text-sm">Someone who can turn vision into reality through technical or operational skills</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-spotify-green rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-black font-bold text-2xl">🚀</span>
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">Growth</h4>
                <p className="text-gray-300 text-sm">Someone who can acquire customers and scale the business</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-xl font-semibold text-spotify-green mb-4">Real Example: Steve Jobs & Steve Wozniak (Apple)</h4>
                <p className="text-gray-300 mb-4">
                  Jobs brought product vision and marketing genius, while Wozniak brought technical brilliance. Jobs could see what customers wanted, Wozniak could build it. This complementarity created the personal computer revolution.
                </p>
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <p className="text-gray-300 text-sm">
                    <strong className="text-white">Key Insight:</strong> "The best partnerships combine someone who knows what to build with someone who knows how to build it."
                  </p>
                </div>
              </div>
              <div>
                <h4 className="text-xl font-semibold text-spotify-green mb-4">Real Example: Brian Chesky & Joe Gebbia (Airbnb)</h4>
                <p className="text-gray-300 mb-4">
                  Chesky brought design thinking and user experience expertise, while Gebbia brought technical skills and operational knowledge. Together, they created a platform that revolutionized hospitality.
                </p>
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <p className="text-gray-300 text-sm">
                    <strong className="text-white">Lesson:</strong> Design + Technology partnerships often create the most user-centric products.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: The Cofounder Dating Process */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">4. The Cofounder Dating Process</h2>

          <div className="bg-dark-card p-8 rounded-lg border border-gray-700 mb-8">
            <h3 className="text-2xl font-semibold text-white mb-6">From "The Lean Startup" by Eric Ries</h3>
            <p className="text-gray-300 mb-6">
              Ries emphasizes the importance of testing cofounder relationships before committing. Just as you validate product-market fit, you need to validate cofounder fit through small projects and shared experiences.
            </p>

            <div className="space-y-6">
              <div className="bg-dark-card p-6 rounded-lg border border-gray-700">
                <h4 className="text-xl font-semibold text-white mb-4">Phase 1: Coffee & Conversation (Week 1-2)</h4>
                <p className="text-gray-300 mb-3">Meet regularly to discuss ideas, values, and vision. Look for intellectual chemistry and shared interests.</p>
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <p className="text-gray-300 text-sm">
                    <strong className="text-white">Pro Tip:</strong> Ask about their biggest failures and how they handled them. This reveals resilience and learning ability.
                  </p>
                </div>
              </div>

              <div className="bg-dark-card p-6 rounded-lg border border-gray-700">
                <h4 className="text-xl font-semibold text-white mb-4">Phase 2: Small Project Test (Week 3-6)</h4>
                <p className="text-gray-300 mb-3">Work on a small project together—a weekend hackathon, a side project, or even planning a trip. This reveals working dynamics.</p>
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <p className="text-gray-300 text-sm">
                    <strong className="text-white">Real Example:</strong> Mark Zuckerberg and Eduardo Saverin tested their partnership by building Facemash together before launching Facebook.
                  </p>
                </div>
              </div>

              <div className="bg-dark-card p-6 rounded-lg border border-gray-700">
                <h4 className="text-xl font-semibold text-white mb-4">Phase 3: Weekend Startup (Week 7-8)</h4>
                <p className="text-gray-300 mb-3">Spend a full weekend working on a startup idea together. This simulates the intensity of real startup life.</p>
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <p className="text-gray-300 text-sm">
                    <strong className="text-white">What to Look For:</strong> How do you handle disagreements? Can you make decisions quickly? Do you enjoy working together?
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Strategic CTA 1 */}
          <div className="mt-8 bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/30 p-6 rounded-lg">
            <h4 className="text-xl font-semibold text-white mb-3">💔 Don't Rush Into a Cofounder Marriage</h4>
            <p className="text-gray-300 mb-4">
              <strong>Founder Reality Check:</strong> 90% of founders skip the "dating" phase and jump straight into partnerships. This is like marrying someone after one date - it ends in disaster.
            </p>
            <p className="text-gray-300 mb-4">
              <strong>The Pain:</strong> A bad cofounder relationship will consume your energy, destroy your vision, and kill your startup. The wrong partner is worse than no partner.
            </p>
            <div className="text-center">
              <a href="/contact" className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                Find Your Perfect Cofounder Match
              </a>
            </div>
          </div>
        </section>

        {/* Section 5: Famous Cofounder Strategies */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">5. Famous Cofounder Strategies That Built Empires</h2>

          <div className="space-y-8">
            <div className="bg-dark-card p-8 rounded-lg border border-gray-700">
              <h3 className="text-2xl font-semibold text-white mb-6">The PayPal Mafia Strategy: Build a Network</h3>
              <p className="text-gray-300 mb-4">
                PayPal's cofounders—including Elon Musk, Peter Thiel, and Reid Hoffman—created a network effect that extended beyond their company. They invested in each other's ventures and shared knowledge, creating multiple billion-dollar companies.
              </p>
              <div className="bg-gray-800/50 p-4 rounded-lg">
                <p className="text-gray-300 text-sm">
                  <strong className="text-white">Strategy:</strong> Choose cofounders who can become part of a broader entrepreneurial network, not just business partners.
                </p>
              </div>
            </div>

            <div className="bg-dark-card p-8 rounded-lg border border-gray-700">
              <h3 className="text-2xl font-semibold text-white mb-6">The Y Combinator Strategy: Structured Cofounder Matching</h3>
              <p className="text-gray-300 mb-4">
                Y Combinator has perfected the art of cofounder matching through their startup school and accelerator programs. They bring together complementary founders and provide frameworks for building strong partnerships.
              </p>
              <div className="bg-gray-800/50 p-4 rounded-lg">
                <p className="text-gray-300 text-sm">
                  <strong className="text-white">Strategy:</strong> Use structured programs and frameworks to evaluate cofounder compatibility systematically.
                </p>
              </div>
            </div>

            <div className="bg-dark-card p-8 rounded-lg border border-gray-700">
              <h3 className="text-2xl font-semibold text-white mb-6">The Amazon Strategy: Complementary Leadership</h3>
                <p className="text-gray-300 mb-4">
                  Jeff Bezos and his early cofounders created a culture where different leadership styles complemented each other. Bezos focused on long-term vision, while others handled day-to-day operations and technical execution.
                </p>
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <p className="text-gray-300 text-sm">
                    <strong className="text-white">Strategy:</strong> Build a leadership team where each cofounder has a distinct, complementary role that doesn't overlap.
                  </p>
                </div>
            </div>
          </div>
        </section>

        {/* Section 6: Red Flags & Deal Breakers */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">6. Red Flags & Deal Breakers</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-red-900/20 border border-red-500/30 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-3 text-white">🚩 Lack of Financial Commitment</h3>
              <p className="text-gray-300">They're not willing to invest money or quit their job. This shows lack of belief in the venture.</p>
            </div>
            <div className="bg-red-900/20 border border-red-500/30 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-3 text-white">🚩 Poor Communication</h3>
              <p className="text-gray-300">They don't respond to messages, miss meetings, or avoid difficult conversations.</p>
            </div>
            <div className="bg-red-900/20 border border-red-500/30 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-3 text-white">🚩 Different Work Ethics</h3>
              <p className="text-gray-300">They don't share your sense of urgency or commitment to quality.</p>
            </div>
            <div className="bg-red-900/20 border border-red-500/30 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-3 text-white">🚩 Unrealistic Expectations</h3>
              <p className="text-gray-300">They expect immediate success or aren't prepared for the hard work ahead.</p>
            </div>
            <div className="bg-red-900/20 border border-red-500/30 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-3 text-white">🚩 Lack of Accountability</h3>
              <p className="text-gray-300">They blame others for failures and don't take responsibility for their actions.</p>
            </div>
            <div className="bg-red-900/20 border border-red-500/30 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-3 text-white">🚩 Different Risk Tolerance</h3>
              <p className="text-gray-300">They're not comfortable with the uncertainty and risk inherent in startups.</p>
            </div>
          </div>
        </section>

        {/* Section 7: The Cofounder Agreement Framework */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">7. The Cofounder Agreement Framework</h2>

          <div className="bg-dark-card p-8 rounded-lg border border-gray-700 mb-8">
            <h3 className="text-2xl font-semibold text-white mb-6">From "Founder's Agreements" by Y Combinator</h3>
            <p className="text-gray-300 mb-6">
              A well-structured cofounder agreement prevents conflicts and provides clarity on roles, equity, and decision-making. This framework ensures both parties are aligned before starting the venture.
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-xl font-semibold text-spotify-green mb-4">Equity & Vesting</h4>
                <ul className="text-gray-300 space-y-2">
                  <li>• <strong className="text-white">4-year vesting with 1-year cliff</strong> for both cofounders</li>
                  <li>• <strong className="text-white">Equal initial split</strong> unless there's a clear justification</li>
                  <li>• <strong className="text-white">Performance-based adjustments</strong> after 12 months</li>
                  <li>• <strong className="text-white">Buy-sell provisions</strong> for exit scenarios</li>
                </ul>
              </div>
              <div>
                <h4 className="text-xl font-semibold text-spotify-green mb-4">Roles & Responsibilities</h4>
                <ul className="text-gray-300 space-y-2">
                  <li>• <strong className="text-white">Clear decision-making authority</strong> for each area</li>
                  <li>• <strong className="text-white">Conflict resolution process</strong> for disagreements</li>
                  <li>• <strong className="text-white">Exit strategy planning</strong> for various scenarios</li>
                  <li>• <strong className="text-white">Regular review meetings</strong> to assess partnership health</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Section 8: The Lean Startup Approach to Cofounder Selection */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">8. The Lean Startup Approach to Cofounder Selection</h2>

          <div className="bg-dark-card p-8 rounded-lg border border-gray-700 mb-8">
            <h3 className="text-2xl font-semibold text-white mb-6">From "The Lean Startup" by Eric Ries</h3>
            <p className="text-gray-300 mb-6">
              Cofounder selection should follow the same Build-Measure-Learn cycle as product development. Test multiple candidates quickly, measure compatibility, and iterate based on feedback.
            </p>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-spotify-green rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-black font-bold text-2xl">🏗️</span>
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">Build</h4>
                <p className="text-gray-300 text-sm">Create multiple cofounder relationships and test compatibility</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-spotify-green rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-black font-bold text-2xl">📊</span>
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">Measure</h4>
                <p className="text-gray-300 text-sm">Track compatibility metrics and working dynamics</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-spotify-green rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-black font-bold text-2xl">🎓</span>
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">Learn</h4>
                <p className="text-gray-300 text-sm">Use insights to refine your cofounder selection criteria</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-xl font-semibold text-spotify-green mb-4">Real Example: Y Combinator's Approach</h4>
                <p className="text-gray-300 mb-4">
                  Y Combinator doesn't just match cofounders randomly. They use structured programs, shared experiences, and compatibility assessments to help founders find the right partners.
                </p>
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <p className="text-gray-300 text-sm">
                    <strong className="text-white">Strategy:</strong> "Use structured frameworks and shared experiences to evaluate cofounder compatibility systematically."
                  </p>
                </div>
              </div>
              <div>
                <h4 className="text-xl font-semibold text-spotify-green mb-4">Real Example: PayPal's Network Effect</h4>
                <p className="text-gray-300 mb-4">
                  PayPal's cofounders didn't just work together—they built a network of successful entrepreneurs. This network effect created multiple billion-dollar companies from one partnership.
                </p>
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <p className="text-gray-300 text-sm">
                    <strong className="text-white">Lesson:</strong> "The best cofounder relationships create networks that extend beyond the initial partnership."
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-spotify-green/10 border border-spotify-green/30 p-6 rounded-lg">
            <h4 className="text-xl font-semibold text-white mb-4">Your Lean Cofounder Testing Framework</h4>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h5 className="text-white font-semibold mb-3">Testing Methods:</h5>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• Work on small projects together</li>
                  <li>• Simulate high-stress situations</li>
                  <li>• Test decision-making under pressure</li>
                  <li>• Measure communication effectiveness</li>
                </ul>
              </div>
              <div>
                <h5 className="text-white font-semibold mb-3">Success Metrics:</h5>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• 90%+ alignment on major decisions</li>
                  <li>• Effective conflict resolution</li>
                  <li>• Complementary skill sets</li>
                  <li>• Shared vision and values</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Section 9: Action Plan */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">9. Your 90-Day Cofounder Search Action Plan</h2>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-dark-card p-6 rounded-lg border border-gray-700">
              <h4 className="text-xl font-semibold text-white mb-4">Month 1: Network & Research</h4>
              <ul className="text-gray-300 text-sm space-y-2">
                <li>• Week 1: Attend startup events and meetups</li>
                <li>• Week 2: Join online founder communities</li>
                <li>• Week 3: Research potential cofounders online</li>
                <li>• Week 4: Reach out to 20+ potential partners</li>
              </ul>
            </div>
            <div className="bg-dark-card p-6 rounded-lg border border-gray-700">
              <h4 className="text-xl font-semibold text-white mb-4">Month 2: Evaluate & Test</h4>
              <ul className="text-gray-300 text-sm space-y-2">
                <li>• Week 1-2: Coffee meetings with top candidates</li>
                <li>• Week 3: Small project collaboration</li>
                <li>• Week 4: Weekend startup simulation</li>
              </ul>
            </div>
            <div className="bg-dark-card p-6 rounded-lg border border-gray-700">
              <h4 className="text-xl font-semibold text-white mb-4">Month 3: Commit & Launch</h4>
              <ul className="text-gray-300 text-sm space-y-2">
                <li>• Week 1: Final compatibility assessment</li>
                <li>• Week 2: Draft cofounder agreement</li>
                <li>• Week 3: Legal review and signing</li>
                <li>• Week 4: Launch your startup together</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Additional Resources Section */}
        <div className="mt-16 bg-dark-card p-8 rounded-lg border border-gray-700">
          <h3 className="text-2xl font-semibold text-white mb-6 text-center">Essential Cofounder Reading List</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-spotify-green font-semibold mb-3">Cofounder-Specific Books</h4>
              <ul className="text-gray-300 space-y-2">
                <li>• "The Founder's Dilemma" by Noam Wasserman</li>
                <li>• "Slicing Pie" by Mike Moyer</li>
                <li>• "The Partnership Charter" by David Gage</li>
                <li>• "Founder's Agreements" by Y Combinator</li>
              </ul>
            </div>
            <div>
              <h4 className="text-spotify-green font-semibold mb-3">Team Building & Leadership</h4>
              <ul className="text-gray-300 space-y-2">
                <li>• "The Five Dysfunctions of a Team" by Patrick Lencioni</li>
                <li>• "Good to Great" by Jim Collins</li>
                <li>• "The Hard Thing About Hard Things" by Ben Horowitz</li>
                <li>• "Radical Candor" by Kim Scott</li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-red-900/20 to-orange-900/20 border border-red-500/30 p-8 rounded-lg">
            <h2 className="text-3xl font-bold text-white mb-6">🚨 The Wrong Cofounder Will Destroy Your Startup</h2>
            <p className="text-xl text-gray-300 mb-6">
              <strong>Founder Reality Check:</strong> 65% of startups fail due to cofounder conflicts. Choosing the wrong partner is worse than going solo - it's startup suicide.
            </p>
            <div className="bg-dark-card p-6 rounded-lg border border-gray-700 mb-6">
              <h3 className="text-xl font-semibold text-white mb-4">What the Wrong Cofounder Costs You:</h3>
              <div className="grid md:grid-cols-3 gap-4 text-gray-300">
                <div>
                  <p className="text-red-400 font-semibold">⚖️ Legal Battles</p>
                  <p className="text-sm">$100,000+ in lawyer fees</p>
                </div>
                <div>
                  <p className="text-red-400 font-semibold">💔 Broken Friendships</p>
                  <p className="text-sm">Relationships destroyed</p>
                </div>
                <div>
                  <p className="text-red-400 font-semibold">🏢 Failed Company</p>
                  <p className="text-sm">Dreams turned nightmare</p>
                </div>
              </div>
            </div>
            <p className="text-lg text-gray-300 mb-6">
              <strong>LaunchKit helps founders build strong partnerships and launch investor-ready MVPs.</strong> Don't let the wrong cofounder kill your billion-dollar idea.
            </p>
            <div className="space-y-4">
              <a href="/contact" className="inline-block bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-lg font-bold text-xl transition-colors">
                🤝 Build a Legendary Partnership
              </a>
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
