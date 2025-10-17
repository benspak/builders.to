import Link from "next/link";
import Image from "next/image";

export default function BenSpakProfile() {
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
                    src="/ben.jpg"
                    alt="Ben Spak"
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
                    <h1 className="text-3xl font-bold">Ben Spak</h1>
                    <p className="text-gray-300 text-lg">Co-Founder & CEO at LaunchKit</p>
                    <p className="text-gray-400">📍 Denver, CO</p>
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
                Serial entrepreneur and startup advisor with 5+ years of experience building and scaling tech companies.
                Full stack engineer with 10+ years experience who's passionate about helping founders launch faster and smarter.
              </p>
              <p className="text-gray-300 leading-relaxed mt-4">
                Previously founded three SaaS companies and worked as a product manager at major tech companies.
                Now focused on democratizing startup success through LaunchKit's comprehensive platform.
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
                  <h3 className="text-white font-semibold">Founder & CEO</h3>
                  <p className="text-spotify-green font-medium">LaunchKit</p>
                  <p className="text-gray-400 text-sm">July 2025 - Present</p>
                  <p className="text-gray-300 text-sm mt-2">
                    Building the all-in-one platform for founders to launch their MVPs in 21 days.
                    Helping entrepreneurs go from idea to investor-ready product faster than ever.
                  </p>
                </div>
              </div>
            </div>

            {/* Mission & Vision */}
            <div className="bg-dark-card p-6 rounded-lg border border-gray-700 profile-card">
              <h2 className="text-xl font-semibold text-white mb-4">Mission & Vision</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                I believe every founder deserves the right start. Too many great ideas die in the planning phase
                because founders get overwhelmed by technical complexity, legal requirements, and operational challenges.
              </p>
              <p className="text-gray-300 leading-relaxed">
                LaunchKit exists to change that. We're building the first platform that gives founders everything
                they need to go from idea to investor-ready MVP in just 21 days - with the guidance, resources,
                and support they need to succeed.
              </p>
            </div>

            {/* Key Achievements */}
            <div className="bg-dark-card p-6 rounded-lg border border-gray-700 profile-card">
              <h2 className="text-xl font-semibold text-white mb-4">Key Achievements</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-spotify-green rounded-full"></div>
                    <span className="text-gray-300 text-sm">Expert in rapid MVP development</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-spotify-green rounded-full"></div>
                    <span className="text-gray-300 text-sm">Founded 3 successful SaaS companies</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-spotify-green rounded-full"></div>
                    <span className="text-gray-300 text-sm">Advised 10+ startup founders</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-spotify-green rounded-full"></div>
                    <span className="text-gray-300 text-sm">Built scalable technical infrastructure</span>
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
                  <span className="text-gray-300">Companies Founded</span>
                  <span className="text-white font-semibold">3</span>
                </div>
                <div className="flex justify-between items-center stats-item">
                  <span className="text-gray-300">Startups Advised</span>
                  <span className="text-white font-semibold">10+</span>
                </div>
                <div className="flex justify-between items-center stats-item">
                  <span className="text-gray-300">Years Experience</span>
                  <span className="text-white font-semibold">10+</span>
                </div>
              </div>
            </div>

            {/* Philosophy */}
            <div className="bg-dark-card p-6 rounded-lg border border-gray-700 profile-card">
              <h2 className="text-xl font-semibold text-white mb-4">Philosophy</h2>
              <div className="space-y-3">
                <p className="text-gray-300 text-sm italic">
                  "Speed beats perfection. Launch fast, learn faster, iterate constantly."
                </p>
                <p className="text-gray-300 text-sm italic">
                  "The best founders are those who can execute on their vision while staying adaptable to market feedback."
                </p>
                <p className="text-gray-300 text-sm italic">
                  "Every great company started as someone's crazy idea. The difference is execution."
                </p>
              </div>
            </div>

            {/* Skills */}
            <div className="bg-dark-card p-6 rounded-lg border border-gray-700 profile-card">
              <h2 className="text-xl font-semibold text-white mb-4">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {[
                  "Product Strategy", "Startup Growth", "Team Building", "Fundraising",
                  "Product Management", "Technical Leadership", "M&A", "Go-to-Market",
                  "Venture Capital", "SaaS", "AI/ML", "Mobile Apps"
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
                  href="https://linkedin.com/in/benspak"
                  className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors"
                >
                  <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                    <span className="text-white text-sm">in</span>
                  </div>
                  <span>LinkedIn Profile</span>
                </a>
                <a
                  href="https://x.com/benvspak"
                  className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors"
                >
                  <div className="w-8 h-8 bg-gray-800 rounded flex items-center justify-center">
                    <span className="text-white text-sm">𝕏</span>
                  </div>
                  <span>Follow on X</span>
                </a>
                <a
                  href="https://github.com/benspak"
                  className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors"
                >
                  <div className="w-8 h-8 bg-gray-800 rounded flex items-center justify-center">
                    <span className="text-white text-sm">GH</span>
                  </div>
                  <span>GitHub</span>
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
