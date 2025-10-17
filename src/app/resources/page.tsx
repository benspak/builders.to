'use client';

import { useState } from 'react';
import { useProgressTracker } from '@/hooks/useProgressTracker';
import TaskItem from '@/components/TaskItem';
import AchievementNotification from '@/components/AchievementNotification';

export default function ResourcesPage() {
  const {
    progressData,
    toggleTask,
    getStageData,
    isTaskCompleted,
    getStageXP,
    getStageCompletion
  } = useProgressTracker();

  const [showAchievement, setShowAchievement] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState('');

  const handleTaskToggle = (taskId: string) => {
    const wasCompleted = isTaskCompleted(taskId);
    toggleTask(taskId);

    // Check for new achievements
    if (!wasCompleted) {
      // Check if this task completion unlocked a new stage
      const stages = ['cadet', 'pathfinder', 'builder', 'operator', 'strategist', 'trailblazer'];
      stages.forEach(stageKey => {
        const stage = getStageData(stageKey as keyof typeof getStageData);
        if (stage.completed && !progressData.achievements.includes(`${stageKey}-badge`)) {
          setCurrentAchievement(`${stageKey}-badge`);
          setShowAchievement(true);
        }
      });
    }
  };

  return (
    <main className="bg-dark-bg py-20 px-6">
      <div className="max-w-6xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">
          Launch Resources
        </h1>
        <p className="text-xl text-gray-300 mb-12">
          Master the fundamentals that separate successful entrepreneurs from dreamers. Proven strategies, real-world examples, and actionable frameworks from the world's leading business minds. Each guide combines expert insights from entrepreneurship books with real-world case studies and famous business strategies to help you build your empire.
        </p>

        {/* Progressive Launch Journey */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold gradient-text mb-4">Your Launch Journey</h2>
            <p className="text-gray-300 text-lg max-w-3xl mx-auto">
              Follow this proven sequence to build your business from idea to launch. Each step builds upon the previous one, ensuring you have a solid foundation before moving forward.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Step 1: Entrepreneurship Fundamentals */}
            <div className="bg-dark-card p-8 rounded-lg border border-gray-700">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-spotify-green rounded-full flex items-center justify-center mr-3">
                  <span className="text-black text-sm font-bold">1</span>
                </div>
                <div className="w-12 h-12 bg-spotify-green rounded-full flex items-center justify-center">
                  <span className="text-black text-xl">📚</span>
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-white">Entrepreneurship Fundamentals</h3>
              <p className="text-gray-300 mb-6">
                Master the foundational principles that build empires. Blue Ocean Strategy, Lean Startup, 10X Rule, and more.
              </p>
              <a href="/resources/getting-started" className="btn-primary block w-full text-center">
                Start Here
              </a>
            </div>

            {/* Step 2: Business Idea Validation */}
            <div className="bg-dark-card p-8 rounded-lg border border-gray-700">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-spotify-green rounded-full flex items-center justify-center mr-3">
                  <span className="text-black text-sm font-bold">2</span>
                </div>
                <div className="w-12 h-12 bg-spotify-green rounded-full flex items-center justify-center">
                  <span className="text-black text-xl">🎯</span>
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-white">Business Idea Validation</h3>
              <p className="text-gray-300 mb-6">
                Learn the proven validation frameworks used by billion-dollar companies like Airbnb, Dropbox, and Zappos.
              </p>
              <a href="/resources/validate-ideas" className="btn-primary block w-full text-center">
                Validate Your Idea
              </a>
            </div>

            {/* Step 3: Mission & Vision Statements */}
            <div className="bg-dark-card p-8 rounded-lg border border-gray-700">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-spotify-green rounded-full flex items-center justify-center mr-3">
                  <span className="text-black text-sm font-bold">3</span>
                </div>
                <div className="w-12 h-12 bg-spotify-green rounded-full flex items-center justify-center">
                  <span className="text-black text-xl">⭐</span>
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-white">Mission & Vision Statements</h3>
              <p className="text-gray-300 mb-6">
                Discover your business's "why" and create a guiding star that drives decisions, attracts talent, and builds customer loyalty.
              </p>
              <a href="/resources/mission-vision" className="btn-primary block w-full text-center">
                Define Your Purpose
              </a>
            </div>

            {/* Step 4: Business Naming */}
            <div className="bg-dark-card p-8 rounded-lg border border-gray-700">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-spotify-green rounded-full flex items-center justify-center mr-3">
                  <span className="text-black text-sm font-bold">4</span>
                </div>
                <div className="w-12 h-12 bg-spotify-green rounded-full flex items-center justify-center">
                  <span className="text-black text-xl">🏷️</span>
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-white">Business Naming</h3>
              <p className="text-gray-300 mb-6">
                Learn the proven strategies used by companies like Apple, Nike, Tesla, and Amazon to create names that become cultural phenomena.
              </p>
              <a href="/resources/business-naming" className="btn-primary block w-full text-center">
                Name Your Business
              </a>
            </div>

            {/* Step 5: Domain Naming */}
            <div className="bg-dark-card p-8 rounded-lg border border-gray-700">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-spotify-green rounded-full flex items-center justify-center mr-3">
                  <span className="text-black text-sm font-bold">5</span>
                </div>
                <div className="w-12 h-12 bg-spotify-green rounded-full flex items-center justify-center">
                  <span className="text-black text-xl">🌐</span>
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-white">Domain Naming</h3>
              <p className="text-gray-300 mb-6">
                Learn the proven strategies used by companies like Apple, Nike, and Tesla to create iconic digital identities.
              </p>
              <a href="/resources/domain-naming" className="btn-primary block w-full text-center">
                Secure Your Domain
              </a>
            </div>

            {/* Step 6: Business Model Roadmap */}
            <div className="bg-dark-card p-8 rounded-lg border border-gray-700">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-spotify-green rounded-full flex items-center justify-center mr-3">
                  <span className="text-black text-sm font-bold">6</span>
                </div>
                <div className="w-12 h-12 bg-spotify-green rounded-full flex items-center justify-center">
                  <span className="text-black text-xl">🗺️</span>
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-white">Business Model Roadmap</h3>
              <p className="text-gray-300 mb-6">
                Stop building without a clear path to profit. Learn the proven business model frameworks used by Amazon, Tesla, and Apple to build billion-dollar empires.
              </p>
              <a href="/resources/business-model-roadmap" className="btn-primary block w-full text-center">
                Plan Your Model
              </a>
            </div>

            {/* Step 7: Customer Acquisition Playbook */}
            <div className="bg-dark-card p-8 rounded-lg border border-gray-700">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-spotify-green rounded-full flex items-center justify-center mr-3">
                  <span className="text-black text-sm font-bold">7</span>
                </div>
                <div className="w-12 h-12 bg-spotify-green rounded-full flex items-center justify-center">
                  <span className="text-black text-xl">📈</span>
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-white">Customer Acquisition Playbook</h3>
              <p className="text-gray-300 mb-6">
                Master the proven customer acquisition strategies that built billion-dollar companies. Includes the anonymous founder conversation that reveals the truth about finding customers.
              </p>
              <a href="/resources/customer-acquisition" className="btn-primary block w-full text-center">
                Find Your Customers
              </a>
            </div>

            {/* Step 8: Early Customer Acquisition Playbook */}
            <div className="bg-dark-card p-8 rounded-lg border border-gray-700">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-spotify-green rounded-full flex items-center justify-center mr-3">
                  <span className="text-black text-sm font-bold">8</span>
                </div>
                <div className="w-12 h-12 bg-spotify-green rounded-full flex items-center justify-center">
                  <span className="text-black text-xl">🎯</span>
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-white">Early Customer Acquisition Playbook</h3>
              <p className="text-gray-300 mb-6">
                Master the proven sales scripts, outreach strategies, and relationship-building techniques used by billion-dollar companies to acquire their earliest customers.
              </p>
              <a href="/resources/early-customer-acquisition" className="btn-primary block w-full text-center">
                Master Sales Scripts
              </a>
            </div>

            {/* Step 9: Build While Employed */}
            <div className="bg-dark-card p-8 rounded-lg border border-gray-700">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-spotify-green rounded-full flex items-center justify-center mr-3">
                  <span className="text-black text-sm font-bold">9</span>
                </div>
                <div className="w-12 h-12 bg-spotify-green rounded-full flex items-center justify-center">
                  <span className="text-black text-xl">💼</span>
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-white">Build While Employed</h3>
              <p className="text-gray-300 mb-6">
                Learn proven strategies from founders like Sara Blakely (Spanx), Brian Chesky (Airbnb), and Steve Jobs (Apple) to build empires while maintaining financial security.
              </p>
              <a href="/resources/build-while-employed" className="btn-primary block w-full text-center">
                Manage Risk
              </a>
            </div>

            {/* Step 10: Cofounder Selection */}
            <div className="bg-dark-card p-8 rounded-lg border border-gray-700">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-spotify-green rounded-full flex items-center justify-center mr-3">
                  <span className="text-black text-sm font-bold">10</span>
                </div>
                <div className="w-12 h-12 bg-spotify-green rounded-full flex items-center justify-center">
                  <span className="text-black text-xl">🤝</span>
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-white">Cofounder Selection</h3>
              <p className="text-gray-300 mb-6">
                Learn the proven frameworks used by successful founders like Jobs & Wozniak, Gates & Allen, and Page & Brin to build legendary partnerships.
              </p>
              <a href="/resources/pick-cofounder" className="btn-primary block w-full text-center">
                Build Your Team
              </a>
            </div>

            {/* Step 11: AI Landing Pages */}
            <div className="bg-dark-card p-8 rounded-lg border border-gray-700">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-spotify-green rounded-full flex items-center justify-center mr-3">
                  <span className="text-black text-sm font-bold">11</span>
                </div>
                <div className="w-12 h-12 bg-spotify-green rounded-full flex items-center justify-center">
                  <span className="text-black text-xl">🤖</span>
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-white">How to Use AI to Make Landing Pages</h3>
              <p className="text-gray-300 mb-6">
                Stop wasting months and thousands on developers. Learn how AI can create high-converting landing pages in hours, not weeks. Master the tools and strategies used by billion-dollar companies.
              </p>
              <a href="/resources/ai-landing-pages" className="btn-primary block w-full text-center">
                Build With AI
              </a>
            </div>

            {/* Step 12: MVP Project Scope Management */}
            <div className="bg-dark-card p-8 rounded-lg border border-gray-700">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-spotify-green rounded-full flex items-center justify-center mr-3">
                  <span className="text-black text-sm font-bold">12</span>
                </div>
                <div className="w-12 h-12 bg-spotify-green rounded-full flex items-center justify-center">
                  <span className="text-black text-xl">🎯</span>
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-white">How to Manage MVP Project Scope</h3>
              <p className="text-gray-300 mb-6">
                Stop letting feature creep kill your MVP timeline. Learn the proven scope management strategies used by Apple, Tesla, and Amazon to ship on time and on budget.
              </p>
              <a href="/resources/mvp-project-scope" className="btn-primary block w-full text-center">
                Master Scope Management
              </a>
            </div>

            {/* Step 13: Free Up Time */}
            <div className="bg-dark-card p-8 rounded-lg border border-gray-700">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-spotify-green rounded-full flex items-center justify-center mr-3">
                  <span className="text-black text-sm font-bold">13</span>
                </div>
                <div className="w-12 h-12 bg-spotify-green rounded-full flex items-center justify-center">
                  <span className="text-black text-xl">⏰</span>
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-white">How to Free Up 3 Hours a Day</h3>
              <p className="text-gray-300 mb-6">
                Master the time management strategies used by Elon Musk, Warren Buffett, and Jeff Bezos to create massive wealth while maintaining work-life balance.
              </p>
              <a href="/resources/free-up-time" className="btn-primary block w-full text-center">
                Reclaim Your Time
              </a>
            </div>

            {/* Step 14: HR, Compliance & Administrative Documentation */}
            <div className="bg-dark-card p-8 rounded-lg border border-gray-700">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-spotify-green rounded-full flex items-center justify-center mr-3">
                  <span className="text-black text-sm font-bold">14</span>
                </div>
                <div className="w-12 h-12 bg-spotify-green rounded-full flex items-center justify-center">
                  <span className="text-black text-xl">🛡️</span>
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-white">HR, Compliance & Administrative Documentation</h3>
              <p className="text-gray-300 mb-6">
                Stop losing sleep over legal nightmares and compliance disasters. Learn the essential frameworks that protect your startup from lawsuits, regulatory violations, and operational chaos.
              </p>
              <a href="/resources/hr-compliance-admin" className="btn-primary block w-full text-center">
                Protect Your Business
              </a>
            </div>
          </div>
        </div>


        {/* Discord Community Section */}
        <section className="mt-16">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-dark-card p-8 md:p-12 rounded-lg border border-gray-700">
              <div className="w-16 h-16 bg-indigo-600 rounded-full mx-auto mb-6 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
              </div>
              <h2 className="text-3xl md:text-4xl font-semibold mb-4 text-white">Join Our Discord Community</h2>
              <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Connect with fellow founders, get real-time support, and access exclusive resources in our growing startup community.
              </p>
              <a
                href="https://discord.gg/hH6YsyqypU"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-4 rounded-lg text-lg transition-colors"
              >
                <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
                Join Discord Server
              </a>
            </div>
          </div>
        </section>

        {/* Startup Journey Progression Map */}
        <section className="mt-20">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-semibold mb-6 text-white">
                🚀 Startup Journey Progression Map
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Your path from idea to Series A funding - track your progress with XP, unlock achievements, and level up your founder skills.
              </p>
            </div>

            <div className="space-y-8">
              {/* Stage 1: Cadet Founder */}
              {(() => {
                const cadetStage = getStageData('cadet');
                const cadetXP = getStageXP('cadet');
                const cadetCompletion = getStageCompletion('cadet');
                return (
                  <div className="bg-dark-card p-8 rounded-lg border border-gray-700 hover:border-spotify-green transition-colors">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-2xl font-semibold text-white">Stage 1: Cadet Founder (Novice)</h3>
                      <div className="bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
                        {cadetXP} / 100 XP
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-300 text-sm">Progress</span>
                        <span className="text-spotify-green font-medium text-sm">
                          {cadetCompletion.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-spotify-green to-emerald-400 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${cadetCompletion}%` }}
                        />
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-spotify-green font-medium mb-4">Starter Gear: Laptop, Big Idea, First Draft Vision</p>
                      <div className="space-y-3">
                        <TaskItem
                          taskId="build-base"
                          taskName="Build Your Base (website/landing page)"
                          xp={30}
                          completed={isTaskCompleted('build-base')}
                          onToggle={handleTaskToggle}
                          emoji="🏠"
                        />
                        <TaskItem
                          taskId="shape-offer"
                          taskName="Shape Your Offer (clear value prop)"
                          xp={20}
                          completed={isTaskCompleted('shape-offer')}
                          onToggle={handleTaskToggle}
                          emoji="🛠️"
                        />
                        <TaskItem
                          taskId="create-resource"
                          taskName="Create a Starter Resource (free lead magnet)"
                          xp={20}
                          completed={isTaskCompleted('create-resource')}
                          onToggle={handleTaskToggle}
                          emoji="📦"
                        />
                        <TaskItem
                          taskId="share-story"
                          taskName="Share Your Founder Story (LinkedIn/X intro post)"
                          xp={30}
                          completed={isTaskCompleted('share-story')}
                          onToggle={handleTaskToggle}
                          emoji="📢"
                        />
                      </div>
                    </div>
                    <div className={`p-4 rounded-lg transition-all duration-300 ${
                      cadetStage.completed
                        ? 'bg-gradient-to-r from-yellow-900/40 to-orange-900/40 border border-yellow-600/50'
                        : 'bg-gradient-to-r from-yellow-900/20 to-orange-900/20'
                    }`}>
                      <p className={`font-medium ${cadetStage.completed ? 'text-yellow-300' : 'text-yellow-400'}`}>
                        🌟 Achievement: {cadetStage.completed ? 'Cadet Badge Unlocked!' : 'Complete all tasks to unlock Cadet Badge'}
                      </p>
                    </div>
                  </div>
                );
              })()}

              {/* Stage 2: Pathfinder */}
              {(() => {
                const pathfinderStage = getStageData('pathfinder');
                const pathfinderXP = getStageXP('pathfinder');
                const pathfinderCompletion = getStageCompletion('pathfinder');
                return (
                  <div className="bg-dark-card p-8 rounded-lg border border-gray-700 hover:border-spotify-green transition-colors">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-2xl font-semibold text-white">Stage 2: Pathfinder (Market Explorer)</h3>
                      <div className="bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
                        {pathfinderXP} / 300 XP
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-300 text-sm">Progress</span>
                        <span className="text-spotify-green font-medium text-sm">
                          {pathfinderCompletion.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-spotify-green to-emerald-400 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${pathfinderCompletion}%` }}
                        />
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-spotify-green font-medium mb-4">Gear Unlock: Discovery Toolkit (customer research framework)</p>
                      <div className="space-y-3">
                        <TaskItem
                          taskId="talk-customers"
                          taskName="Talk to 10 Potential Customers (interviews)"
                          xp={100}
                          completed={isTaskCompleted('talk-customers')}
                          onToggle={handleTaskToggle}
                          emoji="🔍"
                        />
                        <TaskItem
                          taskId="grow-connections"
                          taskName="Grow First 100 Connections (followers)"
                          xp={50}
                          completed={isTaskCompleted('grow-connections')}
                          onToggle={handleTaskToggle}
                          emoji="📡"
                        />
                        <TaskItem
                          taskId="join-communities"
                          taskName="Join 2 Communities (online groups)"
                          xp={50}
                          completed={isTaskCompleted('join-communities')}
                          onToggle={handleTaskToggle}
                          emoji="🤝"
                        />
                        <TaskItem
                          taskId="first-sale"
                          taskName="Earn Your First Sale (or pre-order)"
                          xp={100}
                          completed={isTaskCompleted('first-sale')}
                          onToggle={handleTaskToggle}
                          emoji="🪙"
                        />
                      </div>
                    </div>
                    <div className={`p-4 rounded-lg transition-all duration-300 ${
                      pathfinderStage.completed
                        ? 'bg-gradient-to-r from-yellow-900/40 to-orange-900/40 border border-yellow-600/50'
                        : 'bg-gradient-to-r from-yellow-900/20 to-orange-900/20'
                    }`}>
                      <p className={`font-medium ${pathfinderStage.completed ? 'text-yellow-300' : 'text-yellow-400'}`}>
                        🌟 Achievement: {pathfinderStage.completed ? 'Proof of Market Badge Unlocked!' : 'Complete all tasks to unlock Proof of Market Badge'}
                      </p>
                    </div>
                  </div>
                );
              })()}

              {/* Stage 3: Builder */}
              {(() => {
                const builderStage = getStageData('builder');
                const builderXP = getStageXP('builder');
                const builderCompletion = getStageCompletion('builder');
                return (
                  <div className="bg-dark-card p-8 rounded-lg border border-gray-700 hover:border-spotify-green transition-colors">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-2xl font-semibold text-white">Stage 3: Builder (Prototype Creator)</h3>
                      <div className="bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
                        {builderXP} / 600 XP
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-300 text-sm">Progress</span>
                        <span className="text-spotify-green font-medium text-sm">
                          {builderCompletion.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-spotify-green to-emerald-400 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${builderCompletion}%` }}
                        />
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-spotify-green font-medium mb-4">Gear Unlock: Prototype Lab (MVP tools: Notion, Figma, etc.)</p>
                      <div className="space-y-3">
                        <TaskItem
                          taskId="build-prototype"
                          taskName="Build a Prototype (demo or clickable mockup)"
                          xp={150}
                          completed={isTaskCompleted('build-prototype')}
                          onToggle={handleTaskToggle}
                          emoji="🧩"
                        />
                        <TaskItem
                          taskId="launch-waitlist"
                          taskName="Launch a Waitlist (100 signups)"
                          xp={100}
                          completed={isTaskCompleted('launch-waitlist')}
                          onToggle={handleTaskToggle}
                          emoji="📡"
                        />
                        <TaskItem
                          taskId="write-objections"
                          taskName="Write Out Objections (and your answers)"
                          xp={50}
                          completed={isTaskCompleted('write-objections')}
                          onToggle={handleTaskToggle}
                          emoji="🎯"
                        />
                        <TaskItem
                          taskId="test-users"
                          taskName="Test With First 5 Users"
                          xp={100}
                          completed={isTaskCompleted('test-users')}
                          onToggle={handleTaskToggle}
                          emoji="🛠️"
                        />
                      </div>
                    </div>
                    <div className={`p-4 rounded-lg transition-all duration-300 ${
                      builderStage.completed
                        ? 'bg-gradient-to-r from-yellow-900/40 to-orange-900/40 border border-yellow-600/50'
                        : 'bg-gradient-to-r from-yellow-900/20 to-orange-900/20'
                    }`}>
                      <p className={`font-medium ${builderStage.completed ? 'text-yellow-300' : 'text-yellow-400'}`}>
                        🌟 Achievement: {builderStage.completed ? 'First Traction Badge Unlocked!' : 'Complete all tasks to unlock First Traction Badge'}
                      </p>
                    </div>
                  </div>
                );
              })()}

              {/* Stage 4: Operator */}
              {(() => {
                const operatorStage = getStageData('operator');
                const operatorXP = getStageXP('operator');
                const operatorCompletion = getStageCompletion('operator');
                return (
                  <div className="bg-dark-card p-8 rounded-lg border border-gray-700 hover:border-spotify-green transition-colors">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-2xl font-semibold text-white">Stage 4: Operator (Early Revenue)</h3>
                      <div className="bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
                        {operatorXP} / 1,000 XP
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-300 text-sm">Progress</span>
                        <span className="text-spotify-green font-medium text-sm">
                          {operatorCompletion.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-spotify-green to-emerald-400 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${operatorCompletion}%` }}
                        />
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-spotify-green font-medium mb-4">Gear Unlock: Business Console (analytics, CRM, user management)</p>
                      <div className="space-y-3">
                        <TaskItem
                          taskId="reach-1k-mrr"
                          taskName="Reach $1K MRR"
                          xp={200}
                          completed={isTaskCompleted('reach-1k-mrr')}
                          onToggle={handleTaskToggle}
                          emoji="💰"
                        />
                        <TaskItem
                          taskId="press-mention"
                          taskName="Land Your First Press Mention"
                          xp={100}
                          completed={isTaskCompleted('press-mention')}
                          onToggle={handleTaskToggle}
                          emoji="📰"
                        />
                        <TaskItem
                          taskId="improve-mvp"
                          taskName="Improve Your MVP (iteration round)"
                          xp={100}
                          completed={isTaskCompleted('improve-mvp')}
                          onToggle={handleTaskToggle}
                          emoji="🧠"
                        />
                        <TaskItem
                          taskId="track-progress"
                          taskName="Track Progress (metrics dashboard)"
                          xp={100}
                          completed={isTaskCompleted('track-progress')}
                          onToggle={handleTaskToggle}
                          emoji="📈"
                        />
                      </div>
                    </div>
                    <div className={`p-4 rounded-lg transition-all duration-300 ${
                      operatorStage.completed
                        ? 'bg-gradient-to-r from-yellow-900/40 to-orange-900/40 border border-yellow-600/50'
                        : 'bg-gradient-to-r from-yellow-900/20 to-orange-900/20'
                    }`}>
                      <p className={`font-medium ${operatorStage.completed ? 'text-yellow-300' : 'text-yellow-400'}`}>
                        🌟 Achievement: {operatorStage.completed ? 'Revenue Badge Unlocked!' : 'Complete all tasks to unlock Revenue Badge'}
                      </p>
                    </div>
                  </div>
                );
              })()}

              {/* Stage 5: Strategist */}
              {(() => {
                const strategistStage = getStageData('strategist');
                const strategistXP = getStageXP('strategist');
                const strategistCompletion = getStageCompletion('strategist');
                return (
                  <div className="bg-dark-card p-8 rounded-lg border border-gray-700 hover:border-spotify-green transition-colors">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-2xl font-semibold text-white">Stage 5: Strategist (Investor-Ready)</h3>
                      <div className="bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
                        {strategistXP} / 2,000 XP
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-300 text-sm">Progress</span>
                        <span className="text-spotify-green font-medium text-sm">
                          {strategistCompletion.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-spotify-green to-emerald-400 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${strategistCompletion}%` }}
                        />
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-spotify-green font-medium mb-4">Gear Unlock: Pitch Deck Toolkit (story + slides)</p>
                      <div className="space-y-3">
                        <TaskItem
                          taskId="pitch-investors"
                          taskName="Pitch 5 Investors"
                          xp={200}
                          completed={isTaskCompleted('pitch-investors')}
                          onToggle={handleTaskToggle}
                          emoji="🏦"
                        />
                        <TaskItem
                          taskId="setup-foundation"
                          taskName="Set Up the Foundation (legal, compliance, payments)"
                          xp={100}
                          completed={isTaskCompleted('setup-foundation')}
                          onToggle={handleTaskToggle}
                          emoji="📜"
                        />
                        <TaskItem
                          taskId="share-message"
                          taskName="Share Your Message (event, podcast, or panel)"
                          xp={100}
                          completed={isTaskCompleted('share-message')}
                          onToggle={handleTaskToggle}
                          emoji="🎤"
                        />
                        <TaskItem
                          taskId="key-partner"
                          taskName="Bring on a Key Partner (co-founder, advisor, or contractor)"
                          xp={200}
                          completed={isTaskCompleted('key-partner')}
                          onToggle={handleTaskToggle}
                          emoji="🤝"
                        />
                      </div>
                    </div>
                    <div className={`p-4 rounded-lg transition-all duration-300 ${
                      strategistStage.completed
                        ? 'bg-gradient-to-r from-yellow-900/40 to-orange-900/40 border border-yellow-600/50'
                        : 'bg-gradient-to-r from-yellow-900/20 to-orange-900/20'
                    }`}>
                      <p className={`font-medium ${strategistStage.completed ? 'text-yellow-300' : 'text-yellow-400'}`}>
                        🌟 Achievement: {strategistStage.completed ? 'Investor-Ready Badge Unlocked!' : 'Complete all tasks to unlock Investor-Ready Badge'}
                      </p>
                    </div>
                  </div>
                );
              })()}

              {/* Stage 6: Trailblazer */}
              {(() => {
                const trailblazerStage = getStageData('trailblazer');
                const trailblazerXP = getStageXP('trailblazer');
                const trailblazerCompletion = getStageCompletion('trailblazer');
                return (
                  <div className="bg-dark-card p-8 rounded-lg border border-gray-700 hover:border-spotify-green transition-colors">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-2xl font-semibold text-white">Stage 6: Trailblazer (Scaling Founder)</h3>
                      <div className="bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
                        {trailblazerXP} / 5,000 XP
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-300 text-sm">Progress</span>
                        <span className="text-spotify-green font-medium text-sm">
                          {trailblazerCompletion.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-spotify-green to-emerald-400 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${trailblazerCompletion}%` }}
                        />
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-spotify-green font-medium mb-4">Gear Unlock: Growth Kit (scaling playbook + team ops)</p>
                      <div className="space-y-3">
                        <TaskItem
                          taskId="expand-channels"
                          taskName="Expand Channels (ads, partnerships, distribution)"
                          xp={300}
                          completed={isTaskCompleted('expand-channels')}
                          onToggle={handleTaskToggle}
                          emoji="🚀"
                        />
                        <TaskItem
                          taskId="automate-process"
                          taskName="Automate a Process (AI or tools)"
                          xp={200}
                          completed={isTaskCompleted('automate-process')}
                          onToggle={handleTaskToggle}
                          emoji="⚡"
                        />
                        <TaskItem
                          taskId="reach-10k-mrr"
                          taskName="Reach $10K MRR"
                          xp={500}
                          completed={isTaskCompleted('reach-10k-mrr')}
                          onToggle={handleTaskToggle}
                          emoji="🏹"
                        />
                        <TaskItem
                          taskId="grow-team"
                          taskName="Grow the Team (hire 3–5 people)"
                          xp={300}
                          completed={isTaskCompleted('grow-team')}
                          onToggle={handleTaskToggle}
                          emoji="🧭"
                        />
                      </div>
                    </div>
                    <div className={`p-4 rounded-lg transition-all duration-300 ${
                      trailblazerStage.completed
                        ? 'bg-gradient-to-r from-yellow-900/40 to-orange-900/40 border border-yellow-600/50'
                        : 'bg-gradient-to-r from-yellow-900/20 to-orange-900/20'
                    }`}>
                      <p className={`font-medium ${trailblazerStage.completed ? 'text-yellow-300' : 'text-yellow-400'}`}>
                        🌟 Achievement: {trailblazerStage.completed ? 'Scale-Up Badge Unlocked!' : 'Complete all tasks to unlock Scale-Up Badge'}
                      </p>
                    </div>
                  </div>
                );
              })()}

              {/* Final Challenge */}
              <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 p-8 rounded-lg border border-purple-600">
                <div className="text-center">
                  <h3 className="text-3xl font-semibold text-white mb-4">Final Challenge: The Black Hole of Uncertainty 🕳️</h3>
                  <p className="text-gray-300 mb-6">Requirements: Investor-Ready + Scale-Up Badges</p>
                  <div className="grid md:grid-cols-3 gap-6 mb-6">
                    <div className="text-center">
                      <div className="text-2xl mb-2">🌪️</div>
                      <p className="text-gray-300">Product-market fit turbulence</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl mb-2">🎯</div>
                      <p className="text-gray-300">Competitors closing in</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl mb-2">⚖️</div>
                      <p className="text-gray-300">Investor negotiations</p>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-yellow-900/30 to-orange-900/30 p-4 rounded-lg">
                    <p className="text-yellow-400 font-medium text-lg">Victory Reward: Series A Funding + 🌟 Founder Legend Rank 🏆</p>
                  </div>
                </div>
              </div>

              {/* Progression System */}
              <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 p-8 rounded-lg border border-blue-600">
                <h3 className="text-2xl font-semibold text-white text-center mb-6">🎖️ Progression System</h3>
                <div className="grid md:grid-cols-3 gap-6 text-center">
                  <div>
                    <h4 className="text-xl font-semibold text-white mb-2">XP = Traction Milestones</h4>
                    <p className="text-gray-300">Each XP point represents real progress toward your startup goals</p>
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-white mb-2">Level Ups = Credibility + Funding</h4>
                    <p className="text-gray-300">Unlock new opportunities and investor attention as you progress</p>
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-white mb-2">Badges = Proof Points</h4>
                    <p className="text-gray-300">Tangible achievements that demonstrate your founder journey</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>

      {/* Achievement Notification */}
      <AchievementNotification
        show={showAchievement}
        achievement={currentAchievement}
        onClose={() => setShowAchievement(false)}
      />
    </main>
  );
}
