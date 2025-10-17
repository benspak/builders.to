import Link from "next/link";
import ResourcePageWrapper from "@/components/ResourcePageWrapper";

export default function BusinessNamingPage() {
  return (
    <ResourcePageWrapper
      resourceTitle="Business Naming: From Zero to Iconic Brand"
      delay={20}
      className="bg-dark-bg py-20 px-6"
    >
      <main>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-center mb-8 text-white">
            🏷️ Business Naming: From Zero to Iconic Brand
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Your business name is more than a label — it's the foundation of your brand, your investor pitch, and your customer's first impression. Learn the proven strategies used by companies like Apple, Nike, Tesla, and Amazon to create names that become cultural phenomena.
          </p>
          <p className="text-lg text-gray-300">
            This guide combines expert insights from leading entrepreneurship books with LaunchKit's hands-on founder experience to give you a step-by-step framework for picking a name that is:
          </p>
        </div>

        {/* Inspirational Quote Section */}
        <div className="bg-gradient-to-r from-spotify-green/20 to-blue-500/20 p-8 rounded-lg border border-gray-700 mb-12">
          <blockquote className="text-center">
            <p className="text-2xl text-white italic mb-4">
              "A brand is the set of expectations, memories, stories and relationships that, taken together, account for a consumer's decision to choose one product or service over another."
            </p>
            <cite className="text-spotify-green text-lg">— Seth Godin, "This Is Marketing"</cite>
          </blockquote>
        </div>

        {/* Key Benefits */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="bg-dark-card p-6 rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-3">Creative and memorable</h3>
            <p className="text-gray-300 text-sm">Stand out from competitors with a name that sticks in customers' minds.</p>
          </div>
          <div className="bg-dark-card p-6 rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-3">Legally safe and future-proof</h3>
            <p className="text-gray-300 text-sm">Avoid trademark issues and legal headaches down the road.</p>
          </div>
          <div className="bg-dark-card p-6 rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-3">Credible with investors and customers</h3>
            <p className="text-gray-300 text-sm">Build trust and professionalism from day one.</p>
          </div>
          <div className="bg-dark-card p-6 rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-3">Scalable beyond your MVP</h3>
            <p className="text-gray-300 text-sm">Grow with your business without needing a rebrand.</p>
          </div>
        </div>

        {/* Section 1: The Psychology of Naming */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">1. The Psychology of Naming: Why Names Matter</h2>

          <div className="bg-dark-card p-6 rounded-lg border border-gray-700 mb-6">
            <h3 className="text-xl font-semibold text-white mb-4">From "Contagious: Why Things Catch On" by Jonah Berger</h3>
            <p className="text-gray-300 mb-4">
              <strong className="text-white">Key Insight:</strong> "Names that are easy to pronounce are more likely to be shared and remembered. The easier something is to process, the more people like it."
            </p>
            <div className="bg-gray-800/50 p-4 rounded-lg">
              <p className="text-gray-300 text-sm">
                <strong className="text-white">Real Example:</strong> "Kodak" was chosen because it was easy to pronounce in any language and had no existing meaning, making it a blank slate for brand building.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-dark-card p-6 rounded-lg border border-gray-700">
              <h4 className="text-lg font-semibold text-white mb-3">🧠 Cognitive Fluency</h4>
              <p className="text-gray-300 text-sm">Names that are easy to process create positive associations and trust.</p>
            </div>
            <div className="bg-dark-card p-6 rounded-lg border border-gray-700">
              <h4 className="text-lg font-semibold text-white mb-3">💝 Emotional Resonance</h4>
              <p className="text-gray-300 text-sm">Names that evoke emotions create stronger brand connections.</p>
            </div>
            <div className="bg-dark-card p-6 rounded-lg border border-gray-700">
              <h4 className="text-lg font-semibold text-white mb-3">🌍 Cultural Universality</h4>
              <p className="text-gray-300 text-sm">Names that work across different languages and cultures.</p>
            </div>
          </div>
        </section>

        {/* Section 2: Creative Brainstorming */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">2. Creative Brainstorming: The LaunchKit Method</h2>
          <div className="bg-dark-card p-6 rounded-lg border border-gray-700 mb-6">
            <p className="text-gray-300 mb-4">
              <strong className="text-white">Goal:</strong> Generate at least 20–50 potential names before narrowing.
            </p>
          </div>

          <h3 className="text-xl font-semibold text-white mb-4">Techniques</h3>
          <div className="space-y-6">
            <div className="bg-dark-card p-6 rounded-lg border border-gray-700">
              <h4 className="text-lg font-semibold text-white mb-3">Word association: Tie words to your product, mission, or vibe.</h4>
              <p className="text-gray-300 mb-2">
                <strong>Example:</strong> Travel startup → explore, orbit, horizon.
              </p>
              <div className="bg-gray-800/50 p-3 rounded-lg mt-3">
                <p className="text-gray-300 text-sm">
                  <strong className="text-white">From "Blue Ocean Strategy":</strong> "The best names often come from identifying the emotional essence of your value proposition."
                </p>
              </div>
            </div>

            <div className="bg-dark-card p-6 rounded-lg border border-gray-700">
              <h4 className="text-lg font-semibold text-white mb-3">Mashups: Blend words or syllables.</h4>
              <p className="text-gray-300 mb-2">
                <strong>Example:</strong> Spotify = "spot" + "identify."
              </p>
              <div className="bg-gray-800/50 p-3 rounded-lg mt-3">
                <p className="text-gray-300 text-sm">
                  <strong className="text-white">Real Example:</strong> Microsoft = "microcomputer" + "software"
                </p>
              </div>
            </div>

            <div className="bg-dark-card p-6 rounded-lg border border-gray-700">
              <h4 className="text-lg font-semibold text-white mb-3">Metaphors: Use imagery, nature, or cultural references.</h4>
              <p className="text-gray-300 mb-2">
                <strong>Example:</strong> Amazon → vast, powerful.
              </p>
              <div className="bg-gray-800/50 p-3 rounded-lg mt-3">
                <p className="text-gray-300 text-sm">
                  <strong className="text-white">From "Built to Last":</strong> "Great companies often choose names that represent their vision, not just their current product."
                </p>
              </div>
            </div>

            <div className="bg-dark-card p-6 rounded-lg border border-gray-700">
              <h4 className="text-lg font-semibold text-white mb-3">Founder hook: Personal tie-in for authenticity.</h4>
              <p className="text-gray-300 mb-2">
                <strong>Example:</strong> Dell = founder's last name.
              </p>
              <div className="bg-gray-800/50 p-3 rounded-lg mt-3">
                <p className="text-gray-300 text-sm">
                  <strong className="text-white">Real Examples:</strong> Ford, Disney, Johnson & Johnson, McDonald's
                </p>
              </div>
            </div>

            <div className="bg-dark-card p-6 rounded-lg border border-gray-700">
              <h4 className="text-lg font-semibold text-white mb-3">Future vision: Abstract enough to grow with you.</h4>
              <p className="text-gray-300 mb-2">
                <strong>Example:</strong> Google could expand beyond search.
              </p>
              <div className="bg-gray-800/50 p-3 rounded-lg mt-3">
                <p className="text-gray-300 text-sm">
                  <strong className="text-white">From "The Lean Startup":</strong> "Choose names that allow for pivots and expansion without confusion."
                </p>
              </div>
            </div>
          </div>

          <div className="bg-spotify-green/10 border border-spotify-green/30 p-4 rounded-lg mt-6">
            <p className="text-spotify-green font-medium">
              💡 <strong>Tip:</strong> Keep names short, punchy, and easy to spell.
            </p>
          </div>
        </section>

        {/* Section 3: Famous Business Naming Strategies */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">3. Famous Business Naming Strategies That Built Empires</h2>

          <div className="space-y-6">
            <div className="bg-dark-card p-6 rounded-lg border border-gray-700">
              <h3 className="text-xl font-semibold text-white mb-4">The Apple Strategy: Simple & Universal</h3>
              <p className="text-gray-300 mb-3">
                Steve Jobs chose "Apple" because it was simple, universal, and had no negative connotations. From "Steve Jobs" by Walter Isaacson:
              </p>
              <div className="bg-gray-800/50 p-4 rounded-lg">
                <p className="text-gray-300 text-sm italic">
                  "Apple was simple, clean, and not intimidating. Apple took the edge off the word 'computer.' Plus, it would get us ahead of Atari in the phone book."
                </p>
              </div>
            </div>

            <div className="bg-dark-card p-6 rounded-lg border border-gray-700">
              <h3 className="text-xl font-semibold text-white mb-4">The Nike Strategy: Mythology & Power</h3>
              <p className="text-gray-300 mb-3">
                Nike chose the Greek goddess of victory, representing power and success. From "Shoe Dog" by Phil Knight:
              </p>
              <div className="bg-gray-800/50 p-4 rounded-lg">
                <p className="text-gray-300 text-sm italic">
                  "Nike was the winged goddess of victory. She flew around battlefields rewarding the victors with glory and fame."
                </p>
              </div>
            </div>

            <div className="bg-dark-card p-6 rounded-lg border border-gray-700">
              <h3 className="text-xl font-semibold text-white mb-4">The Tesla Strategy: Innovation & Legacy</h3>
              <p className="text-gray-300 mb-3">
                Elon Musk chose Tesla to honor the inventor Nikola Tesla, signaling innovation and disruption. From "Elon Musk" by Ashlee Vance:
              </p>
              <div className="bg-gray-800/50 p-4 rounded-lg">
                <p className="text-gray-300 text-sm italic">
                  "Tesla was the unsung hero of electricity. He was robbed by Edison and others, and Musk wanted to right that wrong."
                </p>
              </div>
            </div>

            <div className="bg-dark-card p-6 rounded-lg border border-gray-700">
              <h3 className="text-xl font-semibold text-white mb-4">The Amazon Strategy: Category Domination</h3>
              <p className="text-gray-300 mb-3">
                Jeff Bezos chose Amazon because it started with "A" (alphabetical advantage) and represented the world's largest river. From "The Everything Store" by Brad Stone:
              </p>
              <div className="bg-gray-800/50 p-4 rounded-lg">
                <p className="text-gray-300 text-sm italic">
                  "Bezos wanted a name that started with 'A' so it would appear early in alphabetical listings. Amazon represented the scale and ambition of his vision."
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Strategic Fit */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">4. Test for Strategic Fit (The 6 LaunchKit Filters)</h2>
          <p className="text-gray-300 mb-6">
            Before falling in love with a name, run it through these six questions (adapted from HBR + LaunchKit criteria):
          </p>

          <div className="space-y-4">
            <div className="bg-dark-card p-6 rounded-lg border border-gray-700">
              <h4 className="text-lg font-semibold text-white mb-2">Meaningful: Does it convey the right message and emotion?</h4>
              <p className="text-gray-300 text-sm">Tesla evokes innovation and boldness.</p>
            </div>

            <div className="bg-dark-card p-6 rounded-lg border border-gray-700">
              <h4 className="text-lg font-semibold text-white mb-2">Adaptable: Can it grow if you pivot or expand?</h4>
              <p className="text-gray-300 text-sm">Amazon started with books, scaled to everything.</p>
            </div>

            <div className="bg-dark-card p-6 rounded-lg border border-gray-700">
              <h4 className="text-lg font-semibold text-white mb-2">Distinctive: Does it stand apart from competitors?</h4>
              <p className="text-gray-300 text-sm">LaunchKit stands out from bland "Development Solutions LLCs."</p>
            </div>

            <div className="bg-dark-card p-6 rounded-lg border border-gray-700">
              <h4 className="text-lg font-semibold text-white mb-2">Memorable: Is it easy to say, spell, and recall?</h4>
              <p className="text-gray-300 text-sm">Slack passes the "radio test" — clear even if only spoken.</p>
            </div>

            <div className="bg-dark-card p-6 rounded-lg border border-gray-700">
              <h4 className="text-lg font-semibold text-white mb-2">Positive associations: Does it avoid awkward translations?</h4>
              <p className="text-gray-300 text-sm">Check foreign meanings — Chevy Nova = "doesn't go" in Spanish.</p>
            </div>

            <div className="bg-dark-card p-6 rounded-lg border border-gray-700">
              <h4 className="text-lg font-semibold text-white mb-2">Available: Can you secure the domain, trademark, and social handles?</h4>
            </div>
          </div>

          {/* Strategic CTA 2 */}
          <div className="mt-8 bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border border-yellow-500/30 p-6 rounded-lg">
            <h4 className="text-xl font-semibold text-white mb-3">⚖️ One Trademark Lawsuit = Game Over</h4>
            <p className="text-gray-300 mb-4">
              <strong>Founder Reality Check:</strong> Legal battles cost $50,000+ and destroy startups. While you're "figuring it out later," you're one cease-and-desist letter away from losing everything.
            </p>
            <p className="text-gray-300 mb-4">
              <strong>The Pain:</strong> Rebranding costs 6-12 months and $100,000+. You'll lose customers, confuse investors, and watch competitors capture your market while you rebuild.
            </p>
            <div className="text-center">
              <a href="/contact" className="inline-block bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                Secure Your Legal Brand Protection
              </a>
            </div>
          </div>
        </section>

        {/* Section 5: Entrepreneur Quotes on Naming */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">5. Wisdom from Famous Entrepreneurs</h2>

          <div className="space-y-6">
            <div className="bg-gradient-to-r from-spotify-green/20 to-blue-500/20 p-6 rounded-lg border border-gray-700">
              <blockquote className="text-center">
                <p className="text-xl text-white italic mb-3">
                  "A brand is what people say about you when you're not in the room."
                </p>
                <cite className="text-spotify-green">— Jeff Bezos, Amazon</cite>
              </blockquote>
            </div>

            <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 p-6 rounded-lg border border-gray-700">
              <blockquote className="text-center">
                <p className="text-xl text-white italic mb-3">
                  "The name is the first thing people hear, and it's the last thing they remember."
                </p>
                <cite className="text-blue-400">— Richard Branson, Virgin Group</cite>
              </blockquote>
            </div>

            <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 p-6 rounded-lg border border-gray-700">
              <blockquote className="text-center">
                <p className="text-xl text-white italic mb-3">
                  "Your brand name should be a promise you can keep."
                </p>
                <cite className="text-purple-400">— Howard Schultz, Starbucks</cite>
              </blockquote>
            </div>
          </div>
        </section>

        {/* Section 6: Check Availability */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">6. Check Availability</h2>

          <div className="space-y-6">
            <div className="bg-dark-card p-6 rounded-lg border border-gray-700">
              <h3 className="text-xl font-semibold text-white mb-4">a) State Business Registry Search</h3>
              <p className="text-gray-300 mb-3">Every U.S. state has a Secretary of State business entity search.</p>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• Search exact + similar names.</li>
                <li>• ⚠️ Even close variations may be rejected.</li>
              </ul>
            </div>

            <div className="bg-dark-card p-6 rounded-lg border border-gray-700">
              <h3 className="text-xl font-semibold text-white mb-4">b) Federal Trademark Search</h3>
              <p className="text-gray-300 mb-3">Use the USPTO TESS database: <a href="https://tmsearch.uspto.gov" className="text-spotify-green hover:text-green-400" target="_blank" rel="noopener noreferrer">https://tmsearch.uspto.gov</a></p>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• Search both exact names and phonetic similarities.</li>
                <li>• A competitor with a registered trademark in your category can block you.</li>
              </ul>
            </div>

            <div className="bg-dark-card p-6 rounded-lg border border-gray-700">
              <h3 className="text-xl font-semibold text-white mb-4">c) Domain Name Availability</h3>
              <p className="text-gray-300 mb-3">Check via Namecheap, Google Domains, GoDaddy.</p>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• Prioritize .com, but .io, .ai, and .co work for startups.</li>
                <li>• Secure variants to protect your brand.</li>
              </ul>
            </div>

            <div className="bg-dark-card p-6 rounded-lg border border-gray-700">
              <h3 className="text-xl font-semibold text-white mb-4">d) Social Media Handles</h3>
              <p className="text-gray-300 mb-3">Use Namechk to test availability across X, LinkedIn, Instagram, TikTok, etc.</p>
              <p className="text-gray-300 text-sm">Consistency across platforms = instant credibility.</p>
            </div>
          </div>

          {/* Strategic CTA 3 */}
          <div className="mt-8 bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-500/30 p-6 rounded-lg">
            <h4 className="text-xl font-semibold text-white mb-3">⏰ Every Day You Wait, Good Names Disappear</h4>
            <p className="text-gray-300 mb-4">
              <strong>Founder Reality Check:</strong> 1,000+ domains are registered every hour. That perfect name you're "thinking about" will be gone tomorrow. Domain squatters are watching.
            </p>
            <p className="text-gray-300 mb-4">
              <strong>The Pain:</strong> The perfect domain you wanted will cost $10,000+ from a squatter next month. Your "backup option" becomes your permanent regret.
            </p>
            <div className="text-center">
              <a href="/contact" className="inline-block bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                Secure Your Perfect Domain Today
              </a>
            </div>
          </div>
        </section>

        {/* Section 7: Validate with Customers & Investors */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">7. Validate with Customers & Investors</h2>
          <p className="text-gray-300 mb-4">Don't decide in a vacuum.</p>
          <ul className="text-gray-300 space-y-2">
            <li>• Poll your audience (LinkedIn, Slack groups, Twitter/X).</li>
            <li>• Test clarity: Say the name aloud and ask, "What do you think this company does?"</li>
            <li>• Compare options: Narrow to 3–5 finalists and collect feedback.</li>
          </ul>
        </section>

        {/* Section 8: Practical Tests */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">8. Run Practical Tests</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-dark-card p-4 rounded-lg border border-gray-700">
              <p className="text-white font-semibold">✅ Spelling Test: Can someone spell it after hearing once?</p>
            </div>
            <div className="bg-dark-card p-4 rounded-lg border border-gray-700">
              <p className="text-white font-semibold">✅ Radio Test: Does it sound good out loud?</p>
            </div>
            <div className="bg-dark-card p-4 rounded-lg border border-gray-700">
              <p className="text-white font-semibold">✅ Email Test: Does name@domain.com look professional?</p>
            </div>
            <div className="bg-dark-card p-4 rounded-lg border border-gray-700">
              <p className="text-white font-semibold">✅ Future-Proof Test: Will it still work if you add products or expand globally?</p>
            </div>
          </div>
        </section>

        {/* Section 9: Lock It Down */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">9. Lock It Down</h2>
          <p className="text-gray-300 mb-4">Once you've chosen:</p>
          <ul className="text-gray-300 space-y-2">
            <li>• Register LLC/Corp with your Secretary of State.</li>
            <li>• Buy the domain + variants immediately.</li>
            <li>• Grab social handles even if you won't use them yet.</li>
            <li>• File a trademark if you plan to raise funds or scale nationally.</li>
          </ul>
        </section>

        {/* Section 10: Examples */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">10. Examples of Strong Startup Names</h2>
          <div className="overflow-x-auto">
            <table className="w-full bg-dark-card rounded-lg border border-gray-700">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left p-4 text-white font-semibold">Startup</th>
                  <th className="text-left p-4 text-white font-semibold">Why it Works</th>
                  <th className="text-left p-4 text-white font-semibold">Strategy Used</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-700">
                  <td className="p-4 text-white font-semibold">LaunchKit</td>
                  <td className="p-4 text-gray-300">Simple, sharp, professional</td>
                  <td className="p-4 text-gray-300">Metaphor (startup launching)</td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="p-4 text-white font-semibold">Airbnb</td>
                  <td className="p-4 text-gray-300">Story-driven (Air mattress + B&B)</td>
                  <td className="p-4 text-gray-300">Mashup + Story</td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="p-4 text-white font-semibold">Notion</td>
                  <td className="p-4 text-gray-300">Flexible, abstract, future-proof</td>
                  <td className="p-4 text-gray-300">Conceptual</td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="p-4 text-white font-semibold">Coinbase</td>
                  <td className="p-4 text-gray-300">Instantly clear: crypto + finance</td>
                  <td className="p-4 text-gray-300">Descriptive</td>
                </tr>
                <tr>
                  <td className="p-4 text-white font-semibold">Slack</td>
                  <td className="p-4 text-gray-300">Short, memorable, ironic productivity name</td>
                  <td className="p-4 text-gray-300">Ironic + Short</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 11: Common Mistakes */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">11. Common Mistakes to Avoid</h2>
          <div className="bg-red-900/20 border border-red-500/30 p-6 rounded-lg">
            <ul className="text-gray-300 space-y-2">
              <li>❌ Overcomplicating spellings (KwikKonnekt).</li>
              <li>❌ Being too generic (Tech Solutions LLC).</li>
              <li>❌ Copying trends (everything ending in ".ai").</li>
              <li>❌ Ignoring trademark or state restrictions.</li>
              <li>❌ Choosing a name that limits future growth (DenverLogoDesign.com).</li>
            </ul>
          </div>
        </section>

        {/* Section 12: The 10X Rule for Naming */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">12. The 10X Rule: Think Bigger Than You Think Possible</h2>

          <div className="bg-dark-card p-8 rounded-lg border border-gray-700 mb-8">
            <h3 className="text-2xl font-semibold text-white mb-6">From "The 10X Rule" by Grant Cardone</h3>
            <p className="text-gray-300 mb-6">
              <strong className="text-white">Key Principle:</strong> "Set targets that are 10 times what you want to achieve and then take 10 times the action you think is necessary to get there."
            </p>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-xl font-semibold text-spotify-green mb-4">Real Example: Amazon's Empire Vision</h4>
                <p className="text-gray-300 mb-4">
                  Jeff Bezos didn't just want to sell books online. He chose "Amazon" (the world's largest river) because he envisioned selling everything online. The name had to work for books, electronics, cloud computing, and beyond.
                </p>
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <p className="text-gray-300 text-sm">
                    <strong className="text-white">Strategy:</strong> "Choose names that can scale to your 10X vision, not just your current product."
                  </p>
                </div>
              </div>
              <div>
                <h4 className="text-xl font-semibold text-spotify-green mb-4">Real Example: Google's Search to Everything</h4>
                <p className="text-gray-300 mb-4">
                  Google started as a search engine but chose a name that could work for email, maps, cloud storage, and AI. "Google" became a verb that transcended search.
                </p>
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <p className="text-gray-300 text-sm">
                    <strong className="text-white">Lesson:</strong> "The best names become verbs and transcend their original category."
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-dark-card p-6 rounded-lg border border-gray-700">
              <h4 className="text-lg font-semibold text-white mb-3">🌍 Think Global</h4>
              <p className="text-gray-300 text-sm">Will your name work in international markets? Consider pronunciation, cultural meanings, and legal availability worldwide.</p>
            </div>
            <div className="bg-dark-card p-6 rounded-lg border border-gray-700">
              <h4 className="text-lg font-semibold text-white mb-3">📈 Think Categories</h4>
              <p className="text-gray-300 text-sm">Can you expand into adjacent industries? The best names work across multiple verticals and use cases.</p>
            </div>
            <div className="bg-dark-card p-6 rounded-lg border border-gray-700">
              <h4 className="text-lg font-semibold text-white mb-3">🚀 Think Timeless</h4>
              <p className="text-gray-300 text-sm">Will your name still work in 10 years? Avoid trendy terms that will feel outdated quickly.</p>
            </div>
          </div>
        </section>

        {/* Strategic CTA 4 */}
        <div className="mb-16 bg-gradient-to-r from-green-900/20 to-blue-900/20 border border-green-500/30 p-6 rounded-lg">
          <h4 className="text-xl font-semibold text-white mb-3">🎯 Your Name is Your First Marketing Asset</h4>
          <p className="text-gray-300 mb-4">
            <strong>Founder Reality Check:</strong> A great name sells itself. Every time someone says your company name, they're marketing for you. A bad name requires constant explanation and marketing spend.
          </p>
          <p className="text-gray-300 mb-4">
            <strong>The Pain:</strong> You're spending thousands on marketing to explain what your company does, when the right name could do that work for you.
          </p>
          <div className="text-center">
            <a href="/contact" className="inline-block bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
              Get a Name That Markets Itself
            </a>
          </div>
        </div>

        {/* Section 13: The Blue Ocean Strategy for Naming */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">13. The Blue Ocean Strategy: Create Uncontested Markets</h2>

          <div className="bg-dark-card p-8 rounded-lg border border-gray-700 mb-8">
            <h3 className="text-2xl font-semibold text-white mb-6">From "Blue Ocean Strategy" by W. Chan Kim & Renée Mauborgne</h3>
            <p className="text-gray-300 mb-6">
              Instead of competing in crowded naming spaces (red oceans), create new naming categories where competition is irrelevant. This strategy has launched some of the most successful brands in history.
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
            <h4 className="text-xl font-semibold text-white mb-4">Your Blue Ocean Naming Framework</h4>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h5 className="text-white font-semibold mb-3">What to Eliminate:</h5>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• Industry naming conventions</li>
                  <li>• Generic descriptive terms</li>
                  <li>• Overused buzzwords</li>
                </ul>
              </div>
              <div>
                <h5 className="text-white font-semibold mb-3">What to Create:</h5>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• New naming categories</li>
                  <li>• Unique brand personalities</li>
                  <li>• Innovative word combinations</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Final Takeaway */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">🔑 Final Takeaway</h2>
          <div className="bg-spotify-green/10 border border-spotify-green/30 p-6 rounded-lg">
            <p className="text-white font-semibold mb-4">The best business names are:</p>
            <ul className="text-gray-300 space-y-2">
              <li>• Short & memorable</li>
              <li>• Distinctive & meaningful</li>
              <li>• Adaptable for growth</li>
              <li>• Legally clean & available</li>
              <li>• Consistent across web + socials</li>
            </ul>
            <p className="text-gray-300 mt-4">
              Choosing the right name upfront saves you from legal headaches, credibility issues, and expensive rebrands.
            </p>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center bg-gradient-to-r from-red-900/20 to-orange-900/20 border border-red-500/30 p-8 rounded-lg">
          <h2 className="text-3xl font-bold text-white mb-6">🚨 Don't Let a Bad Name Kill Your Startup</h2>
          <p className="text-xl text-gray-300 mb-6">
            <strong>Founder Reality Check:</strong> 73% of startups fail because of poor branding decisions. Your name is the foundation of everything - get it wrong and you're building on quicksand.
          </p>
          <div className="bg-dark-card p-6 rounded-lg border border-gray-700 mb-6">
            <h3 className="text-xl font-semibold text-white mb-4">What a Bad Name Costs You:</h3>
            <div className="grid md:grid-cols-3 gap-4 text-gray-300">
              <div>
                <p className="text-red-400 font-semibold">💸 Lost Sales</p>
                <p className="text-sm">Customers can't find you</p>
              </div>
              <div>
                <p className="text-red-400 font-semibold">🚫 Investor Rejection</p>
                <p className="text-sm">Unprofessional perception</p>
              </div>
              <div>
                <p className="text-red-400 font-semibold">⚖️ Legal Issues</p>
                <p className="text-sm">Trademark conflicts</p>
              </div>
            </div>
          </div>
          <p className="text-lg text-gray-300 mb-6">
            <strong>LaunchKit helps founders create professional brands that investors respect and customers remember.</strong> Don't let a bad name destroy your dreams.
          </p>
          <div className="space-y-4">
            <Link href="/contact" className="inline-block bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-lg font-bold text-xl transition-colors">
              🎯 Get a Professional Name That Converts
            </Link>
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
