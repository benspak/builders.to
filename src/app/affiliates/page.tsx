"use client";

import Link from "next/link";

export default function AffiliatesPage() {

  const commissionStructure = [
    {
      plan: "Code Fix",
      price: "$10,000",
      commission: "$2,000",
      percentage: "20%",
      description: "For existing codebases - bug fixes, performance optimization, and code refactoring"
    },
    {
      plan: "Web App",
      price: "$10,000",
      commission: "$2,000",
      percentage: "20%",
      description: "For MVP-stage founders - full-stack web applications ready for launch"
    }
  ];

  const _marketingMaterials = [
    {
      title: "Landing Page Templates",
      description: "High-converting landing page designs optimized for our services",
      type: "Design Assets"
    },
    {
      title: "Email Templates",
      description: "Pre-written email sequences for different stages of the funnel",
      type: "Copy"
    },
    {
      title: "Social Media Graphics",
      description: "Ready-to-post graphics for LinkedIn, Twitter, and other platforms",
      type: "Visual Content"
    },
    {
      title: "Case Studies",
      description: "Detailed success stories and client testimonials",
      type: "Social Proof"
    },
    {
      title: "Video Testimonials",
      description: "Short video clips from satisfied clients",
      type: "Video Content"
    },
    {
      title: "Pitch Decks",
      description: "PowerPoint presentations explaining our services",
      type: "Presentations"
    }
  ];

  const faqs = [
    {
      question: "How do I get paid?",
      answer: "We pay commissions monthly via PayPal or bank transfer. Minimum payout is $50."
    },
    {
      question: "How long do I have to earn commission?",
      answer: "You earn commission on the first sale from each referred customer for 12 months from their initial purchase."
    },
    {
      question: "Can I track my referrals?",
      answer: "Yes! You'll get a unique tracking link and access to a dashboard showing clicks, conversions, and earnings."
    },
    {
      question: "Are there any restrictions?",
      answer: "We don't allow bidding on our brand keywords in paid search, and all marketing must be truthful and professional."
    },
    {
      question: "What if my referral needs a refund?",
      answer: "If a customer requests a refund within 30 days, we'll deduct the commission from your next payout."
    },
    {
      question: "How do I get started?",
      answer: "Contact us through our contact page. We'll review your application and send you your affiliate materials within 24 hours."
    }
  ];

  return (
    <main className="bg-dark-bg py-12 md:py-20 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12 md:mb-16">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 gradient-text">
            Earn 20% Commission on Every Sale
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto px-2 mb-8">
            Join our affiliate program and earn up to $2,000 per referral. Help startups launch faster while building your own revenue stream.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/contact" className="btn-primary text-lg">
              Get Started - Contact Us
            </Link>
          </div>
        </div>

        {/* Commission Structure */}
        <section className="mb-16 md:mb-20">
          <h2 className="text-3xl md:text-4xl font-semibold text-center mb-8 md:mb-12 text-white">
            Commission Structure
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {commissionStructure.map((item, index) => (
              <div
                key={index}
                className="bg-dark-card p-6 md:p-8 rounded-lg border border-gray-700 hover:border-spotify-green transition-colors"
              >
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-white mb-2">{item.plan}</h3>
                  <p className="text-gray-400 mb-4">{item.description}</p>
                  <div className="text-3xl font-bold text-spotify-green mb-2">{item.price}</div>
                  <div className="text-lg text-gray-300">
                    <span className="text-spotify-green font-bold">{item.commission}</span> commission
                    <span className="text-gray-400"> ({item.percentage})</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Why Join Our Program */}
        <section className="mb-16 md:mb-20">
          <h2 className="text-3xl md:text-4xl font-semibold text-center mb-8 md:mb-12 text-white">
            Why Join Our Affiliate Program?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            <div className="bg-dark-card p-6 rounded-lg border border-gray-700">
              <div className="w-12 h-12 bg-spotify-green rounded-lg mb-4 flex items-center justify-center">
                <span className="text-white font-bold text-xl">💰</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">High Commissions</h3>
              <p className="text-gray-300 text-sm">
                Earn 20% on every sale - that's up to $2,000 per Web App referral and $2,000 per Code Fix.
              </p>
            </div>

            <div className="bg-dark-card p-6 rounded-lg border border-gray-700">
              <div className="w-12 h-12 bg-spotify-green rounded-lg mb-4 flex items-center justify-center">
                <span className="text-white font-bold text-xl">📈</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Proven Track Record</h3>
              <p className="text-gray-300 text-sm">
                Our services have helped 100+ startups launch successfully. High conversion rates mean more earnings for you.
              </p>
            </div>

            <div className="bg-dark-card p-6 rounded-lg border border-gray-700">
              <div className="w-12 h-12 bg-spotify-green rounded-lg mb-4 flex items-center justify-center">
                <span className="text-white font-bold text-xl">🎯</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Target Audience</h3>
              <p className="text-gray-300 text-sm">
                Perfect for content creators, consultants, and agencies serving entrepreneurs and startup founders.
              </p>
            </div>
          </div>
        </section>


        {/* FAQ Section */}
        <section className="mb-16 md:mb-20">
          <h2 className="text-3xl md:text-4xl font-semibold text-center mb-8 md:mb-12 text-white">
            Frequently Asked Questions
          </h2>
          <div className="max-w-4xl mx-auto space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-dark-card p-6 rounded-lg border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-3">{faq.question}</h3>
                <p className="text-gray-300">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="text-center bg-dark-surface p-8 md:p-12 rounded-lg border border-gray-700">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Ready to Start Earning?
          </h2>
          <p className="text-lg md:text-xl text-gray-300 mb-6 md:mb-8 px-2">
            Join hundreds of successful affiliates who are already earning with LaunchKit. Apply today and start earning commissions within 24 hours.
          </p>
          <Link href="/contact" className="btn-primary text-lg">
            Get Started - Contact Us
          </Link>
        </section>
      </div>
    </main>
  );
}
