import Link from "next/link";
import Image from "next/image";

export default function DomThomasProfile() {
  return (
    <main className="min-h-screen bg-dark-bg">
      {/* Profile Header */}
      <div className="relative">
        {/* Cover Photo */}
        <div className="h-32 profile-cover relative">
          <div className="absolute inset-0 bg-black/20"></div>
        </div>

        {/* Profile Picture and Basic Info */}
        <div className="relative px-6 pb-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row items-start md:items-end gap-6 -mt-16">
              {/* Profile Picture */}
              <div className="relative">
                <div className="w-32 h-32 rounded-full profile-avatar bg-dark-card flex items-center justify-center overflow-hidden">
                  <Image
                    src="/dom-thomas.jpg"
                    alt="Dominique Thomas"
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-spotify-green rounded-full border-2 border-white flex items-center justify-center">
                  <span className="text-white text-sm">✓</span>
                </div>
              </div>

              {/* Profile Info */}
              <div className="flex-1 text-white">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-bold">Dominique Thomas</h1>
                    <p className="text-gray-300 text-lg">Co-Founder & CTO at LaunchKit</p>
                    <p className="text-gray-400">📍 San Juan, PR</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="max-w-4xl mx-auto px-6 pb-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - About & Experience */}
          <div className="lg:col-span-2 space-y-6">
            {/* About Section */}
            <div className="bg-dark-card p-6 rounded-lg border border-gray-700 profile-card">
              <h2 className="text-xl font-semibold text-white mb-4">About</h2>
              <p className="text-gray-300 leading-relaxed">
                Full-stack engineer with 4+ years of experience building scalable products and decentralized applications.
                Expert in Web3 technologies, blockchain development, and modern web frameworks.
              </p>
              <p className="text-gray-300 leading-relaxed mt-4">
                Passionate about leveraging cutting-edge technology to solve real-world problems and help startups
                build robust, scalable solutions from day one. Now focused on making advanced tech accessible to all founders.
              </p>
            </div>

            {/* Current Role */}
            <div className="bg-dark-card p-6 rounded-lg border border-gray-700 profile-card">
              <h2 className="text-xl font-semibold text-white mb-4">Current Role</h2>
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-spotify-green rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-lg">LK</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold">Co-Founder & CTO</h3>
                  <p className="text-spotify-green font-medium">LaunchKit</p>
                  <p className="text-gray-400 text-sm">July 2025 - Present</p>
                  <p className="text-gray-300 text-sm mt-2">
                    Leading technical architecture and development of LaunchKit's platform.
                    Building scalable infrastructure to support rapid MVP development for founders.
                  </p>
                </div>
              </div>
            </div>

            {/* Technical Vision */}
            <div className="bg-dark-card p-6 rounded-lg border border-gray-700 profile-card">
              <h2 className="text-xl font-semibold text-white mb-4">Technical Vision</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                I believe technology should be an enabler, not a barrier. Too many founders get stuck on technical
                implementation when they should be focused on solving real problems and building great products.
              </p>
              <p className="text-gray-300 leading-relaxed">
                LaunchKit's technical architecture is designed to abstract away complexity while maintaining the
                flexibility and scalability founders need to grow. We're building the infrastructure that lets
                founders focus on what matters most - their vision and their users.
              </p>
            </div>

            {/* Key Achievements */}
            <div className="bg-dark-card p-6 rounded-lg border border-gray-700 profile-card">
              <h2 className="text-xl font-semibold text-white mb-4">Key Achievements</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-spotify-green rounded-full"></div>
                    <span className="text-gray-300 text-sm">Led Web3 integration for major platforms</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-spotify-green rounded-full"></div>
                    <span className="text-gray-300 text-sm">Web 3 Expert</span>
                  </div>
                </div>
                <div className="space-y-3">
                   <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-spotify-green rounded-full"></div>
                    <span className="text-gray-300 text-sm">Expert in scalable architecture design</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-spotify-green rounded-full"></div>
                    <span className="text-gray-300 text-sm">Expert in blockchain development</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column - Stats & Links */}
          <div className="space-y-6">
            {/* Stats */}
            <div className="bg-dark-card p-6 rounded-lg border border-gray-700 profile-card">
              <h2 className="text-xl font-semibold text-white mb-4">By the Numbers</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center stats-item">
                  <span className="text-gray-300">Years Coding</span>
                  <span className="text-white font-semibold">8+</span>
                </div>
                <div className="flex justify-between items-center stats-item">
                  <span className="text-gray-300">Projects Shipped</span>
                  <span className="text-white font-semibold">50+</span>
                </div>
              </div>
            </div>

            {/* Philosophy */}
            <div className="bg-dark-card p-6 rounded-lg border border-gray-700 profile-card">
              <h2 className="text-xl font-semibold text-white mb-4">Philosophy</h2>
              <div className="space-y-3">
                <p className="text-gray-300 text-sm italic">
                  "Code should be clean, scalable, and maintainable. But most importantly, it should solve real problems."
                </p>
                <p className="text-gray-300 text-sm italic">
                  "The best technology is invisible - it just works, letting users focus on what they do best."
                </p>
                <p className="text-gray-300 text-sm italic">
                  "Open source isn't just about code - it's about building a better future together."
                </p>
              </div>
            </div>

            {/* Skills */}
            <div className="bg-dark-card p-6 rounded-lg border border-gray-700 profile-card">
              <h2 className="text-xl font-semibold text-white mb-4">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {[
                  "React", "Node.js", "TypeScript", "Solidity", "Web3", "Blockchain",
                  "AWS", "Docker", "Kubernetes", "PostgreSQL", "MongoDB", "GraphQL",
                  "Smart Contracts", "DeFi", "NFTs", "Ethereum", "IPFS", "Rust"
                ].map((skill) => (
                  <span
                    key={skill}
                    className="skill-tag text-gray-300 px-3 py-1 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Links */}
            <div className="bg-dark-card p-6 rounded-lg border border-gray-700 profile-card">
              <h2 className="text-xl font-semibold text-white mb-4">Links</h2>
              <div className="space-y-3">
                <a
                  href="https://x.com/russ_sie"
                  className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors"
                >
                  <div className="w-8 h-8 bg-gray-800 rounded flex items-center justify-center">
                    <span className="text-white text-sm">𝕏</span>
                  </div>
                  <span>Follow on X</span>
                </a>
                <a
                  href="https://github.com/Farsyyde"
                  className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors"
                >
                  <div className="w-8 h-8 bg-gray-800 rounded flex items-center justify-center">
                    <span className="text-white text-sm">GH</span>
                  </div>
                  <span>GitHub</span>
                </a>
                <a
                  href="#"
                  className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors"
                >
                  <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                    <span className="text-white text-sm">in</span>
                  </div>
                  <span>LinkedIn Profile</span>
                </a>
              </div>
            </div>

            {/* Back to Founders */}
            <div className="bg-dark-card p-6 rounded-lg border border-gray-700 profile-card">
              <Link
                href="/founders"
                className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors"
              >
                <div className="w-8 h-8 bg-gray-700 rounded flex items-center justify-center">
                  <span className="text-white text-sm">←</span>
                </div>
                <span>Back to Founders</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
