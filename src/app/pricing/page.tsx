"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function PricingPage() {
  const [_selectedPackage, _setSelectedPackage] = useState<string | null>(null);

  const teamMembers = [
    {
      name: "Ben Spak",
      role: "Co-Founder & CEO",
      image: "/ben.jpg",
      description: "Former founder who built 3 SaaS companies. Expert in rapid MVP development and startup strategy.",
      skills: ["MVP Development", "Fundraising"]
    },
    {
      name: "Dominique Thomas",
      role: "Co-Founder & CTO",
      image: "/dom-thomas.jpg",
      description: "Full-stack engineer with 4+ years building scalable products. Expert with Web3 and decentralized applications.",
      skills: ["Full-Stack", "Web3"]
    }
  ];

  const pricingPlans = [
    {
      id: "liftoff",
      name: "Web App",
      subtitle: "For MVP-Stage Founders",
      price: "$10k",
      useCases: [
        "Full-stack web application",
        "DeFi protocol MVP",
        "Marketplace platform",
        "AI-powered SaaS tool"
      ],
      goal: "Build your first usable product & secure your first customers.",
      features: [
        "21 Day MVP Build - a web 2 or web 3 app",
        "Weekly Check-ins (progress, pivots, accountability)",
      ],
      outcome: "Investor-ready, revenue-ready MVP live in 21 days.",
      popular: true,
      disclaimer: "Prices may be higher for larger projects with complex requirements."
    },
  ];

  return (
    <main className="bg-dark-bg py-12 md:py-20 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 gradient-text">
            Choose Your Launch Speed
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto px-2">
            Stop wasting time with endless planning. Pick your plan and get building. Every day you wait is a day your competitor gets ahead.
          </p>
        </div>

        {/* Team Members Section */}
        <div className="mb-12 md:mb-16">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Meet Your Launch Team
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              The founders and experts who'll help you go from idea to investor-ready MVP in record time.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto">
            {teamMembers.map((member, index) => (
              <div
                key={index}
                className="bg-dark-card p-6 md:p-8 rounded-lg border border-gray-700 text-center hover:border-spotify-green transition-colors group"
              >
                <div className="w-20 h-20 bg-spotify-green rounded-full mx-auto mb-4 flex items-center justify-center overflow-hidden">
                  <Image
                    src={member.image}
                    alt={`${member.name} - ${member.role}`}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white">{member.name}</h3>
                <p className="text-spotify-green font-medium mb-3">{member.role}</p>
                <p className="text-gray-300 text-sm mb-4">
                  {member.description}
                </p>
                <div className="flex justify-center space-x-2 mb-4">
                  {member.skills.map((skill, skillIndex) => (
                    <span
                      key={skillIndex}
                      className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Plans Grid */}
        <div className="flex justify-center mb-12 md:mb-16">
          <div className="w-full max-w-2xl">
          {pricingPlans.map((pkg) => (
            <div
              key={pkg.id}
              className={`relative bg-dark-card p-6 md:p-8 rounded-lg border transition-all duration-300 hover:scale-105 ${
                pkg.popular
                  ? 'border-spotify-green shadow-lg shadow-spotify-green/20'
                  : 'border-gray-700 hover:border-gray-600'
              }`}
            >
              {pkg.popular && (
                <div className="absolute -top-3 md:-top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-spotify-green text-black px-3 md:px-4 py-1 md:py-2 rounded-full text-xs md:text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-6 md:mb-8">
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">{pkg.name}</h3>
                <p className="text-gray-400 mb-3 md:mb-4 text-sm md:text-base">{pkg.subtitle}</p>
                <div className="text-3xl md:text-4xl font-bold text-spotify-green mb-2">{pkg.price}</div>
                {pkg.disclaimer && (
                  <p className="text-xs md:text-sm text-gray-500 italic">{pkg.disclaimer}</p>
                )}
                {pkg.id === "mission-control" && (
                  <p className="text-xs md:text-sm text-gray-500">depending on scope</p>
                )}
              </div>

              <div className="mb-4 md:mb-6">
                <h4 className="text-base md:text-lg font-semibold text-white mb-2 md:mb-3">Goal:</h4>
                <p className="text-gray-300 mb-3 md:mb-4 text-sm md:text-base">{pkg.goal}</p>
              </div>

              <div className="mb-4 md:mb-6">
                <h4 className="text-base md:text-lg font-semibold text-white mb-2 md:mb-3">Example Use Cases:</h4>
                <ul className="space-y-1 md:space-y-2 mb-3 md:mb-4">
                  {pkg.useCases.map((useCase, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-spotify-green mr-2 md:mr-3 mt-1 flex-shrink-0">•</span>
                      <span className="text-gray-300 text-sm md:text-base">{useCase}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mb-4 md:mb-6">
                <h4 className="text-base md:text-lg font-semibold text-white mb-2 md:mb-3">What's Included:</h4>
                <ul className="space-y-1 md:space-y-2">
                  {pkg.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-spotify-green mr-2 md:mr-3 mt-1 flex-shrink-0">✅</span>
                      <span className="text-gray-300 text-sm md:text-base">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mb-6 md:mb-8">
                <h4 className="text-base md:text-lg font-semibold text-white mb-2 md:mb-3">Outcome:</h4>
                <p className="text-gray-300 text-sm md:text-base">{pkg.outcome}</p>
              </div>

              <Link
                href="/contact"
                className={`w-full btn-primary text-center block text-base md:text-lg ${
                  pkg.popular ? 'bg-spotify-green hover:bg-spotify-green/90' : ''
                }`}
              >
                Launch Your MVP in 21 Days
              </Link>
            </div>
          ))}
          </div>
        </div>


        {/* CTA Section */}
        <div className="text-center bg-dark-surface p-8 md:p-12 rounded-lg border border-gray-700">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Still Thinking About It?
          </h2>
          <p className="text-lg md:text-xl text-gray-300 mb-6 md:mb-8 px-2">
            Every week you wait is another week your competitor gets ahead. Let's talk about your startup and get you building.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/contact" className="btn-primary text-lg">
              Schedule Your Free Strategy Call
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
